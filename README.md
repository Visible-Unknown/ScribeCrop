# ScribeCrop

**High-efficiency dataset annotation and image region extraction.**

ScribeCrop was born out of frustration with standard image editing utilities. When annotating large datasets, tools like the Snipping Tool, Paint, or Windows Photos fail to keep up. They are designed for one-off edits, not high-volume production. 

ScribeCrop solves the three biggest bottlenecks in manual dataset preparation:
1. **Single-Crop Fatigue**: Instead of opening and saving a file for every single word, ScribeCrop allows you to map out every region on a single image and export them all in one click.
2. **Naming Friction**: Forget typing `word_01`, `word_02`, `word_03` manually. ScribeCrop handles sequential naming automatically with custom prefixes and start indices.
3. **Scaling & Precision**: Generic tools often struggle with consistent scaling and high-precision selection. ScribeCrop provides sub-pixel accuracy with interactive handles and automated workspace scaling.

---

<p align="center">
  <img src="src/app/icon.png" width="150" alt="ScribeCrop Logo" />
</p>

## Core Capabilities

- **🚀 Bulk Extraction**: Draw rectangles, squares, circles, or complex polygons across your entire image.
- **⚡ Reactive Renaming**: Set a prefix and a start number; ScribeCrop re-indexes your entire collection instantly as you work.
- **🎯 Precision Reshaping**: Use professional transformer handles to fine-tune your crop areas after drawing them.
- **🔄 Universal Rotation**: Rotate documents or photos to any orientation without losing your coordinate space.
- **📦 ZIP Export**: One-button export that packages your entire session into a clean, labeled ZIP archive.
- **💎 Premium Aesthetic**: A tailored Emerald & Zinc interface designed for focus and tool-centric clarity.

## Technical Foundation

Building a professional tool requires a robust stack. ScribeCrop is built with precision in mind:

- **Framework**: Next.js (App Router) for high-performance client-side rendering.
- **Canvas Engine**: [Konva.js](https://konvajs.org/) — powering the multi-layered selection and transformation engine.
- **Aesthetics**: Vanilla CSS with a custom monochromatic color system for minimum distraction.
- **Icons**: [Lucide React](https://lucidreact.dev/) for crisp, scalable tool-set representation.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Visible-Unknown/ScribeCrop.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to start harvesting.

---

*Designed for researchers, developers, and data scientists who value their time.*
