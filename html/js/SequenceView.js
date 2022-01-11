"use strict";

class SequenceView {
  /// @ni Number of rows of digits to display
  /// @nj Number of columns of digits to display
  constructor(ni, nj) {
    // Number of rows and columns of digits
    this.NI = ni;
    this.NJ = nj;
    // Current focus (center of attention)
    this.x0 = this.NJ*14;
    this.y0 = this.NI*14;
    // Enable movement of focus
    this.enableMotor = gui.shiftFocus;
    
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'seqView';
    this.canvas.width = this.NJ*28;
    this.canvas.height = this.NI*28;
    this.canvas.addEventListener('mousedown', this.onMouseDown(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove(this));
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    
    document.getElementById('sequence').appendChild(this.canvas);
    
    this.currSeq = [];
    var N = this.NI*this.NJ;
    this.trainSet = new Array(N);
    for (var i=0; i<N; ++i) {
      var num = Math.floor(10*Math.random());
      this.currSeq.push(num);
      this.getNewImage(num);
    }

    this.cache = null;
    this.needsUpdate = true;
  }
  //--------------------------------------------------------------------
  getNewImage(num) {
    console.log("Requesting image of:", num);
    var oReq = new XMLHttpRequest();
    oReq.responseType = "arraybuffer";
    oReq.onload = this.parseImageData(28, 28);
    var reqResource = document.URL + "train?" + num;
    oReq.open("GET", reqResource);
    oReq.send();
  }
  //--------------------------------------------------------------------
  resize(ni, nj) {
    console.log(ni,nj);
    if (ni*nj > this.NI*this.NJ) {
      let N = (ni*nj) - (this.NI*this.NJ);
      for (var i=0; i<N; ++i) {
        var num = Math.floor(10*Math.random());
        this.currSeq.push(num);
        this.getNewImage(num);
      }
    }
    this.canvas.height = ni*28;
    this.canvas.width = nj*28;
    this.NI = ni;
    this.NJ = nj;
  }
  //--------------------------------------------------------------------
  onMouseDown(seq) {
    return function(event) {
      event.stopPropagation();
      if (event.buttons == 1) seq.setMouse(event.layerX, event.layerY);
    };
  }
  //--------------------------------------------------------------------
  onMouseMove(seq) {
    return function(event) {
      event.stopPropagation();
      if (event.buttons == 1) seq.setMouse(event.layerX, event.layerY);
    };
  }
  //--------------------------------------------------------------------
  setMouse(x, y) {
    const R = numColLoops*(2*gui.retinaScale+1);
    const xMin = Math.min(retinaL.x0-2*R, retinaR.x0+2*R);
    const xMax = Math.max(retinaL.x0-2*R, retinaR.x0+2*R);
    const yMin = Math.min(retinaL.y0-2*R, retinaR.y0+2*R);
    const yMax = Math.max(retinaL.y0-2*R, retinaR.y0+2*R);
    this.x0 = Math.min(this.NJ*28-xMax, Math.max(-xMin,x));
    this.y0 = Math.min(this.NI*28-yMax, Math.max(-yMin,y));
    // this.x0 = Math.min(this.NJ*28-2*R,Math.max(2*R,x));
    // this.y0 = Math.min(this.NI*28-sqrt3*R,Math.max(sqrt3*R,y));
  }
  //--------------------------------------------------------------------
  moveMouse(delta) {
    const x = this.x0 + delta.x;
    const y = this.y0 + delta.y;
    this.setMouse(x, y);
  }
  //--------------------------------------------------------------------
  // Recieve image data buffer and convert to valid ImageData
  // object. Render ImageData to canvas.
  parseImageData(numCols, numRows)  {
    return function(event) {
      var view = new DataView(this.response);
      var img = new ImageData(numCols, numRows);
      var q = 0;
      var r = Math.random();
      var g = Math.random();
      var b = Math.random();
      for (var i=0, p=0; i<numRows; ++i) {
        for (var j=0; j<numCols; ++j, ++q) {
          img.data[p++] = Math.floor(r*view.getUint8(q));
          img.data[p++] = Math.floor(g*view.getUint8(q));
          img.data[p++] = Math.floor(b*view.getUint8(q));
          img.data[p++] = 255;
        }
      }
      // Store this image in trainSet at a location corresponding to the
      // current sequence.
      var lbl = view.getUint8(q) - 48;
      for (var i=0; i<seqView.currSeq.length; ++i) {
        if ( seqView.trainSet[i] === undefined && seqView.currSeq[i] == lbl ) {
          console.log("Assigning image of", lbl, "to trainSet[", i, "]");
          seqView.trainSet[i] = img;
          break;
        }
      }
      // Request rendering update
      seqView.needsUpdate = true;
    };
  }
  //--------------------------------------------------------------------
  renderSeq() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.context.clearRect(0, 0, W, H);
    // Render the current sequence
    for (var i=0; i<this.currSeq.length; ++i) {
      if (this.trainSet[i] !== undefined) {
        var x = parseInt(28*(i%this.NJ));
        var y = parseInt(28*Math.floor(i/this.NJ));
        this.context.putImageData(this.trainSet[i], x, y);
      }
    }
    this.cache = this.context.getImageData(0, 0, W, H);
  }
  //--------------------------------------------------------------------
  // Render the current input sequence to the canvas element
  render() {
    // this.cache holds an ImageData object of the current state
    if (this.needsUpdate || this.cache === null) this.renderSeq();
    this.context.putImageData(this.cache, 0, 0);
  }
};

