import React from 'react';
import heroImage from "../../assets/Services/AssessmentEvaluation/assesment.webp";

const AssessmentEvaluation = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <img
          src={heroImage}
          alt="Psychological Testing Services"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Testing and Evaluation Services
        </h1>

        <div className="mb-12 bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-10 rounded-xl ">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Psychological Assessments & IQ Testing
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Brain Based Intelligence Test (BBIT)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Malin's Intelligence Scale for Indian Children (MISIC)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Binet Kamat Test of Intelligence (BKT)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <div>
                <p>Wechsler's Intelligence Scale for Children (WISC-IV)</p>
                <p className="text-sm text-gray-600 ml-4">Indian and UK norms are available</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Cognitive Assessment System (CAS)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Raven's Standard Progressive Matrices (SPM)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Raven's Color Progressive Matrices (CPM)</span>
            </li>
          </ul>
        </div>

        <div className="mb-12 bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-10 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Developmental Assessments
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Bayley Scale of Infant and Toddler Development</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Developmental Screening Test (DST)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Vineland Social Maturity Scale (VSMS)</span>
            </li>
          </ul>
        </div>

        <div className="mb-12 bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-10 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Psycho-Educational Assessments
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Wechsler's Individual Achievement Test (WIAT-II)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Dyslexia Screening Test- Junior</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Dyslexia Screening Test-Senior</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>NIMHANS SLD Index</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Brigance Learning Skills Evaluation</span>
            </li>
          </ul>
        </div>

        <div className="mb-12 bg-gradient-to-br from-red-200 via-red-100 to-red-50 p-10 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Diagnostic Evaluation for:
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Specific Learning Disorder</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Attention Deficit Hyperactivity Disorder</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Autism Spectrum Disorder</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Sensory Processing Disorder</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">➔</span>
              <span>Slow Learner</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssessmentEvaluation;