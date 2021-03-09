class SequenceView {
  /// @ni Number of rows of digits to display
  /// @nj Number of columns of digits to display
  constructor(ni, nj) {
    this.NI = ni;
    this.NJ = nj;
    this.x0 = this.NJ*14; // Center the stencil
    this.y0 = this.NI*14;
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
    var R = numColLoops*gui.colRadius;
    this.x0 = Math.min(this.NJ*28-2*R,Math.max(2*R,x));
    this.y0 = Math.min(this.NI*28-sqrt3*R,Math.max(sqrt3*R,y));
    // Request rendering update
    this.seqUpdate = true;
  }
  //--------------------------------------------------------------------
  // Recieve image data buffer and convert to valid ImageData
  // object. Render ImageData to canvas.
  parseImageData(numCols, numRows)  {
    return function(event) {
      var view = new DataView(this.response);
      var img = new ImageData(numCols, numRows);
      var q = 0;
      for (var i=0, p=0; i<numRows; ++i) {
        for (var j=0; j<numCols; ++j, ++q) {
          for (var k=0; k<3; ++k) {
            img.data[p++] = view.getUint8(q);
          }
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
      seqView.seqUpdate = true;
    };
  }
  //--------------------------------------------------------------------
  render() {
    const R = Math.round(gui.colRadius);
    if (!this.seqUpdate) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Render the current sequence
    for (var i=0; i<this.currSeq.length; ++i) {
      if (this.trainSet[i] !== undefined) {
        var x = parseInt(28*(i%this.NJ));
        var y = parseInt(28*Math.floor(i/this.NJ));
        this.context.putImageData(this.trainSet[i], x, y);
      }
    }
    // Save the image data under the current fovea stencil
    var x0 = this.x0;
    var y0 = this.y0;
    var ii = 0;
    if (ii<gui.numColumns) this.stencilData[ii++] = this.captureNode(x0, y0);
	  for (var i=1; i<=numColLoops && ii<gui.numColumns; ++i) {
      for (var j=1; j<=i && ii<gui.numColumns; ++j) {
        var x1 = (2*i-j)*sqrt3/2;
        var y1 = (j*3/2);
        var rad = R*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<gui.numColumns; ++k, ++ii, th+=Math.PI/3) {
          this.stencilData[ii] = this.captureNode(Math.floor(x0 + rad*Math.cos(th)),
                                                  Math.floor(y0 + rad*Math.sin(th)));
        }
      }
    }
  }
  //--------------------------------------------------------------------
  renderStencil() {
    const R = Math.round(gui.colRadius);
    this.context.strokeStyle = "green";
    this.context.lineWidth = 1;
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
    const R = Math.round(gui.colRadius);
    this.context.beginPath();
    this.context.ellipse(x, y, R, R, 0, 0, 2*Math.PI);
    this.context.stroke();
  }
  //--------------------------------------------------------------------
  captureNode(x, y) {
    const R = Math.round(gui.colRadius);
    return this.context.getImageData(x-R, y-R, 2*R+1, 2*R+1).data;
  }
};

