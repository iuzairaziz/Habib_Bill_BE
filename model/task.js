const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    name: String,
    startTime: Date,
    endTime: Date,
    description: String,
    estHrs: Number,
    workDone: { type: Number, min: 0, max: 100 , default:0},
    projectRatio: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tasks",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports.Tasks = Tasks;
