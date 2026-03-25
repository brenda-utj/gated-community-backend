import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  house_id: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);