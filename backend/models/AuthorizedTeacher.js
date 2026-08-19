const mongoose = require("mongoose");

const authorizedTeacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuthorizedTeacher", authorizedTeacherSchema);
