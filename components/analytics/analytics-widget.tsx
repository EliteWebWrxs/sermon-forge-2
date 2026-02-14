"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AnalyticsSummary {
  sermonsCreated: number
  contentGenerated: number
  contentExported: number
  devotionalViews: number
  contentByType: Record<string, number>
  exportsByFormat: Record<string, number>
  dailyActivity: Array<{
    date: string
    sermons: number
    generated: number
    exported: number
  }>
  mostPopularContentType: string | null
}

const contentTypeLabels: Record<string, string> = {
  sermon_notes: "Sermon Notes",
  devotional: "Devotionals",
  discussion_guide: "Discussion Guides",
  social_media: "Social Media",
  kids_version: "Kids Version",
}

const formatLabels: Record<string, string> = {
  pdf: "PDF",
  docx: "Word",
  pptx: "PowerPoint",
}

export function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/summary?days=30")
        if (!response.ok) throw new Error("Failed to fetch analytics")
        const summary = await response.json()
        setData(summary)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
          <div className="h-48 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) return null

  // Format chart data with readable dates
  // Add T12:00:00 to avoid timezone shifting when parsing date strings
  const chartData = data.dailyActivity.map((day) => ({
    ...day,
    date: new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  const hasActivity = data.sermonsCreated > 0 || data.contentGenerated > 0 || data.contentExported > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Analytics Overview
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Last 30 days</span>
          <button
            onClick={() => {
              window.location.href = "/api/analytics/export?days=90"
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Sermons Created</p>
          <p className="text-2xl font-semibold text-slate-900">
            {data.sermonsCreated}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">Content Generated</p>
          <p className="text-2xl font-semibold text-blue-900">
            {data.contentGenerated}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Downloads</p>
          <p className="text-2xl font-semibold text-green-900">
            {data.contentExported}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 mb-1">Most Popular</p>
          <p className="text-lg font-semibold text-purple-900 truncate">
            {data.mostPopularContentType
              ? contentTypeLabels[data.mostPopularContentType] || data.mostPopularContentType
              : "—"}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      {hasActivity && chartData.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Activity Over Time
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="generated"
                  name="Generated"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="exported"
                  name="Exported"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm">No activity yet this month</p>
          <p className="text-xs text-slate-400 mt-1">
            Start by uploading a sermon to see your analytics
          </p>
        </div>
      )}

      {/* Content Breakdown */}
      {Object.keys(data.contentByType).length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Content Breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.contentByType).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {contentTypeLabels[type] || type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Export Breakdown */}
      {Object.keys(data.exportsByFormat).length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Export Formats
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.exportsByFormat).map(([format, count]) => (
              <span
                key={format}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
              >
                {formatLabels[format] || format.toUpperCase()}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
