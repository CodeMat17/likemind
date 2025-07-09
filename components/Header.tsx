"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const Header = () => {
  const pathname = usePathname();
console.log('pathname: ', pathname)
  return (
    <div className='bg-[#A7B9C8]/50 backdrop-blur-md'>
      <div className='sticky top-0 z-50 shadow-sm px-4 py-3 flex justify-end gap-8 '>
        <Button asChild size='sm'>
          {pathname === "/admin" ? (
            <Link href='/'>Go Back</Link>
          ) : (
            <Link href='/admin'>Admin</Link>
          )}
        </Button>

        <ThemeToggle />
      </div>
    </div>
  );
};

export default Header;
