const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "faculty", "admin"],
      default: "student",
    },

    teacherId: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      default: null,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to prepend "Prof. " to teacher/faculty names
userSchema.pre("save", function (next) {
  const roleLower = (this.role || "").toLowerCase();
  if ((roleLower === "teacher" || roleLower === "faculty") && this.name && !this.name.startsWith("Prof. ")) {
    this.name = `Prof. ${this.name}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
