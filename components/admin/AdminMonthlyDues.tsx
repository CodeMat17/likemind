"use client";

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  memberId: Id<'members'>
}

const years = [2024, 2025, 2026, 2027];
const months = [
  { id: 1, name: "Jan" },
  { id: 2, name: "Feb" },
  { id: 3, name: "Mar" },
  { id: 4, name: "Apr" },
  { id: 5, name: "May" },
  { id: 6, name: "Jun" },
  { id: 7, name: "Jul" },
  { id: 8, name: "Aug" },
  { id: 9, name: "Sept" },
  { id: 10, name: "Oct" },
  { id: 11, name: "Nov" },
  { id: 12, name: "Dec" },
];

const AdminMonthlyDues = ({memberId}: Props) => {
  const [selectedPayment, setSelectedPayment] = useState<{
    id?: Id<"monthlyDues">,
    year: number,
    month: number,
    status?: string
  } | null>(null);

  const monthlyDues = useQuery(api.monthlyDues.getByMemberId, { memberId });
  const markDues = useMutation(api.monthlyDues.markDues);
  const unMarkDues = useMutation(api.monthlyDues.unMarkDues);

  const handlePaymentClick = (year: number, month: number) => {
    const payment = monthlyDues?.find(
      (due) => due.year === year && due.month === month
    );
    setSelectedPayment({
      id: payment?._id,
      year,
      month,
      status: payment?.status
    });
  };

  const handleMarkPaid = async () => {
    if (!selectedPayment) return;

    if (selectedPayment.id) {
      await markDues({ id: selectedPayment.id });
    } else {
      await markDues({
        createNew: true,
        memberId,
        year: selectedPayment.year,
        month: selectedPayment.month,
        amount: 1000, // Default amount
      });
    }
    setSelectedPayment(null);
  };

  const handleMarkUnpaid = async () => {
    if (!selectedPayment?.id) return;
    await unMarkDues({ id: selectedPayment.id });
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-4">
          <h3 className="text-lg font-semibold">Year {year}</h3>
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {months.map((month) => {
              const payment = monthlyDues?.find(
                (due) => due.year === year && due.month === month.id
              );
              const isPaid = payment?.status === "paid";

              return (
                <button
                  key={`${year}-${month.id}`}
                  onClick={() => handlePaymentClick(year, month.id)}
                  className={`p-4 rounded-lg flex items-center justify-between ${isPaid ? 'bg-green-100' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  <span>{month.name}</span>
                  {isPaid && <Check className="w-5 h-5 text-green-600" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog open={selectedPayment !== null} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              {selectedPayment?.month && months.find(m => m.id === selectedPayment.month)?.name}{' '}
              {selectedPayment?.year}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={selectedPayment?.status === "paid" ? "destructive" : "default"}
              onClick={selectedPayment?.status === "paid" ? handleMarkUnpaid : handleMarkPaid}
            >
              {selectedPayment?.status === "paid" ? "Mark as Not Paid" : "Mark as Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMonthlyDues;