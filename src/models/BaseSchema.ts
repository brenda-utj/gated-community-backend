import { Schema } from 'mongoose';

export const addSoftDeleteAndTimestamps = (schema: Schema) => {
  schema.add({
    deleted_at: { type: Date, default: null },
  });

  schema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at' });

  // Middleware para filtrar documentos borrados automáticamente
  // Eliminamos el parámetro 'next' para evitar el TypeError
  schema.pre(/^find/, function () {
    this.where({ deleted_at: null });
  });

  // Si usas findOneAndUpdate (como en el método updateComplex), 
  // también es recomendable asegurar que no se actualicen objetos borrados
  schema.pre('findOneAndUpdate', function () {
    this.where({ deleted_at: null });
  });

  
};