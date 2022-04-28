const express = require('express');
const app = express();
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser')
const passport = require('passport');

// passport config:
require('./config/passport')(passport)

const port = 8080;

app.set('view engine', 'ejs');   // use ejs as the view engine
app.use(express.json());         // access body using req.body
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// middleware to use static files
app.use('/assets', express.static('assets'));

// connect to the database
const start_client = require('./models/db').start_client
start_client();

// listen on port 8080
app.listen(port, () => {
    console.log("Server listening on port " + port);
    console.log('Your server is available at http://localhost:8080');
});

// express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());

// use flash
app.use(flash());

app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    next();
});

const {ensureAuthenticated} = require("./config/auth.js")

app.get('/', (req, res) => {
    res.render('login');
});

// login, register and logout
app.use('/users', require('./routes/users'));

// homepage
app.use('/dashboard', ensureAuthenticated, require('./routes/home'))

// course
app.use('/course', ensureAuthenticated, require('./routes/course'))

// chapter
app.use('/chapter', ensureAuthenticated, require('./routes/chapter'))