import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  complex_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Complex', 
    required: true 
  },
  
  house_id: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  area: { type: String, required: true }, // alberca, salón, etc
  date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },

  guests: { type: Number, required: true },
  requirements: { type: String },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  }

}, { timestamps: true });

export const Reservation = mongoose.model('Reservation', reservationSchema);