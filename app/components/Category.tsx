"use client";

import React, { useState, useEffect } from 'react';
import { useTransactions } from '@/app/api/getTransaction';

// Currency formatter for Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Date formatter
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Category icons using the same style as your transaction component
const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Food': (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </div>
    ),
    'Shopping': (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </div>
    ),
    'Transport': (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>
    ),
    'Entertainment': (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
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
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      </div>
    ),
    'default': (
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
    )
  };

  return icons[category] || icons['default'];
};

// Skeleton loader for the category spending cards
const SpendingCardsSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="ml-3">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-full bg-gray-200 rounded mb-3"></div>
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Error display component
const ErrorDisplay = ({ message, retry }: { message: string, retry: () => void }) => (
  <div className="py-6 flex flex-col items-center justify-center text-center">
    <div className="mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h4 className="text-base font-medium text-gray-900">Failed to load spending data</h4>
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
    <h4 className="text-base font-medium text-gray-900">No spending data yet</h4>
    <p className="mt-1 text-sm text-gray-500">Start logging your expenses to view insights by category.</p>
  </div>
);

// Progress bar component
const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="h-2 w-full bg-gray-100 rounded-full mt-2 mb-2">
    <div 
      className="h-2 bg-gray-700 rounded-full" 
      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
    ></div>
  </div>
);

// Date Input Component
const DateInput = ({
  id,
  label,
  value,
  onChange,
  max
}: {
  id: string;
  label: string;
  value: string;
  onChange: (date: string) => void;
  max?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-xs text-gray-500 mb-1">{label}</label>
    <input
      id={id}
      type="date"
      value={value}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
    />
  </div>
);

export default function CategorySpendingAnalytics() {
  const { transactions, isLoading, error, refetch } = useTransactions();
  const [periodFilter, setPeriodFilter] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize dates for custom range
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(today);
  
  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate date ranges based on the selected period
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    let label = '';
    
    switch (periodFilter) {
      case 'weekly':
        start.setDate(now.getDate() - 7);
        label = 'Last 7 days';
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        label = 'Last 30 days';
        break;
      case 'quarterly':
        start.setMonth(now.getMonth() - 3);
        label = 'Last 3 months';
        break;
      case 'yearly':
        start.setFullYear(now.getFullYear() - 1);
        label = 'Last 12 months';
        break;
      case 'custom':
        const customStart = new Date(startDate);
        const customEnd = new Date(endDate);
        // Format the display label
        label = `${formatDate(customStart)} - ${formatDate(customEnd)}`;
        return { start: customStart, end: customEnd, label };
      default:
        start.setMonth(now.getMonth() - 1);
        label = 'Last 30 days';
    }
    
    return { start, end: now, label };
  };
  
  // Toggle custom date picker
  const toggleDatePicker = () => {
    if (!showDatePicker) {
      setPeriodFilter('custom');
    }
    setShowDatePicker(!showDatePicker);
  };
  
  // Apply custom filter
  const applyCustomFilter = () => {
    setPeriodFilter('custom');
    setShowDatePicker(false);
  };
  
  // Filter transactions by date and type
  const filterTransactions = () => {
    const { start, end } = getDateRange();
    return transactions.filter(transaction => {
      const transactionDate = transaction.Date ? new Date(transaction.Date) : null;
      const isWithinDateRange = transactionDate ? 
        (transactionDate >= start && transactionDate <= end) : false;
      return isWithinDateRange && transaction.Type === 'Debit'; // Only expense transactions
    });
  };
  
  // Calculate spending by category
  const calculateCategorySpending = () => {
    const filteredTransactions = filterTransactions();
    
    // Calculate total spending and by category
    const totalAmount = filteredTransactions.reduce((total, t) => total + t.Amount, 0);
    
    // Group by category
    const categorySpendings: Record<string, { amount: number, percentage: number, count: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.Category || 'Other';
      
      if (!categorySpendings[category]) {
        categorySpendings[category] = { amount: 0, percentage: 0, count: 0 };
      }
      
      categorySpendings[category].amount += transaction.Amount;
      categorySpendings[category].count += 1;
    });
    
    // Calculate percentages and sort by amount
    Object.keys(categorySpendings).forEach(category => {
      categorySpendings[category].percentage = 
        totalAmount > 0 ? (categorySpendings[category].amount / totalAmount) * 100 : 0;
    });
    
    // Sort categories by amount (highest first)
    const sortedCategories = Object.keys(categorySpendings).sort(
      (a, b) => categorySpendings[b].amount - categorySpendings[a].amount
    );
    
    return {
      categories: sortedCategories,
      data: categorySpendings,
      totalAmount,
      transactionCount: filteredTransactions.length
    };
  };

  // Get spending data
  const spendingData = isLoading ? null : calculateCategorySpending();
  const dateRange = getDateRange();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Category Spending</h3>
        <span className="text-sm text-gray-500">{dateRange.label}</span>
      </div>
      
      {/* Time Period Filters */}
      <div className="mb-4 flex flex-wrap gap-2 overflow-x-auto">
        <button 
          onClick={() => {
            setPeriodFilter('weekly');
            setShowDatePicker(false);
          }}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            periodFilter === 'weekly' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Weekly
        </button>
        <button 
          onClick={() => {
            setPeriodFilter('monthly');
            setShowDatePicker(false);
          }}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            periodFilter === 'monthly' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button 
          onClick={() => {
            setPeriodFilter('quarterly');
            setShowDatePicker(false);
          }}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            periodFilter === 'quarterly' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Quarterly
        </button>
        <button 
          onClick={() => {
            setPeriodFilter('yearly');
            setShowDatePicker(false);
          }}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            periodFilter === 'yearly' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Yearly
        </button>
        <button 
          onClick={toggleDatePicker}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium flex items-center ${
            periodFilter === 'custom' 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Custom Range
        </button>
      </div>
      
      {/* Custom Date Range Picker */}
      {showDatePicker && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">Select Date Range</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DateInput
              id="start-date"
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              max={endDate}
            />
            <DateInput
              id="end-date"
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              max={today}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setShowDatePicker(false)}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              onClick={applyCustomFilter}
              className="rounded-lg bg-black px-3 py-1 text-sm font-medium text-white hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      
      {/* Spending Data */}
      {isLoading ? (
        <SpendingCardsSkeleton />
      ) : error ? (
        <ErrorDisplay message={error} retry={refetch} />
      ) : spendingData && spendingData.categories.length === 0 ? (
        <EmptyState />
      ) : spendingData && (
        <>
          {/* Total spending summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Total Spending</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(spendingData.totalAmount)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {spendingData.transactionCount} transactions across {spendingData.categories.length} categories
            </div>
          </div>
          
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendingData.categories.map(category => (
              <div key={category} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  {getCategoryIcon(category)}
                  <div className="ml-3">
                    <h4 className="text-md font-medium text-gray-900">{category}</h4>
                  </div>
                </div>
                
                <div className="text-xl font-semibold text-gray-900">
                  {formatCurrency(spendingData.data[category].amount)}
                </div>
                
                <ProgressBar percentage={spendingData.data[category].percentage} />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{spendingData.data[category].percentage.toFixed(1)}% of total</span>
                  <span>{spendingData.data[category].count} transactions</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* View More Link */}
          <div className="mt-6 pt-3 border-t border-gray-100 text-center">
            <button className="text-sm font-medium text-gray-700 hover:text-black">
              View Detailed Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
}