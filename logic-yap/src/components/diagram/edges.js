export const edges = [
  {
    id: "start-to-listPremises",
    source: "start",
    target: "listPremises",
    animated: true,
  },
  {
    id: "listPremises-to-stateConclusion",
    source: "listPremises",
    target: "stateConclusion",
    animated: true,
  },
  {
    id: "stateConclusion-to-negatedQuantifier",
    source: "stateConclusion",
    target: "negatedQuantifier",
    animated: true,
  },
  {
    id: "stateConclusion-to-universal",
    source: "stateConclusion",
    target: "universal",
    animated: true,
  },
  {
    id: "stateConclusion-to-existential",
    source: "stateConclusion",
    target: "existential",
    animated: true,
  },
  {
    id: "existential-to-putThingsTogether",
    source: "universal",
    target: "putThingsTogether",
    animated: true,
  },
  {
    id: "existential-to-putThingsTogether",
    source: "negatedQuantifier",
    target: "putThingsTogether",
    animated: true,
  },
  {
    id: "existential-to-putThingsTogether",
    source: "existential",
    target: "putThingsTogether",
    animated: true,
  },
  {
    id: "putThingsTogether-to-end",
    source: "putThingsTogether",
    target: "end",
    animated: true,
  },
];
