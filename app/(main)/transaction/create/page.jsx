import { getUserAccount } from '@/action/dashboard';
import { getTransaction } from '@/action/transaction';
import React from 'react';
import AddTransactionForm from '../_components/transaction-form';
import { defaultCategories } from '@/data/categories';

const AddTransactionPage = async ({searchParams}) => {
    const accounts = await getUserAccount();

    const editId = searchParams?.edit;

    let initialData = null;
    if(editId) {
      const transaction = await getTransaction(editId);
      initialData = transaction;
    }

    console.log(editId);
  return (
    <div className='max-w-3xl mx-auto px-5'>
      <h1 className='text-5xl gradiant-title custom-gradient-text mb-8'>{editId?"Edit":"Add"} Transaction</h1>
      {/* Add your transaction form here */}
      <AddTransactionForm 
        accounts={accounts} 
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}  
      />   
    </div>
  )
}

export default AddTransactionPage;
