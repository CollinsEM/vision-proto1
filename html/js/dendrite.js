// This class implements a dendrite segment as if it were a neuron in
// its own right. I've left the door open here for a dendrite arbor to
// act as primitive feed-forward neural network. The children of this
// dendrite segment can be other dendrite segments as well as synapses
// onto axonal segments of other neurons.
class DendriteSegment extends Array {
  // root: parent node for this segment
  constructor(parent) {
    super();
    this.parent = parent;
    this.children = new Set();
    this.dutyCycle = new Array();
    // console.log("Dendrite created:", this);
  }
  addChild(child) {
    this.children.add(child);
    this.dutyCycle.push(1);
    console.log("Child added:", this);
  }
  update() {
    var sum = 0;
    this.children.forEach( function( child ) {
      if (child.update) child.update();
      sum += child.activation;
    }, this );
    this.activation = sum;
    return sum;
  }
  // train(activated, predicted) {
  //   this.children.forEach( function( child ) {
  //   }, this );
  // }
};

const dendriteMaterial = new THREE.LineBasicMaterial( {
	vertexColors: THREE.VertexColors,
	blending: THREE.AdditiveBlending,
	transparent: true,
  opacity: 0.5
} );

class DendriteView extends THREE.LineSegments {
  constructor(numSegs) {
	  const pos = new Float32Array( 3*(numSegs + 1) );
	  const col = new Float32Array( 3*(numSegs + 1) );
    const posAttrib = new THREE.BufferAttribute( pos, 3 )
          .setUsage( THREE.StaticDrawUsage );
    const colAttrib = new THREE.BufferAttribute( col, 3 )
          .setUsage( THREE.DynamicDrawUsage );
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', posAttrib);
    geom.setAttribute('color', colAttrib);
    super(geom, dendriteMaterial);
    this.layers.set(distalLayer);
  }
  push(seg) {
  }
};
