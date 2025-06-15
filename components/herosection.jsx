"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect,useRef } from "react";

const Herosection = () => {

    const imageRef=useRef();

    useEffect(()=>{
        const imageElement=imageRef.current;
        const handleScroll=()=>{
            const scrollPosition=window.scrollY;
            const scrollThreshold=100;
            if(scrollPosition>scrollThreshold)
            {
                imageElement.classList.add("scrolled");
            }
            else
            {
                imageElement.classList.remove("scrolled");
            }
        }
        window.addEventListener("scroll",handleScroll);
        return ()=>window.removeEventListener("scroll",handleScroll);
    },[]);

  return (
    <div className="pb-20 px-4">
        <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-8xl lg:text-[100px] pb-6 custom-gradient-text custom-gradient-bg dark:text-white">
                Track Smarter. Spend Better. <br />Powered by AI.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                An AI-powered financial management platform that helps you track,
                analyze and optimize your spending with real-time insight.
            </p>
            <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                    <Button 
                        size='lg' 
                        variant='outline'
                        className="relative px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-colors duration-300 border-2 dark:border-gray-700 min-h-[48px] flex items-center justify-center"
                    >
                        Get Started
                    </Button>
                </Link>
                <Link href="https://www.youtube.com/channel/UCpkZW4Qn-N2Gofq148pC4YQ">
                    <Button 
                        size='lg' 
                        variant='outline' 
                        className="relative px-8 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors duration-300 border-2 dark:border-gray-700 min-h-[48px] flex items-center justify-center"
                    >
                        Watch Demo
                    </Button>
                </Link>
            </div>
            <div className="hero-image-wrapper">
                <div ref={imageRef} className="hero-image">
                    <Image 
                        src="/banner1.jpg" 
                        width={1200} 
                        height={720} 
                        alt="Preview"  
                        className="rounded-lg shadow-2xl board mx-auto dark:shadow-gray-800/50" 
                        priority
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Herosection;
