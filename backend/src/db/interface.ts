import { Project, Table, TableData, TableSchema } from "./types.js";

export interface Database {
    getAllTables(schema: string): Promise<Table[]>;
    getAllSchemas(): Promise<string[]>;
    getTableSchema(schema: string, tableName: string): Promise<TableSchema>;
    getTableMetadata(schema: string, tableName: string): Promise<number>;
    getTableData(schema: string, tableName: string, params: any): Promise<TableData>;
    createRow(schema: string, tableName: string, data: any): Promise<boolean>;
    updateRow(schema: string, tableName: string, id: any, data: any): Promise<boolean>;
    deleteRow(schema: string, tableName: string, id: any): Promise<boolean>;
    addProject(project: Project): Promise<boolean>;
    getFullNames(): Promise<string[]>;
    getProjectNames(): Promise<string[]>;
}