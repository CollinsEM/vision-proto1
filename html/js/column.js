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
  constructor(radius, height, numLoops, idx) {
    super();
    this.idx = idx;
    this.name = "COL#" + idx.toString();
    this.radius = radius;
    this.numMCs = 1;
    this.miniColumns = [];
    var mcr = radius/(2*numLoops+1);
    var mch = height;
		var mc = new MiniColumn(mcr, mch, 0, this)
    this.miniColumns.push(mc);
    this.add(mc);
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
    this.logGabor = [];
    const NK = numMCLoops + 1;
    for (var k=0; k<NK; ++k) {
      const NP = (6*k || 1);
      for (var p=0; p<NP; ++p) {
        this.logGabor.push(logGabor.G[k][p]);
      }
    }
    this.filters = [ centerOn, centerOff, xSobel, ySobel, xScharr, yScharr ];

    // var cylGeom = new THREE.CylinderBufferGeometry( 5*r/2, 5*r/2, r, 6, 1, true);
    // var cylMat = new THREE.MeshBasicMaterial( { color: 0x808080,
    //                                             // blending: THREE.AdditiveBlending,
    //                                             side: THREE.DoubleSide,
    //                                             transparent: true,
    //                                             opacity: 0.1 });
    // this.helper = new THREE.Mesh(cylGeom, cylMat);
    // this.add(this.helper);
    this.sum = new Float32Array(3*maxMiniCols);
    this.sdr = new Uint8Array(3*maxMiniCols);
  }
  //--------------------------------------------------------------------
  updatePositions() {
    this.miniColumns.forEach( function(mc, i) {
      mc.updatePositions();
    }, this);
  }
  //--------------------------------------------------------------------
  // data: Uint8Array[100] Local RGBA sensor input data for this
  // column. This data will need to be encoded and spatially pooled
  // before being passed on to the minicolumns.
  updateState(data) {
    const filterWidth = (gui.gabor ? logGabor.filterWidth : 3);
    const G = (gui.gabor ? this.logGabor : this.filters);
    const N = 3*maxMiniCols;
    const R = Math.round(gui.colRadius);
    const NX = 2*R+1; // Width of data patch (in pixels)
    const NY = 2*R+1; // Height of data patch (in pixels)
    const NI = filterWidth; // Width of filter patch
    const NJ = filterWidth; // Height of filter patch
    this.min =  1000;
    this.max = -1000;
    var idx=0;
    for (var f=0; f<G.length && idx<N; ++f) {
      for (var k=0; k<3 && idx<N; ++k, ++idx) {
        this.sum[idx] = 0;
        for (var j=0; j<NJ; ++j) {
          const y = Math.floor(j*NY/NJ);
          for (var i=0; i<NI; ++i) {
            const x = Math.floor(i*NX/NI);
            this.sum[idx] += G[f][j][i]*data[4*(y*NX+x)+k];
          }
        }
        this.min = Math.min(this.min, this.sum[idx]);
        this.max = Math.max(this.max, this.sum[idx]);
      }
    }
    while (idx < N) {
      this.sum[idx++] = this.min;
    }
    // this.sdr[0] = 0;
    for (var i=0; i<N; ++i) {
      this.sdr[i] = parseInt(255*(this.sum[i] - this.min)/(this.max-this.min));
    }
    var i=0;
    this.miniColumns.forEach( function(mc, idx) {
      // var c = this.sdr[i]/255;
      // var color = new THREE.Color(c,c,c);
      var r = (this.sum[i++] - this.min)/(this.max-this.min);
      var g = (this.sum[i++] - this.min)/(this.max-this.min);
      var b = (this.sum[i++] - this.min)/(this.max-this.min);
      var color = new THREE.Color(r,g,b);
      mc.mat.color = color;
      mc.updateState(this.sdr);
    }, this);
  }
};
var tmp=0;
