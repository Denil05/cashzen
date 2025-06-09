import { getAccountWithTransactions } from '@/action/account';
import NotFound from '@/app/not-found';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { Suspense } from 'react'
import { BarLoader } from 'react-spinners';
import TransactionTable from '../_component/transaction-table';
import AccountChart from '../_component/account-chart';

const AccountPage = async({params}) => {
  const id = await Promise.resolve(params.id);
  const accountData = await getAccountWithTransactions(id);
  
  if(!accountData) {
    return <NotFound />;
  }
  const { transactions, ...account } = accountData;
  return (
    <div className="space-y-8 px-5">
      <div className="px-5 flex items-start justify-between gap-8">
        <div className='space-y-2'>
          <h1 className="text-5xl sm:text-6xl font-bold custom-gradient-text capitalize">{account.name}</h1>
          <p className="text-muted-foreground">{account.type.charAt(0)+account.type.slice(1).toLowerCase()} Account</p>
        </div>

        <div className="text-right mt-10">
          <div className="text-xl sm:text-2xl font-bold">${parseFloat(account.balance).toFixed(2)}</div>
          <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
        </div>
      </div>
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <AccountChart transactions={transactions}/>
      </Suspense>
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <TransactionTable transactions={transactions}/>
      </Suspense>
    </div>
  );
};
export default AccountPage;
