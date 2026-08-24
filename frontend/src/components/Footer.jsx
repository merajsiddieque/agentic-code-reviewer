import React from 'react';
import { ShieldCheck, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0B1120]/90 text-zinc-400 py-8 mt-16 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Project Info */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1F2937] flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">
              Agentic Code Reviewer
            </span>
          </div>

          {/* Social Links (GitHub + LinkedIn) */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/merajsiddieque/agentic-code-reviewer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/merajsiddique"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Tech Stack & Copyright */}
        <div className="mt-6 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div>
            Powered by <span className="text-zinc-300 font-medium">LangGraph • FastAPI • React • Gemini 3.6 Flash</span>
          </div>
          <div>
            © 2026 <span className="text-zinc-300 font-medium">Meraj Alam Siddique</span>. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}