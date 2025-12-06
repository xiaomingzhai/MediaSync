import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Send, 
  Wand2, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText,
  Share2,
  Link as LinkIcon,
  X as XIcon,
  Copy
} from 'lucide-react';

// --- UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    outline: "border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-600"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const PlatformEditor = ({ platform, content, setContent, isConnected, onConnect, color, icon: Icon, maxLength }) => {
  const charCount = content.length;
  const isOverLimit = maxLength && charCount > maxLength;

  return (
    <div className={`flex flex-col h-full rounded-xl border-2 transition-all duration-300 ${isConnected ? 'border-gray-200 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50 opacity-90'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? color : 'bg-gray-200 text-gray-500'}`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className={`font-bold ${isConnected ? 'text-gray-800' : 'text-gray-500'}`}>
            {platform}
          </span>
        </div>
        <button 
          onClick={onConnect}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            isConnected 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 relative">
        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <button 
              onClick={onConnect}
              className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <LinkIcon size={16} />
              Link {platform} Account
            </button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Enter your ${platform} post content here...`}
          disabled={!isConnected}
          className="w-full h-64 resize-none border-0 focus:ring-0 p-0 text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed"
          style={{ fontSize: '15px' }}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <div className="flex gap-2">
           <button onClick={() => isConnected && navigator.clipboard.writeText(content)} className="hover:text-blue-600 transition-colors" title="Copy text">
             <Copy size={14} />
           </button>
        </div>
        <span className={isOverLimit ? 'text-red-500 font-bold' : ''}>
          {charCount} {maxLength ? `/ ${maxLength}` : 'chars'}
        </span>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function SocialSync() {
  // State
  const [sourceText, setSourceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [apiKey, setApiKey] = useState(''); // Placeholder for real API key
  
  // Connection States (Mocking OAuth)
  const [connections, setConnections] = useState({
    X: true,
    Facebook: true,
    LinkedIn: true
  });

  // Draft States
  const [drafts, setDrafts] = useState({
    X: '',
    Facebook: '',
    LinkedIn: ''
  });

  // --- Logic ---

  // Mock AI Generator (Simulating LLM Response)
  const generateDrafts = async () => {
    if (!sourceText.trim()) return;
    
    setIsGenerating(true);
    
    // Simulating API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple heuristic-based rewriting logic to mimic LLM behavior
    const baseText = sourceText.slice(0, 500); // Truncate for logic
    
    const newDrafts = {
      X: `🚨 Just in! ${baseText.slice(0, 100)}...\n\nThread 👇\n#News #Update #Tech`,
      
      Facebook: `Hey friends! 👋 I just came across this interesting update and wanted to share my thoughts.\n\n"${baseText.slice(0, 200)}..."\n\nWhat do you all think about this? Let me know in the comments! 👇`,
      
      LinkedIn: `🚀 Exciting Developments in the Industry\n\nI'm thrilled to share some insights regarding the latest news: ${baseText.slice(0, 150)}...\n\nThis has significant implications for our sector. It highlights the importance of innovation and adaptability.\n\nRead more below.\n\n#Innovation #Leadership #IndustryTrends #Growth`
    };

    setDrafts(newDrafts);
    setIsGenerating(false);
  };

  const handlePublish = async () => {
    // Check if any platform is connected
    const activePlatforms = Object.entries(connections).filter(([_, connected]) => connected);
    
    if (activePlatforms.length === 0) {
      alert("Please connect at least one account to publish.");
      return;
    }

    setIsPublishing(true);
    
    // Simulate API calls to X, FB, LinkedIn
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPublishing(false);
    setShowConfetti(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const toggleConnection = (platform) => {
    setConnections(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Share2 className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Social<span className="text-blue-600">Sync</span></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                API Connected
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Success Banner */}
        {showConfetti && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={24} />
              <div>
                <h3 className="font-bold">Published Successfully!</h3>
                <p className="text-sm text-green-700">Your post is now live on all connected platforms.</p>
              </div>
            </div>
            <button onClick={() => setShowConfetti(false)} className="text-green-600 hover:text-green-800">
              <XIcon size={20} />
            </button>
          </div>
        )}

        {/* Input Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-500" size={24} />
              Source Content
            </h2>
            <div className="flex gap-2">
               <button className="text-sm text-blue-600 hover:underline">Upload PDF</button>
               <span className="text-gray-300">|</span>
               <button className="text-sm text-blue-600 hover:underline">Paste Link</button>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your news article, paper abstract, or prompt here... I will automatically rewrite it for each platform."
              className="w-full h-40 p-5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none text-gray-700 leading-relaxed"
            />
            <div className="absolute bottom-4 right-4">
              <Button 
                onClick={generateDrafts} 
                disabled={!sourceText || isGenerating}
                icon={isGenerating ? Loader2 : Wand2}
                className={isGenerating ? 'animate-pulse' : ''}
              >
                {isGenerating ? 'Rewriting...' : 'Generate Drafts'}
              </Button>
            </div>
          </div>
        </section>

        {/* Editor Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-gray-800">Preview & Edit</h2>
             <span className="text-sm text-gray-500 hidden sm:block">Edit the drafts below before publishing</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* X (Twitter) */}
            <PlatformEditor
              platform="X"
              icon={({size, className}) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
              color="bg-black"
              content={drafts.X}
              setContent={(text) => setDrafts(prev => ({...prev, X: text}))}
              isConnected={connections.X}
              onConnect={() => toggleConnection('X')}
              maxLength={280}
            />

            {/* Facebook */}
            <PlatformEditor
              platform="Facebook"
              icon={Facebook}
              color="bg-[#1877F2]"
              content={drafts.Facebook}
              setContent={(text) => setDrafts(prev => ({...prev, Facebook: text}))}
              isConnected={connections.Facebook}
              onConnect={() => toggleConnection('Facebook')}
            />

            {/* LinkedIn */}
            <PlatformEditor
              platform="LinkedIn"
              icon={Linkedin}
              color="bg-[#0A66C2]"
              content={drafts.LinkedIn}
              setContent={(text) => setDrafts(prev => ({...prev, LinkedIn: text}))}
              isConnected={connections.LinkedIn}
              onConnect={() => toggleConnection('LinkedIn')}
            />

          </div>
        </section>

        {/* Action Bar */}
        <section className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
               <AlertCircle size={16} />
               <span>You are about to publish to <strong>{Object.values(connections).filter(Boolean).length}</strong> platforms.</span>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setDrafts({X: '', Facebook: '', LinkedIn: ''})}>
                Clear All
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 sm:flex-none min-w-[200px]"
                onClick={handlePublish}
                disabled={isPublishing || (!drafts.X && !drafts.Facebook && !drafts.LinkedIn)}
                icon={isPublishing ? Loader2 : Send}
              >
                {isPublishing ? 'Publishing...' : 'Publish All Now'}
              </Button>
            </div>
          </div>
        </section>
        
        {/* Spacer for fixed footer */}
        <div className="h-20"></div>

      </main>
    </div>
  );
}