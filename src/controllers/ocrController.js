import multer from 'multer';
import { extractTextFromImage, parseIngredientsFromText, parseNutritionFromText } from '../services/ocrService.js';
import { calculateSafetyScore } from '../services/safetyAnalysis.js';
import Product from '../models/Product.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

/**
 * Analyze product from uploaded image
 */
export async function analyzeImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Image file is required'
            });
        }

        // Extract text from image using OCR
        const extractedText = await extractTextFromImage(req.file.buffer);

        // Parse ingredients and nutrition from text
        const ingredients = parseIngredientsFromText(extractedText);
        const nutrition = parseNutritionFromText(extractedText);

        // Calculate safety score
        const safetyAnalysis = calculateSafetyScore(ingredients, nutrition);

        // Generate a unique identifier (hash of image or timestamp-based)
        const barcode = `OCR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save to database
        const product = new Product({
            barcode,
            name: 'Product from Image',
            brand: '',
            ingredients,
            nutrition,
            safetyScore: safetyAnalysis.safetyScore,
            riskLevel: safetyAnalysis.riskLevel,
            explanation: safetyAnalysis.explanation,
            healthWarnings: safetyAnalysis.healthWarnings,
            healthConcerns: safetyAnalysis.healthConcerns,
            source: 'ocr'
        });

        await product.save();

        // Return response
        res.json({
            success: true,
            product: {
                name: product.name,
                brand: product.brand,
                ingredients: product.ingredients,
                nutrition: product.nutrition,
                safetyScore: product.safetyScore,
                riskLevel: product.riskLevel,
                explanation: product.explanation,
                healthWarnings: product.healthWarnings,
                healthConcerns: product.healthConcerns,
                source: product.source,
                extractedText: extractedText.substring(0, 500) // Include first 500 chars for debugging
            }
        });
    } catch (error) {
        console.error('OCR analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze image. Please ensure the image is clear and contains readable text.'
        });
    }
}

