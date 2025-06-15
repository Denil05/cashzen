"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, setDate, startOfDay, subDays } from 'date-fns';
import React, { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AccountChart = ({transactions}) => {

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
//   console.log(filteredData);

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
                    <p className="text-lg font-bold" style={{ color: '#00BFFF' }}>
                        ${total.income.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-muted-foreground">Total Expense</p>
                    <p className="text-lg font-bold text-red-500">
                        ${total.expense.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-muted-foreground">Net</p>
                    <p className={`text-lg font-bold ${total.income - total.expense > 0 ? "text-blue-500" : "text-red-500"}`}>
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
                    fill="#00FFFF" // Neon Cyan
                    radius = {[4,4,0,0]} 
                    activeBar={<Rectangle fill="#00FFFF" stroke="#00FFFF" strokeWidth={2} filter="drop-shadow(0px 0px 8px #00FFFF)" />} 
                />
                <Bar 
                    dataKey="expense" 
                    name = "Expense" 
                    fill="#FF00FF" // Neon Magenta
                    radius = {[4,4,0,0]} 
                    activeBar={<Rectangle fill="#FF00FF" stroke="#FF00FF" strokeWidth={2} filter="drop-shadow(0px 0px 8px #FF00FF)" />} 
                />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
  );
};

export default AccountChart;
