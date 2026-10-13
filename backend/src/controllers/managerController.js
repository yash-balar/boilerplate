const mongoose = require("mongoose");
const Manager = require("../models/Manager");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { sendSuccess } = require("../utils/responseHandler");

const sortFields = new Set([
  "name",
  "email",
  "department",
  "status",
  "createdAt",
]);

const buildManagerFilter = (query) => {
  const filter = {};

  if (typeof query.search === "string" && query.search.trim()) {
    const pattern = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { department: pattern },
    ];
  }
  if (query.status && query.status !== "all") {
    if (!["Active", "Inactive"].includes(query.status)) return null;
    filter.status = query.status;
  }
  if (typeof query.department === "string" && query.department.trim()) {
    filter.department = query.department.trim();
  }

  return filter;
};

const encodeManagerCursor = (manager) =>
  Buffer.from(
    JSON.stringify({
      createdAt: manager.createdAt.toISOString(),
      id: manager._id.toString(),
    }),
  ).toString("base64url");

const decodeManagerCursor = (value) => {
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof cursor?.createdAt !== "string" ||
      typeof cursor.id !== "string" ||
      !mongoose.isObjectIdOrHexString(cursor.id)
    ) {
      return null;
    }
    const createdAt = new Date(cursor.createdAt);
    if (!Number.isFinite(createdAt.getTime())) {
      return null;
    }
    return { createdAt, id: new mongoose.Types.ObjectId(cursor.id) };
  } catch {
    return null;
  }
};

const listManagers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
  );
  const sortBy = sortFields.has(req.query.sortBy)
    ? req.query.sortBy
    : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const filter = buildManagerFilter(req.query);
  if (!filter) {
    return res.status(400).json({
      success: false,
      message: "Status filter must be Active or Inactive.",
    });
  }

  const [items, total] = await Promise.all([
    Manager.find(filter)
      .sort({ [sortBy]: sortOrder, _id: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true }),
    Manager.countDocuments(filter),
  ]);
  const serializedItems = items.map(
    ({ _id, __v, createdBy, updatedBy, ...manager }) => ({
      ...manager,
      id: _id.toString(),
    }),
  );

  return sendSuccess(res, {
    message: "Managers retrieved successfully.",
    data: {
      items: serializedItems,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const listManagersCursor = asyncHandler(async (req, res) => {
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
  );
  const filter = buildManagerFilter(req.query);
  if (!filter) {
    return res.status(400).json({
      success: false,
      message: "Status filter must be Active or Inactive.",
    });
  }

  if (req.query.cursor !== undefined) {
    if (typeof req.query.cursor !== "string" || !req.query.cursor) {
      return res.status(400).json({
        success: false,
        message: "Cursor is invalid.",
      });
    }

    const cursor = decodeManagerCursor(req.query.cursor);
    if (!cursor) {
      return res.status(400).json({
        success: false,
        message: "Cursor is invalid.",
      });
    }
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { createdAt: { $lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
        ],
      },
    ];
  }

  const items = await Manager.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean({ virtuals: true });
  const hasMore = items.length > limit;
  if (hasMore) items.pop();

  const nextCursor =
    hasMore && items.length ? encodeManagerCursor(items[items.length - 1]) : null;
  const serializedItems = items.map(
    ({ _id, __v, createdBy, updatedBy, ...manager }) => ({
      ...manager,
      id: _id.toString(),
    }),
  );

  return sendSuccess(res, {
    message: "Managers retrieved successfully.",
    data: {
      items: serializedItems,
      limit,
      hasMore,
      nextCursor,
    },
  });
});

const getManager = asyncHandler(async (req, res) => {
  const manager = await Manager.findById(req.params.managerId);
  if (!manager)
    return res
      .status(404)
      .json({ success: false, message: "Manager not found." });
  return sendSuccess(res, {
    message: "Manager retrieved successfully.",
    data: manager,
  });
});

const createManager = asyncHandler(async (req, res) => {
  const { name, email, department, phone = "", status = "Active" } = req.body;
  if (!name?.trim() || !email?.trim() || !department?.trim()) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Name, email, and department are required.",
      });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email address." });
  }
  if (
    phone &&
    !/^\+?[0-9]{10,15}$/.test(String(phone).replace(/[\s()-]/g, ""))
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid phone number." });
  }
  if (!["Active", "Inactive"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Status must be Active or Inactive." });
  }

  const manager = await Manager.create({
    name,
    email,
    department,
    phone,
    status,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  return sendSuccess(res, {
    statusCode: 201,
    message: "Manager created successfully.",
    data: manager,
  });
});

const updateManager = asyncHandler(async (req, res) => {
  const { name, email, department, phone, status } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (department !== undefined) updates.department = department;
  if (phone !== undefined) updates.phone = phone;
  if (status !== undefined) {
    if (!["Active", "Inactive"].includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Status must be Active or Inactive.",
        });
    }
    updates.status = status;
  }
  if (
    updates.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email.trim())
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email address." });
  }
  if (
    updates.phone &&
    !/^\+?[0-9]{10,15}$/.test(String(updates.phone).replace(/[\s()-]/g, ""))
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid phone number." });
  }
  updates.updatedBy = req.user._id;

  const manager = await Manager.findByIdAndUpdate(
    req.params.managerId,
    updates,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!manager)
    return res
      .status(404)
      .json({ success: false, message: "Manager not found." });
  return sendSuccess(res, {
    message: "Manager updated successfully.",
    data: manager,
  });
});

const deleteManager = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.managerId)) {
    return res
      .status(400)
      .json({ success: false, message: "Manager identifier is invalid." });
  }
  const manager = await Manager.findByIdAndDelete(req.params.managerId);
  if (!manager)
    return res
      .status(404)
      .json({ success: false, message: "Manager not found." });
  return sendSuccess(res, { message: "Manager deleted successfully." });
});

module.exports = {
  createManager,
  deleteManager,
  getManager,
  listManagers,
  listManagersCursor,
  updateManager,
};
