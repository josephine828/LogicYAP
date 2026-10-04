import React, { useId, useState } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import {
    naturalDeductionRules,
    quantifierRules,
    replacementRules,
    rulesOfInference,
} from './RulesData'

function Accordion({ title, rules, explanation }) {
    const [isOpen, setIsOpen] = useState(false)
    const sectionId = useId()
    const panelId = `${sectionId}-panel`

    return (
        <section className="mb-4">
            <h3>
                <button
                    type="button"
                    className="flex items-center justify-between bg-secondary-200 rounded-lg p-2 w-full text-left hover:bg-secondary-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                >
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="ml-2" aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
                </button>
            </h3>
            <div id={panelId} hidden={!isOpen} className="bg-secondary-100 rounded-lg p-2 mt-2">
                <p className="text-sm mb-3">{explanation}</p>
                {isOpen && rules.map((rule, index) => <RuleItem key={index} rule={rule} />)}
            </div>
        </section>
    )
}

function RuleItem({ rule }) {
    const tooltipId = useId()
    const tooltipContent = `${rule.description} Tips: ${rule.helpfulTips.join(' ')}`

    return (
        <article className="mb-4 p-2 hover:bg-secondary-200">
            <h4
                className="text-md font-semibold mb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
                tabIndex={0}
                data-tooltip-id={tooltipId}
                data-tooltip-content={tooltipContent}
            >
                {rule.name} ({rule.abbreviation})
            </h4>
            {rule.steps && rule.steps.map((step, index) => <p key={index} className="mb-1">{step}</p>)}
            {rule.steps && <p className="border-t-2 border-black pt-2 mb-2">∴ {rule.conclusion}</p>}
            {rule.transformations && rule.transformations.map((transformation, index) => (
                <p key={index} className="mb-1">({transformation.from}) ⇔ ({transformation.to})</p>
            ))}
            <p className="text-sm mb-1">{rule.description}</p>
            <details className="text-sm">
                <summary className="cursor-pointer">Application conditions</summary>
                <ul className="list-disc pl-5 mt-1">
                    {rule.helpfulTips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
            </details>
            <ReactTooltip
                place="right"
                id={tooltipId}
                variant="info"
                style={{ maxWidth: '300px', backgroundColor: '#CC444B' }}
            />
        </article>
    )
}

function Rules() {
    return (
        <aside aria-label="Logic rule reference" className="bg-primary-50 rounded-lg shadow-lg p-6 mr-4 mt-8 w-[400px] max-w-full h-[60vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Logic Rules</h2>
            <p className="text-sm mb-4">Classical logic: p, q, r, and s stand for any well formed formulas, including compound formulas. Repeated letters must match throughout a rule.</p>
            <Accordion
                title="Rules of Inference"
                rules={rulesOfInference}
                explanation="Match each schema against an entire available cited line. The required main operators and all repeated formulas must match."
            />
            <Accordion
                title="Replacement Rules"
                rules={replacementRules}
                explanation="Each equivalence works in both directions. Replace a matching whole formula or subformula occurrence while preserving everything around it."
            />
            <Accordion
                title="Natural Deduction"
                rules={naturalDeductionRules}
                explanation="Subproofs track temporary assumptions. Discharging an assumption closes its scope; dependent lines cannot be reused as independent established formulas."
            />
            <Accordion
                title="Quantifiers and Identity"
                rules={quantifierRules}
                explanation="φ is a formula, x a variable, t and u terms, and a an arbitrary parameter. Substitute only free occurrences and avoid capturing variables. Standard first-order logic assumes a nonempty domain."
            />
            <p className="text-sm mt-3">
                Further reading:{' '}
                <a className="underline" href="https://forallx.openlogicproject.org/html/Ch17.html" target="_blank" rel="noreferrer">natural deduction</a>
                {' and '}
                <a className="underline" href="https://forallx.openlogicproject.org/html/Ch36.html" target="_blank" rel="noreferrer">quantifier rules</a>.
            </p>
        </aside>
    )
}

export default Rules
