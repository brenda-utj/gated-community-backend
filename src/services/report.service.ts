import House from '../models/House';
import MaintenancePayment from '../models/MaintenancePayment';

export const getMonthlyPaymentReport = async (complexId: string, month: string) => {
  // 1. Obtener todas las casas del fraccionamiento
  const houses = await House.find({ complex_id: complexId });

  // 2. Obtener todos los pagos aprobados para ese mes
  const payments = await MaintenancePayment.find({
    month_covered: month,
    status: 'verified'
  });

  // 3. Cruzar la información
  const report = houses.map(house => {
    const payment = payments.find(p => p.house_id.toString() === house._id.toString());
    
    return {
      house_number: house.house_number,
      street: house.street,
      status: payment ? 'paid' : 'pending',
      payment_date: payment ? payment.updated_at : null,
      amount: payment ? payment.amount : 0
    };
  });

  return {
    month,
    total_houses: houses.length,
    paid_count: report.filter(r => r.status === 'paid').length,
    pending_count: report.filter(r => r.status === 'pending').length,
    details: report
  };
};