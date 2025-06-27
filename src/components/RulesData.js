export const rulesOfInference = [
    {
        name: 'Modus Ponens',
        abbreviation: 'M.P.',
        steps: ['p ⊃ q', 'p'],
        conclusion: 'q',
        description: 'If p implies q and p is true, then q must be true.',
        helpfulTips: [
            'Remember to check if the antecedent of the conditional is true in the premise.',
            'Check if the conclusion follows logically from the premises.',
        ],
        types: {
            steps: ['Conditional', 'Simple'],
            conclusion: 'Simple',
        },
    },
    {
        name: 'Modus Tollens',
        abbreviation: 'M.T.',
        steps: ['p ⊃ q', '~q'],
        conclusion: '~p',
        description: 'If p implies q and q is false, then p must be false.',
        helpfulTips: [
            'Use the contrapositive of the conditional to deduce the conclusion.',
            'Consider the negation of the consequent in the premise.',
        ],
        types: {
            steps: ['Conditional', 'Negation'],
            conclusion: 'Negation',
        },
    },
    {
        name: 'Hypothetical Syllogism',
        abbreviation: 'H.S.',
        steps: ['p ⊃ q', 'q ⊃ r'],
        conclusion: 'p ⊃ r',
        description: 'If p implies q and q implies r, then p implies r.',
        helpfulTips: [
            'Chain together two conditional statements to form a conclusion.',
            'Apply transitivity of implication.',
        ],
        types: {
            steps: ['Conditional', 'Conditional'],
            conclusion: 'Conditional',
        },
    },
    {
        name: 'Simplification',
        abbreviation: 'Simp.',
        steps: ['p · q'],
        conclusion: 'p',
        description: 'If both p and q are true, then p is true.',
        helpfulTips: [
            'Identify conjunctions in the premises.',
            'Extract the individual components from the conjunctions to reach the conclusion.',
        ],
        types: {
            steps: ['Conjunction'],
            conclusion: 'Simple',
        },
    },
    {
        name: 'Simplification',
        abbreviation: 'Simp.',
        steps: ['p · q'],
        conclusion: 'q',
        description: 'If both p and q are true, then q is true.',
        helpfulTips: [
            'Identify conjunctions in the premises.',
            'Extract the individual components from the conjunctions to reach the conclusion.',
        ],
        types: {
            steps: ['Conjunction'],
            conclusion: 'Simple',
        },
    },
    {
        name: 'Conjunction',
        abbreviation: 'Conj.',
        steps: ['p', 'q'],
        conclusion: 'p · q',
        description:
            'If both p and q are true, then their conjunction is true.',
        helpfulTips: [
            'Identify simple propositions in the premises.',
            'Combine these propositions using the conjunction operator to reach the conclusion.',
        ],
        types: {
            steps: ['Simple', 'Simple'],
            conclusion: 'Conjunction',
        },
    },
    {
        name: 'Dilemma',
        abbreviation: 'Dil.',
        steps: ['p ⊃ q', 'r ⊃ s', 'p ∨ r'],
        conclusion: 'q ∨ s',
        description:
            'If p implies q and r implies s, and either p or r is true, then either q or s is true.',
        helpfulTips: [
            'Identify disjunctions and conditional statements in the premise.',
        ],
        types: {
            steps: ['Conditional', 'Conditional', 'Disjunction'],
            conclusion: 'Disjunction',
        },
    },
    {
        name: 'Disjunctive Syllogism',
        abbreviation: 'D.S.',
        steps: ['p ∨ q', '~p'],
        conclusion: 'q',
        description:
            'If either p or q is true, and p is false, then q must be true.',
        helpfulTips: [
            'Identify disjunctions and negations in the premise.',
            'Apply disjunctive syllogism to eliminate one disjunct and infer the other.',
        ],
        types: {
            steps: ['Disjunction', 'Negation'],
            conclusion: 'Simple',
        },
    },
    {
        name: 'Disjunctive Syllogism',
        abbreviation: 'D.S.',
        steps: ['p ∨ q', '~q'],
        conclusion: 'p',
        description:
            'If either p or q is true, and q is false, then p must be true.',
        helpfulTips: [
            'Identify disjunctions and negations in the premise.',
            'Apply disjunctive syllogism to eliminate one disjunct and infer the other.',
        ],
        types: {
            steps: ['Disjunction', 'Negation'],
            conclusion: 'Simple',
        },
    },
    {
        name: 'Addition',
        abbreviation: 'Add.',
        steps: ['p'],
        conclusion: 'p ∨ q',
        description:
            'If p is true, then the disjunction of p and any other proposition q is true.',
        helpfulTips: [
            'Identify simple propositions in the premise.',
            'Use addition to introduce new disjuncts into a disjunction.',
        ],
        types: {
            steps: ['Simple'],
            conclusion: 'Disjunction',
        },
    },
    {
        name: 'Addition',
        abbreviation: 'Add.',
        steps: ['q'],
        conclusion: 'p ∨ q',
        description:
            'If q is true, then the disjunction of p and any other proposition p is true.',
        helpfulTips: [
            'Identify simple propositions in the premise.',
            'Use addition to introduce new disjuncts into a disjunction.',
        ],
        types: {
            steps: ['Simple'],
            conclusion: 'Disjunction',
        },
    },
]

export const replacementRules = [
    {
        name: 'Double Negation',
        abbreviation: 'D.N.',
        transformations: [{
            from: 'p',
            to: '~~p',
        }],
        description:
            "If a proposition is negated twice, it's equivalent to the original proposition and vice versa.",
        helpfulTips: [
            'These can be especially useful when you need to use Modus Tollens or Disjunctive Syllogism because you need the negation of a proposition.',
        ],
        types: [{
            from: 'Simple',
            to: 'Negation',
        }],
    },
    {
      name: "Duplication",
      abbreviation: "Dup.",
      transformations: [
        {
          from: "p",
          to: "p ∨ p"
        },
        {
          from: "p",
          to: "p · p"
        }
      ],
      description: "A proposition is equivalent to itself duplicated via conjunction or disjunction.",
      helpfulTips: ["Use this to duplicate the proposition using conjunction or disjunction based on your needs."],
      types: [
        {
          from: "Simple",
          to: "Conjunction"
        },
        {
          from: "Simple",
          to: "Disjunction"
        }
      ]
    },
    {
      name: "Commutation",
      abbreviation: "Comm.",
      transformations: [
        {
          from: "p ∨ q",
          to: "q ∨ p"
        },
        {
          from: "p · q",
          to: "q · p"
        }
      ],
      description: "The order of disjunctions and conjunctions can be reversed without changing the meaning.",
      helpfulTips: ["You can use this to swap the order of disjunctions in a disjunction or conjunctions in a conjunction."],
      types: [
        {
          from: "Disjunction",
          to: "Disjunction"
        },
        {
          from: "Conjunction",
          to: "Conjunction"
        }
      ]
    },
    {
      name: "Association",
      abbreviation: "Assoc.",
      transformations: [
        {
          from: "(p ∨ q) ∨ r",
          to: "p ∨ (q ∨ r)"
        },
        {
          from: "(p · q) · r",
          to: "p · (q · r)"
        }
      ],
      description: "The grouping of disjunctions and conjunctions can be changed without changing the meaning.",
      helpfulTips: ["You can use this to regroup disjunctions in a disjunction or conjunctions in a conjunction."],
      types: [
        {
          from: "Disjunction",
          to: "Disjunction"
        },
        {
          from: "Conjunction",
          to: "Conjunction"
        },
      ]
    },
    {
      name: "Contraposition",
      abbreviation: "Contrap.",
      transformations: [
        {
          from: "p ⊃ q",
          to: "~q ⊃ ~p"
        }
      ],
      description: "A conditional statement can be contraposed by negating both the antecedent and consequent, and vice versa.",
      helpfulTips: ["You can use this to transform conditional statements and their contrapositives."],
      types: [
        {
          from: "Conditional",
          to: "Conditional"
        }
      ]
    },
    {
      name: "DeMorgan's",
      abbreviation: "DeM.",
      transformations: [
        {
          from: "~(p ∨ q)",
          to: "~p · ~q"
        },
        {
          from: "~(p · q)",
          to: "~p ∨ ~q"
        },
      ],
      description: "The negation of a disjunction is equivalent to the conjunction of the negations, and the negation of a conjunction is equivalent to the disjunction of negations.",
      helpfulTips: ["Think of this as distributing the negation to everything within the parentheses. You're turning both propositions into their negations and changing the operator into its 'opposite'."],
      types: [
        {
          from: "Negation",
          to: "Conjunction"
        },
        {
          from: "Negation",
          to: "Disjunction"
        }
      ]
    },
    {
      name: "Biconditional Exchange",
      abbreviation: "B.E.",
      transformations: [
        {
          from: "p ≡ q",
          to: "(p ⊃ q) · (q ⊃ p)"
        }
      ],
      description: "A biconditional statement can be expressed as a conjunction of two conditionals, and vice versa.",
      helpfulTips: ["You can use this to transform biconditional statements and their equivalent forms."],
      types: [
        {
          from: "Biconditional",
          to: "Conjunction"
        }
      ]
    },
    {
      name: "Conditional Exchange",
      abbreviation: "C.E.",
      transformations: [
        {
          from: "p ⊃ q",
          to: "~p ∨ q"
        },
      ],
      description: "A conditional statement can be exchanged with a disjunction where the antecedent is negated and becomes a disjunct with the consequent, and vice versa.",
      helpfulTips: ["You can use this to transform conditional statements into disjunctions and vice versa."],
      types: [
        {
          from: "Conditional",
          to: "Disjunction"
        }
      ]
    },
    {
      name: "Distribution",
      abbreviation: "Dist.",
      transformations: [
        {
          from: "p · (q ∨ r)",
          to: "(p · q) ∨ (p · r)"
        },
        {
          from: "p ∨ (q · r)",
          to: "(p ∨ q) · (p ∨ r)"
        }
      ],
      description: "The distribution rule allows you to distribute a conjunction or disjunction over another conjunction or disjunction.",
      helpfulTips: ["You can use this to expand or simplify complex expressions involving conjunctions and disjunctions."],
      types: [
        {
          from: "Conjunction",
          to: "Disjunction"
        },
        {
          from: "Disjunction",
          to: "Conjunction"
        }
      ]
    },
    {
      name: "Exportation",
      abbreviation: "Exp.",
      transformations: [
        {
          from: "(p · q) ⊃ r",
          to: "p ⊃ (q ⊃ r)"
        }
      ],
      description: "The exportation rule allows you to move a conjunction inside a conditional statement, and vice versa.",
      helpfulTips: ["You can use this to transform complex conditional statements involving conjunctions."],
      types: [
        {
          from: "Conditional",
          to: "Conjunction"
        }
      ]
    }
]