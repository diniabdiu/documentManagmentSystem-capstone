var express                 = require('express'),
    session                 = require('express-session'),
    app                     = express(),
    path                    = require('path'),
    mongoose                = require('mongoose'),
    passport                = require('passport'),
    bodyParser              = require('body-parser'),
    User                    = require('./models/user'),
    LocalStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    upload                  = require('express-fileupload'),
    Location                = require('./models/location'),
    ObjectId                = mongoose.Types.ObjectId,
    multer                  = require('multer'),
    DocumentFile            = require('./models/documentfile');


mongoose.connect('mongodb://localhost/dms', { useNewUrlParser: true });

var app = express();

// save session between server restarts
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret:'secret',
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(
        {
            mongooseConnection: mongoose.connection
        }
    )        
}));

app.use(express.static(__dirname + '/public'));
app.use("/js", express.static(__dirname + '/node_modules'));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

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
    res.redirect('/login');
});
app.get('/index',isLoggedIn, function(req, res) {
    Location.find({}, function(err, locations) {
        if(err) return console.error(err);    
        res.render('index', {
            locations,
            parentId: null
        });  
    });
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
// check if user is logged in
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// // SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

// Upload file 
app.post('/upload', upload.single('file'), (req, res, next) => {

    // save into db
    var newDocFile = new DocumentFile({
        locationId: ObjectId(req.body.locationId),
        path: req.file.path,
        originalname: req.file.originalname
    });

    DocumentFile.addDoc(newDocFile, function(err, document) {
        if (err) {throw err};
        res.json({success: true, document: document})
    });
});

// app.post('/files/:locationId', function(req, res) {
//     if(req.files) {
//         var file = req.files.filename,
//             filename = file.name;
//             file.mv('./upload/' + filename, function(err) {
//                 if(err) {
//                     console.log(err)
//                     res.send('error occured');
//                 } else {
//                     res.send('Done !');
//                 }
//             });
//     }
// });
// var newFile = fs.writeFileSync('satish.html', html);


// app.post('/location', isLoggedIn, function(req, res) {
//     console.log(req.body);
//     var folderName = req.body.folderName;
//     if(folderName.length === 0) {
//         res.json({success: false});
//         return;
//     }
//     var location = new Location({name: folderName});
//     location.save(function (err, location) {
//         if (err) return console.error(err);
//         console.log(location.name + " saved to location collection.");
//         res.redirect('/index');
        
//       });
// });

app.get('/index/:id', function(req, res) {
    var objectId = ObjectId(req.params.id);
    Location.findOne({_id: objectId}, function(err, location) {
        if(err) return console.error(err);
        res.render('index', {
            location,
            parentId: req.params.id
        });
    });
});

// API ROUTES
// get folders
app.get('/api/folder', isLoggedIn, function(req,res){
    const locations = Location.find({}, function(err, locations) {
        if(err) return console.error(err);
        res.json(locations);
    });
});

// create folder
app.post('/api/folder', isLoggedIn, function(req,res){
    // get folder name from request
    const {
        folderName,
        type
    } = req.body;

    const parentId = req.body.parent || null;

    // if there is no folder name
    if(folderName.length === 0) {
        res.json({
                success: false,
                message: 'Please fill folder name!',
                data: null
        });
        return;
    }

    // if folder name exists
    Location.find({
        name: folderName,
    }, function(err, items) {
        if(err) {
            res.json({
                success: false,
                message: `Server error!`,
                data: null
            });
            return console.error(err);
        }
        
        // if folder with name exists return error
        if(items.length > 0) {
            res.json({
                success: false,
                message: `Folder with name ${folderName}, already exists!`,
                data: null,
            });
            return;
        } else {
            // if it does not exist
            // crate new folder and return success
            var location = new Location({
                name: folderName,
                type: type,
                parent: parentId
            });
            location.save(function (err, location) {
                if (err) return console.error(err);
                res.json({
                    success: true,
                    message: "Folder created successfully!",
                    data: location
                });
            });
        }
    });
});

// delete folder
app.delete('/api/folder', isLoggedIn, function(req,res){
    // get folder name from request
    var id = req.body.id;

    // if there is no folder name
    if(id.length === 0) {
        res.json({
                success: false,
                message: 'Plase add id!',
                data: null
        });
        return;
    }

    // remove item by od
    Location.find({ _id: id }).deleteMany((err) => {
        res.json({
            success: true,
            message: 'Succesfully removed!',
            data: null
        });
    }).exec();
});

// get files of specific folder
app.get('/api/folder/:id', function(req, res) {
    console.log('get files');
    DocumentFile.getDocByLocationId(ObjectId(req.params.id), (error, documents) => {
        if (error) {
            res.json({success: false, error: 'error in db'})
            return;
        }
        res.json({success: true, documents});
    })
});


app.listen(3000, process.env.ip, function() {
    console.log(`Process is litesning to http://localhost:3000`);
});