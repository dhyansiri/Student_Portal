import React from 'react';
import { Hero } from '../components/Hero';
import { CategoryCards } from '../components/CategoryCards';

interface HomeProps {
  onSearch: (query: string) => void;
  onSelectCategory: (categoryId: string, starterQuery?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSearch, onSelectCategory }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <Hero onSearch={onSearch} />
      <CategoryCards onSelectCategory={onSelectCategory} />
    </div>
  );
};
