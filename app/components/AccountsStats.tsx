"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, RefreshCw, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { useTransactions, Transaction } from "@/app/api/getTransaction";

// Interfaces
interface FinancialSummary {
  totalBalance: number;
  totalCredited: number;
  totalSpent: number;
}

interface TimePeriodData {
  overall: FinancialSummary;
  weekly: FinancialSummary;
  monthly: FinancialSummary;
  currentWeek: string;
  currentMonth: string;
}

// Progress Bar Component
const ProgressBar: React.FC<{ value: number; maxValue: number }> = ({ value, maxValue }) => {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100) || 0);
  
  let bgColor = 'bg-black';
  if (percentage >= 90) bgColor = 'bg-gray-900';
  else if (percentage >= 70) bgColor = 'bg-gray-700';
  
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block text-gray-800">
            Healthy spending: &lt;70%
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-gray-800">
            {percentage}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-4 mb-2 text-xs flex rounded-full bg-gray-200">
        <div
          style={{ width: `${percentage}%` }}
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${bgColor}`}
        ></div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-black mr-2"></span>
          <span className="text-xs text-gray-800">0-70% (Good)</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-gray-700 mr-2"></span>
          <span className="text-xs text-gray-800">71-90% (Warning)</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-gray-900 mr-2"></span>
          <span className="text-xs text-gray-800">91-100% (Critical)</span>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-4 border border-gray-200 rounded-lg bg-white">
    <p className="text-sm text-gray-800">{label}</p>
    <p className="text-xl font-semibold text-black">{value}</p>
  </div>
);

// Loading placeholder component
const LoadingPlaceholder: React.FC = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
  </div>
);

export default function AccountsStats() {
  const { transactions, isLoading, error: fetchError, refetch } = useTransactions();
  
  const [summaryData, setSummaryData] = useState<TimePeriodData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overall' | 'monthly' | 'weekly'>('overall');
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);

  // Calculate financial summaries
  const calculateSummaries = (transactions: Transaction[]): TimePeriodData => {
    // Initialize empty summary objects
    const overall: FinancialSummary = { totalBalance: 0, totalCredited: 0, totalSpent: 0 };
    const weekly: FinancialSummary = { totalBalance: 0, totalCredited: 0, totalSpent: 0 };
    const monthly: FinancialSummary = { totalBalance: 0, totalCredited: 0, totalSpent: 0 };
    
    // Get current date for weekly and monthly filters
    const today = new Date();
    
    // Calculate week range based on offset
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

    // Calculate month range based on offset
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
    
    // Format date strings for display
    const weekDateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
    const currentWeekStr = `${weekDateFormat.format(currentWeekStart)} - ${weekDateFormat.format(currentWeekEnd)}`;
    
    const monthDateFormat = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
    const currentMonthStr = monthDateFormat.format(currentMonth);

    // Process transactions
    transactions.forEach(transaction => {
      const amount = transaction.Amount;
      const transactionDate = new Date(transaction.Date);
      
      // Overall summary
      if (transaction.Type === 'Credit') {
        overall.totalCredited += amount;
        overall.totalBalance += amount;
      } else {
        overall.totalSpent += amount;
        overall.totalBalance -= amount;
      }
      
      // Weekly summary
      if (transactionDate >= currentWeekStart && transactionDate <= currentWeekEnd) {
        if (transaction.Type === 'Credit') {
          weekly.totalCredited += amount;
          weekly.totalBalance += amount;
        } else {
          weekly.totalSpent += amount;
          weekly.totalBalance -= amount;
        }
      }
      
      // Monthly summary
      if (transactionDate.getMonth() === currentMonth.getMonth() && 
          transactionDate.getFullYear() === currentMonth.getFullYear()) {
        if (transaction.Type === 'Credit') {
          monthly.totalCredited += amount;
          monthly.totalBalance += amount;
        } else {
          monthly.totalSpent += amount;
          monthly.totalBalance -= amount;
        }
      }
    });
    
    return {
      overall,
      weekly,
      monthly,
      currentWeek: currentWeekStr,
      currentMonth: currentMonthStr
    };
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const data = calculateSummaries(transactions);
      setSummaryData(data);
    }
  }, [transactions, currentWeekOffset, currentMonthOffset]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetTimeframes = () => {
    setCurrentWeekOffset(0);
    setCurrentMonthOffset(0);
  };

  // Get the current active summary based on selected tab
  const getActiveSummary = () => {
    if (!summaryData) return null;
    switch (activeTab) {
      case 'monthly':
        return summaryData.monthly;
      case 'weekly':
        return summaryData.weekly;
      default:
        return summaryData.overall;
    }
  };

  const activeSummary = getActiveSummary();

  if (isLoading && !refreshing) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header with title and refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Financial Summary</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">{refreshing ? "Refreshing..." : "Updated just now"}</span>
          <button 
            onClick={loadData} 
            className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={16} className="text-gray-800" />
          </button>
        </div>
      </div>
      
      {/* Time period tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => {setActiveTab('overall'); resetTimeframes();}}
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'overall' ? 'text-black border-b-2 border-black' : 'text-gray-700 hover:text-black'}`}
        >
          Overall
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'monthly' ? 'text-black border-b-2 border-black' : 'text-gray-700 hover:text-black'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'weekly' ? 'text-black border-b-2 border-black' : 'text-gray-700 hover:text-black'}`}
        >
          Weekly
        </button>
      </div>
      
      {/* Time period navigation */}
      {activeTab !== 'overall' && summaryData && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => activeTab === 'weekly' 
              ? setCurrentWeekOffset(prev => prev - 1) 
              : setCurrentMonthOffset(prev => prev - 1)}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <ChevronLeft size={16} className="text-gray-800" />
          </button>
          
          <div className="flex items-center">
            <Calendar size={16} className="text-gray-800 mr-2" />
            <span className="font-medium text-black">
              {activeTab === 'weekly' ? summaryData.currentWeek : summaryData.currentMonth}
            </span>
          </div>
          
          <button
            onClick={() => activeTab === 'weekly' 
              ? setCurrentWeekOffset(prev => prev + 1) 
              : setCurrentMonthOffset(prev => prev + 1)}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <ChevronRight size={16} className="text-gray-800" />
          </button>
        </div>
      )}
      
      {/* Error message */}
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {fetchError}
          </p>
          <button 
            onClick={loadData} 
            className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Main financial cards */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance */}
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Wallet size={20} className="text-gray-800 mr-2" />
                  <p className="text-base font-medium text-gray-800">Total Balance</p>
                </div>
                <p className="text-3xl font-bold text-black mb-2">
                  {activeSummary ? formatCurrency(activeSummary.totalBalance) : '₹0'}
                </p>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${activeSummary && activeSummary.totalBalance >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {activeSummary && activeSummary.totalBalance >= 0 ? "Positive Balance" : "Negative Balance"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Credited */}
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <ArrowUpRight size={20} className="text-green-600 mr-2" />
                  <p className="text-base font-medium text-gray-800">Total Income</p>
                </div>
                <p className="text-3xl font-bold text-black mb-2">
                  {activeSummary ? formatCurrency(activeSummary.totalCredited) : '₹0'}
                </p>
                <div className="mt-1">
                  <div className="flex items-center text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Income
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <ArrowDownRight size={20} className="text-red-600 mr-2" />
                  <p className="text-base font-medium text-gray-800">Total Expenses</p>
                </div>
                <p className="text-3xl font-bold text-black mb-2">
                  {activeSummary ? formatCurrency(activeSummary.totalSpent) : '₹0'}
                </p>
                <div className="mt-1">
                  <div className="flex items-center text-sm">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Expenses
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>

      {/* Progress bar */}
      {activeSummary && activeSummary.totalCredited > 0 && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-white">
          <div className="flex justify-between items-center mb-4">
            <p className="text-base font-medium text-black">Spending vs Income</p>
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-black mr-1"></span>
              <p className="text-sm font-medium text-gray-800">
                {`${Math.round((activeSummary.totalSpent / activeSummary.totalCredited) * 100)}%`}
              </p>
            </div>
          </div>
          
          <ProgressBar 
            value={activeSummary.totalSpent} 
            maxValue={activeSummary.totalCredited} 
          />
        </div>
      )}

      {/* Quick Stats */}
      {activeSummary && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <QuickStats 
            label="Savings Rate" 
            value={activeSummary.totalCredited > 0 
              ? `${Math.round(((activeSummary.totalCredited - activeSummary.totalSpent) / activeSummary.totalCredited) * 100)}%` 
              : "0%"} 
          />
          
          <QuickStats 
            label="Average Transaction" 
            value={formatCurrency((activeSummary.totalCredited + activeSummary.totalSpent) / 
              (activeTab === 'weekly' ? 7 : 
               activeTab === 'monthly' ? 30 : 
               Math.max(transactions.length, 1)))} 
          />
        </div>
      )}

      {/* View all button */}
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
          View All Transactions
        </button>
      </div>
    </div>
  );
}