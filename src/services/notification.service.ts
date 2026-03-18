import * as ReportService from './report.service';
import User from '../models/User';
import { sendPaymentReminder } from './email.service';

export const notifyPendingResidents = async (complexId: string, month: string) => {
  // 1. Obtenemos el reporte del mes para saber quiénes están pendientes
  const report = await ReportService.getMonthlyPaymentReport(complexId, month);
  
  // 2. Filtramos solo las casas con estatus 'pending'
  const pendingHouses = report.details.filter(item => item.status === 'pending');
  
  // 3. Obtenemos los correos de los residentes de esas casas
  // Buscamos usuarios que sean residentes y cuya house_id esté en la lista de pendientes
  const pendingHouseNumbers = pendingHouses.map(h => h.house_number);
  
  // Nota: Para ser más precisos, buscamos los IDs de las casas pendientes
  const housesWithNumbers = await User.find({ 
    complex_id: complexId,
    role: 'resident'
  }).populate('house_id');

  const residentsToNotify = housesWithNumbers.filter((user: any) => 
    user.house_id && pendingHouseNumbers.includes(user.house_id.house_number)
  );

  // 4. Envío masivo (usamos Promise.allSettled para que si un correo falla, los demás sigan)
  const notificationPromises = residentsToNotify.map(resident => 
    sendPaymentReminder(resident.email, resident.first_name, month)
  );

  const results = await Promise.allSettled(notificationPromises);

  return {
    total_attempted: notificationPromises.length,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length
  };
};