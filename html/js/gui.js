"use strict";

class GUI extends dat.GUI {
  constructor() {
    super();
    //================================================================
    // MNIST SEQUENCE
    this.seq = this.addFolder("MNIST Sequence");
    //----------------------------------------------------------------
    this.seq.NI = 3;
    this.seq.add( this.seq, "NI", 1, 5, 1 )
      .onChange( function( value ) {
        if (value != seqView.NI) seqView.resize( gui.seq.NI, gui.seq.NJ );
      } );
    //----------------------------------------------------------------
    this.seq.NJ = 6;
    this.seq.add( this.seq, "NJ", 1, 10, 1 )
      .onChange( function( value ) {
        if (value != seqView.NJ) seqView.resize( gui.seq.NI, gui.seq.NJ );
      } );
    //================================================================
    // COLUMNS
    this.column = this.addFolder("Columns");
    //----------------------------------------------------------------
	  this.column.show = true;
	  this.column.add( this.column, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(columnLayer);
      } );
    //----------------------------------------------------------------
	  this.column.count = 19;
	  this.column.add( this.column, "count", 1, maxColumns, 1 )
      .onChange( function( value ) {
        if (cortex)
          cortex.columns.forEach( function(col, idx) {
            col.visible = (idx < value);
          } );
        if (retinaL)
          retinaL.columns.forEach( function(col, idx) {
            col.visible = (idx < value);
          } );
        if (retinaR)
          retinaR.columns.forEach( function(col, idx) {
            col.visible = (idx < value);
          } );
	    } );
    //----------------------------------------------------------------
    this.column.opacity = 0.05;
	  this.column.add( this.column, "opacity", 0, 1, 0.01 )
      .onChange( function( value ) {
        if (cortex)
          cortex.columns.forEach( function(col, idx) {
		        col.mat.opacity = parseFloat( value );
          } );
        if (retinaL)
          retinaL.columns.forEach( function(col, idx) {
		        col.mat.opacity = parseFloat( value );
          } );
        if (retinaR)
          retinaR.columns.forEach( function(col, idx) {
		        col.mat.opacity = parseFloat( value );
          } );
	    } );
    //================================================================
    // MINI-COLUMN
    this.miniColumn = this.addFolder("Mini-Columns");
    //----------------------------------------------------------------
	  this.miniColumn.show = true;
	  this.miniColumn.add( this.miniColumn, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(miniColumnLayer);
      } );
    //----------------------------------------------------------------
	  this.miniColumn.count = maxMiniCols;
	  this.miniColumn.add( this.miniColumn, "count", 1, maxMiniCols, 1 )
      .onChange( function( value ) {
        if (cortex)
          cortex.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc, idx) {
              mc.visible = (idx < value);
            } );
          } );
        if (retinaL)
          retinaL.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc, idx) {
              mc.visible = (idx < value);
            } );
          } );
        if (retinaR)
          retinaR.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc, idx) {
              mc.visible = (idx < value);
            } );
          } );
	    } );
    //----------------------------------------------------------------
    this.miniColumn.opacity = 0.2;
	  this.miniColumn.add( this.miniColumn, "opacity", 0, 1, 0.01 )
      .onChange( function( value ) {
        if (cortex)
          cortex.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc) {
              mc.mat.opacity = parseFloat( value );
            } );
          } );
        if (retinaL)
          retinaL.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc) {
              mc.mat.opacity = parseFloat( value );
            } );
          } );
        if (retinaR)
          retinaR.columns.forEach( function(col) {
		        col.miniColumns.forEach( function(mc) {
              mc.mat.opacity = parseFloat( value );
            } );
          } );
	    } );
    //================================================================
    // NEURON
    this.neuron = this.addFolder("Neurons");
    //----------------------------------------------------------------
	  this.neuron.show = false;
	  this.neuron.add( this.neuron, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(neuronLayer);
      } );
    //----------------------------------------------------------------
	  this.neuron.count = numNeurons;
	  this.neuron.add( this.neuron, "count", 0, maxNeurons, 1 )
      .onChange( function( value ) {
        if (cortex)
          cortex.columns.forEach( function(col, idx) {
		        col.miniColumns.forEach( function(mc) {
              mc.setNumNeurons(value);
            } );
          } );
	    } );
    //================================================================
    // APICAL
    //------------------------------------
    this.apical = this.addFolder('Apical');
    //----------------------------------------------------------------
	  this.apical.show = false;
	  this.apical.add( this.apical, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(apicalLayer);
      } );
    //----------------------------------------------------------------
    this.apical.threshold = 10;
	  this.apical.add( this.apical, "threshold", 1, 100, 1 );
    //================================================================
    // DISTAL
    //------------------------------------
    this.distal = this.addFolder('Distal');
    //------------------------------------
	  this.distal.show = false;
	  this.distal.add( this.distal, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(distalLayer);
      } );
    //----------------------------------------------------------------
    this.distal.numSegs = 1;
	  this.distal.add( this.distal, "numSegs", 1, 20, 1 )
      .onChange( function( value ) {
        numDistalSegments = value;
      } );
    //----------------------------------------------------------------
    this.distal.threshold = 10;
	  this.distal.add( this.distal, "threshold", 1, 100, 1 );
    //================================================================
    // PROXIMAL
    //------------------------------------
    this.proximal = this.addFolder('Proximal');
    //----------------------------------------------------------------
	  this.proximal.show = false;
	  this.proximal.add( this.proximal, "show" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(proximalLayer);
      } );
    //----------------------------------------------------------------
    this.proximal.numSegs = 1;
	  this.proximal.add( this.proximal, "numSegs", 1, 20, 1 )
      .onChange( function( value ) {
        numProximalSegments = value;
      } );
    //----------------------------------------------------------------
    this.proximal.threshold = 10;
	  this.proximal.add( this.proximal, "threshold", 1, 100, 1 );
    //================================================================
    // ROOT
    //----------------------------------------------------------------
	  this.animate = true;
    this.add( this, "animate" )
      .onChange( function( value ) {
        if (value) animate();
      } );
    //----------------------------------------------------------------
	  this.shiftFocus = false;
	  this.add( this, "shiftFocus" )
      .onChange( function( value ) {
        if (seqView) seqView.enableMotor = value;
        if (cortex) cortex.enableMotor = value;
      } );
    //----------------------------------------------------------------
	  this.saccades = false;
	  this.add( this, "saccades" )
      .onChange( function( value ) {
        if (retinaL) retinaL.enableMotor = value;
        if (retinaR) retinaR.enableMotor = value;
      } );
    //----------------------------------------------------------------
    this.retinaScale = 1.0;
	  this.add( this, "retinaScale", 1.0, maxSensorRadius, 0.05 )
      .onChange( function( value ) {
        if (retinaL) retinaL.setScale(value);
        if (retinaR) retinaR.setScale(value);
      } );
    //----------------------------------------------------------------
    this.eyeSep = 10;
    this.add(this, "eyeSep", 0, 50, 1)
      .onChange( function(value) {
        if (retinaL) retinaL.x0 = -value;
        if (retinaR) retinaR.x0 =  value;
      });
    //----------------------------------------------------------------
	  this.biasAmplitude = 0.25;
	  this.add( this, "biasAmplitude", 0, 1, 0.01 )
      .onChange( function( value ) {
        biasAmplitude = value;
	    } );
    this.biasColor = [ 255*biasAmplitude, 255*biasAmplitude, 255*biasAmplitude ];
    this.addColor( this, "biasColor" )
      .onChange( function ( value ) {
        biasColor.setRGB(value[0]/255, value[1]/255, value[2]/255);
        // console.log(value, biasColor);
      } );
  }
};
