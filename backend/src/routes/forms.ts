import express from 'express';
import { PostgresDatabase } from '../controllers/postgres.js';

const router = express.Router();

// Get full names for dropdown
router.get('/full_names', async (req: any, res: any, next: any) => {
    try {
        const db = PostgresDatabase.getDatabase();
        const result = await db.getFullNames();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get project names for dropdown
router.get('/project_names', async (req: any, res: any, next: any) => {
    try {
        const db = PostgresDatabase.getDatabase();
        const result = await db.getProjectNames();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create new row
router.post('/new_project', async (req: any, res: any, next: any) => {
    try {
        const db = PostgresDatabase.getDatabase();
        const data = req.body;
        const result = await db.addProject(data);
        if (!result) {
            return res.status(500).json({ success: false, message: 'Failed to create project' });
        }
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
