const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    pdfFile: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },

    originalFileName: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "application/pdf",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Note", noteSchema);
