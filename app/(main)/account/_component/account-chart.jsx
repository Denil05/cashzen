"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, setDate, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'next-themes';

const AccountChart = ({transactions}) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const DATE_RANGES = {
    "7D":{ label: "Last 7 Days", days: 7},
    "1M":{ label: "Last Month", days: 30},
    "3M":{ label: "Last 3 Month", days: 90},
    "6M":{ label: "Last 6 Month", days: 180},
    "1y":{ label: "Last Year", days: 365},
    ALL: { label: "All Time", days: null},
  }

  const [dateRange,setDateRange] = useState("1M");
  const filteredData = useMemo(()=>{
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days ? startOfDay(subDays(now,range.days)):startOfDay(new Date(0));
    const filtered = transactions.filter(
        (t) => new Date(t.date) >= startDate && new Date(t.date)<=endOfDay(now)
    );

    const grouped = filtered.reduce((acc,transaction) => {
        const date = format(new Date(transaction.date),"MMM dd");
        if(!acc[date])
        {
            acc[date] = {date, income: 0, expense: 0};
        }
        if(transaction.type === "INCOME")
        {
            acc[date].income += transaction.amount;
        }
        else
        {
            acc[date].expense += transaction.amount;
        }
        return acc;
    },{});

    return Object.values(grouped).sort(
        (a,b) => new Date(a.date) - new Date(b.date)
    );
  },[transactions,dateRange])

  const total = useMemo(() => {
    return filteredData.reduce((acc,day) =>({
        income: acc.income + day.income,
        expense: acc.expense + day.expense, 
    }),{income: 0, expense: 0});
  },[filteredData]);

  // Define colors that work well in both themes
  const incomeColor = resolvedTheme === 'dark' ? '#00FFFF' : '#22c55e'; // Lighter sky blue for dark mode, green for light mode
  const expenseColor = resolvedTheme === 'dark' ? '#a855f7' : '#ef4444'; // Purple for dark mode, red for light mode

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <CardTitle className="text-base font-normal">Transaction Overview</CardTitle>
            <Select defaultValue={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATE_RANGES).map(([key, {label}]) => {
                    return (<SelectItem key={key} value={key}>
                        {label}
                    </SelectItem>);
                })}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-around mb-6 text-sm">
                <div className="text-center">
                    <p className="text-muted-foreground">Total Income</p>
                    <p className="text-lg font-bold" style={{ color: incomeColor }}>
                        ${total.income.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-muted-foreground">Total Expense</p>
                    <p className="text-lg font-bold" style={{ color: expenseColor }}>
                        ${total.expense.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-muted-foreground">Net</p>
                    <p className="text-lg font-bold" style={{ color: total.income - total.expense > 0 ? incomeColor : expenseColor }}>
                        ${(total.income - total.expense).toFixed(2)}
                    </p>
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={filteredData}
                margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 0,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.3}/>
                <XAxis dataKey="date" stroke="currentColor" tick={{ fill: 'currentColor' }}/>
                <YAxis fontSize = {12} tickline = {false} axisline = {false} tickFormatter={(value) => `$${value.toFixed(2)}.`} stroke="currentColor" tick={{ fill: 'currentColor' }}/>
                <Tooltip 
                    formatter={(value) => [`$${value}`, undefined]} 
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', border: '1px solid currentColor', color: 'currentColor' }} 
                    labelStyle={{ color: 'currentColor' }}
                />
                <Legend 
                    wrapperStyle={{ color: 'currentColor' }}
                />
                <Bar 
                    dataKey="income" 
                    name = "Income" 
                    fill={incomeColor}
                    radius = {[4,4,0,0]} 
                    activeBar={<Rectangle fill={incomeColor} stroke={incomeColor} strokeWidth={2} filter="drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.5))" />} 
                />
                <Bar 
                    dataKey="expense" 
                    name = "Expense" 
                    fill={expenseColor}
                    radius = {[4,4,0,0]} 
                    activeBar={<Rectangle fill={expenseColor} stroke={expenseColor} strokeWidth={2} filter="drop-shadow(0px 0px 8px rgba(168, 85, 247, 0.5))" />} 
                />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
  );
};

export default AccountChart;
