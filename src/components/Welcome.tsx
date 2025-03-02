import React from 'react';

export const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          OctoFlow Assessment
        </h1>
        <p className="text-center mb-8">
          Answer a few questions to get personalized feedback on your workflow
        </p>
        <div className="space-y-4">
          <a
            href="#/assessment"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Start Assessment
          </a>
        </div>
      </div>
    </div>
  );
}; 