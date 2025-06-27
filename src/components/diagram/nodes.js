const COLOR_LEVEL_1 = "#e4b1ab";
const COLOR_LEVEL_2 = "#e39695";
const COLOR_LEVEL_3 = "#df7373";
const COLOR_LEVEL_4 = "#da5552";
const COLOR_LEVEL_5 = "#cc444b";

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
    data: { label: "State the Conclusion as the last step" },
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
    data: { label: "If the conclusion is a negated quantifier, use CQN" },
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
        "If you want to prove a universal, go back to the top and use the flagging step to set up for universal generalization, and make sure to indent",
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
        "If you want to prove an existential, you do NOT need to indent to generalize an existential",
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
