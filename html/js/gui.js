class GUI extends dat.GUI {
  constructor() {
    super();
    //----------------------------------------------------------------
    this.seqMenu = this.addFolder("MNIST Sequence");
    this.NI = 5;
    this.seqMenu.add( this, "NI", 1, 5, 1 )
      .onChange( function( value ) {
        if (value != seqView.NI) seqView.resize( gui.NI, gui.NJ );
      } );
    this.NJ = 10;
    this.seqMenu.add( this, "NJ", 1, 10, 1 )
      .onChange( function( value ) {
        if (value != seqView.NJ) seqView.resize( gui.NI, gui.NJ );
      } );
    //----------------------------------------------------------------
	  this.showNeurons = false;
	  this.add( this, "showNeurons" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(neuronLayer);
      } );
    //----------------------------------------------------------------
	  this.showMiniColumns = true;
	  this.add( this, "showMiniColumns" )
      .onChange( function( value ) {
        cortexView.camera.layers.toggle(miniColumnLayer);
      } );
    //----------------------------------------------------------------
	  this.showProxDendrites = false;
	  // this.add( this, "showProxDendrites" )
    //   .onChange( function( value ) {
    //     cortexView.camera.layers.toggle(proximalLayer);
    //   } );
    //----------------------------------------------------------------
	  this.showDistDendrites = false;
	  // this.add( this, "showDistDendrites" )
    //   .onChange( function( value ) {
    //     cortexView.camera.layers.toggle(distalLayer);
    //   } );
    //----------------------------------------------------------------
	  this.showApical = false;
	  // this.add( this, "showApical" )
    //   .onChange( function( value ) {
    //     cortexView.camera.layers.toggle(apicalLayer);
    //   } );
    //----------------------------------------------------------------
	  this.saccade = false;
	  this.add( this, "saccade" )
      .onChange( function( value ) {
        cortex.allowSaccades( value );
      } );
    //----------------------------------------------------------------
	  this.gabor = true;
	  this.add( this, "gabor" );
	  // this.add( this, "gabor" )
    //   .onChange( function( value ) {
    //   } );
    //----------------------------------------------------------------
	  this.numNeurons = numNeurons;
	  this.add( this, "numNeurons", 0, maxNeurons, 1 )
      .onChange( function( value ) {
        columns.forEach( function(col, idx) {
		      col.miniColumns.forEach( function(mc) {
            mc.numNeurons = parseInt( value );
		        mc.neurons.setDrawRange( 0, mc.numNeurons );
          } );
        } );
	    } );
    //----------------------------------------------------------------
	  this.numColumns = numColumns;
	  this.add( this, "numColumns", 1, maxColumns, 1 )
      .onChange( function( value ) {
        cortex.columns.forEach( function(col, idx) {
          col.visible = (idx < gui.numColumns);
        } );
	    } );
    //----------------------------------------------------------------
    this.opacity = 0.2;
	  this.add( this, "opacity", 0, 1, 0.01 )
      .onChange( function( value ) {
        cortex.columns.forEach( function(col, idx) {
		      col.miniColumns.forEach( function(mc) {
            mc.mat.opacity = parseFloat( value );
          } );
        } );
	    } );
    //----------------------------------------------------------------
    this.colRadius = 3;
	  this.add( this, "colRadius", 1, maxSensorRadius, 0.5 );
    //----------------------------------------------------------------
    // this.moving = false;
	  // this.add( this, "moving" );
    //----------------------------------------------------------------
	  // this.limitSynapses = false;
    //----------------------------------------------------------------
	  // this.maxSynapses = 20;
    //----------------------------------------------------------------
	  // this.maxProximalDist = maxProximalDistance;
    //----------------------------------------------------------------
    // this.numProximalDend = numProximalDendrites;
    //----------------------------------------------------------------
    // this.numDistalDend = numDistalDendrites;
    //------------------------------------
    // this.numSegs = numDendriteSegments;
	  // this.add( this, "numSegs", 1, 20, 1 )
    //   .onChange( function( value ) {
    //     numDendriteSegments = value;
    //   } );
    //------------------------------------
    // this.prox = this.addFolder('Proximal');
	  // this.prox.add( this, "numProximalDend", 1, maxProximalDendrites, 1 )
    //   .onChange( function( value ) {
    //     numProximalDendrites = value;
    //     computeProximalSynapses();
    //   } );
	  // this.prox.add( this, "maxProximalDist", 100, 300 )
    //   .onChange( function( value ) {
    //     maxProximalDistance = value;
    //     computeProximalSynapses();
    //   } );
    //------------------------------------
    // this.dist = this.addFolder('Distal');
	  // this.dist.add( this, "numDistalDend", 0, maxDistalDendrites, 1 )
    //   .onChange( function( value ) {
    //     numDistalDendrites = value;
    //   } );
  }
};
