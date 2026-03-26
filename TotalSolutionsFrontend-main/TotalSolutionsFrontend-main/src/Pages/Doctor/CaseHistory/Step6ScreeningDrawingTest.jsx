import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Step6ScreeningDrawingTest({ formData, selectedChild }) {
  const handlePrint = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let startY = 40;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(171, 28, 28);
    doc.text("Screening Drawing Test", pageWidth / 2, startY, { align: "center" });
    startY += 30;

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Child Name: ${formData.childName || selectedChild?.name || "________________"}`, margin, startY);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, startY, { align: "right" });
    startY += 40;

    doc.setFontSize(10);
    doc.text("Instructions: Please have the child copy the shapes shown on the left into the blank spaces provided.", margin, startY);
    startY += 30;

    const shapes = [
      { name: "Circle", age: "3 yrs", draw: (doc, x, y) => doc.circle(x + 25, y + 25, 20) },
      { name: "Cross (+)", age: "4 yrs", draw: (doc, x, y) => { doc.line(x + 25, y + 5, x + 25, y + 45); doc.line(x + 5, y + 25, x + 45, y + 25); } },
      { name: "Square", age: "5 yrs", draw: (doc, x, y) => doc.rect(x + 5, y + 5, 40, 40) },
      { name: "Triangle", age: "6 yrs", draw: (doc, x, y) => { doc.triangle(x + 25, y + 5, x + 5, y + 45, x + 45, y + 45); } },
      { name: "Rectangle with diagonals", age: "6.5 yrs", draw: (doc, x, y) => { doc.rect(x + 5, y + 10, 40, 30); doc.line(x + 5, y + 10, x + 45, y + 40); doc.line(x + 45, y + 10, x + 5, y + 40); } },
      { name: "Diamond", age: "7 yrs", draw: (doc, x, y) => { doc.line(x + 25, y + 5, x + 45, y + 25); doc.line(x + 45, y + 25, x + 25, y + 45); doc.line(x + 25, y + 45, x + 5, y + 25); doc.line(x + 5, y + 25, x + 25, y + 5); } },
    ];

    shapes.forEach((shape) => {
      if (startY > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        startY = 40;
      }

      // Left Side: Name, Age and Shape
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${shape.name} (Age: ${shape.age})`, margin, startY + 25);

      // Draw the reference shape
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      shape.draw(doc, margin + 210, startY - 10);

      // Right Side: Blank Box
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.rect(margin + 290, startY - 20, 200, 70);

      startY += 100;
    });

    const fileName = `Screening_Drawing_Test_${(formData.childName || "Child").replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Step 6: Screening Drawing Test</h2>
      <p className="text-gray-600">
        Generate a printable screening sheet to test the child's visual-motor development.
        The sheet will include standard shapes like a Circle, Cross, Square, Triangle, Rectangle with diagonals, and a Diamond, along with a blank space for the child to copy them.
      </p>

      <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-[#ab1c1c] font-medium text-center">
          Click below to download and print the screening sheet. Have the child draw on the printed paper.
        </p>
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-[#ab1c1c] text-white font-semibold rounded-lg shadow-md hover:bg-[#8e1818] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Screening Sheet
        </button>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Shapes Included</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-800"></div>
            <div>
              <p className="font-semibold text-gray-700">Circle</p>
              <p className="text-xs text-gray-500">Expected: 3 yrs</p>
            </div>
          </li>
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center relative">
              <div className="w-8 h-0.5 bg-gray-800 absolute"></div>
              <div className="h-8 w-0.5 bg-gray-800 absolute"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Cross (+)</p>
              <p className="text-xs text-gray-500">Expected: 4 yrs</p>
            </div>
          </li>
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-800"></div>
            <div>
              <p className="font-semibold text-gray-700">Square</p>
              <p className="text-xs text-gray-500">Expected: 5 yrs</p>
            </div>
          </li>
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-gray-800"></div>
            <div>
              <p className="font-semibold text-gray-700">Triangle</p>
              <p className="text-xs text-gray-500">Expected: 6 yrs</p>
            </div>
          </li>
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-6 border-2 border-gray-800 relative">
              <div className="absolute top-0 left-0 w-full h-full border-t border-l border-gray-800 transform rotate-12 scale-110 opacity-50"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t border-r border-gray-800 transform -rotate-12 scale-110 opacity-50"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Rectangle w/ Diagonals</p>
              <p className="text-xs text-gray-500">Expected: 6.5 yrs</p>
            </div>
          </li>
          <li className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-800 transform rotate-45 ml-1"></div>
            <div>
              <p className="font-semibold text-gray-700">Diamond</p>
              <p className="text-xs text-gray-500">Expected: 7 yrs</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
