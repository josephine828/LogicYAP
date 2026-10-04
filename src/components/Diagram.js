import React from "react";
import ReactFlow, { Controls, MiniMap } from "reactflow";
import { nodes } from "./diagram/nodes";
import { edges } from "./diagram/edges";

import "reactflow/dist/style.css";

function Diagram({ onClose }) {
  return (
    <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[75vw] h-[70vh]">
        <h3 className="text-lg font-semibold mb-4">Proof Diagram</h3>
        <p className="text-gray-700">
          Choose a strategy from the goal, then check the conditions of each rule.
        </p>
        <div className="flex flex-row w-full h-[calc(100%-125px)] ">
        <ReactFlow nodes={nodes} edges={edges} className="border-4 rounded-xl border-secondary-300 mt-4 w-[calc(47.5%)!important]">
            <Controls />
            <MiniMap />
        </ReactFlow>
        <div className="text-center mt-4 w-[37.5vw] px-4 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Tips and Tricks</h4>
            <p>Use the main operator of the goal to choose a strategy. A connective inside a larger formula does not make the whole formula eligible for its inference rule.</p><br/>
            <p>Universal instantiation replaces free occurrences of the quantified variable with a term, without capturing it. An existential witness starts a subproof with a fresh term; discharge that subproof using existential elimination before using its conclusion outside.</p><br/>
            <p>To prove a conjunction, derive both conjuncts and combine them with conjunction. Simplification extracts a conjunct from an available conjunction.</p><br/>
            <p>To prove a disjunction, deriving either disjunct permits addition. Eliminating a disjunction requires ruling out a disjunct or showing that both cases yield the same conclusion.</p><br/>
            <p>To prove a conditional, one useful strategy is to assume its antecedent, derive its consequent, and discharge the assumption with conditional proof.</p><br/>
            <p>Universal generalization requires an arbitrary term absent from the premises and open assumptions. You cannot generalize an existential witness. Existential generalization requires only an instance with a term that can be substituted freely.</p><br/>
            {/* <p></p><br/>
            <p></p><br/>
            <p></p><br/>
            <p></p><br/>
            <p></p><br/> */}
        </div>
        </div>
        <button
          className="bg-primary-500 text-white px-4 py-2 rounded-lg mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Diagram;
