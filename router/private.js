const express = require('express');
const router = express.Router();
const Record = require('../models/record');
const User = require('../models/user');
const arrayCountries = require('../bin/countrie');
const arrayProfession = require('../bin/profession');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const bcryptSalt = 10;
const path = require('path');
const routeAvatarPictures = '../images/profileimages/';
const multer = require('multer');
const mongoose = require('mongoose');


const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './public/images/profileimages');
	},
	filename: function (req, file, callback) {
		callback(null, 'AvatarImage' + Date.now() + path.extname(file.originalname));
	}
});

var upload = multer({ storage: storage }).single('pictureOfUser');


/* GET home page */
router.get('/', (req, res, next) => {
	res.render('./record/index');
});

router.get('/wall', (req, res) => {
	Record.find({ public: true }).populate('owner').sort({ createdAt: -1 })
		.then((result) => {
			res.render('./private/wall', { result, user: req.session.currentUser, image: true, wall: false, chat: true });
		})
		.catch(error => {
			console.error('Error while publishing your comment', error);
		})
});


router.get('/profile', async (req, res) => {
	let user = await User.findById(req.session.currentUser._id);
	let record = await Record.find({ owner: req.session.currentUser._id }).populate('owner').sort({ createdAt: -1 });
	res.render('private/profile', { user, record, wall: true, logout: true, edit: true });
});

router.get('/profile/:id', async (req, res) => {
	if (req.params.id === req.session.currentUser._id) {
		res.redirect('/private/profile');
	} else {
		let user = await User.findById(req.params.id);
		let record = await Record.find({ owner: user._id, public: true }).populate('owner').sort({ createdAt: -1 });
		res.render('private/profile', { user, record, wall: true, logout: true, edit: false });
	}
});

router.get('/add-comment', (req, res) => {
	res.render('private/add-comment');
});


router.post('/add-comment', (req, res, next) => {

	if (req.body.rating === '') {
		res.render('private/add-comment', { errorMessage: 'Please, rate your day' });
		return;
	}
	if (req.body.text === '') {
		res.render('private/add-comment', { errorMessage: 'Please, write a positive statement' });
		return;
	}
	let public = true;
	if (req.body.public !== 'public') {
		public = false;
	}

	const record = {
		text: req.body.text,
		owner: req.session.currentUser._id,
		rate: req.body.rating,
		public
	};
	Record.create(record)
		.then(() => {
			res.redirect('./wall');
		})
		.catch(() => res.render('private/add-comment', { errorMessage: 'Ops. Something went wrong with your publications. Try again' }))
});


router.get('/record/like/:id', async (req, res, next) => {
	const currentusernamechat = req.session.currentUser._id;
	const recordId = req.params.id;
	const record = await Record.findById(recordId);
	if (!record.like.includes(currentusernamechat)) {
		record.like.push(currentusernamechat);
		await record.save();
	}
	res.redirect('/private/wall');
});

router.get('/edit', (req, res, next) => {
	User.findById(req.session.currentUser._id).then(response => {
		let { username, _id, name, lastName, password: hashPass, email, profession, country, pictureOfUser, birthday } = response;
		stringBirthday = new Date(birthday);
		stringBirthday = stringBirthday.getFullYear().toString() + '-' + (stringBirthday.getMonth() + 1).toString().padStart(2, 0) + '-' + stringBirthday.getDate().toString().padStart(2, 0);
		let objectProfession = findSelectedInArray(arrayProfession, profession);
		let objectCountries = findSelectedInArray(arrayCountries, country);
		res.render('private/edituser', {
			_id,
			job: objectProfession,
			countries: objectCountries,
			username,
			name,
			lastName,
			password: hashPass,
			email,
			profession,
			country,
			pictureOfUser,
			stringBirthday,
			user: req.session.currentUser,
			image: true
		});
	})

});


router.post('/uploadAvatar', (req, res, next) => {
	//upload picture
	upload(req, res, function (err) {
		if (err) {
			return request.end('Error uploading file.');
		}

		let actualPictureName;
		User.findById(req.session.currentUser._id)
			.then(response => {
				actualPictureName = response.pictureOfUser
				User.findByIdAndUpdate(req.session.currentUser._id, { pictureOfUser: req.file.filename }, { new: true })
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


});
router.post('/edit', (req, res, next) => {

	User.findById(req.session.currentUser._id).then(response => {

		let { username, name, lastName, password, repeatPassword, profession, country, birthday } = req.body;
		if (username !== '') {
			response.username = username;
		}
		if (name !== '') {
			response.name = name;
		}
		if (lastName !== '') {

			response.lastName = lastName;
		}
		response.profession = profession;
		response.country = country;
		response.birthday = new Date(birthday);
		if (password !== '' && repeatPassword === password && regexPassword.test(password)) {
			const salt = bcrypt.genSaltSync(bcryptSalt);
			response.password = bcrypt.hashSync(password, salt);
		} else {
			if (password !== '') {
				console.log('fallo al cambiar el password');
				res.render('auth/edituser', response);
			}
		}
		User.findByIdAndUpdate(req.session.currentUser._id, response)
			.then((respuesta) => {
				req.session.currentUser = respuesta;
				console.log('User updated');
				res.redirect('/private/edit')
			})
	})
});


function findSelectedInArray(array, selection) {
	let arrayObjects = [];
	array.map(function (element) {
		if (element === selection) {
			arrayObjects.push({ element: element, status: true })
		} else {
			arrayObjects.push({ element: element, status: '' })
		}
	});
	return arrayObjects
}

router.get('/likes/:id', (req, res) => {
	Record.findById(req.params.id).populate('like').sort({ createdAt: -1 })
		.then((result) => {
			result = result.like;
			res.render('./private/likes', { result, user: req.session.currentUser, image: false, wall: true });
		})
		.catch(error => {
			console.error('Error while seeing likes', error);
		})
});

router.get('/delete', (req, res) => {
	User.findById(req.session.currentUser._id)

		.then(result => {
			res.render('private/deleteaccount', { result })
		})
});


router.post('/confirmdelete', async (req, res, next) => {
	if (req.body.username === req.session.currentUser.username) {
		let records = await Record.deleteMany({ owner: req.session.currentUser._id });
		let user = await User.deleteOne({ _id: req.session.currentUser._id });
		req.session.destroy();
		console.log(records, user);
		res.render('private/deleted');


	} else {
		User.findById(req.session.currentUser._id)
			.then(result => {
				res.render('private/deleteaccount', { result, errorMessage: 'confirm username not valid' }
				)
			})
	}
});


router.get('/edit', (req, res) => {
	res.render('private/edit')
});

module.exports = router;

