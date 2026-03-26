import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function AppointmentModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    if (!isOpen) return null;
    const handleCloseModal = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
        if (e.target.name === "register") {
            navigate("/register");
        } else if (e.target.name === "login") {
            navigate("/login");
        }   

    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-6">
                    <button 
                        to="/register"
                        name="register"
                        className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300 shadow-md"
                        onClick={handleCloseModal}
                    >
                        Register
                    </button>
                    <button 
                        to="/login"
                        name="login"
                        className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300 shadow-md"
                        onClick={handleCloseModal}
                    >
                        Login
                    </button>
                     

                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                <div className="p-2 mb-3">
                    <h1 className="text-red-600 text-3xl font-bold text-center mb-5">Make an Appointment</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Bowenpally"
                            phone="+91 88865 78697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Barkatpura"
                            phone="+91 88864 78697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Kukatpally"
                            phone="+91 90632 08697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Suchitra"
                            phone="+91 99594 18697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Banjara Hills"
                            phone="+91 87905 88697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Manikonda"
                            phone="+91 89786 88697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Nacharam"
                            phone="+91 90003 28697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Neredmet"
                            phone="+91 90003 48697"
                        />

                        <LocationCard
                            name="Total Solution Rehabilitation Society"
                            location="Champapet"
                            phone="+91 99493 08697"
                        />

                        <LocationCard
                            name="Special Education Center"
                            location="Barkatpura"
                            phone="+91 70754 88697"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LocationCard({ name, location, phone }) {
    return (
        <div className="border border-red-800 rounded p-4 h-full flex flex-col">
            <h2 className="text-xl font-medium text-center flex-grow">
                {name},<br />
                {location}
            </h2>
            <div className="mt-4 flex justify-center">
                <a
                    href={`tel:${phone}`}
                    className="border border-red-600 text-red-600 rounded-full px-6 py-2 inline-block hover:bg-red-50 transition-colors"
                >
                    {phone}
                </a>
            </div>
        </div>
    );
}