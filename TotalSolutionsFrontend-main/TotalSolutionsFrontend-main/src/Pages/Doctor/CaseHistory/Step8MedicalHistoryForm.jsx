import React, { useState, useRef, useCallback } from "react";
import DrawingCanvas from "./DrawingCanvas";

export default function Step8MedicalHistoryForm({ formData, updateFormData, selectedChild }) {
  const data = formData.medicalHistory || {
    generalHistory: "",
    prenatalHistory: "",
    natalHistory: "",
    postnatalHistory: "",
  };

  // Drawing canvas refs
  const generalCanvasRef = useRef(null);
  const prenatalCanvasRef = useRef(null);
  const natalCanvasRef = useRef(null);
  const postnatalCanvasRef = useRef(null);

  // Canvas visibility toggles
  const [showGeneralCanvas, setShowGeneralCanvas] = useState(false);
  const [showPrenatalCanvas, setShowPrenatalCanvas] = useState(false);
  const [showNatalCanvas, setShowNatalCanvas] = useState(false);
  const [showPostnatalCanvas, setShowPostnatalCanvas] = useState(false);

  // Saved drawing paths
  const [savedDrawings, setSavedDrawings] = useState({
    general: null,
    prenatal: null,
    natal: null,
    postnatal: null,
  });

  const handleSaveDrawing = useCallback((key, paths) => {
    setSavedDrawings((prev) => ({ ...prev, [key]: paths }));
  }, []);

  // Print all diagrams with clinician notes in a new window
  const handlePrintDiagrams = async () => {
    const sections = [
      {
        key: "general",
        sectionTitle: "General History",
        noteField: "generalHistory",
        diagramLabel: "General Family Diagram",
        ref: generalCanvasRef,
        show: showGeneralCanvas,
      },
      {
        key: "prenatal",
        sectionTitle: "Pre-natal History",
        noteField: "prenatalHistory",
        diagramLabel: "Pre-natal Diagram",
        ref: prenatalCanvasRef,
        show: showPrenatalCanvas,
      },
      {
        key: "natal",
        sectionTitle: "Natal History",
        noteField: "natalHistory",
        diagramLabel: "Natal Diagram",
        ref: natalCanvasRef,
        show: showNatalCanvas,
      },
      {
        key: "postnatal",
        sectionTitle: "Post-natal History",
        noteField: "postnatalHistory",
        diagramLabel: "Post-natal Diagram",
        ref: postnatalCanvasRef,
        show: showPostnatalCanvas,
      },
    ];

    // Check if there is any content at all
    const hasAnyContent = sections.some(
      (s) => data[s.noteField]?.trim() || (s.show && s.ref.current)
    );
    if (!hasAnyContent) {
      alert("No content to print. Please add notes or draw at least one diagram first.");
      return;
    }

    const childName = formData.childName || selectedChild?.name || "Patient";
    const dateStr = new Date().toLocaleDateString();

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print diagrams.");
      return;
    }

    // Build HTML for each section
    let sectionsHtml = "";
    for (const section of sections) {
      const noteText = data[section.noteField]?.trim() || "";
      let diagramImgHtml = "";

      if (section.show && section.ref.current) {
        try {
          const dataUrl = await section.ref.current.getImage();
          if (dataUrl) {
            diagramImgHtml = `
              <div style="margin-top: 12px;">
                <h3 style="color: #555; font-size: 15px; margin-bottom: 8px; font-weight: 600;">${section.diagramLabel}</h3>
                <img src="${dataUrl}" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 4px;" />
              </div>
            `;
          }
        } catch {
          // skip
        }
      }

      // Only include the section if it has notes or a diagram
      if (noteText || diagramImgHtml) {
        const noteHtml = noteText
          ? `<div style="margin-top: 8px; padding: 12px 16px; background: #f9fafb; border-left: 4px solid #ab1c1c; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">${noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
          : `<p style="color: #999; font-style: italic; font-size: 13px; margin-top: 8px;">No notes recorded.</p>`;

        sectionsHtml += `
          <div style="page-break-inside: avoid; margin-bottom: 36px;">
            <h2 style="color: #ab1c1c; font-size: 18px; margin-bottom: 4px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${section.sectionTitle}</h2>
            <p style="color: #666; font-size: 13px; margin: 0 0 4px; font-weight: 600;">Clinician\'s Notes:</p>
            ${noteHtml}
            ${diagramImgHtml}
          </div>
        `;
      }
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Demographic Details - ${childName}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
              img { max-width: 100%; height: auto; object-fit: contain; page-break-inside: avoid; }
              div { page-break-inside: avoid; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #333;
              max-width: 900px;
              margin: 0 auto;
              padding: 40px;
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ab1c1c; font-size: 24px; margin: 0;">Demographic Details</h1>
            <p style="color: #666; margin: 8px 0 0;">Child: <strong>${childName}</strong> &nbsp;|&nbsp; Date: ${dateStr}</p>
          </div>
          ${sectionsHtml}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 600);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleChange = (e) => {
    updateFormData("medicalHistory", {
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Step 8: Demographic Details</h2>
          <p className="text-sm text-gray-500">Record developmental and family history.</p>
        </div>
        <button
          onClick={handlePrintDiagrams}
          className="px-4 py-2 bg-[#ab1c1c] text-white font-semibold rounded-lg shadow-md hover:bg-[#8e1818] transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Diagrams
        </button>
      </div>

      {/* ========== General History ========== */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">General History</label>
        <p className="text-xs text-gray-500 mb-2">General observations, family background, and relevant notes.</p>
        <textarea
          name="generalHistory"
          value={data.generalHistory || ""}
          onChange={handleChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter general history notes here..."
        ></textarea>

        {/* General Family Diagram */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-md font-medium text-gray-700">General Family Diagram</h4>
              <p className="text-xs text-gray-500">Draw a freehand family / pedigree diagram.</p>
            </div>
            <button
              onClick={() => setShowGeneralCanvas((v) => !v)}
              className={`px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm ${
                showGeneralCanvas
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#ab1c1c] text-white hover:bg-[#8e1818]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {showGeneralCanvas ? "Hide Canvas" : "Draw Diagram"}
            </button>
          </div>
          {showGeneralCanvas && (
            <DrawingCanvas
              ref={generalCanvasRef}
              title="General Family Diagram"
              onSave={(paths) => handleSaveDrawing("general", paths)}
            />
          )}
        </div>
      </div>

      {/* Pre-natal History */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pre-natal History</label>
        <p className="text-xs text-gray-500 mb-2">Pregnancy details (complications, medications, etc.)</p>
        <textarea
          name="prenatalHistory"
          value={data.prenatalHistory || ""}
          onChange={handleChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter details here..."
        ></textarea>

        {/* Pre-natal Diagram */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-md font-medium text-gray-700">Pre-natal Diagram</h4>
              <p className="text-xs text-gray-500">Draw observations related to pregnancy history.</p>
            </div>
            <button
              onClick={() => setShowPrenatalCanvas((v) => !v)}
              className={`px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm ${
                showPrenatalCanvas
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#ab1c1c] text-white hover:bg-[#8e1818]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {showPrenatalCanvas ? "Hide Canvas" : "Draw Diagram"}
            </button>
          </div>
          {showPrenatalCanvas && (
            <DrawingCanvas
              ref={prenatalCanvasRef}
              title="Pre-natal Diagram"
              onSave={(paths) => handleSaveDrawing("prenatal", paths)}
            />
          )}
        </div>
      </div>

      {/* Natal History */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Natal History</label>
        <p className="text-xs text-gray-500 mb-2">Birth conditions (term, type of delivery, birth weight, complications, etc.)</p>
        <textarea
          name="natalHistory"
          value={data.natalHistory || ""}
          onChange={handleChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter details here..."
        ></textarea>

        {/* Natal Diagram */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-md font-medium text-gray-700">Natal Diagram</h4>
              <p className="text-xs text-gray-500">Draw observations related to birth conditions.</p>
            </div>
            <button
              onClick={() => setShowNatalCanvas((v) => !v)}
              className={`px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm ${
                showNatalCanvas
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#ab1c1c] text-white hover:bg-[#8e1818]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {showNatalCanvas ? "Hide Canvas" : "Draw Diagram"}
            </button>
          </div>
          {showNatalCanvas && (
            <DrawingCanvas
              ref={natalCanvasRef}
              title="Natal Diagram"
              onSave={(paths) => handleSaveDrawing("natal", paths)}
            />
          )}
        </div>
      </div>

      {/* Post-natal History */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Post-natal History</label>
        <p className="text-xs text-gray-500 mb-2">Development after birth (milestones, early illnesses, etc.)</p>
        <textarea
          name="postnatalHistory"
          value={data.postnatalHistory || ""}
          onChange={handleChange}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter details here..."
        ></textarea>

        {/* Post-natal Diagram */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-md font-medium text-gray-700">Post-natal Diagram</h4>
              <p className="text-xs text-gray-500">Draw observations related to post-birth development.</p>
            </div>
            <button
              onClick={() => setShowPostnatalCanvas((v) => !v)}
              className={`px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm ${
                showPostnatalCanvas
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#ab1c1c] text-white hover:bg-[#8e1818]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {showPostnatalCanvas ? "Hide Canvas" : "Draw Diagram"}
            </button>
          </div>
          {showPostnatalCanvas && (
            <DrawingCanvas
              ref={postnatalCanvasRef}
              title="Post-natal Diagram"
              onSave={(paths) => handleSaveDrawing("postnatal", paths)}
            />
          )}
        </div>
      </div>

    </div>
  );
}

