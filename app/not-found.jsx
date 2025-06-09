"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <h1 className="text-6xl font-bold custom-gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-4">
        <Button 
          onClick={() => router.back()}
          variant="outline"
          className="flex items-center gap-2 bg-black text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
