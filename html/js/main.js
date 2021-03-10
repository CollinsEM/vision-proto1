"use strict";
var sqrt3 = Math.sqrt(3);

var gui, seqView, cortex, cortexView, logGabor;

let numColLoops= 5;           // number of loops of columns to generate
let maxColumns = 1;           // number of columns to generate
for (var i=1; i<=numColLoops; ++i) maxColumns += i*6;
let numColumns = maxColumns;  // number of columns currently visible
let colRadius = 400;
let colHeight = 800;
let maxSensorRadius = 7;

var numMCLoops = 1;           // number of loops of minicolumns to generate
var maxMiniCols= 1 + 6*numMCLoops*(numMCLoops+1)/2;// Maximum number of minicolumns

var maxNeurons = 64;          // number of neurons per minicolumn to generate
var numNeurons = 16;          // number of neurons per minicolumn currently visible

// this.maxProximalDistance = r/4;
// this.numProximalDendrites = 4;
// this.maxProximalDendrites = 10;

// this.minDistalDistance = r/8;
// this.maxDistalDistance = r/2;
// this.numDistalDendrites = 1;
// this.maxDistalDendrites = 6;

// this.numDendriteSegments = 20;


var miniColumnLayer = 1;
var neuronLayer     = 2;
var proximalLayer   = 3;
var distalLayer     = 4;
var apicalLayer     = 5;

window.addEventListener( 'load', init, false );
window.addEventListener( 'resize', onWindowResize, false );

//--------------------------------------------------------------------
function init() {
	gui = new GUI();
  
  logGabor = new LogGaborFilter(numMCLoops+1, 2*maxSensorRadius+1);
  // For static filters, we should only need to do this once.
  logGabor.render();
  
  seqView = new SequenceView(gui.NI, gui.NJ);
  cortex = new Cortex();
  cortexView = new CortexView(cortex);
  
  console.log("Number of columns generated", maxColumns);
  console.log("Number of mini-columns per column", maxMiniCols);
  console.log("Number of neurons per mini-column", numNeurons);
  
  animate();
}
//--------------------------------------------------------------------
function onWindowResize() {
  cortexView.resize();
}
//--------------------------------------------------------------------
// var frame = 0;
function animate() {
  // Schedule the next screen refresh
	requestAnimationFrame( animate );
  // Render the current sequence of MNIST numbers. This method only
  // renders the MNIST digits without the stencil. The raw image data
  // under the stencil is then forwarded to the cortex.update()
  // method.
  seqView.render();
  // Update the cortex state using the current sensor data.
  cortex.update(seqView.stencilData);
  // Render the cortex visualization.
	cortexView.render();
  // Render the current attention stencil in the sequence view.
  seqView.renderStencil();
}

