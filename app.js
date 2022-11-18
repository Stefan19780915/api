if (process.env.NODE_ENV !== 'production' ) {
	require('dotenv').config();
}

const express = require('express');
const mysql = require('mysql');
const path = require('path');
const { engine } = require('express-handlebars');
const { db } = require('./db');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const localStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const { Posts } = require('./posts');
const { Users } = require('./users');
const { Profile } = require('./profile');
const { Admin } = require('./admin');

const app = express();

//SESSION AND FLASH
app.use(flash());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

//BODY PARSER Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//HANDLEBARS Middleware
app.engine('handlebars', engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//CHECK ADMIN Middleware
function checkAdmin(req, res, next){
		//console.log(req.user[0].name);
		next();
	}

//CHECK AUTH Middleware
function checkAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/api/login');
}

//CHECK NOT AUTH Middleware
function checkNotAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return res.redirect('/api/user');
	}
	next();
}

//API ROUTES
const posts = new Posts(app, db, checkAuthenticated, checkAdmin);
posts.myFunc();

const users = new Users(app, db, bcrypt, passport, localStrategy, checkAuthenticated, checkNotAuthenticated, checkAdmin);
users.myFunc();

const profile = new Profile(app, db, bcrypt, checkAuthenticated, checkAdmin);
profile.myFunc();

const admin = new Admin(app, db, checkAuthenticated, checkAdmin);
admin.myFunc();

// LISTENING ON PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
	console.log(`Server started on port ${PORT}`);
});


