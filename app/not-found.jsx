"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-6xl font-bold custom-gradient-text mb-4 dark:text-white">404</h1>
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-4">
        <Button 
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-colors duration-300 border-2 dark:border-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
