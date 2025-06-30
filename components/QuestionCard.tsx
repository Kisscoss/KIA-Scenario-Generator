import React, { useState } from 'react';
import { GeneratedQuestion } from '../types';

interface QuestionCardProps {
  question: GeneratedQuestion;
  index: number;
  isGeneratingImages: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, isGeneratingImages }) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg">
      <div className="p-6 sm:p-8">
        {isGeneratingImages && !question.imageUrl && (
          <div className="w-full h-48 bg-gray-200 animate-pulse rounded-md flex items-center justify-center mb-4">
            <span className="text-gray-500">Generating image...</span>
          </div>
        )}
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt={`Visual for: ${question.scenario.substring(0, 50)}...`}
            className="w-full h-auto object-cover mb-4 rounded-md"
          />
        )}
        
        <h3 className="text-lg font-semibold text-gray-500 mb-2">Item {index + 1}</h3>
        <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{question.scenario}</p>

        <div className="space-y-4 mb-6">
          <h4 className="text-md font-semibold text-brand-dark">Task:</h4>
          {question.tasks.map((task) => (
            <div key={task.id} className="pl-4">
              <p className="text-gray-800">
                <span className="font-semibold">({task.id})</span> {task.question}
              </p>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={() => setIsAnswerVisible(!isAnswerVisible)}
            className="px-4 py-2 text-sm font-medium text-brand-secondary bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors"
          >
            {isAnswerVisible ? 'Hide' : 'Show'} Sample Answers
          </button>
        </div>

        {isAnswerVisible && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-brand-dark mb-4">Sample Answers:</h4>
            <div className="space-y-4">
              {question.answers.map((answer) => (
                <div key={answer.id}>
                  <p className="font-semibold text-gray-800 mb-1">Answer for ({answer.id}):</p>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;