// import React from "react";

// // --- Data for the Code of Conduct ---
// const conductPrinciples = [
//   {
//     id: 1,
//     title: "Maintain Professional Boundaries",
//     description:
//       "Therapists must maintain clear, appropriate, and ethical professional boundaries with all clients to ensure safety and therapeutic integrity.",
//   },
//   {
//     id: 2,
//     title: "Ensure Patient Confidentiality",
//     description:
//       "All client information, including records and session content, must be kept strictly confidential, adhering to HIPAA and other relevant privacy laws.",
//   },
//   {
//     id: 3,
//     title: "Act with Integrity and Honesty",
//     description:
//       "Therapists will be honest and trustworthy in all professional dealings, including billing, reporting, and communication with clients and colleagues.",
//   },
//   {
//     id: 4,
//     title: "Provide Evidence-Based Care",
//     description:
//       "Treatment and therapeutic interventions must be based on current, valid, and reliable scientific evidence and best practice guidelines.",
//   },
//   {
//     id: 5,
//     title: "Respect Patient Autonomy",
//     description:
//       "Respect the client's right to self-determination and participation in their care, including the right to refuse or terminate services.",
//   },
//   {
//     id: 6,
//     title: "Continually Develop Professional Skills",
//     description:
//       "Commit to ongoing professional development, training, and supervision to maintain competence and stay current with the field.",
//   },
//   {
//     id: 7,
//     title: "Adhere to Legal and Ethical Standards",
//     description:
//       "Strictly follow all national, state, and organizational laws, rules, and ethical codes governing the practice of therapy.",
//   },
// ];

// // --- CodeOfConductPage Component ---
// export default function CodeOfConductPage() {
//   // The structure and styling (max-w-4xl, shadow-xl, p-8) match the TherapistCalendar.
//   return (
//     <div className="container mx-auto mt-20 px-4">
//       <div className="flex justify-center items-center mb-8">
//         <h1 className="text-3xl font-bold text-[#ab1c1c] text-center">
//           Therapist Code of Conduct
//         </h1>
//       </div>

//       <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto border-t-4 border-[#ab1c1c]">
//         <p className="text-lg text-gray-700 mb-6 text-center">
//           Our commitment to ethical practice and professional excellence.
//         </p>
        
//         <div className="space-y-6">
//           {conductPrinciples.map((principle) => (
//             <div 
//               key={principle.id} 
//               className="flex items-start p-3 bg-red-50 rounded-md border-l-4 border-[#ab1c1c] transition duration-150 ease-in-out hover:shadow-md"
//             >
//               {/* Custom Red Bullet Point */}
//               <svg
//                 className="w-5 h-5 text-[#ab1c1c] mt-1 mr-3 flex-shrink-0"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <circle cx="10" cy="10" r="4" />
//               </svg>

//               <div>
//                 <h3 className="text-xl font-semibold text-[#ab1c1c] mb-1">
//                   {principle.title}
//                 </h3>
//                 <p className="text-gray-600 text-base">
//                   {principle.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Footer/Contact Information */}
//         <div className="mt-8 pt-4 border-t border-red-200 text-center">
//           <p className="text-sm text-gray-500 italic">
//             Questions regarding this Code of Conduct should be directed to the Ethics Review Board.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CodeOfConductPage() {
  const [conductPrinciples, setConductPrinciples] = useState([]);

  useEffect(() => {
    axios
      .get("api/therapists/codeofconduct")
      .then((res) => setConductPrinciples(res.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="container mx-auto mt-20 px-4">
      <div className="flex justify-center items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ab1c1c] text-center">
          Therapist Code of Conduct
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto border-t-4 border-[#ab1c1c]">
        <p className="text-lg text-gray-700 mb-6 text-center">
          Our commitment to ethical practice and professional excellence.
        </p>

        <div className="space-y-6">
          {conductPrinciples.length > 0 ? (
            conductPrinciples.map((principle) => (
              <div
                key={principle._id}
                className="flex items-start p-3 bg-red-50 rounded-md border-l-4 border-[#ab1c1c] transition duration-150 ease-in-out hover:shadow-md"
              >
                <svg
                  className="w-5 h-5 text-[#ab1c1c] mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="10" r="4" />
                </svg>

                <div>
                  <h3 className="text-xl font-semibold text-[#ab1c1c] mb-1">
                    {principle.title}
                  </h3>
                  <p className="text-gray-600 text-base">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No code of conduct available at this time.</p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-red-200 text-center">
          <p className="text-sm text-gray-500 italic">
            Questions regarding this Code of Conduct should be directed to the Ethics Review Board.
          </p>
        </div>
      </div>
    </div>
  );
}