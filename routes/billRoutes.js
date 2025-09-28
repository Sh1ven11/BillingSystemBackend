import express from 'express';
import { billsController } from '../controllers/billsController.js';
import sessionAuth from '../middleware/sessionAuth.js';

const router = express.Router();

// Protect all routes
router.use(sessionAuth);

router.get('/unpaid-bills-grouped', billsController.getUnpaidBillsGroupedByCompany);
router.get('/all', billsController.getAllBills);

export default router;
