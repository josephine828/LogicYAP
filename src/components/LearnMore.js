import React, { useEffect, useId, useRef } from 'react'

function LearnMore({ onClose }) {
    const titleId = useId()
    const dialogRef = useRef(null)
    const closeRef = useRef(null)

    useEffect(() => {
        const previousFocus = document.activeElement
        closeRef.current.focus()
        return () => {
            if (previousFocus && previousFocus.isConnected) previousFocus.focus()
        }
    }, [])

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
        }
        if (event.key === 'Tab') {
            const controls = dialogRef.current.querySelectorAll('a[href], button')
            const first = controls[0]
            const last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
    }

    return (
        <div className="bg-black bg-opacity-50 fixed inset-0 z-50 flex justify-center items-center p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                ref={dialogRef}
                onKeyDown={handleKeyDown}
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 id={titleId} className="text-xl font-semibold">Learn Symbolic Logic</h2>
                    <button
                        type="button"
                        ref={closeRef}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <div className="text-gray-700 space-y-4">
                    <section>
                        <h3 className="font-semibold">Syntax, truth, validity, and proof</h3>
                        <p>A well formed formula follows the grammar. This establishes its structure, not its truth. Truth depends on a valuation or interpretation. An argument is valid when no interpretation makes all its premises true and its conclusion false. A formal proof establishes the conclusion from its premises through justified rule steps.</p>
                        <p className="mt-2">A tautology is true under every propositional valuation; a contradiction is false under every valuation; a contingent formula is true in some valuations and false in others. A sound argument is valid and has true premises.</p>
                    </section>
                    <section>
                        <h3 className="font-semibold">Read the connectives carefully</h3>
                        <p>~P negates P, P · Q requires both, and P ∨ Q allows either or both. The material conditional P ⊃ Q is false exactly when P is true and Q is false. Its direction matters: Q and P ⊃ Q do not establish P. The biconditional P ≡ Q requires both directions.</p>
                        <p className="mt-2">Parentheses determine grouping. Negation binds most tightly, followed by conjunction, disjunction, conditional, and biconditional. For example, ~P ∨ Q means (~P) ∨ Q. Use parentheses for ~(P ∨ Q) or nested conditionals.</p>
                    </section>
                    <section>
                        <h3 className="font-semibold">Inference and replacement</h3>
                        <p>Inference rules match whole cited formulas. From P · Q you may infer P; from (P · Q) ⊃ R you cannot simply infer P. Replacement rules use equivalences in either direction, including within a subformula, while keeping its surrounding structure intact.</p>
                        <p className="mt-2">Schema letters stand for arbitrary formulas, including compound ones. Repeated letters in a rule must always stand for the same formula. An assumption opens a temporary subproof; its dependent lines cannot be cited outside after it is discharged.</p>
                    </section>
                    <section>
                        <h3 className="font-semibold">Predicates, quantifiers, and scope</h3>
                        <p>P(a) says that an object a has property P. ∀x P(x) says every object in the domain has P; ∃x P(x) says at least one does. In ∀x (P(x) ⊃ Q(x)), both occurrences of x are bound. In ∀x P(x) ⊃ Q(x), the x in Q(x) is free: this is an open formula whose truth also depends on a variable assignment.</p>
                        <p className="mt-2">Substitution changes free occurrences only and must avoid variable capture. Universal generalization needs an arbitrary object independent of open assumptions. An existential witness belongs to a local subproof and cannot escape into its conclusion. ∀x ∃y R(x,y) and ∃y ∀x R(x,y) make different claims.</p>
                    </section>
                    <section>
                        <h3 className="font-semibold">Using LogicYAP</h3>
                        <p>The proposition analyzer checks syntax, finds the main operator and subformulas, and generates truth tables for propositional formulas. Quantified and predicate formulas receive structural analysis; their truth needs a domain and interpretation. The proof assistant checks cited rule steps, assumption scope, quantifier restrictions, and whether the goal is reached with all subproofs closed.</p>
                        <p className="mt-2">This workspace uses classical propositional and first-order logic with identity and a nonempty domain. Predicates use uppercase letters and parenthesized one-letter lowercase terms, such as R(a,b). Function terms and modal logic are outside the supported language.</p>
                    </section>
                    <p className="text-sm">
                        Read more in{' '}
                        <a className="underline" href="https://forallx.openlogicproject.org/html/Ch2.html" target="_blank" rel="noreferrer">forall x: validity and soundness</a>
                        {', '}
                        <a className="underline" href="https://forallx.openlogicproject.org/html/Ch17.html" target="_blank" rel="noreferrer">natural deduction</a>
                        {', and '}
                        <a className="underline" href="https://forallx.openlogicproject.org/html/Ch36.html" target="_blank" rel="noreferrer">quantifier rules</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LearnMore
