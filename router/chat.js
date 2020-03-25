const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');


router.get('/', (req, res) => {
  User.findById(req.session.currentUser._id)
    
    .then(response => {
      console.log(response)
      let chat = JSON.stringify(response.chat)
      res.render('chat/chat', { response, chat })

    })
  // res.sendFile(path.join(__dirname, "../public/html/index.html"))
})


module.exports = router;
