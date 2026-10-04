import Formula from './Formula'
import BinaryOperator from './BinaryOperator'
import Biconditional from './Biconditional'
import CompoundProposition from './CompoundProposition'
import Conditional from './Conditional'
import Conjunction from './Conjunction'
import Disjunction from './Disjunction'
import Existential from './Existential'
import Negation from './Negation'
import SimpleProposition from './SimpleProposition'
import Universal from './Universal'
import { boundVariables, formatFormula, formulasEqual, freeVariables, parseFormula, substitute } from './parser'

describe('shared formula parser', () => {
    test('negation has narrower scope than binary connectives', () => {
        const ast = parseFormula('~P ∨ Q')
        expect(ast.type).toBe('Disjunction')
        expect(ast.children[0].type).toBe('Negation')
        expect(ast.children[0].children[0].name).toBe('P')
        expect(parseFormula('~(P ∨ Q)').type).toBe('Negation')
    })

    test('respects all connective precedence and right associative implication', () => {
        const ast = parseFormula('P & Q | R -> S -> T <-> U')
        expect(ast.type).toBe('Biconditional')
        expect(ast.children[0].type).toBe('Conditional')
        expect(ast.children[0].children[0].type).toBe('Disjunction')
        expect(ast.children[0].children[0].children[0].type).toBe('Conjunction')
        expect(ast.children[0].children[1].type).toBe('Conditional')
    })

    test.each(['¬P ∧ Q', '!P ^ Q', '~P · Q', '~P & Q'])(
        'normalizes common notation %s', (input) => expect(parseFormula(input).content).toBe('(~P · Q)')
    )

    test.each(['P → Q', 'P -> Q', 'P ⊃ Q'])(
        'accepts implication %s', (input) => expect(parseFormula(input).content).toBe('(P ⊃ Q)')
    )

    test.each(['P ↔ Q', 'P <-> Q', 'P ≡ Q'])(
        'accepts biconditional %s', (input) => expect(parseFormula(input).content).toBe('(P ≡ Q)')
    )

    test('quantifiers bind one unary formula unless the scope is grouped', () => {
        const ast = parseFormula('∀xP(x) ⊃ Q(x)')
        expect(ast.type).toBe('Conditional')
        expect(ast.children[0].type).toBe('Universal')
        expect(freeVariables(ast)).toEqual(['x'])
        expect(freeVariables(parseFormula('∀x(P(x) ⊃ Q(x))'))).toEqual([])
    })

    test('supports explicit and compact predicates, equality, and falsity', () => {
        expect(formulasEqual('Rxy', 'R(x,y)')).toBe(true)
        expect(parseFormula('REL(x,a)').terms).toEqual(['x', 'a'])
        expect(parseFormula('∃x[Px ∧ x=a]').children[0].children[1].type).toBe('Equality')
        expect(parseFormula('⊥').type).toBe('Contradiction')
        expect(parseFormula('p').name).toBe('p')
    })

    test.each([
        '', ' ', '()', '(P', 'P)', '[P)', '(P]', '~', 'P ∧', '∧ P', 'P ∨ ∧ Q',
        '~(P ∨)', '∀x(P ∧)', '∀P(Px)', '∀x', 'P Q', 'PQ', 'P x', 'x y',
        'P()', 'P(x,)', 'P(x y)', 'P(xx)', 'P(X)', 'P(x) ∧ P(x,y)', 'P ∧ Px',
        'P + Q', 'P -> -> Q', 'P(Q)', 'x=', '=x', 'x=y=z', 'P{Q}',
    ])('rejects malformed descendants and syntax: %s', (input) => {
        const ast = parseFormula(input)
        expect(ast.type).toBe('Invalid')
        expect(ast.error).toEqual(expect.any(String))
    })

    test('returns useful errors rather than overflowing on excessive input', () => {
        expect(parseFormula('~'.repeat(200) + 'P')).toMatchObject({ type: 'Invalid', error: expect.stringMatching(/nested too deeply/) })
        expect(parseFormula('P & '.repeat(1100) + 'P')).toMatchObject({ type: 'Invalid', error: expect.stringMatching(/too large/) })
        expect(parseFormula(' '.repeat(10001))).toMatchObject({ type: 'Invalid', error: expect.stringMatching(/10000 characters/) })
        expect(parseFormula(null).type).toBe('Invalid')
    })

    test.each(['~P∨Q', 'P⊃Q⊃R', '∀x∃y(Rxy ⊃ ~P(x))', '∃a(Pa · a=x)', '[P≡Q]∧⊥'])(
        'canonical formatting round trips: %s', (input) => {
            const ast = parseFormula(input)
            expect(ast.type).not.toBe('Invalid')
            expect(formulasEqual(ast, parseFormula(formatFormula(ast)))).toBe(true)
        }
    )
})

describe('binding and substitution', () => {
    test('distinguishes free variables, constants and shadowed binders', () => {
        const ast = parseFormula('∀x(Px ∧ ∃xRxy) ∧ Qza')
        expect(freeVariables(ast)).toEqual(['y', 'z'])
        expect(boundVariables(ast)).toEqual(['x'])
        expect(freeVariables('∀aPa ∧ Qa')).toEqual(['a'])
        expect(freeVariables('Pa')).toEqual([])
        expect(freeVariables('Pa', ['a'])).toEqual(['a'])
    })

    test('alpha equivalence accounts for shadowing and keeps free names distinct', () => {
        expect(formulasEqual('∀x∃yRxy', '∀a∃bRab')).toBe(true)
        expect(formulasEqual('∀x∃xP(x)', '∀a∃bP(b)')).toBe(true)
        expect(formulasEqual('∀x∃yRxy', '∀a∃bRba')).toBe(false)
        expect(formulasEqual('∀xRxy', '∀yRyy')).toBe(false)
        expect(formulasEqual('Pa', 'Pb')).toBe(false)
        expect(formulasEqual('P∧Q', 'Q∧P')).toBe(false)
        expect(formulasEqual('P∧', 'P∧')).toBe(false)
    })

    test('substitution replaces every free occurrence while preserving shadowing and its input', () => {
        const ast = parseFormula('Rxx ∧ ∀xPx ∧ ∃yRxy')
        const original = ast.content
        const result = substitute(ast, 'x', 'a')
        expect(formulasEqual(result, 'Raa ∧ ∀xPx ∧ ∃yRay')).toBe(true)
        expect(ast.content).toBe(original)
        expect(formulasEqual(substitute('Raa', 'a', 'b'), 'Rbb')).toBe(true)
        expect(formulasEqual(substitute('x=x', 'x', 'a'), 'a=a')).toBe(true)
    })

    test('rejects variable capture, including arbitrary lowercase binders', () => {
        expect(() => substitute('∃yRxy', 'x', 'y')).toThrow(/capture/)
        expect(() => substitute('∀aRxa', 'x', 'a')).toThrow(/capture/)
        expect(() => substitute('∀y∃xRxy', 'x', 'y')).not.toThrow()
        expect(() => substitute('∀yPz', 'x', 'y')).not.toThrow()
        expect(() => substitute('Px', 'x', 'name')).toThrow(/single lowercase/)
    })
})

describe('legacy validators use the same complete grammar', () => {
    test.each([
        [Conjunction, 'P∧Q', 'Conjunction'], [Disjunction, 'P∨Q', 'Disjunction'],
        [Conditional, 'P⊃Q', 'Conditional'], [Biconditional, 'P≡Q', 'Biconditional'],
        [CompoundProposition, '∀x(Px⊃Qx)', 'Universal'],
    ])('recognizes the actual outer connective', (validator, proposition, type) => {
        const setMainOperator = jest.fn()
        expect(validator({ proposition, setMainOperator }).isValid()).toBe(true)
        expect(setMainOperator).toHaveBeenCalledWith(type)
        expect(validator({ proposition: 'P' }).isValid()).toBe(false)
    })
    test.each([
        [SimpleProposition, 'PQ'], [Negation, '~(P∨)'],
        [Universal, '∀x(P∧)'], [Existential, '∃x(P∨)'], [BinaryOperator, 'P∧~'],
    ])('rejects malformed formulas and clears stale results', (validator, proposition) => {
        const setMainOperator = jest.fn()
        const setComponents = jest.fn()
        expect(validator({ proposition, setMainOperator, setComponents }).isValid()).toBe(false)
        expect(setMainOperator).toHaveBeenCalledWith('')
        expect(setComponents).toHaveBeenCalledWith([])
    })

    test('Formula reports the whole tree, correct root, and component depth', () => {
        const setMainOperator = jest.fn()
        const setComponents = jest.fn()
        expect(Formula({ proposition: '~P∨Q', setMainOperator, setComponents }).isValid()).toBe(true)
        expect(setMainOperator).toHaveBeenCalledWith('Disjunction')
        expect(setComponents).toHaveBeenCalledWith([
            { content: '(~P ∨ Q)', type: 'Disjunction', depth: 0 },
            { content: '~P', type: 'Negation', depth: 1 },
            { content: 'P', type: 'Simple', depth: 2 },
            { content: 'Q', type: 'Simple', depth: 1 },
        ])
    })
})
