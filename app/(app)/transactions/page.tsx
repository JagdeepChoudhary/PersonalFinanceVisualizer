"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: object;
}
interface Category {
  _id: string;
  name: string;
  monthlySpend: number;
  month: string;
}
export default function TransactionComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
    category: "",
  });
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [addTransactionDate, setAddTransactionDate] = useState<Date | undefined>(undefined);
  const [isCustom, setIsCustom] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const handleSelectChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustom(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);


  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };
  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
    }
  };
  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: "" }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const { name, value } = e.target;
    if (isEdit && editData) {
      setEditData({ ...editData, [name]: value });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTransactionDate) {
      toast.error("Please select a date");
      return;
    }
    try {
      const submitData = {
        amount: Number(formData.amount),
        date: addTransactionDate.toISOString().split('T')[0],
        description: formData.description,
        category: formData.category
      };
      const response = await axios.post("/api/transactions", submitData);
      setTransactions((prev) => [...prev, response.data]);
      toast.success("Transaction created successfully");
      setFormData({ amount: "", date: "", description: "", category: "" });
      setAddTransactionDate(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create transaction");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/transactions?id=${deleteId}`);
      setTransactions((prev) => prev.filter((t) => t._id !== deleteId));
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
    setDeleteId(null);
  };

  const handleEdit = async () => {
    if (!editData || !selectedDate) return;
    try {
      const updateData = {
        amount: Number(editData.amount),
        date: selectedDate.toISOString().split('T')[0],
        description: editData.description,
        category: editData.category
      };
      const response = await axios.put(
        `/api/transactions?id=${editData._id}`,
        updateData
      );
      setTransactions((prev) =>
        prev.map((t) => (t._id === editData._id ? response.data : t))
      );
      toast.success("Transaction updated successfully");
      setIsEditDialogOpen(false);
      setEditData(null);
      setSelectedDate(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update transaction");
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditData(transaction);
    setSelectedDate(new Date(transaction.date));
    setIsEditDialogOpen(true);
  };

  return (
    <div className="bg-background text-foreground container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${
                      !addTransactionDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {addTransactionDate ? (
                      format(addTransactionDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={addTransactionDate}
                    onSelect={setAddTransactionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
 <div className="flex flex-col gap-2">
            {!isCustomCategory ? (
              <Select
                onValueChange={handleCategoryChange}
                value={formData.category}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="text"
                name="category"
                placeholder="Enter custom category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            )}
          </div>

          <Button type="submit">Add Transaction</Button>
        </form>

        <div className="overflow-x-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted-background">
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow
              key={transaction._id}
              className={`${
                index % 2 === 0 ? 'bg-background' : 'bg-muted-background'
              } hover:bg-muted transition-colors`}
            >
              <TableCell className="font-semibold text-green-600">
                ${transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                {new Date(transaction.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                  {transaction.category?.name ?? 'Uncategorized'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2 flex md:flex-row flex-col">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(transaction)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(transaction._id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this transaction? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
         
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                type="number"
                name="amount"
                placeholder="Amount"
                value={editData?.amount || ""}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (editData && date) {
                        setEditData({
                          ...editData,
                          date: date.toISOString().split("T")[0],
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Input
                type="text"
                name="description"
                placeholder="Description"
                value={editData?.description || ""}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Input
                type="text"
                name="category.name"
                placeholder="Category"
                value={editData?.category.name}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}