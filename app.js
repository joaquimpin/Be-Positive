//require's
require('dotenv').config();

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require("express")
const favicon = require("serve-favicon")
const hbs = require("hbs")
const mongoose = require("mongoose")
const logger = require("morgan")
const path = require("path")
const db = "BePossitive"


//init mongoose DB
mongoose
    .connect(`mongodb://localhost/${db}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch(err => {
        console.error('Error connecting to mongo', err)
    });


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.locals.title ="Be Positive"

const indexRouter = require (".routes/index")
const authRouter = require(".routes/auth")
const recordRouter = require(".router/records")

app.use('/',indexRouter);
app.use('/auth',authRouter);
app.use('records',recordRouter);

module.exports = app