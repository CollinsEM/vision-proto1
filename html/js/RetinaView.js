class RetinaView {
  // ni, nj  Number of receptors (cones) per input pixel
  constructor(ni, nj, filter, target) {
    this.ni = ni;
    this.nj = nj;
    this.filter = filter;
    this.NI = numRows*ni;
    this.NJ = numCols*nj;
    this.canvas        = document.createElement('canvas');
    this.canvas.id     = target;
    this.canvas.width  = this.NJ;
    this.canvas.height = this.NI;
    this.context       = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    document.getElementById(target).appendChild(this.canvas);
  }
  // Render current attention area as it were being exposed to a
  // retina of spiking neurons. The probability of spiking is
  // proportional to the strength of the original pixel, but also
  // takes into account a refractory period for each neuron to recover
  // from its previous spike.
  render(src, x, y) {
    var input  = src.context.getImageData(x, y, numCols, numRows);
    var output = this.context.getImageData(0, 0, this.NI, this.NJ);
    // Choose 100 pixels at random to refresh during this update
    for (var z=0; z<100; ++z) {
      var si = Math.floor(Math.random()*(numRows-2))+1;
      var sj = Math.floor(Math.random()*(numCols-2))+1;
      var ti = si*this.ni;
      var tj = sj*this.nj;
      var r=0, g=0, b=0;
      for (var di=-1; di<2; ++di) {
        for (var dj=-1; dj<2; ++dj) {
          r += this.filter[di+1][dj+1]*input.data[((si+di)*numCols+(sj+dj))*4+0];
          g += this.filter[di+1][dj+1]*input.data[((si+di)*numCols+(sj+dj))*4+1];
          b += this.filter[di+1][dj+1]*input.data[((si+di)*numCols+(sj+dj))*4+2];
        }
      }
      var idx = ((si*this.ni)*this.NI + (sj*this.nj))*4;
      output.data[idx++] = r;
      output.data[idx++] = g;
      output.data[idx++] = b;
      output.data[idx++] = 255;
    }
    this.context.putImageData(output, 0, 0);
    // Render current attention area
    // this.context.drawImage( src.canvas,
    //                       Math.min(Math.max(0,x0)),
    //                       Math.min(Math.max(0,y0)),
    //                       numCols,numRows,
    //                       0, 0,
    //                       this.canvas.width, this.canvas.height );
            // output.data[idx] = ( output.data[idx] > 16 ?
            //                      output.data[idx]*0.95 :
            //                      Math.random()*pix[k] );
  }
};

