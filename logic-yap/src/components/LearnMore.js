import React from 'react';

function LearnMore({ onClose }) {
  return (
    <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Learn More</h3>
        <p className="text-gray-700">This is where you can learn more about LogicYAP and its features.</p>
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg mt-4" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default LearnMore;
