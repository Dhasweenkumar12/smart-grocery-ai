import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChefHat,
  MessageSquare,
  Clock,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { groceryApi } from '../services/api';

export const GeminiAssistantModal = ({ cart = [], onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'recipes'
  const [messages, setMessages] = useState([
    {
      sender: 'gemini',
      text: `👋 Hi! I am **Gemini AI**, your personal grocery shopping assistant and culinary chef.\n\nAsk me for **recipes** based on your cart, **dietary advice**, or help finding the best deals!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    '🍳 Suggest a dinner recipe with my cart items',
    '🥗 High-protein grocery picks under ₹250',
    '🏷️ What are today\'s top dynamic discounts?',
    '🥦 Quick 15-minute healthy breakfast ideas'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await groceryApi.askGemini(query, {
        cartItems: cart.map((i) => ({ name: i.name, price: i.sellingPrice || i.price }))
      });

      const replyText = res.data.reply || 'Here is what I found for you!';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: replyText,
          source: res.data.source,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: '⚠️ I encountered an issue connecting to the AI engine. Please try asking again in a moment!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCartRecipes = async () => {
    setActiveTab('recipes');
    if (recipes.length > 0) return;

    setLoadingRecipes(true);
    try {
      const res = await groceryApi.getGeminiRecipes(cart);
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.warn('Failed to load recipes:', err.message);
    } finally {
      setLoadingRecipes(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="gemini-ai-fab"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white font-medium rounded-full shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 group"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        </div>
        <span className="text-sm font-semibold tracking-wide">Ask Gemini AI</span>
      </button>

      {/* Slide-over Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-700/60 shadow-2xl flex flex-col h-full text-slate-100 animate-slide-left">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Gemini AI Assistant</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Culinary Chef & Grocery Advisor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
                  activeTab === 'chat'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                AI Assistant Chat
              </button>
              <button
                onClick={loadCartRecipes}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
                  activeTab === 'recipes'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                Cart Recipes ({cart.length})
              </button>
            </div>

            {/* Tab 1: Chat View */}
            {activeTab === 'chat' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div
                        className={`text-[9px] mt-1.5 opacity-60 flex items-center justify-between ${
                          msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.time}</span>
                        {msg.source && (
                          <span className="italic ml-2">⚡ {msg.source}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-400">Gemini is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Tab 2: Recipe Generator */}
            {activeTab === 'recipes' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-300">Cart-Based Chef Generator</h4>
                    <p className="text-[11px] text-slate-400">
                      Recipes matched with {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRecipes([]);
                      loadCartRecipes();
                    }}
                    className="p-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 rounded-lg flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRecipes ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {loadingRecipes ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                    <p className="text-xs">Generating gourmet recipes from your cart...</p>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ChefHat className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                    <p className="text-xs">Add a few groceries to your cart to generate recipes!</p>
                  </div>
                ) : (
                  recipes.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{rec.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-400" /> {rec.cookTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" /> {rec.calories}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                              {rec.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ingredients used from cart */}
                      {rec.usedFromCart?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Already In Your Cart
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.usedFromCart.map((ing, iIdx) => (
                              <span
                                key={iIdx}
                                className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 rounded text-[11px]"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended to add */}
                      {rec.recommendedToAdd?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                            Missing Pantry Ingredients
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.recommendedToAdd.map((ing, iIdx) => (
                              <button
                                key={iIdx}
                                onClick={() =>
                                  onAddToCart &&
                                  onAddToCart({
                                    _id: 'rec-' + iIdx,
                                    name: ing,
                                    sellingPrice: 45,
                                    category: 'Pantry Essentials',
                                    unit: '1 pack'
                                  })
                                }
                                className="px-2 py-0.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 rounded text-[11px] flex items-center gap-1 group"
                              >
                                + {ing}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      {rec.instructions?.length > 0 && (
                        <div className="border-t border-slate-700/50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Quick Method
                          </p>
                          <ol className="space-y-1 list-decimal list-inside text-[11px] text-slate-300">
                            {rec.instructions.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quick Prompt Chips */}
            {activeTab === 'chat' && (
              <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 mb-1.5 font-semibold">Suggested Questions:</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {quickPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 text-[11px] whitespace-nowrap transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            {activeTab === 'chat' && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask Gemini about recipes, groceries, diets..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
