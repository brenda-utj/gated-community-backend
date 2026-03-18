import { Schema, Query } from 'mongoose';

/**
 * Plugin para implementar Soft Delete de forma global.
 * Filtra automáticamente los documentos que tienen el campo deleted_at definido.
 */
export const softDeletePlugin = (schema: Schema) => {
  // 1. Agregar el campo deleted_at al esquema
  schema.add({
    deleted_at: {
      type: Date,
      default: null,
    },
  });

  // 2. Definir la lógica de filtrado
  // Usamos una función tradicional para mantener el contexto de 'this' (la Query de Mongoose)
  const excludeDeleted = function (this: Query<any, any>) {
    this.where({ deleted_at: null });
  };

  /**
   * 3. Aplicar el filtro a los hooks de consulta.
   * En versiones recientes de Mongoose, si no se define 'next' como argumento,
   * Mongoose no lo espera y evita el error 'next is not a function'.
   */
  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
  schema.pre('aggregate', function (this: any) {
    // Para agregaciones, añadimos un paso $match al inicio del pipeline
    this.pipeline().unshift({ $match: { deleted_at: null } });
  });

  // 4. Método de instancia para ejecutar el borrado lógico
  schema.methods.softDelete = async function () {
    this.deleted_at = new Date();
    return this.save();
  };
};