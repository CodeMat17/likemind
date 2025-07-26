"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const PAYMENT_AMOUNT = 5000; // Each payment is 5000 Naira

const MonthlyDues = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const membersWithDues = useQuery(api.monthlyDues.getAllMembersWithPaidDues);

  if (!membersWithDues) {
    return <div>Loading...</div>;
  }

  // Sort members alphabetically by name
  const sortedMembers = [...membersWithDues].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Calculate summary data
  const totalPaidRecordsForYear = sortedMembers.reduce((sum, member) => {
    return (
      sum +
      (member.paidDues?.filter((due) => due.year === parseInt(selectedYear))
        .length || 0)
    );
  }, 0);

  const totalPaidRecordsAllYears = sortedMembers.reduce((sum, member) => {
    return sum + (member.paidDues?.length || 0);
  }, 0);

  const totalAmountForYear = totalPaidRecordsForYear * PAYMENT_AMOUNT;
  const grandTotalAmount = totalPaidRecordsAllYears * PAYMENT_AMOUNT;

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  return (
    <div className='space-y-8'>
      {/* Header with Title and Year Selector */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Monthly Dues</h1>
        <div className='w-40'>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className='border border-gray-400 dark:border-gray-600'>
              <SelectValue placeholder='Select year' />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Section */}
      <div className='my-4 p-4 bg-blue-50 rounded-lg text-sm'>
        <h3 className='font-medium text-blue-800'>Data Summary</h3>
        <ul className='list-disc pl-5 mt-2 text-blue-700 space-y-1'>
          <li>Showing {sortedMembers.length} members</li>
          <li>Selected year: {selectedYear}</li>
          <li>Total paid months: {totalPaidRecordsForYear}</li>
          <li>
            Total monthly dues for {selectedYear}: ₦
            {totalAmountForYear.toLocaleString()}
          </li>
          <li>
            Grand total (Monthly Dues so far): ₦
            {grandTotalAmount.toLocaleString()}
          </li>
        </ul>
      </div>

      {/* Members and Dues */}
      {sortedMembers.map((member) => (
        <div key={member._id} className='space-y-4'>
          <h2 className='text-xl font-bold'>{member.name}</h2>
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Year {selectedYear}</h3>
            <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
              {months.map((month) => {
                const isPaid = member.paidDues?.some(
                  (due) =>
                    due.year === parseInt(selectedYear) &&
                    due.month === month.id
                );

                return (
                  <div
                    key={`${member._id}-${selectedYear}-${month.id}`}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      isPaid ? "bg-green-100" : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                    <span className={isPaid ? "dark:text-green-500" : ""}>
                      {month.name}
                    </span>
                    {isPaid && <Check className='w-5 h-5 text-green-600' />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonthlyDues;
