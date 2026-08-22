import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import UploadCard from './components/UploadCard';
import LoadingSpinner from './components/LoadingSpinner';
import ReviewReport from './components/ReviewReport';
import Evaluation from './pages/Evaluation';
import Footer from './components/Footer';
import { checkHealth, reviewCode } from './services/api';
import { AlertTriangle, X } from 'lucide-react';

function CodeReviewPage({ isConnected, isCheckingHealth, fetchHealth }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMetrics, setFileMetrics] = useState({ loc: null });
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setErrorMessage('');

    try {
      const text = await file.text();
      const lines = text.split(/\r\n|\r|\n/).length;
      setFileMetrics({ loc: lines });
    } catch (e) {
      setFileMetrics({ loc: null });
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileMetrics({ loc: null });
    setErrorMessage('');
  };

  const handleResetReview = () => {
    setSelectedFile(null);
    setFileMetrics({ loc: null });
    setReviewData(null);
    setErrorMessage('');
  };

  const handleSubmitReview = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a source code file to review.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setReviewData(null);

    try {
      const data = await reviewCode(selectedFile);

      let issuesCount = 0;
      let overallScore = null;
      if (data && data.review) {
        const scoreMatch = data.review.match(/Overall Score:\s*([\d.]+)\s*\/\s*10/i);
        if (scoreMatch) overallScore = scoreMatch[1];

        const highMatches = (data.review.match(/Severity[\s*:]+`?High`?/gi) || []).length;
        const medMatches = (data.review.match(/Severity[\s*:]+`?Medium`?/gi) || []).length;
        const lowMatches = (data.review.match(/Severity[\s*:]+`?Low`?/gi) || []).length;
        issuesCount = highMatches + medMatches + lowMatches;
      }

      setReviewData({
        ...data,
        overall_score: overallScore,
        metrics: {
          ...fileMetrics,
          issues_count: issuesCount,
          total_lines: fileMetrics.loc,
        },
      });
    } catch (err) {
      if (!err.response) {
        setErrorMessage(
          'Unable to connect to the backend server. Please verify the FastAPI backend is running on port 8000.'
        );
      } else if (err.response.data && err.response.data.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage('An unexpected error occurred during the review process. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      <Header
        isConnected={isConnected}
        isChecking={isCheckingHealth}
        onRefreshHealth={fetchHealth}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 shadow-lg flex items-start justify-between gap-3 text-rose-200 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-100">Review Error</h4>
                <p className="text-xs sm:text-sm text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-900/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <MetricCards
          metrics={{
            loc: fileMetrics.loc,
            issues_count: reviewData?.metrics?.issues_count,
            security_score: reviewData?.overall_score,
          }}
          selectedFile={selectedFile}
          reviewData={reviewData}
          isLoading={isLoading}
        />

        <UploadCard
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onSubmit={handleSubmitReview}
          isLoading={isLoading}
          disabled={!isConnected && !selectedFile}
        />

        {isLoading && <LoadingSpinner />}

        {reviewData && !isLoading && (
          <ReviewReport
            filename={reviewData.filename}
            reviewMarkdown={reviewData.review}
            executionTime={reviewData.execution_time}
            route={reviewData.route}
            onReset={handleResetReview}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchHealth = async () => {
    setIsCheckingHealth(true);
    try {
      await checkHealth();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <Routes>
      {/* Homepage: Pure Code Review Interface */}
      <Route
        path="/"
        element={
          <CodeReviewPage
            isConnected={isConnected}
            isCheckingHealth={isCheckingHealth}
            fetchHealth={fetchHealth}
          />
        }
      />

      {/* Developer-only Benchmark Evaluation Route */}
      <Route
        path="/evaluation"
        element={
          <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
            <Header
              isConnected={isConnected}
              isChecking={isCheckingHealth}
              onRefreshHealth={fetchHealth}
            />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <Evaluation />
            </main>
            <Footer />
          </div>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
