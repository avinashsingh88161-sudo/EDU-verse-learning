const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },

  selectedAnswer: {
    type: Number,
    required: true,
  },
});

const quizResultSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: [answerSchema],

    score: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
