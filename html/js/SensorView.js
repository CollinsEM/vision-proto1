class GatedInputView {
  constructor() {
    const W = (2*numColLoops+1)*2*maxSensorRadius;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'GatedInputView';
    this.canvas.width = W;
    this.canvas.height = W;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    document.getElementById('gatedInput').appendChild(this.canvas);
  }
  render() {
    const N = gui.column.count;
    const R = Math.round(gui.retinaScale);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Save the image data under the current fovea stencil
    var x0 = seqView.x0;
    var y0 = seqView.y0;
    this.update(0, x0, y0);
    for (var i=1, ii=1; i<=numColLoops && ii<N; ++i) {
      for (var j=1; j<=i && ii<N; ++j, ++ii) {
        var x1 = (2*i-j)*sqrt3/2;
        var y1 = (j*3/2);
        var rad = R*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<N; ++k, th+=Math.PI/3) {
          const x = Math.floor(x0 + rad*Math.cos(th));
          const y = Math.floor(y0 + rad*Math.sin(th));
          this.update(ii, x, y);
        }
      }
    }
  }
  update(ii, x, y) {
    const W = this.canvas.width;
    const R = Math.round(gui.retinaScale);
    const C = Math.floor(W/2);
    const w = logGabor.filterWidth;
    const img = seqView.captureNode(x, y);
    const colData = cortex.columns[ii];
    colData.miniColumns.forEach( function( mcData, jj ) {
      // If the minicolumn is currently activated, then remove the
      // contribution of its filter from the input.
      if (mcData.activated) {
        const filter = mcData.filter;
        for (let i=0; i<w; ++i) {
          for (let j=0; j<w; ++j) {
            for (let k=0; k<3; ++k) {
              img.data[(i*w+j)*4+k] -= mcData.prox[k]*filter[i*w+j];
            }
          }
        }
      }
    }, this );
    this.context.putImageData(img, C-w+y, C-w+y);
    if (tmp < 10) {
      console.log(W, w, R, C, x, y, C-w+x, C-w+y);
      tmp++;
    }
  }
};
var tmp = 0;
    // let p=0;
    // for (let i=-R; i<=R; ++i) {
    //   for (let j=-R; j<=R; ++j) {
    //     const rSq = i*i + j*j;
    //     const A = Math.exp(rSq*den1);
    //     for (let k=0; k<3; ++k) {
    //       img.data[p++] *= A;
    //     }
    //     img.data[p++] = 255;
    //   }
    // }
