import { Pool } from 'pg';
import { Table, TableSchema, TableColumn, Options, TableData, Project, PROJECT_COLUMN_MAP } from '../db/types.js';
import { Database } from '../db/interface.js';

export class PostgresDatabase implements Database {
  private static db : PostgresDatabase | null = null;
  private pool: Pool | null = null;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getDatabase(): PostgresDatabase {
    if (PostgresDatabase.db === null) {
      PostgresDatabase.db = new PostgresDatabase();
    } return PostgresDatabase.db;
  }

  // Get all schemas
  public async getAllSchemas(): Promise<string[]> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }

    try {
      const query = {
        text: `SELECT schema_name FROM information_schema.schemata 
               WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1')
               ORDER BY schema_name`,
        values: []
      };

      const result = await this.pool.query(query);
      return result.rows.map(row => row.schema_name);
    } catch (error) {
      throw error;
    }
  }

  // Get all tables in schema
  public async getAllTables(schema: string): Promise<Table[]> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }

    try {
      const query = {
        text: "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE' ORDER BY table_name",
        values: [schema]
      };

      const result = await this.pool.query(query);
      const tables: Table[] = result.rows.map((row: { table_name: string }) => ({
        name: row.table_name,
        schema
      }));

      return tables;
    } catch (error) {
      throw error;
    }
  };

  // Get table schema
  public async getTableSchema(schema: string, tableName: string): Promise<TableSchema> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      const query = {
        text: `SELECT c.column_name, c.data_type,
            c.character_maximum_length, c.is_nullable,
            c.column_default, c.ordinal_position,
            (tc.constraint_type = 'PRIMARY KEY') AS is_primary_key
            FROM information_schema.columns c
            LEFT JOIN information_schema.key_column_usage kcu
              ON c.table_schema = kcu.table_schema
             AND c.table_name = kcu.table_name
             AND c.column_name = kcu.column_name
            LEFT JOIN information_schema.table_constraints tc
              ON kcu.constraint_name = tc.constraint_name
             AND kcu.table_schema = tc.table_schema
            WHERE c.table_name = $1
              AND c.table_schema = $2
            ORDER BY c.ordinal_position`,
        values: [tableName, schema]
      };

      const result = await this.pool.query(query);

      if (result.rows.length === 0) {
        throw new Error(`Table '${tableName}' not found in schema '${schema}'`);
      }

      return {
        tableName,
        schema,
        columns: result.rows.map((row: TableColumn) => ({
          column_name: row.column_name,
          data_type: row.data_type,
          character_maximum_length: row.character_maximum_length,
          is_nullable: row.is_nullable,
          column_default: row.column_default,
          ordinal_position: row.ordinal_position,
          is_primary_key: Boolean((row as any).is_primary_key)
        }))
      };
    } catch (error) {
      throw error;
    }
  };

  // Get table metadata
  public async getTableMetadata(schema: string, tableName: string): Promise<number> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      const query = `SELECT COUNT(*) as count FROM "${schema}"."${tableName}"`;
      const countResult = await this.pool.query(query);

      return parseInt(countResult.rows[0].count);
    } catch (error) {
      throw error;
    }
  };

  // Get data with pagination, filtering, sorting
  public async getTableData(schema: string, tableName: string, options: Options): Promise<TableData> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      let page: number = options.page == undefined ? 1 : options.page;
      let limit: number = options.limit == undefined ? 50 : options.limit;
      let sortOrder: 'asc' | 'desc' = options.sortOrder == undefined ? 'asc' : options.sortOrder;
      
      const offset = (page - 1) * limit;
      
      // Build query with schema and table name (cannot be parameterized)
      let queryText = `SELECT * FROM "${schema}"."${tableName}"`;
      const params: any[] = [];
      let paramIndex = 1;

      // Add WHERE 
      if (options.filters && options.filters.length > 0) {
        const filterConditions = [];
         
        for (const filter of options.filters) {
          filterConditions.push(`"${filter.key}" = $${paramIndex}`);
          params.push(filter.value);
          paramIndex++;
        }
        
        if (filterConditions.length > 0) {
          queryText += ` WHERE ${filterConditions.join(' AND ')}`;
        }
      }
      
      // Add ORDER BY 
      if (options.sortBy) {
        queryText += ` ORDER BY "${options.sortBy}" ${sortOrder}`;
      }
      
      // Add pagination
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await this.pool.query(queryText, params);
      
      // Get total count
      const totalCount: number = await this.getTableMetadata(schema, tableName);

      return {
        data: result.rows,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    } catch (error) {
      throw error;
    }
  };
  
  // Create new row
  public async createRow(schema: string, tableName: string, data: Record<string, any> | Record<string, any>[]): Promise<boolean> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {         
      const rows = Array.isArray(data) ? data : [data];
      if (rows.length === 0) {
        throw new Error("Data must be a non-empty object or array");
      }

      const columns = Object.keys(rows[0]);
      if (columns.length === 0) {
        throw new Error("Data must contain at least one column");
      }

      const values: any[] = [];
      let paramIndex = 1;
      const rowPlaceholders = rows.map(row => {
        const placeholders = columns.map(col => {
          values.push(row[col]);
          return `$${paramIndex++}`;
        });
        return `(${placeholders.join(', ')})`;
      });

      const query = {
        text: `INSERT INTO "${schema}"."${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
               VALUES ${rowPlaceholders.join(', ')}
               RETURNING *`,
        values
      };
        
      const result = await this.pool.query(query);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Update row
  public async updateRow(schema: string, tableName: string, id: any, data: Record<string, any>): Promise<any> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      // Get primary key
      const pkQuery = `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = to_regclass($1) AND i.indisprimary;
      `;
      const pkResult = await this.pool.query(pkQuery, [`${schema}.${tableName}`]);
      const primaryKey = pkResult.rows[0]?.attname || 'id';
      
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ');
      
      const query = `
        UPDATE "${schema}"."${tableName}"
        SET ${setClause}
        WHERE "${primaryKey}" = $${columns.length + 1}
        RETURNING *
      `;
      
      const result = await this.pool.query(query, [...values, id]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Delete row
  public async deleteRow(schema: string, tableName: string, id: any): Promise<boolean> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {      
      // Get primary key
      const pkQuery = `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `;
      const pkResult = await this.pool.query(pkQuery, [`${schema}.${tableName}`]);
      const primaryKey = pkResult.rows[0]?.attname || 'id';
      
      const query = `DELETE FROM "${schema}"."${tableName}" WHERE "${primaryKey}" = $1 RETURNING *`;
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  public async addProject(project: Project): Promise<boolean> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }

    const keys = Object.keys(project) as (keyof Project)[];
    const columns = keys.map(k => PROJECT_COLUMN_MAP[k]);
    const values = keys.map(k => project[k]);
    const rowPlaceholders = keys.map((_, i) => `$${i + 1}`);

    const query = {
        text: `INSERT INTO "ai_profiles"."user_projects" (${columns.map(c => `"${c}"`).join(', ')})
               VALUES (${rowPlaceholders.join(', ')})
               RETURNING *`,
        values
      };

    const result = await this.pool.query(query);
    if (result.rows.length === 0) {
        return false;
    }

    return Promise.resolve(true);
  }

  public async getFullNames(): Promise<string[]> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      const query = `SELECT DISTINCT "fullName" FROM "ai_profiles"."developers" ORDER BY "fullName"`;
      const result = await this.pool.query(query);
      return result.rows.map(r => r.fullName);
    } catch (error) {
      throw error;
    }
  }

  public async getProjectNames(): Promise<string[]> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      const query = `SELECT DISTINCT "project_name" FROM "ai_profiles"."projects" ORDER BY "project_name"`;
      const result = await this.pool.query(query);
      return result.rows.map(r => r.project_name);
    } catch (error) {
      throw error;
    }
  }

  public async getProjectsByPerson(fullName: string): Promise<{ id: string; name: string }[]> {
    if (this.pool === null) {
      throw new Error("Database connection not initialized");
    }
    try {
      const query = {
        text: `SELECT "id", "name" FROM "ai_profiles"."user_projects" WHERE "profile_id" = $1 AND "never_regenerate" = false ORDER BY "from"`,
        values: [fullName],
      };
      const result = await this.pool.query(query);
      return result.rows.map(r => ({ id: r.id, name: r.name }));
    } catch (error) {
      throw error;
    }
  }

}