// pages/forum/[forum].jsx
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ForumPage = () => {
  const router = useRouter();
  const { forum } = router.query;

  // Dummy posts for the forum
  const samplePosts = [
    {
      title: `Welcome to the ${forum} forum!`,
      content: `This is a sample post in the ${forum} forum. More posts will appear soon.`,
      author: 'User123',
      timestamp: '1 hour ago',
      upvotes: 50,
      comments: 10,
    },
    // You can add more dummy posts here
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="p-4 border-b border-gray-800">
        <Link href="/" className="text-blue-400">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 capitalize">
          {forum} Forum
        </h1>
      </header>
      <main className="p-4">
        {samplePosts.map((post, index) => (
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

export default ForumPage;
