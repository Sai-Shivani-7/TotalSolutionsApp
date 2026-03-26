import React, { useState } from 'react';
import image1 from '../assets/Branches/Branches.webp';

const LearningCenterBanner = ({ title, location, address, contactPerson, phone, isLeftAligned, isAlternate }) => {
    return (
      <div className={`w-full py-12 ${isAlternate ? 'bg-gray-100' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className={`flex flex-col ${isLeftAligned ? 'items-start text-left' : 'items-end text-right'}`}>
            <h2 className="text-red-700 text-2xl font-bold mb-4">
              {title} <span className="text-gray-600">({location})</span>
            </h2>
            
            <p className="text-gray-700 mb-3 max-w-2xl">
              {address}
            </p>
        
            
            <a 
              href={`tel:${phone}`} 
              className="text-red-600 border border-red-600 rounded-full px-8 py-2 inline-block hover:bg-red-50 transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
    );
  };

  const centers = [
    {
      title: "Total Solution Rehabilitation Society",
      location: "Bowenpally",
      address: "Plot 9 SBI Colony, Manovikas Nagar, Old Bowenpally, Secunderabad 500009.",
      //contactPerson: "Suma Singh",
      phone: "+91 88865 78697"
    },
    {
      title: "Total Solution Rehabilitation Society",
      location: "Barkatpura",
      address: "3-4-495 / B, 1st Floor, YMCA, Near More Supermarket, Barkatpura, Hyderabad 500027.",
      // contactPerson: "Sridhar",
      phone: "+91 88864 78697"
  },
  {
    title: "Total Solution Rehabilitation Society",
    location: "Kukatpally",
    address: "Srinivasan Apts, Flat no. 502, Addagutta Society, Pragathi Nagar Road, Beside Narayana Junior College, Oppo. Road to JNTU, Hyderabad 500072.",
    // contactPerson: "Padmashree",
    phone: "+91 90632 08697"
  },
  {
    title: "Total Solution Rehabilitation Society",
    location: "Suchitra",
    address: "Plot No. 105, Block 'A' , Survey no. 91,92,93 Jeedimetla Vill, Lane beside Chennai Shopping Mall, Suchitra, Hyderabad.",
    // contactPerson: "Shalini Reddy",
    phone: "+91 99594 18697"
  },
  {
    title: "Total Solution Rehabilitation Society",
    location: "Banjara Hills",
    address: "8-2-629, Road no.1, Near Pension Office, Mithila Nagar, Banjara Hills, Hyderabad 500034.",
    // contactPerson: "Shalini Reddy",
    phone: "+91 87905 88697"
  },
  {
    title: "Total Solution Rehabilitation Society",
    location: "Manikonda",
    address: "Ground Floor, Phani Plaza, Secretariat Colony,Puppalaguda, Rajendranagar, Hyderabad 500089.",
    // contactPerson: "Shalini Reddy",
    phone: "+91 89786 88697"
  },
    {
      title: "Total Solution Rehabilitation Society",
      location: "Nacharam",
      address: "7-38, Road no 1, Bapuji Nagar, Lane opposite to HDFC bank, Nacharam Road, Secunderabad 500076.",
      // contactPerson: "Gomathi Sharma | Neeta Vincent",
      phone: "+91 90003 28697"
  },
{
  title: "Total Solution Rehabilitation Society",
  location: "Neredmet",
  address: "35-67/1, GK Colony, Beside Delhi Mithaiwala Sainikpuri, Neredmet, Secunderabad 500094",
  // contactPerson: "Gomathi Sharma",
  phone: "+91 90003 48697"
},

{
  title: "Total Solutiion Rehabilitation Society",
  location: "Champapet",
  address: "H. No. 17-01-382/B/25, Bhanu Nagar, Road no 2, Beside lane Focus Hospital, Champapet, Hyderabad 500079.",
  // contactPerson: "Sophia Pirani",
  phone: "+91 99493 08697"
},
{
  title: "Special Education Center",
  location: "Barkatpura",
  address: "3-4-495/B, 1st Floor, Near More Super market Barkatpura, Hyderabad 500027.",
  // contactPerson: "Shalini Reddy",
  phone: "+91 70754 88697"
}
  ];

export default function OurBranches() {
   
    return (
        <div>
            <div className="relative w-full overflow-hidden mx-auto">
                <div className="flex h-full">
                    <div className="min-w-full h-full flex items-center justify-center bg-black">
                        <img
                            src={image1}
                            alt={`Image`}
                            className="w-full h-[80%] object-cover rounded-lg shadow-md"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full">
      {centers.map((center, index) => (
        <LearningCenterBanner
          key={index}
          title={center.title}
          location={center.location}
          address={center.address}
          contactPerson={center.contactPerson}
          phone={center.phone}
          isLeftAligned={index % 2 !== 0}
          isAlternate={index % 2 !== 0}
        />
      ))}
    </div>
            
        </div>
    );
}