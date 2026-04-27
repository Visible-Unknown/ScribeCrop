import React from 'react';
import { Download, Trash2, DownloadCloud } from 'lucide-react';
import { CropRegion } from '../types';
import { downloadSingle } from '../utils/exportCrops';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  regions: CropRegion[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownloadAll: () => void;
  namingSettings: {
    prefix: string;
    startNumber: number;
    padding: number;
  };
  onUpdateSettings: (settings: Partial<{ prefix: string; startNumber: number; padding: number }>) => void;
  onBatchRename: () => void;
}

export default function PreviewPanel({ 
  regions, 
  onDelete, 
  onRename, 
  onDownloadAll,
  namingSettings,
  onUpdateSettings,
  onBatchRename
}: PreviewPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>Extracted Crops</span>
        <span className={styles.badge}>{regions.length} items</span>
      </div>

      <div className={styles.settingsSection}>
        <div className={styles.settingsGroup}>
          <div className={styles.field}>
            <label className={styles.label}>Prefix</label>
            <input 
              type="text" 
              className={styles.miniInput}
              value={namingSettings.prefix}
              onChange={(e) => onUpdateSettings({ prefix: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Start #</label>
            <input 
              type="number" 
              className={styles.miniInput}
              value={namingSettings.startNumber}
              onChange={(e) => onUpdateSettings({ startNumber: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <button 
          className={styles.textBtn} 
          onClick={onBatchRename}
          disabled={regions.length === 0}
        >
          Batch Rename Existing
        </button>
      </div>
      
      <div className={styles.list}>
        {regions.length === 0 ? (
          <div className={styles.empty}>No regions cropped yet.</div>
        ) : (
          regions.map((region, index) => (
            <div key={region.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.number}>#{index + 1}</span>
                <div className={styles.actions}>
                  <button 
                    className={styles.iconBtn} 
                    onClick={() => downloadSingle(region)}
                    title="Download individual"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className={`${styles.iconBtn} ${styles.danger}`} 
                    onClick={() => onDelete(region.id)}
                    title="Delete crop"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {region.dataUrl && (
                <img src={region.dataUrl} alt={`Crop ${index + 1}`} className={styles.previewImage} />
              )}
              
              <input 
                type="text" 
                className={styles.nameInput}
                value={region.name}
                onChange={(e) => onRename(region.id, e.target.value)}
                placeholder="Name (e.g. word_01)"
              />
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <button 
          className={`btn btn-primary ${styles.exportBtn}`}
          disabled={regions.length === 0}
          onClick={onDownloadAll}
        >
          <DownloadCloud size={18} />
          Download All (ZIP)
        </button>
      </div>
    </div>
  );
}
