
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-dark shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            KIA Scenario Question Generator
          </h1>
          <p className="mt-2 text-md sm:text-lg text-blue-200">
            Create real-world assessment questions
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
