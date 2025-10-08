'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Zap
} from 'lucide-react';

interface AnalysisData {
  strengths?: string[];
  improvements?: string[];
  missing_keywords?: string[];
  [key: string]: unknown;
}

interface DetailedScore {
  id: string;
  score: number;
  date: string;
  resumeText?: string;
  jobDescription?: string;
  analysis?: AnalysisData;
  createdAt: string;
  daysAgo: number;
}

interface ScoreHistoryProps {
  scores: DetailedScore[];
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ scores }) => {

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-green-500 to-emerald-400';
    if (score >= 70) return 'from-blue-500 to-cyan-400';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    if (score >= 40) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-pink-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return Award;
    if (score >= 60) return TrendingUp;
    if (score >= 40) return AlertTriangle;
    return TrendingDown;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (daysAgo: number) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getScoreStats = () => {
    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0, trend: 0 };
    
    const average = Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
    const highest = Math.max(...scores.map(s => s.score));
    const lowest = Math.min(...scores.map(s => s.score));
    
    // Calculate trend (comparing last 3 vs previous 3 scores)
    let trend = 0;
    if (scores.length >= 6) {
      const recent = scores.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / 3;
      const previous = scores.slice(3, 6).reduce((sum, s) => sum + s.score, 0) / 3;
      trend = Math.round(recent - previous);
    }
    
    return { average, highest, lowest, trend };
  };

  const stats = getScoreStats();

  return (
    <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-700/50 overflow-hidden">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-neutral-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Target className="h-8 w-8 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white">ATS Score History</h3>
              <p className="text-neutral-400 text-sm">Track your resume optimization progress</p>
            </div>
          </div>
          
          <motion.div 
            className="text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl font-bold text-white">{scores.length}</div>
            <div className="text-neutral-400 text-sm">Total Scores</div>
          </motion.div>
        </div>

        {/* Stats Overview */}
        {scores.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-2xl font-bold text-white">{stats.average}%</div>
              <div className="text-xs text-neutral-400">Average</div>
            </motion.div>
            
            <motion.div 
              className="bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-2xl font-bold text-green-400">{stats.highest}%</div>
              <div className="text-xs text-neutral-400">Highest</div>
            </motion.div>
            
            <motion.div 
              className="bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-2xl font-bold text-red-400">{stats.lowest}%</div>
              <div className="text-xs text-neutral-400">Lowest</div>
            </motion.div>
            
            <motion.div 
              className="bg-neutral-800/60 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                stats.trend > 0 ? 'text-green-400' : stats.trend < 0 ? 'text-red-400' : 'text-neutral-300'
              }`}>
                {stats.trend > 0 ? <TrendingUp className="h-5 w-5" /> : 
                 stats.trend < 0 ? <TrendingDown className="h-5 w-5" /> : 
                 <div className="w-5 h-5" />}
                {Math.abs(stats.trend)}%
              </div>
              <div className="text-xs text-neutral-400">Trend</div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Enhanced Score Cards */}
      <div className="p-6">
        <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {scores.map((score, index) => {
            const ScoreIcon = getScoreIcon(score.score);
            const gradeInfo = getScoreGrade(score.score);
            
            return (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  type: "spring", 
                  stiffness: 100,
                  damping: 15 
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score.score)} opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`} />
                
                {/* Header */}
                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* Score Badge */}
                    <motion.div
                      className={`relative overflow-hidden rounded-2xl p-4 ${gradeInfo.bg} ${gradeInfo.border} border-2`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score.score)} opacity-10`} />
                      <div className="relative flex items-center gap-2">
                        <ScoreIcon className={`h-6 w-6 ${gradeInfo.color}`} />
                        <div className="text-center">
                          <div className={`text-2xl font-black ${gradeInfo.color}`}>{score.score}%</div>
                          <div className={`text-xs font-bold ${gradeInfo.color} opacity-70`}>{gradeInfo.grade}</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Date Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{formatDate(score.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{formatRelativeTime(score.daysAgo)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Indicator */}
                  <div className="flex flex-col items-end">
                    <div className={`w-3 h-16 rounded-full bg-gradient-to-t ${getScoreColor(score.score)} shadow-lg`} />
                    <div className="text-xs text-neutral-400 mt-2">Score</div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="relative space-y-6">
                  {/* Resume & Job Description */}
                  {(score.resumeText || score.jobDescription) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {score.resumeText && (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                            <div className="p-1 bg-blue-900/50 rounded">
                              <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            Resume Content
                          </div>
                          <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/50">
                            <p className="text-sm text-neutral-300 leading-relaxed">
                              {truncateText(score.resumeText, 120)}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {score.jobDescription && (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                            <div className="p-1 bg-purple-900/50 rounded">
                              <Target className="h-4 w-4 text-purple-400" />
                            </div>
                            Job Description
                          </div>
                          <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800/50">
                            <p className="text-sm text-neutral-300 leading-relaxed">
                              {truncateText(score.jobDescription, 120)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Enhanced Analysis Section */}
                  {score.analysis && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-4">
                        <div className="p-1 bg-emerald-900/50 rounded">
                          <BarChart3 className="h-4 w-4 text-emerald-400" />
                        </div>
                        Analysis Insights
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {score.analysis.strengths && score.analysis.strengths.length > 0 && (
                          <motion.div 
                            className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/50"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-200">Strengths</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                              {score.analysis.strengths.length}
                            </div>
                            <div className="text-xs text-emerald-400 opacity-70">
                              Areas of excellence
                            </div>
                          </motion.div>
                        )}
                        
                        {score.analysis.improvements && score.analysis.improvements.length > 0 && (
                          <motion.div 
                            className="bg-amber-900/20 rounded-xl p-4 border border-amber-800/50"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                              <span className="text-sm font-medium text-amber-200">Improvements</span>
                            </div>
                            <div className="text-2xl font-bold text-amber-400">
                              {score.analysis.improvements.length}
                            </div>
                            <div className="text-xs text-amber-400 opacity-70">
                              Suggested changes
                            </div>
                          </motion.div>
                        )}
                        
                        {score.analysis.missing_keywords && score.analysis.missing_keywords.length > 0 && (
                          <motion.div 
                            className="bg-red-900/20 rounded-xl p-4 border border-red-800/50"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="h-4 w-4 text-red-400" />
                              <span className="text-sm font-medium text-red-200">Missing Keywords</span>
                            </div>
                            <div className="text-2xl font-bold text-red-400">
                              {score.analysis.missing_keywords.length}
                            </div>
                            <div className="text-xs text-red-400 opacity-70">
                              Keywords to add
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Empty State */}
      {scores.length === 0 && (
        <div className="p-6">
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative mx-auto mb-8 w-24 h-24"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-20" />
              <div className="relative flex items-center justify-center w-full h-full">
                <Target className="h-12 w-12 text-blue-400" />
              </div>
            </motion.div>
            
            <h4 className="text-xl font-bold text-neutral-200 mb-3">
              No ATS Scores Yet
            </h4>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Submit your resume for analysis to start tracking your ATS optimization progress and see detailed insights.
            </p>
            
            <motion.button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-5 w-5" />
              Get Your First Score
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default React.memo(ScoreHistory);