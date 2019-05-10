var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;


var LocationSchema = new mongoose.Schema({
    name: String,
    parent: ObjectId, // parent id
    type: String, // folder || file
    subLocationId: ObjectId
});


module.exports = mongoose.model('Location', LocationSchema);