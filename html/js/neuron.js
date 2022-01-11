"use strict";

//--------------------------------------------------------------------
class Neuron {
  constructor(obj) {
    this.name = obj.parent.name + ":N#" + obj.idx.toString();
    this.predicted = false;
    this.activated = false;
    this.axon = new AxonalSegment(this);
    this.prox = new DendriteSegment(this);
    this.dist = [ ];
    this.apic = [ ];
    // this.distView = new DendriteView(gui.distal.numSegs);
    // this.apicView = new DendriteView(gui.apical.numSegs);
    this.activation = 0;
    this.distalActivation = 0;
    this.apicalActivation = 0;
    this.numActivations = 0;
    // Copy over all settings from constructor argument
    Object.keys(obj).forEach( key => this[key] = obj[key], this );
	}
  // Update predictive state bias from distal and apical dendrite inputs
  updateDendrites() {
    var distal = this.updateDistal();
    var apical = this.updateApical();
    this.predicted = ( distal > gui.distal.threshold ||
                       apical > gui.apical.threshold );
    return (distal + apical);
  }
  // Update distal dendrites
  updateDistal() {
    var distal = 0;
    this.dist.forEach( function( seg ) {
      distal += seg.update();
    }, this );
    this.distalActivation = distal;
    return distal;
  }
  // Update apical dendrites
  updateApical() {
    var apical = 0;
    this.apic.forEach( function( seg ) {
      apical += seg.update();
    }, this );
    this.apicalActivation = apical;
    return apical;
  }
  // Update current state from proximal dendrite input
  updateProximal() {
    // var proximal = this.prox.update();
    // if (this.proximal > gui.proximalThreshold) {
    //   this.activate();
    // }
    // this.activation = proximal;
    return this.activation;
  }
  trainDistal(activated, predicted) {
    if (activated) {
      if (predicted) {
        this.dist.forEach( function( seg ) {
          seg.train(activated, predicted);
        }, this );
      }
      else { // minicolumn has burst, look for other co-activated neurons
        const M = maxMiniCols;
        const N = gui.neuron.count;
        // If no dendrite segments exist, grow a new one.
        if (this.dist.length < gui.distal.numSegments) {
          // Attempt to populate dendrite segment with active neurons in
          // other mini-columns within the current column. Stop when the
          // dendrite has some maximum number of children.
          const seg = new DendriteSegment(this);
          for (var i=0; i<128 && seg.children.size<128; ++i) {
            const m = Math.floor(M*Math.random());
            const n = Math.floor(N*Math.random());
            const tgt = this.parent.parent.miniColumns[m].neuronData[n];
            // if (tgt == undefined || tgt.activated == undefined) console.log(tgt);
            if (tgt.activated) seg.addChild(tgt);
          }
          this.dist.push(seg);
          this.distView.push(seg);
        }
      }
    }
  }
  activate() {
    this.numActivations++;
    this.axon.activate();
    this.activated = true;
    this.activation = this.parent.prox[this.channel];
  }
  decay() {
    this.activation *= 0.9;
  }
};
