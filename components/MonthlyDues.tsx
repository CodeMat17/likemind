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

// interface Member {
//   _id: string;
//   name: string;
// }

interface MonthlyDue {
  _id: string;
  memberId: string;
  month: number;
  year: number;
  status: string;
}

const MonthlyDues = () => {
  const [selectedYear, setSelectedYear] = useState(2025);

  // Fetch all required data
  const rawMembersData = useQuery(api.members.getAllMembers);
  const rawMonthlyDuesData = useQuery(api.monthlyDues.getAllMonthlyDues);

  // Memoize processed data to avoid dependency issues
  const membersData = useMemo(() => rawMembersData || [], [rawMembersData]);
  const monthlyDuesData = useMemo(
    () => rawMonthlyDuesData || [],
    [rawMonthlyDuesData]
  );

  // Get unique years from dues
  const years = useMemo(() => {
    return [2024, 2025, 2026, 2027];
  }, []);

  // Group dues by member and month
  const duesByMemberMonth = useMemo(() => {
    const map = new Map<string, Map<number, MonthlyDue>>();

    monthlyDuesData.forEach((due) => {
      if (!map.has(due.memberId)) {
        map.set(due.memberId, new Map());
      }
      const memberMap = map.get(due.memberId)!;
      memberMap.set(due.month, due);
    });

    return map;
  }, [monthlyDuesData]);

  // Create a combined list of members with their dues
  const membersWithDues = useMemo(() => {
    return membersData.map((member) => {
      const dues =
        duesByMemberMonth.get(member._id) || new Map<number, MonthlyDue>();
      return { ...member, dues };
    });
  }, [membersData, duesByMemberMonth]);

  // Calculate total paid records and amount for selected year
  const totalPaidRecords = useMemo(() => {
    return monthlyDuesData.filter(due => 
      due.status.toLowerCase() === "paid" && due.year === selectedYear
    ).length;
  }, [monthlyDuesData, selectedYear]);

  const totalAmount = useMemo(() => {
    return totalPaidRecords * 5000;
  }, [totalPaidRecords]);

  // Check if data is loading
  const isLoading = useMemo(() => {
    return rawMembersData === undefined || rawMonthlyDuesData === undefined;
  }, [rawMembersData, rawMonthlyDuesData]);

  // Handle year change
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
            <SelectTrigger className="border border-gray-400 dark:border-gray-600" >
              <SelectValue placeholder='Select year' />
            </SelectTrigger>
            <SelectContent >
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

      <div className='overflow-x-auto border rounded-lg'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Member
              </th>
              {months.map((month) => (
                <th
                  key={month.id}
                  className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {month.name.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {membersWithDues.map((member) => (
              <tr key={member._id}>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {member.name}
                </td>
                {months.map((month) => {
                  const due = member.dues.get(month.id);
                  const isCurrentYear = due?.year === selectedYear;
                  const isPaid = due?.status.toLowerCase() === "paid";

                  return (
                    <td
                      key={month.id}
                      className={`px-3 py-4 whitespace-nowrap text-center ${
                        isCurrentYear && isPaid ? "bg-green-50" : "bg-gray-50"
                      }`}>
                      {isCurrentYear ? (
                        <div
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            isPaid ? "text-green-600" : "text-gray-400"
                          }`}>
                          {isPaid ? (
                            <Check className='w-5 h-5' />
                          ) : (
                            <X className='w-5 h-5' />
                          )}
                        </div>
                      ) : (
                        <span className='text-gray-300'>-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyDues;
