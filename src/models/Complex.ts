import { Schema, model } from 'mongoose';
import { addSoftDeleteAndTimestamps } from './BaseSchema';

const complexSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  subscription_status: { 
    type: String, 
    enum: ['active', 'suspended'], 
    default: 'active' 
  }
});

// Aplicamos la función que añade deleted_at Y activa timestamps
addSoftDeleteAndTimestamps(complexSchema);

export default model('Complex', complexSchema);