var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/Senti_Meter';
var db;
exports.connect = function (callback) {
    MongoClient.connect(url, function(err, _db) {
        console.log("connect!!!!")
        db = _db;
    });
}

exports.getDb = function () {
    if (!db) {
        exports.connect();
    }
    return db;
}