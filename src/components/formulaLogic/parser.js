// Terms are single lowercase letters: a-w are names, x/y/z are variables.
// A quantifier may explicitly bind any lowercase letter.
const BINARY_SYMBOLS = {
    Conjunction: '·', Disjunction: '∨', Conditional: '⊃', Biconditional: '≡',
}
const SYMBOL_TOKENS = {
    '~': 'NOT', '¬': 'NOT', '!': 'NOT',
    '·': 'AND', '∧': 'AND', '&': 'AND', '^': 'AND',
    '∨': 'OR', '|': 'OR', '⊃': 'IMPLIES', '→': 'IMPLIES', '≡': 'IFF', '↔': 'IFF',
    '∀': 'ALL', '∃': 'EXISTS', '⊥': 'BOTTOM',
    '(': 'OPEN', '[': 'OPEN', ')': 'CLOSE', ']': 'CLOSE', ',': 'COMMA', '=': 'EQUALS',
}

function tokenize(input) {
    const tokens = []
    for (let index = 0; index < input.length;) {
        const character = input[index]
        if (/\s/.test(character)) { index++; continue }
        let value = character
        let type = SYMBOL_TOKENS[character]
        if (input.startsWith('<->', index)) { value = '<->'; type = 'IFF' }
        else if (input.startsWith('->', index)) { value = '->'; type = 'IMPLIES' }
        else if (/[A-Za-z]/.test(character)) type = 'LETTER'
        if (!type) throw new Error(`Unexpected symbol "${character}" at character ${index + 1}.`)
        tokens.push({ type, value, index, end: index + value.length })
        index += value.length
        if (tokens.length > 2048) throw new Error('This formula is too large (maximum 2048 tokens).')
    }
    tokens.push({ type: 'END', value: '', index: input.length, end: input.length })
    return tokens
}

export function formatFormula(node) {
    if (!node || !node.type) throw new Error('Expected a formula syntax tree.')
    if (node.type === 'Invalid') return node.content || ''
    if (node.type === 'Simple') return node.name || node.content
    if (node.type === 'Predicate') return `${node.name}(${node.terms.join(',')})`
    if (node.type === 'Equality') return `${node.terms[0]}=${node.terms[1]}`
    if (node.type === 'Contradiction') return '⊥'
    if (node.type === 'Negation') return `~${formatFormula(node.children[0])}`
    if (BINARY_SYMBOLS[node.type]) {
        return `(${formatFormula(node.children[0])} ${BINARY_SYMBOLS[node.type]} ${formatFormula(node.children[1])})`
    }
    if (node.type === 'Universal' || node.type === 'Existential') {
        const child = node.children[0]
        const body = formatFormula(child)
        const groupedBody = BINARY_SYMBOLS[child.type] ? body : `(${body})`
        return `${node.type === 'Universal' ? '∀' : '∃'}${node.variable}${groupedBody}`
    }
    throw new Error(`Unknown formula type: ${node.type}.`)
}

function makeNode(type, properties = {}) {
    const node = { type, ...properties }
    node.content = formatFormula(node)
    return node
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens
        this.position = 0
        this.depth = 0
        this.arities = new Map()
    }
    peek(offset = 0) { return this.tokens[this.position + offset] || this.tokens[this.tokens.length - 1] }
    take(type) {
        if (this.peek().type !== type) return null
        return this.tokens[this.position++]
    }
    error(message) { throw new Error(`${message} At character ${this.peek().index + 1}.`) }
    parse() {
        if (this.peek().type === 'END') this.error('Enter a formula.')
        const node = this.biconditional()
        if (this.peek().type !== 'END') this.error(`Unexpected "${this.peek().value}"; formulas must be separated by a connective.`)
        return node
    }
    binary(type, left, right) { return makeNode(type, { operator: BINARY_SYMBOLS[type], children: [left, right] }) }
    biconditional() {
        let left = this.conditional()
        while (this.take('IFF')) left = this.binary('Biconditional', left, this.conditional())
        return left
    }
    conditional() {
        const left = this.disjunction()
        if (!this.take('IMPLIES')) return left
        return this.nested(() => this.binary('Conditional', left, this.conditional()))
    }
    disjunction() {
        let left = this.conjunction()
        while (this.take('OR')) left = this.binary('Disjunction', left, this.conjunction())
        return left
    }
    conjunction() {
        let left = this.unary()
        while (this.take('AND')) left = this.binary('Conjunction', left, this.unary())
        return left
    }
    nested(parse) {
        this.depth++
        if (this.depth > 128) this.error('This formula is nested too deeply (maximum 128 levels).')
        const result = parse()
        this.depth--
        return result
    }
    unary() {
        if (this.take('NOT')) return this.nested(() => makeNode('Negation', { children: [this.unary()] }))
        const quantifier = this.take('ALL') || this.take('EXISTS')
        if (quantifier) {
            const binder = this.take('LETTER')
            if (!binder || !/^[a-z]$/.test(binder.value)) this.error('A quantifier must bind one lowercase variable.')
            return this.nested(() => makeNode(quantifier.type === 'ALL' ? 'Universal' : 'Existential', {
                variable: binder.value, children: [this.unary()],
            }))
        }
        const opening = this.take('OPEN')
        if (opening) return this.nested(() => {
            const node = this.biconditional()
            const close = this.take('CLOSE')
            if (!close || (opening.value === '(' ? close.value !== ')' : close.value !== ']')) {
                this.error(`Expected "${opening.value === '(' ? ')' : ']'}" to close the group.`)
            }
            return node
        })
        if (this.take('BOTTOM')) return makeNode('Contradiction')
        return this.atom()
    }
    term() {
        const token = this.take('LETTER')
        if (!token || !/^[a-z]$/.test(token.value)) this.error('A term must be one lowercase letter (a-w names; x/y/z variables).')
        return token.value
    }
    atom() {
        const token = this.take('LETTER')
        if (!token) this.error('Expected an atom, negation, quantifier, or grouped formula.')
        if (/^[a-z]$/.test(token.value)) {
            if (this.take('EQUALS')) return makeNode('Equality', { terms: [token.value, this.term()] })
            return makeNode('Simple', { name: token.value })
        }
        let name = token.value
        // A longer uppercase name is accepted only for an explicit predicate.
        let offset = 0
        let previousEnd = token.end
        while (/^[A-Z]$/.test(this.peek(offset).value) && this.peek(offset).index === previousEnd) {
            previousEnd = this.peek(offset).end
            offset++
        }
        if (offset && this.peek(offset).type === 'OPEN' && this.peek(offset).value === '(') {
            while (offset--) name += this.tokens[this.position++].value
        }
        const terms = []
        if (this.peek().type === 'OPEN' && this.peek().value === '(') {
            this.position++
            terms.push(this.term())
            while (this.take('COMMA')) terms.push(this.term())
            const close = this.take('CLOSE')
            if (!close || close.value !== ')') this.error('Expected ")" after predicate terms; separate terms with commas.')
        } else {
            previousEnd = token.end
            while (/^[a-z]$/.test(this.peek().value) && this.peek().index === previousEnd) {
                const term = this.tokens[this.position++]
                terms.push(term.value)
                previousEnd = term.end
            }
        }
        const arity = terms.length
        if (this.arities.has(name) && this.arities.get(name) !== arity) {
            this.error(`Predicate ${name} has inconsistent arity (${this.arities.get(name)} and ${arity}).`)
        }
        this.arities.set(name, arity)
        return arity ? makeNode('Predicate', { name, terms }) : makeNode('Simple', { name })
    }
}

export function parseFormula(input) {
    if (typeof input !== 'string') return { type: 'Invalid', content: '', error: 'A formula must be text.' }
    if (input.length > 10000) return { type: 'Invalid', content: input.trim(), error: 'This formula is too large (maximum 10000 characters).' }
    try { return new Parser(tokenize(input)).parse() }
    catch (error) { return { type: 'Invalid', content: input.trim(), error: error.message } }
}

function asNode(value) { return typeof value === 'string' ? parseFormula(value) : value }

export function formulasEqual(first, second) {
    const left = asNode(first)
    const right = asNode(second)
    if (!left || !right || left.type === 'Invalid' || right.type === 'Invalid') return false
    const compare = (a, b, leftBinders, rightBinders) => {
        if (!a || !b || a.type !== b.type) return false
        if (a.type === 'Simple') return (a.name || a.content) === (b.name || b.content)
        if (a.type === 'Contradiction') return true
        if (a.type === 'Predicate' || a.type === 'Equality') {
            if (a.type === 'Predicate' && a.name !== b.name) return false
            return a.terms.length === b.terms.length && a.terms.every((term, index) => {
                const leftIndex = leftBinders.lastIndexOf(term)
                const rightIndex = rightBinders.lastIndexOf(b.terms[index])
                return leftIndex >= 0 || rightIndex >= 0 ? leftIndex === rightIndex : term === b.terms[index]
            })
        }
        if (a.type === 'Universal' || a.type === 'Existential') {
            return compare(a.children[0], b.children[0], [...leftBinders, a.variable], [...rightBinders, b.variable])
        }
        return a.children.length === b.children.length && a.children.every((child, index) => compare(child, b.children[index], leftBinders, rightBinders))
    }
    return compare(left, right, [], [])
}

export function boundVariables(value) {
    const variables = new Set()
    const visit = (node) => {
        if (!node || node.type === 'Invalid') return
        if (node.type === 'Universal' || node.type === 'Existential') variables.add(node.variable)
        ;(node.children || []).forEach(visit)
    }
    visit(asNode(value))
    return [...variables].sort()
}

export function freeVariables(value, extraVariables = []) {
    const node = asNode(value)
    const variables = new Set(['x', 'y', 'z', ...boundVariables(node), ...extraVariables])
    const free = new Set()
    const visit = (current, binders) => {
        if (!current || current.type === 'Invalid') return
        if (current.type === 'Universal' || current.type === 'Existential') {
            visit(current.children[0], new Set([...binders, current.variable]))
            return
        }
        ;(current.terms || []).forEach((term) => {
            if (variables.has(term) && !binders.has(term)) free.add(term)
        })
        ;(current.children || []).forEach((child) => visit(child, binders))
    }
    visit(node, new Set())
    return [...free].sort()
}

export function substitute(value, variable, term) {
    const ast = asNode(value)
    if (!ast || ast.type === 'Invalid') throw new Error('Cannot substitute into an invalid formula.')
    if (!/^[a-z]$/.test(variable) || !/^[a-z]$/.test(term)) {
        throw new Error('Substitution requires single lowercase letters for the variable and term.')
    }
    const occursFree = (node) => {
        if ((node.type === 'Universal' || node.type === 'Existential') && node.variable === variable) return false
        return (node.terms || []).includes(variable) || (node.children || []).some(occursFree)
    }
    const clone = (node) => {
        const properties = { ...node }
        delete properties.type
        delete properties.content
        if (node.terms) properties.terms = [...node.terms]
        if (node.children) properties.children = node.children.map(clone)
        return makeNode(node.type, properties)
    }
    const visit = (node) => {
        const quantifier = node.type === 'Universal' || node.type === 'Existential'
        if (quantifier && node.variable === variable) return clone(node)
        if (quantifier && node.variable === term && occursFree(node.children[0])) {
            throw new Error(`Replacing ${variable} with ${term} would capture ${term} under ${node.type === 'Universal' ? '∀' : '∃'}${term}. Rename that bound variable first.`)
        }
        const properties = { ...node }
        delete properties.type
        delete properties.content
        if (node.terms) properties.terms = node.terms.map((current) => current === variable ? term : current)
        if (node.children) properties.children = node.children.map(visit)
        return makeNode(node.type, properties)
    }
    return visit(ast)
}
