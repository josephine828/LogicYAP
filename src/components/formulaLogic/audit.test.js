import { formulasEqual, parseFormula } from './parser'
import { appendProofLine, createProof } from './proof'

// Independent finite-model semantics for soundness auditing, separate from the
// application's propositional evaluator and rule matcher.
function truth(node, values, predicates) {
    const child = (index) => truth(node.children[index], values, predicates)
    switch (node.type) {
        case 'Simple': return Boolean(predicates[node.name])
        case 'Predicate': {
            const offset = node.terms.reduce((index, term) => index * 2 + values[term], 0)
            return Boolean(predicates[node.name] & (1 << offset))
        }
        case 'Equality': return values[node.terms[0]] === values[node.terms[1]]
        case 'Contradiction': return false
        case 'Negation': return !child(0)
        case 'Conjunction': return child(0) && child(1)
        case 'Disjunction': return child(0) || child(1)
        case 'Conditional': return !child(0) || child(1)
        case 'Biconditional': return child(0) === child(1)
        case 'Universal': return [0, 1].every((value) => truth(node.children[0], { ...values, [node.variable]: value }, predicates))
        case 'Existential': return [0, 1].some((value) => truth(node.children[0], { ...values, [node.variable]: value }, predicates))
        default: throw new Error(`Unhandled audited formula type ${node.type}`)
    }
}

function models() {
    const result = []
    for (let P = 0; P < 4; P++) {
        for (let Q = 0; Q < 4; Q++) {
            for (let R = 0; R < 16; R++) {
                for (let assignment = 0; assignment < 16; assignment++) {
                    result.push({
                        predicates: { P, Q, R },
                        values: { a: assignment & 1, x: (assignment >> 1) & 1, y: (assignment >> 2) & 1, z: (assignment >> 3) & 1 },
                    })
                }
            }
        }
    }
    return result
}

const interpretations = models()
const semanticProfile = (node) => interpretations.map(({ values, predicates }) => truth(node, values, predicates) ? '1' : '0').join('')

test('alpha-equivalence never identifies formulas with different finite-model meanings, including shadowed binders', () => {
    const bodies = ['P(x)', 'P(y)', 'P(a)', 'R(x,y)', 'R(y,x)', 'R(x,x)', 'R(y,y)', 'R(a,x)', 'R(x,a)', 'x=y', 'x=a', '(P(x) ⊃ Q(y))', '(P(x) · Q(y))']
    const prefixes = ['', '∀x', '∃x', '∀y', '∃y', '∀x∀x', '∀x∀y', '∀y∀x', '∀y∀y', '∀x∃y', '∃x∀y', '∀a∀x']
    const candidates = prefixes.flatMap((prefix) => bodies.map((body) => parseFormula(`${prefix}(${body})`)))
    const profiles = new Map()
    const profile = (node) => {
        if (!profiles.has(node.content)) profiles.set(node.content, semanticProfile(node))
        return profiles.get(node.content)
    }
    for (let first = 0; first < candidates.length; first++) {
        expect(candidates[first].type).not.toBe('Invalid')
        for (let second = first + 1; second < candidates.length; second++) {
            if (formulasEqual(candidates[first], candidates[second])) {
                expect(profile(candidates[first])).toBe(profile(candidates[second]))
            }
        }
    }
})

test('replacement matching below quantifiers preserves meanings and rejects capture disguised as duplication', () => {
    const validCases = [
        ['∀x(P(x) · P(x))', '∀x P(x)', 'dup'],
        ['∀x(∀y R(y,x) · ∀z R(z,x))', '∀x∀y R(y,x)', 'dup'],
        ['∀x(P(x) ⊃ Q(x))', '∀x(~P(x) ∨ Q(x))', 'ce'],
        ['∀x(~(P(x) ∨ Q(x)))', '∀x(~P(x) · ~Q(x))', 'dem'],
        ['∀x(~∀y R(x,y))', '∀x∃z(~R(x,z))', 'qn'],
        ['~∀x∃y R(x,y)', '∃z~∃y R(z,y)', 'qn'],
    ]
    for (const [source, target, rule] of validCases) {
        const started = createProof([source], target)
        expect(started.valid).toBe(true)
        const result = appendProofLine(started.proof, { formula: target, rule, references: [1] })
        expect(result.valid).toBe(true)
        expect(semanticProfile(parseFormula(source))).toBe(semanticProfile(parseFormula(target)))
    }
    for (const [source, target] of [
        ['∃x(P(x) · P(y))', '∃x P(x)'],
        ['∃x(∀y R(x,y) · ∀x R(x,x))', '∃x∀y R(x,y)'],
        ['∃x(∀y R(y,x) · ∀x R(x,x))', '∃x∀y R(y,x)'],
    ]) {
        const started = createProof([source], target)
        const result = appendProofLine(started.proof, { formula: target, rule: 'dup', references: [1] })
        expect(result.valid).toBe(false)
        expect(semanticProfile(parseFormula(source))).not.toBe(semanticProfile(parseFormula(target)))
    }
})

test('identity replacement below a binder preserves free-variable meaning and rejects bound replacement', () => {
    const started = createProof(['a=y', '∀x R(a,x)'], '∀x R(y,x)')
    const result = appendProofLine(started.proof, { formula: '∀x R(y,x)', rule: 'eq-elim', references: [1, 2] })
    expect(result.valid).toBe(true)
    for (const { values, predicates } of interpretations) {
        if (truth(parseFormula('a=y'), values, predicates) && truth(parseFormula('∀x R(a,x)'), values, predicates)) {
            expect(truth(parseFormula('∀x R(y,x)'), values, predicates)).toBe(true)
        }
    }
    const captured = createProof(['a=x', '∀x R(a,x)'], '∀x R(x,x)')
    expect(appendProofLine(captured.proof, { formula: '∀x R(x,x)', rule: 'eq-elim', references: [1, 2] }).valid).toBe(false)
})
