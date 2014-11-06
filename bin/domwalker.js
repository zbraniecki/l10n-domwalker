#!/usr/bin/env node

'use strict';

var program = require('commander');
var walk = require('walk');
var path = require('path');
var fs = require('fs');
var jsdom = require("jsdom");

var options = {
  followLinks: true
};

var path1 = '/Users/zbraniecki/projects/gaia/apps/';

function walkDOM() {
  var walker = walk.walk(path1, options);
  walker.on("file", function (root, fileStats, next) {

  
    if (path.extname(fileStats.name) == '.html') {
      var filePath = path.join(root, fileStats.name);

      if (!/\/(test|imes)\//.test(filePath)) {
        console.log('starting: ' + filePath); 
        fs.readFile(filePath, function (err, data) {
          if (err) throw err;

          cleanHTML(data.toString(), function(newHTML, isModified) {
            if (isModified) {
              var str = jsdom.serializeDocument(newHTML);
              fs.writeFile(filePath, str, function (err) {
                if (err) throw err;
                console.log('ending: ' + filePath); 
              });
            }
          });
        });
      }
    }
    next();
  });
  walker.on("end", function () {
    console.log("all done");
  });
}

var skipNodes = [
  'SCRIPT',
];

function cleanHTML(string, cb) {
  jsdom.env(
    string,
    [],
    function (errors, window) {
      var isModified = false;
      var nodes = window.document.body.getElementsByTagName('*');
      if (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (skipNodes.indexOf(node.nodeName) !== -1) {
            continue;
          }
          if (!node.children.length) {
            if (node.textContent.trim('').length === 0) {
              continue;
            }
            isModified = true;
            node.textContent = '';
          }
        }
      }
      cb(window.document, isModified);
    }
  );
}

program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

walkDOM();
