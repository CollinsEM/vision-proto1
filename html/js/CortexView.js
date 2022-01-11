"use strict";

//--------------------------------------------------------------------
// Renders a view of the cortical columns, mini-columns, neurons, etc.
//--------------------------------------------------------------------
class CortexView extends THREE.Scene {
  //------------------------------------------------------------------
  constructor(cortex) {
    super();
    
	  var container = document.getElementById( 'container' );
    var aspect = window.innerWidth / window.innerHeight;
	  this.camera = new THREE.PerspectiveCamera( 45, aspect, 1, 50000 );
	  this.camera.position.x = 0;
	  this.camera.position.y = 10000;
	  this.camera.position.z = 0;
    if (gui.neuron.show)
      this.camera.layers.enable(neuronLayer);
    else
      this.camera.layers.disable(neuronLayer);
    if (gui.column.show)
      this.camera.layers.enable(columnLayer);
    else
      this.camera.layers.disable(columnLayer);
    if (gui.miniColumn.show)
      this.camera.layers.enable(miniColumnLayer);
    else
      this.camera.layers.disable(miniColumnLayer);
    if (gui.proximal.show)
      this.camera.layers.enable(proximalLayer);
    else
      this.camera.layers.disable(proximalLayer);
    if (gui.distal.show)
      this.camera.layers.enable(distalLayer);
    else this.camera.layers.disable(distalLayer);
    if (gui.apical.show)
      this.camera.layers.enable(apicalLayer);
    else
      this.camera.layers.disable(apicalLayer);
  
	  var controls = new THREE.OrbitControls( this.camera, container );

	  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	  this.renderer.setPixelRatio( window.devicePixelRatio );
	  this.renderer.setSize( window.innerWidth, window.innerHeight );
	  container.appendChild( this.renderer.domElement );

	  // this.stats = new Stats();
	  // container.appendChild( this.stats.dom );
  }
  //------------------------------------------------------------------
  resize() {
	  this.camera.aspect = window.innerWidth / window.innerHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  //------------------------------------------------------------------
  render() {
	  if (this.stats) this.stats.update();
	  this.renderer.render( this, this.camera );
  }
};
