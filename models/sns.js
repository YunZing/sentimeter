/**
 * Created by Y on 2015-11-21.
 */
var ObjectId = require('mongodb').ObjectId;
var dbcon = require("../dbcon");


//controller에서 사용
//Noun에 word가 포함되고, 감정 분석을 끝낸(sentiment가 null이 아닌) snsData만 전송
exports.get_sns_list_by_word = function (word, callback) {
    var db = dbcon.getDb();
    if(word == undefined || word == "") {
        db.collection('SNS_Data').find({"sentiment":{"$ne" : null}}).toArray(
            function (err, docs) {
                callback(err, docs);
            });
    }
    else {
        //{$regex : ".*"+word+".*", $not : /^RT @/}
        db.collection('SNS_Data').find({"Text":{$regex : ".*"+word+".*", $not : /^RT @/}, "sentiment":{"$ne" : null}}, {}).sort({"Time":-1}).toArray(
            function (err, docs) {
                callback(err, docs);
            });
    }
};


//controller에서 사용
//Noun에 word가 포함되고, 감정 분석을 끝낸(sentiment가 null이 아닌) snsData만 전송
exports.get_sns_list_by_word_and_date = function (word, strdate, callback) {
    var db = dbcon.getDb();
    db.collection('SNS_Data').find({"Text":{$regex : ".*"+word+".*", $not : /^RT @/}, "Time":{$regex: ".*"+strdate} , "sentiment":{"$ne" : null}}, {}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
};


//sentimentFactory에서 사용
//sentiment가 null인 snsData(아직 감성분석을 하지 않은 데이터)만 전송
exports.get_sns_list = function (callback) {
    var db = dbcon.getDb();
    db.collection('SNS_Data').find({"sentiment" : null}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
};


//sentimentFactory에서 사용
//감성분석을 하고 해당 sentiment 정보를 저장
exports.update_sns_list_sentiment = function (sentiment, _id, callback) {
    var db = dbcon.getDb();
    db.collection('SNS_Data').updateOne(
        {"_id": _id},
        {$set: {"sentiment": sentiment}},
        function (err, result) {
            callback(err, result);
        });
};