import React, { useRef } from 'react'

const symbols = [
    ['~', 'Negation'], ['·', 'Conjunction'], ['∨', 'Disjunction'],
    ['⊃', 'Conditional'], ['≡', 'Biconditional'],
    ['∀', 'Universal quantifier'], ['∃', 'Existential quantifier'],
    ['⊥', 'Contradiction'],
]

export default function FormulaInput({ id, label, value, onChange, multiline = false, placeholder, help, disabled = false }) {
    const inputRef = useRef(null)
    const Input = multiline ? 'textarea' : 'input'

    const insert = (symbol) => {
        const input = inputRef.current
        const start = input.selectionStart ?? value.length
        const end = input.selectionEnd ?? start
        onChange(value.slice(0, start) + symbol + value.slice(end))
        requestAnimationFrame(() => {
            input.focus()
            input.setSelectionRange(start + symbol.length, start + symbol.length)
        })
    }

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block font-semibold mb-1">{label}</label>
            <Input
                id={id}
                ref={inputRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                rows={multiline ? 3 : undefined}
                type={multiline ? undefined : 'text'}
                spellCheck={false}
                autoComplete="off"
                aria-describedby={help ? `${id}-help` : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            />
            {help && <p id={`${id}-help`} className="text-sm text-gray-700 mt-1">{help}</p>}
            <div className="flex flex-wrap gap-1 mt-2" role="group" aria-label={`Symbols for ${label}`}>
                {symbols.map(([symbol, name]) => (
                    <button
                        key={symbol}
                        type="button"
                        title={name}
                        aria-label={`Insert ${name.toLowerCase()} into ${label.toLowerCase()}`}
                        disabled={disabled}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insert(symbol)}
                        className="bg-primary-200 hover:bg-primary-300 px-3 py-1 rounded font-bold disabled:opacity-50"
                    >{symbol}</button>
                ))}
            </div>
        </div>
    )
}
