var express = require("express");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Nature } = require("../../model/nature");
const auth = require("../../middlewares/auth");

/* Get All Designations And Users */
router.get("/show-nature", async (req, res) => {
  let nature = await Nature.find();
  return res.send(nature);
});

/*Add new Designation*/
router.post("/create-nature", async (req, res) => {
  let nature = await Nature.findOne({
    name: req.body.name,
  });
  if (nature)
    return res.status(400).send("nature With Given Name Already Exsists");
  nature = new Nature(req.body);
  nature
    .save()
    .then((resp) => {
      return res.send(resp);
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
});

// Update Designation
router.put("/:id", async (req, res) => {
  try {
    let nature = await Nature.findById(req.params.id);
    console.log(nature);
    if (!nature)
      return res.status(400).send("nature with given id is not present");
    nature = extend(nature, req.body);
    await nature.save();
    return res.send(nature);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", async (req, res) => {
  try {
    let nature = await Nature.findByIdAndDelete(req.params.id);
    if (!nature) {
      return res.status(400).send("nature with given id is not present"); // when there is no id in db
    }
    return res.send(nature); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;
