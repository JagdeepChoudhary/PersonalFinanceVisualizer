
import MonthlyExpensesChart from '@/components/monthlyChart';

export default function MonthlyExpensesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Monthly Expenses Analysis</h1>
      <MonthlyExpensesChart />
    </div>  );
}