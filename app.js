const TelegramBot = require('node-telegram-bot-api');
// import imagesnapjs from 'imagesnapjs';
// import TelegramBot from 'node-telegram-bot-api';
const imagesnapjs = require('imagesnapjs');
const http = require('http');
const fs = require('fs');
const request = require('request');
const path = require('path');
const Q = require('q');

var token = '264156074:AAHv4sDJNez8XrO0b-eFq0aF80EbG5iupIM';
const filename = path.join(__dirname, 'downloads/') + 'tmp_image';



var bot = new TelegramBot(token, {polling: true});

// bot.on('message', function (msg) {
//   var chatId = msg.chat.id;
//   console.log(msg);
//   bot.sendMessage(chatId, "Hello!", {caption: "I'm a bot!"});
// });

bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  // console.log(msg);
  // if (msg.text == 'photo') {
  //   fs.exists(filename, function (exists) {
  //     if (exists)
  //       fs.unlinkSync(filename);
  //     imagesnapjs.capture(filename, {cliflags: '-w 2'}, function (err) {
  //       console.log(err ? err : 'Success!');
  //       bot.sendPhoto(chatId, filename, {caption: "It's your photo!"});
  //     });
  //   });
  // }

  if (/hi|hello|привет|здарова/ig.test(msg.text)) {
    console.log(msg);
    bot.sendMessage(chatId, `Привет ${msg.from.username}!`);
  }

  if (msg.text == '/sex') {
    getPostsVK(chatId, 'prayforhard');
  }

  if (msg.text == '/mdk') {
    getPostsVK(chatId, 'mudakoff');
  }

  // if (msg.text.indexOf('viber') || msg.text.indexOf('вайбер')) {
  //   bot.sendMessage(chatId, "ВАЙБЕР ХУЙНЯ!!!!11111");
  // }
});

function download(url, filepath) {
  var fileStream = fs.createWriteStream(filepath),
      deferred = Q.defer();

  fileStream.on('open', function () {
    http.get(url, function (res) {
      res.on('error', function (err) {
        deferred.reject(err);
      });

      res.pipe(fileStream);
    });
  }).on('error', function (err) {
    deferred.reject(err);
  }).on('finish', function () {
    deferred.resolve(filepath);
  });

  return deferred.promise;
}

// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     console.log('content-type:', res.headers['content-type']);
//     console.log('content-length:', res.headers['content-length']);
//
//     var writeStream = fs.createWriteStream(filename);
//
//     request(uri)
//         .pipe(writeStream)
//         .on('close', callback);
//
//     // writeStream.on('end', function () {
//     //   callback();
//     //   // writeStream.end();
//     // });
//
//   });
// };

function getPostsVK(chatId, publicVK) {
  var options = {
    host: "api.vk.com",
    port: 80,
    path: `/method/wall.get?domain=${publicVK}&count=1&filter=owner`
  };

  var body = '';

  var req = http.request(options, function (res) {
    res.setEncoding("utf8");

    res.on("data", function (chunk) {
      body += chunk;
    });

    res.on("end", function () {
      var data = JSON.parse(body).response;
      for (var i = 2; i < data.length; i++) {
        if (data[i].attachment.type == 'photo' && data[i].attachment.photo.src_big) {
          var url = data[i].attachment.photo.src_big;
          var path = filename + getRandomNumber() + '.jpg';

          download(url, path).then(function (filepath) {
            bot.sendPhoto(chatId, filepath).then(function () {
              fs.unlink(filepath);
            });
          });
        }
      }
    });
  });
  req.end();
}

function getRandomNumber() {
  return Math.random() * 1000000000000000000;
}