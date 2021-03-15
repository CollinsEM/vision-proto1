"use strict";

const sqrt3 = Math.sqrt(3);

var gui, seqView, inputView, outputView, cortexView, logGabor;
var cortex;

let numColLoops= 5;           // number of loops of columns to generate
let maxColumns = 1;           // number of columns to generate
for (var i=1; i<=numColLoops; ++i) maxColumns += i*6;
let numColumns = maxColumns;  // number of columns currently visible
let colRadius = 400;
let colHeight = 800;
let maxSensorRadius = 7;

var numMCLoops = 2;           // number of loops of minicolumns to generate
var maxMiniCols= 1 + 6*numMCLoops*(numMCLoops+1)/2;// Maximum number of minicolumns


var maxNeurons = 3*91;        // number of neurons per minicolumn to generate
var numNeurons =  8;          // number of neurons per minicolumn currently visible

// this.maxProximalDistance = r/4;
// this.numProximalDendrites = 4;
// this.maxProximalDendrites = 10;

// this.minDistalDistance = r/8;
// this.maxDistalDistance = r/2;
// this.numDistalDendrites = 1;
// this.maxDistalDendrites = 6;

// this.numDendriteSegments = 20;


var columnLayer = 1;
var miniColumnLayer = 2;
var neuronLayer     = 3;
var proximalLayer   = 4;
var distalLayer     = 5;
var apicalLayer     = 6;

window.addEventListener( 'load', init, false );
window.addEventListener( 'resize', onWindowResize, false );

//--------------------------------------------------------------------
function init() {
  logGabor = new LogGaborFilter(numMCLoops+1, 2*maxSensorRadius+1);
  // For static filters, we should only need to do this once.
  // logGabor.render();
  
  gui = new GUI();
  
  seqView = new SequenceView(gui.NI, gui.NJ);
  inputView = new GatedInputView();
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
	if (gui.animate) requestAnimationFrame( animate );
  else cortex.update();
  // Render the current sequence of MNIST numbers. This method only
  // renders the MNIST digits without the stencil. The raw image data
  // under the stencil is then queried in the cortex.update() method.
  seqView.render();
  inputView.render();
  // Update the cortex state using the current sensor data.
  cortex.update();
  // Render the current attention stencil in the sequence view after
  // data has been received by the cortex update.
  seqView.renderStencil();
  // Render the cortex visualization.
	cortexView.render();
  // Render filters
  logGabor.render();
}

