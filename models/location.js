var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


var LocationSchema = new mongoose.Schema({
    name: String,
    subLocationId: ObjectId
});


module.exports = mongoose.model('Location', LocationSchema);