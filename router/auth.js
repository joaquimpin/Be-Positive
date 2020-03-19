const express = require('express');
const router = express.Router();
const country = require('../bin/country')
const job= require('../bin/job')

/* GET home page */
router.get('/sign-in', (req, res, next) => {
	res.render('auth/sign-in');
});

router.get('/signup', (req, res, next) => {
  res.render('./login/register',{job:job,country:country});
});

module.exports = router;
