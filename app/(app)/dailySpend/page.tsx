'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
interface Transaction {
  _id: string;
  date: string;
  amount: number;
  description: string;
  category: {
    _id: string;
    name: string;
    monthlySpend: number;
    month: string;
  };
}

interface DailySpending {
  date: string; // Date in YYYY-MM-DD format
  totalSpending: number; // Total spending for the day
}

export default function DailySpendingInsights() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/transactions');
        setTransactions(response.data);

        // Aggregate daily spending
        const aggregatedData = aggregateDailySpending(response.data);
        setDailySpending(aggregatedData);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };

    fetchData();
  }, []);

  // Aggregate transactions by day
  const aggregateDailySpending = (transactions: Transaction[]): DailySpending[] => {
    const spendingByDay: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0]; // Extract YYYY-MM-DD
      if (!spendingByDay[date]) {
        spendingByDay[date] = 0;
      }
      spendingByDay[date] += transaction.amount;
    });

    // Convert to an array of objects
    return Object.entries(spendingByDay).map(([date, totalSpending]) => ({
      date,
      totalSpending,
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Daily Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySpending}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Area
                  type="monotone"
                  dataKey="totalSpending"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Spending Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailySpending.map((day) => (
              <div key={day.date} className="flex justify-between items-center">
                <span className="font-medium">{day.date}</span>
                <span className="text-sm text-muted-foreground">
                  ${day.totalSpending.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}