var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var DocFileSchema = mongoose.Schema({
    locationId: ObjectId,
    path: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true
    }
}, {versionKey: false});

var DocumentFile = module.exports = mongoose.model('DocumentFile', DocFileSchema);

module.exports.getDocs = function (callback) {
    DocumentFile.find(callback);
}

module.exports.getDocByLocationId = function(id, callback) {
    DocumentFile.findById(id, callback);
}

module.exports.addDoc = function(doc, callback) {
    DocumentFile.create(doc, callback);
}
