import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl shadow-xl">
                <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill }}>
                    {payload[0].name}: {payload[0].value}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    {payload[0].payload.percent ? `${(payload[0].payload.percent * 100).toFixed(0)}%` : ""}
                </p>
            </div>
        );
    }
    return null;
};

export default function PieChart({ data, colors }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-400 text-sm ml-1">{value}</span>}
                />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}
