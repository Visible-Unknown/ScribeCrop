export type ToolType = 'rectangle' | 'square' | 'circle' | 'polygon';

export interface Point {
  x: number;
  y: number;
}

export interface CropRegion {
  id: string;
  name: string;
  tool: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[]; // Relative to the canvas logic
  dataUrl?: string; // Stored image snippet
}
