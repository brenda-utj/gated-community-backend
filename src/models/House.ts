import { Schema, model, Types } from 'mongoose';
import { softDeletePlugin } from './Plugins';

const vehicleSchema = new Schema({
  brand: String,
  model: String,
  plate: { type: String, required: true },
  color: String
});

const petSchema = new Schema({
  name: String,
  species: String, // Perro, Gato, etc.
  breed: String
});

const houseSchema = new Schema({
  complex_id: { type: Types.ObjectId, ref: 'Complex', required: true },
  house_number: { type: String, required: true },
  street: { type: String, required: true },
  // Embebidos para facilitar la lectura de la "Ficha de la casa"
  vehicles: [vehicleSchema],
  pets: [petSchema],
  is_active: { type: Boolean, default: true }
});

houseSchema.plugin(softDeletePlugin);
export default model('House', houseSchema);