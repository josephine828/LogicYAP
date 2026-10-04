import React, { useMemo, useState } from 'react'
import FormulaInput from './FormulaInput'
import { analyzeFormula } from './formulaLogic/analysis'

function PropositionAnalyzer() {
    const [proposition, setProposition] = useState('')
    const analysis = useMemo(() => analyzeFormula(proposition), [proposition])

    return (
        <section aria-labelledby="analyzer-title" className="bg-primary-50 rounded-lg shadow-lg p-6 mt-8 w-full md:w-[420px] md:shrink-0 max-h-[80vh] overflow-y-auto text-left">
            <h2 id="analyzer-title" className="text-xl font-semibold mb-4">Proposition Analyzer</h2>
            <FormulaInput
                id="analyzer-formula"
                label="Proposition"
                value={proposition}
                onChange={setProposition}
                multiline
                placeholder="~P ∨ Q, or ∀x(P(x) ⊃ Q(x))"
                help="Use single letters for propositions, P(x) or R(x,y) for predicates. ASCII forms such as !, &, |, -> and <-> also work."
            />
            <p className="text-sm text-gray-700 mb-4">Precedence: negation and quantifiers, conjunction, disjunction, conditional, biconditional. Conditionals associate to the right. Use parentheses to set scope.</p>
            {proposition.trim() && (
                <div aria-live="polite">
                    {!analysis.valid ? (
                        <div role="alert" className="text-red-800">
                            <p className="font-semibold">Not a well-formed formula</p>
                            <p>{analysis.error}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-green-800 font-semibold">Well-formed formula</p>
                            <p className="break-words mt-2"><strong>Formula:</strong> {analysis.ast.content}</p>
                            <p><strong>Main Operator:</strong> {['Simple', 'Predicate', 'Equality', 'Contradiction'].includes(analysis.ast.type) ? `None (${analysis.ast.type})` : analysis.ast.type}</p>
                            {analysis.isFirstOrder ? (
                                <div className="my-3">
                                    <p><strong>Free variables:</strong> {analysis.freeVariables.join(', ') || 'None'}</p>
                                    <p><strong>Bound variables:</strong> {analysis.boundVariables.join(', ') || 'None'}</p>
                                    <p>{analysis.freeVariables.length ? 'Open formula: its truth can depend on a variable assignment.' : 'Closed formula (sentence): it has no free variables.'}</p>
                                    <p className="text-sm text-gray-700 mt-2">Terms a–w are constants; x, y and z are variables. Any letter used as a quantifier variable also counts as a variable outside its scope.</p>
                                </div>
                            ) : <p><strong>Propositional atoms:</strong> {analysis.atoms.join(', ') || 'None'}</p>}
                            {analysis.classification && <div className="my-3">
                                <p><strong>Classification:</strong> {analysis.classification}</p>
                                <p className="text-sm text-gray-700">{{ Tautology: 'True under every truth assignment.', Contradiction: 'False under every truth assignment.', Contingency: 'True under some truth assignments and false under others.' }[analysis.classification]}</p>
                            </div>}
                            {analysis.limitMessage && <p className="my-3 text-gray-700">{analysis.limitMessage}</p>}
                            <details className="my-3" open>
                                <summary className="font-semibold cursor-pointer">Formula structure</summary>
                                <ul className="mt-2 space-y-1">
                                    {analysis.components.map((component, index) => (
                                        <li key={index} style={{ marginLeft: `${component.depth * 16}px` }} className="break-words">
                                            <span className="font-mono">{component.content}</span> <span className="text-sm text-gray-700">({component.type})</span>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                            {analysis.truthTable && (
                                <details className="mt-4" open>
                                    <summary className="font-semibold cursor-pointer">Truth table</summary>
                                    <div className="overflow-x-auto mt-2">
                                        <table className="w-full text-center text-sm border-collapse">
                                            <caption className="sr-only">Truth values for every assignment to the propositional atoms</caption>
                                            <thead><tr>{analysis.truthTable.columns.map((column, index) => <th key={index} scope="col" className="border border-primary-200 px-2 py-1 whitespace-nowrap">{column}</th>)}</tr></thead>
                                            <tbody>{analysis.truthTable.rows.map((row, index) => (
                                                <tr key={index}>{row.values.map((value, column) => <td key={column} className="border border-primary-200 px-2 py-1">{value ? 'T' : 'F'}</td>)}</tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                </details>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    )
}

export default PropositionAnalyzer
