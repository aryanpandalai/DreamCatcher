// pages/index.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import {
  Home,
  Plus,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Menu,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MainLayout() {
  const router = useRouter();

  // Dream categories slider (for filtering dream posts)
  const dreamCategories = ['All', 'Lucid', 'Nightmare', 'Flying', 'Surreal', 'Recurring'];
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([]);

  const toggleCategoryFilter = (option) => {
    setSelectedCategoryFilters((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Sample dream post with a video
  const sampleDream = {
    title: 'Riding Through a Dream: Mountain Biking in a Sunlit Forest',
    author: 'Dreamer42',
    timestamp: 'Last night',
    upvotes: 512,
    comments: 73,
    content:
      'Felt like I was flying through another world! The golden rays cutting through the trees, the rush of wind, and the sound of leaves scattering under my tires—it was pure freedom. This dream perfectly captured that feeling of adventure and escape. Would you ride this trail? 🚵‍♂️💨 #MountainBiking #ForestRide #CinematicDreams',
    videoUrl: '/videos/bikedream.mp4' // Place your video file in /public/videos/
  };

  // Keen slider for dream categories
  const [sliderRef] = useKeenSlider({
    loop: false,
    mode: 'snap',
    origin: 0,
    slides: { perView: 4 },
  });

  // Sidebar open/close states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  /* ================================
     Floating Create Button & Modal
  =================================== */
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [dreamModalOpen, setDreamModalOpen] = useState(false);

  // Dream creation form state
  const [dreamVideo, setDreamVideo] = useState(null);
  const [dreamDescription, setDreamDescription] = useState('');
  const [dreamTag, setDreamTag] = useState('');

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDreamVideo(e.target.files[0]);
    }
  };

  const handleDreamSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, simply log the values.
    console.log({
      dreamVideo,
      dreamDescription,
      dreamTag,
    });
    // Reset form values and close the modal.
    setDreamModalOpen(false);
    setDreamVideo(null);
    setDreamDescription('');
    setDreamTag('');
  };

  // Dream Challenges (displayed in the right sidebar)
  const dreamChallenges = ['Best Flying Dream', 'Most Surreal Nightmare', 'Lucid Dream Mastery'];

  return (
    <div className="text-white min-h-screen relative bg-gradient-to-b from-indigo-900 to-black">
      {/* 1) TOP NAV / HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-gray-700 backdrop-blur-md">
        <div className="flex items-center h-[60px] px-4 py-2">
          {/* Brand: DreamFeed (toggles left sidebar) */}
          <div
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className={`
              flex items-center justify-between gap-4 rounded-lg p-2 cursor-pointer transition-all
              ${leftSidebarOpen ? 'bg-purple-600' : 'hover:bg-purple-700'}
            `}
          >
            <span className="text-2xl font-bold font-cursive flex items-center whitespace-nowrap">
              DreamCatcher <span className="ml-2">🌙</span>
            </span>
          </div>

          {/* Dream Categories Slider */}
          <div ref={sliderRef} className="keen-slider overflow-x-hidden mx-4" style={{ maxWidth: 800 }}>
            {dreamCategories.map((option) => (
              <div key={option} className="keen-slider__slide min-w-[100px]">
                <button
                  onClick={() => toggleCategoryFilter(option)}
                  className={`px-4 py-2 text-sm rounded-full border border-purple-400/50 
                    bg-gradient-to-t from-purple-400/30 to-transparent transition-all hover:border-purple-400 shadow-md
                    whitespace-nowrap 
                    ${selectedCategoryFilters.includes(option) ? 'bg-purple-600 text-white' : ''}`}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Sidebar Toggle for Dream Challenges */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="flex items-center px-3 py-1 rounded-md hover:bg-gray-800 transition-colors"
          >
            {rightSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="ml-2">{rightSidebarOpen ? 'Close' : 'Challenges'}</span>
          </button>
        </div>
      </header>

      {/* 2) LEFT SLIDING SIDEBAR */}
      <div
        className={`
          fixed top-[60px] left-0 bottom-0 w-56 bg-gray-900/70 border-r border-gray-700 p-4
          transform transition-transform duration-300 ease-in-out flex flex-col rounded-r-xl backdrop-blur-md
          ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="space-y-4">
          <Link href="/" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
            <Home className="w-5 h-5" />
            <span>Dream Feed</span>
          </Link>
          <Link href="/journal" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
            <MessageCircle className="w-5 h-5" />
            <span>My Journal</span>
          </Link>
          <Link href="/remix" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
            <Plus className="w-5 h-5" />
            <span>Dream Remix</span>
          </Link>
        </nav>
      </div>

      {/* 3) RIGHT SLIDING SIDEBAR: Dream Challenges */}
      <div
        className={`
          fixed top-[60px] right-0 bottom-0 w-56 bg-gray-900/70 border-l border-gray-700 p-4
          transform transition-transform duration-300 ease-in-out
          ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <h2 className="text-lg font-semibold mb-4">Dream Challenges</h2>
        <div className="space-y-4">
          {dreamChallenges.map((challenge) => (
            <Card key={challenge} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-medium">{challenge}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  <div>Entries: 27</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4) MAIN FEED */}
      <main className="pt-[70px] px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Voting Buttons */}
                <div className="flex flex-col items-center space-y-1">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium">{sampleDream.upvotes}</span>
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Dream Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Dreamed by {sampleDream.author}</span>
                    <span>•</span>
                    <span>{sampleDream.timestamp}</span>
                  </div>
                  <h2 className="text-xl font-semibold mt-1">{sampleDream.title}</h2>
                  
                  {/* Conditionally render video if available */}
                  {sampleDream.videoUrl && (
                  <div className="flex justify-center my-4">
                    <video
                      style={{ width: '270px', height: 'auto' }}
                      controls
                      className="rounded shadow-lg"
                      src={sampleDream.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}


                  <p className="mt-2 text-gray-300">{sampleDream.content}</p>

                  {/* Dream Actions */}
                  <div className="flex items-center space-x-4 mt-4">
                    <button className="flex items-center space-x-2 text-gray-400 hover:bg-gray-700 px-2 py-1 rounded">
                      <MessageCircle className="w-4 h-4" />
                      <span>{sampleDream.comments} Comments</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-400 hover:bg-gray-700 px-2 py-1 rounded">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* =========================
           Floating Create Button
      ========================== */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {createMenuOpen && (
          <div className="mb-2 flex flex-col items-end space-y-2">
            <button
              onClick={() => {
                router.push('/remix');
                setCreateMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
            >
              Remix Dream
            </button>
            <button
              onClick={() => {
                setDreamModalOpen(true);
                setCreateMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
            >
              Share Dream
            </button>
          </div>
        )}
        <button
          onClick={() => setCreateMenuOpen(!createMenuOpen)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* =========================
           Dream Sharing Modal
      ========================== */}
      {dreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl mb-4">Share Your Dream</h2>
            <form onSubmit={handleDreamSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Upload EEG Data</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Dream Description</label>
                <input
                  type="text"
                  value={dreamDescription}
                  onChange={(e) => setDreamDescription(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Describe your dream..."
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Dream Tag</label>
                <input
                  type="text"
                  value={dreamTag}
                  onChange={(e) => setDreamTag(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="e.g., Lucid, Flying..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDreamModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                >
                  Post Dream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
