const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const path = require("node:path");
const multer = require("multer");

const uploadDirectory = path.resolve(__dirname, "../../uploads");
const maxAvatarSize = Number(process.env.MAX_AVATAR_SIZE_MB || 5) * 1024 * 1024;
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: maxAvatarSize, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!/^image\/(jpeg|png|gif|webp|avif)$/.test(file.mimetype)) {
      const error = new Error("Avatar must be a JPEG, PNG, GIF, WebP, or AVIF image.");
      error.status = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
}).single("avatarFile");

module.exports = { uploadAvatar, uploadDirectory };
