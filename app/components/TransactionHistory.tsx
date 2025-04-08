"use client";

import React, { useState } from 'react';
import { useTransactions } from '@/app/api/getTransaction';
// Currency formatter for Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date to a more readable format
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Function to get transaction icon based on category
const getTransactionIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Food': (
      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </div>
    ),
    'Shopping': (
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </div>
    ),
    'Transport': (
      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>
    ),
    'Entertainment': (
      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="2" y1="7" x2="7" y2="7"></line>
          <line x1="2" y1="17" x2="7" y2="17"></line>
          <line x1="17" y1="17" x2="22" y2="17"></line>
          <line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
      </div>
    ),
    'Healthcare': (
      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      </div>
    ),
    'Salary': (
      <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>
    ),
    'Investment': (
      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      </div>
    ),
    'default': (
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
    )
  };

  return icons[category] || icons['default'];
};

// Skeleton loader component for transactions
const TransactionSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div key={i} className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="ml-3">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-2 w-16 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-2 w-12 bg-gray-200 rounded mt-2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Error component
const ErrorDisplay = ({ message, retry }: { message: string, retry: () => void }) => (
  <div className="py-6 flex flex-col items-center justify-center text-center">
    <div className="mb-3 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h4 className="text-base font-medium text-gray-900">Failed to load transactions</h4>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
    <button 
      onClick={retry}
      className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
    >
      Try Again
    </button>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="py-6 flex flex-col items-center justify-center text-center">
    <div className="mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    </div>
    <h4 className="text-base font-medium text-gray-900">No transactions yet</h4>
    <p className="mt-1 text-sm text-gray-500">Transactions will appear here once you start using your accounts.</p>
    <button className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
      Add Transaction
    </button>
  </div>
);

export default function TransactionHistory() {
  const { transactions, isLoading, error, refetch } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<'all' | 'Credit' | 'Debit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Available categories
  const categories = ['all', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Salary', 'Investment'];
  
  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = typeFilter === 'all' || transaction.Type === typeFilter;
    const categoryMatch = categoryFilter === 'all' || transaction.Category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = a.Date ? new Date(a.Date).getTime() : 0;
    const dateB = b.Date ? new Date(b.Date).getTime() : 0;
    return dateB - dateA;
  });

  // Limit to 7 transactions
  const displayTransactions = sortedTransactions.slice(0, 7);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        <button className="text-sm text-gray-600 hover:text-black">See All</button>
      </div>
      
      {/* Type Filters */}
      <div className="mb-4 flex space-x-2 overflow-x-auto">
        <button 
          onClick={() => setTypeFilter('all')}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            typeFilter === 'all' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Types
        </button>
        <button 
          onClick={() => setTypeFilter('Credit')}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            typeFilter === 'Credit' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Income
        </button>
        <button 
          onClick={() => setTypeFilter('Debit')}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            typeFilter === 'Debit' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expenses
        </button>
      </div>
      
      {/* Category Filters */}
      <div className="mb-4 flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <button 
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              categoryFilter === category 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Categories' : category}
          </button>
        ))}
      </div>
      
      {/* Transaction List with loading, error and empty states */}
      {isLoading ? (
        <TransactionSkeleton />
      ) : error ? (
        <ErrorDisplay message={error} retry={refetch} />
      ) : displayTransactions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-1 divide-y divide-gray-100">
            {displayTransactions.map((transaction) => (
              <div key={transaction['Sr. No.']} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  {getTransactionIcon(transaction.Category)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{transaction.Name}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.Category} • {transaction['Transaction Type']}
                      {transaction.Date && ` • ${formatDate(transaction.Date)}`}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  transaction.Type === 'Credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.Type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.Amount)}
                </div>
              </div>
            ))}
          </div>
          
          {/* Show count of more transactions if there are more than 7 */}
          {filteredTransactions.length > 7 && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Show {filteredTransactions.length - 7} more transactions
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}