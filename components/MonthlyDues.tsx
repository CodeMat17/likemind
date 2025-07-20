"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useMemo, useCallback } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Member {
  _id: string;
  name: string;
}

interface MonthlyDue {
  _id: string;
  memberId: string;
  month: number;
  year: number;
  status: string;
}

const months = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const MonthlyDues = () => {
  const [selectedYear, setSelectedYear] = useState(2025);

  const rawMembersData = useQuery(api.members.getAllMembers);
  const rawMonthlyDuesData = useQuery(api.monthlyDues.getAllMonthlyDues);

  const membersData = useMemo<Member[]>(
    () => rawMembersData || [],
    [rawMembersData]
  );
  const monthlyDuesData = useMemo<MonthlyDue[]>(
    () => rawMonthlyDuesData || [],
    [rawMonthlyDuesData]
  );

  const years = useMemo(() => [2024, 2025, 2026, 2027], []);

  const duesByMemberMonth = useMemo(() => {
    const map = new Map<string, Map<number, MonthlyDue>>();
    monthlyDuesData.forEach((due) => {
      if (!map.has(due.memberId)) map.set(due.memberId, new Map());
      map.get(due.memberId)!.set(due.month, due);
    });
    return map;
  }, [monthlyDuesData]);

  const membersWithDues = useMemo(() => {
    return membersData
      .map((member) => {
        const dues =
          duesByMemberMonth.get(member._id) || new Map<number, MonthlyDue>();
        return { ...member, dues };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [membersData, duesByMemberMonth]);

  const totalPaidRecords = useMemo(() => {
    return monthlyDuesData.filter(
      (due) => due.status.toLowerCase() === "paid" && due.year === selectedYear
    ).length;
  }, [monthlyDuesData, selectedYear]);

  const totalAmount = useMemo(
    () => totalPaidRecords * 5000,
    [totalPaidRecords]
  );

  const isLoading = useMemo(
    () => rawMembersData === undefined || rawMonthlyDuesData === undefined,
    [rawMembersData, rawMonthlyDuesData]
  );

  const handleYearChange = useCallback((value: string) => {
    setSelectedYear(Number(value));
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center py-12'>Loading payment data...</div>
    );
  }

  return (
    <div className='rounded-xl overflow-hidden'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Monthly Dues</h1>
        <div className='w-40'>
          <Select
            value={selectedYear.toString()}
            onValueChange={handleYearChange}>
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

      <div className='my-4 p-4 bg-blue-50 rounded-lg text-sm'>
        <h3 className='font-medium text-blue-800'>Data Summary</h3>
        <ul className='list-disc pl-5 mt-2 text-blue-700 space-y-1'>
          <li>Showing {membersWithDues.length} members</li>
          <li>Selected year: {selectedYear}</li>
          <li>Total paid months: {totalPaidRecords}</li>
          <li>Total amount: ₦{totalAmount.toLocaleString()}</li>
        </ul>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {membersWithDues.map((member) => (
          <Card key={member._id} className='shadow-md dark:bg-gray-800'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>
                {member.name}
              </CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-4 gap-2 text-sm'>
              {months.map((month) => {
                const due = member.dues.get(month.id);
                const isCurrentYear = due?.year === selectedYear;
                const isPaid = due?.status.toLowerCase() === "paid";
                return (
                  <div
                    key={month.id}
                    className={`flex flex-col items-center justify-center p-2 rounded-md text-xs font-medium border ${
                      isCurrentYear && isPaid
                        ? "bg-green-100 text-green-600 border-green-300"
                        : isCurrentYear
                          ? "bg-gray-100 dark:bg-gray-600 text-muted-foreground border-gray-300"
                          : "bg-gray-400 text-gray-300 border-gray-200"
                    }`}>
                    <span>{month.name.substring(0, 3)}</span>
                    {isCurrentYear ? (
                      isPaid ? (
                        <Check className='w-4 h-4' />
                      ) : (
                        <X className='w-4 h-4' />
                      )
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonthlyDues;
