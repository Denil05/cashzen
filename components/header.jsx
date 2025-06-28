import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggle } from "./theme-toggle";

const Header = async () => {
  let user = null;
  
  try {
    user = await checkUser();
  } catch (error) {
    console.error('Header error:', error);
  }

  return (
    <div className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 border-b dark:border-gray-800">
      <nav className="w-full flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src={"/logo.jpg"}
              alt="CashZen"
              width={180}
              height={45}
              className="h-12 w-auto object-contain hover:opacity-80 transition-opacity duration-300"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <SignedIn>
            <Link href={"/dashboard"}>
              <Button variant="outline" className="flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:cursor-pointer transition-colors duration-300 h-10">
                <LayoutDashboard size={18}/>
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"}>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-300 h-10"
              >
                <PenBox size={18}/>
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 h-10">Login</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
};

export default Header;
