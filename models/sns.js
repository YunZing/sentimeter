/**
 * Created by Y on 2015-11-21.
 */
var ObjectId = require('mongodb').ObjectId;
var dbcon = require("../dbcon");


//controller���� ���
//Noun�� word�� ���Եǰ�, ���� �м��� ����(sentiment�� null�� �ƴ�) snsData�� ����
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
        db.collection('SNS_Data').find({"Text":{$regex : ".*"+word+".*", $not : /^RT @/}, "sentiment":{"$ne" : null}}, {}).toArray(
            function (err, docs) {
                callback(err, docs);
            });
    }
};

//sentimentFactory���� ���
//sentiment�� null�� snsData(���� �����м��� ���� ���� ������)�� ����
exports.get_sns_list = function (callback) {
    var db = dbcon.getDb();
    db.collection('SNS_Data').find({"sentiment" : null}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
};


//sentimentFactory���� ���
//�����м��� �ϰ� �ش� sentiment ������ ����
exports.update_sns_list_sentiment = function (sentiment, _id, callback) {
    var db = dbcon.getDb();
    db.collection('SNS_Data').updateOne(
        {"_id": _id},
        {$set: {"sentiment": sentiment}},
        function (err, result) {
            callback(err, result);
        });
};