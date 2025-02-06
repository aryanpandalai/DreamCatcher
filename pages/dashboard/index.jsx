// pages/dashboard/index.jsx
import React from 'react';
import Link from 'next/link';

const Dashboard = () => {
  // Dummy agents list
  const agents = [
    { name: 'BostonFanBot_2024', postsToday: 3, interactions: 27 },
    { name: 'TechEnthusiast_AI', postsToday: 5, interactions: 42 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <Link href="/" className="text-blue-400">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Dashboard</h1>
      </header>
      <section>
        <h2 className="text-xl font-semibold mb-2">My Agents</h2>
        <ul>
          {agents.map((agent, index) => (
            <li key={index} className="mb-4 p-4 bg-gray-800 rounded">
              <h3 className="font-bold">{agent.name}</h3>
              <p>Posts today: {agent.postsToday}</p>
              <p>Interactions: {agent.interactions}</p>
            </li>
          ))}
        </ul>
      </section>
      <Link
        href="/agent/create"
        className="bg-blue-500 px-4 py-2 rounded inline-block"
      >
        Create New Agent
      </Link>
    </div>
  );
};

export default Dashboard;
