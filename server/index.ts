import express from "express";
import multer from "multer";
import { createServer } from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.resolve(process.env.LEAD_MACHINE_UPLOAD_DIR || path.join(process.cwd(), "private_uploads", "lead-machine-checklist"));
const maxFileSizeBytes = 20 * 1024 * 1024;
const maxFilesPerSubmission = 25;
const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".jpg", ".jpeg", ".png"]);
const allowedMimePrefixes = ["image/jpeg", "image/png"];
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel.sheet.macroEnabled.12",
]);

function sanitizeText(value: unknown): string {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, 12000);
}

function sanitizeFilename(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  const base = path.basename(filename, extension).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 80) || "document";
  return `${base}${extension}`;
}

function isAllowedFile(file: Express.Multer.File): boolean {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeAllowed = allowedMimeTypes.has(file.mimetype) || allowedMimePrefixes.includes(file.mimetype);
  return allowedExtensions.has(extension) && mimeAllowed;
}

function getSubmissionId(req: express.Request): string {
  const existingSubmissionId = (req as express.Request & { submissionId?: string }).submissionId;

  if (existingSubmissionId) {
    return existingSubmissionId;
  }

  const submissionId = crypto.randomUUID();
  (req as express.Request & { submissionId: string }).submissionId = submissionId;
  return submissionId;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const submissionId = getSubmissionId(req);
    const destination = path.join(uploadRoot, submissionId, "files");
    fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeBytes,
    files: maxFilesPerSubmission,
    fields: 80,
    fieldSize: 64 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedFile(file)) {
      cb(new Error(`Unsupported file type: ${file.originalname}`));
      return;
    }

    cb(null, true);
  },
});

const checklistUploadFields = [
  { name: "pricing_files[]", maxCount: 5 },
  { name: "estimate_files[]", maxCount: 5 },
  { name: "crm_files[]", maxCount: 5 },
  { name: "example_files[]", maxCount: 5 },
  { name: "other_files[]", maxCount: 5 },
];

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.post("/api/lead-machine/checklist-submit", upload.fields(checklistUploadFields), (req, res) => {
    const submissionId = getSubmissionId(req);
    const submittedAt = new Date().toISOString();
    const submissionDir = path.join(uploadRoot, submissionId);
    fs.mkdirSync(submissionDir, { recursive: true, mode: 0o700 });

    const filesByField = req.files as Record<string, Express.Multer.File[]> | undefined;
    const files = Object.entries(filesByField || {}).flatMap(([fieldName, uploadedFiles]) =>
      uploadedFiles.map((file) => ({
        fieldName,
        originalName: file.originalname,
        storedName: path.basename(file.filename),
        relativePath: path.relative(submissionDir, file.path),
        mimeType: file.mimetype,
        sizeBytes: file.size,
      })),
    );

    const metadata = {
      submissionId,
      submittedAt,
      source: sanitizeText(req.body.source || "lead_machine_checklist_fr"),
      privacy: {
        privateDirectLinkPage: true,
        noPasswordsAccepted: true,
        publicFileServingEnabled: false,
      },
      form: Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key, Array.isArray(value) ? value.map(sanitizeText) : sanitizeText(value)])),
      files,
      storage: {
        uploadRoot,
        submissionDir,
      },
      syncJourney: {
        contractVersion: "2026-05-26",
        endpoint: "/api/lead-machine/checklist-submit",
        contentType: "multipart/form-data",
      },
    };

    fs.writeFileSync(path.join(submissionDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, { mode: 0o600 });

    res.status(200).json({
      success: true,
      submissionId,
      fileCount: files.length,
      submittedAt,
    });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!err) {
      next();
      return;
    }

    const isMulterError = err instanceof multer.MulterError;
    const message = isMulterError || err.message?.startsWith("Unsupported file type")
      ? "Un fichier joint est trop gros ou dans un format non accepté. Formats permis : PDF, Word, Excel, CSV, JPG et PNG. Taille maximale : 20 Mo par fichier."
      : "La checklist n’a pas pu être reçue. Réessayez ou contactez PrimeGrowth AI.";

    res.status(400).json({ success: false, error: message });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Lead Machine private uploads stored at ${uploadRoot}`);
  });
}

startServer().catch(console.error);
