export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-10); // Genera algo como '5n8x2z9pqr'
};