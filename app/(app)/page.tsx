"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SetMonthlyBudgetDialog } from "@/components/addCatagoryBuget";
import { Button } from "@/components/ui/button";
import { UpdateMonthlyBudgetDialog } from "@/components/updateMonthlyBuget";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import HomePageSkeleton from "@/components/homePageSkeleton";

interface Category {
  _id: string;
  name: string;
  monthlySpend: number;
  month: string;
  monthlyLimit: number;
}

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
}

interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#34495e",
  "#e67e22",
];

export default function CategoryPieChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pieChartData, setPieChartData] = useState<CategorySummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  console.log(transactions);
  console.log(recentTransactions);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, transactionsResponse] = await Promise.all([
        axios.get("/api/category"),
        axios.get("/api/transactions"),
      ]);

      const fetchedCategories = categoriesResponse.data;
      const fetchedTransactions = transactionsResponse.data;

      setCategories(fetchedCategories);
      setTransactions(fetchedTransactions);
      setRecentTransactions(fetchedTransactions.slice(0, 5));

      processData(fetchedCategories);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const processData = (categories: Category[]) => {
    const total = categories.reduce(
      (sum, category) => sum + category.monthlySpend,
      0
    );
    setTotalExpenses(total);

    const breakdown = categories.reduce((acc, category) => {
      acc[category.name] = category.monthlySpend;
      return acc;
    }, {} as Record<string, number>);
    setCategoryBreakdown(breakdown);

    const chartData = categories.map((category, index) => ({
      name: category.name,
      value: category.monthlySpend,
      color: COLORS[index % COLORS.length],
    }));
    setPieChartData(chartData);
  };
  if (loading) {
    return <HomePageSkeleton />;
  }
  return (
    <div className="space-y-8 mt-8">
      <div className="flex flex-row justify-center gap-4">
        <SetMonthlyBudgetDialog
          trigger={<Button variant="outline">Set Monthly Budget</Button>}
        />
        <Link href="/monthly-expenses">
          <Button variant="outline">View Monthly Expenses</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="overflow-x-auto rounded-lg border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted-background">
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Edit Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(categoryBreakdown).map(
                      ([name, amount], index) => {
                        const category = categories.find(
                          (cat) => cat.name === name
                        );
                        return (
                          <TableRow
                            key={name}
                            className={`
                            ${
                              index % 2 === 0
                                ? "bg-background"
                                : "bg-muted-background"
                            } 
                          hover:bg-muted transition-colors`}
                          >
                            <TableCell>
                              {category?.name ?? "Uncategorized"}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {category && (
                                <UpdateMonthlyBudgetDialog
                                  categoryId={category}
                                  trigger={
                                    <Button variant="outline" size="sm">
                                      Edit
                                    </Button>
                                  }
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  fill="#8884d8"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
