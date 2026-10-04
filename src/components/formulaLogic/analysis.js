import { boundVariables, formatFormula, freeVariables, parseFormula } from './parser'

export const MAX_TRUTH_TABLE_ATOMS = 8
export const MAX_TRUTH_TABLE_COLUMNS = 24
const FIRST_ORDER_TYPES = new Set(['Predicate', 'Equality', 'Universal', 'Existential'])
const BINARY_TYPES = new Set(['Conjunction', 'Disjunction', 'Conditional', 'Biconditional'])

function walk(node, visit, depth = 0) {
    visit(node, depth)
    ;(node.children || []).forEach((child) => walk(child, visit, depth + 1))
}
function normalize(value) {
    if (typeof value === 'string') return parseFormula(value)
    if (value && value.type === 'Invalid') return value
    // Canonical grouping can be deeper than the user's source text. Validate
    // trees structurally rather than reparsing them with source nesting limits.
    try {
        let size = 0
        const ancestors = new Set()
        const arities = new Map()
        const visit = (source, depth) => {
            if (!source || typeof source !== 'object') throw new Error('Expected a formula syntax tree.')
            if (ancestors.has(source)) throw new Error('A formula syntax tree cannot contain a cycle.')
            if (++size > 2048 || depth > 1024) throw new Error('This formula syntax tree is too large.')
            const { type } = source
            const expectedChildren = BINARY_TYPES.has(type) ? 2 : ['Negation', 'Universal', 'Existential'].includes(type) ? 1 : 0
            const childSources = source.children || []
            if (!Array.isArray(childSources) || childSources.length !== expectedChildren) throw new Error(`Incorrect number of children for ${type}.`)
            const node = { type }
            if (type === 'Simple') {
                node.name = source.name || source.content
                if (!/^[A-Za-z]$/.test(node.name)) throw new Error('A propositional atom must be a single letter.')
            } else if (type === 'Predicate' || type === 'Equality') {
                if (!Array.isArray(source.terms) || source.terms.length < 1 || source.terms.some((term) => typeof term !== 'string' || !/^[a-z]$/.test(term))) {
                    throw new Error('Terms must be single lowercase letters.')
                }
                size += source.terms.length
                if (size > 2048) throw new Error('This formula syntax tree is too large.')
                node.terms = [...source.terms]
                if (type === 'Equality') {
                    if (node.terms.length !== 2) throw new Error('Equality requires exactly two terms.')
                } else {
                    if (typeof source.name !== 'string' || source.name.length > 2048 || !/^[A-Z]+$/.test(source.name)) throw new Error('Predicate names must use uppercase letters.')
                    node.name = source.name
                }
            } else if (type === 'Universal' || type === 'Existential') {
                if (typeof source.variable !== 'string' || !/^[a-z]$/.test(source.variable)) throw new Error('A quantifier must bind a single lowercase variable.')
                node.variable = source.variable
            } else if (type !== 'Contradiction' && type !== 'Negation' && !BINARY_TYPES.has(type)) {
                throw new Error(`Unknown or invalid formula type: ${type}.`)
            }
            if (type === 'Simple' || type === 'Predicate') {
                const arity = (node.terms || []).length
                if (arities.has(node.name) && arities.get(node.name) !== arity) throw new Error(`Predicate ${node.name} has inconsistent arity.`)
                arities.set(node.name, arity)
            }
            ancestors.add(source)
            if (expectedChildren) node.children = childSources.map((child) => visit(child, depth + 1))
            ancestors.delete(source)
            node.content = formatFormula(node)
            return node
        }
        return visit(value, 0)
    } catch (error) {
        return { type: 'Invalid', content: value && typeof value.content === 'string' ? value.content : '', error: error.message }
    }
}
function inspect(ast) {
    const components = []
    const atoms = new Set()
    let isFirstOrder = false
    walk(ast, (node, depth) => {
        components.push({ content: node.content, type: node.type, depth })
        if (node.type === 'Simple' || node.type === 'Predicate' || node.type === 'Equality') atoms.add(node.content)
        if (FIRST_ORDER_TYPES.has(node.type)) isFirstOrder = true
    })
    return { components, atoms: [...atoms].sort(), isFirstOrder }
}

export function evaluateFormula(ast, assignment) {
    if (typeof ast === 'string') ast = parseFormula(ast)
    if (!ast || ast.type === 'Invalid') throw new Error('Cannot evaluate an invalid formula.')
    switch (ast.type) {
        case 'Simple': {
            const name = ast.name || ast.content
            if (!assignment || typeof assignment[name] !== 'boolean') throw new Error(`Missing truth value for ${name}.`)
            return assignment[name]
        }
        case 'Contradiction': return false
        case 'Negation': return !evaluateFormula(ast.children[0], assignment)
        case 'Conjunction': {
            const left = evaluateFormula(ast.children[0], assignment)
            const right = evaluateFormula(ast.children[1], assignment)
            return left && right
        }
        case 'Disjunction': {
            const left = evaluateFormula(ast.children[0], assignment)
            const right = evaluateFormula(ast.children[1], assignment)
            return left || right
        }
        case 'Conditional': {
            const left = evaluateFormula(ast.children[0], assignment)
            const right = evaluateFormula(ast.children[1], assignment)
            return !left || right
        }
        case 'Biconditional': return evaluateFormula(ast.children[0], assignment) === evaluateFormula(ast.children[1], assignment)
        default: throw new Error('Truth evaluation requires a propositional formula; first-order formulas need a domain and interpretation.')
    }
}
function assignments(atoms) {
    return Array.from({ length: 2 ** atoms.length }, (_, row) => Object.fromEntries(
        atoms.map((atom, index) => [atom, !(row & (2 ** (atoms.length - index - 1)))])
    ))
}
function truthColumns(ast, atoms) {
    const columns = []
    const seen = new Set()
    let limited = false
    const add = (node) => {
        const key = node.content || formatFormula(node)
        if (!seen.has(key)) {
            if (columns.length === MAX_TRUTH_TABLE_COLUMNS) { limited = true; return }
            columns.push(node)
            seen.add(key)
        }
    }
    atoms.forEach((name) => add(parseFormula(name)))
    const visit = (node) => {
        if (limited) return
        ;(node.children || []).forEach(visit)
        if (!limited) add(node)
    }
    visit(ast)
    if (limited) {
        const atomNodes = atoms.map(parseFormula)
        return { columns: [...atomNodes, ast], limited: true }
    }
    return { columns, limited: false }
}

export function analyzeFormula(value) {
    const ast = normalize(value)
    const empty = {
        ast, valid: false, error: ast.error || null, components: [], atoms: [],
        classification: null, truthTable: null, freeVariables: [], boundVariables: [],
        isFirstOrder: false, limitMessage: null,
    }
    if (ast.type === 'Invalid') return empty
    const details = inspect(ast)
    const result = {
        ...empty, ...details, valid: true, error: null,
        freeVariables: freeVariables(ast), boundVariables: boundVariables(ast),
    }
    if (details.isFirstOrder) {
        result.limitMessage = 'First-order formulas require a domain and interpretation. Propositional truth tables and classifications do not apply.'
        return result
    }
    if (details.atoms.length > MAX_TRUTH_TABLE_ATOMS) {
        result.limitMessage = `Truth tables are limited to ${MAX_TRUTH_TABLE_ATOMS} distinct propositional atoms (${2 ** MAX_TRUTH_TABLE_ATOMS} rows). This formula contains ${details.atoms.length}.`
        return result
    }
    const { columns, limited } = truthColumns(ast, details.atoms)
    if (limited) result.limitMessage = `Intermediate subformula columns are omitted when a truth table would exceed ${MAX_TRUTH_TABLE_COLUMNS} columns. Atom values and the complete formula are shown.`
    const rows = assignments(details.atoms).map((assignment) => ({
        assignment, values: columns.map((column) => evaluateFormula(column, assignment)),
    }))
    const finalValues = rows.map((row) => row.values[row.values.length - 1])
    result.classification = finalValues.every(Boolean) ? 'Tautology' : finalValues.every((value) => !value) ? 'Contradiction' : 'Contingency'
    result.truthTable = { columns: columns.map(formatFormula), rows }
    return result
}

export function analyzeArgument(premises, conclusion) {
    if (!Array.isArray(premises)) return { status: 'unsupported', message: 'Premises must be an array of formulas.' }
    const formulas = [...premises, conclusion].map(normalize)
    const invalid = formulas.find((ast) => ast.type === 'Invalid')
    if (invalid) return { status: 'unsupported', message: invalid.error || 'The argument contains an invalid formula.' }
    const details = formulas.map(inspect)
    // Predicate symbols have one arity throughout an argument, including zero.
    const arities = new Map()
    let inconsistent = null
    formulas.forEach((ast) => walk(ast, (node) => {
        if (node.type !== 'Predicate' && node.type !== 'Simple') return
        const name = node.name || node.content
        const arity = node.type === 'Predicate' ? node.terms.length : 0
        if (arities.has(name) && arities.get(name) !== arity) inconsistent = name
        arities.set(name, arity)
    }))
    if (inconsistent) return { status: 'unsupported', message: `Predicate ${inconsistent} has inconsistent arity across the argument.` }
    if (details.some((detail) => detail.isFirstOrder)) {
        return { status: 'unsupported', message: 'A propositional truth table cannot decide first-order validity. Use explicit proof rules for quantified, predicate, or equality formulas.' }
    }
    const atoms = [...new Set(details.flatMap((detail) => detail.atoms))].sort()
    if (atoms.length > MAX_TRUTH_TABLE_ATOMS) {
        return { status: 'limited', message: `Argument truth tables are limited to ${MAX_TRUTH_TABLE_ATOMS} atoms; this argument contains ${atoms.length}.` }
    }
    const premiseAsts = formulas.slice(0, -1)
    const conclusionAst = formulas[formulas.length - 1]
    const counterexample = assignments(atoms).find((assignment) =>
        premiseAsts.every((ast) => evaluateFormula(ast, assignment)) && !evaluateFormula(conclusionAst, assignment)
    )
    if (counterexample) return { status: 'invalid', counterexample, message: 'This assignment makes every premise true and the conclusion false.' }
    return { status: 'valid', message: 'Every assignment that makes all premises true also makes the conclusion true.' }
}
