class NeuronData {
  constructor(obj) {
    this.predicted = false;
    this.activated = false;
    this.proximalSynapses = [ ];
    this.activeProximal = 0;
    this.distalSynapses = [ ];
    this.activeDistal = 0;
    this.apicalSynapses = [ ];
    this.activeApical = 0;
    // Copy over all settings from constructor argument
    Object.keys(obj).forEach( key => this[key] = obj[key], this );
	}
};

class NeuralDisplay extends THREE.Group {
  constructor() {
    super();
    this.geom = new THREE.BufferGeometry();
	  this.positions  = new Float32Array( maxNeurons * 3 );
	  this.colors     = new Float32Array( maxNeurons * 3 );
	  this.sizes      = new Float32Array( maxNeurons );
    
    var n=0, c=0;
    var color = new THREE.Color();
	  for (var i=0; i<maxNeurons; ++i) {
      color.setHSL( i/maxNeurons, 1.0, 0.5 );
		  var cr = color.r;
		  var cg = color.g;
		  var cb = color.b;
		  var px = Math.random() * r - r / 2;
		  var py = Math.random() * r - r / 2;
		  var pz = Math.random() * r - r / 2;
		  var vx = -1 + Math.random() * 2;
      var vy = -1 + Math.random() * 2;
      var vz = -1 + Math.random() * 2;

		  this.positions[n++] = n.px;
		  this.positions[n++] = n.py;
		  this.positions[n++] = n.pz;

		  this.colors[c++] = n.cr;
		  this.colors[c++] = n.cg;
		  this.colors[c++] = n.cb;

      this.sizes[i]  = 0;
	  }

    var posAttrib = new THREE.BufferAttribute( this.positions, 3 )
        .setUsage( THREE.DynamicDrawUsage );
    var colAttrib = new THREE.BufferAttribute( this.colors,    3 )
        .setUsage( THREE.DynamicDrawUsage );
    var sizAttrib = new THREE.BufferAttribute( this.sizes,     1 )
        .setUsage( THREE.DynamicDrawUsage );
    
	  this.geom.setAttribute( 'position',    posAttrib );
    this.geom.setAttribute( 'customColor', colAttrib );
    this.geom.setAttribute( 'size',        sizAttrib );
	  this.geom.setDrawRange( 0, numNeurons );
    // this.geom.computeBoundingSphere();
    
    this.mat = new THREE.ShaderMaterial( {
	    uniforms: {
		    color: { value: new THREE.Color( 0xffffff ) },
		    texture: { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
	    },
	    vertexShader:   document.getElementById( 'neuronVertShader' ).textContent,
	    fragmentShader: document.getElementById( 'neuronFragShader' ).textContent,
	    blending:       THREE.AdditiveBlending,
	    depthTest:      false,
	    transparent:    true
    } );
    
    this.add(new THREE.Points( this.geom, this.mat ));
  }
};
