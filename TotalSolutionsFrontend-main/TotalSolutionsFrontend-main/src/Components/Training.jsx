import React, { useState } from 'react';
import image1 from '../assets/Training/training.webp';


export default function Training() {
    return (
        <div>
            <div className="relative w-full overflow-hidden mx-auto">
                <div className="flex h-full">
                    <div className="min-w-full h-full flex items-center justify-center bg-black">
                        <img
                            src={image1}
                            alt={`Image`}
                            className="w-full h-[80%] object-cover rounded-lg shadow-md"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-gray-300 pb-2 text-center">
        Training Information
      </h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Row</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Training Programs</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Duration</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Frequency</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Course Coordinator</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">Pedagogy (Short term)</td>
              <td className="px-4 py-3">3 Month</td>
              <td className="px-4 py-3">Twice in a year (May batch and Oct Batch)</td>
              <td className="px-4 py-3">Ms. Khersingh Komal (8121884021)</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">2</td>
              <td className="px-4 py-3">Behavioural therapy</td>
              <td className="px-4 py-3">1 Month</td>
              <td className="px-4 py-3">In house Training for staff</td>
              <td className="px-4 py-3">Mrs. Ashwathy R (9603281782)</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">3</td>
              <td className="px-4 py-3">PREP, COGENT & Math Module</td>
              <td className="px-4 py-3">3 Month</td>
              <td className="px-4 py-3">Quarterly</td>
              <td className="px-4 py-3">Mr. Sridhar (7702222209)</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">4</td>
              <td className="px-4 py-3">Parent Training Program for Behaviour Therapy Skills</td>
              <td className="px-4 py-3">1 Month</td>
              <td className="px-4 py-3">On demand of parents (group of minimum 10 parents)</td>
              <td className="px-4 py-3">Ms. Khersingh Komal (9849053404)</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">5</td>
              <td className="px-4 py-3 space-y-2">
              <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-0">
                Training in improving handwriting skills (Short term)
              </div>
              <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-0">
                Training to teach reading skills (Short term)
              </div>
              <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-0">
                Training to teach spelling skills (Short term)
              </div>
              <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-0">
                Behaviour Modification Strategies (Short term)
              </div>
              <div className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-0">
                Training in attention enhancement (Short term)
              </div>
              </td>
              <td className="px-4 py-3">As per demand</td>
              <td className="px-4 py-3">As per demand</td>
              <td className="px-4 py-3">Mrs. Gomathi Sharma (9866983096)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
            
        </div>
    );
}