import React from 'react';

function ProofContainer() {
  return (
    <div className="proof-container bg-primary-50 w-full w-3/4 h-[60vh] rounded-lg shadow-lg p-6 mx-auto mt-8">
      <h3 className="text-xl font-semibold mb-4">Proof Assistant</h3>
      <p className="text-gray-700 mb-4">This is where you can work on your proofs with interactive guidance!</p>
      <div className="border-t border-primary-300 pt-4 overflow-auto">
        {/* Add proof content here */}
      </div>
    </div>
  );
}

export default ProofContainer;
