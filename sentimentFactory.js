/**
 * Created by Y on 2015-12-03.
 */
var async = require('async');
var model_sns = require('./models/sns.js');
var model_senti = require('./models/sentiment.js');
var controller_senti = require('./controllers/sentiment.js');
require("./dbcon").connect();

var apiInfo = {
    "index": 1,
    "count": 0
};
//sentiment analysis code
//keyword가 포함된 doc array 가져오기
setInterval(function () {
    //qkdrnqjtjt tjdgus123
    //ryuenuse
    //breaksung a123dc
    //castlebin12 zoqtmxhs12
    if (apiInfo.count > 980) {
        apiInfo.index = (apiInfo.index + 1) % 3;
        apiInfo.count = 0;
    }
    var c = 0;
    model_sns.get_sns_list(function (err, docs) {
        if (docs == undefined || docs.length == 0) {
            return;
        }
        //글 하나마다 실행
        docs.forEach(function (doc) {

            controller_senti.analysis(doc, apiInfo, function (result) {

                model_sns.update_sns_list_sentiment(result.word, doc._id, function (err) {
                    c++;
                    console.log("update 완료=========================================================");
                    console.log(doc.Text);
                    console.log(result.word);
                    console.log(apiInfo.count + ' ' + c);
                })

            });

        })
    })
}, 10 * 1000);


