"use strict";

//--------------------------------------------------------------------
// Renders a view of the cortical columns, mini-columns, neurons, etc.
//--------------------------------------------------------------------
class Cortex extends THREE.Group {
  //------------------------------------------------------------------
  constructor() {
    super();
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
          col.visible = ii<gui.numColumns;
          this.columns.push(col);
          this.add(col);
        }
      }
    }
    this.rotateY(-Math.PI/6);
    this.saccade = gui.saccade;
    this.saccadeDelay = 0.3;
    this.lastSaccade = 0;
    this.columns.forEach( function(col, idx) {
      col.miniColumns.forEach( function(mc, i) {
        mc.pos = new THREE.Vector3(0,0,0);
        mc.getWorldPosition(mc.pos);
      } );
    } );
  }
  //------------------------------------------------------------------
  // For debugging. This will eventually always be true.
  allowSaccades( flag ) {
    this.saccade = flag;
  }
  //------------------------------------------------------------------
  // TODO: Replace this with self-directed attention
  getSaccade() {
    return { x: Math.random() - 0.5,
             y: Math.random() - 0.5 };
  }
  //------------------------------------------------------------------
  // Perform an update on the cortex state
  update(dt) {
    if (this.saccade) {
      this.lastSaccade += dt;
      if (this.lastSaccade > this.saccadeDelay) {
        this.lastSaccade -= this.saccadeDelay;
        seqView.moveMouse(this.getSaccade());
      }
    }
    const sensor = seqView.stencilData;
    const colData = this.columns.slice(0, gui.numColumns);
    colData.forEach( function(col,idx) {
      if (sensor && sensor[idx]) col.updateState(sensor[idx], dt);
    } );
  }
}
