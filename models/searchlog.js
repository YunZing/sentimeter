/**
 * Created by Y on 2015-11-21.
 */
var ObjectId = require('mongodb').ObjectId;
var dbcon = require("../dbcon");


exports.set_log_by_word = function (word, callback) {
    var db = dbcon.getDb();
    db.collection('log').insertOne({
            "word": word,
            "date": new Date()
        },
        function (err, result) {
            callback(undefined);
        });
}

exports.get_log = function (condition, callback) {
    var db = dbcon.getDb();

    db.collection('log').aggregate(
        [
            {$match : {"date": { "$gt": condition}}},
            {$group: {"_id": "$word", "count": {$sum:1}}}
        ]
    ).sort({count: -1}).toArray(function(err, result) {
            callback(err, result);
        });
};