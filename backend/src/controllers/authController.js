const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const rolePermissions = require("../constants/rolePermissions");
const ROLES = require("../constants/roles");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

const issueToken = async (user) => {
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
  const { exp } = jwt.decode(token);
  user.token = token;
  user.tokenExpiresAt = new Date(exp * 1000);
  await user.save();
  return token;
};

const register = asyncHandler(async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    age,
    phone,
    password,
    role = ROLES.EMPLOYEE,
  } = req.body || {};

  if (
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof lastName !== "string" ||
    !lastName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    age === undefined ||
    typeof phone !== "string" ||
    !phone.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message:
        "First name, last name, email, age, phone, and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email address." });
  }
  const numericAge = Number(age);
  if (!Number.isInteger(numericAge) || numericAge < 18 || numericAge > 120) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Age must be a whole number between 18 and 120.",
      });
  }
  if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid phone number." });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
    });
  }
  if (![ROLES.EMPLOYEE, ROLES.MANAGER].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Public registration is limited to employee or manager roles.",
    });
  }
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    age: numericAge,
    phone: phone.trim(),
    password: hashedPassword,
    role,
  });
  const accessToken = await issueToken(user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully.",
    data: {
      accessToken,
      user,
      permissions: rolePermissions[user.role] || [],
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email address." });
  }
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +token +tokenExpiresAt",
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Email or password is incorrect.",
    });
  }
  const accessToken = await issueToken(user);
  return sendSuccess(res, {
    message: "Logged in successfully.",
    data: {
      accessToken,
      user,
      permissions: rolePermissions[user.role] || [],
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  req.user.token = "";
  req.user.tokenExpiresAt = null;
  await req.user.save();
  return sendSuccess(res, { message: "Logged out successfully." });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({
      success: false,
      message: "Current and new passwords are required.",
    });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be at least 8 characters and include uppercase, lowercase, and a number.",
    });
  }

  const user = await User.findById(req.user._id).select(
    "+password +token +tokenExpiresAt",
  );
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.token = "";
  user.tokenExpiresAt = null;
  await user.save();
  return sendSuccess(res, {
    message: "Password updated. Please sign in again.",
  });
});

module.exports = { changePassword, login, logout, register };
