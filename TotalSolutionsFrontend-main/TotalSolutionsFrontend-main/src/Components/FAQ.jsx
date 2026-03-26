import React, { useState } from 'react';
import image from '../assets/FAQ/branches.webp';
const faqs = [
    {
        question: "What kind of therapies we provide?",
        answer: "Link of therapies.",
    },
    {
        question: "Do you handle Slow learners?",
        answer: "Yes.",
    },
    {
        question: "Do you deal with handwriting?",
        answer: "We provide handwriting program to improve formation of letters, legibility of writing, speech of writing and organization of handwriting on paper.",
    },
    {
        question: "Do we handle behavior issues?",
        answer: "Yes.",
    },
    {
        question: "Do you handle Intellectually disability?",
        answer: "Only mild Intellectual disability to manage their learning problems and to improve their cognition.",
    },
    {
        question: "How to identify child has some issue?",
        answer: "Observe for gaps between child’s age and his existing behaviors or learning skills. if more than 3 signs of large gaps visible across different situations, take professional help to diagnose and intervene. Example age inappropriate development, poor learning when compared to peer group, difficulty to pay attention to given academic tasks specifically in group, poor recall of academic content, poor relationships with peer group etc.",
    },
    {
        question: "Do I have to take appointment before visiting the clinic?",
        answer: "Yes, Appointment is needed.",
    },
    {
        question: "What is the follow up consultation fee and follow up duration?",
        answer: "The Consultation fees is …….rs for follow up and the duration for the follow up depends on the Treatment.",
    },
    {
        question: "Is clinic accessible by wheelchair?",
        answer: "No, the clinic is on first floor.",
    },
    {
        question: "Who do we need to meet if we want to take consultations?",
        answer: (
            <div className="space-y-2 text-sm md:text-base">
                <p>
                    Dr. Pooja Jha Nair or Mr. Raghesh G Nair (For appointment Mr. Sridhar 8886008697), in absence of Dr. Pooja or Mr. Raghesh consult Center Heads:
                </p>
                <ul className="list-none space-y-1 pl-2">
                    <li><span className='text-blue-500'>➤</span> <strong>Bowenpally</strong> – Mrs. Suma Singh – 9346 422 873</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Kukatpally</strong> – Mrs. PadmaSri – 8886 778 697</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Banjara Hills</strong> – Mrs. Sophia Pirani – 9849 053 404</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Nacharam</strong> – Mrs. Gomati – 9866 983 096</li>
                    <li><span className='text-blue-500'>➤</span> <strong>A S Rao Nagar</strong> – Mrs. Gomati – 9866 983 096</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Barakatpura</strong> – Ms. Sirisha – 9652 483 265</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Manikonda</strong> – Mrs. Sophia Pirani – 9849 053 404</li>
                    <li><span className='text-blue-500'>➤</span> <strong>Champapet</strong> – Mr. Akram – 9949 477 055</li>
                </ul>
            </div>
        ),
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="px-4 py-10  mx-auto font-sans">
            <div className="w-full">
                    <img src={image} alt="Branches" className="w-full object-cover" />
                  </div>
            <h2 className="text-center text-2xl font-bold text-[#001F3F] mb-8 mt-4">
                Frequently Asked Questions
                <div className="w-24 h-1 bg-red-500 mx-auto mt-2"></div>
            </h2>

            <div className="space-y-4 max-w-4xl justify-center mx-auto">
                {faqs.map((faq, index) => (
                    <div key={index} className="border rounded bg-white shadow-sm">
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full text-left px-4 py-3 flex justify-between items-center text-[#001F3F] font-medium"
                        >
                            <span>{faq.question}</span>
                            <span className="text-xl">
                                {openIndex === index ? '−' : '+'}
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="px-4 pb-4 text-gray-700">{faq.answer}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
