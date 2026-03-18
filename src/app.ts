import express, { type Application } from 'express';
import connectDB from './config/database'; // Importamos la conexión
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de rutas
import houseRoutes from './routes/house.routes';
import visitRoutes from './routes/visit.routes';
import paymentRoutes from './routes/payment.routes';
import securityRoutes from './routes/security.routes';
import superRoutes from './routes/super.routes';
import adminRoutes from './routes/admin.routes';
import residentRoutes from './routes/resident.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globales ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// --- Definición de Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/super', superRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/users', userRoutes);

// --- Manejo de errores 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});