'use client';

import { useState } from 'react';

export default function Home() {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const generateVoiceover = async () => {
    if (!script.trim()) {
      alert('Please enter a script');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setAudioUrl('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          voice,
          speed,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.progress !== undefined) {
                setProgress(data.progress);
              }
              if (data.audioUrl) {
                setAudioUrl(data.audioUrl);
              }
              if (data.duration) {
                setDuration(data.duration);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate voiceover');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hour Voiceover Agent
          </h1>
          <p className="text-gray-600 mb-8">
            Generate professional voiceovers for hour-long content using AI
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your script here... (Longer scripts will generate longer audio)"
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 mt-2">
                Characters: {script.length} | Estimated duration: ~{Math.round(script.length / 900)} minutes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British Male)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {speed}x
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.25"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={isGenerating}
                />
              </div>
            </div>

            <button
              onClick={generateVoiceover}
              disabled={isGenerating || !script.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating... {progress}%</span>
                </>
              ) : (
                <span>Generate Voiceover</span>
              )}
            </button>

            {isGenerating && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {audioUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  ✓ Voiceover Generated Successfully!
                </h3>
                {duration > 0 && (
                  <p className="text-sm text-green-700 mb-3">
                    Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
                <audio controls className="w-full mb-3">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <a
                  href={audioUrl}
                  download="voiceover.mp3"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Download MP3
                </a>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>For hour-long content, provide a script of approximately 9,000-10,000 words</li>
              <li>Average speaking rate is ~150 words per minute</li>
              <li>Use punctuation to control pacing and pauses</li>
              <li>Adjust speed to fine-tune the final duration</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
