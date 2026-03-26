import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaLinkedinIn,
    FaTwitter,
    FaWhatsapp,
    FaTelegramPlane
} from 'react-icons/fa';

const quickLinks = [
    { label: "Who we are?", path: "/aboutus/whoarewe" },
    { label: "Why Us", path: "/whyus" },
    { label: "FAQ", path: "/faq" },
    { label: "Founder Messages", path: "/aboutus/foundermessages" },
    { label: "Our Goals", path: "/goals" },
    { label: "Research Department", path: "/research" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
];

const usefulLinks = [
    { label: "Services", path: "/services" },
    { label: "Assessment & Evaluation", path: "/services/assessment-evaluation" },
    { label: "Occupational Therapy", path: "/services/occupational-therapy" },
    { label: "Behaviour Therapy", path: "/services/behaviour-therapy" },
    { label: "Remedial Therapy", path: "/services/remedial-therapy" },
    { label: "Behaviour Modification", path: "/services/behaviour-modification" },
    { label: "Speech Therapy", path: "/services/speech-therapy" },
];

const socials = [
    { label: "Facebook", path: "https://www.facebook.com/TotalSolution4Learning", icon: <FaFacebookF /> },
    { label: "Instagram", path: "https://www.instagram.com/totalsolutionrehabsociety/", icon: <FaInstagram /> },
    { label: "YouTube", path: "https://www.youtube.com/@Totalsolutionrehabsociety", icon: <FaYoutube /> },
    { label: "WhatsApp", path: "https://wa.me/918886008697", icon: <FaWhatsapp /> },
];

export default function Footer() {
    return (
        <footer className="bg-[#1c0c0c] text-white pt-10 pb-4">
           
            
            <div className="max-w-7xl mx-auto px-2 grid md:grid-cols-4 gap-8 text-sm">
                <div>
                    <h3 className="text-yellow-400 text-lg font-bold mb-4">Contact Details</h3>
                    <p className="mb-2">📍 <a href="https://maps.app.goo.gl/WFpmGMazooskNKZY8" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">3-4-495/B, 1st Floor, YMCA, Near More Supermarket,<br /> Barkatpura, Hyderabad - 500027</a></p>
                    <p className="mb-2">📱 +91 88860 08697</p>
                    <p className="mb-4">✉️ <a href="mailto:info@totalsolutionforlearning.com" className="text-blue-400 hover:underline">info@totalsolutionforlearning.com</a></p>
                    <Link to="/contact" className="text-white hover:text-blue-400" ><span className="text-blue-400">➜ </span>Contact Us</Link>
                    <div className="flex flex-wrap gap-4 mt-4">
                        {socials.map((item, i) => (
                            <a href={item.path} key={i} aria-label={item.label} className="text-white hover:text-blue-400 text-lg" target="_blank" rel="noopener noreferrer">
                                {item.icon}
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-yellow-400 text-lg font-bold mb-4">Quick Links  </h3>
                    <ul className="space-y-2">
                        {quickLinks.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 border-dotted border-b border-white/30 pb-1">
                                <span className="text-blue-400">➜</span> <Link to={item.path} className="hover:underline">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-yellow-400 text-lg font-bold mb-4">Useful Links</h3>
                    <ul className="space-y-2">
                        {usefulLinks.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 border-dotted border-b border-white/30 pb-1">
                                <span className="text-blue-400">➜</span> <Link to={item.path} className="hover:underline">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-yellow-400 text-lg font-bold mb-4">Careers</h3>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <p className="font-medium">Send your resume to:</p>
                            <a 
                                href="mailto:humanresource@tsrs.in?subject=Career Opportunity - Resume Submission&body=Dear HR Team,%0D%0A%0D%0AI am interested in career opportunities at Total Solution Rehabilitation Society. Please find my resume attached.%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ABest regards,"
                                className="text-blue-400 hover:underline block"
                            >
                                <span className="text-blue-400">➜</span> humanresource@tsrs.in
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm mt-10 border-t border-white/10 pt-4">
                <p>
                    Copyright ©2023 All rights reserved | Maintained by <span className="text-blue-400 hover:underline">Total Solution Rehabilitation Society</span>
                </p>
            </div>
        </footer>
    );
}
