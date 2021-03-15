"use strict";

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
    this.name   = "COL#" + column.toString();
    this.radius = radius;
    this.height = height;
    this.column = column;
    
    var mcr = radius/(2*numLoops+1);
    var mch = height;
		var mc = new MiniColumn(mcr, mch, 0, this)
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
		      mc = new MiniColumn(mcr, mch, ii, this);
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
    var cylGeom = new THREE.CylinderBufferGeometry( radius, radius,
                                                    height, 6, 1, true);
    var cylMat = new THREE.MeshBasicMaterial( { color: 0x808080,
                                                // blending: THREE.AdditiveBlending,
                                                wireframe: true,
                                                side: THREE.DoubleSide,
                                                transparent: true,
                                                opacity: 0.1 } );
    this.helper = new THREE.Mesh(cylGeom, cylMat);
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
  updateState(data) {
    var min  = 1000; // Minimum activation
    var max  =-1000; // Maximum activation
    var idx  =-1;
    this.miniColumns.forEach( function(mc, i) {
      mc.updateState(data);
      for (var z=0; z<3; ++z) {
        min = Math.min(min, mc.min[z]);
        if (mc.max[z] > max) {
          idx = i;
          max = mc.max[z];
        }
      }
    }, this);
    
    this.miniColumns.forEach( function(mc, i) {
      var r = (mc.max[0]-min)/(max-min);
      var g = (mc.max[1]-min)/(max-min);
      var b = (mc.max[2]-min)/(max-min);
      var color = new THREE.Color(r,g,b);
      mc.mat.color = color;
    }, this);
    
    // const filterWidth = (gui.gabor ? logGabor.filterWidth : 3);
    // const G = (gui.gabor ? this.logGabor : this.filters);
    // const N = 3*maxMiniCols;
    // const R = Math.round(gui.sensorRadius);
    // const NX = 2*R+1; // Width of data patch (in pixels)
    // const NY = 2*R+1; // Height of data patch (in pixels)
    // const NI = filterWidth; // Width of filter patch
    // const NJ = filterWidth; // Height of filter patch
    // this.min =  1000;
    // this.max = -1000;
    // var idx=0;
    // for (var f=0; f<G.length && idx<N; ++f) {
    //   for (var k=0; k<3 && idx<N; ++k, ++idx) {
    //     this.sum[idx] = 0;
    //     for (var j=0; j<NJ; ++j) {
    //       const y = Math.floor(j*NY/NJ);
    //       for (var i=0; i<NI; ++i) {
    //         const x = Math.floor(i*NX/NI);
    //         this.sum[idx] += G[f][j][i]*data[4*(y*NX+x)+k];
    //       }
    //     }
    //     this.min = Math.min(this.min, this.sum[idx]);
    //     this.max = Math.max(this.max, this.sum[idx]);
    //   }
    // }
    // while (idx < N) {
    //   this.sum[idx++] = this.min;
    // }
    // // this.sdr[0] = 0;
    // for (var i=0; i<N; ++i) {
    //   this.sdr[i] = parseInt(255*(this.sum[i] - this.min)/(this.max-this.min));
    // }
    // var i=0;
    // this.miniColumns.forEach( function(mc, idx) {
    //   // var c = this.sdr[i]/255;
    //   // var color = new THREE.Color(c,c,c);
    //   var r = (this.sum[i++] - this.min)/(this.max-this.min);
    //   var g = (this.sum[i++] - this.min)/(this.max-this.min);
    //   var b = (this.sum[i++] - this.min)/(this.max-this.min);
    //   var color = new THREE.Color(r,g,b);
    //   mc.mat.color = color;
    //   mc.updateState(this.sdr);
    // }, this);
  }
};
var tmp=0;
