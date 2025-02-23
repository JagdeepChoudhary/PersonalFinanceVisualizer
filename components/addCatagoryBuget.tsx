import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

// Monthly Budget Dialog Component
export const SetMonthlyBudgetDialog = ({ trigger }) => {
  const [formData, setFormData] = useState({
    name: '',
    monthlyLimit: '',
    month: ''
  });
  const [open, setOpen] = useState(false);
console.log(formData)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
    const response = await axios.post("/api/category", formData);
    toast.success("Transaction created successfully");

    setTimeout(() => {
      setOpen(false);
      setFormData({ name: '', monthlyLimit: '', month: '' });
    }, 1500);
  } catch (error) {
    toast.error("Failed to create transaction");
  }
  };

 
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Set Monthly Budget</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Category Budget</DialogTitle>
          <DialogDescription>
            Set a budget limit for a specific category and month
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Groceries"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit</Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">Set Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
