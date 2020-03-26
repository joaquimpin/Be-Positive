const express = require('express');
const router = express.Router();
const arrayCountries = require('../bin/countrie');
const arrayProfession = require('../bin/profession');
const User = require('../models/user');
const regexPassword = new RegExp('.{3,}');
const regexEmail = new RegExp(`^[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$`);
const bcrypt = require('bcryptjs');
const bcryptSalt = 10;
router.get('/signin', (req, res, next) => {
  res.render('auth/signin');
});


router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    res.render('auth/signin', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }
  User.findOne({ email }, (err, user) => {
    if (err || user === null) {
      res.render('auth/signin', {
        errorMessage: `There isn't an account with email ${email}.`
      });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.render('auth/signin', {
        profession: arrayProfession, countries: arrayCountries, errorMessage: 'Invalid password'
      });
      return;
    }
    req.session.currentUser = user;
    res.redirect('/private/wall');
  });
});


router.get('/signup', (req, res, next) => {
  res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries });
});


router.post('/signup', async (req, res, next) => {
  const { name, username, lastName, password, repeatPassword, email, profession, country } = req.body;
  switch (true) {
    case username === '':
      res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries, errorMessage: `The username cannot be blank.` });
      break;

    case !regexPassword.test(password):
      res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries, errorMessage: `password too weak.` });
      break;

    case !regexEmail.test(req.body.email):
      res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries, errorMessage: `Please provide a vailid e-mail.` });
      break;

    case password === '':
      console.log('password must be filled');
      res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries, errorMessage: `The password cannot be blank .` });
      break;

    case password !== repeatPassword:
      res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries, errorMessage: `passwords do not match.` });
      break;

    default:
      try {
        let user = await User.findOne({ username });
        if (user) {
          res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries });
          return;
        }
        user = await User.findOne({ email });

        if (user) {
          res.render('auth/signup', { profession: arrayProfession, countries: arrayCountries });
          return;
        }

        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);
        user = await User.create({ username, name, lastName, password: hashPass, email, profession, country });
        User.find({ _id: { $ne: user._id } })
          .then((resp) => {
            console.log()
            if (resp.length === 0) {
              req.session.currentUser = user;
              res.redirect('/private/wall')
            } else {
              resp.forEach(userActual => {
                let chatarray = []
                let random = Math.floor(Math.random() * 1000000000000000000)
                User.findByIdAndUpdate(userActual._id, { $push: { chat: { user: user.id, name: user.name, chatId: random } } }, { new: true })
                  .then((resp) => {
                    chatarray.push({ user: resp.id, name: resp.name, chatId: random })
                    User.findByIdAndUpdate(user._id, { $push: { chat: chatarray } })
                      .then(() => {
                        req.session.currentUser = user;
                        res.redirect('/private/wall')
                      })
                  }
                  )
              });
            }

          }

          )


      } catch (e) {
        console.error(e);
        next(e);
      }
  }
});


router.post('/logout', (req, res) => {
  req.session.currentUser = null;
  res.redirect('/');
});




module.exports = router;
