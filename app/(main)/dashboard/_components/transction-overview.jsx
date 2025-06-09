"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';

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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
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
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`$${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
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
                    <div className = "space-y-4">
                        {recentTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No recent transactions</p>   
                        ):(
                            recentTransactions.map((transaction) => {
                                return (
                                    <div key={transaction.id} className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {transaction.description || "Untitled Transaction"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(transaction.date), "MMM dd, yyyy")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2"> 
                                            <div className={cn(
                                                "flex items-center",
                                                transaction.type === "EXPENSE"
                                                ? "text-red-500"
                                                : "text-green-500"    
                                            )}>
                                                {transaction.type === "EXPENSE" ? (
                                                    <ArrowDownRight className="mr-1 h-4 w-4"/>
                                                ) : (
                                                    <ArrowUpRight className="mr-1 h-4 w-4" />   
                                                )}
                                                ${transaction.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
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
