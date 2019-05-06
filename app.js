var express = require('express'),
    app     = express(),
    cons    = require('consolidate'),
    path    = require('path');


app.use(express.static(__dirname + '/public'));
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index');
});
app.get('/signin', function(req, res) {
    res.render('');
});
app.listen(3000, process.env.ip, function() {
    console.log(`Process is litesning to http://localhost:3000`);
});