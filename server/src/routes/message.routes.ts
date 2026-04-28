import { Router } from 'express';
import { getMessages, getConversations } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/:orderId', getMessages);

export default router;
