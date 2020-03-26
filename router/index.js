const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
	if (req.session.currentUser) {
		res.redirect("private/wall")
	} else {
		res.render('landing');
	}

});




module.exports = router;


