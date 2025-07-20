"use client";

import MonthlyDues from "@/components/MonthlyDues";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";

interface VerificationResult {
  success: boolean;
  accessCode: string;
  name: string;
}

export default function Home() {

  const verifyMember = useMutation(api.members.verifyMember);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [showAccessCode, setShowAccessCode] = useState<boolean>(false);

  const toggleVisibility = () => {
    setShowAccessCode(!showAccessCode);
  };

  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  const handleChange = (index: number, value: string) => {
    // Allow alphanumeric characters
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.toUpperCase(); // Convert to uppercase
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }

    // Allow navigation with arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    let pasteData = e.clipboardData.getData("text/plain");
    // Remove non-alphanumeric characters and limit to 6 characters
    pasteData = pasteData
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase();

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }

    setDigits(newDigits);

    // Focus last input if pasted data is complete
    if (pasteData.length === 6 && inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const accessCode = digits.join("").toUpperCase();
    if (accessCode.length !== 6) {
      setError("Please enter a complete 6-character code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyMember({ accessCode });
      setVerificationResult(result as VerificationResult);
    } catch (error) {
      setError("Verification failed. Please try again.");
      console.log("Error Msg: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='min-h-screen px-4 py-4 pb-12 md:px-8 bg-gray-50 dark:bg-gray-950'>
      {verificationResult?.name ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-7xl mx-auto'>
          <div className='relative mb-8 '>
            <h1 className='text-3xl text-center font-bold uppercase'>
              FInance Portal
            </h1>
          </div>

          <Tabs defaultValue='monthly' className='w-full'>
            <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 gap-2 p-2 mb-8'>
              <TabsTrigger
                value='monthly'
                className='border border-gray-300 dark:border-gray-600'>
                Monthly Dues
              </TabsTrigger>
              <TabsTrigger
                value='project'
                className='border border-gray-300 dark:border-gray-600'>
                Project Levy
              </TabsTrigger>
              <TabsTrigger
                value='benefits'
                className='border  border-gray-300 dark:border-gray-600'>
                Benefits
              </TabsTrigger>
              <TabsTrigger
                value='fines'
                className='border  border-gray-300 dark:border-gray-600'>
                Fines
              </TabsTrigger>
            </TabsList>

            <TabsContent value='monthly'>
              <MonthlyDues />
            </TabsContent>
            <TabsContent value='project'>
              {/* <ProjectLevy memberId={member._id} /> */}
              Project Levy
            </TabsContent>
            <TabsContent value='benefits'>
              {/* <Benefits memberId={member._id} />
               */}
              Benefit
            </TabsContent>
            <TabsContent value='fines'>
              {/* <Fines memberId={member._id} /> */}
              Fines
            </TabsContent>
          </Tabs>
        </motion.div>
      ) : (
        <div className='mt-20 max-w-sm mx-auto px-'>
          <div className='flex justify-center items-center'>
            <Image
              alt='logo'
              priority
              src='/logo.png'
              width={80}
              height={80}
              className='rounded-lg object-cover mb-4 md:mb-6'
            />
          </div>
          <h1 className='text-center text-xl md:text-2xl font-medium'>
            Enter your verification code
          </h1>

          <form onSubmit={handleSubmit} onPaste={handlePaste} className='mt-6'>
            <div className='relative'>
              <div className='flex justify-center items-center gap-3 sm:gap-3'>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type={showAccessCode ? "text" : "password"}
                    inputMode='text'
                    pattern='[A-Z0-9]*'
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    autoComplete='one-time-code'
                    disabled={isLoading}
                    className='w-10 h-12 sm:w-10 sm:h-12 p-1 sm:p-4 text-center text-lg sm:text-xl font-medium bg-gray-200 dark:bg-gray-700 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors'
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    aria-label={`Character ${index + 1} of 6`}
                  />
                ))}
              </div>
            </div>

            <div className='flex justify-center mt-2 mb-1'>
              <button
                type='button'
                className='text-xs text-gray-500 hover:text-gray-700 flex items-center'
                onClick={toggleVisibility}>
                {showAccessCode ? (
                  <EyeOff className='w-3 h-3 mr-1' />
                ) : (
                  <Eye className='w-3 h-3 mr-1' />
                )}
                {showAccessCode ? "Hide code" : "Show code"}
              </button>
            </div>

            {error && (
              <div className='error-message text-center text-red-500 text-sm md:text-base mb-1'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              size='lg'
              className='w-full mt-4 md:mt-6 py-3'
              disabled={isLoading || digits.join("").length !== 6}>
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <span className='animate-spin mr-2 w-4 h-4 border-t-2 border-r-2 border-white rounded-full'></span>
                  Verifying...
                </div>
              ) : (
                "Verify Membership"
              )}
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}
