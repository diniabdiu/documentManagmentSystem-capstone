var express                 = require('express'),
    app                     = express(),
    path                    = require('path'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    bodyParser              = require('body-parser'),
    User                    = require('./models/user'),
    LocalStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true });

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true}));

app.use(require('express-session')({
    secret: 'Rusty is the best',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', function(req, res) {
    res.render('signup');
});
app.get('/index',isLoggedIn, function(req, res) {
    res.render('index');
});
// Show signup form
app.get('/signup', function(req, res) {
    res.render('signup');
});
// Handling user sign 
app.post('/signup', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.register(new User({username}), password, function(err, user){
        if(err) {
            console.log(err);
            return res.render('signup');
        }
        passport.authenticate('local')(req, res, function() {
            res.redirect('/index');
        });
    });
});

// Login routes
// Render login form
app.get('/login', function(req, res) {
    console.log('login route!');
    
    if(req.user) {
        res.redirect('/index');
    } else {
        res.render('login');
    }
});
// Login logic
app.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/index',
        failureRedirect: '/login'
    }), function(req, res) {
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(3000, process.env.ip, function() {
    console.log(`Process is litesning to http://localhost:3000`);
});