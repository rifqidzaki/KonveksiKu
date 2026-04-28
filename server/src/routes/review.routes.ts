import { Router } from 'express';
import { createReview, getVendorReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/vendor/:vendorId', getVendorReviews);
router.post('/', authenticate, createReview);

export default router;
