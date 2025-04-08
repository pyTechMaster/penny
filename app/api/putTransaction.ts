interface TransactionData {
  name: string;
  type: string; // "Income" or "Expense"
  amount: number;
  transactionType: string; // "Cash", "Card", etc.
  category: string;
  note: string;
  date: string;
}

/**
 * Adds a new transaction to the spreadsheet using the Google Apps Script
 * @param data Transaction data to be added
 * @returns Promise with the response from the server
 */
export const addTransaction = async (data: TransactionData): Promise<any> => {
  try {
    // Base URL for the Google Apps Script
    const baseUrl = "https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec";
    
    // Create URL with query parameters
    const url = new URL(baseUrl);
    url.searchParams.append("action", "addTransaction");
    
    // Create payload for POST request
    const payload = {
      name: data.name,
      type: data.type,
      amount: data.amount,
      transactionType: data.transactionType,
      category: data.category || "",
      note: data.note || "",
      date: data.date || new Date().toISOString().split('T')[0]
    };
    
    // Make POST request with JSON payload
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check content type to determine how to process the response
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      // If response is JSON, parse it
      return await response.json();
    } else {
      // If not JSON (likely plain text), return as text but in a structured format
      const textResponse = await response.text();
      return { 
        success: true, 
        message: textResponse,
        data: data
      };
    }
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

/**
 * Gets all transactions from the spreadsheet
 * @returns Promise with the list of transactions
 */
export const getTransactions = async (): Promise<any> => {
  try {
    const baseUrl = "https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec";
    
    const url = new URL(baseUrl);
    url.searchParams.append("action", "getTransactions");
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

/**
 * Updates an existing transaction in the spreadsheet
 * @param data Transaction data with Sr. No. to identify which transaction to update
 * @returns Promise with the response from the server
 */
export const updateTransaction = async (data: TransactionData & { "Sr. No.": number }): Promise<any> => {
  try {
    const baseUrl = "https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec";
    
    const url = new URL(baseUrl);
    url.searchParams.append("action", "updateTransaction");
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

/**
 * Deletes a transaction from the spreadsheet
 * @param id The Sr. No. of the transaction to delete
 * @returns Promise with the response from the server
 */
export const deleteTransaction = async (id: number): Promise<any> => {
  try {
    const baseUrl = "https://script.google.com/macros/s/AKfycbwpVDMAbxpwKP0mwyfj_b19cMUMx4JOeVLPgjDcHlRQYX2NHvCm9OOFmApbGD3yYbn-dg/exec";
    
    const url = new URL(baseUrl);
    url.searchParams.append("action", "deleteTransaction");
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// Export types for use in other components
export type { TransactionData };