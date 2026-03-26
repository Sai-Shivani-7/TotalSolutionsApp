import React, { useState } from 'react';
import image1 from '../assets/ContactUs/contactus1.webp';

const LearningCenterCard = ({ title, location, address, phone }) => {
    const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    
    return (
        <div className="border border-red-900 p-6 flex flex-col items-center text-center h-full">
            <h2 className="text-red-700 text-xl font-medium mb-4">{title}</h2>

            <p className="text-gray-800 mb-6 flex-grow">
                <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-red-600 hover:underline"
                >
                    {address}
                </a>
            </p>

            <a
                href={`tel:${phone}`}
                className="text-red-600 border border-red-600 rounded-full px-6 py-2 inline-block hover:bg-red-50"
            >
                {phone}
            </a>
        </div>
    );
};

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: ''
    });
    
    const centers = [
        {
            title: "Total Solution Rehabilitation Society, Bowenpally",
            location: "Bowenpally",
            address: "Plot 9 SBI Colony, Manovikas Nagar, Old Bowenpally, Secunderabad 500009.",
            phone: "+91 88865 78697"
        },
        {
            title: "Total Solution Rehabilitation Society, Nacharam",
            location: "Nacharam",
            address: "7-38, Road no 1, Bapuji Nagar, Lane opposite to HDFC bank, Nacharam Road.",
            phone: "+91 90003 28697"
        },
        {
            title: "Total Solution Rehabilitation Society, Barkatpura",
            location: "Barkatpura",
            address: "3-4-495 / B, 1st Floor, YMCA, Near More Supermarket, Barkatpura, Hyderabad - 27.",
            phone: "+91 88864 78697"
        },
        {
            title: "Total Solution Rehabilitation Society, Neredmet",
            location: "Neredmet",
            address: "Plot no - A-16 H. No 37-72/6 J.J.Nagar, behind Sunflower hospital Neredmet X road.",
            phone: "+91 9866 983 096"
        },
        {
            title: "Total Solution Rehabilitation Society, Kukatpally",
            location: "Kukatpally",
            address: "Srinivasan Apts, Flat no. 502, Addagutta Society,Pragathi Nagar Road, Beside Narayana Junior College, Oppo. Road to JNTU, Hyderabad 500029",
            phone: "+91 90632 08697"
        },
        {
            title: "Total Solution Rehabilitation Society, Champapet",
            location: "Champapet",
            address: "H. No. 17-01-382/B/25, Bhanu Nagar, Road no 2, Beside lane Focus Hospital, Champapet, Hyderabad 500079.",
            phone: "+91 99493 08697"
        },
        {
            title: "Total Solution Rehabilitation Society, Suchitra",
            location: "Suchitra",
            address: "Plot No. 105, Block 'A' , Survey no. 91,92,93 Jeedimetla Vill, Lane beside Chennai Shopping Mall, Suchitra, Hyderabad .",
            phone: "+91 99594 18697"
        },
        {
            title: "Total Solution Rehabilitation Society, Banjara Hills",
            location: "Banjara Hills",
            address: "8-2-629, Road no.1, Near Pension Office, Mithila Nagar, Banjara Hills, Hyderabad 500034.",
            phone: "+91 99594 18697"
        },
        {
            title: "Total Solution Rehabilitation Society, Manikonda",
            location: "Manikonda",
            address: "Ground Floor, Phani Plaza, Secretariat Colony, Puppalaguda, Rajendranagar, Hyderabad 500089.",
            phone: "+91 89786 88697"
        },
        {
            title: "Special Education Center, Barkatpura",
            location: "Barkatpura",
            address: "3-4-495/B, 1st Floor, Near More Super market, Barkatpura, Hyderabad 500027.",
            phone: "+91 70754 88697"
        }
    ];
    
    const rows = [];
    for (let i = 0; i < centers.length; i += 3) {
        rows.push(centers.slice(i, i + 3));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Here you would typically send the form data to your backend
    };

    // Create Google Maps URL for the main address
    const mainAddressUrl = "https://maps.google.com/?q=" + encodeURIComponent("3-4-495/B, 1st Floor, YMCA, Near More Supermarket, Barkatpura, Hyderabad - 500027");

    return (
        <div>
            <div className="relative w-full overflow-hidden mx-auto">
                <div className="flex h-full">
                    <div className="min-w-full h-full flex items-center justify-center bg-black">
                        <img
                            src={image1}
                            alt="Contact Us"
                            className="w-full h-[80%] object-cover rounded-lg shadow-md"
                        />
                    </div>
                </div>
            </div>
            <section className="py-6 dark:text-gray-900">
                <h1 className="hidden text-4xl font-bold text-gray-900 md:block text-center mb-10">Contact Us</h1>
                <div className="grid max-w-6xl grid-cols-1 px-6 mx-auto lg:px-8 md:grid-cols-2 md:divide-x">
                    <div className="py-6 md:py-0 md:px-6">
                        <h1 className="text-4xl font-bold text-gray-900">Get in touch</h1>
                        <div className="space-y-4">
                            <p className="flex items-center pt-5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 sm:mr-6 text-red-600">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                </svg>
                                <a 
                                    href={mainAddressUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-red-600 hover:underline"
                                >
                                    3-4-495/B, 1st Floor, YMCA, Near More Supermarket, Barkatpura, Hyderabad - 500027
                                </a>
                            </p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 sm:mr-6 text-red-600">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                                </svg>
                                <a href="tel:+918886478697" className="hover:text-red-600 hover:underline">
                                    +91 88864 78697
                                </a>
                            </p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 sm:mr-6 text-red-600">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                                <a href="mailto:info@totalsolutionforlearning.com" className="hover:text-red-600 hover:underline">
                                    info@totalsolutionforlearning.com
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col py-6 space-y-6 md:py-0 md:px-6">
                        <form onSubmit={handleSubmit}>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder=" "
                                    className="block w-full px-3 pt-5 pb-2 rounded-md shadow-sm bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-red-600 peer"
                                    required
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                                >
                                    Full name
                                </label>
                            </div>



                            <div className="relative mb-6">
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder=" "
                                    className="block w-full px-3 pt-5 pb-2 rounded-md shadow-sm bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-red-600 peer"
                                    required
                                />
                                <label
                                    htmlFor="phone"
                                    className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                                >
                                    Contact Number
                                </label>
                            </div>

                            <div className="relative mb-6">
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder=" "
                                    rows="3"
                                    className="block w-full px-3 pt-5 pb-2 rounded-md bg-white border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-red-600 peer resize-none"
                                    required
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                                >
                                    Message
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="self-center px-8 py-3 text-lg rounded bg-red-600 text-white hover:bg-red-700 focus:ring focus:ring-opacity-75 focus:ring-red-600 transition-colors"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">Our Centers</h1>
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {row.map((center, centerIndex) => (
                            <div key={centerIndex} className="px-2">
                                <LearningCenterCard
                                    title={center.title}
                                    location={center.location}
                                    address={center.address}
                                    phone={center.phone}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}