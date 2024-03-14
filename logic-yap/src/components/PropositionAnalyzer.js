import React, { useState, useEffect, useRef } from 'react'
import Formula from './formulaLogic/Formula'

function PropositionAnalyzer() {
    const [proposition, setProposition] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [components, setComponents] = useState([])
    const [mainOperator, setMainOperator] = useState('')
    const textareaRef = useRef(null)

    useEffect(() => {
        analyzeProposition()
    }, [proposition])

    useEffect(() => {
        console.log(components)
    }, [components])

    const analyzeProposition = () => {
        if (proposition.length === 0) {
            setIsValid(false)
            setMainOperator('')
            setComponents([])
            return
        }

        //     const conjunctionPattern = /(?:[A-Za-z]+|\([^)]+\))(?:\s*·\s*(?:[A-Za-z]+|\([^)]+\)))+/;

        // const disjunctionPattern = /\w+\s*∨\s*\w+/ // Match disjunctions (letters separated by ∨)
        // const conditionalPattern = /\w+\s*⊃\s*\w+/ // Match conditionals (letters separated by ⊃)
        // const biconditionalPattern = /\w+\s*≡\s*\w+/ // Match biconditionals (letters separated by ≡)
        // const universalQuantifierPattern = /\(\w+\)/ // Match universal quantifiers (letter inside parentheses)
        // const existentialQuantifierPattern = /\(∃\w+\)/ // Match existential quantifiers (letter inside parentheses, preceded by ∃)

        setIsValid(Formula({proposition: proposition, setMainOperator: setMainOperator, setComponents: setComponents}).isValid());
    }

    const insertSymbol = (symbol) => {
        const cursorPosition = textareaRef.current.selectionStart
        const firstPart = proposition.slice(0, cursorPosition)
        const secondPart = proposition.slice(cursorPosition)
        const newProposition = firstPart + symbol + secondPart
        setProposition(newProposition)
    }

    return (
        <div className="bg-primary-50 rounded-lg shadow-lg p-6 ml-4 mt-8 w-[500px] h-[60vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Proposition Analyzer</h3>
            <p>
                Make sure to use the right notation and use the buttons for the
                right symbols!
            </p>
            <textarea
                className="w-full h-24 my-4 px-2 py-1 border border-gray-300 rounded-lg resize-none"
                ref={textareaRef}
                value={proposition}
                onChange={(e) => {
                    setProposition(e.target.value)
                    analyzeProposition()
                }}
                placeholder="Enter a proposition..."
            ></textarea>
            <div className="mb-4">
                <button
                    onClick={() => {
                        insertSymbol('~')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ~
                </button>
                <button
                    onClick={() => {
                        insertSymbol('·')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ·
                </button>
                <button
                    onClick={() => {
                        insertSymbol('∨')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ∨
                </button>
                <button
                    onClick={() => {
                        insertSymbol('⊃')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ⊃
                </button>
                <button
                    onClick={() => {
                        insertSymbol('≡')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ≡
                </button>
                <button
                    onClick={() => {
                        insertSymbol('∃')
                        analyzeProposition()
                    }}
                    className="bg-primary-300 px-4 py-2 m-1 font-extrabold rounded-lg"
                >
                    ∃
                </button>
            </div>
            <button
                onClick={analyzeProposition}
                className="bg-secondary-500 px-4 py-2 mb-4 rounded-lg"
            >
                Analyze
            </button>
            {isValid && proposition && (
                <div>
                    <p className="text-green-600">Well-formed formula</p>
                    {mainOperator && <p>Main Operator: {mainOperator}</p>}
                    {components && <p>Components:</p>}
                    <ul>
                        {components.map((component, index) => (
                            <li key={index}>{component.content}<br/>Type: {component.type}</li>
                        ))}
                    </ul>
                </div>
            )}
            {!isValid && proposition && (
                <p className="text-red-600">Not a well-formed formula</p>
            )}
        </div>
    )
}

export default PropositionAnalyzer
