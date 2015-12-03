/**
 * Created by Y on 2015-11-23.
 */
var ObjectId = require('mongodb').ObjectId;
var request = require('sync-request');
var dbcon = require("../dbcon");
var urlencode = require('urlencode');

//sentimentFactory���� ���
//db�� sentiment������ �ִ��� Ȯ��
exports.get_sentiment_by_word = function (word, callback) {
    var db = dbcon.getDb();

    db.collection('sentiment').find({"word": word}, {'_id' : 0, 'type' : 0}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
}

//sentimentFactory���� ���
//sentiment������ �������� ���� request����
//response�� �����Ͱ� ������� sentiment�� ����
//�����Ͱ� ������� ���� �״�� ����
exports.get_sentiment_from_api_and_save = function (api_key, word, callback) {
    var db = dbcon.getDb();

    var url = 'http://api.openhangul.com/dic-hold?api_key=' + api_key + '&q=' + urlencode(word);
    var res = request('GET', url);
    var body = res.getBody('utf8');

    if (body === undefined) {
        return callback(new Error("body is undefined"));
    }
    if (body.trim() === "") {
        console.log(word + "������ �������");
        console.log(body);
        //trim()�� body�� �յ� ������ ��� ����;
        /*return callback(new Error("no data"));*/
        db.collection('sentiment').updateOne(
            {"word": word},
            {
                $set: {
                    "word": word,
                    "type": "noType",
                    "sentiment": "����",
                    "sentiment_score": "0%"
                }
            }, {upsert: true},
            function (err, result) {
                var apiSentiData = new Array({});
                apiSentiData[0].word = word;
                apiSentiData[0].sentiment = "����";
                apiSentiData[0].sentiment_score = "0%";

                callback(undefined, apiSentiData, result);
            });
        //return callback(undefined, apiSentiData);
    }
    else {
        var jsonbody = JSON.parse(body);
        console.log("������ �������");
        console.log(jsonbody);
        if (jsonbody.error == undefined) {
            db.collection('sentiment').insertOne({
                    "word": jsonbody.word,
                    "type": jsonbody.type,
                    "sentiment": jsonbody.sentiment,
                    "sentiment_score": jsonbody.sentiment_score
                },
                function (err, result) {
                    var apiSentiData = new Array({});
                    apiSentiData[0].word = jsonbody.word;
                    apiSentiData[0].sentiment = jsonbody.sentiment;
                    apiSentiData[0].sentiment_score = jsonbody.sentiment_score;

                    callback(undefined, apiSentiData, result);
                });
        }
        else {
            console.log("������ ��� �ʰ�" + word);
        }
    }
}