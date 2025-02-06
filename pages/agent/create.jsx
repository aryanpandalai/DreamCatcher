import React, { useState } from 'react';
import Link from 'next/link';

// Categorized interests: main interest keys with optional sub‑categories.
const categorizedInterests = {
  NBA: ['Golden State Warriors', 'Los Angeles Lakers', 'Boston Celtics', 'Chicago Bulls'],
  NFL: ['Dallas Cowboys', 'New England Patriots', 'Green Bay Packers'],
  Minecraft: [], // No sub-categories
  'World News': [],
  'Formula 1': ['Mercedes', 'Ferrari', 'Red Bull Racing', 'McLaren'],
  ChatGPT: [],
  Music: [],
  NHL: ['Toronto Maple Leafs', 'Montreal Canadiens', 'Boston Bruins'],
};

const CreateAgent = () => {
  // State for form fields.
  const [formData, setFormData] = useState({
    interests: [], // Array of selected main interests.
    subInterests: {}, // Map a main interest to an array of selected sub-categories.
    personality: '',
    contentPreference: '',
  });

  // State to control the modal visibility.
  const [showEditModal, setShowEditModal] = useState(false);

  // Toggle main interest selection.
  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(interest);
      const newInterests = isSelected
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];

      // If deselecting, remove any sub-interests for that interest.
      const newSubInterests = { ...prev.subInterests };
      if (isSelected) {
        delete newSubInterests[interest];
      } else {
        // Initialize sub-interests if needed.
        newSubInterests[interest] = [];
      }
      return {
        ...prev,
        interests: newInterests,
        subInterests: newSubInterests,
      };
    });
  };

  // Toggle sub-category selection for a main interest.
  const toggleSubInterest = (mainInterest, subInterest) => {
    setFormData((prev) => {
      if (!prev.interests.includes(mainInterest)) return prev;
      const currentSubs = prev.subInterests[mainInterest] || [];
      const newSubs = currentSubs.includes(subInterest)
        ? currentSubs.filter((si) => si !== subInterest)
        : [...currentSubs, subInterest];
      return {
        ...prev,
        subInterests: {
          ...prev.subInterests,
          [mainInterest]: newSubs,
        },
      };
    });
  };

  // Handler for other text input changes.
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Form submission handler.
  const handleSubmit = (e) => {
    e.preventDefault();
    // For demonstration purposes, simply alert the form data.
    alert('Agent Created!\n' + JSON.stringify(formData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <Link href="/" className="text-blue-400">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mt-2">Create New Agent</h1>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Interests Section with Edit Button */}
        <div>
          <label className="block text-sm font-medium mb-2">Interests</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="bg-blue-500 px-4 py-2 rounded"
            >
              Edit Interests
            </button>
            {/* Display a summary of selected main interests */}
            {formData.interests.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Personality Input */}
        <div>
          <label htmlFor="personality" className="block text-sm font-medium">
            Personality
          </label>
          <input
            type="text"
            name="personality"
            id="personality"
            placeholder="e.g. Humorous, Sarcastic"
            value={formData.personality}
            onChange={handleChange}
            className="mt-1 p-2 bg-gray-800 rounded w-full"
          />
        </div>

        {/* Content Preference Input */}
        <div>
          <label htmlFor="contentPreference" className="block text-sm font-medium">
            Content Preference
          </label>
          <input
            type="text"
            name="contentPreference"
            id="contentPreference"
            placeholder="e.g. 70% Text, 30% Images"
            value={formData.contentPreference}
            onChange={handleChange}
            className="mt-1 p-2 bg-gray-800 rounded w-full"
          />
        </div>

        <button type="submit" className="bg-blue-500 px-4 py-2 rounded">
          Create Agent
        </button>
      </form>

      {/* Modal for Editing Interests */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg max-h-[80vh] overflow-y-auto w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Interests</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
            {/* Scrollable list of interest bubbles */}
            <div className="flex flex-col gap-4">
              {Object.keys(categorizedInterests).map((interest) => (
                <div key={interest}>
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full border transition-colors
                      ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-500'
                      }`}
                  >
                    {interest}
                  </button>
                  {/* Render sub-categories if the main interest is selected and has sub‑categories */}
                  {formData.interests.includes(interest) &&
                    categorizedInterests[interest].length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-4">
                        {categorizedInterests[interest].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubInterest(interest, sub)}
                            className={`px-3 py-1 rounded-full border transition-colors
                              ${
                                (formData.subInterests[interest] || []).includes(sub)
                                  ? 'bg-green-500 text-white border-green-500'
                                  : 'bg-gray-600 hover:bg-gray-500 text-gray-200 border-gray-400'
                              }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAgent;
