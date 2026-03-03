import React, { useEffect, useState } from 'react';
import Navbar from '../Navigation/Navbar';
import { userService } from '../../services/api';
import { useToast } from '../Shared/ToastContext';
import { TrendingUp, Target, Award, Clock } from 'lucide-react';
import '../../styles/LifeAnalytics.css';

export default function LifeAnalyticsPage() {
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [analyticsRes, streakRes] = await Promise.all([
          userService.getAnalytics(),
          userService.getStreak()
        ]);
        setAnalytics(analyticsRes.data);
        setStreakDays(streakRes.data?.currentStreak || 0);
      } catch (err) {
        let msg = err.response?.data?.message || err.message || 'Failed to load analytics data';
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  const getPerformanceMessage = (percentage) => {
    if (percentage === 0) return 'Start creating dreams to track your progress!';
    if (percentage < 25) return 'Every journey begins with a single step. Keep going! 🌱';
    if (percentage < 50) return 'You\'re building momentum! Stay focused. 🚀';
    if (percentage < 75) return 'You\'re crushing your goals! Keep pushing! 💪';
    return 'You\'re a dream achiever! Incredible progress! 🌟';
  };

  if (loading) {
    return (
      <div className="life-analytics-page">
        <Navbar streakDays={streakDays} />
        <main className="life-analytics-main">
          <div className="analytics-container">
            <p className="loading-text">Loading your life analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="life-analytics-page">
        <Navbar streakDays={streakDays} />
        <main className="life-analytics-main">
          <div className="analytics-container">
            <p className="error-text">Failed to load analytics. Please try again.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="life-analytics-page">
      <Navbar streakDays={streakDays} />
      <main className="life-analytics-main">
        <div className="analytics-container">
          {/* Header */}
          <div className="analytics-header">
            <h1 className="analytics-title">Life Analytics</h1>
            <p className="analytics-subtitle">Your progress at a glance</p>
          </div>

          {/* SECTION A: Summary Cards */}
          <section className="summary-section">
            <h2 className="section-title">Summary Metrics</h2>
            <div className="metrics-grid">
              {/* Total Dreams Card */}
              <div className="metric-card">
                <div className="metric-icon total-dreams">
                  <Target size={32} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">Total Dreams</p>
                  <p className="metric-value">{analytics.totalDreams}</p>
                </div>
              </div>

              {/* Completed Dreams Card */}
              <div className="metric-card">
                <div className="metric-icon completed-dreams">
                  <Award size={32} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">Completed</p>
                  <p className="metric-value">{analytics.completedDreams}</p>
                </div>
              </div>

              {/* Milestones Card */}
              <div className="metric-card">
                <div className="metric-icon milestones">
                  <TrendingUp size={32} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">Milestones Done</p>
                  <p className="metric-value">{analytics.totalMilestonesCompleted}</p>
                </div>
              </div>

              {/* Average Completion Time Card */}
              <div className="metric-card">
                <div className="metric-icon avg-time">
                  <Clock size={32} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">Avg Completion</p>
                  <p className="metric-value">{analytics.averageCompletionDays.toFixed(1)} days</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: Monthly Progress */}
          <section className="progress-section">
            <h2 className="section-title">Completion Progress</h2>
            <div className="progress-container">
              <div className="progress-stats">
                <div className="progress-value">{analytics.completionPercentage}%</div>
                <p className="progress-text">{analytics.totalDreams > 0 ? `${analytics.completedDreams} of ${analytics.totalDreams} dreams completed` : 'No dreams yet'}</p>
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${analytics.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION C: Streak History Graph */}
          <section className="streak-history-section">
            <h2 className="section-title">Streak History</h2>
            <div className="streak-stats">
              <div className="streak-stat-box">
                <p className="streak-stat-label">Current Streak</p>
                <p className="streak-stat-value">{analytics.currentStreak}</p>
                <p className="streak-stat-emoji">🔥</p>
              </div>
              <div className="streak-stat-box">
                <p className="streak-stat-label">Longest Streak</p>
                <p className="streak-stat-value">{analytics.longestStreak}</p>
                <p className="streak-stat-emoji">🏆</p>
              </div>
            </div>

            {/* Simple streak graph */}
            <div className="streak-graph-container">
              <StreakGraph data={analytics.streakHistory} />
            </div>
          </section>

          {/* SECTION D: Performance Message */}
          <section className="performance-section">
            <div className="performance-message">
              <p className="performance-text">
                {getPerformanceMessage(analytics.completionPercentage)}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * Simple SVG-based streak graph component
 */
function StreakGraph({ data }) {
  if (!data || data.length === 0) {
    return <p className="no-data-text">No streak data available yet.</p>;
  }

  const maxValue = Math.max(...data.map(d => d.streakValue), 1);
  const graphHeight = 200;
  const graphWidth = Math.max(400, data.length * 50);
  const padding = 40;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (graphWidth - 2 * padding);
    const y = graphHeight - padding - (point.streakValue / maxValue) * (graphHeight - 2 * padding);
    return { x, y, ...point };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="streak-graph">
      <svg width={graphWidth} height={graphHeight} className="streak-svg">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={graphHeight - padding - (graphHeight - 2 * padding) * ratio}
            x2={graphWidth - padding}
            y2={graphHeight - padding - (graphHeight - 2 * padding) * ratio}
            className="grid-line"
          />
        ))}

        {/* Path line */}
        <path d={pathData} className="streak-line" fill="none" strokeWidth={3} />

        {/* Points */}
        {points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={5}
            className="streak-point"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <text
            key={`label-${i}`}
            x={padding - 10}
            y={graphHeight - padding - (graphHeight - 2 * padding) * ratio + 5}
            className="axis-label"
            textAnchor="end"
          >
            {Math.round(maxValue * ratio)}
          </text>
        ))}

        {/* X-axis labels */}
        {points.map((point, i) => {
          if (i % Math.max(1, Math.floor(points.length / 4)) !== 0 && i !== points.length - 1) return null;
          const date = new Date(point.date);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text
              key={`x-label-${i}`}
              x={point.x}
              y={graphHeight - padding + 20}
              className="axis-label"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
