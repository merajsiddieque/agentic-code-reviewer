import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileCode2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  Code2,
  Sparkles,
  FileText,
} from 'lucide-react';

const SUPPORTED_EXTENSIONS = [
  { ext: '.py', label: 'Python', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { ext: '.js', label: 'JavaScript', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { ext: '.jsx', label: 'React JSX', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  { ext: '.ts', label: 'TypeScript', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { ext: '.tsx', label: 'React TSX', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  { ext: '.java', label: 'Java', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  { ext: '.html', label: 'HTML5', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  { ext: '.css', label: 'CSS3', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  { ext: '.md', label: 'Markdown', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { ext: '.json', label: 'JSON', color: 'text-teal-400 bg-teal-400/10 border-teal-400/20' },
  { ext: '.yml', label: 'YAML', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  { ext: '.yaml', label: 'YAML', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
];

const UNIQUE_BADGES = [
  { name: 'Python', ext: '.py', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { name: 'JavaScript', ext: '.js', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { name: 'TypeScript', ext: '.ts', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'React', ext: '.jsx,.tsx', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { name: 'Java', ext: '.java', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { name: 'HTML / CSS', ext: '.html,.css', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { name: 'Markdown', ext: '.md', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'JSON / YAML', ext: '.json,.yaml', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
];

const ACCEPT_STRING = SUPPORTED_EXTENSIONS.map((e) => e.ext).join(',');

export default function UploadCard({
  onFileSelect,
  selectedFile,
  onClearFile,
  onSubmit,
  isLoading,
  disabled,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleValidateAndSelect = (file) => {
    setValidationError('');
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSupported =
      SUPPORTED_EXTENSIONS.some((item) => lowerName.endsWith(item.ext)) ||
      lowerName === 'readme' ||
      lowerName.startsWith('readme.');

    if (!isSupported) {
      setValidationError(
        'Unsupported file type. Supported: Python, JavaScript, TypeScript, JSX, Java, HTML/CSS, Markdown, JSON, YAML'
      );
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected file is empty. Please select a valid source code file.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] shadow-2xl backdrop-blur-md transition-all duration-300 mb-8">
      {/* Top Accent Gradient Border */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

      <div className="p-6 sm:p-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                Upload Source Code
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
              Select or drop any supported source code or config file for automated AST &amp; LLM audit.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#0B1120] text-zinc-300 border border-[#1F2937]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Language Engine</span>
          </div>
        </div>

        {/* Supported Languages Badges Bar */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1">
            Supported:
          </span>
          {UNIQUE_BADGES.map((badge, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.color} transition-colors`}
            >
              {badge.name}
            </span>
          ))}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-start gap-3 text-rose-200 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{validationError}</div>
          </div>
        )}

        {/* Drag & Drop Area / Selected File Display */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-950/40 scale-[0.99] shadow-2xl shadow-indigo-950/50'
                : 'border-[#1F2937] bg-[#0B1120]/60 hover:border-indigo-500/70 hover:bg-[#0B1120]/90 hover:shadow-lg'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#111827] border border-[#1F2937] text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition-all duration-300 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <p className="text-base sm:text-lg font-semibold text-zinc-100 mb-1 tracking-tight">
              Drag and drop source code file here
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4">
              or <span className="text-indigo-400 font-medium underline underline-offset-4 group-hover:text-indigo-300">browse file from your machine</span>
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono text-zinc-400 bg-[#111827] border border-[#1F2937]">
              <span>.py, .js, .jsx, .ts, .tsx, .java, .html, .css, .md, .json, .yml, .yaml</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B1120]/80 p-5 backdrop-blur shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 font-mono text-sm sm:text-base break-all">
                      {selectedFile.name}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">
                    Size: <span className="text-zinc-300">{formatFileSize(selectedFile.size)}</span> • Ready for pipeline
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-xl transition-colors disabled:opacity-50"
                >
                  Replace File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_STRING}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={onClearFile}
                  disabled={isLoading}
                  title="Remove selected file"
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors disabled:opacity-50 border border-transparent hover:border-rose-900"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-400 font-mono">
            {selectedFile ? 'File verified. Click to initiate agentic workflow.' : 'Select a file to begin review.'}
          </span>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedFile || isLoading || disabled}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-sm shadow-xl transition-all duration-300 ${
              !selectedFile || isLoading || disabled
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white active:scale-[0.98] shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-indigo-400/30'
            }`}
          >
            <span>{isLoading ? 'Analyzing Codebase...' : 'Start Code Review'}</span>
            <ArrowRight className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

