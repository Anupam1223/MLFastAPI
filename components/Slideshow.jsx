import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const THEMES = {
  light: {
    root: 'bg-slate-200',
    track: 'bg-slate-300',
    bar: 'bg-teal-600',
    chrome: 'bg-white border-slate-300',
    prev: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    next: 'bg-teal-600 text-white hover:bg-teal-700',
    dotOn: 'bg-teal-600',
    dotOff: 'bg-slate-300 hover:bg-slate-400',
  },
  dark: {
    root: 'bg-[#111111]',
    track: 'bg-gray-900',
    bar: 'bg-teal-500',
    chrome: 'bg-[#161616] border-gray-800',
    prev: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
    next: 'bg-teal-600 text-white hover:bg-teal-500',
    dotOn: 'bg-teal-500',
    dotOff: 'bg-gray-700 hover:bg-gray-500',
  },
};

/**
 * Shared slide deck chrome used by every topic section.
 *
 * `slides` accepts either component functions or { component, title } objects,
 * where `component` may be a component function or an already-created element.
 */
export default function Slideshow({ slides, theme = 'light' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = THEMES[theme] ?? THEMES.light;

  const normalized = useMemo(
    () =>
      (slides ?? []).map((entry, i) => {
        const raw = typeof entry === 'object' && 'component' in entry ? entry.component : entry;
        const title = entry?.title ?? `Slide ${i + 1}`;
        const node = React.isValidElement(raw) ? raw : React.createElement(raw);
        return { node, title };
      }),
    [slides]
  );

  const total = normalized.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') setCurrentSlide((p) => Math.min(p + 1, total - 1));
      if (e.key === 'ArrowLeft') setCurrentSlide((p) => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  if (!total) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500">
        No slides defined for this section.
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, total - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <div className={`flex flex-col flex-1 min-h-0 h-full font-sans ${t.root}`}>
      <div className={`w-full h-1.5 shrink-0 ${t.track}`}>
        <motion.div
          className={`h-full ${t.bar}`}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentSlide + 1) / total) * 100}%` }}
        />
      </div>

      <div className="flex-grow relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full overflow-y-auto"
          >
            {normalized[currentSlide].node}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={`flex justify-between items-center p-4 md:p-5 border-t z-10 shrink-0 ${t.chrome}`}
      >
        <button
          onClick={prevSlide}
          className={`p-3 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${t.prev}`}
          disabled={currentSlide === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {normalized.map((slide, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => setCurrentSlide(i)}
              title={slide.title}
              aria-label={`Go to ${slide.title}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? `w-8 ${t.dotOn}` : `w-2.5 ${t.dotOff}`
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className={`p-3 rounded-full shadow transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${t.next}`}
          disabled={currentSlide === total - 1}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
