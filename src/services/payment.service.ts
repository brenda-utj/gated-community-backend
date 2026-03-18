import MaintenancePayment from '../models/MaintenancePayment';

export const processPaymentUpload = async (data: {
  house_id: string,
  resident_id: string,
  amount: number,
  month_covered: string,
  file: Express.Multer.File
}) => {
  // 1. Validar si ya existe un pago para ese mes y esa casa que no esté rechazado
  const existingPayment = await MaintenancePayment.findOne({
    house_id: data.house_id,
    month_covered: data.month_covered,
    status: { $ne: 'rejected' }
  });

  if (existingPayment) {
    throw new Error(`A payment for ${data.month_covered} is already registered or pending.`);
  }

  // 2. Simulación de subida a la nube (S3/Cloudinary)
  // Aquí llamarías a tu SDK de AWS o Cloudinary
  const receipt_url = `https://storage.provider.com/receipts/${Date.now()}-${data.file.originalname}`;

  // 3. Crear el registro en DB
  const newPayment = new MaintenancePayment({
    house_id: data.house_id,
    resident_id: data.resident_id,
    amount: data.amount,
    month_covered: data.month_covered,
    receipt_url,
    status: 'pending'
  });

  return await newPayment.save();
};