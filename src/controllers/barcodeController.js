import { fetchProductByBarcode } from '../services/openFoodFacts.js';
import { calculateSafetyScore } from '../services/safetyAnalysis.js';
import Product from '../models/Product.js';

/**
 * Analyze product by barcode
 */
export async function analyzeBarcode(req, res) {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ 
        error: 'Barcode is required' 
      });
    }

    // Check if product already exists in database
    let product = await Product.findOne({ barcode });

    if (product) {
      return res.json({
        success: true,
        product: {
          name: product.name,
          brand: product.brand,
          ingredients: product.ingredients,
          nutrition: product.nutrition,
          safetyScore: product.safetyScore,
          riskLevel: product.riskLevel,
          explanation: product.explanation,
          healthWarnings: product.healthWarnings || [],
          healthConcerns: product.healthConcerns || '',
          source: product.source
        }
      });
    }

    // Fetch from Open Food Facts
    const productData = await fetchProductByBarcode(barcode);

    if (!productData) {
      return res.status(404).json({ 
        error: 'Product not found. Please check the barcode or try uploading an image.' 
      });
    }

    // Calculate safety score
    const safetyAnalysis = calculateSafetyScore(
      productData.ingredients,
      productData.nutrition
    );

    // Save to database
    product = new Product({
      barcode,
      name: productData.name,
      brand: productData.brand,
      ingredients: productData.ingredients,
      nutrition: productData.nutrition,
      safetyScore: safetyAnalysis.safetyScore,
      riskLevel: safetyAnalysis.riskLevel,
      explanation: safetyAnalysis.explanation,
      healthWarnings: safetyAnalysis.healthWarnings,
      healthConcerns: safetyAnalysis.healthConcerns,
      source: 'barcode'
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
        source: product.source
      }
    });
  } catch (error) {
    console.error('Barcode analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze product. Please try again.' 
    });
  }
}

