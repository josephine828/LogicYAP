import { parseFormula, formatFormula, formulasEqual, substitute } from './parser'

const rule = (id, name, abbreviation, kind, references, description, requiresTerm = false) => ({
    id, name, abbreviation, kind, references, description, requiresTerm,
})

// These are rules of classical first-order logic with a nonempty domain.
// The restrictions on quantifiers follow forall x: Calgary, chapter 36:
// https://forallx.openlogicproject.org/html/Ch36.html
export const proofRules = [
    rule('mp', 'Modus Ponens', 'M.P.', 'inference', 2, 'Cite A ⊃ B and A to infer B. Entire formulas must match.'),
    rule('mt', 'Modus Tollens', 'M.T.', 'inference', 2, 'Cite A ⊃ B and ~B to infer ~A.'),
    rule('hs', 'Hypothetical Syllogism', 'H.S.', 'inference', 2, 'Cite A ⊃ B and B ⊃ C to infer A ⊃ C.'),
    rule('simp', 'Simplification', 'Simp.', 'inference', 1, 'Cite A · B to infer either A or B.'),
    rule('conj', 'Conjunction', 'Conj.', 'inference', 2, 'Cite A and B to infer A · B.'),
    rule('dilemma', 'Dilemma', 'Dil.', 'inference', 3, 'Cite A ⊃ B, C ⊃ D, and A ∨ C to infer B ∨ D.'),
    rule('ds', 'Disjunctive Syllogism', 'D.S.', 'inference', 2, 'Cite A ∨ B and the negation of one disjunct to infer the other.'),
    rule('add', 'Addition', 'Add.', 'inference', 1, 'Cite A to infer A ∨ B or B ∨ A, for any formula B.'),
    rule('dn', 'Double Negation', 'D.N.', 'replacement', 1, 'Replace A with ~~A, or reverse this replacement.'),
    rule('dup', 'Duplication', 'Dup.', 'replacement', 1, 'Replace A with A · A or A ∨ A, or reverse this replacement.'),
    rule('comm', 'Commutation', 'Comm.', 'replacement', 1, 'Swap the two sides of one conjunction or disjunction.'),
    rule('assoc', 'Association', 'Assoc.', 'replacement', 1, 'Regroup one conjunction or disjunction: (A ∨ B) ∨ C ↔ A ∨ (B ∨ C), likewise for ·.'),
    rule('contrap', 'Contraposition', 'Contrap.', 'replacement', 1, 'Replace A ⊃ B with ~B ⊃ ~A, or reverse this replacement.'),
    rule('dem', "DeMorgan's", 'DeM.', 'replacement', 1, 'Replace ~(A · B) with ~A ∨ ~B, or ~(A ∨ B) with ~A · ~B, in either direction.'),
    rule('be', 'Biconditional Exchange', 'B.E.', 'replacement', 1, 'Replace A ≡ B with (A ⊃ B) · (B ⊃ A), in either direction.'),
    rule('ce', 'Conditional Exchange', 'C.E.', 'replacement', 1, 'Replace A ⊃ B with ~A ∨ B, in either direction.'),
    rule('dist', 'Distribution', 'Dist.', 'replacement', 1, 'Distribute · over ∨ or ∨ over ·, in either direction. The repeated formula must match.'),
    rule('exp', 'Exportation', 'Exp.', 'replacement', 1, 'Replace (A · B) ⊃ C with A ⊃ (B ⊃ C), in either direction.'),
    rule('qn', 'Quantifier Negation', 'Q.N.', 'replacement', 1, 'Exchange ~∀xA with ∃x~A or ~∃xA with ∀x~A; equivalent dual forms also work.'),
    rule('reit', 'Reiteration', 'Reit.', 'inference', 1, 'Repeat an accessible line exactly.'),
    rule('contradiction', 'Contradiction', '⊥I', 'inference', 2, 'Cite A and ~A to infer ⊥.'),
    rule('explosion', 'Explosion', '⊥E', 'inference', 1, 'Cite ⊥ to infer any formula.'),
    rule('bi', 'Biconditional Introduction', '≡I', 'inference', 2, 'Cite A ⊃ B and B ⊃ A to infer A ≡ B.'),
    rule('iff-elim', 'Biconditional Elimination', '≡E', 'inference', 2, 'Cite A ≡ B and either A or B to infer the other.'),
    rule('cases', 'Proof by Cases', 'Cases', 'inference', 3, 'Cite A ∨ B, A ⊃ C, and B ⊃ C to infer C.'),
    rule('assume', 'Assumption', 'Ass.', 'subproof', 0, 'Open a subproof. Its lines remain local until discharged with CP, NI, or IP.'),
    rule('cp', 'Conditional Proof', 'C.P.', 'subproof', 2, 'Cite the current assumption and the last line of its subproof to infer assumption ⊃ last line and close that subproof.'),
    rule('ni', 'Negation Introduction', '~I', 'subproof', 2, 'Cite the current assumption and its last line ⊥ to infer the negation of that assumption and close the subproof.'),
    rule('ip', 'Indirect Proof', 'I.P.', 'subproof', 2, 'Assume ~A, derive ⊥, then cite the assumption and last line to infer A and close the subproof.'),
    rule('ui', 'Universal Instantiation', 'U.I.', 'quantifier', 1, 'Cite ∀xA and enter a one-letter term to infer A with every free x replaced by that term, avoiding capture.', true),
    rule('eg', 'Existential Generalization', 'E.G.', 'quantifier', 1, 'From an instance A(t), infer ∃xA(x). Enter the instance term; replacement must avoid variable capture.', true),
    rule('ug', 'Universal Generalization', 'U.G.', 'quantifier', 1, 'From A(t), infer ∀xA(x) only if t is arbitrary: absent from all premises, open assumptions, and the free terms of the conclusion.', true),
    rule('ei', 'Existential Instantiation', 'E.I.', 'quantifier', 1, 'Cite ∃xA and enter a fresh one-letter witness to open a local assumption A(witness). Close it with Existential Elimination; the witness cannot escape.', true),
    rule('ee', 'Existential Elimination', 'E.E.', 'quantifier', 3, 'Cite, in order, the existential source, current witness assumption, and last subproof line. Repeat that last formula outside the scope; it must not contain the witness freely.'),
    rule('eq-intro', 'Identity Introduction', '=I', 'inference', 0, 'Infer t = t for any one-letter term t.'),
    rule('eq-elim', 'Identity Elimination', '=E', 'inference', 2, 'Cite t = u and a formula to replace one or more free occurrences of t by u, or u by t, avoiding capture.'),
]

const byId = new Map(proofRules.map((entry) => [entry.id, entry]))
const meta = (name) => ({ type: 'Meta', name })
const node = (type, ...children) => ({ type, children })
const p = meta('p'), q = meta('q'), r = meta('r'), s = meta('s')
const neg = (a) => node('Negation', a)
const and = (a, b) => node('Conjunction', a, b)
const or = (a, b) => node('Disjunction', a, b)
const imp = (a, b) => node('Conditional', a, b)
const iff = (a, b) => node('Biconditional', a, b)
const bottom = node('Contradiction')

const inferenceSchemas = {
    mp: [[[imp(p, q), p], q]],
    mt: [[[imp(p, q), neg(q)], neg(p)]],
    hs: [[[imp(p, q), imp(q, r)], imp(p, r)]],
    simp: [[[and(p, q)], p], [[and(p, q)], q]],
    conj: [[[p, q], and(p, q)]],
    dilemma: [[[imp(p, q), imp(r, s), or(p, r)], or(q, s)]],
    ds: [[[or(p, q), neg(p)], q], [[or(p, q), neg(q)], p]],
    add: [[[p], or(p, q)], [[p], or(q, p)]],
    reit: [[[p], p]],
    contradiction: [[[p, neg(p)], bottom]],
    explosion: [[[bottom], p]],
    bi: [[[imp(p, q), imp(q, p)], iff(p, q)]],
    'iff-elim': [[[iff(p, q), p], q], [[iff(p, q), q], p]],
    cases: [[[or(p, q), imp(p, r), imp(q, r)], r]],
}

const replacementSchemas = {
    dn: [[p, neg(neg(p))]],
    dup: [[p, and(p, p)], [p, or(p, p)]],
    comm: [[and(p, q), and(q, p)], [or(p, q), or(q, p)]],
    assoc: [[and(and(p, q), r), and(p, and(q, r))], [or(or(p, q), r), or(p, or(q, r))]],
    contrap: [[imp(p, q), imp(neg(q), neg(p))]],
    dem: [[neg(and(p, q)), or(neg(p), neg(q))], [neg(or(p, q)), and(neg(p), neg(q))]],
    be: [[iff(p, q), and(imp(p, q), imp(q, p))]],
    ce: [[imp(p, q), or(neg(p), q)]],
    dist: [[and(p, or(q, r)), or(and(p, q), and(p, r))], [or(p, and(q, r)), and(or(p, q), or(p, r))]],
    exp: [[imp(and(p, q), r), imp(p, imp(q, r))]],
}

function match(pattern, formula, bindings) {
    if (!formula) return false
    if (pattern.type === 'Meta') {
        if (bindings.has(pattern.name)) return formulasEqual(bindings.get(pattern.name), formula)
        bindings.set(pattern.name, formula)
        return true
    }
    if (pattern.type !== formula.type) return false
    const expected = pattern.children || []
    const actual = formula.children || []
    return expected.length === actual.length && expected.every((child, index) => match(child, actual[index], bindings))
}

function permutations(items) {
    if (items.length < 2) return [items]
    return items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest]))
}

function inferenceMatches(id, cited, conclusion) {
    return (inferenceSchemas[id] || []).some(([premises, result]) =>
        permutations(cited).some((ordered) => {
            const bindings = new Map()
            return premises.every((pattern, index) => match(pattern, ordered[index], bindings)) && match(result, conclusion, bindings)
        }))
}

function quantified(type, variable, body) {
    return { type, variable, children: [body] }
}

function quantifierNegationMatches(source, target) {
    const candidates = []
    if (source.type === 'Universal' || source.type === 'Existential') {
        const dual = source.type === 'Universal' ? 'Existential' : 'Universal'
        const body = source.children[0]
        candidates.push(neg(quantified(dual, source.variable, neg(body))))
        if (body.type === 'Negation') candidates.push(neg(quantified(dual, source.variable, body.children[0])))
    } else if (source.type === 'Negation') {
        const child = source.children[0]
        if (child.type === 'Universal' || child.type === 'Existential') {
            const dual = child.type === 'Universal' ? 'Existential' : 'Universal'
            const body = child.children[0]
            candidates.push(quantified(dual, child.variable, neg(body)))
            if (body.type === 'Negation') candidates.push(quantified(dual, child.variable, body.children[0]))
        }
    }
    return candidates.some((candidate) => formulasEqual(candidate, target))
}

function sameHeader(a, b) {
    return a.type === b.type && a.name === b.name && a.variable === b.variable &&
        JSON.stringify(a.terms || []) === JSON.stringify(b.terms || [])
}

// A replacement changes exactly one subformula; everything around it is preserved.
// Matching both sides with shared bindings enforces repeated metavariables.
function replacementMatches(id, source, target) {
    if (id === 'qn' && quantifierNegationMatches(source, target)) return true
    if ((replacementSchemas[id] || []).some(([left, right]) => {
        const forward = new Map(), backward = new Map()
        return (match(left, source, forward) && match(right, target, forward)) ||
            (match(right, source, backward) && match(left, target, backward))
    })) return true
    if (!sameHeader(source, target)) return false
    const before = source.children || [], after = target.children || []
    if (before.length !== after.length) return false
    const changed = before.map((child, index) => !formulasEqual(child, after[index]))
    if (changed.filter(Boolean).length !== 1) return false
    const index = changed.indexOf(true)
    return replacementMatches(id, before[index], after[index])
}

function termSymbols(formula, bound = new Set(), includeBound = false) {
    const result = new Set()
    const visit = (current, currentBound) => {
        if (includeBound && current.variable) result.add(current.variable)
        for (const term of current.terms || []) {
            if (includeBound || !currentBound.has(term)) result.add(term)
        }
        const nextBound = new Set(currentBound)
        if (current.variable) nextBound.add(current.variable)
        for (const child of current.children || []) visit(child, nextBound)
    }
    visit(formula, bound)
    return [...result]
}

function isAccessible(line, scopes) {
    const path = line.scopePath || []
    return path.length <= scopes.length && path.every((id, index) => scopes[index].id === id)
}

function readReferences(value) {
    if (value === undefined || value === null || value === '') return []
    if (Array.isArray(value)) {
        if (!value.every((number) => Number.isInteger(number) && number > 0)) throw new Error('References must be positive whole line numbers.')
        return [...value]
    }
    if (typeof value !== 'string' || !/^\s*\d+(?:[\s,]+\d+)*\s*$/.test(value)) {
        throw new Error('Enter line numbers separated by commas or spaces, such as 1, 2.')
    }
    const numbers = value.trim().split(/[\s,]+/).map(Number)
    if (numbers.some((number) => !Number.isSafeInteger(number) || number < 1)) throw new Error('References must be positive whole line numbers.')
    return numbers
}

const invalid = (error, proof = null) => ({ valid: false, error, proof })

function arityError(formulas) {
    const arities = new Map()
    const visit = (formula) => {
        if (formula.type === 'Predicate' || formula.type === 'Simple') {
            const arity = (formula.terms || []).length
            const name = formula.name || formula.content
            if (arities.has(name) && arities.get(name) !== arity) {
                return `Symbol ${name} must have the same arity throughout the proof (found ${arities.get(name)} and ${arity} arguments).`
            }
            arities.set(name, arity)
        }
        for (const child of formula.children || []) {
            const error = visit(child)
            if (error) return error
        }
        return null
    }
    for (const formula of formulas) {
        const error = visit(formula)
        if (error) return error
    }
    return null
}

export function createProof(premises, goalText) {
    const entries = Array.isArray(premises) ? premises : String(premises || '').split(/\r?\n/)
    const parsedPremises = []
    for (const [index, entry] of entries.entries()) {
        if (typeof entry !== 'string') return invalid(`Premise ${index + 1} must be a formula.`)
        if (!entry.trim()) continue
        const formula = parseFormula(entry)
        if (formula.type === 'Invalid') return invalid(`Premise ${index + 1}: ${formula.error || 'Invalid formula.'}`)
        parsedPremises.push(formula)
    }
    const goal = parseFormula(typeof goalText === 'string' ? goalText : '')
    if (goal.type === 'Invalid') return invalid(`Conclusion: ${goal.error || 'Enter a valid conclusion.'}`)
    const vocabularyError = arityError([...parsedPremises, goal])
    if (vocabularyError) return invalid(vocabularyError)
    const lines = parsedPremises.map((formula, index) => ({
        number: index + 1, formula, rule: 'premise', references: [], depth: 0, scopePath: [],
    }))
    const proof = { lines, goal, scopes: [], currentDepth: 0, completed: lines.some((line) => formulasEqual(line.formula, goal)) }
    return { valid: true, error: null, proof }
}

function checkInstance(quantifier, instance, term) {
    try {
        return formulasEqual(substitute(quantifier.children[0], quantifier.variable, term), instance)
    } catch (error) {
        return false
    }
}

function chooseInstanceTerm(quantifier, instance, supplied) {
    const candidates = supplied ? [supplied] : [...new Set([...termSymbols(instance), quantifier.variable, 'a'])]
    return candidates.find((term) => checkInstance(quantifier, instance, term))
}

function identityMatches(identity, source, target) {
    if (identity.type !== 'Equality') return false
    const replace = (from, to) => {
        let changes = 0
        const visit = (before, after, bound) => {
            if (before.type !== after.type || before.name !== after.name || before.variable !== after.variable) return false
            const leftTerms = before.terms || [], rightTerms = after.terms || []
            if (leftTerms.length !== rightTerms.length) return false
            for (let index = 0; index < leftTerms.length; index++) {
                if (leftTerms[index] === rightTerms[index]) continue
                if (leftTerms[index] !== from || rightTerms[index] !== to || bound.has(from) || bound.has(to)) return false
                changes++
            }
            const leftChildren = before.children || [], rightChildren = after.children || []
            if (leftChildren.length !== rightChildren.length) return false
            const nextBound = new Set(bound)
            if (before.variable) nextBound.add(before.variable)
            return leftChildren.every((child, index) => visit(child, rightChildren[index], nextBound))
        }
        return visit(source, target, new Set()) && changes > 0
    }
    return replace(identity.terms[0], identity.terms[1]) || replace(identity.terms[1], identity.terms[0])
}

export function appendProofLine(proof, input = {}) {
    if (!proof || !Array.isArray(proof.lines) || !Array.isArray(proof.scopes)) return invalid('Start a proof before adding a line.', proof)
    const selected = byId.get(input.rule)
    if (!selected) return invalid('Choose a recognized proof rule.', proof)
    const formula = parseFormula(typeof input.formula === 'string' ? input.formula : '')
    if (formula.type === 'Invalid') return invalid(formula.error || 'Enter a valid formula.', proof)
    const vocabularyError = arityError([...proof.lines.map((line) => line.formula), proof.goal, formula])
    if (vocabularyError) return invalid(vocabularyError, proof)
    let references
    try { references = readReferences(input.references) } catch (error) { return invalid(error.message, proof) }
    if (references.length !== selected.references) {
        return invalid(`${selected.name} requires ${selected.references} cited line${selected.references === 1 ? '' : 's'}.`, proof)
    }
    const citedLines = []
    for (const number of references) {
        const line = proof.lines[number - 1]
        if (!line || line.number !== number) return invalid(`Line ${number} does not exist. Cite an earlier line.`, proof)
        if (!isAccessible(line, proof.scopes)) return invalid(`Line ${number} belongs to a closed subproof and is not accessible.`, proof)
        citedLines.push(line)
    }
    const cited = citedLines.map((line) => line.formula)
    const term = typeof input.term === 'string' ? input.term.trim() : ''
    if (term && !/^[a-z]$/.test(term)) return invalid('Terms must be single lowercase letters (a–z); function terms are not supported.', proof)
    const scopes = proof.scopes.map((scope) => ({ ...scope }))
    let inferredTerm = term
    let closeScope = false
    let openScope = null
    let checked = false

    if (inferenceSchemas[selected.id]) checked = inferenceMatches(selected.id, cited, formula)
    else if (replacementSchemas[selected.id] || selected.id === 'qn') checked = replacementMatches(selected.id, cited[0], formula)
    else if (selected.id === 'eq-intro') checked = formula.type === 'Equality' && formula.terms[0] === formula.terms[1]
    else if (selected.id === 'eq-elim') checked = identityMatches(cited[0], cited[1], formula) || identityMatches(cited[1], cited[0], formula)
    else if (selected.id === 'assume') {
        checked = true
        openScope = { kind: 'assumption' }
    } else if (['cp', 'ni', 'ip'].includes(selected.id)) {
        const current = scopes[scopes.length - 1]
        if (!current || current.kind !== 'assumption') return invalid('This rule closes the current ordinary assumption. A witness scope must be closed with Existential Elimination.', proof)
        if (references[0] !== current.id || references[1] !== proof.lines.length) return invalid('Cite the current assumption first and the last line of its subproof second.', proof)
        const assumption = cited[0], last = cited[1]
        if (selected.id === 'cp') checked = formulasEqual(formula, imp(assumption, last))
        if (selected.id === 'ni') checked = last.type === 'Contradiction' && formulasEqual(formula, neg(assumption))
        if (selected.id === 'ip') checked = last.type === 'Contradiction' && assumption.type === 'Negation' && formulasEqual(formula, assumption.children[0])
        closeScope = checked
    } else if (selected.id === 'ui') {
        if (!term) return invalid('Enter the one-letter term to substitute for the universal variable.', proof)
        checked = cited[0].type === 'Universal' && checkInstance(cited[0], formula, term)
    } else if (selected.id === 'eg' || selected.id === 'ug') {
        const type = selected.id === 'eg' ? 'Existential' : 'Universal'
        if (formula.type === type) inferredTerm = chooseInstanceTerm(formula, cited[0], term)
        checked = formula.type === type && Boolean(inferredTerm)
        if (checked && selected.id === 'ug') {
            if (termSymbols(formula).includes(inferredTerm)) return invalid('The arbitrary term must not remain free in the universally quantified conclusion.', proof)
            const assumptions = proof.lines.filter((line) => line.rule === 'premise' || scopes.some((scope) => scope.id === line.number))
            if (assumptions.some((line) => termSymbols(line.formula).includes(inferredTerm))) {
                return invalid(`Term ${inferredTerm} occurs freely in a premise or open assumption, so it is not arbitrary and cannot be universally generalized.`, proof)
            }
            if (scopes.some((scope) => scope.witness === inferredTerm)) return invalid('An existential witness cannot be universally generalized.', proof)
        }
    } else if (selected.id === 'ei') {
        if (!term) return invalid('Enter a fresh one-letter witness for the existential subproof.', proof)
        if (proof.lines.some((line) => termSymbols(line.formula, new Set(), true).includes(term)) || termSymbols(proof.goal, new Set(), true).includes(term)) {
            return invalid(`Witness ${term} is not fresh. Choose a term absent from the proof and its conclusion.`, proof)
        }
        checked = cited[0].type === 'Existential' && checkInstance(cited[0], formula, term)
        if (checked) openScope = { kind: 'witness', witness: term, source: references[0] }
    } else if (selected.id === 'ee') {
        const current = scopes[scopes.length - 1]
        if (!current || current.kind !== 'witness') return invalid('Existential Elimination closes the current existential witness subproof.', proof)
        if (references[0] !== current.source || references[1] !== current.id || references[2] !== proof.lines.length) {
            return invalid('Cite the existential source, the current witness assumption, and the last line, in that order.', proof)
        }
        if (termSymbols(formula).includes(current.witness)) return invalid('The witness occurs freely in the conclusion and cannot escape its subproof.', proof)
        checked = formulasEqual(formula, cited[2])
        closeScope = checked
    }

    if (!checked) return invalid(`The proposed formula does not follow by ${selected.name} from those lines. ${selected.description}`, proof)
    if (closeScope) scopes.pop()
    const number = proof.lines.length + 1
    if (openScope) scopes.push({ ...openScope, id: number })
    const line = {
        number, formula, rule: selected.id, references, depth: scopes.length,
        scopePath: scopes.map((scope) => scope.id),
        ...(inferredTerm ? { term: inferredTerm } : {}),
    }
    const lines = [...proof.lines, line]
    const next = {
        ...proof, lines, scopes, currentDepth: scopes.length,
        completed: scopes.length === 0 && lines.some((entry) => entry.depth === 0 && formulasEqual(entry.formula, proof.goal)),
    }
    return { valid: true, error: null, proof: next }
}

function materialize(pattern, bindings) {
    if (pattern.type === 'Meta') return bindings.get(pattern.name)
    const children = (pattern.children || []).map((child) => materialize(child, bindings))
    if (children.some((child) => !child)) return null
    const result = { type: pattern.type, children }
    return { ...result, content: formatFormula(result) }
}

export function getProofHints(proof, limit = 12) {
    if (!proof || !Array.isArray(proof.lines) || !Array.isArray(proof.scopes)) return []
    const accessible = proof.lines.filter((line) => isAccessible(line, proof.scopes))
    // Bound pair search, but retain early premises as well as recent deductions.
    const pool = accessible.length > 60 ? [...accessible.slice(0, 20), ...accessible.slice(-40)] : accessible
    const suggestions = []
    const addSuggestion = (formula, id, refs) => {
        if (!formula || accessible.some((line) => formulasEqual(line.formula, formula)) || suggestions.some((hint) => formulasEqual(hint.ast, formula))) return
        suggestions.push({ ast: formula, formula: formatFormula(formula), rule: id, references: refs, explanation: byId.get(id).description })
    }
    for (const id of ['simp', 'mp', 'mt', 'hs', 'ds', 'iff-elim', 'contradiction']) {
        for (const [patterns, result] of inferenceSchemas[id]) {
            const attempt = (ordered) => {
                const bindings = new Map()
                if (patterns.every((pattern, index) => match(pattern, ordered[index].formula, bindings))) {
                    addSuggestion(materialize(result, bindings), id, ordered.map((line) => line.number))
                }
            }
            if (patterns.length === 1) pool.forEach((line) => attempt([line]))
            else pool.forEach((first) => pool.forEach((second) => attempt([first, second])))
        }
    }
    const contradiction = accessible.find((line) => line.formula.type === 'Contradiction')
    if (contradiction) addSuggestion(proof.goal, 'explosion', [contradiction.number])
    return suggestions.sort((a, b) => Number(formulasEqual(b.ast, proof.goal)) - Number(formulasEqual(a.ast, proof.goal)))
        .slice(0, Math.max(0, Math.min(30, limit))).map(({ ast, ...hint }) => hint)
}

export const hints = getProofHints
