import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Allowed types: PDF, DOCX, TXT"));
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

const singleUpload = multerUpload.single("file");

export function upload(req: Request, res: Response, next: NextFunction): void {
  singleUpload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "File size exceeds 10MB limit" });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: "File upload error" });
      return;
    }
    next();
  });
}
