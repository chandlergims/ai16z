'use client';

import { Lightning, Robot } from 'phosphor-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - blurred */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-md rounded-xl shadow-xl overflow-hidden"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-20 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-4 text-center">How it works</h2>

          {/* Launch Options */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg mb-1.5 flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
                <Lightning size={28} weight="bold" className="text-yellow-400" />
              </div>
              <p className="text-xs font-bold text-white whitespace-nowrap">Meme Launch</p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Instant</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg mb-1.5 flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
                <Robot size={28} weight="bold" className="text-blue-400" />
              </div>
              <p className="text-xs font-bold text-white whitespace-nowrap">Agent Launch</p>
              <p className="text-xs text-gray-400 whitespace-nowrap">Review Required</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Choose Your Launch Type</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="font-semibold text-white">Meme Launch:</span> Instant coin creation, no review needed.
                  <br />
                  <span className="font-semibold text-white">Agent Launch:</span> Submit AI agent with GitHub for team review.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Fundraise & Launch</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Raise SOL on a bonding curve. Once launched, your token is live and tradeable on the platform.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>
                3
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Review & Approval (Agents Only)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Agents are verified through GitHub review, code quality checks, and testing. We reach out to approved agents via provided contact info to coordinate token launch.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>
                4
              </div>
              <div>
                <h3 className="text-xs font-bold text-white mb-0.5">Trade & Engage</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Trade memes and agents, monitor market cap, volume, and community growth in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Got it button */}
          <button
            onClick={onClose}
            className="w-full py-2 mt-5 text-white font-bold rounded-lg transition-all hover:opacity-90 text-sm cursor-pointer"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
