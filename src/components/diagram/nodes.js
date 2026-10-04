const COLOR_LEVEL_1 = "#e4b1ab";
const COLOR_LEVEL_2 = "#e39695";
const COLOR_LEVEL_3 = "#df7373";
const COLOR_LEVEL_4 = "#da5552";

export const nodes = [
  {
    id: "start",
    position: { x: 250, y: 25 },
    data: { label: "Start Proof" },
    style: {
      background: COLOR_LEVEL_1,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "listPremises",
    position: { x: 250, y: 100 },
    data: { label: "List all the Premises" },
    style: {
      background: COLOR_LEVEL_2,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "stateConclusion",
    position: { x: 250, y: 175 },
    data: { label: "Identify the goal and its main operator" },
    style: {
      background: COLOR_LEVEL_3,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "negatedQuantifier",
    position: { x: 50, y: 250 },
    data: { label: "For a negated quantifier, try quantifier negation" },
    style: {
      background: COLOR_LEVEL_4,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "universal",
    position: { x: 250, y: 250 },
    data: {
      label:
        "For a universal goal, derive an instance with an arbitrary term; check generalization restrictions",
    },
    style: {
      background: COLOR_LEVEL_4,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "existential",
    position: { x: 450, y: 250 },
    data: {
      label:
        "For an existential goal, derive an instance and use existential generalization",
    },
    style: {
      background: COLOR_LEVEL_4,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "putThingsTogether",
    position: { x: 250, y: 425 },
    data: { label: "Use the rules to find things and put them together" },
    style: {
      background: COLOR_LEVEL_3,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
  {
    id: "end",
    position: { x: 250, y: 525 },
    data: { label: "End Proof" },
    style: {
      background: COLOR_LEVEL_1,
      color: "#fff",
      border: "1px solid #fff",
      borderRadius: "5px",
    },
  },
];
