const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('./record/index');
});

router.get('/wall', (req, res) => {
  res.render('private/wall');
});


router.get('/profile', (req, res) => {
  res.render('private/profile');
});


router.get('/rate-comment', (req, res) => {
  res.render('private/add-comment');
});





module.exports = router;
