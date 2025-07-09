"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AdminMonthlyDues from "./admin/AdminMonthlyDues";
import AdminFines from "./admin/AdminFines";
import AdminProjectLevy from "./admin/AdminProjectLevy";
import AddMemberForm from "./AddMemberForm";

const MembersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const getAllMembers = useQuery(api.members.getAllMembers);

  const filteredMembers =
    getAllMembers?.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="">
      <div className='flex flex-col items-center mb-6 gap-4'>
        <div className="w-full flex flex-col sm:flex-row gap-2 items-center sm:justify-between">
  <h2 className='text-2xl sm:text-3xl font-semibold'>Members List</h2>
<AddMemberForm />
        </div>
      
        <Input
          placeholder='Search members...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm py-5 shadow-md dark:bg-gray-800'
        />
      </div>
      <div className='mt-6'>
        {getAllMembers === undefined ? (
          <p className='text-center px-4 py-24 animate-pulse'>
            List loading...
          </p>
        ) : filteredMembers.length < 1 ? (
          <p className='text-center px-4 py-24'>
            {searchTerm ? "No matching members" : "List is empty"}
          </p>
        ) : (
          filteredMembers.map((member) => (
            <Sheet key={member._id}>
              <SheetTrigger asChild>
                <div className='border bg-white rounded-xl shadow-md dark:bg-gray-800 p-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                  <div className='flex items-center gap-2'>
                    <Avatar>
                      <AvatarFallback className='font-medium dark:bg-gray-700'>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className='text-lg font-medium'>{member.name}</h2>
                      <p className="text-sm italic text-muted-foreground tracking-wider">PIN: { member.accessCode}</p>
                    </div>
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='p-6 space-y-4 w-full sm:max-w-[540px] md:max-w-[640px] overflow-y-auto max-h-screen'>
                <h2 className='text-2xl font-bold'>{member.name}</h2>
                <div className='space-y-1 text-sm'>
                  <Tabs defaultValue='monthlydues' className=''>
                    <TabsList className='gap-2 grid grid-cols-2 md:grid-cols-4'>
                      <TabsTrigger className='border' value='monthlydues'>
                        Monthly Dues
                      </TabsTrigger>
                      <TabsTrigger className='border' value='projectlevy'>
                        Project Levy
                      </TabsTrigger>
                      <TabsTrigger className='border' value='benefits'>
                        Benefits
                      </TabsTrigger>
                      <TabsTrigger className='border' value='fines'>
                        Fines
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value='monthlydues'>
                      <AdminMonthlyDues memberId={member._id} />
                    </TabsContent>
                    <TabsContent value='projectlevy'>
                      <AdminProjectLevy memberId={member._id} />
                    </TabsContent>
                    <TabsContent value='benefits'>Coming soon...</TabsContent>
                    <TabsContent value='fines'>
                      <AdminFines memberId={member._id} />
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          ))
        )}
      </div>
    </div>
  );
};

export default MembersList;
