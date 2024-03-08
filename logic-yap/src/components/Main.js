import React, { useState } from 'react'
import ProofContainer from './ProofContainer'
import Rules from './Rules'
import LearnMore from './LearnMore'

function Main() {
    const [showRules, setShowRules] = useState(false)
    const [showLearnMore, setShowLearnMore] = useState(false)

    const handleShowRules = () => {
        setShowRules(!showRules)
    }

    const handleLearnMore = () => {
        setShowLearnMore(true)
    }

    const handleCloseLearnMore = () => {
        setShowLearnMore(false)
    }

    return (
        <main className="container mx-auto mt-8">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    Master Symbolic Logic and Proofs
                </h1>
                <p className="text-gray-700 mb-4">
                    LogicYAP (Your Assistant for Proofs) is your interactive
                    tool for mastering symbolic logic and proofs!
                </p>
                <p className="text-gray-700 mb-8">
                    Start exploring logic concepts, solving proofs, and
                    sharpening your logical thinking skills today!
                </p>
                <button
                    onClick={handleShowRules}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                    {showRules ? 'Hide Rules' : 'Show Rules' }
                </button>
                <button
                    onClick={handleLearnMore}
                    className="bg-secondary-500 text-white px-4 py-2 rounded-lg"
                >
                    Learn More
                </button>
            </div>
            <div className="w-full md:flex-row sm:flex-col flex justify-center items-start">
                {showRules && <Rules />}
                <ProofContainer />
            </div>
            {showLearnMore && <LearnMore onClose={handleCloseLearnMore} />}
        </main>
    )
}

export default Main
