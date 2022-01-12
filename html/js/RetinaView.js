"use strict"

class RetinaPatch extends THREE.Group {
  //------------------------------------------------------------------
  constructor(x0, y0, N, color) {
    super();
    // Patch center (in pixel coordinates)
    this.x0 = x0;
    this.y0 = y0;
    // Default radius of sensor at the center of the patch (in pixel
    // coordinates)
    this.r0 = 3;
    // Number of sensors
    this.numSensors = N;
    // Enable motor
    this.enableMotor = gui.saccades;
    // Sensor offsets relative to patch center
    this.x = new Float32Array(N);
    this.y = new Float32Array(N);
    this.r = new Float32Array(N);
    // Initialize the retina sensor positions
    this.setScale(gui.retinaScale);
    // Patch data from environment (Array of ImageData objects)
    this.sensorPatch = new Array(N);
    //----------------------------------
    // Init graphical display
    this.columns = [];
	  var col = new Column(colRadius, colHeight, numMCLoops, 0, color)
    this.columns.push(col);
    this.add(col);
	  for (var i=1, ii=1; i<=numColLoops; ++i) {
      for (var j=1; j<=i; ++j) {
        var x = (2*i-j)*sqrt3/2;
        var y = (j*3/2);
        var rad = colRadius*Math.sqrt(x*x + y*y);
        var ang = Math.atan2(y, x);
        for (var k=0, th=ang; k<6; ++k, ++ii, th+=Math.PI/3) {
		      col = new Column(colRadius, colHeight, numMCLoops, ii, color);
   	      col.translateX(rad*Math.cos(th));
		      col.translateZ(rad*Math.sin(th));
          col.visible = ii<gui.column.count;
          this.columns.push(col);
          this.add(col);
        }
      }
    }
    this.rotateY(-Math.PI/6);
    this.shiftFocusDelay = 0.3;
    this.lastShiftFocus = 0;
    this.columns.forEach( function(col, idx) {
      col.miniColumns.forEach( function(mc, i) {
        mc.pos = new THREE.Vector3(0,0,0);
        mc.getWorldPosition(mc.pos);
      } );
    } );
  }
  //------------------------------------------------------------------
  setScale(factor) {
    this.x[0] = 0.0;
    this.y[0] = 0.0;
    this.r[0] = this.r0*factor;
	  for (var i=1, ii=1; i<=numColLoops && ii<this.numSensors; ++i) {
      for (var j=1; j<=i && ii<this.numSensors; ++j) {
        var x1  = (2*i-j)*sqrt3/2;
        var y1  = (j*3/2);
        var r   = this.r0*factor*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<this.numSensors; ++k, ++ii, th+=Math.PI/3) {
          this.x[ii] = Math.floor(r*Math.cos(th));
          this.y[ii] = Math.floor(r*Math.sin(th));
          this.r[ii] = this.r0*factor;
        }
      }
    }
  }
  //------------------------------------------------------------------
  // Update sensor position based on motor control feedback
  updateMotor(dt) {
    this.sinceLastShift += dt;
    if (this.sinceLastShift > this.motorDelay) {
      this.sinceLastShift -= this.motorDelay;
      const delta = this.getMovement();
      this.x0 += delta.x;
      this.y0 += delta.y;
    }
  }
  //------------------------------------------------------------------
  // Update cortex state based on sensor input
  updateSensor(dt) {
    // Extract the image data under the current fovea stencil from the
    // provided canvas context
    const x0 = seqView.x0 + this.x0;
    const y0 = seqView.y0 + this.y0;
    for (let i=0; i<this.numSensors; ++i) {
      const x = x0 + this.x[i];
      const y = y0 + this.y[i];
      const r = this.r[i];
      this.sensorPatch[i] = seqView.context.getImageData(x-r, y-r, 2*r+1, 2*r+1).data;
    }
    const data = this.sensorPatch;
    const colData = this.columns.slice(0, gui.column.count);
    colData.forEach( function(col,idx) {
      if (data && data[idx]) col.updateState(data[idx]);
    } );
  }
  // Draw the fovea sensor on top of the sequence canvas
  renderStencil(color) {
    const N = Math.min(this.numSensors, gui.column.count);
    const x0 = seqView.x0 + this.x0;
    const y0 = seqView.y0 + this.y0;
    seqView.context.strokeStyle = (color || "green");
    seqView.context.lineWidth = 1;
    for (let i=0; i<N; ++i) {
      const x = x0 + this.x[i];
      const y = y0 + this.y[i];
      const r = this.r[i];
      seqView.context.beginPath();
      seqView.context.ellipse(x, y, r, r, 0, 0, 2*Math.PI);
      seqView.context.stroke();
    }
  }
  //------------------------------------------------------------------
  // Perform an update on the cortex state
  update(dt) {
    if (this.enableMotor) this.updateMotor(dt);
    if (this.sensorPatch) this.updateSensor(dt);
  }
  //------------------------------------------------------------------
  // TODO: Replace this with self-directed attention
  getMovement() {
    return { x: Math.random() - 0.5,
             y: Math.random() - 0.5 };
  }
};
