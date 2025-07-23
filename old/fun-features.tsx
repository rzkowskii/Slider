import React, { useState, useEffect, useRef } from 'react';
import { Smile, Clock, FileText, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, Monitor, Eye } from 'lucide-react';

// Emoji Picker Component
const EmojiPicker = ({ onSelectEmoji }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  
  const emojiCategories = {
    smileys: {
      name: 'Smileys',
      emojis: ['😀', '😂', '😊', '😎', '🤔', '😍', '🤗', '🙄', '😅', '😭', '🥳', '😇', '🤩', '😴', '🤯', '🥺']
    },
    gestures: {
      name: 'Gestures',
      emojis: ['👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '🙌', '👐', '🤲', '👋', '🖐️', '✋', '🤚', '👌', '🤟']
    },
    objects: {
      name: 'Objects',
      emojis: ['💡', '🔥', '⭐', '🎯', '📍', '🔔', '💎', '🏆', '🎪', '🎨', '🎭', '🎪', '🎰', '🎲', '🎯', '🎳']
    },
    symbols: {
      name: 'Symbols',
      emojis: ['❤️', '💔', '💯', '💢', '💥', '💫', '⚡', '🔴', '🔵', '⚪', '⚫', '🟢', '🟡', '🟣', '✅', '❌']
    }
  };
  
  const filteredEmojis = Object.entries(emojiCategories).reduce((acc, [key, category]) => {
    const filtered = category.emojis.filter(emoji => 
      searchTerm === '' || emoji.includes(searchTerm)
    );
    if (filtered.length > 0) {
      acc[key] = { ...category, emojis: filtered };
    }
    return acc;
  }, {});
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
      >
        <Smile className="w-5 h-5 text-yellow-600" />
      </button>
      
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          
          <div className="flex gap-2 mb-3 border-b pb-2">
            {Object.entries(emojiCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedCategory === key 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {(filteredEmojis[selectedCategory]?.emojis || []).map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectEmoji(emoji);
                  setShowPicker(false);
                }}
                className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Presentation Timer Component
const PresentationTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [slideTimings, setSlideTimings] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          // Show warning at 5 minute intervals
          if (newTime % 300 === 0 && newTime > 0) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleNextSlide = () => {
    setSlideTimings(prev => [...prev, { slide: currentSlide, time }]);
    setCurrentSlide(prev => prev + 1);
  };
  
  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setSlideTimings([]);
    setCurrentSlide(1);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Presentation Timer
      </h3>
      
      <div className="text-center mb-6">
        <div className={`text-6xl font-mono font-bold ${
          showWarning ? 'text-red-500 animate-pulse' : 'text-gray-800'
        }`}>
          {formatTime(time)}
        </div>
        <p className="text-sm text-gray-600 mt-2">Slide {currentSlide}</p>
      </div>
      
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isRunning 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={handleNextSlide}
          disabled={!isRunning}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
        >
          Next Slide
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      {slideTimings.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Slide Timings:</h4>
          <div className="space-y-1 text-sm">
            {slideTimings.map((timing, index) => (
              <div key={index} className="flex justify-between text-gray-600">
                <span>Slide {timing.slide}</span>
                <span>{formatTime(timing.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showWarning && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          Time check: {formatTime(time)}
        </div>
      )}
    </div>
  );
};

// Speaker Notes Component
const SpeakerNotes = () => {
  const [notes, setNotes] = useState({
    1: 'Welcome everyone! Remember to make eye contact and smile.',
    2: 'Key points:\n- First important point\n- Second point with emphasis\n- Third point with example',
    3: 'Thank the audience and open for questions.'
  });
  const [currentSlide, setCurrentSlide] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [showPresenterView, setShowPresenterView] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Speaker Notes
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            A-
          </button>
          <span className="text-sm text-gray-600">{fontSize}px</span>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            A+
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          {Object.keys(notes).map(slideNum => (
            <button
              key={slideNum}
              onClick={() => setCurrentSlide(parseInt(slideNum))}
              className={`px-3 py-1 rounded ${
                currentSlide === parseInt(slideNum)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Slide {slideNum}
            </button>
          ))}
        </div>
        
        <textarea
          value={notes[currentSlide] || ''}
          onChange={(e) => setNotes({ ...notes, [currentSlide]: e.target.value })}
          style={{ fontSize: `${fontSize}px` }}
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add your speaker notes here..."
        />
      </div>
      
      <button
        onClick={() => setShowPresenterView(!showPresenterView)}
        className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
      >
        <Monitor className="w-4 h-4" />
        {showPresenterView ? 'Hide' : 'Show'} Presenter View
      </button>
      
      {showPresenterView && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Presenter View</span>
            <Eye className="w-4 h-4 text-gray-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Current Slide</p>
              <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">Slide {currentSlide}</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Next Slide</p>
              <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">Slide {currentSlide + 1}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Confetti Component
const Confetti = ({ trigger }) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (trigger) {
      // Create confetti particles
      const newParticles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 5,
        size: Math.random() * 8 + 4,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#F8B500'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      }));
      setParticles(newParticles);
    }
  }, [trigger]);
  
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3, // gravity
          rotation: p.rotation + p.rotationSpeed
        })).filter(p => p.y < window.innerHeight + 50);
        
        if (updated.length === 0) {
          clearInterval(interval);
        }
        
        return updated;
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [particles.length]);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </div>
  );
};

// Main Fun Features Component
const FunFeatures = () => {
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [presentationComplete, setPresentationComplete] = useState(false);
  
  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    // Play sound effect if enabled
    if (soundEnabled) {
      // In a real app, you'd play a sound here
      console.log('Playing pop sound');
    }
  };
  
  const completePresentation = () => {
    setPresentationComplete(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    
    if (soundEnabled) {
      // In a real app, you'd play celebration sound
      console.log('Playing celebration sound');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            Fun Presentation Features
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-gray-600">Make your presentations more engaging and enjoyable!</p>
        </div>
        
        {/* Sound toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Sound Effects {soundEnabled ? 'On' : 'Off'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emoji Picker */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Emoji Reactions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add emojis to make your slides more expressive!
            </p>
            
            <div className="flex items-center gap-4">
              <EmojiPicker onSelectEmoji={handleEmojiSelect} />
              
              {selectedEmoji && (
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Selected emoji:</p>
                  <div className="text-6xl animate-bounce">{selectedEmoji}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Pro tip:</strong> Use emojis to highlight important points or add personality to your slides!
              </p>
            </div>
          </div>
          
          {/* Timer */}
          <PresentationTimer />
          
          {/* Speaker Notes */}
          <SpeakerNotes />
          
          {/* Celebration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Presentation Complete!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Celebrate when you finish your presentation!
            </p>
            
            <button
              onClick={completePresentation}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
            >
              🎉 Complete Presentation! 🎉
            </button>
            
            {presentationComplete && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-center">
                  Congratulations! You did amazing! 🌟
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Live Preview Window */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Live Preview Window</h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Your presentation preview appears here</p>
              {selectedEmoji && (
                <div className="mt-4 text-4xl animate-pulse">{selectedEmoji}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confetti effect */}
      <Confetti trigger={showConfetti} />
    </div>
  );
};

export default FunFeatures;