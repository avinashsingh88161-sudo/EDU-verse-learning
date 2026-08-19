import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import "./WeeklyChart.css";

const WeeklyChart = ({ quizResults = [], submissions = [] }) => {
  const [timeframe, setTimeframe] = useState("thisWeek");
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Helper to calculate start of current week (Monday)
  const getStartOfWeek = (offsetWeeks = 0) => {
    const now = new Date();
    const day = now.getDay();
    const diffToMon = (day === 0 ? -6 : 1 - day); // adjust when day is sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon - offsetWeeks * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const computeWeekData = (offsetWeeks = 0) => {
    const monday = getStartOfWeek(offsetWeeks);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const days = dayNames.map((name, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const nextDayDate = new Date(dayDate);
      nextDayDate.setDate(dayDate.getDate() + 1);

      // Filter quiz attempts on this day
      const dayQuizzes = quizResults.filter((r) => {
        const d = new Date(r.createdAt || r.submittedAt);
        return d >= dayDate && d < nextDayDate;
      });

      // Filter assignment submissions on this day
      const daySubmissions = submissions.filter((s) => {
        const d = new Date(s.submittedAt || s.createdAt);
        return d >= dayDate && d < nextDayDate;
      });

      const quizzesCount = dayQuizzes.length;
      const submissionsCount = daySubmissions.length;
      // Estimate logged study time: 0.5 hr per quiz attempt + 1.0 hr per assignment submission
      const hours = Number((quizzesCount * 0.5 + submissionsCount * 1.0).toFixed(1));

      return {
        day: name,
        hours,
        quizzes: quizzesCount,
        submissions: submissionsCount,
      };
    });

    const maxHours = Math.max(...days.map((d) => d.hours), 1.0);
    return days.map((d) => ({
      ...d,
      percentage: d.hours > 0 ? Math.min(Math.round((d.hours / maxHours) * 100), 100) : 0,
    }));
  };

  const currentData = computeWeekData(timeframe === "thisWeek" ? 0 : 1);

  const totalHours = currentData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  const dailyAvg = (totalHours / 7).toFixed(1);
  
  // Real Target completion: ratio of days with activity in week (out of 7)
  const activeDaysCount = currentData.filter((d) => d.hours > 0).length;
  const targetCompletion = Math.round((activeDaysCount / 7) * 100);

  return (
    <div className="weekly-chart weekly-chart-card glass-card">
      <div className="weekly-chart-header">
        <div className="weekly-chart-header-info">
          <div className="weekly-chart-eyebrow">
            <TrendingUp size={14} className="weekly-chart-icon-accent" />
            <span>LEARNING ANALYTICS</span>
          </div>
          <h3 className="weekly-chart-title">Weekly Study Activity</h3>
        </div>
        <div className="weekly-chart-timeframe-selector">
          <button
            type="button"
            className={`weekly-chart-time-btn ${timeframe === "thisWeek" ? "active" : ""}`}
            onClick={() => setTimeframe("thisWeek")}
          >
            This Week
          </button>
          <button
            type="button"
            className={`weekly-chart-time-btn ${timeframe === "lastWeek" ? "active" : ""}`}
            onClick={() => setTimeframe("lastWeek")}
          >
            Last Week
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="weekly-chart-summary">
        <div className="weekly-chart-summary-item">
          <span className="weekly-chart-summary-label">Total Time Logged</span>
          <div className="weekly-chart-summary-value">
            {totalHours} <span className="weekly-chart-unit">hrs</span>
          </div>
        </div>
        <div className="weekly-chart-summary-item">
          <span className="weekly-chart-summary-label">Daily Avg</span>
          <div className="weekly-chart-summary-value">
            {dailyAvg} <span className="weekly-chart-unit">hrs/day</span>
          </div>
        </div>
        <div className="weekly-chart-summary-item">
          <span className="weekly-chart-summary-label">Target Completion</span>
          <div className="weekly-chart-summary-value weekly-chart-emerald">
            {targetCompletion}%
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="weekly-chart-area">
        <div className="weekly-chart-bars">
          {currentData.map((d, index) => {
            const isHovered = hoveredBarIndex === index;
            return (
              <div
                key={d.day}
                className={`weekly-chart-column ${isHovered ? "active" : ""}`}
                onMouseEnter={() => setHoveredBarIndex(index)}
                onClick={() => setHoveredBarIndex(index)}
              >
                <div className="weekly-chart-tooltip">
                  <span className="weekly-chart-tooltip-hours">{d.hours} hrs</span>
                  <span className="weekly-chart-tooltip-quizzes">
                    {d.quizzes} Quiz{d.quizzes !== 1 ? "zes" : ""} / {d.submissions} Sub
                  </span>
                </div>
                <div className="weekly-chart-track">
                  <div
                    className="weekly-chart-bar"
                    style={{ height: `${d.percentage}%` }}
                  />
                </div>
                <span className="weekly-chart-label">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;
