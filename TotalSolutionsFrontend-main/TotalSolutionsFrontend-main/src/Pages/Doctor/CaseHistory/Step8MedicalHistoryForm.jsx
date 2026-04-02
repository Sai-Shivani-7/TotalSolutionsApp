import React, { useState, useRef, useCallback } from "react";
import DrawingCanvas from "./DrawingCanvas";

export default function Step8MedicalHistoryForm({ formData, updateFormData, selectedChild, readOnly = false }) {
  const data = formData.medicalHistory || {
    presentingComplaints: "",
    referredBy: "",
    generalHistory: "",
    pregnancyHistory: "",
    pedigreeDrawingImage: "",
  };

  // Drawing canvas refs
  const generalCanvasRef = useRef(null);

  // Canvas visibility toggles
  const [showGeneralCanvas, setShowGeneralCanvas] = useState(false);

  // Saved drawing paths
  const [savedDrawings, setSavedDrawings] = useState({
    general: null,
  });

  const handleSaveDrawing = useCallback((key, paths) => {
    setSavedDrawings((prev) => ({ ...prev, [key]: paths }));

    if (key === "general") {
      (async () => {
        if (generalCanvasRef.current) {
          try {
            const dataUrl = await generalCanvasRef.current.getImage();
            if (dataUrl) {
              updateFormData("medicalHistory", (prev) => ({
                ...prev,
                pedigreeDrawingImage: dataUrl,
              }));
            }
          } catch {
            // no-op
          }
        }
      })();
    }
  }, [updateFormData]);

  // Print all diagrams with clinician notes in a new window
  const handlePrintDiagrams = async () => {
    const sections = [
      {
        key: "general",
        sectionTitle: "Pedigree Chart",
        noteField: "generalHistory",
        diagramLabel: "Pedigree Diagram",
        ref: generalCanvasRef,
        show: showGeneralCanvas,
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
            // Save pedigree diagram image to form data
            updateFormData("medicalHistory", {
              ...data,
              pedigreeDrawingImage: dataUrl,
            });
            
            diagramImgHtml = `
              <div style="margin-top: 24px; margin-bottom: 24px;">
                <p style="color: #333; font-size: 13px; margin: 0 0 12px; font-weight: 600;">Diagram:</p>
                <img src="${dataUrl}" style="max-width: 100%; height: auto; border: 1px solid #d1d5db; border-radius: 4px;" />
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
          ? `<div style="margin-top: 12px; margin-bottom: 12px; padding: 12px 0; font-size: 13px; line-height: 1.8; color: #333; white-space: pre-wrap;">${noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
          : `<p style="color: #999; font-style: italic; font-size: 13px; margin: 12px 0;">No notes recorded.</p>`;

        sectionsHtml += `
          <div style="margin-bottom: 48px;">
            <h2 style="color: #333; font-size: 16px; margin: 0 0 12px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">${section.sectionTitle}</h2>
            <p style="color: #555; font-size: 12px; margin: 0 0 8px; font-weight: 600;">Notes:</p>
            ${noteHtml}
            ${diagramImgHtml}
          </div>
        `;
      }
    }

    // Add pregnancy history section
    const pregnancyText = data.pregnancyHistory?.trim() || "";
    let pregnancyHtml = "";
    if (pregnancyText) {
      pregnancyHtml = `
        <div style="margin-bottom: 48px;">
          <h2 style="color: #333; font-size: 16px; margin: 0 0 12px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Pregnancy History</h2>
          <div style="margin-top: 12px; padding: 12px 0; font-size: 13px; line-height: 1.8; color: #333; white-space: pre-wrap;">${pregnancyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Child Assessment - ${childName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              margin-top: 2in;
              margin-bottom: 1.5in;
              margin-left: 0.75in;
              margin-right: 0.75in;
            }
            @media print {
              body {
                margin-top: 2in;
                margin-bottom: 1.5in;
                margin-left: 0.75in;
                margin-right: 0.75in;
                padding: 0;
              }
              .no-print { display: none !important; }
              img { max-width: 100%; height: auto; object-fit: contain; page-break-inside: avoid; }
            }
            html, body {
              width: 100%;
              height: 100%;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #333;
              font-size: 12px;
              line-height: 1.6;
            }
            .header {
              margin-bottom: 48px;
              padding-bottom: 16px;
              border-bottom: 1px solid #d1d5db;
            }
            .header p {
              margin: 4px 0;
              font-size: 13px;
              color: #555;
            }
            .section {
              margin-bottom: 48px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #333;
              font-size: 16px;
              margin: 0 0 12px 0;
              font-weight: 600;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 8px;
            }
            .section p {
              color: #555;
              font-size: 12px;
              margin: 0 0 8px 0;
              font-weight: 600;
            }
            .notes {
              margin-top: 12px;
              padding: 12px 0;
              font-size: 13px;
              line-height: 1.8;
              color: #333;
              white-space: pre-wrap;
            }
            .diagram {
              margin-top: 24px;
              margin-bottom: 24px;
            }
            .diagram-label {
              color: #333;
              font-size: 13px;
              margin: 0 0 12px 0;
              font-weight: 600;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <p><strong>Child:</strong> ${childName}</p>
            <p><strong>Date:</strong> ${dateStr}</p>
          </div>
          ${pregnancyHtml}
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
    if (readOnly) return;
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

      {/* ========== Presenting Complaints ========== */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Presenting Complaints</label>
        <p className="text-xs text-gray-500 mb-2">Chief complaint or reason for referral.</p>
        <textarea
          name="presentingComplaints"
          value={data.presentingComplaints || ""}
          onChange={handleChange}
          disabled={readOnly}
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter presenting complaints here..."
        ></textarea>
      </div>

      {/* ========== Who Referred By ========== */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Who Referred By</label>
        <p className="text-xs text-gray-500 mb-2">Source of referral for this case.</p>
        <select
          name="referredBy"
          value={data.referredBy || ""}
          onChange={handleChange}
          disabled={readOnly}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
        >
          <option value="">-- Select Referral Source --</option>
          <option value="Doctor">Doctor</option>
          <option value="Parents">Parents</option>
          <option value="School">School</option>
          <option value="Other Therapist">Other Therapist</option>
          <option value="Self Referral">Self Referral</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* ========== Pedigree Chart ========== */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pedigree Chart</label>
        <p className="text-xs text-gray-500 mb-2">Family tree, genetic information, and family background.</p>
        <textarea
          name="generalHistory"
          value={data.generalHistory || ""}
          onChange={handleChange}
          disabled={readOnly}
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
              disabled={readOnly}
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
          {showGeneralCanvas && !readOnly && (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy History</label>
        <p className="text-xs text-gray-500 mb-2">Pre-natal (pregnancy details, complications, medications), Natal (birth conditions, term, delivery type, weight), and Post-natal (development after birth, milestones, early illnesses).</p>
        <textarea
          name="pregnancyHistory"
          value={data.pregnancyHistory || ""}
          onChange={handleChange}
          disabled={readOnly}
          rows="8"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ab1c1c] focus:outline-none bg-white"
          placeholder="Enter pregnancy history details (pre-natal, natal, post-natal) here..."
        ></textarea>
      </div>

    </div>
  );
}

