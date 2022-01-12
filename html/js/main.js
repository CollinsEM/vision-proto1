"use strict";

const sqrt3 = Math.sqrt(3);

// Scale factor for retinal sensors
const maxSensorRadius = 7;

var canvasTexture, inputView, cortex, logGabor;
var gui, seqView, cortexView, retinaL, retinaR;

var biasAmplitude = 0.25;
var biasColor = new THREE.Color(biasAmplitude, biasAmplitude, biasAmplitude);

var columnLayer     = 1;
var miniColumnLayer = 2;
var neuronLayer     = 3;
var proximalLayer   = 4;
var distalLayer     = 5;
var apicalLayer     = 6;

window.addEventListener( 'load', init, false );
window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'mouseup', onMouseUp, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mousemove', onMouseMove, false );

//--------------------------------------------------------------------
function init() {
  // Convolutional input filters for each minicolumn
  logGabor = new LogGaborFilter(numMCLoops+1, 2*maxSensorRadius+1);
  // Init global parameters to control the visualization
	gui = new GUI();
  // Init main window view of cortical columns
  cortexView = new CortexView();
  // Init inset window view of input field of view
  seqView = new SequenceView(gui.seq.NI, gui.seq.NJ);
  // Init left retina sensors
  retinaL = new RetinaPatch(-gui.eyeSep, 0, maxColumns, "yellow");
  retinaL.translateY( 0.55*colHeight);
  cortexView.add(retinaL);
  // Init right retina sensors
  retinaR = new RetinaPatch( gui.eyeSep, 0, maxColumns, "cyan");
  retinaR.translateY(-0.55*colHeight);
  cortexView.add(retinaR);
  // Init cortical patches attached to each retina
  // cortex  = new Cortex();
  // cortex.translateY(-1.55*colHeight);
  // cortexView.add(cortex);
  
  // inputView = new GatedInputView();

  // Begin main loop
  animate();
}
//--------------------------------------------------------------------
function onWindowResize() { if (cortexView) cortexView.resize(); }
//--------------------------------------------------------------------
let doUpdate = false;
function onMouseUp() { doUpdate = false; }
//--------------------------------------------------------------------
function onMouseDown() { doUpdate = true; }
//--------------------------------------------------------------------
function onMouseMove() { if (doUpdate) render(); }
//--------------------------------------------------------------------
// Schedule the next screen refresh
function animate() {
	if (gui.animate) requestAnimationFrame( animate );
  render();
}
//--------------------------------------------------------------------
const clock = new THREE.Clock();
let stime = 0;
function render() {
  const dt = clock.getDelta();
  stime += dt;
  // Render the current sequence of MNIST numbers. This method only
  // renders the MNIST digits without the retina stencil overlay
  seqView.render();
  // Extract the raw image data under the retina stencil.
  if (retinaL) retinaL.update(dt);
  if (retinaR) retinaR.update(dt);
  // Update the V1 cortex state using the current sensor data.
  if (cortex) cortex.update(dt);
  // Generate saccade if necessary
  // retinaL.updateMotor(dt);
  // retinaR.updateMotor(dt);
  // Render the cortex visualization.
	cortexView.render();
  // Render the current attention stencil in the sequence view.
  if (retinaL) retinaL.renderStencil("yellow");
  if (retinaR) retinaR.renderStencil("cyan");
  // Render filters
  // logGabor.render();

  // inputView.render();
}

