"use strict";

//--------------------------------------------------------------------
// Renders a view of the cortical columns, mini-columns, neurons, etc.
//--------------------------------------------------------------------
class Cortex extends THREE.Group {
  //------------------------------------------------------------------
  constructor(sensorPatch) {
    super();
    this.sensorPatch = sensorPatch;
    this.columns = [];
	  var col = new Column(colRadius, colHeight, numMCLoops, 0)
    this.columns.push(col);
    this.add(col);
	  for (var i=1, ii=1; i<=numColLoops; ++i) {
      for (var j=1; j<=i; ++j) {
        var x = (2*i-j)*sqrt3/2;
        var y = (j*3/2);
        var rad = colRadius*Math.sqrt(x*x + y*y);
        var ang = Math.atan2(y, x);
        for (var k=0, th=ang; k<6; ++k, ++ii, th+=Math.PI/3) {
		      col = new Column(colRadius, colHeight, numMCLoops, ii);
   	      col.translateX(rad*Math.cos(th));
		      col.translateZ(rad*Math.sin(th));
          col.visible = ii<gui.column.count;
          this.columns.push(col);
          this.add(col);
        }
      }
    }
    this.rotateY(-Math.PI/6);
    this.enableMotor = gui.shiftFocus;
    this.motorDelay = 0.3;
    this.sinceLastShift = 0;
    
    this.columns.forEach( function(col, idx) {
      col.miniColumns.forEach( function(mc, i) {
        mc.pos = new THREE.Vector3(0,0,0);
        mc.getWorldPosition(mc.pos);
      } );
    } );
  }
  //------------------------------------------------------------------
  // Update sensor position based on motor control feedback
  updateMotor(dt) {
    this.sinceLastShift += dt;
    if (this.sinceLastShift > this.motorDelay) {
      this.sinceLastShift -= this.motorDelay;
      seqView.moveMouse(this.getMovement());
    }
  }
  //------------------------------------------------------------------
  // Update cortex state based on sensor input
  updateSensor(dt) {
    const data = this.sensorPatch;
    const colData = this.columns.slice(0, gui.column.count);
    colData.forEach( function(col,idx) {
      if (data && data[idx]) col.updateState(data[idx], dt);
    } );
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
}
