 import React from 'react';
import './PlayerStats.css';

const PlayerStats = ({ stats, onGainXP }) => {
  if (!stats) return null;

  const xpPercentage = (stats.xp / stats.xpToNext) * 100;

  return (
    <div className="player-stats">
      <div className="player-avatar">
        <span className="avatar-emoji">{stats.avatar || '🧙‍♀️'}</span>
      </div>
      <div className="player-info">
        <h2>{stats.name || 'Player'}</h2>
        <div className="level-info">
          <span className="level">Level {stats.level}</span>
          <span className="xp-info">{stats.xp} / {stats.xpToNext} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Current Streak</span>
            <span className="stat-value">{stats.currentStreak || 0} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Longest Streak</span>
            <span className="stat-value">{stats.longestStreak || 0} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Achievements</span>
            <span className="stat-value">{stats.achievements?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
