import React from 'react';
import founderImg from '/src/assets/FounderMessages/Raghesh_Pooja.webp';
import message from '/src/assets/FounderMessages/founder_message.webp';

const FounderMessage = () => {
    return (
        <>
            <div className="relative w-full h-96 overflow-hidden">
                <img
                    src={message}
                    alt="Founder Message"
                    className="object-cover w-full h-full"
                />
            </div>

            <section className="flex flex-col items-center py-16 px-8 bg-white text-gray-800">
                <div className="text-center mb-8">
                    <h2 className="text-3xl text-[#002b5b] font-semibold">Founder Messages</h2>
                    <div className="w-16 h-1 bg-[#c9202d] mx-auto mt-2 rounded-sm" />
                </div>

                <div className="flex flex-wrap justify-center gap-8 max-w-[1100px] w-full">
                    <div className="text-center max-w-[400px] transition-transform duration-300">
                        <img 
                            src={founderImg} 
                            alt="Founders" 
                            className="w-full border-[6px] border-white shadow-lg rounded-xl scale-[0.97] transition-transform duration-400 hover:scale-[1.02]"
                        />
                        <p className="mt-4 font-bold text-[#002b5b]">Dr. Raghesh G Nair & Dr. Pooja Jha Nair</p>
                    </div>

                    <div className="flex-1 min-w-[280px] max-w-[600px] text-base leading-relaxed">
                        <p className="mb-4">
                            Welcome to the world of passionate and professional approach to manage learning issues of children
                            with developmental disorders. Total Solution is group of committed people who are chasing the dream
                            of providing learning opportunity to all children of our society. Come and join our journey, as we
                            all together can contribute to build our nation by making each child a productive citizen of our
                            country.
                        </p>
                        <p className="mb-4">
                        We are providing holistic services at nine different locations in Hyderabad – Bowenpally, Barkatpura, 
                        Kukatpally, Suchitra, Banjara Hills, Manikonda, Nacharam, Neredmet and Champapet, with a total of 9 branches 
                        and 1 special education center. A model of intervention programs has been implemented at each premise to maintain 
                        the quality of services.
                        </p>
                        <div className="mt-6 text-gray-600">
                            <p>Dr. Pooja Jha Nair & Dr. Raghesh G Nair</p>
                            <p>Founder partners</p>
                            <p>Total Solution</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FounderMessage;