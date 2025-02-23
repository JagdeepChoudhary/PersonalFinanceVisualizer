"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  _id: string
  name: string
  monthlySpend: number
  monthlyLimit: number
  month: string
}

interface MonthlyData {
  month: string
  budget: number
  spent: number
}

export default function BudgetVsActualChart() {
  const [categories, setCategories] = useState<Category[]>([])
  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [totalSpending, setTotalSpending] = useState<number>(0)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/category")
        setCategories(response.data)

        const { totalBudget, totalSpending, monthlyData } = processData(response.data)
        setTotalBudget(totalBudget)
        setTotalSpending(totalSpending)
        setMonthlyData(monthlyData)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setError("Failed to load budget data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processData = (data: Category[]) => {
    let totalBudget = 0
    let totalSpending = 0
    const monthMap: { [key: string]: MonthlyData } = {}

    data.forEach((cat) => {
      totalBudget += cat.monthlyLimit ?? 0
      totalSpending += cat.monthlySpend ?? 0

      if (!monthMap[cat.month]) {
        monthMap[cat.month] = { month: cat.month, budget: 0, spent: 0 }
      }
      monthMap[cat.month].budget += cat.monthlyLimit ?? 0
      monthMap[cat.month].spent += cat.monthlySpend ?? 0
    })

    const monthlyData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))

    return { totalBudget, totalSpending, monthlyData }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BudgetCard title="Total Budget" amount={totalBudget} />
        <BudgetCard title="Total Spending" amount={totalSpending} />
      </div>

      <BudgetChart
        title="Monthly Budget vs Actual Spending"
        data={monthlyData}
        dataKeys={[
          { key: "budget", name: "Budget", color: "#8884d8" },
          { key: "spent", name: "Actual Spending", color: "#82ca9d" },
        ]}
        xAxisDataKey="month"
      />

      <BudgetChart
        title="Budget vs Actual Spending by Category"
        data={categories}
        dataKeys={[
          { key: "monthlyLimit", name: "Budget", color: "#8884d8" },
          { key: "monthlySpend", name: "Actual Spending", color: "#82ca9d" },
        ]}
        xAxisDataKey="name"
      />
    </div>
  )
}

interface BudgetCardProps {
  title: string
  amount: number
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
  )
}

interface BudgetChartProps {
  title: string
  data: any[]
  dataKeys: { key: string; name: string; color: string }[]
  xAxisDataKey: string
}

function BudgetChart({ title, data, dataKeys, xAxisDataKey }: BudgetChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisDataKey}
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              {dataKeys.map((item) => (
                <Bar key={item.key} dataKey={item.key} fill={item.color} name={item.name} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
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
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

