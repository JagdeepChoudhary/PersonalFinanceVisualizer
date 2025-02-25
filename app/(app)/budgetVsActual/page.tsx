"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Category {
  _id: string;
  name: string;
  monthlySpend: number;
  monthlyLimit: number;
  month: string;
}

interface MonthlyData {
  month: string;
  budget: number;
  spent: number;
}

const chartConfig = {
  views: {
    label: "Daily Spending",
  },
  Budget: {
    label: "Budget",
    color: "var(--chart-1)",
  },
  Actual: {
    label: "Actual Spending",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

export default function BudgetVsActualChart() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalSpending, setTotalSpending] = useState<number>(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [percentUsed, setPercentUsed] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/category");
        setCategories(response.data);
        const { totalBudget, totalSpending, monthlyData } = processData(
          response.data
        );
        setTotalBudget(totalBudget);
        setTotalSpending(totalSpending);
        setMonthlyData(monthlyData);
        setPercentUsed(
          totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setError("Failed to load budget data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (data: Category[]) => {
    let totalBudget = 0;
    let totalSpending = 0;
    const monthMap: { [key: string]: MonthlyData } = {};

    data.forEach((cat) => {
      totalBudget += cat.monthlyLimit ?? 0;
      totalSpending += cat.monthlySpend ?? 0;

      if (!monthMap[cat.month]) {
        monthMap[cat.month] = { month: cat.month, budget: 0, spent: 0 };
      }
      monthMap[cat.month].budget += cat.monthlyLimit ?? 0;
      monthMap[cat.month].spent += cat.monthlySpend ?? 0;
    });

    const monthlyData = Object.values(monthMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return { totalBudget, totalSpending, monthlyData };
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4" role="alert">
        {error}
      </div>
    );
  }
  return (
    <div className="space-y-6 mt-0 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <BudgetCard title="Total Budget" amount={totalBudget} />
        <BudgetCard title="Total Spending" amount={totalSpending} />
        <BudgetUsageCard
          percentUsed={percentUsed}
          remaining={totalBudget - totalSpending}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetChart
          title="Monthly Budget vs Actual Spending"
          data={monthlyData}
          dataKeys={[
            { key: "budget", name: "Budget", color: chartConfig.Budget.color },
            {
              key: "spent",
              name: "Actual Spending",
              color: chartConfig.Actual.color,
            },
          ]}
          xAxisDataKey="month"
        />

        <BudgetChart
          title="Budget vs Actual Spending by Category"
          data={categories}
          dataKeys={[
            {
              key: "monthlyLimit",
              name: "Budget",
              color: chartConfig.Budget.color,
            },
            {
              key: "monthlySpend",
              name: "Actual Spending",
              color: chartConfig.Actual.color,
            },
          ]}
          xAxisDataKey="name"
        />
      </div>
    </div>
  );
}
interface BudgetUsageCardProps {
  percentUsed: number;
  remaining: number;
}

function BudgetUsageCard({ percentUsed, remaining }: BudgetUsageCardProps) {
  // Determine status color based on percentage used
  const getStatusColor = () => {
    if (percentUsed > 100) return "bg-red-500";
    if (percentUsed > 85) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
        <Badge variant={percentUsed > 100 ? "destructive" : "secondary"}>
          {percentUsed.toFixed(0)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress
            value={Math.min(percentUsed, 100)}
            className={`h-2 ${getStatusColor()}`}
          />
          <p className="text-xs text-muted-foreground">
            {percentUsed > 100 ? (
              <span className="text-destructive font-medium">
                Over budget by {formatCurrency(-remaining)}
              </span>
            ) : (
              <>
                Remaining:{" "}
                <span className="font-medium">{formatCurrency(remaining)}</span>
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
interface BudgetCardProps {
  title: string;
  amount: number;
}

function BudgetCard({ title, amount }: BudgetCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
      </CardContent>
    </Card>
  );
}

interface BudgetChartProps {
  title: string;
  data: Category[] | MonthlyData[];
  dataKeys: { key: string; name: string; color: string }[];
  xAxisDataKey: string;
}

function BudgetChart({
  title,
  data,
  dataKeys,
  xAxisDataKey,
}: BudgetChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-0 sm:pl-6 sm:pr-6">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisDataKey}
              tick={{ fontSize: 12 }}
              interval={0}
              tickLine={false}
              textAnchor="end"
              height={60}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {dataKeys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={item.color}
                name={item.name}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[300px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
