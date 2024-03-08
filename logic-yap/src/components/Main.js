import React, { useState } from 'react'
import ProofContainer from './ProofContainer'

function Main() {
    const [showRules, setShowRules] = useState(false)

    const handleShowRules = () => {
        // Open a new window or modal for showing rules
        alert('Showing rules...')
    }

    const handleLearnMore = () => {
        // Show a pop-up window with fun description
        alert('Learn more...')
    }

    const handleGetStarted = () => {
        setShowRules(true)
    }
    return (
        <main className="container mx-auto mt-8">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                    Master Symbolic Logic and Proofs
                </h2>
                <p className="text-gray-700 mb-4">
                    LogicYAP (Your Assistant for Proofs) is your interactive
                    tool for mastering symbolic logic and proofs!
                </p>
                <p className="text-gray-700 mb-8">
                    Start exploring logic concepts, solving proofs, and
                    sharpening your logical thinking skills today!
                </p>
                <button
                    onClick={showRules ? handleShowRules : handleGetStarted}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                    {showRules ? 'Show Rules' : 'Hide Rules'}
                </button>
                <button
                    onClick={handleLearnMore}
                    className="bg-secondary-500 text-white px-4 py-2 rounded-lg"
                >
                    Learn More
                </button>
            </div>
            <ProofContainer />
        </main>
    )
}

export default Main
