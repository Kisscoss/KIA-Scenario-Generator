import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import AdminPage from './components/AdminPage';
import ScenarioGenerator from './components/ScenarioGenerator';
import { Token } from './types';

type Page = 'landing' | 'admin' | 'app';
type ValidationResult = 'valid' | 'expired' | 'invalid';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [generatedTokens, setGeneratedTokens] = useState<Token[]>([]);
  const [activeToken, setActiveToken] = useState<Token | null>(null);

  useEffect(() => {
    // Load tokens from localStorage on initial mount
    const storedTokens = localStorage.getItem('generated-tokens');
    if (storedTokens) {
      const parsedTokens: Token[] = JSON.parse(storedTokens);
      setGeneratedTokens(parsedTokens);

      // Check sessionStorage for an active token ID
      const activeTokenId = sessionStorage.getItem('active-token-id');
      if (activeTokenId) {
        const foundToken = parsedTokens.find(t => t.id === activeTokenId);
        if (foundToken && foundToken.used < foundToken.limit) {
          setActiveToken(foundToken);
          setCurrentPage('app');
        }
      }
    }
  }, []);

  const handleValidateToken = useCallback((tokenId: string): ValidationResult => {
    const token = generatedTokens.find(t => t.id === tokenId);
    if (!token) {
      return 'invalid';
    }
    if (token.used >= token.limit) {
      return 'expired';
    }
    sessionStorage.setItem('active-token-id', tokenId);
    setActiveToken(token);
    setCurrentPage('app');
    return 'valid';
  }, [generatedTokens]);

  const handleAddToken = useCallback((newToken: Token) => {
    setGeneratedTokens(prevTokens => {
      const newTokens = [...prevTokens, newToken];
      localStorage.setItem('generated-tokens', JSON.stringify(newTokens));
      return newTokens;
    });
  }, []);
  
  const handleExitApp = useCallback(() => {
    sessionStorage.removeItem('active-token-id');
    setActiveToken(null);
    setCurrentPage('landing');
  }, []);

  const handleRecordGeneration = useCallback(() => {
    if (!activeToken) return;

    setGeneratedTokens(prevTokens => {
      const newTokens = prevTokens.map(token => {
        if (token.id === activeToken.id) {
          const updatedToken = { ...token, used: token.used + 1 };
          setActiveToken(updatedToken); // Also update the active token in state
          return updatedToken;
        }
        return token;
      });
      localStorage.setItem('generated-tokens', JSON.stringify(newTokens));
      return newTokens;
    });
  }, [activeToken]);


  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage 
                  onAddToken={handleAddToken} 
                  existingTokens={generatedTokens} 
                  onNavigateToHome={() => setCurrentPage('landing')} 
                />;
      case 'app':
        if (activeToken) {
          return <ScenarioGenerator 
                    onExit={handleExitApp} 
                    activeToken={activeToken} 
                    onRecordGeneration={handleRecordGeneration}
                  />;
        }
        // Fallback to landing if not authenticated
        return <LandingPage onValidateToken={handleValidateToken} onNavigateToAdmin={() => setCurrentPage('admin')} />;
      case 'landing':
      default:
        return <LandingPage onValidateToken={handleValidateToken} onNavigateToAdmin={() => setCurrentPage('admin')} />;
    }
  };

  return <div className="min-h-screen font-sans">{renderPage()}</div>;
};

export default App;
