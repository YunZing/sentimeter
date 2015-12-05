/**
 * Created by Y on 2015-11-21.
 */
var express = require('express');
var model_sns = require('../models/sns.js');
var model_senti = require('../models/sentiment.js');
var http = require('http');
var urlencode = require('urlencode');
var async = require('async');

var router = express.Router();
/* GET home page. */
router.get('/home', function (req, res, next) {
    res.render('home');
});

router.get('/view', function (req, res, next) {
    var keyword = req.query.keyword;
    console.log(keyword);
    if (keyword === undefined) {
        res.render('home', {title: 'Express'});
    } else {
        res.render('view', {key: keyword});
    }
});

router.get('/result/chart', function (req, res, next) {
    /*
        req: keyword
        res: {
            [
                "Date":
                "positive":
                "negative":
                "neutral":
            ],
            ...
        }
     */
    var name = req.query.keyword;

});


//게시글에서 단어 수 세
router.get('/result/wordCount', function (req, res, next) {
    var keyword = req.query.keyword;
    var wordObject = new Object();
    var docNum = 0;
    var docCount = 0;

    //keyword가 포함된 doc array가져오기
    model_sns.get_sns_list_by_word(keyword, function (err, docs) {
        if(docs == "[]" || docs == null || docs == undefined) {
            res.send("");
        }
        docNum = docs.length;

        //doc
        docs.forEach(function (doc) {
            docCount++;
            var vCount = 0;
            var vNum = 0;
            if(doc.Verb == "[]" || doc.Verb == null){
                if(docNum == docCount) {
                    var arr = [];
                    for (var prop in wordObject) {
                        if (wordObject.hasOwnProperty(prop)) {
                            arr.push({
                                "word": prop,
                                "count": wordObject[prop]
                            });
                        }
                    }
                    arr.sort(function(a, b) {return b.count - a.count; });
                    console.log(arr);
                    res.send(arr);
                }
            }
            else{
                vNum = doc.Verb.length;
                doc.Verb.forEach(function (vWord) {
                    vCount++;
                    if (wordObject[vWord.word] == undefined) {
                        wordObject[vWord.word] = 1;
                    }
                    else {
                        wordObject[vWord.word] += 1;
                    }
                    if (vNum == vCount) {
                        if(docNum == docCount) {
                            var arr = [];
                            for (var prop in wordObject) {
                                if (wordObject.hasOwnProperty(prop)) {
                                    arr.push({
                                        "word": prop,
                                        "count": wordObject[prop]
                                    });
                                }
                            }
                            arr.sort(function(a, b) {return b.count - a.count; });
                            res.send(arr);
                        }
                    }
                });
            }
        });
    });

});


//name -> SNS db 전체 게시글
router.get('/result/sentimentBar', function (req, res, next) {
    var keyword = req.query.keyword;
    async.waterfall([
        //keyword가 포함된 doc array 가져오기
        function (callback_first) {
            var docNum = 0;
            var docCount = 0;
            var docsJson = {
                "keyword": keyword,
                "totalCount": 0,
                "positiveCount": 0,
                "negativeCount": 0,
                "neutralCount": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "text": {
                    "positiveText": new Array(),
                    "negativeText": new Array(),
                    "neutralText": new Array()
                }
            };
            model_sns.get_sns_list_by_word(keyword, function (err, docs) {
                if (err) {
                    return;
                }
                if (docs == undefined || docs.length == 0) {
                    res.json(docsJson);
                }
                //글 하나마다 실행
                docNum = docs.length;
                docs.forEach(function (doc) {
                    async.parallel({
                        //동, 명사에 대해서 수행
                        word: function (callback_second) {
                            var textJson = {};
                            textJson.Id = doc.Name;
                            textJson.Text = doc.Text;
                            textJson.v  =doc.Verb;
                            textJson.URL = "https://twitter.com/" + doc.ScreenName + "/status/" + doc.StatusId;
                            textJson.sentiment = doc.sentiment;
                            if (doc.sentiment == "긍정") {
                                docsJson.text.positiveText.push(textJson);
                            } else if (doc.sentiment == "부정") {
                                docsJson.text.negativeText.push(textJson);
                            } else if (doc.sentiment == "중립") {
                                docsJson.text.neutralText.push(textJson);
                            }
                            callback_second(null, doc.sentiment);
                        }
                    }, function (err, result) {
                        //sentiment 결정
                        docCount++;
                        if(result.word != "없음") {
                            docsJson.totalCount++;
                        }
                        if (result.word == "긍정") {
                            docsJson.positiveCount++;
                        } else if (result.word == "부정") {
                            docsJson.negativeCount++;
                        } else if (result.word == "중립") {
                            docsJson.neutralCount++;
                        }
                        if (docCount == docNum) {
                            callback_first(null, docsJson);
                        }
                    });
                });
            });
        }
    ], function (err, result) {
        result.positive = result.positiveCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        result.negative = result.negativeCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        result.neutral = result.neutralCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        res.json(result);
    });
});

module.exports = router;
