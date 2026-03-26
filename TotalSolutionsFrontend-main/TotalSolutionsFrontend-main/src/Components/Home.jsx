import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import image1 from "../assets/Images TAD/Slider/home_main.webp";
import image2 from "../assets/Images TAD/Slider/1.webp";
import image3 from "../assets/Images TAD/Slider/01.webp";
import image4 from "../assets/Images TAD/Slider/3.webp";
import image5 from "../assets/Images TAD/Slider/4.webp";
import image6 from "../assets/Images TAD/Slider/rt.webp";

import Therapy1 from "../assets/Therapies/1.webp";
import Therapy2 from "../assets/Therapies/2.webp";
import Therapy3 from "../assets/Therapies/3.webp";
import Therapy4 from "../assets/Therapies/4.webp";
import Therapy5 from "../assets/Therapies/5.webp";
import Therapy6 from "../assets/Therapies/6.webp";

import Assessment1 from "../assets/Assessment/1.webp";
import Assessment2 from "../assets/Assessment/2.webp";
import Assessment3 from "../assets/Assessment/3.webp";
import Assessment4 from "../assets/Assessment/4.webp";
import Assessment5 from "../assets/Assessment/5.webp";
import Assessment6 from "../assets/Assessment/6.webp";
import Assessment7 from "../assets/Assessment/7.webp";
import Assessment8 from "../assets/Assessment/8.webp";
import Assessment9 from "../assets/Assessment/9.webp";

import Treatment1 from "../assets/Treatment/1.webp";
import Treatment2 from "../assets/Treatment/2.webp";
import Treatment3 from "../assets/Treatment/3.webp";
import Treatment4 from "../assets/Treatment/4.webp";
import Treatment5 from "../assets/Treatment/5.webp";
import Treatment6 from "../assets/Treatment/6.webp";
import Treatment7 from "../assets/Treatment/7.webp";
import Treatment8 from "../assets/Treatment/8.webp";
import Treatment9 from "../assets/Treatment/9.webp";
import Treatment10 from "../assets/Treatment/10.webp";
import Treatment11 from "../assets/Treatment/11.webp";
import Treatment12 from "../assets/Treatment/12.webp";
import Treatment13 from "../assets/Treatment/13.webp";

import { Helmet } from "react-helmet";
import ts from "../assets/totalsolutions.webp";

const branches = [
  {
    image: Assessment1,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Bowenpally",
    //contact: "Suma Singh",
    phone: "+91 88865 78697  ",
    color: "bg-cyan-500",
    imageAlt: "Total Solution Rehabilitation Society Bowenpally",
  },
  {
    image: Assessment2,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Barkatpura",
    //contact: "Sridhar",
    phone: "+91 88864 78697 ",
    color: "bg-red-500",
    imageAlt: "Total Solution Rehabilitation Society Barkatpura",
  },
  {
    image: Assessment3,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Kukatpally",
    //contact: "Padmashri",
    phone: "+91 90632 08697 ",
    color: "bg-lime-500",
    imageAlt: "Total Solution Rehabilitation Society Kukatpally",
  },
  {
    image: Assessment4,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Suchitra",
    //contact: "Sophia Pirani",
    phone: "+91 99594 18697 ",
    color: "bg-yellow-400",
    imageAlt: "Total Solution Rehabilitation Society Suchitra",
  },
  {
    image: Assessment5,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Banjara Hills",
    //contact: "Akram",
    phone: "+91 87905 88697",
    color: "bg-fuchsia-500",
    imageAlt: "Total Solution Rehabilitation Society Banjara Hills",
  },
  {
    image: Assessment6,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Manikonda",
    //contact: "Gomathi Sharma",
    phone: "+91 89786 88697",
    color: "bg-orange-400",
    imageAlt: "Total Solution Rehabilitation Society Manikonda",
  },
  {
    image: Assessment7,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Nacharam",
    //contact: "Gomathi Sharma",
    phone: "+91 90003 28697 ",
    color: "bg-orange-400",
    imageAlt: "Total Solution Rehabilitation Society Nacharam",
  },
  {
    image: Assessment8,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Neredmet",
    //contact: "Gomathi Sharma",
    phone: "+91 90003 48697",
    color: "bg-orange-400",
    imageAlt: "Total Solution Rehabilitation Society Neredmet",
  },
  {
    image: Assessment9,
    name: "TOTAL SOLUTION REHABILITATION SOCIETY",
    location: "Champapet",
    //contact: "Gomathi Sharma",
    phone: "+91 99493 08697",
    color: "bg-orange-400",
    imageAlt: "Total Solution Rehabilitation Society Champapet",
  },
  {
    image: Assessment2,
    name: "SPECIAL EDUCATION CENTER",
    location: "Barkatpura",
    //contact: "Gomathi Sharma",
    phone: "+91 70754 88697",
    color: "bg-orange-400",
    imageAlt: "Total Solution Special Education Center Barkatpura",
  },
];

const therapies = [
  {
    name: "Assessment & Evaluation",
    image: Therapy1,
    path: "/services/assessment-evaluation",
  },
  {
    name: "Occupational Therapy",
    image: Therapy2,
    path: "/services/occupational-therapy",
  },
  {
    name: "Behaviour Therapy",
    image: Therapy3,
    path: "/services/behaviour-therapy",
  },
  {
    name: "Remedial Therapy",
    image: Therapy4,
    path: "/services/remedial-therapy",
  },
  {
    name: "Behaviour Modification",
    image: Therapy5,
    path: "/services/behaviour-modification",
  },
  { name: "Speech Therapy", image: Therapy6, path: "/services/speech-therapy" },
];

// const items = [image1, image2, image3, image4, image5, image6];

const items = [
  {
    src: image1,
    alt: "Total Solution Rehabilitation Center - Image 1",
  },
  {
    src: image2,
    alt: "Total Solution Rehabilitation Center - Image 2",
  },
  {
    src: image3,
    alt: "Total Solution Rehabilitation Center - Image 3",
  },
  {
    src: image4,
    alt: "Total Solution Rehabilitation Center - Image 4",
  },
  {
    src: image5,
    alt: "Total Solution Rehabilitation Center - Image 5",
  },
  {
    src: image6,
    alt: "Total Solution Rehabilitation Center - Image 6",
  }
]
const images = [
  Treatment1, Treatment2, Treatment3, Treatment4, Treatment5, Treatment6, Treatment7, Treatment8, Treatment9, Treatment10, Treatment11, Treatment12, Treatment13,
];

export default function Home() {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [current, setCurrent] = useState(0);
  const visibleImages = 3;

  const handleCarousel = (direction) => {
    const totalItems = items.length;
    let newIndex =
      direction === "next"
        ? (currentIndex + 1) % totalItems
        : (currentIndex - 1 + totalItems) % totalItems;

    setCurrentIndex(newIndex);
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  const nextSlide = () => {
    if (current < images.length - visibleImages) {
      setCurrent(current + 1);
    }
  };

  const prevSlide = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Total Solution for Learning | Rehabilitation, Therapy & Support</title>
        <meta
          name="description"
          content="Total Solution for Learning provides comprehensive rehabilitation services and learning support for children with autism, ADHD, learning difficulties & developmental disorders in Hyderabad."
        />
        <meta
          name="keywords"
          content="total solution, total solution for learning, total solution rehabilitation society, totalsolution4learning, development disorders, emotional difficulties, rehabilitation center Hyderabad, autism therapy, ADHD treatment, learning difficulties, special education, speech therapy, occupational therapy"
        />
        <meta name="author" content="Total Solution" />
        <meta property="og:title" content="Total Solution Rehabilitation society" />
        <meta property="og:description" content="Helping children with learning and developmental difficulties through expert therapy and professional care." />
        <meta property="og:image" content={ts} alt="Total Solution for Learning" />
        <meta property="og:url" content="https://totalsolutionforlearning.org" />
        <link rel="canonical" href="https://totalsolutionforlearning.org" />

        <link rel="preload" as="image" fetchPriority="high" href={items[0]?.src} type="image/webp" />

        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalClinic",
              "name": "Total Solution for Learning",
              "url": "https://totalsolutionforlearning.org",
              "description": "Total Solution for Learning is a leading therapy and rehabilitation center in Hyderabad, specializing in autism, ADHD, dyslexia, and other developmental disorders.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Hyderabad",
                "addressCountry": "IN"
              },
              "medicalSpecialty": [
                "AssessmentEvaluation",
                "BehaviourModification",
                "BehaviourTherapy",
                "SpeechTherapy",
                "OccupationalTherapy",
                "RemedialTherapy"
              ]
            }),
          }}
        >
        </script>

        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="relative w-full  overflow-hidden mx-auto">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          ref={carouselRef}
        >
          {items.map((item, index) => (
            <div key={index} className="min-w-full h-full flex items-center justify-center bg-black">
              <picture>
                <source srcSet={item.src} type="image/webp" />
                <img
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={800}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  className="w-full h-[80%] object-cover rounded-lg shadow-md"
                />
              </picture>
            </div>
          ))}
        </div>

        <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-6">
          <button
            onClick={() => handleCarousel("prev")}
            className="bg-white/80 hover:bg-white text-black font-semibold py-2 px-4 rounded-full shadow"
          >
            Previous
          </button>
          <button
            onClick={() => handleCarousel("next")}
            className="bg-white/80 hover:bg-white text-black font-semibold py-2 px-4 rounded-full shadow"
          >
            Next
          </button>
        </div>
      </div>

      <div className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 px-4">
            {therapies.map((therapy, idx) => (
              <div key={idx} className="relative w-full aspect-square max-w-[180px] mx-auto">
                <Link to={therapy.path} className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 z-10 bg-[#ab1c1c] rounded-full">
                  <span className="text-white text-sm md:text-base font-semibold text-center px-2">
                    {therapy.name}
                  </span>
                </Link>
                <picture>
                  <source srcSet={therapy.image} type="image/webp" />
                  <img
                    src={therapy.image}
                    alt={`${therapy.name} therapy`}
                    width={180}
                    height={180}
                    loading="lazy"
                    decoding="async"
                    className="relative w-full h-full flex items-center justify-center bg-[#ab1c1c] rounded-full transition-opacity duration-300 hover:opacity-0"
                  />
                </picture>
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="bg-white px-4 md:px-16 py-12 text-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-900">
          Welcome to Total Solution Rehabilitation Society
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-2 mb-8"></div>

        <p className="max-w-6xl mx-auto text-lg text-justify">
          We are a provider of rehabilitation services for children with
          Developmental Disorders, Learning Difficulties and Emotional
          Difficulties. With over 15 years of experience in providing a flexible
          and varied range of services, including life skills training, packages
          for out of station clients, home based programs, and school based
          rehabilitation. The people we support may have a range of needs that
          require intensive support, including:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-6 max-w-6xl mx-auto">
          {[
            "Autism Spectrum Disorder (ASD).",
            "Sensory processing difficulties.",
            "Epilepsy.",
            "Learning Disorders (SLD).",
            "Attention Deficit Disorder (ADD).",
            "Attention Deficit Hyperactive Disorder (ADHD).",
            "Children with Behavioural challenges and emotional difficulties.",
            "School Rejection",
            "Phobia",
          ].map((item, i) => (
            <div key={i} className="flex items-start space-x-2">
              <span className="text-blue-600">➜</span>
              <p>{item}</p>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-8 space-y-6 text-lg text-justify">
          <p>
            We have succeeded in supporting children to live independently with
            their own assured tenancies when previously they were in secure
            accommodation. We aim to support each individual to integrate fully
            into their local community and live the life of their choice. This
            is based on a culture of person centered planning and, where
            appropriate, the use of assistive technology to help people become
            more independent.
          </p>

          <p>
            Total solution Rehabilitation Society has policies in place to ensure all children have
            equal opportunity to achieve their educational goals. The primary
            aim of Total solution Rehabilitation Society is to provide confidential support for
            children identified with Learning Difficulties in, Attention Deficit
            Hyperactivity Disorder (ADHD) or Autism Spectrum Disorder (ASD), in
            order to facilitate their academic, personal and career goals.
          </p>
          <p>
            Special Education Centre (SEC) is an initiative by Total Solution Rehabilitation Society
            (TSRS) for rehabilitation of children with special needs in 2018. It was started at
            Barkatpura as a need to give special education services to children who were not
            able to gain admission or adjust in a regular school.
            As on day, the SEC has 25 children with autism spectrum disorder, cerebral palsy,
            cognitive impairment, down’s syndrome, visual impairment and multiple disabilities too.
          </p>
        </div>
      </section>
      <section className="bg-gray-200 py-12 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-blue-900">
          Our Branches and Services
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto my-2"></div>

        <div className="max-w-6xl mx-auto px-4 mt-10">
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {branches.map((branch, idx) => (
              <div
                key={idx}
                className={`rounded shadow-lg overflow-hidden bg-white`}
              >
                <div className={`${branch.color} p-1`}>
                  <picture>
                    <source srcSet={branch.image} type="image/webp" />
                    <img
                      src={branch.image}
                      alt={`${branch.name} location in ${branch.location}`}
                      width={400}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {branch.name}
                  </h3>
                  <p className="text-gray-600 mb-2 text-xl">{branch.location}</p>
                  <p className="text-red-700 text-sm font-medium">
                    Contact Number : {branch.contact}
                  </p>
                  <p className="text-gray-800 font-semibold">{branch.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-10">
        <h2 className="text-2xl font-bold text-center text-blue-900">
          Treatment
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto my-2"></div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${current * (100 / visibleImages)}%)`,
              }}
            >
              {images.map((src, idx) => (
                <picture key={idx}>
                  <source srcSet={src} type="image/webp" />
                  <img
                    src={src}
                    alt={`Treatment method ${idx + 1}`}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full sm:w-1/2 md:w-1/3 flex-shrink-0 object-cover p-2"
                  />
                </picture>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
            <button
              onClick={prevSlide}
              className="bg-white border rounded-full p-2 shadow hover:bg-gray-100"
              disabled={current === 0}
            >
              ◀
            </button>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
            <button
              onClick={nextSlide}
              className="bg-white border rounded-full p-2 shadow hover:bg-gray-100"
              disabled={current >= images.length - visibleImages}
            >
              ▶
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}