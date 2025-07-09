"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// const generatePin = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

const AddMemberForm = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const addMember = useMutation(api.members.addMember);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Member name is required.");
      return;
    }

    setIsLoading(true);
    // const pin = generatePin();

    try {
      await addMember({ name });

      toast.success(`Member "${name}" added successfully.`);
      // setGeneratedPin(pin);
      setName("");
    } catch (error) {
      toast.error("Failed to add member.");
      console.log('Error Msg: ', error)
    } finally {
      setIsLoading(false);
    }
  };

  // if (generatedPin) {
  //   return (
  //     <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
  //       <h3 className="font-semibold">Member Added!</h3>
  //       <p className="text-sm text-gray-600 dark:text-gray-300">
  //         Please save this PIN securely. It will not be shown again.
  //       </p>
  //       <div className="my-2 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded font-mono text-center">
  //         {generatedPin}
  //       </div>
  //       <Button onClick={() => setGeneratedPin(null)} className="w-full">
  //         Add Another Member
  //       </Button>
  //     </div>
  //   );
  // }

  return (


      <Dialog>
        <DialogTrigger asChild>
          <Button variant='secondary'>
            Add Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)} required
              placeholder='Enter member name'
            />
            <Button onClick={handleSubmit} disabled={isLoading} className='w-full'>
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
  );
};

export default AddMemberForm;
