import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    default: []
  },
  nutrition: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  safetyScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  riskLevel: {
    type: String,
    enum: ['Safe', 'Moderately Safe', 'Unsafe'],
    required: true
  },
  explanation: {
    type: [String],
    default: []
  },
  healthWarnings: {
    type: [String],
    default: []
  },
  healthConcerns: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['barcode', 'ocr'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);

