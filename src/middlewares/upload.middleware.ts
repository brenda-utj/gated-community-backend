import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Guardamos en memoria para procesar y enviar a la nube

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) return cb(null, true);
    cb(new Error("Error: File upload only supports images (jpeg, jpg, png)"));
  }
});