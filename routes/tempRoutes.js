import express from 'express';
import { templateController } from '../controllers/tempController.js';
import sessionAuth from '../middleware/sessionAuth.js';

const router = express.Router();
router.use(sessionAuth);

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/post', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
