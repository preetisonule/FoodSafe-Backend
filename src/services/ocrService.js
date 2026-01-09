import Tesseract from 'tesseract.js';

/**
 * Extract text from image using OCR
 * For MVP, this is a simplified version
 */
export async function extractTextFromImage(imageBuffer) {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => {
          // Optional: log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse ingredients from OCR text
 * This is a simplified parser - in production, you'd want more sophisticated NLP
 */
export function parseIngredientsFromText(text) {
  if (!text) return [];

  // Common patterns for ingredient lists
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for common ingredient list indicators
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('ingredients') || line.includes('ingredient')) {
      startIndex = i + 1;
      break;
    }
  }

  // Extract ingredients (usually comma or newline separated)
  const ingredientLines = lines.slice(startIndex);
  const ingredients = [];

  for (const line of ingredientLines) {
    // Skip nutrition facts section
    if (line.toLowerCase().includes('nutrition') || 
        line.toLowerCase().includes('per 100') ||
        line.match(/^\d+[a-z%]/i)) {
      break;
    }

    // Split by common separators
    const parts = line.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);
    ingredients.push(...parts);
  }

  return ingredients.length > 0 ? ingredients : [text]; // Fallback to full text
}

/**
 * Parse nutrition from OCR text
 * Simplified parser for MVP
 */
export function parseNutritionFromText(text) {
  const nutrition = {};
  const lines = text.split('\n').map(line => line.trim());

  // Look for sugar
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Sugar
    if (lowerLine.includes('sugar') && !nutrition.sugars) {
      const match = line.match(/(\d+\.?\d*)\s*g/i);
      if (match) {
        nutrition.sugars = parseFloat(match[1]);
      }
    }

    // Sodium/Salt
    if ((lowerLine.includes('sodium') || lowerLine.includes('salt')) && !nutrition.sodium) {
      const mgMatch = line.match(/(\d+\.?\d*)\s*mg/i);
      const gMatch = line.match(/(\d+\.?\d*)\s*g/i);
      
      if (mgMatch) {
        nutrition.sodium = parseFloat(mgMatch[1]);
      } else if (gMatch && lowerLine.includes('salt')) {
        // Convert salt (g) to sodium (mg) - approximate
        nutrition.sodium = parseFloat(gMatch[1]) * 1000 * 0.4;
      }
    }
  }

  return nutrition;
}

