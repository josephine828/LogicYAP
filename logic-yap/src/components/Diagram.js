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
          This is a flow chart that hopefully helps you see one way to approach proofs!
        </p>
        <div className="flex flex-row w-full h-full">
        <ReactFlow nodes={nodes} edges={edges} className="border-4 rounded-xl border-secondary-300 mt-4 w-[calc(47.5%)!important] h-[calc(100%-125px)!important]">
            <Controls />
            <MiniMap />
        </ReactFlow>
        <div className="text-center mt-4 w-[37.5vw] px-4 h-[calc(100%-125px)] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Tips and Tricks</h4>
            <p>Know what you are looking for/proving and either start instantiating your quantifiers in the premises or save them until you need them (which is helpful when you have multiple variables!)</p><br/>
            <p>When instantiating, if you have a mix of existential(s) and universal(s), instantiate existential(s) first because this has restrictions and you need to flag in the justification (but make sure to NOT indent!)</p><br/>
            <p>IF you are proving something that contains a conjuncition, find and separate the conjuncts in the premises so you can put them together with the conjunction rule.</p><br/>
            <p>If you are proving something that contains a disjunction, find one of the disjuncts in the premises and isolate it before using addition to add the other disjunct.</p><br/>
            <p>If you are proving something that contains a conditional, you will use a conditional proof, which uses indentation. Start by assuming the antecedent and find the consequent.</p><br/>
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
