"use client";

import { updateDefaultAccount } from '@/action/account';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';

const AccountCard = ({account}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async(event) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent card click when toggling default
    if(account.isDefault) {
      toast.warning("You need at least one default account");
      return;
    }
    try {
      await updateDefaultFn(account.id);
    } catch (err) {
      console.error("Error updating default account:", err);
      toast.error("Failed to update default account");
    }
  };

  useEffect(() => {
    if(updatedAccount?.success) {
      toast.success("Default account updated successfully");
    } else if (updatedAccount?.error) {
      toast.error(updatedAccount.error);
    }
  }, [updatedAccount]);

  useEffect(() => {
    if(error) {
      console.error("Error in AccountCard:", error);
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <div className="relative">
      {updateDefaultLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-blue-600">Updating...</p>
          </div>
        </div>
      )}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-blue-600">Loading Account Details...</p>
          </div>
        </div>
      )}
      <Link href={`/account/${account.id}`} onClick={() => setIsNavigating(true)}>
        <Card key={account.id} className="hover:shadow-md transition-shadow group relative cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium capitalize">{account.name}</CardTitle>
            <div onClick={handleDefaultChange}>
              <Switch 
                checked={account.isDefault} 
                disabled={updateDefaultLoading}
                className="hover:bg-primary/80 hover:cursor-pointer transition-colors"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(account.balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">    
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500"/>Expense
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
};

export default AccountCard; 