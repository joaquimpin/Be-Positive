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


router.get('/signup', (req, res, next) => {
  res.render('./auth/signup', { profession: arrayProfession, countrie: arrayCountries });
});

//falta exportar els errors al frontend ara simplement pinta per terminal el error! pero volia saver com ho fem primer, si fem errors a cada input text o fem un general a sota/sobre

router.post('/signup', (req, res, next) => {
  const { name, username, lastname, password, repeatpassword, email, profession, countrie } = req.body
  switch (true) {
    case password === '':
      console.log('password  must be filled');
      break;
      
    case username === '':
      console.log(' usuername must be filled');
      break;

    case password !== repeatpassword:
      console.log('password and verify password are not the same');
      break;

    case !regexPassword.test(password):
      console.log('password to weak');
      break;

    case !regexEmail.test(req.body.email):
      console.log('Email not valid');
      break;


    default:
      User.findOne({ username: username })
        .then(user => {
          if (user !== null) {
            console.log('el usuario ya existe');
            res.render('./auth/signup', { profession: arrayProfession, countrie: arrayCountries });
            return

          }
        })
      User.findOne({ email: email })
        .then(user => {
          if (user !== null) {
            console.log('el email ya esta registrado');
            res.render('./auth/signup', { profession: arrayProfession, countrie: arrayCountries });
            return;

          }
        })
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      User.create({ username, name, lastname, password: hashPass, email, profession, countrie })
        .then(userCreated => {
          console.log(userCreated);
          res.render('auth/private',userCreated);
          return
        })
        .catch(err => {
          console.log(err)
        })
  }
})




module.exports = router;
