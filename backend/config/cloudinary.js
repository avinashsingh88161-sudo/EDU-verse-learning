const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ Cloudinary file storage enabled as primary upload engine.");
} else {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ WARNING: Running in production mode without Cloudinary credentials! Local disk storage is ephemeral on Render.");
  } else {
    console.log("ℹ️ Cloudinary credentials not detected in env. Falling back to local disk storage for dev.");
  }
}

// Storage for notes (PDF files, folder: "eduverse/notes")
let notesStorage;
if (isCloudinaryConfigured) {
  notesStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "eduverse/notes",
      resource_type: "auto",
      public_id: (req, file) => {
        const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
        return `note_${Date.now()}_${cleanName}`;
      },
    },
  });
} else {
  const localNotesDir = path.join(__dirname, "../uploads/notes");
  if (!fs.existsSync(localNotesDir)) {
    fs.mkdirSync(localNotesDir, { recursive: true });
  }
  notesStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localNotesDir),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });
}

// Storage for submissions (PDF, JPG, JPEG, PNG files, folder: "eduverse/assignments/submissions")
let submissionsStorage;
if (isCloudinaryConfigured) {
  submissionsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
      return {
        folder: "eduverse/assignments/submissions",
        resource_type: "auto",
        public_id: `sub_${Date.now()}_${cleanName}`,
      };
    },
  });
} else {
  const localSubDir = path.join(__dirname, "../uploads/submissions");
  if (!fs.existsSync(localSubDir)) {
    fs.mkdirSync(localSubDir, { recursive: true });
  }
  submissionsStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localSubDir),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `submission-${uniqueName}${path.extname(file.originalname)}`);
    },
  });
}

// Multer upload instances
const uploadNoteMiddleware = multer({
  storage: notesStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed for course notes."));
    }
  },
});

const uploadSubmissionMiddleware = multer({
  storage: submissionsStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowedRegex = /pdf|jpg|jpeg|png/i;
    const ext = allowedRegex.test(path.extname(file.originalname));
    const mime = allowedRegex.test(file.mimetype) || file.mimetype === "application/pdf";
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed."));
    }
  },
});

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadNoteMiddleware,
  uploadSubmissionMiddleware,
};
