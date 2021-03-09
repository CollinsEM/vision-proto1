//--------------------------------------------------------------------
// Renders a view of the cortical columns, mini-columns, neurons, etc.
//--------------------------------------------------------------------
class CortexView extends THREE.Scene {
  constructor(cortex) {
    super();
    
	  var container = document.getElementById( 'container' );
    var aspect = window.innerWidth / window.innerHeight;
	  this.camera = new THREE.PerspectiveCamera( 45, aspect, 1, 50000 );
	  this.camera.position.x = 0;
	  this.camera.position.y = 5000;
	  this.camera.position.z = 0;
    if (gui.showNeurons)
      this.camera.layers.enable(neuronLayer);
    else
      this.camera.layers.disable(neuronLayer);
    if (gui.showMiniColumns)
      this.camera.layers.enable(miniColumnLayer);
    else
      this.camera.layers.disable(miniColumnLayer);
    if (gui.showProximal)
      this.camera.layers.enable(proximalLayer);
    else
      this.camera.layers.disable(proximalLayer);
    if (gui.showDistal)
      this.camera.layers.enable(distalLayer);
    else this.camera.layers.disable(distalLayer);
    if (gui.showApical)
      this.camera.layers.enable(apicalLayer);
    else
      this.camera.layers.disable(apicalLayer);
  
	  var controls = new THREE.OrbitControls( this.camera, container );

	  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	  this.renderer.setPixelRatio( window.devicePixelRatio );
	  this.renderer.setSize( window.innerWidth, window.innerHeight );
	  this.renderer.gammaInput = true;
	  this.renderer.gammaOutput = true;
	  container.appendChild( this.renderer.domElement );

	  this.stats = new Stats();
	  container.appendChild( this.stats.dom );
    
    this.cortex = cortex;
    this.add( this.cortex );
  }
  //--------------------------------------------------------------------
  initScene() {
	  // var col = new Column(colRadius, colHeight, numMCLoops, 0)
    // columns.push(col);
    // this.add(col);
	  // for (var i=1, ii=1; i<=numColLoops; ++i) {
    //   for (var j=1; j<=i; ++j) {
    //     var x = (2*i-j)*sqrt3/2;
    //     var y = (j*3/2);
    //     var rad = colRadius*Math.sqrt(x*x + y*y);
    //     var ang = Math.atan2(y, x);
    //     for (var k=0, th=ang; k<6; ++k, ++ii, th+=Math.PI/3) {
		//       col = new Column(colRadius, colHeight, numMCLoops, ii);
   	//       col.translateX(rad*Math.cos(th));
		//       col.translateZ(rad*Math.sin(th));
    //       columns.push(col);
    //       this.add(col);
    //     }
    //   }
    // }
  }
  resize() {
	  this.camera.aspect = window.innerWidth / window.innerHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  // update(sensor) {
  //   this.cortex.update(sensor);
  // }
  render() {
	  this.stats.update();
	  this.renderer.render( this, this.camera );
  }
};
