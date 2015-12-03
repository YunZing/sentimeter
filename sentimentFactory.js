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
//keyword�� ���Ե� doc array ��������
setInterval( function() {
    //qkdrnqjtjt tjdgus123
    //ryuenuse
    //breaksung a123dc
    var api_key = ["qkdrnqjtjt20151014201843", "ryuenuse20151016185510", "breaksung20151203205351"];
    if(count > 400) {
        index = (index + 1) % 3;
        count = 0;
    }
    model_sns.get_sns_list(function (err, docs) {
        if (docs == undefined || docs.length == 0) {
            return;
        }
        //�� �ϳ����� ����
        docs.forEach(function (doc) {
            async.parallel({
                //��, ��翡 ���ؼ� ����
                word: function (callback_second) {
                    var sent = 0;
                    var nv;
                    if (doc.Verb == null || doc.Verb == "[]") {
                        callback_second(null, "����");
                    } else {
                        nv = doc.Verb;
                        var Num = nv.length;
                        var Count = 0;
                        nv.forEach(function (word) {
                            //��,��縦 collection���� �˻�
                            model_senti.get_sentiment_by_word(word.word, function (err, sentiData) {
                                if (err) {
                                    console.error(err);
                                }
                                async.waterfall([
                                    function (callback_third) {
                                        var isNeg = word.isNeg;
                                        //��.��� ���� ��� api���� �˻�
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
                                        //���� ��� ������ ���
                                        else {
                                            callback_third(null, sentiData, isNeg);
                                        }
                                    },
                                    //�� word�� ���� ����, ���� ��� ���ϱ�
                                    function (sentiData, isNeg, callback_third) {
                                        if (sentiData[0].sentiment == "����" && isNeg == "false") {
                                            sent += 1;
                                        } else if (sentiData[0].sentiment == "����" && isNeg == "true") {
                                            sent += 1;
                                        } else if (sentiData[0].sentiment == "����" && isNeg == "true") {
                                            sent -= 1;
                                        } else if (sentiData[0].sentiment == "����" && isNeg == "false") {
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
                                            sentiment = "����";
                                        } else if (result < 0) {
                                            sentiment = "����";
                                        } else {
                                            sentiment = "�߸�";
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
                    console.log("update �Ϸ�=========================================================")
                    console.log(doc.Text);
                    console.log(result.word);
                })
            })
        })
    })
}, 60 * 1000);