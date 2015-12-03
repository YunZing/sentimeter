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
router.get('/home', function(req, res, next) {
    res.render('home');
});

router.get('/view', function(req, res, next) {
    var keyword = req.query.keyword;
    console.log(keyword);
    if (keyword === undefined) {
        res.render('home', { title: 'Express' });
    } else {
        res.render('view', { key: keyword });
    }
});

router.get('/result', function(req, res, next) {
    var name = req.query.keyword;
    async.waterfall([
        //keyword가 포함된 doc array 가져오기
        function(callback_first) {
            var docNum = 0;
            var docCount = 0;
            var docsJson = {
                "name": name,
                "totalCount" : 0,
                "positiveCount": 0,
                "negativeCount": 0,
                "neutralCount": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "text": {
                    "positiveText" : new Array(),
                    "negativeText" : new Array(),
                    "neutralText" : new Array()
                }
            };
            model_sns.get_sns_list_by_word(name, function (err, docs) {
                if (err) {
                    return;
                }
                if(docs == undefined || docs.length == 0) {
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
                            textJson.URL = "https://twitter.com/"+ doc.ScreenName + "/status/" + doc.StatusId;
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
                    }, function(err, result) {
                        //sentiment 결정
                        docCount++;
                        docsJson.totalCount++;
                        if(result.word == "긍정"){
                            docsJson.positiveCount++;
                        } else if(result.word == "부정") {
                            docsJson.negativeCount++;
                        } else if(result.word == "중립") {
                            docsJson.neutralCount++;
                        }
                        if(docCount == docNum) {
                            callback_first(null, docsJson);
                        }
                    });
                });
            });
        }
    ], function(err, result) {
        result.positive =  result.positiveCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        result.negative = result.negativeCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        result.neutral = result.neutralCount * 100 / (result.positiveCount + result.negativeCount + result.neutralCount);
        res.json(result);
    });
});

module.exports = router;
