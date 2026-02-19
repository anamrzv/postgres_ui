import express from 'express';
import { PostgresDatabase } from '../controllers/postgres.js';
import { Table } from '../db/types.js';

const router = express.Router();

// Get all schemas
router.get('/schemas', async (req, res, next) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const schemas = await db.getAllSchemas();
		res.json({ success: true, data: schemas });
	} catch (error) {
		next(error);
	}
});

// Get all tables
router.get('/:schema', async (req, res, next) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const schema = req.params.schema;
		const tables: Table[] = await db.getAllTables(schema);
		res.json({ success: true, data: tables });
	} catch (error) {
		next(error);
	}
});

// // Get table schema (columns, types, constraints)
router.get('/:schema/:tableName', async (req, res, next) => {
	try {
		const db = PostgresDatabase.getDatabase();
        const { schema, tableName } = req.params;
		const tables = await db.getTableSchema(schema, tableName);
		res.json({ success: true, data: tables });
	} catch (error) {
		next(error);
	}
});

export default router;
