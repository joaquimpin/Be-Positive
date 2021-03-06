const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');


router.get('/', async (req, res) => {
  response = await User.findById(req.session.currentUser._id);


  const anAsyncFunction = async obj => {
    let user = await User.findById(obj.user).populate("user");
    return { name: user.name, chatId: obj.chatId, photo: user.pictureOfUser, username: user.username }
  };
  const getData = async () => {
    return Promise.all(response.chat.map(item => anAsyncFunction(item)))
  };
  getData().then(data => {
    let chat = JSON.stringify(data);
    console.log("fasdfaj-->", req.session.currentUser._id)
    res.render('chat/chat', { response, chat, user: req.session.currentUser, id: req.session.currentUser._id })
  })







  //console.log(response.chat)



  // res.sendFile(path.join(__dirname, "../public/html/index.html"))
});


module.exports = router;


/* try{
  const userLog = req.session.currentUser;
  const likeList = userLog.likeList;
    const anAsyncFunction = async obj => {
      let user = await User.findById(obj.userwhoLikes);
      let product = await Product.findById(obj.productLiked);
      return {user, product}
    }
    const getData = async () => {
      return Promise.all(likeList.map(item => anAsyncFunction(item)))
    }
    getData().then(fullLikeList => {
      res.render("notifications.hbs", { fullLikeList});
    })
}catch(err){
  console.log(err)
  next(err)
}
*/