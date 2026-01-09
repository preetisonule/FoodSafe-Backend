/**
 * Safety Analysis Service
 * Analyzes food products and calculates safety scores
 */

export function calculateSafetyScore(ingredients, nutrition) {
    let score = 10;
    const explanations = [];
    const healthWarnings = [];

    // Extract nutrition values (handle different formats)
    const sugar = extractNutritionValue(nutrition, 'sugars', 'sugar', 'sugars_value');
    const sodium = extractNutritionValue(nutrition, 'sodium', 'salt');
    const saturatedFat = extractNutritionValue(nutrition, 'saturated-fat', 'saturated_fat');
    const transFat = extractNutritionValue(nutrition, 'trans-fat', 'trans_fat');

    // Check if it's a beverage (for different thresholds)
    const ingredientsText = Array.isArray(ingredients)
        ? ingredients.join(' ').toLowerCase()
        : (ingredients || '').toLowerCase();

    const isBeverage = ingredientsText.includes('water') &&
        (ingredientsText.includes('carbonated') ||
            ingredientsText.includes('soda') ||
            ingredientsText.includes('cola') ||
            ingredientsText.includes('drink') ||
            ingredientsText.includes('beverage'));

    // High sugar check - STRICTER THRESHOLDS
    // For beverages: >8g per 100ml/g is high (was 10)
    // For solid foods: >20g per 100g is high (was 25)
    const sugarThreshold = isBeverage ? 8 : 20;
    if (sugar && sugar > sugarThreshold) {
        const deduction = isBeverage ? 4 : 3; // Stricter penalties
        score -= deduction;
        explanations.push(`High sugar content (${sugar.toFixed(1)}g per 100g/ml): -${deduction} points`);
        healthWarnings.push('diabetes');
        healthWarnings.push('obesity');
        healthWarnings.push('heart disease');
    } else if (sugar && sugar > 5) {
        // Moderate sugar warning - stricter
        score -= 1.5;
        explanations.push(`Moderate sugar content (${sugar.toFixed(1)}g per 100g/ml): -1.5 points`);
        healthWarnings.push('diabetes');
    }

    // High sodium check - STRICTER (>500mg per 100g, was 600)
    if (sodium && sodium > 500) {
        const deduction = sodium > 800 ? 2.5 : 2; // Stricter for very high sodium
        score -= deduction;
        explanations.push(`High sodium content (${sodium.toFixed(0)}mg per 100g): -${deduction} points`);
        healthWarnings.push('hypertension');
        healthWarnings.push('heart disease');
        healthWarnings.push('kidney disease');
    } else if (sodium && sodium > 300) {
        score -= 1;
        explanations.push(`Moderate sodium content (${sodium.toFixed(0)}mg per 100g): -1 point`);
        healthWarnings.push('hypertension');
    }

    // Trans fat check (very harmful)
    if (transFat && transFat > 0) {
        score -= 3;
        explanations.push(`Contains trans fats (${transFat.toFixed(2)}g per 100g): -3 points`);
        healthWarnings.push('heart disease');
        healthWarnings.push('cholesterol');
        healthWarnings.push('stroke');
    }

    // High saturated fat check
    if (saturatedFat && saturatedFat > 5) {
        score -= 1.5;
        explanations.push(`High saturated fat content (${saturatedFat.toFixed(1)}g per 100g): -1.5 points`);
        healthWarnings.push('heart disease');
        healthWarnings.push('cholesterol');
    }

    // High fructose corn syrup (very unhealthy, common in sodas) - STRICTER
    if (ingredientsText.includes('high fructose corn syrup') ||
        ingredientsText.includes('hfcs') ||
        ingredientsText.includes('corn syrup')) {
        score -= 3; // Increased from 2
        explanations.push('Contains high fructose corn syrup: -3 points');
        healthWarnings.push('diabetes');
        healthWarnings.push('obesity');
        healthWarnings.push('liver disease');
        healthWarnings.push('metabolic syndrome');
    }

    // Caffeine (common in colas, should be flagged) - STRICTER
    if (ingredientsText.includes('caffeine') ||
        ingredientsText.includes('coffee extract') ||
        ingredientsText.includes('guarana')) {
        score -= 1; // Increased from 0.5
        explanations.push('Contains caffeine: -1 point');
        healthWarnings.push('anxiety');
        healthWarnings.push('insomnia');
        healthWarnings.push('pregnancy');
    }

    // Artificial sweeteners (aspartame, sucralose, etc.) - STRICTER
    if (ingredientsText.includes('aspartame') ||
        ingredientsText.includes('sucralose') ||
        ingredientsText.includes('acesulfame') ||
        ingredientsText.includes('saccharin') ||
        ingredientsText.includes('neotame')) {
        score -= 1.5; // Increased from 1
        explanations.push('Contains artificial sweeteners: -1.5 points');
        healthWarnings.push('migraines');
        healthWarnings.push('digestive issues');
    }

    // Carbonated soft drinks penalty - STRICTER
    if (ingredientsText.includes('carbonated') &&
        (ingredientsText.includes('water') || ingredientsText.includes('soda'))) {
        score -= 1.5; // Increased from 1
        explanations.push('Carbonated soft drink: -1.5 points');
        healthWarnings.push('bone health');
        healthWarnings.push('dental health');
    }

    // MSG check (E621 or monosodium glutamate) - STRICTER
    if (ingredientsText.includes('e621') ||
        ingredientsText.includes('monosodium glutamate') ||
        ingredientsText.includes('msg')) {
        score -= 2; // Increased from 1.5
        explanations.push('Contains MSG (E621): -2 points');
        healthWarnings.push('headaches');
        healthWarnings.push('migraines');
        healthWarnings.push('allergic reactions');
    }

    // Artificial colors check (E100-E199 range) - STRICTER
    const artificialColorPattern = /\be(1[0-9]{2}|[1-9][0-9])\b/i;
    if (artificialColorPattern.test(ingredientsText)) {
        score -= 1.5; // Increased from 1
        explanations.push('Contains artificial colors: -1.5 points');
        healthWarnings.push('hyperactivity');
        healthWarnings.push('allergic reactions');
        healthWarnings.push('cancer risk');
    }

    // Palm oil check - STRICTER
    if (ingredientsText.includes('palm oil') ||
        ingredientsText.includes('palmolein') ||
        (ingredientsText.includes('palm') && ingredientsText.includes('oil'))) {
        score -= 1.5; // Increased from 1
        explanations.push('Contains palm oil: -1.5 points');
        healthWarnings.push('heart disease');
        healthWarnings.push('cholesterol');
    }

    // Preservatives check (sodium benzoate, potassium sorbate, etc.)
    if (ingredientsText.includes('sodium benzoate') ||
        ingredientsText.includes('potassium sorbate') ||
        ingredientsText.includes('e211') ||
        ingredientsText.includes('e202')) {
        score -= 1;
        explanations.push('Contains preservatives: -1 point');
        healthWarnings.push('allergic reactions');
        healthWarnings.push('asthma');
    }

    // Nitrates/Nitrites (processed meats)
    if (ingredientsText.includes('nitrate') ||
        ingredientsText.includes('nitrite') ||
        ingredientsText.includes('e249') ||
        ingredientsText.includes('e250')) {
        score -= 2;
        explanations.push('Contains nitrates/nitrites: -2 points');
        healthWarnings.push('cancer risk');
        healthWarnings.push('stomach cancer');
    }

    // Hydrogenated oils
    if (ingredientsText.includes('hydrogenated') ||
        ingredientsText.includes('partially hydrogenated')) {
        score -= 2.5;
        explanations.push('Contains hydrogenated oils: -2.5 points');
        healthWarnings.push('heart disease');
        healthWarnings.push('cholesterol');
        healthWarnings.push('stroke');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, Math.round(score * 10) / 10);

    // Determine risk level - STRICTER THRESHOLDS
    // Safe: 7.5-10 (was 8-10)
    // Moderately Safe: 5-7.4 (was 5-7.9)
    // Unsafe: <5 (unchanged)
    let riskLevel;
    if (score >= 7.5) {
        riskLevel = 'Safe';
    } else if (score >= 5) {
        riskLevel = 'Moderately Safe';
    } else {
        riskLevel = 'Unsafe';
    }

    // Add positive note if score is perfect
    if (score === 10 && explanations.length === 0) {
        explanations.push('All safe - Product meets safety standards with no major concerns detected.');
    } else if (score >= 7.5 && explanations.length === 0) {
        explanations.push('Product meets safety standards with no major concerns detected.');
    }

    // Remove duplicate health warnings
    const uniqueHealthWarnings = [...new Set(healthWarnings)];

    // Generate health concerns explanation
    let healthConcerns = '';
    if (score < 10) {
        healthConcerns = generateHealthConcernsExplanation(uniqueHealthWarnings, ingredientsText, sugar, sodium, transFat);
    }

    return {
        safetyScore: score,
        riskLevel,
        explanation: explanations,
        healthWarnings: uniqueHealthWarnings,
        healthConcerns: healthConcerns
    };
}

/**
 * Generate detailed health concerns explanation
 */
function generateHealthConcernsExplanation(healthWarnings, ingredientsText, sugar, sodium, transFat) {
    const concerns = [];

    if (healthWarnings.includes('diabetes')) {
        concerns.push('⚠️ **Diabetes**: High sugar content can cause blood sugar spikes and increase diabetes risk. People with diabetes should avoid or consume in very limited quantities.');
    }

    if (healthWarnings.includes('obesity')) {
        concerns.push('⚠️ **Obesity**: High sugar and calorie content contributes to weight gain and obesity. Regular consumption can lead to metabolic disorders.');
    }

    if (healthWarnings.includes('heart disease')) {
        concerns.push('⚠️ **Heart Disease**: High sugar, sodium, trans fats, or saturated fats increase the risk of cardiovascular diseases, heart attacks, and strokes.');
    }

    if (healthWarnings.includes('hypertension')) {
        concerns.push('⚠️ **High Blood Pressure**: High sodium content can raise blood pressure. People with hypertension should avoid or limit consumption.');
    }

    if (healthWarnings.includes('kidney disease')) {
        concerns.push('⚠️ **Kidney Disease**: High sodium puts extra strain on kidneys. People with kidney problems should avoid high-sodium products.');
    }

    if (healthWarnings.includes('cancer risk')) {
        concerns.push('⚠️ **Cancer Risk**: Artificial colors, preservatives, and nitrates have been linked to increased cancer risk, especially stomach and colorectal cancer.');
    }

    if (healthWarnings.includes('cholesterol')) {
        concerns.push('⚠️ **High Cholesterol**: Trans fats and saturated fats raise bad cholesterol (LDL) levels, increasing cardiovascular disease risk.');
    }

    if (healthWarnings.includes('liver disease')) {
        concerns.push('⚠️ **Liver Disease**: High fructose corn syrup can cause fatty liver disease and liver damage when consumed regularly.');
    }

    if (healthWarnings.includes('metabolic syndrome')) {
        concerns.push('⚠️ **Metabolic Syndrome**: High fructose corn syrup contributes to insulin resistance and metabolic disorders.');
    }

    if (healthWarnings.includes('pregnancy')) {
        concerns.push('⚠️ **Pregnancy**: Caffeine should be limited during pregnancy. High intake may affect fetal development.');
    }

    if (healthWarnings.includes('anxiety')) {
        concerns.push('⚠️ **Anxiety & Mental Health**: Caffeine can worsen anxiety, cause jitters, and affect sleep patterns.');
    }

    if (healthWarnings.includes('insomnia')) {
        concerns.push('⚠️ **Sleep Disorders**: Caffeine can disrupt sleep and cause insomnia, especially if consumed later in the day.');
    }

    if (healthWarnings.includes('bone health')) {
        concerns.push('⚠️ **Bone Health**: Carbonated drinks may interfere with calcium absorption and weaken bones over time.');
    }

    if (healthWarnings.includes('dental health')) {
        concerns.push('⚠️ **Dental Health**: High sugar and acidity in carbonated drinks cause tooth decay, enamel erosion, and cavities.');
    }

    if (healthWarnings.includes('digestive issues')) {
        concerns.push('⚠️ **Digestive Issues**: Artificial sweeteners can cause bloating, gas, and digestive discomfort in sensitive individuals.');
    }

    if (healthWarnings.includes('allergic reactions')) {
        concerns.push('⚠️ **Allergic Reactions**: Artificial colors, preservatives, and MSG can trigger allergic reactions and sensitivities in some people.');
    }

    if (healthWarnings.includes('hyperactivity')) {
        concerns.push('⚠️ **Hyperactivity**: Artificial colors, especially in children, have been linked to hyperactivity and attention problems.');
    }

    if (healthWarnings.includes('migraines')) {
        concerns.push('⚠️ **Migraines**: MSG and artificial sweeteners are common triggers for migraines and headaches.');
    }

    if (healthWarnings.includes('stroke')) {
        concerns.push('⚠️ **Stroke Risk**: Trans fats and high sodium significantly increase the risk of stroke.');
    }

    return concerns.join('\n\n');
}

/**
 * Extract nutrition value from various possible formats
 */
function extractNutritionValue(nutrition, ...keys) {
    if (!nutrition || typeof nutrition !== 'object') {
        return null;
    }

    for (const key of keys) {
        // Try direct key
        if (nutrition[key] !== undefined && nutrition[key] !== null) {
            const value = parseFloat(nutrition[key]);
            if (!isNaN(value) && value > 0) return value;
        }

        // Try per_100g format
        if (nutrition.per_100g && nutrition.per_100g[key] !== undefined && nutrition.per_100g[key] !== null) {
            const value = parseFloat(nutrition.per_100g[key]);
            if (!isNaN(value) && value > 0) return value;
        }

        // Try nutriments format (most common in Open Food Facts)
        if (nutrition.nutriments) {
            // Try with _100g suffix first (most common)
            const keyWithSuffix = `${key}_100g`;
            if (nutrition.nutriments[keyWithSuffix] !== undefined && nutrition.nutriments[keyWithSuffix] !== null) {
                const value = parseFloat(nutrition.nutriments[keyWithSuffix]);
                if (!isNaN(value) && value > 0) return value;
            }

            // Try direct key in nutriments
            if (nutrition.nutriments[key] !== undefined && nutrition.nutriments[key] !== null) {
                const value = parseFloat(nutrition.nutriments[key]);
                if (!isNaN(value) && value > 0) return value;
            }

            // Try with _value suffix
            const keyWithValue = `${key}_value`;
            if (nutrition.nutriments[keyWithValue] !== undefined && nutrition.nutriments[keyWithValue] !== null) {
                const value = parseFloat(nutrition.nutriments[keyWithValue]);
                if (!isNaN(value) && value > 0) return value;
            }
        }
    }

    return null;
}

