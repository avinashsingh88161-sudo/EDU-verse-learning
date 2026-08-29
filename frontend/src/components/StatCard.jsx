import React from "react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme = "emerald",
  trend,
  trendType = "up",
  onClick,
}) => {
  const themeClass = `stat-theme-${colorTheme}`;
  const isClickable = typeof onClick === "function";

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`stat-card-widget ${isClickable ? "clickable" : ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="stat-card-content-left">
        <span className="stat-title-text">{title}</span>
        <h2 className="stat-value-display">{value ?? 0}</h2>
        {subtitle && <span className="stat-subtitle-text">{subtitle}</span>}
        {trend && (
          <span className={`stat-trend-pill ${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      <div className={`stat-icon-wrapper ${themeClass}`}>
        {Icon && <Icon className="stat-icon" size={24} />}
      </div>
    </div>
  );
};

export default StatCard;


