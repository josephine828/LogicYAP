import { parseFormula, formulasEqual } from './parser'
import { appendProofLine, createProof, getProofHints, proofRules } from './proof'

const start = (premises, goal) => {
    const result = createProof(premises, goal)
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error(result.error)
    return result.proof
}
const add = (proof, formula, rule, references = [], term) => {
    const result = appendProofLine(proof, { formula, rule, references, term })
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error(result.error)
    return result.proof
}
const reject = (proof, formula, rule, references = [], term) => {
    const snapshot = JSON.stringify(proof)
    const result = appendProofLine(proof, { formula, rule, references, term })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.proof).toBe(proof)
    expect(JSON.stringify(proof)).toBe(snapshot)
    return result.error
}

describe('proof setup and line references', () => {
    test('parses newline-separated premises and recognizes an already given conclusion', () => {
        const proof = start('P\n\nQ', 'Q')
        expect(proof.lines).toHaveLength(2)
        expect(proof.completed).toBe(true)
        expect(proof.scopes).toEqual([])
    })

    test('validates every premise and the goal', () => {
        expect(createProof(['P ⊃'], 'P').valid).toBe(false)
        expect(createProof(['P'], 'Q ·').valid).toBe(false)
        expect(createProof(['P'], '').valid).toBe(false)
        expect(createProof([42], 'P').valid).toBe(false)
    })

    test('rejects changing predicate arity across premises, goal, or a new line', () => {
        expect(createProof(['P(a)', 'P(a,b)'], 'Q').valid).toBe(false)
        expect(createProof(['P(a)'], 'P(a,b)').valid).toBe(false)
        const proof = start(['P(a)'], 'Q')
        expect(reject(proof, 'P(a,b) ∨ P(a)', 'add', [1])).toMatch(/arity/)
    })

    test('rejects future, zero, fractional, malformed, and missing references', () => {
        const proof = start(['P ⊃ Q', 'P'], 'Q')
        reject(proof, 'Q', 'mp', [1, 3])
        reject(proof, 'Q', 'mp', [1, 0])
        reject(proof, 'Q', 'mp', [1, 1.5])
        reject(proof, 'Q', 'mp', '1;2')
        reject(proof, 'Q', 'mp', [1])
        reject(proof, 'Q', 'anything', [1, 2])
    })

    test('adds immutable proof versions and accepts comma or whitespace references', () => {
        const proof = start(['P ⊃ Q', 'P'], 'Q')
        const snapshot = JSON.stringify(proof)
        const next = add(proof, 'Q', 'mp', '2, 1')
        expect(next.completed).toBe(true)
        expect(JSON.stringify(proof)).toBe(snapshot)
        expect(proof.lines).toHaveLength(2)
        expect(add(proof, 'Q', 'mp', '1 2').completed).toBe(true)
    })
})

describe('symbolic inference rules', () => {
    test.each([
        [['(P · Q) ⊃ (R ∨ S)', 'P · Q'], 'R ∨ S', 'mp', [1, 2]],
        [['(P ∨ Q) ⊃ (R · S)', '~(R · S)'], '~(P ∨ Q)', 'mt', [2, 1]],
        [['P ⊃ (Q · R)', '(Q · R) ⊃ S'], 'P ⊃ S', 'hs', [2, 1]],
        [['(P ∨ Q) · (R ⊃ S)'], 'P ∨ Q', 'simp', [1]],
        [['(P ∨ Q) · (R ⊃ S)'], 'R ⊃ S', 'simp', [1]],
        [['P ∨ Q', 'R ⊃ S'], '(R ⊃ S) · (P ∨ Q)', 'conj', [1, 2]],
        [['P ⊃ Q', 'R ⊃ S', 'P ∨ R'], 'Q ∨ S', 'dilemma', [3, 2, 1]],
        [['(P · Q) ∨ R', '~(P · Q)'], 'R', 'ds', [1, 2]],
        [['P ∨ (Q · R)', '~(Q · R)'], 'P', 'ds', [2, 1]],
        [['P · Q'], '(P · Q) ∨ R', 'add', [1]],
        [['P · Q'], 'R ∨ (P · Q)', 'add', [1]],
        [['P ⊃ Q', 'Q ⊃ P'], 'P ≡ Q', 'bi', [2, 1]],
        [['P ≡ (Q · R)', 'Q · R'], 'P', 'iff-elim', [2, 1]],
        [['P ∨ Q', 'P ⊃ R', 'Q ⊃ R'], 'R', 'cases', [2, 3, 1]],
        [['P · Q', '~(P · Q)'], '⊥', 'contradiction', [2, 1]],
        [['⊥'], 'R ⊃ S', 'explosion', [1]],
    ])('%s establishes %s using %s', (premises, conclusion, rule, references) => {
        expect(add(start(premises, conclusion), conclusion, rule, references).completed).toBe(true)
    })

    test('rejects affirming the consequent and unrelated formulas of the right operator types', () => {
        reject(start(['P ⊃ Q', 'Q'], 'P'), 'P', 'mp', [1, 2])
        reject(start(['P ⊃ Q', 'R'], 'Q'), 'Q', 'mp', [1, 2])
        reject(start(['P ⊃ Q', '~R'], '~P'), '~P', 'mt', [1, 2])
        reject(start(['P ⊃ Q', 'R ⊃ S'], 'P ⊃ S'), 'P ⊃ S', 'hs', [1, 2])
        reject(start(['P · Q'], 'R'), 'R', 'simp', [1])
        reject(start(['P ∨ Q', '~R'], 'Q'), 'Q', 'ds', [1, 2])
        reject(start(['P', '~Q'], '⊥'), '⊥', 'contradiction', [1, 2])
        reject(start(['P'], 'Q ∨ R'), 'Q ∨ R', 'add', [1])
        reject(start(['P ⊃ Q', 'R ⊃ P'], 'P ≡ Q'), 'P ≡ Q', 'bi', [1, 2])
    })
})

describe('replacement rules', () => {
    test.each([
        ['P · Q', '~~(P · Q)', 'dn'],
        ['P ⊃ Q', '(P ⊃ Q) ∨ (P ⊃ Q)', 'dup'],
        ['P ⊃ Q', '(P ⊃ Q) · (P ⊃ Q)', 'dup'],
        ['P ∨ (Q · R)', '(Q · R) ∨ P', 'comm'],
        ['P · (Q ∨ R)', '(Q ∨ R) · P', 'comm'],
        ['(P · Q) · R', 'P · (Q · R)', 'assoc'],
        ['(P ∨ Q) ∨ R', 'P ∨ (Q ∨ R)', 'assoc'],
        ['(P · Q) ⊃ R', '~R ⊃ ~(P · Q)', 'contrap'],
        ['~(P ∨ Q)', '~P · ~Q', 'dem'],
        ['~(P · Q)', '~P ∨ ~Q', 'dem'],
        ['(P · Q) ≡ R', '((P · Q) ⊃ R) · (R ⊃ (P · Q))', 'be'],
        ['(P · Q) ⊃ R', '~(P · Q) ∨ R', 'ce'],
        ['P · (Q ∨ R)', '(P · Q) ∨ (P · R)', 'dist'],
        ['P ∨ (Q · R)', '(P ∨ Q) · (P ∨ R)', 'dist'],
        ['((P ∨ Q) · R) ⊃ S', '(P ∨ Q) ⊃ (R ⊃ S)', 'exp'],
    ])('checks %s ↔ %s by %s in both directions', (left, right, rule) => {
        expect(add(start([left], right), right, rule, [1]).completed).toBe(true)
        expect(add(start([right], left), left, rule, [1]).completed).toBe(true)
    })

    test('replaces a single nested subformula, including inside a quantified formula', () => {
        expect(add(start(['R ⊃ ~(P ∨ Q)'], 'R ⊃ (~P · ~Q)'), 'R ⊃ (~P · ~Q)', 'dem', [1]).completed).toBe(true)
        expect(add(start(['∀x(P(x) ∨ Q(x))'], '∀x(Q(x) ∨ P(x))'), '∀x(Q(x) ∨ P(x))', 'comm', [1]).completed).toBe(true)
    })

    test('requires consistent repeated metavariables and preserves surrounding formulas', () => {
        reject(start(['(P · Q) ∨ (S · R)'], 'P · (Q ∨ R)'), 'P · (Q ∨ R)', 'dist', [1])
        reject(start(['P ∨ Q'], 'P'), 'P', 'dup', [1])
        reject(start(['P ≡ Q'], '(P ⊃ Q) · (R ⊃ P)'), '(P ⊃ Q) · (R ⊃ P)', 'be', [1])
        reject(start(['R ⊃ (P · Q)'], 'S ⊃ (Q · P)'), 'S ⊃ (Q · P)', 'comm', [1])
        reject(start(['(P · Q) ∨ (R · S)'], '(Q · P) ∨ (S · R)'), '(Q · P) ∨ (S · R)', 'comm', [1])
        reject(start(['P'], '~~Q'), '~~Q', 'dn', [1])
    })
})

describe('subproof scope and discharge', () => {
    test('proves a conditional theorem and prevents assumptions from completing the proof', () => {
        let proof = start([], 'P ⊃ P')
        proof = add(proof, 'P', 'assume')
        expect(proof.currentDepth).toBe(1)
        expect(proof.completed).toBe(false)
        proof = add(proof, 'P', 'reit', [1])
        proof = add(proof, 'P ⊃ P', 'cp', [1, 2])
        expect(proof.completed).toBe(true)
        expect(proof.lines[2].depth).toBe(0)
        expect(reject(proof, 'P', 'reit', [1])).toMatch(/closed subproof/)
        expect(reject(proof, 'P', 'reit', [2])).toMatch(/closed subproof/)
    })

    test('allows outer scope references but closes only the innermost scope', () => {
        let proof = start(['R'], 'P ⊃ (Q ⊃ R)')
        proof = add(proof, 'P', 'assume')
        proof = add(proof, 'Q', 'assume')
        proof = add(proof, 'R', 'reit', [1])
        reject(proof, 'P ⊃ R', 'cp', [2, 4])
        proof = add(proof, 'Q ⊃ R', 'cp', [3, 4])
        expect(proof.scopes).toHaveLength(1)
        reject(proof, 'Q', 'reit', [3])
        proof = add(proof, 'P ⊃ (Q ⊃ R)', 'cp', [2, 5])
        expect(proof.completed).toBe(true)
    })

    test('requires the last subproof line and an exact conditional conclusion', () => {
        let proof = start(['Q', 'R'], 'P ⊃ R')
        proof = add(proof, 'P', 'assume')
        proof = add(proof, 'Q', 'reit', [1])
        proof = add(proof, 'R', 'reit', [2])
        reject(proof, 'P ⊃ Q', 'cp', [3, 4])
        reject(proof, 'P ⊃ Q', 'cp', [3, 5])
        expect(add(proof, 'P ⊃ R', 'cp', [3, 5]).completed).toBe(true)
    })

    test('negation introduction and classical indirect proof discharge explicit contradictions', () => {
        let proof = start(['~P'], '~P')
        proof = add(proof, 'P', 'assume')
        proof = add(proof, '⊥', 'contradiction', [1, 2])
        expect(add(proof, '~P', 'ni', [2, 3]).scopes).toEqual([])
        let indirect = start(['~~P'], 'P')
        indirect = add(indirect, '~P', 'assume')
        indirect = add(indirect, '⊥', 'contradiction', [1, 2])
        expect(add(indirect, 'P', 'ip', [2, 3]).completed).toBe(true)
        reject(indirect, 'Q', 'ip', [2, 3])
        reject(proof, '~Q', 'ni', [2, 3])
    })

    test('rejects discharging a conclusion without a contradiction', () => {
        const proof = add(start(['Q'], '~P'), 'P', 'assume')
        reject(proof, '~P', 'ni', [2, 2])
        reject(proof, 'P', 'ip', [2, 2])
    })
})

describe('first-order rules and eigenparameter conditions', () => {
    test('instantiates all and only free occurrences of a universal variable', () => {
        const proof = start(['∀x(R(x,x) · ∀xP(x))'], 'R(a,a) · ∀xP(x)')
        expect(add(proof, 'R(a,a) · ∀xP(x)', 'ui', [1], 'a').completed).toBe(true)
        reject(proof, 'R(a,b) · ∀xP(x)', 'ui', [1], 'a')
        reject(proof, 'R(a,a) · ∀xP(a)', 'ui', [1], 'a')
        reject(proof, 'R(a,a) · ∀xP(x)', 'ui', [1])
        reject(proof, 'R(a,a) · ∀xP(x)', 'ui', [1], 'alice')
    })

    test('rejects substitution that captures a variable', () => {
        const proof = start(['∀x∃yR(x,y)'], '∃yR(y,y)')
        reject(proof, '∃yR(y,y)', 'ui', [1], 'y')
        expect(add(proof, '∃yR(a,y)', 'ui', [1], 'a').lines).toHaveLength(2)
    })

    test('existential generalization supports partial and repeated occurrences with a consistent instance', () => {
        const proof = start(['R(a,a)'], '∃xR(x,a)')
        expect(add(proof, '∃xR(x,a)', 'eg', [1], 'a').completed).toBe(true)
        expect(add(proof, '∃xR(x,x)', 'eg', [1], 'a').lines).toHaveLength(2)
        reject(start(['R(a,b)'], '∃xR(x,x)'), '∃xR(x,x)', 'eg', [1], 'a')
        reject(start(['∀yR(y,y)'], '∃x∀yR(x,y)'), '∃x∀yR(x,y)', 'eg', [1], 'y')
    })

    test('generalizes a genuinely arbitrary parameter but not a premise-specific individual', () => {
        let proof = start(['∀xP(x)'], '∀yP(y)')
        proof = add(proof, 'P(a)', 'ui', [1], 'a')
        expect(add(proof, '∀yP(y)', 'ug', [2], 'a').completed).toBe(true)
        const specific = start(['P(a)'], '∀xP(x)')
        expect(reject(specific, '∀xP(x)', 'ug', [1], 'a')).toMatch(/not arbitrary/)
    })

    test('blocks universal generalization under an assumption containing the parameter', () => {
        const proof = add(start([], '∀x(P(x) ⊃ P(x))'), 'P(a)', 'assume')
        expect(reject(proof, '∀xP(x)', 'ug', [1], 'a')).toMatch(/not arbitrary/)
    })

    test('does not generalize only part of an arbitrary parameter occurrence', () => {
        let proof = start(['∀xR(x,x)'], '∀xR(x,a)')
        proof = add(proof, 'R(a,a)', 'ui', [1], 'a')
        expect(reject(proof, '∀xR(x,a)', 'ug', [2], 'a')).toMatch(/remain free/)
    })

    test('supports scoped fresh existential witnesses and discharges only witness-free conclusions', () => {
        let proof = start(['∃xP(x)', '∀x(P(x) ⊃ Q(x))'], '∃xQ(x)')
        proof = add(proof, 'P(a)', 'ei', [1], 'a')
        expect(proof.currentDepth).toBe(1)
        proof = add(proof, 'P(a) ⊃ Q(a)', 'ui', [2], 'a')
        proof = add(proof, 'Q(a)', 'mp', [3, 4])
        expect(reject(proof, '∀xQ(x)', 'ug', [5], 'a')).toMatch(/not arbitrary|witness/)
        expect(reject(proof, 'Q(a)', 'ee', [1, 3, 5])).toMatch(/cannot escape/)
        reject(proof, 'P(a) ⊃ Q(a)', 'cp', [3, 5])
        proof = add(proof, '∃xQ(x)', 'eg', [5], 'a')
        expect(proof.completed).toBe(false)
        proof = add(proof, '∃xQ(x)', 'ee', [1, 3, 6])
        expect(proof.completed).toBe(true)
        expect(proof.scopes).toEqual([])
        reject(proof, 'Q(a)', 'reit', [5])
    })

    test('rejects reuse of a known individual, a witness in the goal, or an incorrect instance', () => {
        reject(start(['∃xP(x)', 'Q(a)'], '∃xP(x)'), 'P(a)', 'ei', [1], 'a')
        reject(start(['∃xP(x)'], 'P(a)'), 'P(a)', 'ei', [1], 'a')
        reject(start(['∃xP(x)'], 'Q'), 'P(b)', 'ei', [1], 'a')
        reject(start(['∃xP(x)'], 'Q'), 'P(a)', 'ui', [1], 'a')
    })

    test.each([
        ['~∀xP(x)', '∃x~P(x)'],
        ['~∃xP(x)', '∀x~P(x)'],
        ['∀xP(x)', '~∃x~P(x)'],
        ['∃xP(x)', '~∀x~P(x)'],
    ])('checks quantifier negation %s ↔ %s', (left, right) => {
        expect(add(start([left], right), right, 'qn', [1]).completed).toBe(true)
        expect(add(start([right], left), left, 'qn', [1]).completed).toBe(true)
    })
})

describe('identity', () => {
    test('introduces reflexive identities without premises', () => {
        expect(add(start([], 'a=a'), 'a=a', 'eq-intro').completed).toBe(true)
        reject(start([], 'a=b'), 'a=b', 'eq-intro')
    })

    test('substitutes either direction, with partial free occurrences allowed', () => {
        expect(add(start(['a=b', 'R(a,a)'], 'R(b,a)'), 'R(b,a)', 'eq-elim', [1, 2]).completed).toBe(true)
        expect(add(start(['a=b', 'P(b)'], 'P(a)'), 'P(a)', 'eq-elim', [2, 1]).completed).toBe(true)
        reject(start(['a=b', 'P(a)'], 'Q(b)'), 'Q(b)', 'eq-elim', [1, 2])
    })

    test('does not replace bound terms or capture a free replacement', () => {
        reject(start(['x=a', '∀xP(x)'], '∀xP(a)'), '∀xP(a)', 'eq-elim', [1, 2])
        reject(start(['a=y', '∀yR(a,y)'], '∀yR(y,y)'), '∀yR(y,y)', 'eq-elim', [1, 2])
    })
})

describe('proof guidance', () => {
    test('every proposed hint is accepted by its named rule', () => {
        const proof = start(['P ⊃ Q', 'P', 'Q ⊃ R', '~R', 'P ∨ S', '~S', 'T · U'], 'Q')
        const hints = getProofHints(proof)
        expect(hints.some((hint) => hint.rule === 'mp' && formulasEqual(parseFormula(hint.formula), parseFormula('Q')))).toBe(true)
        for (const hint of hints) {
            expect(appendProofLine(proof, hint).valid).toBe(true)
        }
        expect(hints.length).toBeLessThanOrEqual(12)
    })

    test('hints do not use closed subproofs', () => {
        let proof = start(['P ⊃ Q'], 'P ⊃ Q')
        proof = add(proof, 'P', 'assume')
        proof = add(proof, 'P ⊃ P', 'cp', [2, 2])
        expect(getProofHints(proof).some((hint) => hint.references.includes(2))).toBe(false)
    })

    test('rule IDs and explanations are unique and usable', () => {
        expect(new Set(proofRules.map((rule) => rule.id)).size).toBe(proofRules.length)
        expect(proofRules.every((rule) => rule.description && Number.isInteger(rule.references))).toBe(true)
    })
})
