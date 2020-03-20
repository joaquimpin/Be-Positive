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
	const {email, password} = req.body;

	if (email === '' || password === '') {
		res.render('auth/signin', {
			errorMessage: 'Enter both email and password to log in.'
		});
		return;
	}
	User.findOne({email}, (err, user) => {
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
	res.render('auth/signup', {profession: arrayProfession, countries: arrayCountries});
});

//falta exportar els errors al frontend ara simplement pinta per terminal el error! pero volia saver com ho fem primer, si fem errors a cada input text o fem un general a sota/sobre

router.post('/signup', async (req, res, next) => {
	const {name, username, lastName, password, repeatPassword, email, profession, country} = req.body;
	switch (true) {
		case password === '':
			console.log('password must be filled');
			break;

		case username === '':
			console.log(' username must be filled');
			break;

		case password !== repeatPassword:
			console.log('password and verify password are not the same');
			break;

		case !regexPassword.test(password):
			console.log('password to weak');
			break;

		case !regexEmail.test(req.body.email):
			console.log('Email not valid');
			break;


		default:
			try {
				let user = await User.findOne({username});
				if (user) {
					res.render('auth/signup', {profession: arrayProfession, countries: arrayCountries});
					return;
				}
				user = await User.findOne({email});

				if (user) {
					res.render('auth/signup', {profession: arrayProfession, countries: arrayCountries});
					return;
				}

				const salt = bcrypt.genSaltSync(bcryptSalt);
				const hashPass = bcrypt.hashSync(password, salt);

				user = await User.create({username, name, lastName, password: hashPass, email, profession, country});
				req.session.currentUser = user;
				res.render('private/wall', user);
			} catch (e) {
				console.error(e);
				next(e);
			}
	}
});

router.get('/edit', (req, res, next) => {
  console.log(req.session.currentUser)
  let { username, name, lastName, password: hashPass, email, profession, country, pictureOfUser, birthday } = req.session.currentUser
  stringBirthday = new Date(birthday)
  stringBirthday = stringBirthday.getFullYear().toString() + '-' + (stringBirthday.getMonth() + 1).toString().padStart(2, 0) + '-' + stringBirthday.getDate().toString().padStart(2, 0)
  let objectProfession = findSelectedInArray(arrayProfession, profession)
  let objectCountries = findSelectedInArray(arrayCountries, country)
  res.render('auth/edituser', { job: objectProfession, countries: objectCountries, username, name, lastName, password: hashPass, email, profession, country, pictureOfUser, stringBirthday })
});

router.post('/edit', (req, res, next) => {

});







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
