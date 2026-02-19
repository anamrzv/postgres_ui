import express from 'express';
import tablesRouter from './tables.js';
import dataRouter from './data.js';
import formsRouter from './forms.js';

const router = express.Router();

// Mount route modules
router.use('/tables', tablesRouter);
router.use('/data', dataRouter);
router.use('/forms', formsRouter);

export default router;
