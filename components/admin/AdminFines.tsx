"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { Check, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

type Props = {
  memberId: Id<"members">;
};

const AdminFines = ({ memberId }: Props) => {
  const fines = useQuery(api.fines.getByMemberId, { memberId });
  const addFine = useMutation(api.fines.addFine);
  const updateFine = useMutation(api.fines.updateFine);
  const deleteFine = useMutation(api.fines.deleteFine);
  const markPaid = useMutation(api.fines.markPaid);
  const markUnpaid = useMutation(api.fines.markUnpaid);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState<Id<"fines"> | null>(
    null
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState<Id<"fines"> | null>(
    null
  );

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalFines = fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0;
  const paidFines =
    fines
      ?.filter((f) => f.status === "paid")
      .reduce((sum, fine) => sum + fine.amount, 0) || 0;
  const unpaidFines = totalFines - paidFines;

  const resetForm = () => {
    setAmount("");
    setReason("");
    setError(null);
  };

  const handleAddFine = async () => {
    if (!amount || !reason) {
      setError("Amount and reason are required");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      setError("Invalid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addFine({
        memberId,
        amount: amountNum,
        reason,
      });
      resetForm();
      setOpenAddDialog(false);
    } catch (error) {
      setError("Failed to add fine");
      console.log("Error Msg: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFine = async (fineId: Id<"fines">) => {
    if (!amount || !reason) {
      setError("Amount and reason are required");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      setError("Invalid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateFine({
        id: fineId,
        amount: amountNum,
        reason,
      });
      resetForm();
      setOpenEditDialog(null);
    } catch (error) {
      setError("Failed to update fine");
      console.log("Error Msg: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFine = async (fineId: Id<"fines">) => {
    setIsSubmitting(true);
    try {
      await deleteFine({ id: fineId });
      setOpenDeleteDialog(null);
    } catch (error) {
      setError("Failed to delete fine");
      console.log("Error Msg: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePaymentStatus = async (
    fineId: Id<"fines">,
    currentStatus: "paid" | "unpaid"
  ) => {
    setIsSubmitting(true);
    try {
      if (currentStatus === "paid") {
        await markUnpaid({ id: fineId });
      } else {
        await markPaid({ id: fineId });
      }
    } catch (error) {
      setError("Failed to update payment status");
      console.log("Error Msg: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Fines</CardTitle>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='mr-2 h-4 w-4' /> Add Fine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Fine</DialogTitle>
                  <DialogDescription>
                    Record a new fine for this member.
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
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <label htmlFor='reason' className='text-right'>
                      Reason
                    </label>
                    <Input
                      id='reason'
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
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
                  <Button onClick={handleAddFine} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : null}
                    Add Fine
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className='flex space-x-4 pt-2'>
            <div className='text-sm'>
              Total:{" "}
              <span className='font-semibold'>
                ₦{totalFines.toLocaleString()}
              </span>
            </div>
            <div className='text-sm text-green-600'>
              Paid:{" "}
              <span className='font-semibold'>
                ₦{paidFines.toLocaleString()}
              </span>
            </div>
            <div className='text-sm text-red-600'>
              Unpaid:{" "}
              <span className='font-semibold'>
                ₦{unpaidFines.toLocaleString()}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className='pt-2'>
          {fines && fines.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
              {fines.map((fine) => (
                <Card key={fine._id} className='relative'>
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <CardTitle className='text-lg'>
                          ₦{fine.amount.toLocaleString()}
                        </CardTitle>
                        <CardDescription className='pt-1'>
                          {dayjs(fine.date).format("MMM DD, YYYY")}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          fine.status === "paid" ? "secondary" : "destructive"
                        }
                        className='ml-2'>
                        {fine.status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm'>{fine.reason}</p>
                  </CardContent>
                  <CardFooter className='flex justify-between pt-4'>
                    <Button
                      variant={fine.status === "paid" ? "outline" : "secondary"}
                      size='sm'
                      onClick={() => togglePaymentStatus(fine._id, fine.status)}
                      disabled={isSubmitting}>
                      {fine.status === "paid" ? (
                        <>
                          <X className='mr-2 h-4 w-4' /> Mark Unpaid
                        </>
                      ) : (
                        <>
                          <Check className='mr-2 h-4 w-4' /> Mark Paid
                        </>
                      )}
                    </Button>
                    <div className='flex space-x-2'>
                      <Dialog
                        open={openEditDialog === fine._id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenEditDialog(fine._id);
                            setAmount(fine.amount.toString());
                            setReason(fine.reason);
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
                            <DialogTitle>Edit Fine</DialogTitle>
                            <DialogDescription>
                              Update the fine details.
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
                            <div className='grid grid-cols-4 items-center gap-4'>
                              <label htmlFor='reason' className='text-right'>
                                Reason
                              </label>
                              <Input
                                id='reason'
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
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
                              onClick={() => handleUpdateFine(fine._id)}
                              disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              ) : null}
                              Update Fine
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog
                        open={openDeleteDialog === fine._id}
                        onOpenChange={(open) =>
                          setOpenDeleteDialog(open ? fine._id : null)
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
                              Are you sure you want to delete this fine of ₦
                              {fine.amount.toLocaleString()}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              variant='destructive'
                              onClick={() => handleDeleteFine(fine._id)}
                              disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              ) : null}
                              Delete Fine
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-muted-foreground'>No fines recorded yet</p>
              <Button className='mt-4' onClick={() => setOpenAddDialog(true)}>
                <Plus className='mr-2 h-4 w-4' /> Add First Fine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFines;
