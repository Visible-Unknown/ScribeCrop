import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CropRegion } from '../types';

export const downloadSingle = (region: CropRegion) => {
  if (!region.dataUrl) return;
  saveAs(region.dataUrl, `${region.name}.png`);
};

export const downloadAsZip = async (regions: CropRegion[], zipName: string = 'crops.zip') => {
  const zip = new JSZip();
  
  regions.forEach((region) => {
    if (region.dataUrl) {
      // dataUrl looks like "data:image/png;base64,iVBORw0K..."
      const base64Data = region.dataUrl.split(',')[1];
      zip.file(`${region.name}.png`, base64Data, { base64: true });
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
};
