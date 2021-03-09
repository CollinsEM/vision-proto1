var maxProximalDendrites = 1;
var maxProximalSegments = 32;
var maxDistalDendrites = 1;
var maxDistalSegments = 32;
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
  constructor(radius, height, idx, parent) {
    super();
    this.idx = idx;
    this.name = parent.name + ":MC#" + idx.toString();
    this.radius = radius;
    this.height = height;
    this.idx    = idx;
    
    this.geom = new THREE.CylinderBufferGeometry( radius, radius, height, 6, 1);
    this.mat  = new THREE.MeshBasicMaterial( { color: 0x404040,
                                               // blending: THREE.AdditiveBlending,
                                               side: THREE.DoubleSide,
                                               transparent: true,
                                               opacity: gui.opacity });
    this.helper = new THREE.Mesh(this.geom, this.mat);
    this.helper.layers.set(miniColumnLayer);
    this.add(this.helper);

    this.neuronData = [];
    this.initNeurons();
    
    this.proximal = [];
    // this.initProximalDendrite();
    
    this.distal = [];
    // this.initDistalDendrite();
    
    this.apical = [];
    // this.initApicalDendrite();
  }
  //------------------------------------------------------------------
  initNeurons() {
    this.numNeurons = gui.numNeurons;
    this.neurons = new THREE.BufferGeometry();
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
      // color.setHSL( i/maxNeurons, 1.0, 0.5 );
      color.setRGB(0.1, 0.1, 0.1);
		  var cr = color.r;
		  var cg = color.g;
      var cb = color.b;
      var r  = R * Math.random();
      var th = 2 * Math.PI * Math.random();
		  var px = r * Math.cos(th);
		  var py = H * (Math.random() - 0.5);
		  var pz = r * Math.sin(th);

		  var data = new NeuronData( { x: px, y: py, z: pz,
                                   idx: i, parent: this } );
      this.neuronData.push(data);

      this.colAttrib.setXYZ(c, cr, cg, cg); c++;
      this.posAttrib.setXYZ(n, px, py, pz); n++;
      this.sizAttrib.setX(i, 20);
	  }
	  this.neurons.setAttribute( 'position', this.posAttrib );
    this.neurons.setAttribute( 'customColor', this.colAttrib );
    this.neurons.setAttribute( 'size', this.sizAttrib );
	  this.neurons.setDrawRange( 0, this.numNeurons );
    this.neurons.computeBoundingSphere();
  
	  this.points = new THREE.Points( this.neurons, neuronMat );
    this.points.name = "neurons";
    this.points.layers.set(neuronLayer);
    this.add(this.points);
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
  // data: Local proximal input data
  updateState(sdr) {
    // Update particle state
	  var col = this.neuronCol;
	  var siz = this.neuronSiz;
    for ( var i=0; i<this.numNeurons; ++i ) {
      for ( var j=0; j<this.numNeurons; ++j ) {
        
      }
    }
	  for ( var i=0, i0=0, i1=1, i2=2; i<this.numNeurons; ++i, i0+=3, i1+=3, i2+=3 ) {
		  var iData = this.neuronData[i];
      if (siz[i] > 10) {
        siz[i] *= 0.95;
        if (siz[i] < 10) {
          iData.activated = false;
          iData.predicted = false;
        }
      }
      if (!iData.activated && Math.random() > 0.99) {
        iData.activated = true;
        siz[i] = 100;
      }
      if (!iData.predicted && Math.random() > 0.95) {
        iData.predicted = true;
        siz[i] = 100;
      }
      // col.setXYZ(i0, (iData.activated && !iData.predicted ? 1.0 : 0.2),
      //            (iData.activated &&  iData.predicted ? 1.0 : 0.2),
      //            (iData.predicted && !iData.activated ? 1.0 : 0.2) );
      col[i0] = (iData.activated && !iData.predicted ? 1.0 : 0.2);
      col[i1] = (iData.activated &&  iData.predicted ? 1.0 : 0.2);
      col[i2] = (iData.predicted && !iData.activated ? 1.0 : 0.2);
    }
	  this.colAttrib.needsUpdate = true;
	  this.sizAttrib.needsUpdate = true;
    // Update connectivity
    // this.computeProximalSynapses();
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
