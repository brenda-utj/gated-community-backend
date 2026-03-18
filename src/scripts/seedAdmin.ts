import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Conectado a MongoDB para el seed...');

    // Verificar si ya existe un admin para no duplicar
    const adminExists = await User.findOne({ email: 'admin@fraccionamiento.com' });
    if (adminExists) {
      console.log('El usuario Admin ya existe.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Creamos un ID de complejo inicial
    const complexId = new mongoose.Types.ObjectId();

    const superAdmin = new User({
      complex_id: complexId,
      first_name: 'Admin',
      last_name: 'Principal',
      email: 'admin@fraccionamiento.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0000000000'
    });

    await superAdmin.save();
    console.log('✅ Súper Admin creado con éxito.');
    console.log('Email: admin@fraccionamiento.com');
    console.log('Pass: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};

seedAdmin();