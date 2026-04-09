'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import styles from './Dropzone.module.css';

interface DropzoneProps {
  onImageDrop: (file: File) => void;
}

export default function Dropzone({ onImageDrop }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onImageDrop(acceptedFiles[0]);
      }
    },
    [onImageDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1, // Only handling one at a time for the editor canvas
  });

  return (
    <div
      {...getRootProps()}
      className={`${styles.dropzone} ${isDragActive ? styles.active : ''} glass-panel`}
    >
      <input {...getInputProps()} />
      <div className={styles.iconContainer}>
        <UploadCloud size={64} className={isDragActive ? styles.iconActive : styles.icon} />
      </div>
      <h2 className={styles.heading}>
        {isDragActive ? 'Drop your image here' : 'Drag & Drop an image'}
      </h2>
      <p className={styles.subtext}>
        or click to browse from your computer (JPG, PNG, up to 10MB)
      </p>
      
      <button className={`btn btn-primary ${styles.btn}`}>
        Select Image
      </button>
    </div>
  );
}
