const negationPattern = /(?:[·∨⊃≡(]|^)(?:~)+(?:[A-Za-z]+|\([^)]+\))(?![~(])/;

const Negation = ({ proposition, setMainOperator, setComponents }) => {
    const isValid = () => {
        if (negationPattern.test(proposition.replace(/\s/g, ""))) {
            setMainOperator('Negation');
            setComponents([].concat({content: proposition, type: 'Negation'}));
            return true;
        } else {
            return false;
        }
    };

    const get = () => {
        if (isValid()) {
        return proposition;
        }
        return '';
    };

    return {
        isValid,
        get
    };
};

export default Negation;
