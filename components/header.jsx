import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  let user = null;
  
  try {
    user = await checkUser();
  } catch (error) {
    console.error('Header error:', error);
  }

  return (
    <div className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="flex item-center space-x-4">
          <SignedIn>
            <Link href={"/dashboard"} className="text-black hover:text-blue-600 flex gap-2">
              <Button variant="outline" className="hover:bg-black hover:text-white hover:cursor-pointer transition-colors duration-300">
                <LayoutDashboard size={18}/>
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"}>
              <Button 
                variant="outline" 
                className="flex center gap-2 bg-black text-white hover:bg-white hover:text-black transition-colors duration-300"
              >
                <PenBox size={18}/>
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-20 h-5",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
            {/* <SignUpButton /> */}
          </SignedOut>
        </div>
      </nav>
    </div>
  );
};

export default Header;
