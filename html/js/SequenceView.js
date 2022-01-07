class SequenceView {
  /// @ni Number of rows of digits to display
  /// @nj Number of columns of digits to display
  constructor(ni, nj) {
    this.NI = ni;
    this.NJ = nj;
    this.x0 = this.NJ*14; // Center the stencil
    this.y0 = this.NI*14;
    
    this.seqCanvas = document.createElement('canvas');
    this.seqCanvas.id = 'sequenceView';
    this.seqCanvas.width = this.NJ*28;
    this.seqCanvas.height = this.NI*28;
    this.seqCanvas.addEventListener('mousedown', this.onMouseDown(this));
    this.seqCanvas.addEventListener('mousemove', this.onMouseMove(this));
    this.seqContext = this.seqCanvas.getContext('2d');
    this.seqContext.imageSmoothingEnabled = false;
    document.getElementById('sequence').appendChild(this.seqCanvas);
    canvasTexture = new THREE.CanvasTexture(this.seqCanvas);

    const W = (2*numColLoops+1)*14;
    this.outCanvas = document.createElement('canvas');
    this.outCanvas.id = 'outputView';
    this.outCanvas.width = W;
    this.outCanvas.height = W;
    this.outContext = this.outCanvas.getContext('2d');
    this.outContext.imageSmoothingEnabled = false;
    document.getElementById('gatedOutput').appendChild(this.outCanvas);
    
    this.currSeq = [];
    var N = this.NI*this.NJ;
    this.trainSet = new Array(N);
    for (var i=0; i<N; ++i) {
      var num = Math.floor(10*Math.random());
      this.currSeq.push(num);
      this.getNewImage(num);
    }

    this.background = null;
    this.seqUpdate = true;
    this.stencilData = [];
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
    this.seqCanvas.height = ni*28;
    this.seqCanvas.width = nj*28;
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
    var R = numColLoops*gui.sensorRadius;
    this.x0 = Math.min(this.NJ*28-2*R,Math.max(2*R,x));
    this.y0 = Math.min(this.NI*28-sqrt3*R,Math.max(sqrt3*R,y));
    this.updateSensor();
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
      seqView.renderSeq();
    };
  }
  //--------------------------------------------------------------------
  renderSeq() {
    this.seqContext.clearRect(0, 0, this.seqCanvas.width, this.seqCanvas.height);
    // Render the current sequence
    for (var i=0; i<this.currSeq.length; ++i) {
      if (this.trainSet[i] !== undefined) {
        var x = parseInt(28*(i%this.NJ));
        var y = parseInt(28*Math.floor(i/this.NJ));
        this.seqContext.putImageData(this.trainSet[i], x, y);
      }
    }
    this.background = this.seqContext.getImageData(0, 0, this.seqCanvas.width, this.seqCanvas.height);
    canvasTexture.needsUpdate = true;
  }
  render() {
    if (this.background) this.seqContext.putImageData(this.background, 0, 0);
    else this.renderSeq();
  }
  updateSensor() {
    const R = Math.round(gui.sensorRadius);
    const C = Math.floor((this.outCanvas.width-R)/2);
    // Save the image data under the current fovea stencil
    var x0 = this.x0;
    var y0 = this.y0;
    var ii = 0;
    if (ii<gui.numColumns) {
      const img = this.captureNode(x0, y0);
      this.stencilData[ii++] = img.data;
    }
	  for (var i=1; i<=numColLoops && ii<gui.numColumns; ++i) {
      for (var j=1; j<=i && ii<gui.numColumns; ++j) {
        var x1 = (2*i-j)*sqrt3/2;
        var y1 = (j*3/2);
        var rad = R*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<gui.numColumns; ++k, th+=Math.PI/3) {
          const x = Math.floor(x0 + rad*Math.cos(th));
          const y = Math.floor(y0 + rad*Math.sin(th));
          const img = this.captureNode(x, y);
          this.stencilData[ii++] = img.data;
        }
      }
    }
  }
  //--------------------------------------------------------------------
  renderStencil() {
    const R = Math.round(gui.sensorRadius);
    this.seqContext.strokeStyle = "green";
    this.seqContext.lineWidth = 1;
    var x0 = this.x0;
    var y0 = this.y0;
    var ii = 0;
    if (ii++<gui.numColumns) this.renderNode(x0, y0);
	  for (var i=1; i<=numColLoops && ii<gui.numColumns; ++i) {
      for (var j=1; j<=i && ii<gui.numColumns; ++j) {
        var x1 = (2*i-j)*sqrt3/2;
        var y1 = (j*3/2);
        var rad = R*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<gui.numColumns; ++k, ++ii, th+=Math.PI/3) {
          this.renderNode(x0 + rad*Math.cos(th), y0 + rad*Math.sin(th));
        }
      }
    }
  }
  //--------------------------------------------------------------------
  renderNode(x, y) {
    const R = Math.round(gui.sensorRadius);
    this.seqContext.beginPath();
    this.seqContext.ellipse(x, y, R, R, 0, 0, 2*Math.PI);
    this.seqContext.stroke();
  }
  //--------------------------------------------------------------------
  captureNode(x, y) {
    const R = Math.round(gui.sensorRadius);
    return this.seqContext.getImageData(x-R, y-R, 2*R+1, 2*R+1);
  }
};

