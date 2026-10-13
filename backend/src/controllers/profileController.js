const fs = require("node:fs/promises");
const path = require("node:path");
const User = require("../models/User");
const { uploadDirectory } = require("../middleware/uploadAvatar");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");

const apiPublicUrl = (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`)
  .replace(/\/$/, "");

const removeLocalAvatar = async (imageUrl) => {
  if (!imageUrl) return;
  let fileName;
  try {
    const parsed = new URL(imageUrl, apiPublicUrl);
    if (parsed.origin !== new URL(apiPublicUrl).origin || !parsed.pathname.startsWith("/uploads/")) return;
    fileName = path.basename(parsed.pathname);
  } catch {
    return;
  }
  await fs.rm(path.join(uploadDirectory, fileName), { force: true });
};

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "Profile retrieved successfully.",
    data: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { firstName, lastName, email, age, phone, profilePicture } = req.body;

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }
    user.email = normalizedEmail;
  }
  if (age !== undefined) {
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 18 || numericAge > 120) {
      return res.status(400).json({ success: false, message: "Age must be a whole number between 18 and 120." });
    }
    user.age = numericAge;
  }
  if (phone !== undefined) {
    if (!/^\+?[0-9]{10,15}$/.test(String(phone).trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid phone number." });
    }
    user.phone = String(phone).trim();
  }

  const oldPicture = user.profilePicture;
  if (req.file) {
    user.profilePicture = `${apiPublicUrl}/uploads/${req.file.filename}`;
  } else if (profilePicture !== undefined) {
    user.profilePicture = String(profilePicture);
  }
  await user.save();

  if (oldPicture && oldPicture !== user.profilePicture) {
    await removeLocalAvatar(oldPicture);
  }
  return sendSuccess(res, {
    message: "Profile updated successfully.",
    data: user,
  });
});

module.exports = { getProfile, updateProfile };
