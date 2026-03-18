import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js"; // Asegúrate de que la ruta sea correcta

dotenv.config();

const seed = async () => {
  try {
    // 1. Conectar a la base de datos
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI no definida en el archivo .env");

    console.log("⏳ Conectando a MongoDB Atlas...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Conexión establecida.");

    // 2. Verificar si ya existe
    const existing = await User.findOne({ email: "master@system.com" });
    if (existing) {
      console.log("⚠️ El Super Admin ya existe en la base de datos.");
      process.exit(0);
    }

    // 3. Crear el usuario
    console.log("Creating Super Admin...");
    const hashedPassword = await bcrypt.hash("MasterKey2026!", 10);

    const superAdmin = new User({
      first_name: "Super",
      last_name: "User",
      email: "master@system.com",
      password: hashedPassword,
      role: "super_admin",
      // complex_id no es requerido para super_admin según nuestro esquema
    });

    // 4. GUARDAR en la BD
    await superAdmin.save();
    console.log("🚀 Super Admin creado exitosamente en Mongo Atlas.");
  } catch (error) {
    console.error("❌ Error ejecutando el seed:", error);
  } finally {
    // 5. Cerrar la conexión y salir
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
