"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { FaChartBar } from 'react-icons/fa';
import dayjs from 'dayjs';

const FOCUS_COLOR = "#ffeb3b";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = dayjs(label).format('ddd, MMM D');
    return (
      <div className="bg-card/80 backdrop-blur-sm border border-border p-3 rounded-md shadow-lg">
        <p className="label text-sm font-bold text-foreground">{formattedLabel}</p>
        <p className="intro" style={{ color: payload[0].color }}>
          {`Focus Time: ${payload[0].value} min`}
        </p>
      </div>
    );
  }
  return null;
};

const formatXAxis = (tickItem) => {
  return dayjs(tickItem).format('MMM D');
};

// The component now accepts the 'sessions' prop from the dashboard
export default function FocusGraph({ sessions }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Process the session data passed down from the dashboard
    if (!sessions) return;

    const dataMap = new Map();
    const sevenDaysAgo = dayjs().subtract(7, 'day');

    // Initialize the last 7 days with 0 focus time
    for (let i = 0; i < 7; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      dataMap.set(date, { focusTime: 0 });
    }

    // Populate the map with actual session data
    sessions.forEach(session => {
      const date = dayjs(session.date).format('YYYY-MM-DD');
      if (dayjs(date).isAfter(sevenDaysAgo) && dataMap.has(date)) {
        const currentDuration = dataMap.get(date).focusTime;
        // Add session duration (converting from seconds to minutes)
        dataMap.get(date).focusTime = currentDuration + Math.round(session.duration / 60);
      }
    });

    const formattedData = Array.from(dataMap.entries()).map(([date, values]) => ({
      date,
      ...values,
    })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

    setData(formattedData);
  }, [sessions]); // This effect re-runs whenever the sessions data changes

  return (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-foreground">Focus Analysis (Last 7 Days)</h2>
        {/* The view toggle has been removed for simplicity as we only have focus data now */}
      </div>

      {/* Check if there's any actual focus time to display */}
      {data.some(d => d.focusTime > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatXAxis}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar dataKey="focusTime" fill={FOCUS_COLOR} name="Focus Time (min)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col flex-grow items-center justify-center text-center text-muted-foreground">
          <FaChartBar size={40} className="mb-4" />
          <h3 className="text-lg font-semibold">No Data Yet</h3>
          <p className="text-sm">Complete focus sessions to see your progress here.</p>
        </div>
      )}
    </div>
  );
}