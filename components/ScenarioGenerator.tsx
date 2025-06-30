import React, { useState, useCallback } from 'react';
import InputForm from './InputForm';
import QuestionCard from './QuestionCard';
import Spinner from './Spinner';
import { generateQuestions, generateImage } from '../services/geminiService';
import { GeneratedQuestion, Token } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { downloadPdf } from '../utils/pdfGenerator';
import PrintableView from './PrintableView';

interface ScenarioGeneratorProps {
  onExit: () => void;
  activeToken: Token;
  onRecordGeneration: () => void;
}

const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({ onExit, activeToken, onRecordGeneration }) => {
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const remainingGenerations = activeToken.limit - activeToken.used;

  const handleGenerate = useCallback(async (subject: string, topics: string, difficulty: string) => {
    if (remainingGenerations <= 0) {
        setError("No generations remaining for this token.");
        return;
    }
    setIsLoading(true);
    setIsGeneratingImages(true);
    setError(null);
    setGeneratedQuestions([]);
    
    try {
      const questions = await generateQuestions(subject, topics, difficulty);
      setGeneratedQuestions(questions);
      setIsLoading(false);

      // Successfully generated text, so record the usage.
      onRecordGeneration();

      // Now generate images
      const imagePromises = questions.map((q, index) =>
        generateImage(q.scenario).then(imageUrl => {
          setGeneratedQuestions(prev => {
            const newQuestions = [...prev];
            if (newQuestions[index]) {
              newQuestions[index].imageUrl = imageUrl;
            }
            return newQuestions;
          });
        }).catch(imgError => {
            console.error(`Failed to generate image for question ${index}:`, imgError);
        })
      );
      
      await Promise.all(imagePromises);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } finally {
      setIsGeneratingImages(false);
    }
  }, [remainingGenerations, onRecordGeneration]);

  const handleDownloadPdf = async () => {
    if (generatedQuestions.length === 0 || isGeneratingImages) return;
    setIsPdfLoading(true);
    try {
      await downloadPdf('printable-area', 'scenario-questions.pdf');
    } catch (pdfError) {
      console.error("Failed to generate PDF:", pdfError);
      setError("Could not generate PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="bg-brand-dark shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative text-center text-white">
             <button
                onClick={onExit}
                className="absolute top-1/2 -translate-y-1/2 right-0 text-sm font-medium text-blue-200 hover:text-white transition-colors flex items-center gap-1.5"
                aria-label="Exit to home page"
              >
                Exit
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H5" />
                </svg>
              </button>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              KIA Scenario Question Generator
            </h1>
            <p className="mt-2 text-md sm:text-lg text-blue-200">
              Create real-world assessment questions
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <div className="mb-6 bg-blue-100 text-brand-dark p-3 rounded-lg text-center">
                <p className="font-semibold text-sm">Generations Remaining: <span className="text-lg">{remainingGenerations}</span></p>
             </div>
             <InputForm onGenerate={handleGenerate} isLoading={isLoading || remainingGenerations <= 0} />
             {generatedQuestions.length > 0 && (
                <div className="mt-6">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading || isGeneratingImages}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPdfLoading ? 'Generating PDF...' : 'Download as PDF'}
                    </button>
                    {isGeneratingImages && <p className="text-center text-sm text-gray-600 mt-2">Waiting for images to finish loading...</p>}
                </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {isLoading && <Spinner />}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {generatedQuestions.length > 0 && (
                <div className="space-y-6">
                  {generatedQuestions.map((q, i) => (
                    <QuestionCard key={i} question={q} index={i} isGeneratingImages={isGeneratingImages} />
                  ))}
                </div>
              )}
               {!isLoading && !error && generatedQuestions.length === 0 && (
                <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Ready to Generate</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Select a subject and enter some topics to create your first scenario questions.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <PrintableView questions={generatedQuestions} />
    </div>
  );
};

export default ScenarioGenerator;
