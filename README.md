# LogicYAP

LogicYAP (Logic Your Assistant for Proofs) is a web application aimed at helping people understand symbolic logic, specifically proofs. Whether you're a beginner or need a refresher, LogicYAP provides interactive tools and resources to enhance your understanding of logic concepts and improve your proof-solving skills.

## Features

- **Proof Assistant:** Check each proof line against a named inference, replacement, subproof, quantifier, or identity rule. Get suggestions, undo steps, and track which assumptions are still open.
- **Proposition Analyzer:** Parse formulas, identify their main operator and subformulas, generate propositional truth tables, and distinguish tautologies, contradictions, and contingencies. First-order formulas show free and bound variables.
- **Argument Analysis:** Check propositional validity and display an assignment that makes the premises true and the goal false when the argument is invalid.
- **Concept Explainers:** Rule schemas, application conditions, and explanations of syntax, truth, validity, and formal proof.
- **Responsive Design:** Access LogicYAP on any device, whether you're on your desktop, tablet, or smartphone.

## Technologies Used

- React.js: Frontend JavaScript library for building user interfaces.
- Tailwind CSS: Utility-first CSS framework for fast and responsive web development.

## Getting Started

Install dependencies with `npm install` and start the application with `npm start`.

Enter one premise per line and a goal, then select **Start proof**. For example, premises `P ⊃ Q` and `P` with goal `Q` allow a new line `Q` justified by **Modus Ponens**, citing `1, 2`. The example buttons populate propositional and predicate exercises.

The analyzer updates as you type. Accepted notation includes `~`, `¬`, `!`; `·`, `∧`, `&`, `^`; `∨`, `|`; `⊃`, `→`, `->`; and `≡`, `↔`, `<->`. Parentheses and square brackets control scope. Precedence is negation/quantifiers, conjunction, disjunction, conditional, biconditional; conditionals associate to the right.

Propositional atoms are single letters. Predicates use `P(x)`, `R(x,y)`, or compact `Px`, `Rxy`; identity uses `a=b`; contradiction uses `⊥`. Terms are single lowercase letters: a–w are constants and x, y, z are variables. A letter explicitly used as a quantifier binder also counts as a variable outside that binder's scope. Predicate names have a consistent arity throughout a formula and proof. Function terms are not supported.

Use **Assumption** to open a subproof. Conditional Proof, Negation Introduction, and Indirect Proof cite the assumption line followed by the last line and close that scope. Existential Instantiation opens a fresh witness subproof; Existential Elimination cites the existential source, witness assumption, and last line to close it. Lines from closed subproofs cannot be reused directly, and a proof is complete only when the goal is established outside all assumptions. Replacement rules change one matching subformula in either direction.

The checker implements classical logic with a nonempty first-order domain. Truth tables and argument checks are bounded to eight propositional atoms; predicate formulas require a domain and interpretation, so the analyzer does not assign them propositional truth values. Hints suggest a bounded set of immediate deductions and do not constitute a complete automated proof search. Quantifier rules enforce substitution, arbitrary-term, and witness restrictions; see the [forall x natural deduction reference](https://forallx.openlogicproject.org/html/Ch36.html).

Run regression checks with `npm test -- --watchAll=false --runInBand` and create a production build with `npm run build`.

## Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

LogicYAP was inspired by the book "Understanding Symbolic Logic" by Virginia Klenk, and aims to provide an accessible and engaging platform for learning logic.
