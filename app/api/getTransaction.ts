// lib/api/transactionApi.ts
import { useState, useEffect } from 'react';

// Define types for our transaction data
export interface Transaction {
  'Sr. No.': number;
  'Name': string;
  'Type': 'Credit' | 'Debit';
  'Amount': number;
  'Transaction Type': string;
  'Category': string;
  'Note': string;
  'Date': string; // Added Date field
}

export interface TransactionResponse {
  status: 'success' | 'error';
  data: Transaction[];
  message?: string;
}

export interface AddTransactionPayload {
  name: string;
  type: 'Credit' | 'Debit';
  amount: number;
  transactionType: string;
  category?: string;
  note?: string;
  date?: string; // Added Date field
}

export interface UpdateTransactionPayload extends Partial<Transaction> {
  'Sr. No.': number; // Required for updates
}

// Custom hook to fetch transactions with loading and error states
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec?action=getTransactions'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: TransactionResponse = await response.json();
      
      if (data.status === 'success') {
        setTransactions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new transaction
  const addTransaction = async (transaction: AddTransactionPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec?action=addTransaction',
        {
          method: 'POST',
          body: JSON.stringify(transaction),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        await fetchTransactions(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to add transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing transaction
  const updateTransaction = async (transaction: UpdateTransactionPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec?action=updateTransaction',
        {
          method: 'POST',
          body: JSON.stringify(transaction),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        await fetchTransactions(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec?action=deleteTransaction',
        {
          method: 'POST',
          body: JSON.stringify({ id }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        await fetchTransactions(); // Refresh the list
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { 
    transactions, 
    isLoading, 
    error, 
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};