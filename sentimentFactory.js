/**
 * Created by Y on 2015-12-03.
 */
var async = require('async');
var model_sns = require('./models/sns.js');
var model_senti = require('./models/sentiment.js');
var MongoClient = require('mongodb').MongoClient;
require("./dbcon").connect();

var index = 2;
var count = 0;
//sentiment analysis code
//keyword가 포함된 doc array 가져오기
setInterval( function() {
    //qkdrnqjtjt tjdgus123
    //ryuenuse
    //breaksung a123dc
    //castlebin12 zoqtmxhs12
    var api_key = ["qkdrnqjtjt20151014201843", "ryuenuse20151016185510", "breaksung20151203205351", "castlebin1220151203231034"];
    if(count > 980) {
        index = (index + 1) % 4;
        count = 0;
    }
    model_sns.get_sns_list(function (err, docs) {
        if (docs == undefined || docs.length == 0) {
            return;
        }
        //글 하나마다 실행
        docs.forEach(function (doc) {
            async.parallel({
                //동, 명사에 대해서 수행
                word: function (callback_second) {
                    var sent = 0;
                    var nv;
                    if (doc.Verb == null || doc.Verb == "[]") {
                        callback_second(null, "없음");
                    } else {
                        nv = doc.Verb;
                        var Num = nv.length;
                        var Count = 0;
                        nv.forEach(function (word) {
                            //동,명사를 collection에서 검색
                            model_senti.get_sentiment_by_word(word.word, function (err, sentiData) {
                                if (err) {
                                    console.error(err);
                                }
                                async.waterfall([
                                    function (callback_third) {
                                        var isNeg = word.isNeg;
                                        //동.명사 없을 경우 api에서 검색
                                        if (!sentiData[0]) {
                                            count++;
                                            model_senti.get_sentiment_from_api_and_save(api_key[index], word.word, function (err, apiSentiData) {
                                                if (err) {
                                                    return;
                                                }
                                                sentiData = apiSentiData;
                                                callback_third(null, sentiData, isNeg);
                                            });
                                        }
                                        //있을 경우 데이터 사용
                                        else {
                                            callback_third(null, sentiData, isNeg);
                                        }
                                    },
                                    //한 word에 대한 긍정, 부정 결과 더하기
                                    function (sentiData, isNeg, callback_third) {
                                        if (sentiData[0].sentiment == "긍정" && isNeg == "false") {
                                            sent += 1;
                                        } else if (sentiData[0].sentiment == "부정" && isNeg == "true") {
                                            sent += 1;
                                        } else if (sentiData[0].sentiment == "긍정" && isNeg == "true") {
                                            sent -= 1;
                                        } else if (sentiData[0].sentiment == "부정" && isNeg == "false") {
                                            sent -= 1;
                                        } else {
                                            sent += 0;
                                        }
                                        callback_third(null, sent);
                                    }
                                ], function (err, result) {
                                    Count++;
                                    if (Count == Num) {
                                        var sentiment;
                                        if (result > 0) {
                                            sentiment = "긍정";
                                        } else if (result < 0) {
                                            sentiment = "부정";
                                        } else {
                                            sentiment = "중립";
                                        }
                                        callback_second(null, sentiment);

                                    }
                                })
                            })
                        })
                    }
                }
            }, function (err, result) {
                model_sns.update_sns_list_sentiment(result.word, doc._id, function (err) {
                    console.log("update 완료=========================================================")
                    console.log(doc.Text);
                    console.log(result.word);
                    console.log(count);
                })
            })
        })
    })
}, 60 * 1000);