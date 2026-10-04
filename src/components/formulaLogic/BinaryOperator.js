import { createFormulaValidator } from './Formula'

const BinaryOperator = (properties) => createFormulaValidator(properties, ["Conjunction","Disjunction","Conditional","Biconditional"])

export default BinaryOperator
