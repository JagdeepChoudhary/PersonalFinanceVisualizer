"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { XAxis, CartesianGrid, BarChart, Bar } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "sonner";

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

  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/transactions");
        // Aggregate daily spending
        const aggregatedData = aggregateDailySpending(response.data);
        setDailySpending(aggregatedData);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error("Failed to fetch transactions");
      }
    };

    fetchData();
  }, []);

  // Aggregate transactions by day
  const aggregateDailySpending = (
    transactions: Transaction[]
  ): DailySpending[] => {
    const spendingByDay: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0]; // Extract YYYY-MM-DD
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
  const ChartConfig = {
    views: {
      label: "Total Spending",
    },
    desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  // Example data
  //{date: '2025-02-23', totalSpending: 150}
  return (
    <div className="space-y-6">
      {/* Daily Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending Insights</CardTitle>
        </CardHeader>

        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={ChartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={dailySpending}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
          
              <Bar
                dataKey="totalSpending"
                fill="var(--color-desktop)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
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
