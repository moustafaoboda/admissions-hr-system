import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../../lib/supabaseClient';

export default function CloudSyncModal() {
  const { activeModal, setActiveModal, syncStatus, refreshDataFromCloud, showToast } = useAuth();
  const storedConfig = getStoredSupabaseConfig();

  const [url, setUrl] = useState(storedConfig.url || '');
  const [anonKey, setAnonKey] = useState(storedConfig.key || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (activeModal !== 'cloudSync') return null;

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Please provide both Project URL and Anon API Key.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      // Direct REST test to the Supabase endpoint
      const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/system_settings?select=key&limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });
      if (response.ok || response.status === 200 || response.status === 206) {
        setTestResult({ success: true, message: 'Connected to Supabase successfully! Realtime sync is ready.' });
      } else {
        setTestResult({ success: false, message: `Server replied with status ${response.status}. Check credentials and RLS policies.` });
      }
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      showToast('Both URL and Anon Key are required.', 'danger');
      return;
    }
    setIsSaving(true);
    saveSupabaseConfig(url.trim(), anonKey.trim());
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect from this Supabase database? System will revert to local offline mode.')) {
      clearSupabaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#001f3f] border border-[#c59b27]/40 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-black/30 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c59b27]/20 border border-[#c59b27] flex items-center justify-center text-[#c59b27]">
              <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold brand-font text-white">Live Cloud Sync & Database</h2>
              <p className="text-xs text-slate-300">Synchronize all devices in real-time with zero lag</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            syncStatus.isCloudConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus.isCloudConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  syncStatus.isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <div>
                <div className="font-bold text-sm">
                  {syncStatus.isCloudConnected ? 'Live Cloud Realtime Active' : 'Local Multi-Tab Sync Only'}
                </div>
                <div className="text-xs opacity-80">
                  {syncStatus.isCloudConnected
                    ? `Connected (${syncStatus.onlinePeers || 1} device${syncStatus.onlinePeers > 1 ? 's' : ''} live)`
                    : 'Changes sync between browser tabs on this device. Connect Supabase below for all devices.'}
                </div>
              </div>
            </div>

            {syncStatus.isCloudConnected && (
              <button
                onClick={() => {
                  refreshDataFromCloud();
                  showToast('Cloud database refreshed.');
                }}
                title="Force refresh data from Supabase"
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <i className="fa-solid fa-rotate"></i>
                <span>Fetch Now</span>
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#c59b27] placeholder-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                From your Supabase Project Settings → API → Project URL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Supabase Anon (Public) Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#c59b27] placeholder-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                From your Supabase Project Settings → API → Project API Keys → anon / public.
              </p>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500 text-rose-300'
              }`}>
                <i className={`fa-solid ${testResult.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {isTesting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plug"></i>}
                <span>Test Connection</span>
              </button>

              <div className="flex items-center gap-2">
                {storedConfig.source === 'local' && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 rounded-xl text-xs font-bold transition"
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#c59b27] hover:bg-[#dfb743] text-[#002244] rounded-xl text-xs font-extrabold shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <i className="fa-solid fa-save"></i>
                  <span>Save & Connect</span>
                </button>
              </div>
            </div>
          </form>

          {/* Database Setup Helper */}
          <div className="p-4 bg-black/20 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-database text-[#c59b27]"></i>
              <span>One-Time Database Schema Setup:</span>
            </div>
            <p>
              Run the SQL commands from <code className="text-[#dfb743] bg-black/40 px-1 py-0.5 rounded">supabase/schema.sql</code> in your Supabase SQL Editor once to set up all tables and enable Realtime replication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
