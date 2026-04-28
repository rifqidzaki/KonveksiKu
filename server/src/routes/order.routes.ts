import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, calculatePrice } from '../controllers/order.controller';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public price calculator
router.post('/calculate-price', calculatePrice);

// Authenticated routes
router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorizeRole(['VENDOR', 'ADMIN']), updateOrderStatus);

export default router;
