"use client";
import { useState, FormEvent, useEffect } from "react";
import { addTransaction, TransactionData } from "@/app/api/putTransaction";

// Define categories for Credit and Debit types
const CATEGORIES = {
  Credit: ["Salary", "Investments", "Gift", "Refund", "Business", "Other"],
  Debit: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Healthcare", "Education", "Housing", "Other"]
};

export default function TransactionManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [formData, setFormData] = useState<TransactionData>({
    name: "",
    type: "Debit", // Changed from "Expense" to "Debit"
    amount: 0,
    transactionType: "Cash",
    category: "",
    note: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Open modal with predefined transaction type
  const openModal = (type: 'Credit' | 'Debit') => { // Changed from 'Income' | 'Expense' to 'Credit' | 'Debit'
    setFormData(prev => ({
      ...prev,
      type,
      name: "",
      amount: 0,
      category: "",
      note: "",
      date: new Date().toISOString().split('T')[0]
    }));
    setIsModalOpen(true);
    setError(null);
    setIsSuccess(false);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      setError("Please enter a description");
      return;
    }
    
    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to add transaction
      await addTransaction(formData);
      
      // Add to recent transactions
      setRecentTransactions(prev => [formData, ...prev].slice(0, 5));
      
      // Store in local storage
      const savedTransactions = JSON.parse(localStorage.getItem('recentTransactions') || '[]');
      localStorage.setItem('recentTransactions', JSON.stringify([formData, ...savedTransactions].slice(0, 5)));
      
      // Show success message
      setIsSuccess(true);
      
      // Reset and close form after success
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        
        // Reset form
        setFormData({
          name: "",
          type: formData.type,
          amount: 0,
          transactionType: "Cash",
          category: "",
          note: "",
          date: new Date().toISOString().split('T')[0]
        });
      }, 1500);
    } catch (err) {
      setError("Failed to add transaction. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load recent transactions from local storage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('recentTransactions');
    if (savedTransactions) {
      try {
        setRecentTransactions(JSON.parse(savedTransactions));
      } catch (err) {
        console.error("Error parsing saved transactions:", err);
      }
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Transaction buttons - Enhanced container */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">New Transaction</h2>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
          <button
            onClick={() => openModal('Credit')}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Credit
            </div>
          </button>
          <button
            onClick={() => openModal('Debit')}
            className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium rounded-lg shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Debit
            </div>
          </button>
        </div>
      </div>
      
      {/* Recent transactions toggle */}
      {recentTransactions.length > 0 && (
        <div className="mb-6">
          <button 
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-900"
          >
            <span className="mr-2">{showRecent ? 'Hide' : 'Show'} recent transactions</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transform transition-transform ${showRecent ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {/* Recent transactions list */}
          {showRecent && (
            <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-medium text-gray-700">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{transaction.name}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.category} • {transaction.transactionType} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-medium ${transaction.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                    {transaction.note && (
                      <p className="mt-1 text-sm text-gray-500">Note: {transaction.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative animate-fade-in">
            {/* Close button */}
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${formData.type === 'Credit' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {formData.type === 'Credit' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {formData.type === 'Credit' ? 'Add Credit' : 'Add Debit'}
                </h2>
              </div>

              {isSuccess && (
                <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                  Transaction added successfully!
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-800">Description</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter transaction description"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-800">Amount (₹)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="transactionType" className="block text-sm font-medium text-gray-800">Payment Method</label>
                    <select
                      id="transactionType"
                      name="transactionType"
                      value={formData.transactionType}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-800">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES[formData.type as 'Credit' | 'Debit'].map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-800">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="note" className="block text-sm font-medium text-gray-800">Note (Optional)</label>
                  <textarea
                    id="note"
                    name="note"
                    rows={2}
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Additional details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                    formData.type === 'Credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    formData.type === 'Credit' ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Save ${formData.type}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}