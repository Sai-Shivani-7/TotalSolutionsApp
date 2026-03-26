import React from 'react';

import image from '../../assets/Services/RemedialTherapy/remedial.webp';

export default function RemedialTherapy() {
    return (
      <div className="font-sans text-[#001F3F]">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white">
          <div className="w-full">
            <img src={image} alt="Remedial Therapy" className="w-full object-cover" />
          </div>
        </div>

        <div className="text-center mt-10">
          <h3 className="text-2xl font-bold text-[#001F3F] inline-block relative">
            Remedial Therapy Services
            <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
          </h3>
        </div>

        <div className="flex justify-center mt-8 px-4">
          <div className="bg-gradient-to-r from-red-200 via-red-100 to-red-50 p-6 md:p-8 rounded-md max-w-4xl shadow-md space-y-4 text-lg leading-relaxed border">
            <p className="font-semibold">
              In remedial/education therapy we provide a threefold support to the child in following ways:
            </p>
            <ul className="space-y-2 pl-4 list-none">
              <li>
                <span className="text-blue-600 mr-2">➯</span>
                Teaching and reinforcing of cognitive skills. Visual perception / Auditory perception / Working memory / Attention enhancement skills / Reasoning / planning ability / Language processing skills
              </li>
              <li>
                <span className="text-blue-600 mr-2">➯</span>
                Comprehension skills Strengthening the learning of academic based skills (English language / Math / Hindi / study skills)
              </li>
              <li>
                <span className="text-blue-600 mr-2">➯</span>
                Behavior Modification
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-6 px-4 pb-12">
          <div className="bg-gradient-to-r from-red-200 via-red-100 to-red-50 p-6 md:p-8 rounded-md max-w-4xl shadow-md space-y-4 text-lg leading-relaxed border">
            <p className="font-semibold">
              The other components of Remedial Therapy that we provide are:
            </p>
            <ul className="space-y-2 pl-4 list-none">
              <li><span className="text-blue-600 mr-2">➯</span>Educational intervention to enhance study skills</li>
              <li><span className="text-blue-600 mr-2">➯</span>Reading skills intervention</li>
              <li><span className="text-blue-600 mr-2">➯</span>Writing skills intervention</li>
              <li><span className="text-blue-600 mr-2">➯</span>Spelling skills intervention</li>
              <li><span className="text-blue-600 mr-2">➯</span>Math basic skills training</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  