'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { date: "14/02", value: 100 },
  { date: "17/02", value: 98 },
  { date: "20/02", value: 105 },
  { date: "23/02", value: 102 },
  { date: "26/02", value: 110 },
  { date: "29/02", value: 108 },
  { date: "01/03", value: 115 },
  { date: "04/03", value: 125 },
  { date: "07/03", value: 140 },
  { date: "10/03", value: 180 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-card p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">Date: {label}</p>
        <p className="text-sm font-semibold">
          Value: {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFE5B4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFE5B4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            domain={[0, 200]}
            ticks={[0, 50, 100, 150, 200]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#E3B982"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}