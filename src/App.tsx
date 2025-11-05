import { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

function App() {
  // Core input and mode selection state
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('Instagram Caption');
  // Generation and typing animation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingPreface, setIsTypingPreface] = useState(false); // brief pre-typing indicator
  const resultRef = useRef<HTMLDivElement | null>(null); // for smooth scroll to result
  // History and UX state
  const [savedResults, setSavedResults] = useState<Array<{ type: string; content: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hfToken, setHfToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSavedCurrent, setHasSavedCurrent] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  // Helper to mask tokens in logs (e.g., hf_***abcd)
  const maskToken = (token: string) => {
    if (!token) return 'hf_***';
    const last4 = token.slice(-4);
    return `hf_***${last4}`;
  };

  // Typewriter effect: gradually reveal characters after the preface
  useEffect(() => {
    if (isTypingPreface) return; // wait until preface finishes
    if (generatedText && displayedText.length < generatedText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(generatedText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [generatedText, displayedText, isTypingPreface]);

  // Smoothly scroll to the result when a new generation starts showing
  useEffect(() => {
    if (generatedText && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedText]);

  useEffect(() => {
    // Load saved history from localStorage on mount
    try {
      const raw = localStorage.getItem('aiHistory');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedResults(parsed);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Auto-clear success messages after a short delay
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 2500);
    return () => clearTimeout(t);
  }, [successMsg]);


  const handleGenerate = async () => {
    console.log("Token loaded:", import.meta.env.VITE_HF_TOKEN);
    if (!topic.trim()) {
      setErrorMsg('Please enter valid text.');
      return;
    }

    setIsGenerating(true);
    setDisplayedText('');
    setGeneratedText('');
    setErrorMsg('');
    setSuccessMsg('');
    setHasSavedCurrent(false);
    
    try {
      const prompt = `Generate a ${contentType} about: ${topic}`;
      setIsTypingPreface(true);
    
      // ⚡ Mock delay to simulate API processing
      await new Promise((res) => setTimeout(res, 1500));
    
      let text = '';
      if (contentType === 'Instagram Caption') {
        text = `✨ Here's an engaging caption about ${topic}:\n\n"${topic} 🌟 — Every frame tells a story. Let the colors, smiles, and energy speak louder than words. #${topic.replace(/\s+/g, '')} #vibes #aesthetic"`;
      } else if (contentType === 'Blog Intro') {
        text = `📝 Blog Intro about ${topic}:\n\nEver wondered what makes ${topic.toLowerCase()} so fascinating? In this post, we’ll uncover its hidden beauty, real-world impact, and why it’s capturing everyone’s attention in 2025. Let’s dive deeper together!`;
      } else if (contentType === 'Email Copy') {
        text = `📧 Email Copy about ${topic}:\n\nHi there 👋,\n\nWe’ve got something exciting for you — ${topic} that’s built to inspire, simplify, and elevate your day. Check it out and see why so many are talking about it!\n\nBest,\nThe AI Content Studio Team`;
      } else {
        text = `✨ AI generated content about ${topic}:\n\n${topic} represents innovation, creativity, and a fresh way to connect. Let's make it shine with your unique voice.`;
      }

      setIsTypingPreface(false);
      setGeneratedText(text);
      setSuccessMsg('Generated successfully .');
    } catch (err: unknown) {
      setGeneratedText('');
      setDisplayedText('');
      setErrorMsg('Connection failed. Check token or try again later.');    
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedText.trim()) return;
    const newItem = { type: contentType, content: generatedText };
    const next = [newItem, ...savedResults];
    setSavedResults(next);
    try {
      localStorage.setItem('aiHistory', JSON.stringify(next));
    } catch {
      // storage might be unavailable
    }
    setHasSavedCurrent(true);
    setSuccessMsg('Saved to history.');
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1e1b4b] to-[#2d1b69] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 relative z-10 animate-fade-in">
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 animate-slide-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-cyan-400 animate-glow" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/50 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                AI Content Studio
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-400 rounded-full mt-2"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-cyan-300 text-sm font-medium">Your Topic or Idea</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your topic or idea…"
                className="w-full h-32 bg-black/40 border border-cyan-500/30 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-cyan-300 text-sm font-medium">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/30 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-pointer"
              >
                <option value="Instagram Caption">Instagram Caption</option>
                <option value="Blog Intro">Blog Intro</option>
                <option value="Email Copy">Email Copy</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-cyan-300 text-sm font-medium">Hugging Face Token (optional)</label>
              <input
                type="password"
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_..."
                className="w-full bg-black/40 border border-cyan-500/30 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>

            {errorMsg && (
              <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-sm">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="text-green-300 bg-green-500/10 border border-green-500/30 rounded-2xl p-3 text-sm">
                {successMsg}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-400 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-2xl hover:shadow-fuchsia-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isGenerating ? 'Generating Magic...' : 'Generate Content'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {displayedText && (
              <div ref={resultRef} className="bg-black/40 border border-fuchsia-500/30 rounded-2xl p-6 space-y-2 animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-fuchsia-300 font-semibold">Generated Result</h3>
                  <button
                    onClick={() => handleCopy(generatedText, -1)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {copiedIndex === -1 ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {isTypingPreface && (
                  <div className="text-cyan-300 text-sm animate-pulse">AI is typing…</div>
                )}
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {displayedText}
                  {displayedText.length < generatedText.length && (
                    <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-1 animate-blink"></span>
                  )}
                </p>
                {generatedText && displayedText.length === generatedText.length && (
                  <div className="pt-3">
                    <button
                      onClick={handleSave}
                      disabled={hasSavedCurrent}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasSavedCurrent ? 'Saved' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-80 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-fuchsia-500/20 shadow-2xl shadow-fuchsia-500/10 animate-slide-up delay-200">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-fuchsia-400">Saved Results</span>
            <span className="text-sm text-gray-400">({savedResults.length})</span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {savedResults.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Generate content to see your saved results here
              </p>
            ) : (
              savedResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/40 transition-all group animate-slide-up"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-300">{result.type}</span>
                    <button
                      onClick={() => handleCopy(result.content, index)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {result.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
