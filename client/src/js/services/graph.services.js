export default {
  DEFAULTS: {
    velocityDecay2D: .85,
    velocityDecay3D: .85
  },
  calculateAspectRatioFit: (srcWidth, srcHeight, maxWidth, maxHeight) => {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { 
      width: srcWidth * ratio, 
      height: srcHeight * ratio 
    };
 },
}