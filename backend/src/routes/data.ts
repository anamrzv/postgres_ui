import express from 'express';
import { PostgresDatabase } from '../controllers/postgres.js';
import { validateTableName, validateRowData } from '../middleware/validators.js';

const router = express.Router();

// Get data from table with pagination, filtering, sorting
router.get('/:schema/:tableName', validateTableName, async (req: any, res: any, next: any) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const { schema, tableName } = req.params;
		const result = await db.getTableData(schema, tableName, req.query as any);
		res.json({ success: true, ...result });
	} catch (error) {
		next(error);
	}
});

// Create new row
router.post('/:schema/:tableName', validateTableName, validateRowData, async (req: any, res: any, next: any) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const { schema, tableName } = req.params;
		const data = req.body;
		const result = await db.createRow(schema, tableName, data);
		if (!result) {
			return res.status(500).json({ success: false, message: 'Failed to create row' });
		}
		res.status(201).json({ success: true, data: result });
	} catch (error) {
		next(error);
	}
});

// Update row by primary key
router.put('/:schema/:tableName/:id', validateTableName, validateRowData, async (req: any, res: any, next: any) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const { schema, tableName, id } = req.params;
		const data = req.body;
		const result = await db.updateRow(schema, tableName, id, data);
		if (!result) {
            return res.status(500).json({ success: false, message: 'Failed to update row' });
        }
		res.json({ success: true });
	} catch (error) {
		next(error);
	}
});

// Delete row by primary key
router.delete('/:schema/:tableName/:id', validateTableName, async (req: any, res: any, next: any) => {
	try {
		const db = PostgresDatabase.getDatabase();
		const { schema, tableName, id } = req.params;
		const result = await db.deleteRow(schema, tableName, id);
		if (!result) {
            return res.status(500).json({ success: false, message: 'Failed to delete row' });
        }
		res.json({ success: true });
	} catch (error) {
		next(error);
	}
});

export default router;
