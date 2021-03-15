class GatedInputView {
  constructor() {
    const W = (2*numColLoops+1)*14;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'GatedInputView';
    this.canvas.width = W;
    this.canvas.height = W;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    document.getElementById('gatedInput').appendChild(this.canvas);
  }
  render() {
    const W = (2*numColLoops+1)*14;
    const R = Math.round(gui.sensorRadius);
    const C = Math.floor((W-R)/2);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Save the image data under the current fovea stencil
    var x0 = seqView.x0;
    var y0 = seqView.y0;
    var ii = 0;
    if (ii<gui.numColumns) {
      const img = seqView.captureNode(x0, y0);
      this.context.putImageData(img, C, C);
    }
	  for (var i=1, ii=1; i<=numColLoops && ii<gui.numColumns; ++i) {
      for (var j=1; j<=i && ii<gui.numColumns; ++j, ++ii) {
        var x1 = (2*i-j)*sqrt3/2;
        var y1 = (j*3/2);
        var rad = R*Math.sqrt(x1*x1 + y1*y1);
        var ang = Math.atan2(y1, x1);
        for (var k=0, th=ang; k<6 && ii<gui.numColumns; ++k, th+=Math.PI/3) {
          const x = Math.floor(x0 + rad*Math.cos(th));
          const y = Math.floor(y0 + rad*Math.sin(th));
          const img = seqView.captureNode(x, y);
          this.context.putImageData(img, C+x-x0, C+y-y0);
        }
      }
    }
  }
};
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
