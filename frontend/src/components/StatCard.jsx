import React from "react";

const StatCard = ({ title, value, subtitle, icon: Icon, colorTheme = "indigo", trend, trendType = "up" }) => {
  const themeClass = `stat-theme-${colorTheme}`;

  return (
    <div className="stat-card-widget glass-card">
      <div className="stat-card-top">
        <div className={`stat-icon-wrapper ${themeClass}`}>
          {Icon && <Icon className="stat-icon" size={22} />}
        </div>
        {trend && (
          <span className={`stat-trend-pill ${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="stat-card-middle">
        <span className="stat-title-text">{title}</span>
        <h2 className="stat-value-display">{value ?? 0}</h2>
      </div>

      {subtitle && (
        <div className="stat-card-bottom">
          <span className="stat-subtitle-text">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
