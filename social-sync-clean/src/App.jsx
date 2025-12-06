import React, { useState, useEffect, useRef } from 'react';
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
  Copy,
  Upload,
  File,
  Trash2,
  ExternalLink
} from 'lucide-react';

// --- Configuration ---
const BACKEND_URL = "http://localhost:4000";
// Map UI names ("X", "Facebook", "LinkedIn") to backend provider keys ("x", "facebook", "linkedin")
const PROVIDER_KEY = {
  X: "x",
  Facebook: "facebook",
  LinkedIn: "linkedin",
};

// helper to start OAuth flow
async function startOAuth(platformUiName, setConnectingPlatform) {
  const provider = PROVIDER_KEY[platformUiName];

  if (!provider) {
    alert(`Unknown provider: ${platformUiName}`);
    return;
  }

  setConnectingPlatform(platformUiName);

  try {
    const res = await fetch(`http://localhost:4000/auth/${provider}/start`, {
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    if (!data.url) throw new Error("No auth URL returned from backend.");

    // redirect to Twitter/Facebook/LinkedIn
    window.location.href = data.url;
  } catch (err) {
    console.error("Connect error:", err);
    alert("Failed to connect to backend. Please check if server.js is running.");
  } finally {
    setConnectingPlatform(null);
  }
}

// --- UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    outline: "border-2 border-gray-200 hover:border-blue-500 text-gray-600 hover:text-blue-600",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-500"
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

// Helper for iframe-safe clipboard copying
const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy', err);
  }
  
  document.body.removeChild(textArea);
};

const PlatformEditor = ({ platform, content, setContent, isConnected, isConnecting, onConnect, color, icon: Icon, maxLength }) => {
  const charCount = content.length;
  const isOverLimit = maxLength && charCount > maxLength;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isConnected) {
      copyToClipboard(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          disabled={isConnected || isConnecting}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-2 ${
            isConnected 
              ? 'bg-green-100 text-green-700 cursor-default' 
              : isConnecting
                ? 'bg-blue-100 text-blue-700 cursor-wait'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Connecting...
            </>
          ) : (
            isConnected ? 'Connected' : 'Connect'
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 relative">
        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <button 
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
              {isConnecting ? 'Redirecting to Login...' : `Link ${platform} Account`}
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
           <button 
             onClick={handleCopy} 
             className={`flex items-center gap-1 transition-colors ${copied ? 'text-green-600' : 'hover:text-blue-600'}`} 
             title="Copy text"
           >
             {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
             {copied && <span>Copied</span>}
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
  const [attachment, setAttachment] = useState(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Connection States (Defaults to false now for real implementation)
  const [connections, setConnections] = useState({
    X: false,
    Facebook: false,
    LinkedIn: false
  });
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  // Draft States
  const [drafts, setDrafts] = useState({
    X: '',
    Facebook: '',
    LinkedIn: ''
  });

  const fileInputRef = useRef(null);

  // --- 1. OAUTH CALLBACK HANDLING ---
  // On load, check if the URL has ?connected=x
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedPlatform = params.get('connected'); // e.g., 'x', 'facebook'
    const error = params.get('error');

    if (connectedPlatform) {
        // Map lowercase backend slug to our state keys (X, Facebook, LinkedIn)
        const keyMap = { x: 'X', facebook: 'Facebook', linkedin: 'LinkedIn' };
        const key = keyMap[connectedPlatform.toLowerCase()];
        
        if (key) {
            setConnections(prev => ({ ...prev, [key]: true }));
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            alert(`${key} connected successfully!`);
        }
    } else if (error) {
        alert("Failed to connect account. Please check the backend console.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- Logic ---

  const generateDrafts = async () => {
    if (!sourceText.trim() && !attachment) return;
    
    setIsGenerating(true);
    
    try {
      const apiKey = ""; // Provided at runtime
      const basePrompt = `Rewrite the provided content (text or document) for three social media platforms: X (formerly Twitter), Facebook, and LinkedIn. 
      
      For X: Make it punchy, use hashtags, and keep it under 280 characters.
      For Facebook: Make it casual, engaging, and encourage discussion.
      For LinkedIn: Make it professional, insightful, and industry-focused.

      Return the response as a JSON object with keys: "X", "Facebook", "LinkedIn".
      
      IMPORTANT: Do not include markdown formatting like \`\`\`json. Return raw JSON.`;

      // Construct Payload
      const parts = [{ text: basePrompt }];
      
      // Add text input if available
      if (sourceText) {
        parts.push({ text: `\n\nAdditional Context/Text to Rewrite:\n${sourceText}` });
      }

      // Add attachment if available (PDF/Docx/Image)
      if (attachment && attachment.isBinary) {
        const base64Data = attachment.data.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: attachment.type,
            data: base64Data
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: parts }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        const parsed = JSON.parse(generatedText);
        setDrafts({
            X: parsed.X || '',
            Facebook: parsed.Facebook || '',
            LinkedIn: parsed.LinkedIn || ''
        });
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert(`Failed to generate drafts. Error: ${error.message || "Unknown error"}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 2. REAL OAUTH START ---
  const handleConnection = async (platformName) => {
    // If already connected, handle disconnect locally
    if (connections[platformName]) {
      if (confirm(`Are you sure you want to disconnect your ${platformName} account?`)) {
        setConnections(prev => ({ ...prev, [platformName]: false }));
        // Note: In a real app, you should also call a backend endpoint to clear the token.
      }
      return;
    }

    setConnectingPlatform(platformName);

    try {
        const slug = platformName.toLowerCase(); // 'x', 'facebook', 'linkedin'
        const response = await fetch(`${BACKEND_URL}/auth/${slug}/start`);
        const data = await response.json();

        if (data.url) {
            // Redirect user to the Provider's OAuth page
            window.location.href = data.url;
        } else {
            alert("Could not initiate login. Is the backend running?");
            setConnectingPlatform(null);
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Failed to connect to backend. Please check if server.js is running.");
        setConnectingPlatform(null);
    }
  };

  // --- 3. REAL PUBLISH LOGIC ---
  const handlePublish = async () => {
    const activePlatforms = Object.entries(connections)
        .filter(([_, connected]) => connected)
        .map(([key]) => key); // ['X', 'Facebook']
    
    if (activePlatforms.length === 0) {
      alert("Please connect at least one account to publish.");
      return;
    }

    setIsPublishing(true);

    try {
        const results = await Promise.allSettled(activePlatforms.map(async (platform) => {
            const content = drafts[platform];
            if (!content) return { status: 'skipped', platform };

            // Send to backend
            const slug = platform.toLowerCase();
            const res = await fetch(`${BACKEND_URL}/publish/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return { status: 'success', platform, data };
        }));

        // Check results
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length > 0) {
            alert(`Some posts failed to publish.\nCheck console for details.`);
            console.error("Publish Failures:", failures);
        } else {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }

    } catch (err) {
        alert("System error during publish.");
        console.error(err);
    } finally {
        setIsPublishing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachment(null);

    const isText = file.type === 'text/plain' || file.type === 'application/json' || file.name.endsWith('.md');
    
    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => setSourceText(e.target.result);
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachment({
          name: file.name,
          type: file.type,
          data: e.target.result,
          isBinary: true
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const clearAttachment = () => {
    setAttachment(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
                <span className={`w-2 h-2 rounded-full mr-2 ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                System Ready
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
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
                 accept=".txt,.md,.json,.pdf,.docx"
               />
               <button 
                 onClick={triggerFileUpload}
                 className="text-sm text-blue-600 hover:underline flex items-center gap-1"
               >
                 <Upload size={14} /> Upload File
               </button>
               <span className="text-gray-300">|</span>
               <button 
                 onClick={() => navigator.clipboard.readText().then(text => setSourceText(text)).catch(() => alert("Please paste manually using Ctrl+V"))}
                 className="text-sm text-blue-600 hover:underline"
               >
                 Paste Link
               </button>
            </div>
          </div>
          
          <div className="relative group">
            {/* Attachment Badge */}
            {attachment && (
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-white p-2 rounded-md text-blue-500">
                     <File size={20} />
                   </div>
                   <div>
                     <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-md">{attachment.name}</p>
                     <p className="text-xs text-gray-500 uppercase">{attachment.type.split('/')[1] || 'File'}</p>
                   </div>
                </div>
                <button 
                  onClick={clearAttachment}
                  className="p-1 hover:bg-blue-100 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}

            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={attachment 
                ? "\n\n\n\nAdd any specific instructions for how to process the attached file..." 
                : "Paste your news article, paper abstract, or prompt here... \nOr upload a PDF/Word document."}
              className={`w-full h-40 p-5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none text-gray-700 leading-relaxed ${attachment ? 'pt-24' : ''}`}
            />
            <div className="absolute bottom-4 right-4">
              <Button 
                onClick={generateDrafts} 
                disabled={(!sourceText && !attachment) || isGenerating}
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
              isConnecting={connectingPlatform === 'X'}
              onConnect={() => handleConnection('X')}
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
              isConnecting={connectingPlatform === 'Facebook'}
              onConnect={() => handleConnection('Facebook')}
            />

            {/* LinkedIn */}
            <PlatformEditor
              platform="LinkedIn"
              icon={Linkedin}
              color="bg-[#0A66C2]"
              content={drafts.LinkedIn}
              setContent={(text) => setDrafts(prev => ({...prev, LinkedIn: text}))}
              isConnected={connections.LinkedIn}
              isConnecting={connectingPlatform === 'LinkedIn'}
              onConnect={() => handleConnection('LinkedIn')}
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