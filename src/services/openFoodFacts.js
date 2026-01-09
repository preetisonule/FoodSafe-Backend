import axios from 'axios';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Fetch product information from Open Food Facts API
 */
export async function fetchProductByBarcode(barcode) {
    try {
        const response = await axios.get(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);

        if (response.data.status === 0) {
            return null; // Product not found
        }

        const product = response.data.product;

        return {
            name: product.product_name || product.product_name_en || 'Unknown Product',
            brand: product.brands || product.brand || '',
            ingredients: extractIngredients(product),
            nutrition: extractNutrition(product)
        };
    } catch (error) {
        console.error('Error fetching from Open Food Facts:', error.message);
        throw new Error('Failed to fetch product information');
    }
}

/**
 * Extract ingredients from Open Food Facts product data
 */
function extractIngredients(product) {
    if (product.ingredients_text) {
        // Split by common separators and clean up
        return product.ingredients_text
            .split(/[,;]/)
            .map(ing => ing.trim())
            .filter(ing => ing.length > 0);
    }

    if (product.ingredients && Array.isArray(product.ingredients)) {
        return product.ingredients.map(ing => ing.text || ing.id || '').filter(Boolean);
    }

    return [];
}

/**
 * Extract nutrition information from Open Food Facts product data
 */
function extractNutrition(product) {
    const nutrition = {};

    // Extract sugar (try multiple formats)
    if (product.nutriments) {
        nutrition.sugars = product.nutriments.sugars_100g ||
            product.nutriments.sugars_value ||
            product.nutriments.sugars || null;

        // Extract sodium (convert salt to sodium if needed)
        // Open Food Facts stores sodium in g, we need mg
        if (product.nutriments.sodium_100g !== undefined && product.nutriments.sodium_100g !== null) {
            nutrition.sodium = product.nutriments.sodium_100g * 1000; // Convert g to mg
        } else if (product.nutriments.salt_100g !== undefined && product.nutriments.salt_100g !== null) {
            nutrition.sodium = product.nutriments.salt_100g * 1000 * 0.4; // Approximate conversion (salt to sodium)
        } else if (product.nutriments.sodium_value !== undefined && product.nutriments.sodium_value !== null) {
            nutrition.sodium = product.nutriments.sodium_value * 1000;
        } else if (product.nutriments.sodium !== undefined && product.nutriments.sodium !== null) {
            // If already in mg, use as is; if in g, convert
            const sodiumValue = parseFloat(product.nutriments.sodium);
            nutrition.sodium = sodiumValue < 10 ? sodiumValue * 1000 : sodiumValue;
        }

        // Extract saturated fat
        nutrition['saturated-fat'] = product.nutriments['saturated-fat_100g'] ||
            product.nutriments['saturated-fat'] ||
            product.nutriments['saturated_fat_100g'] ||
            product.nutriments['saturated_fat'] || null;

        // Extract trans fat
        nutrition['trans-fat'] = product.nutriments['trans-fat_100g'] ||
            product.nutriments['trans-fat'] ||
            product.nutriments['trans_fat_100g'] ||
            product.nutriments['trans_fat'] || null;

        // Store full nutriments for reference
        nutrition.nutriments = product.nutriments;
    }

    return nutrition;
}

