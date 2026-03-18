import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getBaseEmailTemplate } from '../utils/emailTemplate';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 1. Correo de Bienvenida (Registro)
export const sendWelcomeEmail = async (email: string, name: string, tempPassword: string) => {
  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Has sido dado de alta en el sistema. Tus credenciales de acceso son:</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Usuario:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${tempPassword}</p>
    </div>
    <p>Por seguridad, deberás cambiar tu contraseña al ingresar por primera vez.</p>
  `;

  const html = getBaseEmailTemplate("Bienvenido a Casa", content, "Este es un correo automático, por favor no respondas.");
  
  return await transporter.sendMail({
    from: `"Administración" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenido - Accesos al Sistema',
    html
  });
};

// 2. Correo de Invitación con QR
export const sendVisitQR = async (email: string, visitorName: string, qrBase64: string) => {
  const content = `
    <p>Se ha generado un acceso para <strong>${visitorName}</strong>.</p>
    <p>Muestra el siguiente código QR en la caseta de vigilancia para ingresar:</p>
    <div style="text-align: center; margin: 30px 0;">
      <img src="${qrBase64}" alt="Código QR de Acceso" style="width: 200px; height: 200px;" />
    </div>
    <p>Este código es válido únicamente para la fecha programada.</p>
  `;

  const html = getBaseEmailTemplate("Pase de Acceso", content, "Presenta este QR desde tu celular.");

  // Adjuntamos el QR también como imagen incrustada (CID) para que no falle en algunos clientes
  return await transporter.sendMail({
    from: `"Seguridad" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Acceso para ${visitorName}`,
    html
  });
};

export const sendPaymentReminder = async (email: string, name: string, month: string) => {
  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Te recordamos que aún no contamos con el registro de tu pago de mantenimiento para el mes de <strong>${month}</strong>.</p>
    <p>Por favor, sube tu comprobante a la plataforma para mantener tu cuenta al día y evitar recargos.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="https://tuapp.com/pagos" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Subir Comprobante</a>
    </div>
  `;

  const html = getBaseEmailTemplate("Recordatorio de Pago", content, "Evita suspensiones en servicios comunes.");

  return await transporter.sendMail({
    from: `"Administración" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Recordatorio de Pago - ${month}`,
    html
  });
};