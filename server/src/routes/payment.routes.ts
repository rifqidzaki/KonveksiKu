import { Router } from 'express';
import { createPayment, confirmPayment, getPaymentStatus } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/create', createPayment);
router.post('/confirm', confirmPayment);
router.get('/status/:orderId', getPaymentStatus);

export default router;
