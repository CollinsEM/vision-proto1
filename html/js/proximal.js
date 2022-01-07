
function ProximalDendrite(root) {
  this.root = root;
	this.synapsePos = new Float32Array( 3*(gui.numSegs + 1) );
	this.synapseCol = new Float32Array( 3*(gui.numSegs + 1) );
  this.posAttrib = new THREE.BufferAttribute( this.synapsePos, 3 )
    .setUsage( THREE.DynamicDrawUsage );
  this.colAttrib = new THREE.BufferAttribute( this.synapseCol, 3 )
    .setUsage( THREE.DynamicDrawUsage );
  this.geometry = new THREE.BufferGeometry();
  this.geometry.setAttribute('position', this.posAttrib);
  this.geometry.setAttribute('color', this.colAttrib);

  var synapseMaterial = new THREE.LineBasicMaterial( {
	  vertexColors: THREE.VertexColors,
	  blending: THREE.AdditiveBlending,
	  transparent: true
  } );
  this.mesh = new THREE.Line(this.geometry, synapseMaterial);
  this.mesh.visible = gui.showLines;
}
