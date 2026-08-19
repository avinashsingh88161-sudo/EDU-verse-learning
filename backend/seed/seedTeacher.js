const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const AuthorizedTeacher = require("../models/AuthorizedTeacher");

const seedTeachers = async () => {
  try {
    const sampleTeachers = [
      {
        teacherId: "TCH101",
        name: "Dr. Alan Turing",
        subject: "Computer Science",
        department: "School of Engineering",
        isUsed: false,
      },
      {
        teacherId: "TCH102",
        name: "Prof. Ada Lovelace",
        subject: "Software Engineering",
        department: "School of Computing",
        isUsed: false,
      },
      {
        teacherId: "TCH103",
        name: "Dr. Richard Feynman",
        subject: "Physics & Mathematics",
        department: "Department of Physical Sciences",
        isUsed: false,
      },
    ];

    for (const t of sampleTeachers) {
      await AuthorizedTeacher.updateOne(
        { teacherId: t.teacherId },
        { $setOnInsert: t },
        { upsert: true }
      );
    }

    console.log("Successfully seeded Authorized Teacher IDs: TCH101, TCH102, TCH103");
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

module.exports = seedTeachers;

if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduverse";
  mongoose.connect(mongoUri).then(() => {
    seedTeachers().then(() => process.exit(0));
  });
}
