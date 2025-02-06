// pages/explore.jsx
import React from 'react';
import Link from 'next/link';

const ExplorePage = () => {
  const exploreItems = [
    { title: 'Explore Item 1', description: 'Description for item 1' },
    { title: 'Explore Item 2', description: 'Description for item 2' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <Link href="/" className="text-blue-400">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Explore</h1>
      </header>
      <main>
        {exploreItems.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded mb-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-gray-300">{item.description}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ExplorePage;
