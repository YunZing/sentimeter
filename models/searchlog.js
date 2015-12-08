/**
 * Created by Y on 2015-11-21.
 */
var ObjectId = require('mongodb').ObjectId;
var dbcon = require("../dbcon");


exports.set_log_by_word = function (word, callback) {
    var db = dbcon.getDb();
    db.collection('log').insertOne({
            "word": word,
            "updated": new Date()
        },
        function (err, result) {
            callback(undefined);
        });
}

exports.get_log = function (callback) {
    //TODO: 3시간 내의 검색 결과에서 count 계산
    //var db = dbcon.getDb();
    //db.collection('search').find().sort({count: -1}).toArray(
    //    function (err, docs) {
    //        callback(err, docs);
    //    });
};

exports.set_search_by_word = function (word, callback) {
    var db = dbcon.getDb();
    var href = "http://localhost:3000/view?keyword=" + word;
    db.collection('search').updateOne(
        {"word": word},
        {
            $set: {
                "word": word,
                "updated": new Date(),
                "url": href
            }
            , $inc: { "count":1 }
        }, {upsert: true},
        function (err, result) {
            callback(undefined, result);
        });
}

exports.get_search = function (callback) {
    var db = dbcon.getDb();
    db.collection('search').find().sort({count: -1}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
};