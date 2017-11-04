 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var request = require('request');
app.set('json spaces', 2);      // Used to set json object returns with preformatted layout
const GoogleImages = require('google-images');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

app.use('/google-images_test', function(req, res) {
 
  const client = new GoogleImages(process.env.CSE_ID, process.env.API_KEY);
 
client.search('lolcats')
    .then(images => {
        /*
        [{
            "url": "http://steveangello.com/boss.jpg",
            "type": "image/jpeg",
            "width": 1024,
            "height": 768,
            "size": 102451,
            "thumbnail": {
                "url": "http://steveangello.com/thumbnail.jpg",
                "width": 512,
                "height": 512
            }
        }]
         */
      res.send(images);
      // res.send(images[0].url);
    });
 
// paginate results 
// client.search('lolcats', {page: 2});
 
// search for certain size 
//client.search('Steve Angello', {size: 'large'});
});

app.use('/:search_val', function(req, res) {
  var objectArr = [];
  var reqUrl = '';
  
  if (req.query.offset === undefined) {
    console.log('offset is undefined');
    reqUrl = 'https://www.googleapis.com/customsearch/v1?q='+req.params.search_val+'&cx='+process.env.CSE_ID+'&searchType=image&key='+process.env.API_KEY+'';
  }
  else {
    // if(parseInt(req.query.offset) <= 20) {
    //   reqUrl = 'https://www.googleapis.com/customsearch/v1?q='+req.params.search_val+'&cx='+process.env.CSE_ID+'&start='+req.query.offset+'&searchType=image&key='+process.env.API_KEY+'';  
    // }
    // else {
    //   reqUrl = 'https://www.googleapis.com/customsearch/v1?q='+req.params.search_val+'&cx='+process.env.CSE_ID+'&start=200&searchType=image&key='+process.env.API_KEY+'';
    // }
    reqUrl = 'https://www.googleapis.com/customsearch/v1?q='+req.params.search_val+'&cx='+process.env.CSE_ID+'&start='+req.query.offset+'&searchType=image&key='+process.env.API_KEY+'';  
  }
  
  // console.log(reqUrl);
  request(reqUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          // console.log(JSON.parse(body));                               // Returns body of request test
          var results = JSON.parse(body);
          // console.log((results);
          // console.log((results.items).length);
          for(var i = 0; i < (results.items).length; i++) {
            // var urlLink = results.items[i].link;
            // var cleanUrlLink = urlLink.replace(/\\/g, '');
            var urlLink = "<a href=# class=text_link target = blank>#{url}</a>";
            // var urlLink = encodeURIComponent(results.items[i].link);
            var cseObject = {'Image URL' : urlLink, 'Context' : results.items[i].link, 'Snippet' : results.items[i].snippet, 'Thumbnail' : results.items[i].image.thumbnailLink};
            // console.log(results.items[i]);
            console.log('Context: ' +results.items[i].link);
            console.log('Snippet: ' +results.items[i].snippet);
            console.log('Thumbnail: ' +results.items[i].image.thumbnailLink);
            console.log('Image URL: ' +results.items[i].link);
            
            objectArr.push(cseObject);
          }
          // res.send(JSON.parse(body));
          // res.send(results);
        res.send(objectArr);
      }
      else {
        res.send({'Error': 'Error establishing the connection.'});
      }
  });
});
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

