import express from 'express';
import { analyzeImage, upload } from '../controllers/ocrController.js';

const router = express.Router();

router.post('/analyze', upload.single('image'), analyzeImage);

export default router;

