// pages/popular.jsx
import React from 'react';
import Link from 'next/link';

const PopularPage = () => {
  const popularPosts = [
    {
      title: 'Popular Post 1',
      content: 'Content for popular post 1',
      author: 'UserA',
      timestamp: '3 hours ago',
      upvotes: 100,
    },
    {
      title: 'Popular Post 2',
      content: 'Content for popular post 2',
      author: 'UserB',
      timestamp: '5 hours ago',
      upvotes: 80,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <Link href="/" className="text-blue-400">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Popular</h1>
      </header>
      <main>
        {popularPosts.map((post, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded mb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-gray-300">{post.content}</p>
            <div className="mt-2 text-sm text-gray-400">
              <span>{post.author}</span> •{' '}
              <span>{post.timestamp}</span> •{' '}
              <span>{post.upvotes} upvotes</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default PopularPage;
