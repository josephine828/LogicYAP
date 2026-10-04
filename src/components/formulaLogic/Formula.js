import { parseFormula } from './parser'

export const createFormulaValidator = ({ proposition, setMainOperator, setComponents }, allowedTypes) => {
    const isValid = () => {
        const parsed = parseFormula(proposition)
        if (parsed.type !== 'Invalid' && (!allowedTypes || allowedTypes.includes(parsed.type))) {
            if (setMainOperator) setMainOperator(parsed.type)
            const flatten = (node, depth = 0) => {
                return [
                    { content: node.content, type: node.type, depth },
                    ...(node.children ? node.children.flatMap((child) => flatten(child, depth + 1)) : []),
                ]
            }
            if (setComponents) setComponents(flatten(parsed))
            return true
        }
        if (setMainOperator) setMainOperator('')
        if (setComponents) setComponents([])
        return false
    }

    return { isValid, get: () => isValid() ? proposition : '' }
}

const Formula = (properties) => createFormulaValidator(properties)

export default Formula
