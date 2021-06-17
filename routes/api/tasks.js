var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
const mongoose = require("mongoose");
var router = express.Router();
const { Tasks } = require("../../model/task");
const moment = require("moment");
const auth = require("../../middlewares/auth");

/* Get Tasks */
router.get("/show-task", auth, async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let tasks = await Tasks.find()
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedby", "name")
    .populate("addedBy")
    .populate("assignedTo")
    .sort({
      createdAt: -1,
    })
    .skip(skipRecords)
    .limit(perPage);
  return res.send(tasks);
});

/*Add new task*/
router.post("/create-task", auth, async (req, res) => {
  let tasks = await Tasks.findOne({ name: req.body.name });
  if (tasks) return res.status(400).send("Task With Given Name Already Exists");
  task = new Tasks(req.body);
  task
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Tasks
router.put("/:id", auth, async (req, res) => {
  try {
    let task = await Tasks.findById(req.params.id);
    console.log(task);
    if (!task) return res.status(400).send("Task with given id is not present");
    task = extend(task, req.body);
    await task.save();
    return res.send(task);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
  try {
    let task = await Tasks.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(400).send("Task with given id is not present"); // when there is no id in db
    }
    return res.send(task); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

router.get("/project-tasks/:id", auth, async (req, res) => {
  let tasks = await Tasks.find({ project: req.params.id })
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedBy", "name")
    .populate("approvedBy")
    .populate("assignedTo")
    .sort({
      createdAt: -1,
    });

  return res.send(tasks);
});

router.get("/parents", auth, async (req, res) => {
  let tasks = await Tasks.find({ parentTask: null })
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedBy")
    .populate("approvedBy")
    .populate("assignedTo")
    .sort({
      createdAt: -1,
    });

  return res.send(tasks);
});

router.get("/:id", auth, async (req, res) => {
  console.log(req.params.id);
  let task = await Tasks.findById(req.params.id)
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedBy", "name")
    .populate("approvedBy")
    .populate("assignedTo")
    .sort({
      createdAt: -1,
    });

  let subTasks = await Tasks.find({ parentTask: task._id })
    .populate("projects")
    .populate("parentTask")
    .populate("project")
    .populate("teamLead")
    .populate("addedBy", "name")
    .populate("approvedBy")
    .populate("assignedTo")
    .sort({
      createdAt: -1,
    });

  return res.send({ task, subTasks });
});

router.post("/by-employee-project", auth, async (req, res) => {
  let { empId, projectId } = req.body;
  console.log("body", req.body);
  try {
    let tasks = await Tasks.find({
      project: projectId,
      assignedTo: { _id: empId },
    }).populate("assignedTo");
    if (!tasks) {
      return res.status(404).send("Task with given id is not present"); // when there is no id in db
    }
    return res.send(tasks); // when everything is okay
  } catch (err) {
    console.log("error", err.message);
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

router.post("/employee", auth, async (req, res) => {
  let empId = req.body.empId;
  let startDate = moment(req.body.startDate).toDate();
  let endDate = moment(req.body.endDate).toDate();

  console.log("empId==", empId);
  console.log("start==", startDate);
  console.log("end==", endDate);
  try {
    let result = await Tasks.aggregate([
      { $project: { name: 1, project: 1, assignedTo: 1, workDone: 1 } },
      { $match: { assignedTo: mongoose.Types.ObjectId(empId) } },
      {
        $lookup: {
          from: "timesheets",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$taskId", "$task"] },
                    { $eq: [mongoose.Types.ObjectId(empId), "$employee"] },
                    { $gte: ["$date", startDate] },
                    { $lte: ["$date", endDate] },
                  ],
                },
              },
            },
          ],
          as: "timesheet",
        },
      },
      { $group: { _id: "$project", tasks: { $push: "$$ROOT" } } },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $project: {
          tasks: 1,
          project: { $arrayElemAt: ["$project", 0] },
          _id: 0,
        },
      },
      // {$replaceRoot:{"newRoot":"$project"}}
    ]);
    if (!result) {
      return res.status(404).send("Task with given employee id is not present"); // when there is no id in db
    }
    res.send(result);
  } catch (err) {
    console.log("error", err.message);
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }

  // let result = await Tasks.find({assignedTo:{_id:empId}});
  // console.log("resulttt",result)
});

module.exports = router;
