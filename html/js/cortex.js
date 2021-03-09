//--------------------------------------------------------------------
// Renders a view of the cortical columns, mini-columns, neurons, etc.
//--------------------------------------------------------------------
class Cortex extends THREE.Group {
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
          this.columns.push(col);
          this.add(col);
        }
      }
    }
  }
  allowSaccades( flag ) {
    console.log("Cortex.allowSaccades(" + flag + ")");
  }
  update(sensor) {
    if (gui.saccade) {
      const dx = Math.random() - 0.5;
      const dy = Math.random() - 0.5;
      seqView.setMouse(seqView.x0 + dx, seqView.y0 + dy);
    }
    this.columns.forEach( function(col,idx) {
      if (sensor && sensor[idx]) col.updateState(sensor[idx]);
    } );
  }
}
