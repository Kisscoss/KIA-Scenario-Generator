import React, { useState } from 'react';
import { Token } from '../types';

interface AdminPageProps {
  onAddToken: (token: Token) => void;
  existingTokens: Token[];
  onNavigateToHome: () => void;
}

const ADMIN_PASSWORD = "kisscoss";

const generateTokenId = (): string => {
  const digits = '0123456789';
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let tokenChars: string[] = [];

  for (let i = 0; i < 10; i++) {
    tokenChars.push(digits.charAt(Math.floor(Math.random() * digits.length)));
  }
  for (let i = 0; i < 2; i++) {
    tokenChars.push(upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length)));
  }

  // Fisher-Yates shuffle
  for (let i = tokenChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tokenChars[i], tokenChars[j]] = [tokenChars[j], tokenChars[i]];
  }

  return tokenChars.join('');
};

const AdminPage: React.FC<AdminPageProps> = ({ onAddToken, existingTokens, onNavigateToHome }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };
  
  const handleGenerateClick = () => {
      const newToken: Token = {
          id: generateTokenId(),
          limit: limit,
          used: 0,
      };
      onAddToken(newToken);
  };

  const copyToClipboard = (tokenId: string) => {
    navigator.clipboard.writeText(tokenId).then(() => {
      setCopiedTokenId(tokenId);
      setTimeout(() => setCopiedTokenId(null), 2000); // Reset after 2 seconds
    });
  };

  const handleBackToHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigateToHome();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Admin Panel Access</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-brand-secondary sm:text-sm"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-brand-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>
            </form>
             <p className="mt-4 text-center text-sm text-gray-500">
                <a href="#" className="font-medium text-brand-secondary hover:text-brand-primary" onClick={handleBackToHomeClick}>
                    &larr; Back to Home
                </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-brand-dark pb-32">
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <a href="#" className="text-sm font-medium text-blue-200 hover:text-white" onClick={handleBackToHomeClick}>
              &larr; Back to Home
            </a>
          </div>
        </header>
      </div>
      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Generate New Token</h3>
              <div className="mt-4 sm:flex sm:items-center sm:gap-4">
                  <div>
                    <label htmlFor="limit" className="block text-sm font-medium text-gray-700">Generation Limit</label>
                    <input
                      type="number"
                      id="limit"
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value, 10) || 1)}
                      className="block w-full sm:w-32 rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={handleGenerateClick}
                    className="mt-4 sm:mt-0 w-full sm:w-auto rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Generate Token
                  </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">Active Tokens</h3>
              <div className="mt-4 flow-root">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    {existingTokens.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Token ID</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Usage</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Remaining</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Copy</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[...existingTokens].reverse().map((token) => (
                            <tr key={token.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono font-medium text-gray-900 sm:pl-0">{token.id}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{token.used} / {token.limit}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{token.limit - token.used}</td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <button onClick={() => copyToClipboard(token.id)} className="text-brand-secondary hover:text-brand-primary">
                                  {copiedTokenId === token.id ? 'Copied!' : 'Copy'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No tokens have been generated yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
