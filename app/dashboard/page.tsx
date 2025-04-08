"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useTransactions } from "@/app/api/getTransaction";

import ActionButtons from "@/app/components/ActionButtons";
import AiSuggestions from "@/app/components/AiSuggestions";
import SpendingChart from "@/app/components/SpendingChart";
import BalanceGraph from "@/app/components/BalanceChart";
import CategoryComponent from "@/app/components/Category";  
import { SignedIn,UserButton } from "@clerk/nextjs";

// Lazy load components for better performance 
const AccountsStats = lazy(() => import("@/app/components/AccountsStats"));
const TransactionHistory = lazy(() => import("@/app/components/TransactionHistory"));

// BudgetOverview Component
const BudgetOverview = () => {
  const [budgetData, setBudgetData] = useState({
    totalBudget: 35000,
    spentAmount: 22750,
    currency: '₹'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbyJ6KzWs1QdL86o0gflTFKHZvGqpeYNh9cfjbRyV9A6vf2AL-Cx8lOFrFONursaOPHSiQ/exec?action=getBudget'
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.budget) {
            setBudgetData(data.budget);
          }
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // Calculate percentage spent
  const percentageSpent = Math.min(Math.round((budgetData.spentAmount / budgetData.totalBudget) * 100), 100);
  
  // Format currency for Indian Rupees
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Determine progress bar color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-medium text-gray-900">Budget Overview</h3>
      
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-900 font-medium">Monthly Budget</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(budgetData.totalBudget)}
            </span>
          </div>
          
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div 
              className={`h-2 rounded-full ${getProgressColor(percentageSpent)}`} 
              style={{ width: `${percentageSpent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-900 font-medium">Spent</span>
            <span className="text-sm text-gray-900 font-medium">
              {formatCurrency(budgetData.spentAmount)} ({percentageSpent}%)
            </span>
          </div>
          
          <div className="flex justify-between pt-2">
            <span className="text-sm text-gray-900 font-medium">Remaining</span>
            <span className={`text-sm font-medium ${percentageSpent >= 90 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(budgetData.totalBudget - budgetData.spentAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
   
  );
};

// Loading Fallback Component
const ComponentLoader = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const { transactions, isLoading: isLoadingTransactions } = useTransactions();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Penny Wise</h1>
          <div className="flex items-center gap-4">
            <button className="rounded-full bg-gray-100 p-2 relative text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {transactions.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {Math.min(transactions.length, 9)}
                </span>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
             <UserButton/>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 md:col-span-2">
            <Suspense fallback={<ComponentLoader />}>
              <BalanceGraph />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <AccountsStats />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <SpendingChart />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <CategoryComponent />
            </Suspense>
            
            <Suspense fallback={<ComponentLoader />}>
              <TransactionHistory />
            </Suspense>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ActionButtons />
            <BudgetOverview />
            <AiSuggestions />
          </div>
        </div>
      </main>
    </div>
  );
}