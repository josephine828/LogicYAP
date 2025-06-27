export const edges = [
  {
    id: "start-to-listPremises",
    source: "start",
    target: "listPremises",
  },
  {
    id: "listPremises-to-stateConclusion",
    source: "listPremises",
    target: "stateConclusion",
  },
  {
    id: "stateConclusion-to-negatedQuantifier",
    source: "stateConclusion",
    target: "negatedQuantifier",
  },
  {
    id: "negatedQuantifier-to-existential",
    source: "negatedQuantifier",
    target: "existential",
  },
  {
    id: "negatedQuantifier-to-universal",
    source: "negatedQuantifier",
    target: "universal",
  },
  {
    id: "stateConclusion-to-universal",
    source: "stateConclusion",
    target: "universal",
  },
  {
    id: "stateConclusion-to-existential",
    source: "stateConclusion",
    target: "existential",
  },
  {
    id: "existential-to-putThingsTogether",
    source: "universal",
    target: "putThingsTogether",
  },
  {
    id: "existential-to-putThingsTogether",
    source: "negatedQuantifier",
    target: "putThingsTogether",
  },
  {
    id: "existential-to-putThingsTogether",
    source: "existential",
    target: "putThingsTogether",
  },
  {
    id: "putThingsTogether-to-end",
    source: "putThingsTogether",
    target: "end",
  },
];
