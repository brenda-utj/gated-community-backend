import Visit from '../models/Visit';
import { generateQRDataURL } from './qr.service';

export const createVisit = async (visitData: {
  houseId: string;
  visitorName: string;
  visitorEmail?: string;
  visitDate: Date;
}) => {
  // 1. Generar el hash único para el QR
  const qrHash = Buffer.from(`${visitData.houseId}-${Date.now()}`).toString('hex');
  
  // 2. Definir fecha de expiración (ej. 24 horas después de la visita)
  const expiryDate = new Date(new Date(visitData.visitDate).getTime() + 24 * 60 * 60 * 1000);

  // 3. Crear el registro en la base de datos
  const visit = new Visit({
    house_id: visitData.houseId,
    visitor_name: visitData.visitorName,
    visit_date: visitData.visitDate,
    expiry_date: expiryDate,
    qr_code_hash: qrHash,
    status: 'pending'
  });

  const savedVisit = await visit.save();

  // 4. Generar la imagen QR (Base64)
  const qrImage = await generateQRDataURL(qrHash);

  // 5. Si hay email, enviar el correo de forma asíncrona
  /*if (visitData.visitorEmail) {
    sendVisitQR(visitData.visitorEmail, visitData.visitorName, qrImage)
      .catch(err => console.error("Error sending visit email:", err));
  }*/

  // Retornamos la visita y la imagen para que el controlador la entregue a la App
  return {
    visit: savedVisit,
    qrCode: qrImage
  };
};

export const validateQR = async (qrHash: string, complexId: string) => {
  // 1. Buscar la visita por su hash
  // Nota: El middleware de soft-delete excluirá automáticamente las visitas borradas.
  const visit = await Visit.findOne({ qr_code_hash: qrHash }).populate('house_id');

  if (!visit) {
    throw new Error("Invalid QR Code: Visit not found.");
  }

  // 2. Verificar que la visita pertenece al mismo fraccionamiento del guardia
  // (Asumiendo que House tiene complex_id)
  const house = visit.house_id as any;
  if (house.complex_id.toString() !== complexId) {
    throw new Error("Access Denied: This QR belongs to another complex.");
  }

  // 3. Verificar estado y vigencia
  const now = new Date();
  if (visit.status !== 'pending') {
    throw new Error(`Access Denied: QR has already been ${visit.status}.`);
  }

  if (now > visit.expiry_date) {
    visit.status = 'expired';
    await visit.save();
    throw new Error("Access Denied: QR has expired.");
  }

  // 4. Marcar ingreso
  visit.status = 'entered';
  visit.check_in_time = now; // Asegúrate de agregar este campo al Schema si lo necesitas
  return await visit.save();
};

export const registerExit = async (qrHash: string, complexId: string) => {
  // Buscamos la visita que esté actualmente 'entered'
  const visit = await Visit.findOne({ qr_code_hash: qrHash, status: 'entered' }).populate('house_id');

  if (!visit) {
    throw new Error("No active entry found for this QR code.");
  }

  const house = visit.house_id as any;
  if (house.complex_id.toString() !== complexId) {
    throw new Error("Access Denied: Complex mismatch.");
  }

  visit.status = 'exited';
  visit.check_out_time = new Date();
  return await visit.save();
};