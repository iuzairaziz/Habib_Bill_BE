var express = require("express");
const auth = require("../../middlewares/auth");
const _ = require("lodash");
const { extend } = require("lodash");
var router = express.Router();
const { Country } = require("../../model/country");

/* Get All Designations And Users */
router.get("/show-country", async (req, res) => {
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let country = await Country.find().skip(skipRecords).limit(perPage);
  return res.send(country);
});

/*Add new Designation*/
router.post("/create-country", async (req, res) => {
  let country = await Country.findOne({
    name: req.body.name,
  });
  if (country)
    return res.status(400).send("country With Given Name Already Exsists");
  country = new Country(req.body);
  country
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
    let country = await Country.findById(req.params.id);
    console.log(country);
    if (!country)
      return res.status(400).send("country with given id is not present");
    // country = extend(country, req.body);
    country.name = req.body.name;
    await country.save();
    return res.send(country);
  } catch {
    return res.status(400).send("Invalid Id"); // when id is inavlid
  }
});

// Delete Designation
router.delete("/:id", async (req, res) => {
  try {
    let country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(400).send("country with given id is not present"); // when there is no id in db
    }
    return res.send(country); // when everything is okay
  } catch {
    return res.status(400).send("Invalid Task Id"); // when id is inavlid
  }
});

module.exports = router;
