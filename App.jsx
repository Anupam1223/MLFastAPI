import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, ChevronDown } from 'lucide-react';

const sectionModules = import.meta.glob('./sections/*.jsx', { eager: true });

const topics = Object.entries(sectionModules)
  .map(([path, module]) => {
    const filename = path.replace('./sections/', '').replace('.jsx', '');
    const orderMatch = filename.match(/(\d+)$/);
    const order = orderMatch ? parseInt(orderMatch[1], 10) : 999;
    const displayName = filename
      .replace(/\d+$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();

    return {
      order,
      filename,
      displayName,
      meta: module.meta || { title: displayName, subtitle: '' },
      Component: module.default,
    };
  })
  .sort((a, b) => a.order - b.order);

export default function App() {
  const [topicIndex, setTopicIndex] = useState(0);

  const current = topics[topicIndex];
  const total = topics.length;

  const goNext = () => setTopicIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setTopicIndex((i) => Math.max(i - 1, 0));

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <p className="text-gray-500 text-lg">
          No sections found. Add a <code>.jsx</code> file to the <code>sections/</code> folder.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-200 flex items-center justify-center font-sans p-4 overflow-hidden">
      <div className="w-full max-w-[1600px] h-full bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-800">
        <header className="bg-slate-900 text-white shadow-lg z-20 shrink-0">
          <div className="w-full px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Zap className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-sm tracking-wide text-slate-200 hidden sm:block">
                ML FastAPI
              </span>
            </div>

            <div className="w-px h-6 bg-slate-700 hidden sm:block" />

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                Topic {topicIndex + 1} <span className="opacity-70">/ {total}</span>
              </span>
            </div>

            <div className="flex-1 relative min-w-0">
              <div className="relative">
                <select
                  value={topicIndex}
                  onChange={(e) => setTopicIndex(Number(e.target.value))}
                  className="w-full appearance-none bg-slate-800 border border-slate-600 text-slate-100 text-sm font-medium px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer truncate"
                >
                  {topics.map((topic, idx) => (
                    <option key={topic.filename} value={idx}>
                      {idx + 1}. {topic.meta.title || topic.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                disabled={topicIndex === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 text-slate-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Prev</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={topicIndex === total - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-teal-600 hover:bg-teal-500 text-white active:scale-95"
              >
                <span className="hidden md:inline">Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-1 bg-slate-700">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${((topicIndex + 1) / total) * 100}%` }}
            />
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <current.Component key={current.filename} />
        </main>
      </div>
    </div>
  );
}
