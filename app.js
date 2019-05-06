var express                 = require('express'),
    app                     = express(),
    cons                    = require('consolidate'),
    path                    = require('path'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    bodyParser              = require('body-parser'),
    User                    = require('./models/user'),
    LocalStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true });

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(require('express-session')({
    secret: 'Rusty is the best',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + '/public'));
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('signin');
});

app.get('/index', function(req, res) {
    res.render('index');
});
// Handling user sign up-signin=register
app.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.register(new User({username}), password, function(err, user){
        if(err) {
            console.log(err);
            return res.render('signin');
        }
        passport.authenticate('local')(req, res, function() {
            res.redirect('index');
        });
    });
});

// app.get('/register', function(req, res) {
//     res.render('register');
// });
app.listen(3000, process.env.ip, function() {
    console.log(`Process is litesning to http://localhost:3000`);
});