import React, { useMemo, useState } from 'react'
import FormulaInput from './FormulaInput'
import { parseFormula } from './formulaLogic/parser'
import { analyzeArgument } from './formulaLogic/analysis'
import { appendProofLine, createProof, getProofHints, proofRules } from './formulaLogic/proof'

const ruleGroups = [
    ['inference', 'Inference rules'], ['replacement', 'Replacement rules'],
    ['subproof', 'Subproofs'], ['quantifier', 'Quantifier rules'],
]

function ProofContainer() {
    const [premises, setPremises] = useState('')
    const [goal, setGoal] = useState('')
    const [history, setHistory] = useState([])
    const [formula, setFormula] = useState('')
    const [rule, setRule] = useState('mp')
    const [references, setReferences] = useState('')
    const [term, setTerm] = useState('')
    const [error, setError] = useState('')
    const [showHints, setShowHints] = useState(false)
    const proof = history[history.length - 1] || null
    const selectedRule = proofRules.find((item) => item.id === rule)
    const argument = useMemo(() => proof ? analyzeArgument(
        premises.split(/\r?\n/).filter((line) => line.trim()).map(parseFormula), proof.goal
    ) : null, [proof, premises])
    const hints = useMemo(() => proof && showHints && !proof.completed ? getProofHints(proof) : [], [proof, showHints])

    const startProof = (event) => {
        event.preventDefault()
        const result = createProof(premises, goal)
        if (!result.valid) {
            setError(result.error)
            return
        }
        setHistory([result.proof])
        setFormula('')
        setReferences('')
        setTerm('')
        setError('')
        setShowHints(false)
    }

    const addStep = (event) => {
        event.preventDefault()
        const result = appendProofLine(proof, { formula, rule, references, term })
        if (!result.valid) {
            setError(result.error)
            return
        }
        setHistory((previous) => [...previous, result.proof])
        setFormula('')
        setReferences('')
        setTerm('')
        setError('')
    }

    const loadExample = (nextPremises, nextGoal) => {
        setPremises(nextPremises)
        setGoal(nextGoal)
        setHistory([])
        setError('')
        setFormula('')
        setReferences('')
        setTerm('')
        setShowHints(false)
    }

    return (
        <section aria-labelledby="proof-title" className="proof-container bg-primary-50 w-full min-w-0 rounded-lg shadow-lg p-6 mt-8 max-h-[80vh] overflow-y-auto text-left">
            <h2 id="proof-title" className="text-xl font-semibold mb-4">Proof Assistant</h2>
            <p className="text-gray-700 mb-4">Enter premises and a goal, then justify each new line with a rule and earlier line numbers. The checker verifies the formulas and the scope of assumptions.</p>
            {!proof ? (
                <form onSubmit={startProof}>
                    <FormulaInput id="proof-premises" label="Premises" value={premises} onChange={setPremises} multiline placeholder={'P ⊃ Q\nP'} help="One formula per line. Leave empty to prove a theorem without premises." />
                    <FormulaInput id="proof-goal" label="Goal" value={goal} onChange={setGoal} placeholder="Q" />
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg">Start proof</button>
                        <button type="button" onClick={() => loadExample('P ⊃ Q\nP', 'Q')} className="bg-primary-200 px-3 py-2 rounded-lg">Load modus ponens example</button>
                        <button type="button" onClick={() => loadExample('∀x(P(x) ⊃ Q(x))\nP(a)', 'Q(a)')} className="bg-primary-200 px-3 py-2 rounded-lg">Load predicate example</button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="break-words"><strong>Goal:</strong> {proof.goal.content}</p>
                    {argument && (
                        <div className="my-3 text-sm" aria-label="Argument analysis">
                            {argument.status === 'valid' && <p>Argument valid: every truth assignment satisfying the premises also satisfies the goal.</p>}
                            {argument.status === 'invalid' && <>
                                <p className="text-red-800 font-semibold">The goal does not follow from the premises.</p>
                                <p>Counterexample: {Object.entries(argument.counterexample || {}).map(([atom, value]) => `${atom} = ${value ? 'T' : 'F'}`).join(', ') || 'the premises are true and the goal is false'}.</p>
                            </>}
                            {['unsupported', 'limited'].includes(argument.status) && <p>{argument.message}</p>}
                        </div>
                    )}
                    <div className="overflow-x-auto my-4">
                        <table className="w-full border-collapse text-sm">
                            <caption className="sr-only">Checked proof lines</caption>
                            <thead><tr>
                                <th scope="col" className="border-b border-primary-300 p-2 text-left">Line</th>
                                <th scope="col" className="border-b border-primary-300 p-2 text-left">Formula</th>
                                <th scope="col" className="border-b border-primary-300 p-2 text-left">Justification</th>
                            </tr></thead>
                            <tbody>{proof.lines.map((line) => (
                                <tr key={line.number}>
                                    <th scope="row" className="p-2 text-left align-top">{line.number}</th>
                                    <td className="p-2 font-mono break-words" style={{ paddingLeft: `${8 + line.depth * 18}px`, borderLeft: line.depth ? '2px solid #cc444b' : undefined }}>
                                        {line.depth > 0 && <span className="sr-only">Subproof depth {line.depth}: </span>}{line.formula.content}
                                    </td>
                                    <td className="p-2 align-top">{line.rule === 'premise' ? 'Premise' : proofRules.find((item) => item.id === line.rule)?.abbreviation || line.rule}{line.references.length > 0 ? ` (${line.references.join(', ')})` : ''}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                    <div aria-live="polite">
                        {proof.completed ? <p className="text-green-800 font-semibold mb-4">Proof complete: the goal is derived with all assumptions discharged.</p> : <p className="text-gray-700 mb-4">{proof.currentDepth > 0 ? `Working inside ${proof.currentDepth} open subproof${proof.currentDepth === 1 ? '' : 's'}.` : 'Working from the premises.'}</p>}
                    </div>
                    {!proof.completed && (
                        <form onSubmit={addStep} className="border-t border-primary-300 pt-4">
                            <FormulaInput id="proof-next-line" label="Next formula" value={formula} onChange={setFormula} placeholder="Formula to derive" />
                            <label htmlFor="proof-rule" className="block font-semibold mb-1">Rule</label>
                            <select id="proof-rule" value={rule} onChange={(event) => { setRule(event.target.value); setError('') }} className="w-full border border-gray-300 rounded-lg p-2 bg-white" aria-describedby="proof-rule-help">
                                {ruleGroups.map(([kind, label]) => (
                                    <optgroup key={kind} label={label}>
                                        {proofRules.filter((item) => item.kind === kind).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.abbreviation})</option>)}
                                    </optgroup>
                                ))}
                            </select>
                            <p id="proof-rule-help" className="text-sm text-gray-700 my-2">{selectedRule?.description}</p>
                            <label htmlFor="proof-references" className="block font-semibold mb-1">Cited lines</label>
                            <input id="proof-references" value={references} onChange={(event) => setReferences(event.target.value)} placeholder="1, 2" aria-describedby="proof-reference-help" className="w-full border border-gray-300 rounded-lg p-2 bg-white" />
                            <p id="proof-reference-help" className="text-sm text-gray-700 my-2">{selectedRule?.references === 0 ? 'Leave cited lines empty.' : typeof selectedRule?.references === 'number' ? `Cite ${selectedRule.references} earlier line${selectedRule.references === 1 ? '' : 's'}.` : selectedRule?.references}</p>
                            {selectedRule?.requiresTerm && <div className="my-3">
                                <label htmlFor="proof-term" className="block font-semibold mb-1">Substitution term</label>
                                <input id="proof-term" value={term} onChange={(event) => setTerm(event.target.value)} maxLength={1} placeholder="a" className="w-full border border-gray-300 rounded-lg p-2 bg-white" aria-describedby="proof-term-help" />
                                <p id="proof-term-help" className="text-sm text-gray-700 mt-1">One lowercase letter. Universal generalization requires an arbitrary term; existential witnesses must be fresh.</p>
                            </div>}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg">Check and add line</button>
                                <button type="button" onClick={() => setShowHints((previous) => !previous)} className="bg-primary-200 px-4 py-2 rounded-lg">{showHints ? 'Hide hints' : 'Show hints'}</button>
                            </div>
                        </form>
                    )}
                    {showHints && !proof.completed && <div className="my-4">
                        <p className="font-semibold">Possible next steps</p>
                        {hints.length ? <ul className="space-y-2 mt-2">{hints.map((hint, index) => <li key={index}>
                            <p className="text-sm">{hint.explanation}</p>
                            <button type="button" onClick={() => { setFormula(hint.formula); setRule(hint.rule); setReferences(hint.references.join(', ')); setTerm(''); setError('') }} className="underline text-primary-800 text-left">Use {hint.formula}</button>
                        </li>)}</ul> : <p className="text-sm text-gray-700">No automatic hint found. Try a replacement rule or an assumption for a subproof.</p>}
                    </div>}
                    <div className="flex gap-2 mt-4">
                        <button type="button" disabled={history.length < 2} onClick={() => { setHistory((previous) => previous.slice(0, -1)); setError('') }} className="bg-primary-200 px-3 py-2 rounded-lg disabled:opacity-50">Undo last line</button>
                        <button type="button" onClick={() => { setHistory([]); setError(''); setShowHints(false) }} className="bg-primary-200 px-3 py-2 rounded-lg">Edit premises and goal</button>
                    </div>
                </>
            )}
            {error && <p role="alert" className="text-red-800 mt-4">{error}</p>}
        </section>
    )
}

export default ProofContainer
