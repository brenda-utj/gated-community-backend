import { Schema, model, Types } from 'mongoose';
import { softDeletePlugin } from './Plugins';

// src/models/Visit.ts
const visitSchema = new Schema({
  house_id: { type: Types.ObjectId, ref: 'House', required: true },
  visitor_name: { type: String, required: true },
  visit_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },
  qr_code_hash: { type: String, required: true, unique: true },
  check_in_time: { type: Date },
  check_out_time: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'entered', 'exited', 'expired', 'cancelled'], 
    default: 'pending' 
  }
});

visitSchema.plugin(softDeletePlugin);
export default model('Visit', visitSchema);