import { createFormulaValidator } from './Formula'

const SimpleProposition = (properties) => createFormulaValidator(properties, ["Simple"])

export default SimpleProposition
