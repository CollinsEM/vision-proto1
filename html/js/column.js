"use strict";

const colRadius = 400;
const colHeight = 800;

// number of loops of columns to generate
const numColLoops= 3; // integer value from 3 to 5 should work
// number of columns to generate
const maxColumns = 1 + 6*numColLoops*(numColLoops+1)/2;

// Center-On Stencil
var centerOn = [ [ -2, -1, -2 ],
                 [ -1, 12, -1 ],
                 [ -2, -1, -2 ] ];
// Center-Off Stencil
var centerOff = [ [ 2,   1,  2 ],
                  [ 1, -12,  1 ],
                  [ 2,   1,  2 ] ];
// Sobel gradient stencils
var xSobel = [ [ -1, 0, 1 ],
               [ -2, 0, 2 ],
               [ -1, 0, 1 ] ];
var ySobel = [ [ -1,-2,-1 ],
               [  0, 0, 0 ],
               [  1, 2, 1 ] ];
// Scharr gradient stencils
var xScharr = [ [  3,  0, -3 ],
                [ 10,  0,-10 ],
                [  3,  0, -3 ] ];
var yScharr = [ [  3, 10,  3 ],
                [  0,  0,  0 ],
                [ -3,-10, -3 ] ];
// var filters = [ centerOn, centerOff, xSobel, ySobel, xScharr, yScharr ];
// var filters = [ centerOn, centerOff, xSobel, ySobel ];
// var filters = [ centerOn, centerOff ];

//--------------------------------------------------------------------
class Column extends THREE.Group {
  constructor(radius, height, numLoops, column) {
    super();
    this.lo = new THREE.Color(0x000000); // (0x808080);
    this.hi = new THREE.Color(0xFFFFFF);
    this.name   = "COL#" + column.toString();
    this.radius = radius;
    this.height = height;
    this.column = column;
    
    var mcr = radius/(2*numLoops+1);
    var mch = height;
		var mc = new MiniColumn(mcr, mch, 0, this, logGabor[0])
    this.miniColumns = [];
    this.miniColumns.push(mc);
    this.add(mc);
    this.numMCs = 1;
	  for (var i=1, ii=1; i<=numLoops; ++i) {
      this.numMCs += i*6;
      for (var j=1; j<=i; ++j) {
        var x = (2*i-j)*sqrt3/2;
        var y = (3*j/2);
        var rad = mcr*Math.sqrt(x*x + y*y);
        var ang = Math.atan2(-y, x);
        for (var k=0, th=ang; k<6; ++k, ++ii, th+=Math.PI/3) {
		      mc = new MiniColumn(mcr, mch, ii, this, logGabor[ii]);
   	      mc.translateX(rad*Math.cos(th));
		      mc.translateZ(rad*Math.sin(th));
          this.miniColumns.push(mc);
          this.add(mc);
        }
      }
    }
    this.rotateY(Math.PI/6);
    //------------------------------------------------------------------
    // Comment out when no longer needed.
    this.geom = new THREE.CylinderBufferGeometry( radius, radius,
                                                  height, 6, 1, true);
    this.mat = new THREE.MeshBasicMaterial( { color: 0x101010,
                                              // blending: THREE.AdditiveBlending,
                                              wireframe: false,
                                              side: THREE.DoubleSide,
                                              transparent: true,
                                              opacity: gui.column.opacity } );
    this.helper = new THREE.Mesh(this.geom, this.mat);
    this.helper.layers.set(columnLayer);
    // this.helper.rotateY(Math.PI/6);
    this.add(this.helper);
    //------------------------------------------------------------------
    this.sum = new Float32Array(3*maxMiniCols);
    this.sdr = new Uint8Array(3*maxMiniCols);
  }
  //--------------------------------------------------------------------
  // data: (Uint8Array) Local RGBA sensor input data for this
  // column. This data will need to be encoded and spatially pooled
  // before being passed on to the minicolumns.
  updateState(data, dt) {
    // const omega = 5;
    // const phi0 = 2*this.position.x;
    // this.t += dt;
    // this.bias = 0.5 + 0.5*Math.sin(omega*this.t + phi0);
    // this.helper.material.color.lerpColors(this.lo, this.hi, this.bias);
    var min  = 1000; // Minimum activation over entire column
    var max  =-1000; // Maximum activation over entire column
    var idx  =-1;    // Minicolumn with maximum activation
    this.miniColumns.slice(0, gui.miniColumn.count)
      .forEach( function(mc, i) {
        mc.updateState(data, dt);
        for (var z=0; z<3; ++z) {
          min = Math.min(min, mc.prox[z]);
          if (mc.prox[z] > max && !mc.activated) {
            idx = i;
            max = mc.prox[z];
          }
        }
      }, this);
    if (max > gui.proximal.threshold) {
      // Shade the minicolumn with the maximum activation, fade the rest
      this.miniColumns[idx].activate(min, max);
    }
    this.miniColumns.slice(0, gui.miniColumn.count)
      .forEach( function(mc, i) {
        mc.renderNodes();
        mc.trainDistal();
        mc.decay();
      }, this);
  }
};
