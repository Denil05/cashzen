"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Legend, Cell } from 'recharts';

// Define a vibrant and attractive color palette for the pie chart
const COLORS = [
  '#00FFFF', // Cyan - Neon Blue
  '#FF00FF', // Magenta - Neon Pink
  '#FF1493', // Deep Pink - Hot Pink Neon
  '#8A2BE2', // Blue Violet - Electric Purple
  '#00BFFF', // Deep Sky Blue - Bright Blue
  '#7B68EE', // Medium Slate Blue - Cool Purple
  '#A020F0', // Purple
  '#FF007F', // Rose
  '#40E0D0', // Turquoise (New)
  '#EE82EE', // Violet (New)
];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{ fontWeight: 'bold' }}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.5))', transition: 'all 0.3s ease' }} // Add glow effect
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.5))', transition: 'all 0.3s ease' }} // Add glow effect
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="currentColor" style={{ fontWeight: 'bold' }}>{`$${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="currentColor">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const DashboardOverview = ({accounts,transactions}) => {
    const [selectedAccountId,setselectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
    );
    const [activeIndex, setActiveIndex] = useState(0);

    const accountTransactions = transactions.filter(
        (t) => t.accountId === selectedAccountId
    );

    const recentTransactions = accountTransactions.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);

    // Process transactions for pie chart
    const categoryExpenses = accountTransactions
        .filter(t => t.type === "EXPENSE")
        .reduce((acc, transaction) => {
            const category = transaction.category || "Uncategorized";
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += transaction.amount;
            return acc;
        }, {});

    const pieChartData = Object.entries(categoryExpenses).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
    }));

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className = "flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className = "text-xl font-semibold">Recent transactions</CardTitle>
                    <Select value={selectedAccountId} onValueChange={setselectedAccountId}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "p-2 rounded-full",
                                        transaction.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                                    )}>
                                        {transaction.type === "INCOME" ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{transaction.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <p className={cn(
                                    "text-sm font-medium",
                                    transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                                )}>
                                    {transaction.type === "INCOME" ? "+" : "-"}${transaction.amount.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Expense by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {pieChartData.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No expense data available</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        paddingAngle={2} // Add spacing between pie slices
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="none" // Remove stroke to enhance neon look
                                                style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.3))', transition: 'all 0.3s ease' }} // Add subtle glow
                                            />
                                        ))}
                                    </Pie>
                                    <Legend 
                                        layout="vertical" 
                                        align="right"
                                        verticalAlign="middle"
                                        formatter={(value, entry) => (
                                            <span style={{ 
                                                color: 'currentColor', // Use currentColor for theme adaptability
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                marginLeft: '4px'
                                            }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardOverview;
