"use client";

import { useState } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import dayjs from "dayjs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  memberId: Id<"members">;
};

const LEVY_AMOUNT = 50000; // N50,000
const LEVY_YEARS = [2025, 2026, 2027]; // Fixed 3-year period

const AdminProjectLevy = ({ memberId }: Props) => {
  const payments = useQuery(api.projectLevy.getByMemberId, { memberId });
  const addPayment = useMutation(api.projectLevy.addLevyPayment);
  const updatePayment = useMutation(api.projectLevy.updateLevyPayment);
  const deletePayment = useMutation(api.projectLevy.deleteLevyPayment);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] =
    useState<Id<"projectLevy"> | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] =
    useState<Id<"projectLevy"> | null>(null);

  const [year, setYear] = useState(LEVY_YEARS[0]); // Default to first levy year
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group payments by year
  const paymentsByYear: Record<number, typeof payments> = {};
  payments?.forEach((payment) => {
    if (!paymentsByYear[payment.year]) {
      paymentsByYear[payment.year] = [];
    }
    paymentsByYear[payment.year]?.push(payment);
  });

  // Initialize years with fixed levy years
  const years = LEVY_YEARS;

  const resetForm = () => {
    setAmount("");
    setError(null);
  };

  const handleAddPayment = async () => {
    if (!amount) {
      setError("Amount is required");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      setError("Invalid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment({
        memberId,
        year,
        amount: amountNum,
      });
      resetForm();
      setOpenAddDialog(false);
    } catch (error) {
        setError("Failed to add payment");
        console.log('Error Msg: ', error)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePayment = async (paymentId: Id<"projectLevy">) => {
    if (!amount) {
      setError("Amount is required");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      setError("Invalid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePayment({
        id: paymentId,
        amount: amountNum,
      });
      resetForm();
      setOpenEditDialog(null);
    } catch (error) {
        setError("Failed to update payment");
        console.log('Error Msg: ', error)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: Id<"projectLevy">) => {
    setIsSubmitting(true);
    try {
      await deletePayment({ id: paymentId });
      setOpenDeleteDialog(null);
    } catch (error) {
        setError("Failed to delete payment");
        console.log("Error Msg: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals per levy year
  const totalByYear: Record<number, number> = {};
  years.forEach((year) => {
    totalByYear[year] = (paymentsByYear[year] || []).reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
  });

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-bold'>Project Levy</h2>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
            Add Levy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Levy Payment</DialogTitle>
              <DialogDescription>
                Record a new payment towards the project levy.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-3 items-center gap-4'>
                <label htmlFor='year' className='text-right'>
                  Year
                </label>
                <select
                  id='year'
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className='col-span-2 border rounded p-2'>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className='grid grid-cols-3 items-center gap-4'>
                <label htmlFor='amount' className='text-right'>
                  Amount (₦)
                </label>
                <Input
                  id='amount'
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className='col-span-2'
                />
              </div>
              {error && (
                <p className='text-red-500 text-sm col-span-3 text-center'>
                  {error}
                </p>
              )}
              <p className='text-sm text-muted-foreground'>
                Annual Levy: ₦{LEVY_AMOUNT.toLocaleString()}, Paid: ₦
                {(totalByYear[year] || 0).toLocaleString()}, Remaining: ₦
                {(LEVY_AMOUNT - (totalByYear[year] || 0)).toLocaleString()}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPayment} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {years.map((year) => (
        <div key={year} className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold'>Year: {year}</h3>
            <div className='text-sm'>
              Total Paid: ₦{(totalByYear[year] || 0).toLocaleString()} / ₦
              {LEVY_AMOUNT.toLocaleString()}
            </div>
          </div>

          <div className='border rounded-md'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(paymentsByYear[year] || []).map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {dayjs(payment.date).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell>₦{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className='flex space-x-2'>
                      <Dialog
                        open={openEditDialog === payment._id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenEditDialog(payment._id);
                            setAmount(payment.amount.toString());
                          } else {
                            setOpenEditDialog(null);
                            resetForm();
                          }
                        }}>
                        <DialogTrigger asChild>
                          <Button variant='outline' size='icon'>
                            <Edit className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Payment</DialogTitle>
                            <DialogDescription>
                              Update the payment amount.
                            </DialogDescription>
                          </DialogHeader>
                          <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                              <label htmlFor='amount' className='text-right'>
                                Amount (₦)
                              </label>
                              <Input
                                id='amount'
                                type='number'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className='col-span-3'
                              />
                            </div>
                            {error && (
                              <p className='text-red-500 text-sm col-span-4 text-center'>
                                {error}
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleUpdatePayment(payment._id)}
                              disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              ) : null}
                              Update Payment
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog
                        open={openDeleteDialog === payment._id}
                        onOpenChange={(open) =>
                          setOpenDeleteDialog(open ? payment._id : null)
                        }>
                        <AlertDialogTrigger asChild>
                          <Button variant='destructive' size='icon'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment of ₦
                              {payment.amount.toLocaleString()}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              variant='destructive'
                              onClick={() => handleDeletePayment(payment._id)}
                              disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              ) : null}
                              Delete Payment
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}

                {(paymentsByYear[year] || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className='h-24 text-center'>
                      No payments recorded for this year
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProjectLevy;
