import React from 'react'
import { Link } from 'react-router-dom'
export default function TherapistServiceHeader({ setIsMenuOpen }) {
    return (
        <>
            <ul className="items-stretch hidden font-bold  space-x-3 lg:flex">
                <li className='flex'>
                    <Link to="/therapistdashboard" className="flex items-center px-4 border-b border-transparent hover:border-amber-600 focus:border-amber-600 focus:font-bold" >
                        Dashboard
                    </Link>
                </li>

            </ul>
            <ul className="lg:hidden text-white rounded-md bg-gray-800 divide-y divide-gray-600">
                <li>
                    <Link
                        to="/therapistdashboard"
                        className="block px-4 py-3 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                </li>                
            </ul>

        </>
    )
}