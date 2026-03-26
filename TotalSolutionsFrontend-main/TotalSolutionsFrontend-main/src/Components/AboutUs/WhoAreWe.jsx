import React from "react";
import missionImage from "../../assets/WhoAreWe/who_we_are.webp";
import adhdMindMapImage from "../../assets/WhoAreWe/corevalues.webp";

const WhoWeAre = () => {
  return (
    <div className="font-sans">
      <div className="relative w-full h-96 overflow-hidden">
        <img
          src={missionImage}
          alt="Who We Are"
          className="object-cover w-full h-full"
        />
      </div>

      <section className="text-center py-12 px-4 md:px-16 bg-white">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">Who we are?</h2>
        <p className="text-gray-700 max-w-3xl mx-auto">
          A team of passionate and dedicated professionals who aims at providing holistic
          rehabilitation to a developing child and strengthening the family in the same process.
        </p>
      </section>

      <section className="bg-gray-200 py-12 px-4 md:px-16">
        <div className="flex flex-col md:flex-row justify-center gap-10">
          <div className="bg-white border border-red-400 shadow p-6 w-full md:w-1/2">
            <h3 className="text-center text-lg font-bold text-blue-900 mb-4">Mission</h3>
            <p className="text-sm text-gray-700">
              “Total Solution is an inclusive community of different professionals dedicated to innovations and
              excellence in rehabilitation services, research activities and training. Total solution supports all
              children with developmental difficulties and learning difficulties to achieve their maximum potential.”
            </p>
          </div>

          <div className="bg-white border border-red-400 shadow p-6 w-full md:w-1/2">
            <h3 className="text-center text-lg font-bold text-blue-900 mb-4">Vision</h3>
            <p className="text-sm text-gray-700">
              “Total Solution aspires to be one of the most distinguished learning centers with scientific research
              based rehabilitation services, excellent teaching and training institute aiming at a productive inclusive society.”
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 px-4 md:px-16">
        <div className="text-center">
          <img
            src={adhdMindMapImage}
            alt="Core Values"
            className="mx-auto w-full max-w-4xl object-contain"
          />
        </div>
      </section>
    </div>
  );
};

export default WhoWeAre;