'use client'
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

interface CategoryId {
  _id: string;
  name: string;
  monthlyLimit: number;
  month: string;
}

interface UpdateMonthlyBudgetDialogProps {
  trigger?: React.ReactNode;
  categoryId: CategoryId;
}

export const UpdateMonthlyBudgetDialog = ({ trigger, categoryId }: UpdateMonthlyBudgetDialogProps) => {
  const [formData, setFormData] = useState({
    monthlyLimit: categoryId.monthlyLimit,
  });
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/category/?id=${categoryId._id}`, {
        monthlyLimit: formData.monthlyLimit
      });
      toast.success("Budget limit updated successfully");
      
      setTimeout(() => {
        setOpen(false);
        setFormData({ monthlyLimit: 0 });
      }, 1500);
    } catch (error) {
      console.error("Failed to update budget limit", error);
      toast.error("Failed to update budget limit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Update Budget</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Monthly Budget</DialogTitle>
          <DialogDescription>
            Update the monthly budget limit for {categoryId.name} - {categoryId.month}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">New Monthly Limit</Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: Number(e.target.value) })}
              placeholder="Enter new amount"
              required
            />
          </div>

          <Button type="submit" className="w-full">Update Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};