import React from 'react';
import whoweare from '/src/assets/WhoAreWe/who_we_are.webp';
import gayathriImg from '/src/assets/research/gayathri.webp';
import mridhula from '/src/assets/research/mridulajha.webp';
import raichal from '/src/assets/research/raichal.webp';

const team = [
    {
        name: 'Mrs. GVN Gayathri',
        title: 'Research Head',
        image: gayathriImg,
    },
    {
        name: 'Ms. Khersingh Komal',
        title: 'Research Assistant',
        image: mridhula,
    },
    {
        name: 'Mrs. Ashwathy R',
        title: 'Research Assistant',
        image: raichal,
    },
];

const ResearchDepartment = () => {
    return (
        <>
            <div className="font-sans">
                <div className="relative w-full h-96 overflow-hidden">
                    <img
                        src={whoweare}
                        alt="Header ADHD Mindmap"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>
            <section className="py-8 px-4 sm:px-6 text-center bg-white text-gray-800 font-sans">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0e2b5c] mb-4 relative">
                    Research Department
                    <div className="h-1 w-20 bg-[#0e2b5c] mx-auto mt-2"></div>
                </h2>

                <div className="max-w-4xl mx-auto mb-8 text-left leading-relaxed">
                    <p className="mb-4">
                        Total solution is committed to practice scientific research-based practices. In order to scientifically test our own developed strategies and to statistically validate our own findings, we have a research wing. At present, the following research projects are in progress:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>1. Cognitive profile of children with Specific Learning Disorder</li>
                        <li>2. Impact of Math Module on curriculum-based math performance</li>
                        <li>3. Impact of parental involvement in behaviour therapy on overall development of children with ASD.</li>
                    </ol>
                </div>

                <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                    {team.map((member, index) => (
                        <div className="w-48 sm:w-56 text-center bg-gray-50 rounded-lg p-4 shadow-md" key={index}>
                            <img 
                                src={member.image} 
                                alt={member.name} 
                                className="w-full h-auto rounded-lg"
                            />
                            <h3 className="text-lg sm:text-xl font-medium mt-2 mb-1">{member.name}</h3>
                            <p className="text-sm sm:text-base text-[#800000]">({member.title})</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default ResearchDepartment;