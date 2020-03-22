const express = require('express');
const router = express.Router();
const arrayCountries = require('../bin/countrie');
const arrayProfession = require('../bin/profession');
const User = require('../models/user');
const regexPassword = new RegExp('.{3,}');
const regexEmail = new RegExp(`^[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$`);
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const bcryptSalt = 10;
const routeAvatarPictures = '../images/profileimages/';
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images/profileimages');
  },
  filename: function (req, file, callback) {

    callback(null, 'AvatarImage' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage }).single('pictureOfUser');



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
        errorMessage: 'Invalid password'
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
    case password === '':
      console.log('password must be filled');
      res.render('auth/signup', {
        errorMessage: `The password cannot be blank .`
      });
      break;

    case username === '':
      res.render('auth/signup', {
        errorMessage: `The username cannot be blank .`
      });
      break;

    case password !== repeatPassword:
      res.render('auth/signup', {
        errorMessage: `passwords do not match.`
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



router.get('/edit', (req, res, next) => {
  User.findById(req.session.currentUser._id).then(response => {
    let { username, name, lastName, password: hashPass, email, profession, country, pictureOfUser, birthday } = response
    stringBirthday = new Date(birthday);
    stringBirthday = stringBirthday.getFullYear().toString() + '-' + (stringBirthday.getMonth() + 1).toString().padStart(2, 0) + '-' + stringBirthday.getDate().toString().padStart(2, 0);
    let objectProfession = findSelectedInArray(arrayProfession, profession);
    let objectCountries = findSelectedInArray(arrayCountries, country);
    res.render('auth/edituser', { job: objectProfession, countries: objectCountries, username, name, lastName, password: hashPass, email, profession, country, pictureOfUser, stringBirthday });


  })

});


router.post('/uploadAvatar', (req, res, next) => {
  //upload picture
  upload(req, res, function (err) {
    if (err) {
      return request.end('Error uploading file.');
    }
    let actualPictureName;
    console.log(req.session.currentUser.email);
    User.findById(req.session.currentUser._id)
      .then(response => actualPictureName = response.pictureOfUser);
    User.findByIdAndUpdate(req.session.currentUser._id, { pictureOfUser: req.file.filename })
      .then((respuesta) => {
        if (actualPictureName !== 'default.png') {
          fs.unlinkSync(path.join(__dirname, '/../', '/public/images/profileimages/', actualPictureName));
        }
        req.session.currentUser = respuesta;
        res.redirect('edit');
      }
      )
  });


});
router.post('/edit', (req, res, next) => {

  User.findById(req.session.currentUser._id).then(response => {

    let { username, name, lastName, password, repeatPassword, profession, country, birthday } = req.body
    if (username != '') {
      response.username = username;
    }
    if (name != '') {
      response.name = name;
    }
    if (lastName != '') {

      response.lastName = lastName;
    }
    response.profession = profession;
    response.country = country;
    response.birthday = new Date(birthday);
    if (password != '' && repeatPassword === password && regexPassword.test(password)) {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      response.password = bcrypt.hashSync(password, salt);
    } else {
      if (password != '') {
        console.log('fallo al cambiar el password');
        res.render('auth/edituser', response);
      }
    }
    User.findByIdAndUpdate(req.session.currentUser._id, response)
      .then((respuesta) => {
        req.session.currentUser = respuesta
        console.log('User updated');
        res.redirect('/auth/edit')
      })
  })
})





function findSelectedInArray(array, selection) {
  let arrayObjects = []
  array.map(function (element) {
    if (element == selection) {
      arrayObjects.push({ element: element, status: true })
    } else {
      arrayObjects.push({ element: element, status: '' })
    }
  })
  return arrayObjects
}



module.exports = router;
