navigator.xr.requestDevice = navigator.xr.requestDevice || function () {
  return new Promise((resolve, reject) => {
    resolve({
      supportsSession: new Promise((resolve, reject) => {
        resolve({
          immersive: true,
          exclusive: true
        });
      })
    });
  });
};