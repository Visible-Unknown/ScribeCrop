import { useState, useEffect } from 'react';

export default function useImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    
    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };
    
    img.onerror = () => {
      setImage(null);
      setStatus('failed');
    };
    
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return [image, status] as const;
}
