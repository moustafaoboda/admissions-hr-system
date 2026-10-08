import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PRESET_ICONS = [
  { id: "anchor", icon: "fa-anchor", label: "Anchor (Naval)" },
  { id: "building-columns", icon: "fa-building-columns", label: "Academy / College" },
  { id: "graduation-cap", icon: "fa-graduation-cap", label: "Graduation Cap" },
  { id: "shield-halved", icon: "fa-shield-halved", label: "Shield / Crest" },
  { id: "award", icon: "fa-award", label: "Award / Merit" },
  { id: "compass", icon: "fa-compass", label: "Compass / Nav" },
  { id: "ship", icon: "fa-ship", label: "Maritime Ship" },
  { id: "crown", icon: "fa-crown", label: "Crown / Royal" },
  { id: "landmark", icon: "fa-landmark", label: "Heritage Campus" },
  { id: "book-bookmark", icon: "fa-book-bookmark", label: "Knowledge" },
  { id: "star", icon: "fa-star", label: "Star Flagship" },
  { id: "users-gear", icon: "fa-users-gear", label: "Admissions HR" }
];

export default function SystemIconModal() {
  const { currentUser, activeModal, setActiveModal, systemIcon, updateSystemIcon } = useAuth();
  const [currentConfig, setCurrentConfig] = useState({
    type: "icon",
    value: "fa-anchor",
    imageUrl: ""
  });

  const isHeadOrVice = currentUser?.role === "HR Head" || currentUser?.role === "HR Vice Head";

  useEffect(() => {
    if (systemIcon) {
      setCurrentConfig(systemIcon);
    }
  }, [systemIcon, activeModal]);

  if (activeModal !== 'systemIcon' || !isHeadOrVice) return null;

  const handleSelectPreset = (iconClass) => {
    setCurrentConfig({
      type: "icon",
      value: iconClass,
      imageUrl: ""
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentConfig({
          type: "image",
          value: "custom",
          imageUrl: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url) => {
    if (url.trim()) {
      setCurrentConfig({
        type: "image",
        value: "custom",
        imageUrl: url.trim()
      });
    } else {
      setCurrentConfig({
        type: "icon",
        value: "fa-anchor",
        imageUrl: ""
      });
    }
  };

  const handleReset = () => {
    setCurrentConfig({
      type: "icon",
      value: "fa-anchor",
      imageUrl: ""
    });
  };

  const handleSave = () => {
    updateSystemIcon(currentConfig);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-[#002244] p-4 text-white flex items-center justify-between border-b-2 border-[#c59b27] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#c59b27] flex items-center justify-center text-sm border border-amber-400/30">
              <i className="fa-solid fa-icons"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">System Icon & Branding</h3>
              <p className="text-[10px] text-slate-300">Customize the Admissions HR Suite system logo & crest</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-white transition p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-grow">
          {/* Live Preview Box */}
          <div className="bg-gradient-to-r from-[#00162e] via-[#002244] to-[#0d3868] p-4 rounded-xl text-white flex items-center gap-4 border border-[#c59b27]/40 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#c59b27] shadow-lg overflow-hidden flex-shrink-0">
              {currentConfig.type === "image" && currentConfig.imageUrl ? (
                <img src={currentConfig.imageUrl} alt="System Crest Preview" className="w-full h-full object-contain p-1" />
              ) : (
                <i className={`fa-solid ${currentConfig.value || 'fa-anchor'} text-[#c59b27] text-2xl`}></i>
              )}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#c59b27] tracking-wider">Live System Crest Preview</span>
              <div className="font-bold text-sm text-white">Admissions HR Suite</div>
              <p className="text-[11px] text-slate-300">Displays on the top navigation bar, login screen, and system header.</p>
            </div>
          </div>

          {/* Option 1: Preset Icons */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select from Preset System Icons
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PRESET_ICONS.map(p => {
                const isSelected = currentConfig.type === "icon" && currentConfig.value === p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.icon)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center group ${
                      isSelected
                        ? 'bg-amber-50 border-[#c59b27] text-[#002244] ring-2 ring-[#c59b27]/40 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`fa-solid ${p.icon} text-lg ${isSelected ? 'text-[#c59b27]' : 'text-slate-500 group-hover:text-slate-800'}`}></i>
                    <span className="text-[10px] font-semibold truncate max-w-full leading-tight">
                      {p.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 2: Upload Custom Logo Image */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">
              Or Custom Image / Logo Upload
            </label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] border border-[#c59b27] rounded-lg font-bold text-xs cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Upload Image File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Reset to Anchor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#002244] hover:bg-[#00162e] text-[#c59b27] border border-[#c59b27] font-bold text-xs rounded-lg transition shadow-sm"
          >
            Save System Icon
          </button>
        </div>
      </div>
    </div>
  );
}
