import SimpleProposition from './SimpleProposition'
import Negation from './Negation'

const Formula = ({ proposition, setMainOperator, setComponents }) => {
    const isValid = () => {
        if (SimpleProposition({ proposition: proposition, setMainOperator, setComponents }).isValid() || Negation({ proposition: proposition, setMainOperator, setComponents }).isValid()) {
            return true;
        } else {
            return false;
        }
    };

    return {
        isValid
    };
};

export default Formula;
