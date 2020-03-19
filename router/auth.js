const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/sign-in', (req, res, next) => {
	res.render('auth/sign-in');
});
module.exports = router;
