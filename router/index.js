const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  console.log("Loading landing page!")
  res.render('landing');
});





module.exports = router;
