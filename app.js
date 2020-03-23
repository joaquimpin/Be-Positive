//require's
require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const hbs = require('hbs');
const hbsIntl = require('handlebars-intl');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const db = 'BePositive';
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

//hbs-register helpers

hbsIntl.registerWith(hbs);


//init mongoose DB
mongoose
	.connect(`mongodb://localhost/${db}`, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(x => {
		console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
	})
	.catch(err => {
		console.error('Error connecting to mongo', err)
	});


mongoose.set('useFindAndModify', false);

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//partials
hbs.registerPartials(__dirname + '/views/partials');


// Express View engine setup

app.use(require('node-sass-middleware')({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
	secret: 'Be-Positive',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60000 * 3000 },
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 24 * 60 * 60 // 1 day
	})
}));

app.locals.title = 'Be Positive';

const indexRouter = require('./router/index.js');
const authRouter = require('./router/auth.js');
app.use('/', indexRouter);
app.use('/auth', authRouter);


app.use((req, res, next) => {
	if (req.session.currentUser) {
		next();
	} else {
		res.redirect('/');
	}
});


const privateRouter = require('./router/private.js');
app.use('/private', privateRouter);



module.exports = app;