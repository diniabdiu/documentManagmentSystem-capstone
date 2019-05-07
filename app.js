var express                 = require('express'),
    app                     = express(),
    path                    = require('path'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    bodyParser              = require('body-parser'),
    User                    = require('./models/user'),
    LocalStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    upload                  = require('express-fileupload')


mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true });

var app = express();

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(upload());

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

// // SET STORAGE
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now())
//     }
//   })
   
//   var upload = multer({ storage: storage })
// // Upload file 
// app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//       const error = new Error('Please upload a file')
//       error.httpStatusCode = 400
//       return next(error)
//     }
//       res.send(file)
    
// });
app.post('/index', function(req, res) {
    if(req.files) {
        var file = req.files.filename,
            filename = file.name;
            file.mv('./upload/' + filename, function(err) {
                if(err) {
                    console.log(err)
                    res.send('error occured');
                } else {
                    res.send('Done !');
                }
            });
    }
});
var newFile = fs.writeFileSync('satish.html', html);

app.listen(3000, process.env.ip, function() {
    console.log(`Process is litesning to http://localhost:3000`);
});