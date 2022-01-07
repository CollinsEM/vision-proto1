class AxonalSegment {
  constructor(parent) {
    this.parent = parent;
    this.activation = 0;
  }
  activate() {
    this.activation = 1;
  }
  // Use the update to implement fatigue (fading of activation response)
  // update() {
  //   this.activation *= 0.95;
  // }    
};
