import React, { useEffect } from 'react';

export default (fgWprRef, originPt, maxDragDistance) => {
  /*********
   * HOOKS
   ********/
  
  useEffect(() => {
    console.log(fgWprRef);
    if (fgWprRef.current) {
      const canvas = fgWprRef.current;
      if (canvas) {
        canvas.addEventListener('pointerdown', (e) => {
          originPt.value = [e.clientX, e.clientY];
          maxDragDistance.value = 0;
        });
        canvas.addEventListener('pointermove', (e) => {
          maxDragDistance.value = Math.max(maxDragDistance.value, distance(originPt.value, [e.clientX, e.clientY]));
        });
        canvas.addEventListener('pointerup', (e) => {
          maxDragDistance.value = Math.max(maxDragDistance.value, distance(originPt.value, [e.clientX, e.clientY]));
        });
      }
    }
  }, [fgWprRef]);

  /*********
   * HELPERS
   ********/

  const distance = ([x1, y1], [x2, y2]) => {
    const a = x1 - x2;
    const b = y1 - y2;
    return  Math.sqrt( a * a + b * b );
  }
}