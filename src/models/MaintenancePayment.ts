import { Schema, model, Types } from 'mongoose';
import { softDeletePlugin } from './Plugins';

const maintenancePaymentSchema = new Schema({
  house_id: { type: Types.ObjectId, ref: 'House', required: true },
  resident_id: { type: Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  month_covered: { type: String, required: true }, // Ejemplo: "2024-03"
  receipt_url: { type: String, required: true },   // URL de S3 o Cloudinary
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  notes: String
});

maintenancePaymentSchema.plugin(softDeletePlugin);
export default model('MaintenancePayment', maintenancePaymentSchema);