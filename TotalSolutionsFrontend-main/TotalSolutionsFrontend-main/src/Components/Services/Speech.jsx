import React from 'react';

import image from '../../assets/Services/Speech/speech.webp';
import icon1 from '../../assets/Services/Speech/receptive_language.webp';
import icon2 from '../../assets/Services/Speech/speech_language.webp';

export default function Speech() {
    return (
      <div className="font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white">
          <div className="w-full">
            <img src={image} alt="Speech Therapy" className="w-full object-cover" />
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-[#001F3F] relative inline-block">
            Speech Therapy Services
            <span className="block w-20 h-1 bg-red-500 mx-auto mt-1"></span>
          </h3>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10 px-4 pb-16">
          <div className="flex items-center bg-gradient-to-br from-red-100 via-pink-100 to-white shadow-md p-6 w-full md:w-96 rounded-md">
            <img src={icon1} alt="Speech and Language Evaluation" className="w-10 h-10 mr-4" />
            <span className="text-md text-[#001F3F] font-semibold">Speech and Language Evaluation</span>
          </div>

          <div className="flex items-center bg-gradient-to-br from-blue-100 via-purple-100 to-white shadow-md p-6 w-full md:w-96 rounded-md">
            <img src={icon2} alt="Receptive Language Evaluation" className="w-10 h-10 mr-4" />
            <span className="text-md text-[#001F3F] font-semibold">Receptive Language Evaluation</span>
          </div>
        </div>
      </div>
    );
  }
  