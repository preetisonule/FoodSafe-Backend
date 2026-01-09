import express from 'express';
import { analyzeBarcode } from '../controllers/barcodeController.js';

const router = express.Router();

router.post('/analyze', analyzeBarcode);

export default router;

