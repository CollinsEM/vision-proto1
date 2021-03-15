"use strict";

var distalThreshold = 25;
var proximalThreshold = 25;

//--------------------------------------------------------------------
class NeuronData {
  constructor(obj) {
    this.predicted = false;
    this.activated = false;
    this.proxSegments = [ ];
    this.distSegments = [ ];
    this.apicSegments = [ ];
    this.proxActive = 0;
    this.distActive = 0;
    this.apicActive = 0;
    // Copy over all settings from constructor argument
    Object.keys(obj).forEach( key => this[key] = obj[key], this );
	}
  // Update predictive state based on distal dendrite input
  updateDistalState(data) {
    var dist = 0;
    this.distSegments.forEach( function( jData ) {
      dist += (jData.activated ? 1 : 0);
    } );
    this.distActive = dist;
    return dist;
  }
  // Update current state from proximal dendrite input
  // data: image buffer data
  updateProximalState(data) {
    const z  = this.channel;
    const G  = this.filter;
    const NI = G.length; // Width of filter (in pixels)
    const NJ = G[0].length; // Height of filter (in pixels)
    const R  = Math.round(gui.sensorRadius);
    const NX = 2*R+1; // Width of receptive field on data patch (in pixels)
    const NY = 2*R+1; // Height of receptive field on data patch (in pixels)
    var prox = 0; // accumlate activations
    for (var j=0; j<NJ; ++j) { // filter coordinate (row)
      const y = Math.floor(j*NY/NJ); // patch coordinate (row)
      for (var i=0; i<NI; ++i) { // filter coordinate (col)
        const x = Math.floor(i*NX/NI); // patch coordinate (col)
        prox += G[j][i]*data[4*(y*NX+x)+z];
      }
    }
    this.proxActive = prox;
    return prox;
  }
};
