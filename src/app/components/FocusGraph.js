"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { FaChartBar } from 'react-icons/fa';
import dayjs from 'dayjs';

// Define colors for the chart bars
const FOCUS_COLOR = "#ffeb3b";
const COMPLETED_COLOR = "#4caf50";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = dayjs(label).format('ddd, MMM D');
    return (
      <div className="bg-card/80 backdrop-blur-sm border border-border p-3 rounded-md shadow-lg">
        <p className="label text-sm font-bold text-foreground">{formattedLabel}</p>
        {payload.map((p, index) => (
          <p key={index} className="intro" style={{ color: p.color }}>
            {`${p.name}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatXAxis = (tickItem) => dayjs(tickItem).format('MMM D');

export default function FocusGraph({ sessions, tasks }) {
  const [data, setData] = useState([]);
  const [view, setView] = useState("focus"); // State to toggle between 'focus' and 'tasks'

  useEffect(() => {
    if (!sessions || !tasks) return;

    const dataMap = new Map();

    // Initialize the last 7 days with 0 values
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      dataMap.set(date, { focusTime: 0, tasksCompleted: 0 });
    }

    // Populate with focus session data
    sessions.forEach(session => {
      const date = dayjs(session.date).format('YYYY-MM-DD');
      if (dataMap.has(date)) {
        dataMap.get(date).focusTime += Math.round(session.duration / 60);
      }
    });

    // Populate with completed task data
    tasks.forEach(task => {
      if (task.completed && task.updated_at) {
        const date = dayjs(task.updated_at).format('YYYY-MM-DD');
        if (dataMap.has(date)) {
          dataMap.get(date).tasksCompleted += 1;
        }
      }
    });

    const formattedData = Array.from(dataMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));

    setData(formattedData);
  }, [sessions, tasks]);

  const hasFocusData = data.some(d => d.focusTime > 0);
  const hasTaskData = data.some(d => d.tasksCompleted > 0);
  const showChart = (view === 'focus' && hasFocusData) || (view === 'tasks' && hasTaskData);

  return (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-foreground">Focus Analysis (Last 7 Days)</h2>
        <button
          className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
          onClick={() => setView(view === "focus" ? "tasks" : "focus")}
        >
          {view === "focus" ? "View Tasks" : "View Focus"}
        </button>
      </div>

      {showChart ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatXAxis} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {view === "focus" ? (
              <Bar dataKey="focusTime" fill={FOCUS_COLOR} name="Focus Time (min)" radius={[4, 4, 0, 0]} />
            ) : (
              <Bar dataKey="tasksCompleted" fill={COMPLETED_COLOR} name="Tasks Completed" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col flex-grow items-center justify-center text-center text-muted-foreground">
          <FaChartBar size={40} className="mb-4" />
          <h3 className="text-lg font-semibold">No Data Yet</h3>
          <p className="text-sm">Complete tasks and focus sessions to see your progress here.</p>
        </div>
      )}
    </div>
  );
}