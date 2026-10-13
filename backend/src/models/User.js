const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  age: { type: Number, required: true, min: 18, max: 120 },
  phone: { type: String, required: true, trim: true, maxlength: 40 },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.EMPLOYEE },
  profilePicture: { type: String, default: "" },
  password: { type: String, required: true, select: false },
  token: { type: String, default: "", select: false },
  tokenExpiresAt: { type: Date, default: null, select: false },
}, {
  timestamps: true,
  toJSON: {
    transform(_document, result) {
      result.id = result._id.toString();
      delete result._id;
      delete result.__v;
      delete result.password;
      delete result.token;
      delete result.tokenExpiresAt;
      return result;
    },
  },
});

module.exports = mongoose.model("User", userSchema);
