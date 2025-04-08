// services/transactionApi.ts

export interface Transaction {
    'Sr. No.': number;
    Name: string;
    Type: 'Credit' | 'Debit';
    Amount: number;
    'Transaction Type': string;
    Category: string;
    Note: string;
  }
  
  export interface TransactionResponse {
    status: string;
    data: Transaction[];
  }
  
  export interface FinancialSummary {
    totalBalance: number;
    totalSpent: number;
    totalCredited: number;
  }
  
  export const fetchTransactionSummary = async (): Promise<FinancialSummary> => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyJ6KzWs1QdL86o0gflTFKHZvGqpeYNh9cfjbRyV9A6vf2AL-Cx8lOFrFONursaOPHSiQ/exec?action=getTransactions'
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data: TransactionResponse = await response.json();
  
      if (data.status !== 'success' || !Array.isArray(data.data)) {
        throw new Error('Invalid data format received from API');
      }
  
      // Calculate financial summary
      return calculateFinancialSummary(data.data);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      throw error;
    }
  };
  
  export const calculateFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
    let totalCredited = 0;
    let totalSpent = 0;
  
    transactions.forEach((transaction) => {
      const amount = Number(transaction.Amount);
      
      if (transaction.Type === 'Credit') {
        totalCredited += amount;
      } else {
        totalSpent += amount;
      }
    });
  
    const totalBalance = totalCredited - totalSpent;
  
    return {
      totalBalance,
      totalSpent,
      totalCredited
    };
  };
  
  // Fetch all transactions (if needed for detailed view)
  export const fetchAllTransactions = async (): Promise<Transaction[]> => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyJ6KzWs1QdL86o0gflTFKHZvGqpeYNh9cfjbRyV9A6vf2AL-Cx8lOFrFONursaOPHSiQ/exec?action=getTransactions'
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data: TransactionResponse = await response.json();
  
      if (data.status !== 'success' || !Array.isArray(data.data)) {
        throw new Error('Invalid data format received from API');
      }
  
      return data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };