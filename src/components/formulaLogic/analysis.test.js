import { analyzeArgument, analyzeFormula, evaluateFormula } from './analysis'
import { parseFormula } from './parser'

describe('propositional semantics', () => {
    test.each([
        ['P∨~P', 'Tautology'], ['P∧~P', 'Contradiction'], ['P⊃Q', 'Contingency'],
        ['((P⊃Q)∧P)⊃Q', 'Tautology'], ['(P∨Q)≡(Q∨P)', 'Tautology'],
        ['⊥', 'Contradiction'], ['~⊥', 'Tautology'],
    ])('correctly classifies %s', (formula, classification) => {
        expect(analyzeFormula(formula).classification).toBe(classification)
    })

    test('provides matching atom, subformula, and conclusion truth columns', () => {
        const analysis = analyzeFormula('~P ∨ Q')
        expect(analysis.atoms).toEqual(['P', 'Q'])
        expect(analysis.truthTable.columns).toEqual(['P', 'Q', '~P', '(~P ∨ Q)'])
        expect(analysis.truthTable.rows).toEqual([
            { assignment: { P: true, Q: true }, values: [true, true, false, true] },
            { assignment: { P: true, Q: false }, values: [true, false, false, false] },
            { assignment: { P: false, Q: true }, values: [false, true, true, true] },
            { assignment: { P: false, Q: false }, values: [false, false, true, true] },
        ])
        expect(analysis.components.map((component) => component.depth)).toEqual([0, 1, 2, 1])
    })

    test('evaluates implication and biconditional correctly on all assignments', () => {
        const assignments = [
            [{ P: true, Q: true }, true, true], [{ P: true, Q: false }, false, false],
            [{ P: false, Q: true }, true, false], [{ P: false, Q: false }, true, true],
        ]
        assignments.forEach(([assignment, conditional, biconditional]) => {
            expect(evaluateFormula(parseFormula('P⊃Q'), assignment)).toBe(conditional)
            expect(evaluateFormula(parseFormula('P≡Q'), assignment)).toBe(biconditional)
        })
        expect(() => evaluateFormula(parseFormula('P∨Q'), { P: true })).toThrow(/Missing truth value/)
    })

    test('does not assign Boolean semantics to quantified formulas, predicates, or equality', () => {
        ['∀x(Px⊃Qx)', 'Px', 'a=b'].forEach((input) => {
            const analysis = analyzeFormula(input)
            expect(analysis).toMatchObject({ valid: true, isFirstOrder: true, classification: null, truthTable: null })
            expect(analysis.limitMessage).toMatch(/domain and interpretation/)
            expect(() => evaluateFormula(parseFormula(input), {})).toThrow(/first-order/)
        })
        expect(analyzeFormula('∀xRxy')).toMatchObject({ freeVariables: ['y'], boundVariables: ['x'] })
    })

    test('bounds truth tables without losing syntactic analysis', () => {
        expect(analyzeFormula('A∨B∨C∨D∨E∨F∨G∨H').truthTable.rows).toHaveLength(256)
        const analysis = analyzeFormula('A∨B∨C∨D∨E∨F∨G∨H∨I')
        expect(analysis.valid).toBe(true)
        expect(analysis.atoms).toHaveLength(9)
        expect(analysis.truthTable).toBeNull()
        expect(analysis.classification).toBeNull()
        expect(analysis.limitMessage).toMatch(/limited to 8/)
    })

    test('limits intermediate columns for large formulas while retaining exact classification', () => {
        const analysis = analyzeFormula(Array(40).fill('(P∨~P)').join('∧'))
        expect(analysis.classification).toBe('Tautology')
        expect(analysis.truthTable.columns).toHaveLength(2)
        expect(analysis.truthTable.columns[0]).toBe('P')
        expect(analysis.truthTable.columns[1]).toBe(analysis.ast.content)
        expect(analysis.truthTable.rows.map((row) => row.values)).toEqual([[true, true], [false, true]])
        expect(analysis.limitMessage).toMatch(/Intermediate subformula columns are omitted/)
    })

    test('invalid syntax returns fully empty results', () => {
        expect(analyzeFormula('P ∧')).toMatchObject({
            valid: false, error: expect.any(String), components: [], atoms: [],
            classification: null, truthTable: null, freeVariables: [], boundVariables: [],
            isFirstOrder: false,
        })
        expect(analyzeFormula({ type: 'Invalid', content: 'P', error: 'Marked invalid.' })).toMatchObject({ valid: false, error: 'Marked invalid.' })
        expect(analyzeFormula({ type: 'Conjunction', children: [parseFormula('P')] }).valid).toBe(false)
        expect(analyzeFormula({ type: 'Predicate', name: 'P', terms: ['invalid'] }).valid).toBe(false)
    })

    test('analyzes parsed trees without rejecting added canonical grouping', () => {
        const formula = parseFormula(Array(150).fill('P').join('∧'))
        expect(formula.type).toBe('Conjunction')
        expect(analyzeFormula(formula)).toMatchObject({ valid: true, classification: 'Contingency' })
        expect(analyzeArgument([formula], parseFormula('P')).status).toBe('valid')
    })
})

describe('argument analysis', () => {
    test('checks entailment from the conjunction of every premise', () => {
        expect(analyzeArgument(['P⊃Q', 'P'], 'Q').status).toBe('valid')
        expect(analyzeArgument(['P∨Q', '~P'], 'Q').status).toBe('valid')
        expect(analyzeArgument(['P', '~P'], 'Q').status).toBe('valid')
        expect(analyzeArgument([], 'P∨~P').status).toBe('valid')
    })

    test('returns actual countermodels for invalid inferences', () => {
        const result = analyzeArgument(['P⊃Q', 'Q'], 'P')
        expect(result).toMatchObject({ status: 'invalid', counterexample: { P: false, Q: true } })
        expect(analyzeArgument(['P⊃Q', '~P'], '~Q').status).toBe('invalid')
        expect(analyzeArgument([], 'P').counterexample).toEqual({ P: false })
    })

    test('reports unsupported and bounded problems without pretending to decide them', () => {
        expect(analyzeArgument(['∀xPx'], 'Pa').status).toBe('unsupported')
        expect(analyzeArgument(['P(x)'], 'P(x,y)')).toMatchObject({ status: 'unsupported', message: expect.stringMatching(/arity/) })
        expect(analyzeArgument(['P'], 'P(x)')).toMatchObject({ status: 'unsupported', message: expect.stringMatching(/arity/) })
        expect(analyzeArgument(['P∧'], 'Q').status).toBe('unsupported')
        expect(analyzeArgument(['A∨B∨C∨D∨E∨F∨G∨H∨I'], 'A').status).toBe('limited')
    })
})
