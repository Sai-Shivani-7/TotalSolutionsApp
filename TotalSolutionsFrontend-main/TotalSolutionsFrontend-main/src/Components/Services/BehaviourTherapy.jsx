import React from 'react';

import image from '../../assets/Services/BehaviourTherapy/Behaviour.webp';
import image1 from '../../assets/Services/BehaviourTherapy/social.webp';
import image2 from '../../assets/Services/BehaviourTherapy/lifeskills.webp';
import image3 from '../../assets/Services/BehaviourTherapy/selfhelp.webp';
import image4 from '../../assets/Services/BehaviourTherapy/conceptslearning.webp';
import image5 from '../../assets/Services/BehaviourTherapy/socialstory.webp';
import image6 from '../../assets/Services/BehaviourTherapy/mindskill.webp';
import image7 from '../../assets/Services/BehaviourTherapy/grouptherapyl.webp';
import image8 from '../../assets/Services/BehaviourTherapy/parentaltraining.webp';

import bt from '../../assets/Services/BehaviourTherapy/BT.webp';

const cardData = [
  { image: image1, text: 'Social Skills Training' },
  { image: image2, text: 'Life training skills' },
  { image: image3, text: 'Self Help Skill training' },
  { image: image4, text: 'Concepts learning through behaviour approach' },
  { image: image5, text: 'Social stories methods to develop experiences for children with special needs' },
  { image: image6, text: 'Theory of Mind skills training' },
  { image: image7, text: 'Group therapy for better generalization' },
  { image: image8, text: 'Parental training during therapy sessions.' },
];

export default function BehaviourTherapy() {
  return (
    <div className="font-sans text-[#001F3F]">
      <div className="w-full">
        <img src={image} alt="Behaviour Therapy" className="w-full object-cover" />
      </div>

      <div className="text-center mt-10">
        <h3 className="text-2xl font-bold text-[#001F3F] inline-block relative">
          Behaviour Therapy Services
          <span className="block w-24 h-1 bg-red-500 mx-auto mt-1"></span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 px-4 max-w-4xl mx-auto pb-16">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="flex items-center bg-gradient-to-br from-red-200 via-red-100 to-red-50 shadow-md p-6 rounded-md"
          >
            <img src={card.image} alt={card.text} className="w-10 h-10 mr-4" />
            <span className="text-md text-[#001F3F] font-semibold">{card.text}</span>
          </div>
        ))}
      </div>
      <section className="flex justify-center mt-4 px-4 pb-12">
        <div className=" p-6 md:p-8 rounded-md max-w-5xl text-[#001F3F] text-justify space-y-4 text-lg leading-relaxed">
          <p>
            We provide behavior therapy on principals of A-B-C (Antecedent-Behavior-Consequence) analysis. We incorporate different approaches and focus on systematic intervention style. Following is our plan of action for ASD:
          </p>
        </div>
      </section>
      <section className="flex justify-center mt-4 px-4 pb-12">
        <div className="p-6 md:p-8 rounded-md max-w-6xl text-[#001F3F] text-justify space-y-4 text-lg leading-relaxed">
          <img src={bt} alt="Behaviour Therapy" className="w-full object-cover mt-4" />
        </div>
      </section>
    </div>
  );
}
