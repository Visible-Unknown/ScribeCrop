'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CropIcon, Image as ImageIcon } from 'lucide-react';
import Dropzone from '../components/Dropzone';
import PreviewPanel from '../components/PreviewPanel';
import { CropRegion } from '../types';
import { downloadAsZip } from '../utils/exportCrops';

// Dynamically import CanvasEditor to avoid SSR issues with Konva
const CanvasEditorWrapper = dynamic(() => import('../components/CanvasEditor'), { 
  ssr: false, 
  loading: () => <div className="editor-loading">Loading editor engine...</div> 
});

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [regions, setRegions] = useState<CropRegion[]>([]);
  
  // Renaming settings
  const [namingSettings, setNamingSettings] = useState({
    prefix: 'word_',
    startNumber: 1,
    padding: 2
  });

  const handleImageDrop = (file: File) => {
    setImageFile(file);
    setRegions([]); // Reset on new image
    setNamingSettings(prev => ({ ...prev, startNumber: 1 })); // Reset counter
  };

  const handleAddCrop = (region: CropRegion) => {
    // Generate name based on CURRENT sequence
    const nextName = `${namingSettings.prefix}${namingSettings.startNumber.toString().padStart(namingSettings.padding, '0')}`;
    
    setRegions(prev => [...prev, { ...region, name: nextName }]);
    // Increment settings for NEXT crop
    setNamingSettings(prev => ({ ...prev, startNumber: prev.startNumber + 1 }));
  };

  const handleDeleteCrop = (id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  const handleRenameCrop = (id: string, name: string) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  const handleUpdateRegion = (id: string, updates: Partial<CropRegion>) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleUpdateSettings = (newSettings: Partial<typeof namingSettings>) => {
    const updated = { ...namingSettings, ...newSettings };
    setNamingSettings(updated);

    // Reactive re-index: automatically update existing regions to match new settings
    setRegions(prev => {
      let currentNum = updated.startNumber;
      return prev.map(r => {
        const name = `${updated.prefix}${currentNum.toString().padStart(updated.padding, '0')}`;
        currentNum++;
        return { ...r, name };
      });
    });
  };

  const handleBatchRename = () => {
    // Already handled reactively in handleUpdateSettings, but kept for explicit trigger if needed
    let currentNum = namingSettings.startNumber;
    setRegions(prev => prev.map(r => {
      const name = `${namingSettings.prefix}${currentNum.toString().padStart(namingSettings.padding, '0')}`;
      currentNum++;
      return { ...r, name };
    }));
  };

  const handleClearRegions = () => {
    setRegions([]);
  };

  const handleDownloadAll = () => {
    downloadAsZip(regions, `word_crops_${Date.now()}.zip`);
  };

  return (
    <main className="app-container">
      <header className="header">
        <img 
          src="/icon.png" 
          alt="ScribeCrop Logo" 
          style={{ width: '28px', height: '28px', marginRight: '12px', borderRadius: '6px' }} 
        />
        <span style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>ScribeCrop</span>
        
        {imageFile && (
          <button 
            className="btn btn-secondary" 
            style={{ marginLeft: 'auto' }}
            onClick={() => setImageFile(null)}
          >
            <ImageIcon size={16} /> New Image
          </button>
        )}
      </header>
      
      <div className="main-content">
        {!imageFile ? (
          <Dropzone onImageDrop={handleImageDrop} />
        ) : (
          <>
            <CanvasEditorWrapper 
              imageFile={imageFile} 
              onCropAdd={handleAddCrop}
              onUpdateRegion={handleUpdateRegion}
              onClearRegions={handleClearRegions}
              regions={regions} 
            />
            <PreviewPanel 
              regions={regions} 
              onDelete={handleDeleteCrop}
              onRename={handleRenameCrop}
              onDownloadAll={handleDownloadAll}
              namingSettings={namingSettings}
              onUpdateSettings={handleUpdateSettings}
              onBatchRename={handleBatchRename}
            />
          </>
        )}
      </div>
    </main>
  );
}
