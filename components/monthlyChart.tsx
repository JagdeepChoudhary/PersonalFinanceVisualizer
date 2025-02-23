'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";


interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

interface MonthlyData {
  month: string;
  totalExpenses: number;
}

const MonthlyExpensesChart = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  
  useEffect(() => {
    fetchAndProcessTransactions();
  }, []);

  const fetchAndProcessTransactions = async () => {
    try {
      const response = await axios.get<Transaction[]>('/api/transactions');
      const transactions = response.data;
      
      const monthlyTotals = transactions.reduce((acc: { [key: string]: number }, transaction) => {
        const monthYear = format(new Date(transaction.date), 'MMM yyyy');
        
        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear] += Number(transaction.amount);
        
        return acc;
      }, {});

      const chartData = Object.entries(monthlyTotals).map(([month, totalExpenses]) => ({
        month,
        totalExpenses
      }));

      chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

      setMonthlyData(chartData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load monthly expenses data');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const chartConfig = {
    desktop: {
      label: "month",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart 
              data={monthlyData} 
              width={500} 
              height={300} 
              aspect={2}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              /><YAxis
              tickFormatter={formatCurrency}
            />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="totalExpenses" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer> 
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesChart;
