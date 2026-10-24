"use client";

import React from "react";
import { Calendar, Clock, AlertCircle, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

interface ProjectTimelineProps {
  startDate: string | Date;
  plannedDurationWeeks: number;
  currentWeekNumber?: number;
  spi?: number;
  taskCompletionPercentage?: number;
}

export default function ProjectTimeline({
  startDate,
  plannedDurationWeeks,
  currentWeekNumber = 1,
  spi = 1,
  taskCompletionPercentage = 0,
}: ProjectTimelineProps) {
  const start = new Date(startDate || Date.now());
  const validStart = isNaN(start.getTime()) ? new Date() : start;

  // Calculate planned end date
  const plannedEndDate = new Date(validStart);
  plannedEndDate.setDate(plannedEndDate.getDate() + plannedDurationWeeks * 7);

  // Calculate forecasted duration based on SPI
  // If SPI = 0.8, duration = plannedDuration / 0.8
  const safeSPI = spi > 0 ? spi : 1;
  const forecastedWeeks = Math.max(1, Math.round(plannedDurationWeeks / safeSPI));
  const scheduleDelayWeeks = Math.round(forecastedWeeks - plannedDurationWeeks);

  // Forecasted end date
  const forecastedEndDate = new Date(validStart);
  forecastedEndDate.setDate(forecastedEndDate.getDate() + forecastedWeeks * 7);

  // Time elapsed percentage
  const elapsedPercentage = Math.min(
    100,
    Math.round((currentWeekNumber / plannedDurationWeeks) * 100)
  );

  // Determine schedule status
  let statusBadge = {
    label: "On Schedule",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    color: "text-emerald-600",
  };

  if (safeSPI >= 1.05) {
    statusBadge = {
      label: "Ahead of Schedule",
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      icon: TrendingUp,
      color: "text-blue-600",
    };
  } else if (safeSPI < 0.85) {
    statusBadge = {
      label: `Critically Delayed (+${Math.abs(scheduleDelayWeeks)} wks)`,
      bg: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
      color: "text-red-600",
    };
  } else if (safeSPI < 0.95) {
    statusBadge = {
      label: `Behind Schedule (+${Math.abs(scheduleDelayWeeks)} wks)`,
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
      color: "text-amber-600",
    };
  }

  const StatusIcon = statusBadge.icon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">
              Project Completion Timeline & Schedule Forecast
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time schedule tracking and Earned Schedule completion forecasting
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusBadge.bg}`}>
          <StatusIcon size={14} />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {/* Timeline Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-sm">
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Start Date
          </span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            {formatDate(validStart)}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Planned Completion
          </span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            {formatDate(plannedEndDate)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {plannedDurationWeeks} weeks planned
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Forecasted Completion
          </span>
          <span className={`font-bold flex items-center gap-1.5 ${scheduleDelayWeeks > 0 ? "text-amber-700" : "text-emerald-700"}`}>
            <Calendar size={14} />
            {formatDate(forecastedEndDate)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {forecastedWeeks} wks est. ({scheduleDelayWeeks > 0 ? `+${scheduleDelayWeeks} wks` : scheduleDelayWeeks < 0 ? `${scheduleDelayWeeks} wks` : "on target"})
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            Current Week & Progress
          </span>
          <span className="font-bold text-slate-800">
            Week {currentWeekNumber} of {plannedDurationWeeks}
          </span>
          <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
            {elapsedPercentage}% time elapsed • {taskCompletionPercentage}% tasks done
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar Track */}
      <div className="pt-6">
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
          <span>Project Kickoff (Wk 0)</span>
          <span className="text-blue-700 font-bold">
            Current Position: Week {currentWeekNumber} ({elapsedPercentage}% Elapsed)
          </span>
          <span>Target Closeout (Wk {plannedDurationWeeks})</span>
        </div>

        {/* Multi-layered track */}
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
          {/* Time elapsed bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, elapsedPercentage)}%` }}
          />

          {/* Task Completion overlay stripe */}
          <div
            className="absolute top-0 left-0 h-full bg-emerald-500 opacity-60 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, taskCompletionPercentage)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>Schedule Elapsed ({elapsedPercentage}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-70 inline-block"></span>
              <span>Task Work Done ({taskCompletionPercentage}%)</span>
            </div>
          </div>

          <div className="text-slate-600">
            SPI: <span className="font-bold">{safeSPI.toFixed(2)}</span>
            {scheduleDelayWeeks !== 0 && (
              <span className={`ml-2 font-semibold ${scheduleDelayWeeks > 0 ? "text-red-600" : "text-emerald-600"}`}>
                ({scheduleDelayWeeks > 0 ? `+${scheduleDelayWeeks} wks delay` : `${Math.abs(scheduleDelayWeeks)} wks ahead`})
              </span>
            )}
          </div>
        </div>

        {/* Milestone Phasing Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className={`p-2.5 rounded-lg border text-xs ${currentWeekNumber >= 1 ? "bg-blue-50/50 border-blue-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <span className="font-bold block mb-0.5 text-blue-900">Phase 1: Initiation</span>
            <span>Wk 1 – Wk {Math.max(1, Math.round(plannedDurationWeeks * 0.25))}</span>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs ${currentWeekNumber >= Math.round(plannedDurationWeeks * 0.25) ? "bg-blue-50/50 border-blue-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <span className="font-bold block mb-0.5 text-blue-900">Phase 2: Execution</span>
            <span>Wk {Math.round(plannedDurationWeeks * 0.25) + 1} – Wk {Math.round(plannedDurationWeeks * 0.6)}</span>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs ${currentWeekNumber >= Math.round(plannedDurationWeeks * 0.6) ? "bg-blue-50/50 border-blue-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <span className="font-bold block mb-0.5 text-blue-900">Phase 3: Testing & Quality</span>
            <span>Wk {Math.round(plannedDurationWeeks * 0.6) + 1} – Wk {Math.round(plannedDurationWeeks * 0.85)}</span>
          </div>

          <div className={`p-2.5 rounded-lg border text-xs ${currentWeekNumber >= Math.round(plannedDurationWeeks * 0.85) ? "bg-blue-50/50 border-blue-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <span className="font-bold block mb-0.5 text-blue-900">Phase 4: Closeout</span>
            <span>Wk {Math.round(plannedDurationWeeks * 0.85) + 1} – Wk {plannedDurationWeeks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
