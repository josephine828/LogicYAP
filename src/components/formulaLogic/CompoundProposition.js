import { createFormulaValidator } from './Formula'

const CompoundProposition = (properties) => createFormulaValidator(properties, ["Negation","Conjunction","Disjunction","Conditional","Biconditional","Universal","Existential"])

export default CompoundProposition
