const simplePropositionPattern = /^[A-Za-z]+$/;

const SimpleProposition = ({ proposition, setMainOperator, setComponents }) => {
    const isValid = () => {
        if (simplePropositionPattern.test(proposition)) {
            setMainOperator('');
            setComponents([].concat({content: proposition, type: 'Simple'}));
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

export default SimpleProposition;
