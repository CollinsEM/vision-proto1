"use strict";

var maxProximalDendrites = 1;
var maxProximalSegments = 32;
var maxDistalDendrites = 1;
var maxDistalSegments = 32;
var maxDistalSynapses = 32;
var maxApicalDendrites = 1;
var maxApicalSegments = 32;

//--------------------------------------------------------------------
// Material to be applied to synaptic connections
var synapseMat = new THREE.LineBasicMaterial( {
	vertexColors: THREE.VertexColors,
	blending: THREE.AdditiveBlending,
	transparent: true
} );
//--------------------------------------------------------------------
// Shader uniform variables
var uniforms = {
	color:   {
    value: new THREE.Color( 0xffffff )
  },
	texture: {
    value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" )
  }
};
//--------------------------------------------------------------------
// Material to be applied to neurons
var neuronMat = new THREE.ShaderMaterial( {
	uniforms: uniforms,
  // vertexShader: document.getElementById( 'neuronVertShader' ).textContent,
	vertexShader: " \
    attribute float size; \
    attribute vec3 customColor; \
	  varying vec3 vColor; \
	  void main() { \
      vColor = customColor; \
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); \
      gl_PointSize = size * ( 300.0 / -mvPosition.z ); \
      gl_Position = projectionMatrix * mvPosition; \
    }",
	// fragmentShader: document.getElementById( 'neuronFragShader' ).textContent,
  fragmentShader: " \
		 uniform vec3 color; \
		 uniform sampler2D texture; \
		 varying vec3 vColor; \
		 void main() { \
			 gl_FragColor = vec4( color * vColor, 1.0 ); \
			 gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); \
		 }",
	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true
} );
//--------------------------------------------------------------------
class MiniColumn extends THREE.Group {
  constructor(radius, height, idx, parent, filter) {
    super();
    this.lo = new THREE.Color(0x101010); // (0x808080);
    this.hi = new THREE.Color(0xFFFFFF);
    this.bias = biasColor.clone();
    this.parent = parent;
    this.name   = parent.name + ":MC#" + idx.toString();
    this.radius = radius;
    this.height = height;
    this.idx    = idx;
    this.filter = filter || logGabor[idx];
    this.geom = new THREE.CylinderGeometry( radius, radius, height/20, 6, 1);
    this.mat  = new THREE.MeshBasicMaterial( { color: 0x000000,
                                               // color: 0x404040,
                                               // blending: THREE.AdditiveBlending,
                                               // wireframe: true,
                                               side: THREE.DoubleSide,
                                               transparent: true,
                                               opacity: gui.opacity });
    this.helper = new THREE.Mesh(this.geom, this.mat);
    this.helper.layers.set(miniColumnLayer);
    // this.helper.rotateY(Math.PI/6);
    this.helper.translateY(-height/2);
    this.add(this.helper);
    
    this.neuronData = [];
    this.initNeurons();
    
    this.proximal = [];
    // this.initProximalDendrite();
    
    this.distal = [];
    // this.initDistalDendrite();
    
    this.apical = [];
    // this.initApicalDendrite();

    this.predicted = false;
    this.activated = false;
  }
  //--------------------------------------------------------------------
  // data: Local proximal input data
  updateState(data, dt) {
    const omega = 5;
    const phi0 = this.pos.x;
    const bias = 0.5 + 0.5*Math.sin(omega*stime + phi0);
    this.bias.set(biasColor).multiplyScalar(bias);
    this.computePrediction(bias, dt);
    this.computeActivation(bias, dt, data);
  }
  //--------------------------------------------------------------------
  // Update the distal activations for all neurons in this MC
  computePrediction(bias, dt) {
    const mcData = this.neuronData.slice(0, gui.numNeurons);
    var distMin  = [ 1000, 1000, 1000]; // Minimum distal activations
    var distMax  = [-1000,-1000,-1000]; // Maximum distal activations
    var distIdx  = [-1,-1,-1];
    mcData.forEach( function( iData, i ) {
      // Update distal predictive state for this neuron
      // const dist = iData.updateDistal();
      // const apic = iData.updateApical();
      const dist = iData.updateDendrites();
      // Update statistics on this neuron's color channel
      const z = iData.channel;
      distMin[z] = Math.min(distMin[z], dist);
      if (dist > distMax[z]) {
        distIdx[z] = i;
        distMax[z] = dist;
      }
    }, this );
    this.predicted = false;
    for (var z=0; z<3; ++z) {
      this.predicted |= (distMax[z] > gui.distal.threshold)
    }
    this.distMin = distMin;
    this.distMax = distMax;
    this.distIdx = distIdx;
  }
  //--------------------------------------------------------------------
  // Update the proximal activations for all neurons in this MC
  computeActivation(bias, dt, data) {
    // Update the proximal activations for all neurons in this MC
    const G  = this.filter;
    const NI = logGabor.filterWidth; // Width of filter (in pixels)
    const NJ = logGabor.filterWidth; // Height of filter (in pixels)
    const R  = Math.round(gui.sensorRadius);
    const NX = 2*R+1; // Width of receptive field on data patch (in pixels)
    const NY = 2*R+1; // Height of receptive field on data patch (in pixels)
    var prox = [ bias, bias, bias ]; // accumlate activations in each color channel
    for (var j=0, n=0; j<NJ; ++j) { // filter coordinate (row)
      const y = Math.floor(j*NY/NJ); // patch coordinate (row)
      for (var i=0; i<NI; ++i, ++n) { // filter coordinate (col)
        const x = Math.floor(i*NX/NI); // patch coordinate (col)
        for (var z=0; z<3; ++z) {
          prox[z] += G[n]*data[4*(y*NX+x)+z];
        }
      }
    }
    this.prox = prox;
  }
  //--------------------------------------------------------------------
  // Update column visualization
  activate(colMin, colMax) {
    const rden = 1.0/(colMax-colMin);
    this.hi.setRGB((this.prox[0]-colMin)*rden,
                   (this.prox[1]-colMin)*rden,
                   (this.prox[2]-colMin)*rden);
    this.mat.color.addColors(this.bias, this.hi);
    this.activated = true;
    const mcData = this.neuronData.slice(0, gui.numNeurons);
    mcData.forEach( function( iData, i ) {
      iData.activation = this.prox;
    }, this );
  }
  //--------------------------------------------------------------------
  // Gradually diminish minicolumn activation state
  decay() {
    for (var z=0; z<3; ++z) this.prox[z] *= 0.95;
    this.hi.lerp(this.lo, 0.05);
    this.mat.color.addColors(this.bias, this.hi);
  }
  //--------------------------------------------------------------------
  // Activate all neurons to show column bursting
  burst() {
	  const col = this.neuronCol; // Array of neuron colors
	  const siz = this.neuronSiz; // Array of neuron sizes
    const mcData = this.neuronData.slice(0, gui.numNeurons);
    mcData.forEach( function( iData, i ) { // Update all neurons in this MC
      col[3*i+0] = 1.0;
      col[3*i+1] = 0.2;
      col[3*i+2] = 0.2;
      siz[i]     = 100;
      iData.activate();
    }, this );    
	  this.colAttrib.needsUpdate = true;
	  this.sizAttrib.needsUpdate = true;
  }
  //--------------------------------------------------------------------
  // Update neuron visualization
  renderNodes(idx) {
	  const col = this.neuronCol; // Array of neuron colors
	  const siz = this.neuronSiz; // Array of neuron sizes
    //------------------------------------------------------------------
    // Update the neuron display based on activations and predicitons
    const mcData = this.neuronData.slice(0, gui.numNeurons);
    mcData.forEach( function( iData, i ) { // Update all neurons in this MC
      const z = iData.channel;
      if (siz[i] >= 10) {
        siz[i] *= 0.95;
        if (siz[i] < 10) {
          this.activated = false;
          this.predicted = false;
          this.hi.set(this.lo);
        }
      }
      else if (this.activated) {
        if (this.predicted) {
          col[3*i+0] = 0.2;
          col[3*i+1] = 1.0;
          col[3*i+2] = 0.2;
          siz[i]     = 100;
        }
        else {
          col[3*i+0] = 1.0;
          col[3*i+1] = 0.2;
          col[3*i+2] = 0.2;
          siz[i]     = 100;
        }
      }
      else if (this.predicted) {
        col[3*i+0] = 0.2;
        col[3*i+1] = 0.2;
        col[3*i+2] = 1.0;
        siz[i]     = 100;
      }
      else {
        col[3*i+0] = 0.2;
        col[3*i+1] = 0.2;
        col[3*i+2] = 0.2;
        siz[i]     =  10;
      }
    }, this );
	  this.colAttrib.needsUpdate = true;
	  this.sizAttrib.needsUpdate = true;
  }
  //------------------------------------------------------------------
  // Train distal synapses if nodes are active without being predicted
  trainDistal() {
    const mcData = this.neuronData.slice(0, gui.numNeurons);
    mcData.forEach( function( iData, i ) { // Update all neurons in this MC
      iData.trainDistal(this.activated, this.predicted);
    }, this );
  }
  
  //------------------------------------------------------------------
  initNeurons() {
    this.neuronGeom = new THREE.BufferGeometry();
	  this.neuronPos = new Float32Array( maxNeurons * 3 );
	  this.neuronCol = new Float32Array( maxNeurons * 3 );
	  this.neuronSiz = new Float32Array( maxNeurons );

    this.posAttrib = new THREE.BufferAttribute( this.neuronPos, 3 )
      .setUsage( THREE.StaticDrawUsage );
    this.colAttrib = new THREE.BufferAttribute( this.neuronCol, 3 )
      .setUsage( THREE.DynamicDrawUsage );
    this.sizAttrib = new THREE.BufferAttribute( this.neuronSiz, 1 )
      .setUsage( THREE.DynamicDrawUsage );

    var n=0, c=0;
    var R = this.radius;
    var H = this.height;
    var color = new THREE.Color();

    for (var i=0; i<maxNeurons; ++i) {
      var z = i%3;
      color.setRGB(0.1, 0.1, 0.1);
		  var cr = color.r;
		  var cg = color.g;
      var cb = color.b;
      var r  = R * Math.random();
      var th = 2 * Math.PI * Math.random();
		  var px = r * Math.cos(th);
		  var py = H * (Math.random() - 0.5);
		  var pz = r * Math.sin(th);
		  var data = new Neuron( { x: px, y: py, z: pz,
                               idx: i, parent: this,
                               channel: z } );
      this.neuronData.push(data);
      this.colAttrib.setXYZ(c, cr, cg, cg); ++c;
      this.posAttrib.setXYZ(n, px, py, pz); ++n;
      this.sizAttrib.setX(i, 20);
    }
	  this.neuronGeom.setAttribute( 'position',    this.posAttrib );
    this.neuronGeom.setAttribute( 'customColor', this.colAttrib );
    this.neuronGeom.setAttribute( 'size',        this.sizAttrib );
	  this.neuronGeom.setDrawRange( 0, gui.numNeurons );
    this.neuronGeom.computeBoundingSphere();
  
	  this.points = new THREE.Points( this.neuronGeom, neuronMat );
    this.points.name = "neurons";
    this.points.layers.set(neuronLayer);
    this.add(this.points);
  }
  setNumNeurons(num) {
    this.numNeurons = num;
		this.neuronGeom.setDrawRange( 0, num );
  }
  //--------------------------------------------------------------------
  initProximalDendrite() {
    if (this.proximal.length >= maxProximalDendrites) return false;
    var size = maxNeurons * maxProximalDendrites * maxProximalSegments * 6;

    var pos = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    var col = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', pos );
    geometry.setAttribute( 'color',    col );

    var mesh = new THREE.LineSegments( geometry, synapseMat );
    mesh.name = this.name +  " - proximal dendrites";
    mesh.layers.set(proximalLayer);
    this.proximal.push(mesh);
    this.add(mesh);
    return true;
  }
  //--------------------------------------------------------------------
  initDistalDendrite() {
    if (this.distal.length >= maxDistalDendrites) return false;
    
    var pos = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    var col = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', pos );
    geometry.setAttribute( 'color',    col );

    var mesh = new THREE.LineSegments( geometry, synapseMat );
    mesh.name = this.name +  " - distal dendrites";
    mesh.layers.set(distalLayer);
    this.distal.push(mesh);
    this.add(mesh);
    return true;
  }
  //--------------------------------------------------------------------
  initApicalDendrite() {
    if (this.apical.length == maxApicalDendrites) return false;
    
    var pos = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    var col = new THREE.BufferAttribute( new Float32Array( size ), 3 )
        .setUsage( THREE.DynamicDrawUsage );
    
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', pos );
    geometry.setAttribute( 'color',    col );

    var mesh = new THREE.LineSegments( geometry, synapseMat );
    mesh.name = this.name +  " - apical dendrites";
    mesh.layers.set(apicalLayer);
    this.apical.push(mesh);
    this.add(mesh);
    return true;
  }

  //--------------------------------------------------------------------
  // computeProximalSynapses() {
  //   var nSegs = numDendriteSegments;
  //   var nDend = numProximalDendrites;
  //   var n=0, c=0;
  //   for (var i=0, i0=0, i1=1, i2=2; i<numNeurons; ++i, i0+=3, i1+=3, i2+=3) {
  //     var minDist = [ ];
  //     var nearest = [ ];
  //     for (var j=0, j0=0, j1=1, j2=2; j<numNeurons; ++j, j0+=3, j1+=3, j2+=3) {
  //       if (i==j) continue;
  //       var dx = this.neuronPos[j0] - this.neuronPos[i0];
  //       var dy = this.neuronPos[j1] - this.neuronPos[i1];
  //       var dz = this.neuronPos[j2] - this.neuronPos[i2];
  //       // Only looking for the K-nearest neighbors above the iNode
  //       if (dy < 0) continue;
  //       var dSq = dx*dx + dy*dy + dz*dz;
  //       // if (dSq > maxProximalDistance) continue;
  //       var k = minDist.findIndex( function(d) {
  //         return d >= dSq;
  //       } ) || minDist.length;
  //       minDist.splice(k, 0, dSq);
  //       nearest.splice(k, 0, j);
  //       if (minDist.length > nDend) {
  //         minDist.splice(nDend);
  //         nearest.splice(nDend);
  //       }
  //     }
  //     nearest.forEach( function(j) {
  //       var j0=3*j, j1=j0+1, j2=j0+2;
  //       var pCrv = new THREE.LineCurve3(
  //         new THREE.Vector3(this.neuronPos[i0], this.neuronPos[i1], this.neuronPos[i2]),
  //         new THREE.Vector3(this.neuronPos[j0], this.neuronPos[j1], this.neuronPos[j2])
  //       );
  //       var cCrv = new THREE.LineCurve3(
  //         new THREE.Vector3(this.neuronCol[i0], this.neuronCol[i1], this.neuronCol[i2]),
  //         new THREE.Vector3(this.neuronCol[j0], this.neuronCol[j1], this.neuronCol[j2])
  //       );
  //       var pos = pCrv.getPoints(nSegs);
  //       var col = cCrv.getPoints(nSegs);
  //       for (var k=0; k<nSegs; ++k) {
  //         this.synapsePos[n++] = pos[k].x;
  //         this.synapsePos[n++] = pos[k].y;
  //         this.synapsePos[n++] = pos[k].z;
  //         this.synapsePos[n++] = pos[k+1].x;
  //         this.synapsePos[n++] = pos[k+1].y;
  //         this.synapsePos[n++] = pos[k+1].z;
  //         this.synapseCol[c++] = col[k].x;
  //         this.synapseCol[c++] = col[k].y;
  //         this.synapseCol[c++] = col[k].z;
  //         this.synapseCol[c++] = col[k+1].x;
  //         this.synapseCol[c++] = col[k+1].y;
  //         this.synapseCol[c++] = col[k+1].z;
  //       }
  //     }, this );
  //   }
  //   this.linesMesh.geometry.setDrawRange( 0, n/3 );
  //   this.linesMesh.geometry.computeBoundingSphere();
  //   this.linesMesh.geometry.attributes.position.needsUpdate = true;
  //   this.linesMesh.geometry.attributes.color.needsUpdate = true;
  // }
  
  //--------------------------------------------------------------------
  // Find the K-nearest neighbors to node i.
  // findNearestNeighbors(i, K) {
  //   var i0=3*i, i1=i0+1, i2=i0+2;
  //   var minDist = [ ];
  //   var nearest = [ ];
  //   for (var j=0, j0=3*j, j1=j0+1, j2=j0+2;
  //        j<numNeurons; ++j, j0+=3, j1+=3, j2+=3) {
  //     if (i == j) continue;
  //     var dx = this.neuronPos[j0] - this.neuronPos[i0];
  //     var dy = this.neuronPos[j1] - this.neuronPos[i1];
  //     var dz = this.neuronPos[j2] - this.neuronPos[i2];
  //     var dSq = dx*dx + dy*dy + dz*dz;
  //     // if (dSq > maxProximalDistance) continue;
  //     var k = minDist.findIndex( function(d) {
  //       return d >= dSq;
  //     } ) || minDist.length;
  //     minDist.splice(k, 0, dSq);
  //     nearest.splice(k, 0, j);
  //     if (minDist.length > K) {
  //       minDist.splice(K);
  //       nearest.splice(K);
  //     }
  //   }
  //   return nearest;
  // }
};
