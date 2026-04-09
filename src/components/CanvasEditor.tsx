'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Line, Text, Group } from 'react-konva';
import { Square, Circle as CircleIcon, PenTool, MousePointer2, Settings } from 'lucide-react';
import useImage from '../hooks/useImage';
import { extractCrop } from '../utils/cropImage';
import { CropRegion, ToolType, Point } from '../types';
import styles from './CanvasEditor.module.css';

interface CanvasEditorProps {
  imageFile: File;
  onCropAdd: (region: CropRegion) => void;
  regions: CropRegion[];
}

export default function CanvasEditor({ imageFile, onCropAdd, regions }: CanvasEditorProps) {
  const imageUrl = React.useMemo(() => URL.createObjectURL(imageFile), [imageFile]);
  const [image, status] = useImage(imageUrl);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  
  const [tool, setTool] = useState<ToolType | 'select'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [newRegion, setNewRegion] = useState<Partial<CropRegion> | null>(null);

  // Resize canvas to fit image nicely
  useEffect(() => {
    if (image && containerRef.current) {
      const containerW = containerRef.current.clientWidth - 40;
      const containerH = containerRef.current.clientHeight - 40;
      
      const scaleX = containerW / image.width;
      const scaleY = containerH / image.height;
      const bestScale = Math.min(scaleX, scaleY, 1); // don't scale up past original size
      
      setScale(bestScale);
      setDimensions({
        width: image.width * bestScale,
        height: image.height * bestScale
      });
    }
  }, [image]);

  const handleMouseDown = (e: any) => {
    if (tool === 'select') return;
    
    // For polygon, we click to add points
    if (tool === 'polygon') {
      const pos = e.target.getStage().getPointerPosition();
      if (!isDrawing) {
        setIsDrawing(true);
        setNewRegion({ tool, points: [pos] });
      } else if (newRegion?.points) {
        setNewRegion({ ...newRegion, points: [...newRegion.points, pos] });
      }
      return;
    }

    // For drag-shapes
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setNewRegion({
      tool,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool === 'select' || tool === 'polygon' || !newRegion) return;
    
    const pos = e.target.getStage().getPointerPosition();
    let width = pos.x - (newRegion.x || 0);
    let height = pos.y - (newRegion.y || 0);

    // Keep square proportions if square tool
    if (tool === 'square') {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }

    setNewRegion({ ...newRegion, width, height });
  };

  const handleMouseUp = async () => {
    if (!isDrawing || tool === 'select' || tool === 'polygon' || !newRegion) return;
    setIsDrawing(false);

    if (Math.abs(newRegion.width || 0) > 10 && Math.abs(newRegion.height || 0) > 10 && image) {      
      // Normalize width/height/x/y to be positive
      let { x = 0, y = 0, width = 0, height = 0 } = newRegion;
      if (width < 0) { x += width; width = Math.abs(width); }
      if (height < 0) { y += height; height = Math.abs(height); }

      const finalizedRegion: CropRegion = {
        id: Math.random().toString(36).substring(7),
        name: ``, // Name will be assigned by parent
        tool: (newRegion.tool as ToolType) || 'rectangle',
        x, y, width, height
      };

      const dataUrl = await extractCrop(image, finalizedRegion, scale, scale);
      onCropAdd({ ...finalizedRegion, dataUrl });
    }
    setNewRegion(null);
  };

  const handlePolygonComplete = async () => {
    if (!isDrawing || tool !== 'polygon' || !newRegion || !newRegion.points || newRegion.points.length < 3 || !image) return;
    
    const minX = Math.min(...newRegion.points.map(p => p.x));
    const minY = Math.min(...newRegion.points.map(p => p.y));
    const maxX = Math.max(...newRegion.points.map(p => p.x));
    const maxY = Math.max(...newRegion.points.map(p => p.y));

    const finalizedRegion: CropRegion = {
      id: Math.random().toString(36).substring(7),
      name: ``, // Name will be assigned by parent
      tool: 'polygon',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      points: newRegion.points
    };

    const dataUrl = await extractCrop(image, finalizedRegion, scale, scale);
    onCropAdd({ ...finalizedRegion, dataUrl });
    
    setIsDrawing(false);
    setNewRegion(null);
  };

  // Keyboard shortcut to close polygon
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && tool === 'polygon' && isDrawing) {
        handlePolygonComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, isDrawing, newRegion]);

  if (status === 'loading') return <div className={styles.editorContainer}>Loading image...</div>;
  if (!image) return <div className={styles.editorContainer}>Failed to load image.</div>;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button 
            className={`${styles.toolButton} ${tool === 'select' ? styles.active : ''}`}
            onClick={() => setTool('select')}
            title="Select"
          ><MousePointer2 size={18} /></button>
        </div>
        <div className={styles.toolGroup}>
          <button 
            className={`${styles.toolButton} ${tool === 'rectangle' ? styles.active : ''}`}
            onClick={() => setTool('rectangle')}
            title="Rectangle Crop"
          ><Square size={18} strokeWidth={1.5} style={{ transform: 'scaleX(1.4)' }} /> <span>Rect</span></button>
          
          <button 
            className={`${styles.toolButton} ${tool === 'square' ? styles.active : ''}`}
            onClick={() => setTool('square')}
            title="Square Crop"
          ><Square size={18} /></button>
          
          <button 
            className={`${styles.toolButton} ${tool === 'circle' ? styles.active : ''}`}
            onClick={() => setTool('circle')}
            title="Circle/Ellipse Crop"
          ><CircleIcon size={18} /></button>

          <button 
            className={`${styles.toolButton} ${tool === 'polygon' ? styles.active : ''}`}
            onClick={() => setTool('polygon')}
            title="Polygon/Free-hand Crop"
          ><PenTool size={18} /></button>
        </div>
        
        {tool === 'polygon' && isDrawing && (
          <button className="btn btn-primary" onClick={handlePolygonComplete} style={{marginLeft: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem'}}>
            Finish Polygon (Enter)
          </button>
        )}

        <div className={styles.instructions}>
          {tool === 'polygon' 
            ? "Click points on the image to create a polygon. Press Enter when done."
            : "Click and drag on the image to extract a region."}
        </div>
      </div>
      
      <div className={styles.canvasWrapper} ref={containerRef}>
        <Stage 
          width={dimensions.width} 
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
        >
          <Layer>
            <KonvaImage 
              image={image} 
              width={dimensions.width} 
              height={dimensions.height} 
            />

            {/* Render saved regions */}
            {regions.map((r, i) => (
              <Group key={r.id} x={r.x} y={r.y}>
                {r.tool === 'polygon' && r.points ? (
                  <Line 
                    points={r.points.flatMap(p => [p.x - r.x, p.y - r.y])} 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dash={[4, 4]}
                    closed 
                    fill="rgba(16, 185, 129, 0.15)"
                  />
                ) : r.tool === 'circle' ? (
                  <Circle 
                    x={r.width/2} y={r.height/2} 
                    radius={Math.abs(r.width)/2} 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dash={[4, 4]}
                    fill="rgba(16, 185, 129, 0.15)"
                  />
                ) : (
                  <Rect 
                    width={r.width} 
                    height={r.height} 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dash={[4, 4]}
                    fill="rgba(16, 185, 129, 0.15)"
                  />
                )}
                
                {/* Number label overlay */}
                <Group x={-10} y={-10}>
                  <Rect fill="#10b981" width={20} height={20} cornerRadius={4} />
                  <Text text={`${i + 1}`} fill="white" width={20} y={4} align="center" fontSize={12} fontStyle="bold" />
                </Group>
              </Group>
            ))}

            {/* Render current drawing shape */}
            {newRegion && (
              <Group>
                {newRegion.tool === 'polygon' && newRegion.points ? (
                  <Line 
                    points={newRegion.points.flatMap(p => [p.x, p.y])} 
                    stroke="#fbbf24" 
                    strokeWidth={2} 
                    dash={[5, 5]}
                  />
                ) : newRegion.tool === 'circle' ? (
                  <Circle 
                    x={(newRegion.x || 0) + (newRegion.width || 0)/2} 
                    y={(newRegion.y || 0) + (newRegion.height || 0)/2} 
                    radius={Math.abs(newRegion.width || 0)/2} 
                    stroke="#fbbf24" 
                    strokeWidth={2} 
                    dash={[5, 5]}
                  />
                ) : (
                  <Rect 
                    x={newRegion.x} 
                    y={newRegion.y} 
                    width={newRegion.width} 
                    height={newRegion.height} 
                    stroke="#fff" 
                    strokeWidth={1} 
                    dash={[4, 4]}
                  />
                )}
              </Group>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
