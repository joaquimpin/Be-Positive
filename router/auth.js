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

//falta exportar els errors al frontend ara simplement pinta per terminal el error! pero volia saver com ho fem primer, si fem errors a cada input text o fem un general a sota/sobre

router.post('/signup', async (req, res, next) => {
  const { name, username, lastName, password, repeatPassword, email, profession, country } = req.body;
  switch (true) {
    case username === '':
      res.render('auth/signup', {
        errorMessage: `The username cannot be blank .`
      });
      break;

    case !regexPassword.test(password):
      res.render('auth/signup', {
        errorMessage: `password too weak .`
      });
      break;

    case !regexEmail.test(req.body.email):
      res.render('auth/signup', {
        errorMessage: `Please provide a vailid e-mail.`
      });
      break;

    case password === '':
      console.log('password must be filled');
      res.render('auth/signup', {
        errorMessage: `The password cannot be blank .`
      });
      break;

    case password !== repeatPassword:
      res.render('auth/signup', {
        errorMessage: `passwords do not match.`
      });
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
        req.session.currentUser = user;
        res.redirect('/private/wall');
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
