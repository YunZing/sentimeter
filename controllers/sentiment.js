/**
 * Created by euna on 2015. 12. 17..
 */

var async = require('async');
var model_sns = require('../models/sns.js');
var model_senti = require('../models/sentiment.js');


exports.analysis = function (doc, apiInfo, next) {
    var api_key = ["qkdrnqjtjt20151014201843", "ryuenuse20151016185510", "breaksung20151203205351", "castlebin1220151203231034"];
    async.parallel({
        //동, 명사에 대해서 수행
        word: function (callback_second) {
            //var sent = 0;
            //0높중개, 높중스, 2낮중개, 낮중스, 4높긍개, 높긍스, 8낮긍개, 낮긍스, 10높부개, 높부스, 12낮부개, 낮부스
            var sent = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var nv;
            if ((doc.Verb == null || doc.Verb == "[]" || doc.Verb.length == 0) && (doc.Noun == null || doc.Noun == "[]" || doc.Noun.length == 0)) {
                callback_second(null, "없음");
            } else {
                if(doc.Verb == null || doc.Verb == "[]") {
                    nv = doc.Noun;
                } else if (doc.Noun == null || doc.Noun == "[]") {

                    nv = doc.Verb;
                } else {
                    nv = doc.Noun.concat(doc.Verb);
                }
                var Num = nv.length;
                var Count = 0;
                if(nv[Num-1].hasOwnProperty('isNeg')) {
                    nv[Num - 1].end = true;
                }
                nv.forEach(function (word) {
                    //동,명사를 collection에서 검색
                    model_senti.get_sentiment_by_word(word.word, function (err, sentiData) {
                        if (err) {
                            console.error(err);
                        }
                        async.waterfall([
                            function (callback_third) {
                                var isNeg = word.isNeg;
                                //동사 없을 경우 api에서 검색
                                if (!sentiData[0] && word.hasOwnProperty('isNeg')) {
                                    apiInfo.count++;
                                    model_senti.get_sentiment_from_api_and_save(api_key[apiInfo.index], word.word, function (err, apiSentiData) {
                                        if (err) {
                                            return;
                                        }
                                        sentiData = apiSentiData;
                                        callback_third(null, sentiData, isNeg);
                                    });
                                } else if(!sentiData[0]) {
                                    //명사 없을경우 그냥 전송
                                    callback_third(null, null, null);

                                }
                                else if(sentiData[0]) {
                                    //동사 명사 있을 경우 데이터 사용
                                    callback_third(null, sentiData, isNeg);
                                }

                            },
                            //한 word에 대한 긍정, 부정 결과 더하기
                            function (sentiData, isNeg, callback_third) {
                                if(sentiData != null) {
                                    var sentiScore = parseFloat(sentiData[0].sentiment_score);
                                    //0높중개, 높중스, 2낮중개, 낮중스, 4높긍개, 높긍스, 6낮긍개, 낮긍스, 8높부개, 높부스, 10낮부개, 낮부스
                                    if (sentiData[0].sentiment == "중립" && sentiScore > 60) {
                                        sent[0] += 1;
                                        sent[1] += sentiScore;
                                    } else if (sentiData[0].sentiment == "중립" && sentiScore <= 60 && sentiScore > 0) {
                                        sent[2] += 1;
                                        sent[3] += sentiScore;
                                    } else if (sentiData[0].sentiment == "긍정" && (isNeg == undefined || isNeg == "false") && sentiScore > 20) {
                                        sent[4] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[5] += 2 * sentiScore;
                                        //} else {
                                        //    sent[5] += sentiScore;
                                        //}
                                        sent[5] += sentiScore;
                                    } else if (sentiData[0].sentiment == "부정" && isNeg == "true" && sentiScore > 20) {
                                        sent[4] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[5] += 2 * sentiScore;
                                        //} else {
                                        //    sent[5] += sentiScore;
                                        //}
                                        sent[5] += sentiScore;
                                    } else if (sentiData[0].sentiment == "긍정" && (isNeg == undefined || isNeg == "false") && sentiScore <= 20) {
                                        sent[6] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[7] += 2 * sentiScore;
                                        //} else {
                                        //    sent[7] += sentiScore;
                                        //}
                                        sent[7] += sentiScore;
                                    } else if (sentiData[0].sentiment == "부정" && isNeg == "true" && sentiScore <= 20) {
                                        sent[6] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[7] += 2 * sentiScore;
                                        //} else {
                                        //    sent[7] += sentiScore;
                                        //}
                                        sent[7] += sentiScore;
                                    } else if (sentiData[0].sentiment == "부정" && (isNeg == undefined || isNeg == "false") && sentiScore > 20) {
                                        sent[8] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[9] += 2 * sentiScore;
                                        //} else {
                                        //    sent[9] += sentiScore;
                                        //}
                                        sent[9] += sentiScore;
                                    } else if (sentiData[0].sentiment == "긍정" && isNeg == "true" && sentiScore > 20) {
                                        sent[8] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[9] += 2 * sentiScore;
                                        //} else {
                                        //    sent[9] += sentiScore;
                                        //}
                                        sent[9] += sentiScore;
                                    } else if (sentiData[0].sentiment == "부정" && (isNeg == undefined || isNeg == "false") && sentiScore <= 20) {
                                        sent[10] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[11] += 2 * sentiScore;
                                        //} else {
                                        //    sent[11] += sentiScore;
                                        //}
                                        sent[11] += sentiScore;
                                    } else if (sentiData[0].sentiment == "긍정" && isNeg == "true" && sentiScore <= 20) {
                                        sent[10] += 1;
                                        //if(word.hasOwnProperty('end')) {
                                        //    sent[11] += 2 * sentiScore;
                                        //} else {
                                        //    sent[11] += sentiScore;
                                        //}
                                        sent[11] += sentiScore;
                                    } else {
                                        sent[0] += 0;
                                    }
                                }
                                callback_third(null, sent);
                            }
                        ], function (err, result) {
                            Count++;
                            if (Count == Num) {
                                var sentiment;
                                //0높중개, 높중스, 2낮중개, 낮중스, 4높긍개, 높긍스, 6낮긍개, 낮긍스, 8높부개, 높부스, 10낮부개, 낮부스
                                //토탈 긍정의 수치와 토탈 부정의 수치를 비교해서 긍정 or 부정을 정함
                                if (result[5] + result[7] > result[9] + result[11]) {
                                    sentiment = "긍정"
                                } else if (result[5] + result[7] < result[9] + result[11]) {
                                    sentiment = "부정"
                                } else {
                                    //같으면 매우 높은(60퍼 이상) 긍정의 수치와 매우 높은 부정의 수치를 비교해서 긍정 or 부정을 정함
                                    if (result[4] > result[8]) {
                                        sentiment = "긍정"
                                    } else if (result[4] < result[8]) {
                                        sentiment = "부정"
                                    } else {
                                        //sentiment = "중립"
                                        if (result[4] + result[6] > result[8] + result[10]) {
                                            sentiment = "긍정"
                                        } else if (result[4] + result[6] < result[8] + result[10]) {
                                            sentiment = "부정"
                                        } else {
                                            sentiment = "중립"
                                        }
                                    }
                                }

                                //if (result > 0) {
                                //    sentiment = "긍정";
                                //} else if (result < 0) {
                                //    sentiment = "부정";
                                //} else {
                                //    sentiment = "중립";
                                //}
                                callback_second(null, sentiment);

                            }
                        })
                    })
                })
            }
        }
    }, function (err, result) {
        result.text = doc.text;
        result.noun = doc.Noun;
        result.verb = doc.Verb;
        next(result);
    })
}