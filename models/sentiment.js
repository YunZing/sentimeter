/**
 * Created by Y on 2015-11-23.
 */
var ObjectId = require('mongodb').ObjectId;
var request = require('sync-request');
var dbcon = require("../dbcon");
var urlencode = require('urlencode');

//sentimentFactory에서 사용
//db에 sentiment정보가 있는지 확인
exports.get_sentiment_by_word = function (word, callback) {
    var db = dbcon.getDb();

    db.collection('sentiment').find({"word": word}, {'_id' : 0, 'type' : 0}).toArray(
        function (err, docs) {
            callback(err, docs);
        });
}

//sentimentFactory에서 사용
//sentiment정보를 가져오기 위해 request전송
//response에 데이터가 없을경우 sentiment에 없음
//데이터가 있을경우 정보 그대로 저장
exports.get_sentiment_from_api_and_save = function (api_key, word, callback) {
    var db = dbcon.getDb();

    var url = 'http://api.openhangul.com/dic-hold?api_key=' + api_key + '&q=' + urlencode(word);
    var res = request('GET', url);
    var body = res.getBody('utf8');

    if (body === undefined) {
        return callback(new Error("body is undefined"));
    }
    if (body.trim() === "") {
        console.log(word + "데이터 없을경우");
        console.log(body);
        //trim()은 body의 앞뒤 공백을 모두 제거;
        /*return callback(new Error("no data"));*/
        db.collection('sentiment').updateOne(
            {"word": word},
            {
                $set: {
                    "word": word,
                    "type": "noType",
                    "sentiment": "없음",
                    "sentiment_score": "0%"
                }
            }, {upsert: true},
            function (err, result) {
                var apiSentiData = new Array({});
                apiSentiData[0].word = word;
                apiSentiData[0].sentiment = "없음";
                apiSentiData[0].sentiment_score = "0%";

                callback(undefined, apiSentiData, result);
            });
        //return callback(undefined, apiSentiData);
    }
    else {
        var jsonbody = JSON.parse(body);
        console.log("데이터 있을경우");
        console.log(jsonbody);
        jsonbody.sentiment_score = (parseFloat((jsonbody.sentiment_score).split("%")[0]) / 2).toString() + "%";

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
            console.log("데이터 사용 초과" + word);
        }
    }
}