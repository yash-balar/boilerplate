const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
  },
  department: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 40, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {
  timestamps: true,
  toJSON: {
    transform(_document, result) {
      result.id = result._id.toString();
      delete result._id;
      delete result.__v;
      delete result.createdBy;
      delete result.updatedBy;
      return result;
    },
  },
});

managerSchema.index({ name: 1 });
managerSchema.index({ email: 1 });
managerSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Manager", managerSchema);
