import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Layout, Info } from 'lucide-react';
import CompareSlider from './components/CompareSlider';
import StyleSelector from './components/StyleSelector';
import ChatInterface from './components/ChatInterface';
import { generateDesign, sendChatMessage } from './services/geminiService';
import { Message, DesignStyle, LoadingState } from './types';

// Predefined styles for the carousel
const STYLES: DesignStyle[] = [
  { id: 'mcm', name: 'Mid-Century', prompt: 'Mid-Century Modern interior design style, teak wood, organic curves, clean lines', thumbnail: 'https://picsum.photos/id/401/300/400' },
  { id: 'scandi', name: 'Scandinavian', prompt: 'Scandinavian interior design, minimalist, bright, white walls, light wood, cozy textiles', thumbnail: 'https://picsum.photos/id/201/300/400' },
  { id: 'industrial', name: 'Industrial', prompt: 'Industrial loft style, exposed brick, metal accents, leather furniture, raw materials', thumbnail: 'https://picsum.photos/id/364/300/400' },
  { id: 'boho', name: 'Bohemian', prompt: 'Bohemian eclectic style, many plants, patterned rugs, warm colors, rattan furniture', thumbnail: 'https://picsum.photos/id/431/300/400' },
  { id: 'japandi', name: 'Japandi', prompt: 'Japandi style, blend of Japanese rustic minimalism and Scandinavian functionality, neutral tones', thumbnail: 'https://picsum.photos/id/60/300/400' },
];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOriginalImage(event.target.result as string);
        setGeneratedImage(null); // Reset generated on new upload
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: "Great photo! Select a style above to reimagine this space, or type a custom instruction below."
        }]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Style Selection (Gemini Image Gen)
  const handleStyleSelect = async (style: DesignStyle) => {
    if (!originalImage) return;

    setLoadingState(LoadingState.GENERATING);
    try {
      const result = await generateDesign(originalImage, style.prompt);
      setGeneratedImage(result);
      
      const newMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `Here is the ${style.name} version of your room! Use the slider to compare. You can refine this further in the chat.`
      };
      setMessages(prev => [...prev, newMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error generating the design. Please try again."
      }]);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  // Handle Chat or Refinement
  const handleSendMessage = async (text: string, isRefinement: boolean) => {
    if (!originalImage) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    if (isRefinement) {
      // MODE: Image Editing (Nano Banana)
      setLoadingState(LoadingState.GENERATING);
      try {
        // We use the ORIGINAL image as the base for edits to prevent degradation, 
        // or we could use the generated one if we want iterative edits.
        // For 'Refine', usually using the last generated state is intuitive, 
        // but often results in artifacts. Let's stick to original + prompt 
        // OR original + style + new prompt.
        // For simplicity in this demo: We act on the *Original* with the *New* prompt.
        // To support "Keep layout but make rug blue", passing the original is best.
        
        // However, if we already have a generated image, users might expect to edit THAT.
        // Let's try to edit the *currently visible* generated image if it exists, otherwise original.
        const sourceImage = generatedImage || originalImage;
        
        const result = await generateDesign(sourceImage, text);
        setGeneratedImage(result);
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I've updated the design based on your feedback."
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I couldn't update the image. Please try a simpler instruction."
        }]);
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    } else {
      // MODE: Text Chat (Gemini Pro)
      setLoadingState(LoadingState.CHATTING);
      try {
        // Send chat history + context
        // We pass the CURRENTLY VISIBLE image (generated or original) so the AI sees what the user sees.
        const currentContextImage = generatedImage || originalImage;
        
        // Simple history mapping
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const responseText = await sendChatMessage(history, text, currentContextImage);
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I'm having trouble connecting right now."
        }]);
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
      
      {/* Navbar / Header */}
      <header className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lumina Design</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">AI Interior Consultant</p>
          </div>
        </div>
        {!originalImage && (
           <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
             <Info size={16} />
             <span>Upload a photo to start</span>
           </div>
        )}
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
        
        {/* Left Column: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Visualizer Area */}
          <div className="w-full relative rounded-3xl bg-slate-200 min-h-[400px] flex items-center justify-center overflow-hidden shadow-inner border border-slate-300">
            {!originalImage ? (
              <div className="text-center p-10">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ImageIcon className="text-slate-400" size={32} />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-700 mb-2">Visualize your dream room</h3>
                 <p className="text-slate-500 mb-6 max-w-sm mx-auto">Upload a photo of your current room to explore new styles, colors, and layouts instantly.</p>
                 <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium cursor-pointer hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg shadow-indigo-200">
                   <Upload size={18} />
                   <span>Upload Photo</span>
                   <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                 </label>
              </div>
            ) : (
              generatedImage ? (
                <CompareSlider original={originalImage} modified={generatedImage} />
              ) : (
                <div className="relative w-full h-[500px]">
                  <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    {loadingState === LoadingState.GENERATING ? (
                      <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                         <span className="font-medium text-slate-800">Designing your room...</span>
                      </div>
                    ) : (
                      <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg">
                        <span className="font-medium text-slate-800 flex items-center gap-2">
                          <Sparkles size={16} className="text-indigo-600"/>
                          Select a style below to begin
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Style Carousel */}
          {originalImage && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 px-1 uppercase tracking-wider">Choose a Style</h2>
              <StyleSelector 
                styles={STYLES} 
                onSelect={handleStyleSelect} 
                disabled={loadingState === LoadingState.GENERATING} 
              />
            </div>
          )}
        </div>

        {/* Right Column: Chat & Context */}
        <div className="lg:col-span-4 h-full min-h-[500px]">
          {originalImage ? (
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage}
              loadingState={loadingState}
            />
          ) : (
            <div className="h-full bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-8 text-center text-slate-400">
              <p>Chat becomes available after uploading a photo.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
