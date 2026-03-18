import QRCode from 'qrcode';

export const generateQRDataURL = async (text: string): Promise<string> => {
  try {
    // Genera una imagen Base64 del código QR
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error('Error generating QR:', err);
    throw new Error('Failed to generate QR code');
  }
};