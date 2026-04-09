import { CropRegion } from '../types';

export const extractCrop = (
  image: HTMLImageElement,
  region: CropRegion,
  scaleX: number,
  scaleY: number
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    // The region coordinates are based on the displayed (scaled) image on canvas.
    // We need to map them back to the original image dimensions.
    const realX = region.x / scaleX;
    const realY = region.y / scaleY;
    const realW = region.width / scaleX;
    const realH = region.height / scaleY;

    // For rectangle, square
    if (region.tool === 'rectangle' || region.tool === 'square') {
      canvas.width = realW;
      canvas.height = realH;
      ctx.drawImage(
        image,
        realX, realY, realW, realH,
        0, 0, realW, realH
      );
    } 
    // For circle
    else if (region.tool === 'circle') {
      canvas.width = realW;
      canvas.height = realH;
      const radiusX = realW / 2;
      const radiusY = realH / 2;
      
      ctx.beginPath();
      ctx.ellipse(radiusX, radiusY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(
        image,
        realX, realY, realW, realH,
        0, 0, realW, realH
      );
    }
    // For polygon
    else if (region.tool === 'polygon' && region.points && region.points.length > 0) {
      // Find bounding box to set canvas size correctly for the cropped piece
      const minX = Math.min(...region.points.map(p => p.x));
      const minY = Math.min(...region.points.map(p => p.y));
      const maxX = Math.max(...region.points.map(p => p.x));
      const maxY = Math.max(...region.points.map(p => p.y));

      const polyW = (maxX - minX) / scaleX;
      const polyH = (maxY - minY) / scaleY;

      canvas.width = polyW;
      canvas.height = polyH;

      ctx.beginPath();
      // Draw polygon relative to its new canvas top-left
      region.points.forEach((p, idx) => {
        const px = (p.x - minX) / scaleX;
        const py = (p.y - minY) / scaleY;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.clip();
      
      // Draw the image shifted by minX, minY
      ctx.drawImage(
        image,
        minX / scaleX, minY / scaleY, polyW, polyH,
        0, 0, polyW, polyH
      );
    }

    resolve(canvas.toDataURL('image/png'));
  });
};
