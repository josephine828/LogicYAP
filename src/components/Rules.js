import React, { useState } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { replacementRules, rulesOfInference } from './RulesData'

function Accordion({ title, rules, tooltipContent }) {
    const [isOpen, setIsOpen] = useState(false)
    const tooltipId = `accordion${title}`

    return (
        <div className="mb-4">
            <div
                data-tooltip-id={tooltipId}
                className="mb-4"
                data-tooltip-html={tooltipContent}
            >
                <button
                    className="flex items-center justify-between bg-secondary-200 rounded-lg p-2 w-full text-left hover:bg-secondary-100 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <h1 className="ml-2">{isOpen ? '▼' : '▶'}</h1>
                </button>
                <ReactTooltip
                    place="right"
                    multiline={true}
                    id={tooltipId}
                    variant="info"
                    style={{ width: '300px', backgroundColor: '#CC444B' }}
                />
            </div>
            {isOpen && (
                <div className="bg-secondary-100 rounded-lg p-2 mt-2">
                    {rules.map((rule, index) => (
                        <RuleItem key={index} rule={rule} index={index} />
                    ))}
                </div>
            )}
        </div>
    )
}

function RuleItem({ rule, index }) {
    const tooltipId = `rule${index}`

    return (
        <div
            key={tooltipId}
            data-tooltip-id={tooltipId}
            className="mb-4 p-2 hover:bg-secondary-200 hover:cursor-pointer"
            data-tooltip-html={`${
                rule.description
            }<br /><br />Tips:<br />- ${rule.helpfulTips.join(
                '<br />- '
            )}`}
        >
            <h4 className="text-md font-semibold mb-2">
                {rule.name} ({rule.abbreviation})
            </h4>
            {rule.steps &&
                rule.steps.map((step, idx) => (
                    <p key={idx} className="mb-1">
                        {step}
                    </p>
                ))}
            {rule.steps && (
                <p className="border-t-2 border-black pt-4 mb-2">
                    /∴ {rule.conclusion}
                </p>
            )}
            {rule.transformations &&
                rule.transformations.map((transformation, idx) => (
                    <p key={idx} className="mb-1">
                        {rule.name === 'Double Negation' ||
                        rule.name === "DeMorgan's" ||
                        rule.name === 'Duplication'
                            ? transformation.from
                            : `(${transformation.from})`}{' '}
                        ::{' '}
                        {rule.name === 'Double Negation' ||
                        rule.name === 'Duplication'
                            ? transformation.to
                            : `(${transformation.to})`}
                    </p>
                ))}
            <ReactTooltip
                place="right"
                multiline={true}
                id={tooltipId}
                variant="info"
                style={{ width: '300px', backgroundColor: '#CC444B' }}
            />
        </div>
    )
}

function Rules() {
    return (
        <div className="bg-primary-50 rounded-lg shadow-lg p-6 mr-4 mt-8 w-[400px] h-[60vh] overflow-y-auto">
            <Accordion title="Rules of Inference" rules={rulesOfInference} tooltipContent={"Tip: Make sure that you can actually use the rule by checking if you have all the parts to derive the conclusion and that the main operators are correct!"} />
            <Accordion title="Replacement Rules" rules={replacementRules} tooltipContent={"Tip: You can use these rules any time and you do not have to watch out for the main operator since these rules are just replacing propositions, you are not deriving a conclusion!"}/>
        </div>
    )
}

export default Rules
