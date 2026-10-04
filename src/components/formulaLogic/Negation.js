import { createFormulaValidator } from './Formula'

const Negation = (properties) => createFormulaValidator(properties, ["Negation"])

export default Negation
