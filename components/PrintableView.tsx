import React from 'react';
import { GeneratedQuestion } from '../types';

interface PrintableViewProps {
  questions: GeneratedQuestion[];
}

const PrintableView: React.FC<PrintableViewProps> = ({ questions }) => {
  if (questions.length === 0) return null;

  return (
    // This container is hidden but has a valid layout for PDF generation.
    <div 
      id="printable-area" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: -1, // Move it behind everything
        visibility: 'hidden', // Make it invisible but preserve its layout
        width: '800px', 
        background: 'white', 
        color: 'black', 
        padding: '40px', 
        fontFamily: 'Times New Roman, serif' 
      }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
        Scenario-Based Questions
      </h1>
      {questions.map((q, i) => (
        <div key={`print-${i}`} style={{ marginBottom: '48px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
            Item {i + 1}
          </h2>
          {q.imageUrl && (
            <img 
              src={q.imageUrl} 
              alt={`Visual for Item ${i + 1}`} 
              style={{ width: '100%', marginBottom: '16px', borderRadius: '4px' }} 
            />
          )}
          <p style={{ marginBottom: '24px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {q.scenario}
          </p>
          
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Tasks:
          </h3>
          <div style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            {q.tasks.map((task) => (
              <p key={`print-task-${task.id}`} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                <span style={{ fontWeight: 'bold' }}>({task.id})</span> {task.question}
              </p>
            ))}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Sample Answers:
          </h3>
          <div style={{ paddingLeft: '20px', backgroundColor: '#f9f9f9', border: '1px solid #eee', padding: '16px', borderRadius: '4px' }}>
            {q.answers.map((answer) => (
              <div key={`print-answer-${answer.id}`} style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Answer for ({answer.id}):</p>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{answer.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintableView;
