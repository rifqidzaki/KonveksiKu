import { Router } from 'express';
import { saveDesign, getDesigns, getDesignById, updateDesign, deleteDesign } from '../controllers/design.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // All design routes require auth

router.get('/', getDesigns);
router.post('/', saveDesign);
router.get('/:id', getDesignById);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);

export default router;
