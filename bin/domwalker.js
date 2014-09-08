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

      fs.readFile(filePath, function (err, data) {
        if (err) throw err;

        scanFile(data.toString(), filePath);
      });
    }
    next();
  });
  walker.on("end", function () {
    console.log("all done");
  });
}

function scanFile(data, path) {
  jsdom.env(
    data,
    [],
    function (errors, window) {
      var nodes = window.document.querySelectorAll('[data-l10n-id]');
      if (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (node.children.length) {
            console.log('==========================');
            console.log(path);
            console.log(node.outerHTML);
            console.log('==========================');
          }
        }
      }
    }
  );
}


program
  .version('0.0.1')
  .usage('[options] [file]')
  .parse(process.argv);

walkDOM();
