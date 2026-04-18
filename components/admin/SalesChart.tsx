'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface ChartData {
  date: string;
  count: number;
  revenue: number;
}

interface SalesChartProps {
  data: ChartData[];
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-2xl rounded-2xl border border-gray-100 flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-black text-sky-600">Ventas: ${payload[0].value.toLocaleString('es-AR')}</p>
        <p className="text-sm font-black text-gray-700">Pedidos: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data, loading }: SalesChartProps) {
  if (loading) {
    return (
      <div className="w-full h-[300px] bg-gray-50 animate-pulse rounded-3xl flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-widest text-gray-300">Cargando datos...</p>
      </div>
    );
  }

  // Format date for display: "18 Abr"
  const formattedData = data.map(item => {
    const d = new Date(item.date);
    return {
      ...item,
      displayDate: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    };
  });

  return (
    <div className="w-full space-y-8">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0ea5e9" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Bar 
              dataKey="count" 
              fill="#e2e8f0" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sky-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ingresos ($)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Volumen (#)</span>
        </div>
      </div>
    </div>
  );
}
