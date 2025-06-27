import React from 'react'
import logo from '../logo.svg'

function Header() {
    return (
        <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
                <img src={logo} className="h-12 mr-2" alt="Logo" />
                <h1 className="text-2xl font-bold">LogicYAP</h1>
            </div>
            <nav>{/* Add navigation links if needed */}</nav>
        </header>
    )
}

export default Header
