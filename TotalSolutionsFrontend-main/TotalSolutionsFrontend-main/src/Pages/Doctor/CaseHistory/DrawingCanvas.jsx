import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const DrawingCanvas = forwardRef(({ title, onSave }, ref) => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen"); // pen | eraser
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [hasDrawing, setHasDrawing] = useState(false);

  // Helper: crop a data URL image to its drawn content bounding box
  const cropToContent = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;

        // Find bounding box of non-white pixels
        let top = height, left = width, bottom = 0, right = 0;
        let hasContent = false;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            // Check if pixel is NOT white/transparent
            if (a > 10 && (r < 245 || g < 245 || b < 245)) {
              hasContent = true;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
              if (x < left) left = x;
              if (x > right) right = x;
            }
          }
        }

        if (!hasContent) {
          resolve(null); // nothing drawn
          return;
        }

        // Add padding around the cropped area
        const padding = 20;
        top = Math.max(0, top - padding);
        left = Math.max(0, left - padding);
        bottom = Math.min(height - 1, bottom + padding);
        right = Math.min(width - 1, right + padding);

        const cropWidth = right - left + 1;
        const cropHeight = bottom - top + 1;

        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext("2d");
        // Fill with white background
        croppedCtx.fillStyle = "#ffffff";
        croppedCtx.fillRect(0, 0, cropWidth, cropHeight);
        croppedCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        resolve(croppedCanvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

  // Expose getImage method to parent
  useImperativeHandle(ref, () => ({
    getImage: async () => {
      try {
        const dataUrl = await canvasRef.current.exportImage("png");
        // Crop to only the drawn content
        const cropped = await cropToContent(dataUrl);
        return cropped;
      } catch {
        return null;
      }
    },
    getSVG: async () => {
      try {
        const svg = await canvasRef.current.exportSvg();
        return svg;
      } catch {
        return null;
      }
    },
    loadPaths: async (paths) => {
      if (paths && paths.length > 0 && canvasRef.current) {
        await canvasRef.current.loadPaths(paths);
        setHasDrawing(true);
      }
    },
  }));

  const handleUndo = () => {
    canvasRef.current.undo();
  };

  const handleRedo = () => {
    canvasRef.current.redo();
  };

  const handleClear = () => {
    canvasRef.current.clearCanvas();
    setHasDrawing(false);
    if (onSave) onSave(null);
  };

  const handleStroke = async () => {
    setHasDrawing(true);
    // Auto-save paths after each stroke
    if (onSave && canvasRef.current) {
      try {
        const paths = await canvasRef.current.exportPaths();
        onSave(paths);
      } catch {
        // silent
      }
    }
  };

  const colors = [
    "#000000", "#ab1c1c", "#1a56db", "#047857",
    "#7c3aed", "#ea580c", "#64748b",
  ];

  const widths = [
    { label: "Fine", value: 1 },
    { label: "Thin", value: 2 },
    { label: "Medium", value: 3 },
    { label: "Thick", value: 5 },
    { label: "Bold", value: 8 },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
        {/* Pen / Eraser toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => {
              setTool("pen");
              canvasRef.current.eraseMode(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
              tool === "pen"
                ? "bg-[#ab1c1c] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Pen
          </button>
          <button
            onClick={() => {
              setTool("eraser");
              canvasRef.current.eraseMode(true);
            }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 border-l border-gray-300 ${
              tool === "eraser"
                ? "bg-[#ab1c1c] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
              <path d="M22 21H7" />
              <path d="m5 11 9 9" />
            </svg>
            Eraser
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Stroke Width */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Size:</span>
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            {widths.map((w) => (
              <button
                key={w.value}
                onClick={() => setStrokeWidth(w.value)}
                title={w.label}
                className={`px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  strokeWidth === w.value
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Color:</span>
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setStrokeColor(c);
                  if (tool === "eraser") {
                    setTool("pen");
                    canvasRef.current.eraseMode(false);
                  }
                }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  strokeColor === c ? "border-gray-800 scale-110 ring-1 ring-offset-1 ring-gray-400" : "border-gray-300"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Undo / Redo / Clear */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            title="Undo"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            title="Redo"
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
          <button
            onClick={handleClear}
            title="Clear canvas"
            className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors ml-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Canvas Viewport */}
      <div
        style={{
          maxHeight: 500,
          overflowY: "auto",
          overflowX: "hidden",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          position: "relative",
        }}
      >
        <div className="relative" style={{ height: 2000, minWidth: "100%" }}>
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="2000px"
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            eraserWidth={strokeWidth * 4}
            canvasColor="#ffffff"
            style={{
              border: "none",
              borderRadius: 0,
            }}
            onStroke={handleStroke}
          />
          {!hasDrawing && (
            <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none" style={{ paddingTop: 200 }}>
              <p className="text-gray-300 text-lg font-medium select-none">
                Scroll down to draw larger diagrams — Draw your {title} here...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
