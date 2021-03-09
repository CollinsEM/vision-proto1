'use strict';
const express = require('express');
const fs = require('fs');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3030;

const server = express();

class DataSet {
  constructor(imgFile, lblFile) {
    this.numLbls = 0;
    this.numImgs = 0;
    this.numRows = 0;
    this.numCols = 0;
    this.imgSize = 0;
    this.lbls    = undefined;
    this.imgs    = undefined;
    this.readLabels(lblFile);
    this.readImages(imgFile);
  }
  
  readLabels(file) {
    const buff = fs.readFileSync(file);
    // var magic = new MagicNumber(buff.slice(0,4));
    // if (magic.number != 2049) console.error("Not a valid label file.");
    if (buff.readInt32BE(0) != 2049) console.error("Not a valid MNIST label file.");
    this.numLbls = buff.readInt32BE(4);
    console.log("numLbls:", this.numLbls);
    this.lbls = buff.slice(8);
  }
  
  readImages(file) {
    var buff = fs.readFileSync(file);
    // var magic = new MagicNumber(buff.slice(0,4));
    // if (magic.number != 2051) console.error("Not a valid image file.");
    if (buff.readInt32BE(0) != 2051) console.error("Not a valid MNIST image file.");
    this.numImgs = buff.readInt32BE( 4);
    this.numRows = buff.readInt32BE( 8);
    this.numCols = buff.readInt32BE(12);
    this.imgSize = this.numRows*this.numCols;
    console.log("numImgs:", this.numImgs);
    console.log("numRows:", this.numRows);
    console.log("numCols:", this.numCols);
    console.log("imgSize:", this.imgSize);
    this.count = [];
    this.imgs = [];
    for (var i=0; i<10; ++i) {
      this.count[i] = 0;
      this.imgs[i] = [];
    }
    for (var i=0, p=16; i<this.numImgs; ++i, p+=this.imgSize) {
      var lbl = this.lbls[i];
      var idx = this.count[lbl];
      this.imgs[lbl][idx] = buff.slice(p, p+this.imgSize);
      this.count[lbl]++;
    }
  }
}

// class MagicNumber {
//   constructor(buff) {
//     this.TYPES = [];
//     this.TYPES[0x08] = 'unsigned byte';
//     this.TYPES[0x09] = 'signed byte';
//     this.TYPES[0x0B] = 'short (2 bytes)';
//     this.TYPES[0x0C] = 'int (4 bytes)';
//     this.TYPES[0x0D] = 'float (4 bytes)';
//     this.TYPES[0x0E] = 'double (8 bytes)';
//     if (buff[0] || buff[1]) {
//       console.error("Not a valid magic number!", buff[0], buff[1]);
//     }
//     this.number  = parseInt(buff.readInt32BE());
//     this.type    = parseInt(buff[2]);
//     this.numDims = parseInt(buff[3]);
//     console.log("Magic Number: ", this.number);
//     console.log("Data type:",     this.TYPES[this.type]);
//     console.log("Num Dims: ",     this.numDims);
//   }
// };

var trainSet = new DataSet('data/train-images-idx3-ubyte',
                           'data/train-labels-idx1-ubyte');
var testSet = new DataSet('data/t10k-images-idx3-ubyte',
                          'data/t10k-labels-idx1-ubyte');
var drawArea = undefined;

server.use('/', express.static('html'));
server.use('/favicon.ico', express.static('html/siteicon.png'));
// Serve digit images from the training data set
server.get('/train', (req, res) => {
  console.log(req.url);
  const addr = url.parse(req.url);
  var lbl = parseInt(addr.query);
  var cnt = trainSet.count[lbl];
  var idx = parseInt(Math.floor(Math.random()*cnt));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'arraybuffer');
  res.write(trainSet.imgs[lbl][idx]);
  res.write(lbl.toString());
  res.on('error', (err) => { console.error(err); });
  res.end();
} );
// Serve digit images from the test data set
server.get('/test', (req, res) => {
  console.log(req.url);
  const addr = url.parse(req.url);
  var lbl = parseInt(addr.query);
  var cnt = testSet.count[lbl];
  var idx = parseInt(Math.floor(Math.random()*cnt));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'arraybuffer');
  res.write(testSet.imgs[lbl][idx]);
  res.write(lbl.toString());
  res.on('error', (err) => { console.error(err); });
  res.end();
} );

server.listen( port, () => {
  console.log("Server running at http://"+hostname+":"+port);
} );

