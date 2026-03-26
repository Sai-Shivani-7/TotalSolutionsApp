import React from 'react';
import servicesmain from '/src/assets/Services/services/servicesmain.webp';
import assessmentImg from '/src/assets/Services/services/assessment.webp';
import occupationalImg from '/src/assets/Services/services/occupational.webp';
import behaviourImg from '/src/assets/Services/services/behaviour.webp';
import remedialImg from '/src/assets/Services/services/remedial.webp';
import modificationImg from '/src/assets/Services/services/modification.webp';
import speechImg from '/src/assets/Services/services/speech.webp';
import { Helmet } from "react-helmet";

const services = [
    { name: "Assessment & Evaluation", image: assessmentImg, color: "#00b2e1" },
    { name: "Occupational Therapy", image: occupationalImg, color: "#ed1c24" },
    { name: "Behaviour Therapy", image: behaviourImg, color: "#8bc53f" },
    { name: "Remedial Therapy", image: remedialImg, color: "#fcee21" },
    { name: "Behaviour Modification", image: modificationImg, color: "#92278f" },
    { name: "Speech Therapy", image: speechImg, color: "#f7931e" },
];

const Services = () => {
    return (
        <>
            <Helmet>
                <title>Our Services | Total Solution for Learning</title>
                <meta
                    name="description"
                    content="Explore therapy and rehabilitation services at Total Solution Rehabilitation Society for Learning in Hyderabad — including speech therapy, occupational therapy, remedial education, and behavioral support."
                />
                <meta name="keywords" content="therapy services Hyderabad, speech therapy, occupational therapy, remedial education, autism support, ADHD therapy, developmental disorders" />
                <link rel="canonical" href="https://totalsolutionforlearning.org/services" />

                <script type="application/ld+json">
                    {`
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Therapy and Rehabilitation",
      "provider": {
        "@type": "MedicalClinic",
        "name": "Total Solution for Learning",
        "url": "https://totalsolutionforlearning.org"
      },
      "areaServed": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Hyderabad",
          "addressCountry": "IN"
        }
      },
      "url": "https://totalsolutionforlearning.org/services",
      "description": "Therapy and rehabilitation services including speech, occupational, remedial education, and behavior therapy for children with developmental needs."
    }
    `}
                </script>
            </Helmet>

            <div className="font-sans">
                <div className="relative w-full h-96 overflow-hidden">
                    <img
                        src={servicesmain}
                        alt="Header ADHD Mindmap"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>
            
            <section className="py-8 px-4 sm:px-6 bg-white text-gray-800 font-sans text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0e2b5c] mb-4">
                    Services
                    <div className="h-1 w-16 bg-[#0e2b5c] mx-auto mt-2"></div>
                </h2>

                <p className="max-w-4xl mx-auto mb-8 text-justify leading-relaxed text-base">
                    The organization was providing service to children and schools and certain NGOs in an informal way.
                    By the end of 2008, we started promoting the organization as a brand with integrated services, training,
                    therapeutics and advocacy as the main theme. Total Solution Rehabilitation Society currently provides solutions through its
                    associate centers across Hyderabad, as given below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8 px-2 sm:px-4">
                    {services.map((service, index) => (
                        <div 
                            className="rounded-lg text-white shadow-md overflow-hidden text-center"
                            key={index} 
                            style={{ backgroundColor: service.color }}
                        >
                            <img src={service.image} alt={service.name} className="w-full h-auto block" />
                            <h3 className="p-3 m-0 text-lg font-medium">{service.name}</h3>
                        </div>
                    ))}
                </div>

                <p className="max-w-4xl mx-auto text-justify leading-relaxed text-base">
                    Apart from these divisions, Total Solution Rehabilitation Society provides consultations, assessments and evaluations and
                    home based therapy programs. In order to keep up with the changing times, we conduct 'Continuing
                    Learning Education' programs to update already trained personnel.
                    <br /><br />
                    As the saying goes, 'A journey of thousand miles starts with a single step'. We have started the first
                    step and we realize that there are miles to go. We are a learning organization and believe in catering
                    to the emerging needs of the field from time to time.
                </p>
            </section>
        </>
    );
};

export default Services;