// components/dashboard/AiSuggestions.tsx
"use client";

import React from "react";

export default function AiSuggestions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Smart Insights</h3>
        <div className="rounded-full bg-gray-100 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Suggestion 1 */}
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12" y2="16"></line>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Subscription Alert</h4>
              <p className="mt-1 text-xs text-gray-600">You have 3 subscriptions totaling $45.97 per month that could be reviewed.</p>
              <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">Review Now</button>
            </div>
          </div>
        </div>
        
        {/* Suggestion 2 */}
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Savings Opportunity</h4>
              <p className="mt-1 text-xs text-gray-600">Based on your spending, you can save an additional $250 this month.</p>
              <button className="mt-2 text-xs font-medium text-green-600 hover:text-green-800">See How</button>
            </div>
          </div>
        </div>
      </div>
      
      <button className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100">
        View All Insights
      </button>
    </div>
  );
}