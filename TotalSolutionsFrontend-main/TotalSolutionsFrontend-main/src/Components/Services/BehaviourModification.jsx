import React from 'react';

import image from '../../assets/Services/BehaviourModification/Web_SubBanner_BM.webp';

export default function BehaviourModification() {
    return (
      <div className="font-sans">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white">
          <div className="w-full">
            <img src={image} alt="Behaviour Modification Therapy" className="w-full object-cover" />
          </div>
        </div>

        <div className="text-center mt-10">
          <h3 className="text-2xl font-bold text-[#001F3F] inline-block relative">
            Behaviour Modification Services
            <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
          </h3>
        </div>

        <div className="flex justify-center mt-8 px-4 pb-12">
          <div className="bg-gradient-to-r from-red-200 via-red-100 to-red-50 p-6 md:p-8 rounded-md max-w-4xl shadow-md text-[#001F3F] text-justify space-y-4 text-lg leading-relaxed">
            <p>
              <span className="inline-block mr-2 text-blue-500">➥</span>
              Behaviour Modification is provided to manage undesirable behaviours and to improve the frequency of desirable behaviour.
              In this therapy a triad is maintained among parents-child and therapist. Behaviour contract with mutual consent of child and parent is developed and it is monitored through regular phone calls. Parents are counselled about usage of techniques like application of consequences, reward based techniques and using consistent parenting skills.
            </p>
            <p>
              <span className="inline-block mr-2 text-blue-500">➥</span>
              Total solution Rehabilitation Society has expertise to implement behaviour modification therapy and success rate is commendable.
            </p>
          </div>
        </div>
      </div>
    );
  }
  