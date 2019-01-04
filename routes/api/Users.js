//Auth
const express = require("express"); // To use the router, you must bring in express first
const router = express.Router();

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users works"
  })
); //Returns a 200 status

module.exports = router;
