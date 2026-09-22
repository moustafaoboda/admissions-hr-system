import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { callGeminiApi } from '../../lib/gemini';

export default function CopilotTab() {
  const { members, showToast } = useAuth();
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runPreset = async (type) => {
    setIsLoading(true);
    setAiOutput("AI is drafting Smart Village admissions document, please wait...");

    let prompt = "";
    if (type === "announcement") {
      prompt = "Draft a formal yet motivational WhatsApp broadcast message to all Smart Village Admissions student ambassadors regarding attendance punctuality at the registration booth and reminding them of upcoming open-day shift schedules.";
    } else if (type === "review") {
      prompt = `Analyze the current team status: ${members.length} active ambassadors with total of ${members.reduce((acc, m) => acc + m.strikes, 0)} disciplinary warnings and ${members.reduce((acc, m) => acc + m.extraDays, 0)} extra shifts completed. Provide 3 recommendations to improve motivation and reduce attendance strikes.`;
    } else {
      prompt = "Provide 5 behavioral interview questions to assess candidates applying to join the AASTMT Admissions Ambassador team at Smart Village (focusing on parent interaction, stress handling, and academy pride).";
    }

    try {
      const res = await callGeminiApi(prompt);
      setAiOutput(res);
    } catch (e) {
      setAiOutput("Error generating AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customPrompt.trim()) {
      showToast("Please enter a question or prompt for the AI.", "warning");
      return;
    }

    setIsLoading(true);
    setAiOutput("Processing custom HR analysis...");

    try {
      const res = await callGeminiApi(customPrompt);
      setAiOutput(res);
    } catch (e) {
      setAiOutput("Error generating AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(aiOutput);
    showToast("AI response copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002244] to-[#0d3868] text-[#c59b27] flex items-center justify-center text-lg shadow">
            <i className="fa-solid fa-brain"></i>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#002244]">Smart Village HR AI Assistant</h2>
            <p className="text-xs text-slate-500">Draft team announcements, evaluate roster performance, or write formal warnings.</p>
          </div>
        </div>

        {/* Quick AI Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => runPreset('announcement')}
            disabled={isLoading}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-[#c59b27] bg-slate-50 hover:bg-amber-50/40 transition disabled:opacity-50"
          >
            <div className="font-bold text-xs text-[#002244] flex items-center gap-1.5">
              <i className="fa-brands fa-whatsapp text-emerald-600"></i>
              <span>Shift WhatsApp Broadcast</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Generate professional meeting or shift announcement for Smart Village ambassadors.</p>
          </button>

          <button
            onClick={() => runPreset('review')}
            disabled={isLoading}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-[#c59b27] bg-slate-50 hover:bg-amber-50/40 transition disabled:opacity-50"
          >
            <div className="font-bold text-xs text-[#002244] flex items-center gap-1.5">
              <i className="fa-solid fa-chart-line text-blue-600"></i>
              <span>Roster Health Audit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Analyze overall team attendance, strike counts, and off-schedule days.</p>
          </button>

          <button
            onClick={() => runPreset('interview')}
            disabled={isLoading}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-[#c59b27] bg-slate-50 hover:bg-amber-50/40 transition disabled:opacity-50"
          >
            <div className="font-bold text-xs text-[#002244] flex items-center gap-1.5">
              <i className="fa-solid fa-clipboard-question text-purple-600"></i>
              <span>Room 007 Interview Questions</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Generate tailored behavioral questions for admissions candidate interviews.</p>
          </button>
        </div>

        {/* Custom Prompt Input */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Custom HR Request</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="Ask AI to draft letters, evaluate members, or prepare briefing documents..."
              className="flex-grow px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002244] focus:outline-none"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] font-bold text-xs rounded-lg transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* AI Output Box */}
        {aiOutput && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-sparkles"></i> AI Generated Response
              </span>
              <button
                onClick={copyOutput}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <i className="fa-solid fa-copy"></i> <span>Copy</span>
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
              {aiOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
