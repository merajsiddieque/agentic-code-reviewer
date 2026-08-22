import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import UploadCard from './components/UploadCard';
import LoadingSpinner from './components/LoadingSpinner';
import ReviewReport from './components/ReviewReport';
import Footer from './components/Footer';
import { checkHealth, reviewCode } from './services/api';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMetrics, setFileMetrics] = useState({ loc: null });
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setErrorMessage('');
    
    // Quick client-side line count
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
      
      // Parse markdown to extract issues count and score
      let issuesCount = 0;
      let overallScore = null;
      if (data && data.review) {
        const scoreMatch = data.review.match(/Overall Score:\s*([\d.]+)\s*\/\s*10/i);
        if (scoreMatch) overallScore = scoreMatch[1];

        // Count severity tags or bullet items in security/bugs
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
      setIsConnected(true);
    } catch (err) {
      if (!err.response) {
        setIsConnected(false);
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
      {/* Top Header */}
      <Header
        isConnected={isConnected}
        isChecking={isCheckingHealth}
        onRefreshHealth={fetchHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error Notification Banner */}
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

        {/* Dashboard Metric Statistics Cards */}
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

        {/* Upload Card Section */}
        <UploadCard
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onSubmit={handleSubmitReview}
          isLoading={isLoading}
          disabled={!isConnected && !selectedFile}
        />

        {/* Loading Spinner Section */}
        {isLoading && <LoadingSpinner />}

        {/* Review Results Report */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
