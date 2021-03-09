class LogGaborFilter {
  constructor(numLoops, filterWidth) { // NK, NP, N) {
    this.filterWidth  = filterWidth || 49; // length and width of filter in pixels
    var NI = this.filterWidth;
    var NJ = this.filterWidth;
    var NK = numLoops+1;  // number of length scales
    var W = (NK>1 ? 6*NI*(NK-1) : NI);
    var H = NJ*NK;
    
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'filterView';
    this.canvas.width = W;
    this.canvas.height = H;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    
    document.getElementById('filter').appendChild(this.canvas);
    
    this.G = [];                    // Filter bank
    this.minG = 1e30;
    this.maxG = -1e30;
    const sra = 0.996*Math.sqrt(2/3); // standard deviation in ra
    const den1 = -0.5/(sra*sra);
    for (var k=0; k<NK; ++k) {
      this.G[k] = [];   // Filter banks for the k'th scale
      const NP = (6*k || 1); // Number of filters at the k'th scale (mini-column loops)
      const r0 = Math.log2(NI) - k;
      const sth = 0.996*Math.PI/(Math.sqrt(2)*NP); // standard deviation in th
      const den2 = -0.5/(sth*sth);
      for (var p=0; p<NP; ++p) {
        this.G[k][p] = new Array(NJ);
        const th0 = ( k%2 ? p : p+0.5 )*Math.PI/NP;
        const sinth0 = Math.sin(th0);
        const costh0 = Math.cos(th0);
        for (var j=0; j<NJ; ++j) {
          this.G[k][p][j] = new Float32Array(NI);
          const y = j-NJ/2;
          for (var i=0; i<NI; ++i) {
            const x = i-NI/2;
            const r = Math.sqrt(x**2 + y**2);
            const dr = r - r0;
            const Gr = Math.exp(dr*dr*den1);

            const th = Math.atan2(-y, x);
            const sinth = Math.sin(th);
            const costh = Math.cos(th);
            const ds = sinth*costh0 - costh*sinth0;
            const dc = costh*costh0 + sinth*sinth0;
            const dth = Math.abs(Math.atan2(ds,dc));
            const Gth = Math.exp(dth*dth*den2);
            
            const G = (k ? Gr*Gth : Math.exp(r*r*den1));
            //const G = Gr*Gth;
            this.G[k][p][j][i] = G;
            this.minG = Math.min(this.minG, G);
            this.maxG = Math.max(this.maxG, G);
          }
        }
        // console.log(this.G[k][p]);
        // console.log(this.img[k][p]);
      }
    }
  }
  render() {
    const NI = this.filterWidth;
    const NJ = this.filterWidth;
    const NK = this.G.length;
    const W = this.canvas.width;
    const H = this.canvas.height;
    let data = new Uint8ClampedArray(4*W*H);
    const lut = new THREE.Lut('cooltowarm', 256);
    lut.setMin(this.minG);
    lut.setMax(this.maxG);
    console.log("minG: ", this.minG, ", maxG: ", this.maxG);
    for (var i=0; i<4*W*H; ++i) data[i] = 0;
    for (var k=0; k<NK; ++k) {
      let NP = this.G[k].length;
      let J0 = k*NJ; // Starting row index for k'th scale filter
      let I0 = Math.floor((W - NI*NP)/2); // Starting col index for k'th scale filter
      for (var p=0; p<NP; ++p) {
        for (var j=0; j<NJ; ++j) {
          var jj = J0 + j;
          for (var i=0; i<NI; ++i) {
            var ii = I0 + NI*p + i;
            const color = lut.getColor(this.G[k][p][j][i]);
            // for (var a=0; a<3; ++a) data[4*((jj)*W+ii)+a] = 255;
            data[4*((jj)*W+ii)+0] = 255*color.r;
            data[4*((jj)*W+ii)+1] = 255*color.g;
            data[4*((jj)*W+ii)+2] = 255*color.b;
            data[4*((jj)*W+ii)+3] = 255*this.G[k][p][j][i];
          }
        }
      }
    }
    this.img = new ImageData(data, W, H);
    this.context.clearRect(0, 0, W, H);
    this.context.putImageData(this.img, 0, 0);
  }
};

