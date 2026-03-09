import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-300/50 p-4 rounded-xl shadow-xl">
                <p className="font-medium text-gray-800 mb-2">{label}</p>
                <p className="text-sm font-semibold text-indigo-400">
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export default function BarChart({ data, dataKey, color = "#818cf8" }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar
                    dataKey={dataKey}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
