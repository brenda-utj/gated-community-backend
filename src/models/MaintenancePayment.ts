import { Schema, model, Types } from 'mongoose';
import { softDeletePlugin } from './Plugins';

const maintenancePaymentSchema = new Schema({
  house_id:       { type: Types.ObjectId, ref: 'House', required: true },
  resident_id:    { type: Types.ObjectId, ref: 'User', required: true },
  amount:         { type: Number, required: true },
  month_covered:  { type: String, required: true },
  receipt_base64: { type: String, required: true }, 
  receipt_mime:   { type: String, required: true }, 
  status:         { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  notes:          String
}, { timestamps: true });

maintenancePaymentSchema.plugin(softDeletePlugin);
export default model('MaintenancePayment', maintenancePaymentSchema);