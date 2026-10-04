import { createFormulaValidator } from './Formula'

const Existential = (properties) => createFormulaValidator(properties, ["Existential"])

export default Existential
