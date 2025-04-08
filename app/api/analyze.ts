import { useState } from 'react';

// Types
interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedDate: string;
}

interface StockRecommendation {
  ticker: string;
  companyName: string;
  recommendationType: 'buy' | 'sell' | 'hold';
  targetPrice: number;
  currentPrice: number;
  potentialUpside: number;
  timeHorizon: string;
  riskLevel: 'low' | 'medium' | 'high';
  rationale: string[];
}

interface SectorOutlook {
  sector: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impactScore: number;
  keyDrivers: string[];
  opportunities: string[];
  risks: string[];
  recommendedStocks: string[];
}

interface MacroTrend {
  title: string;
  description: string;
  impactAssessment: string;
  affectedSectors: string[];
  investmentImplications: string[];
  timelineProjection: string;
}

interface TechnicalIndicator {
  indicator: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
  description: string;
  applicableStocks: string[];
}

interface InvestmentStrategy {
  strategyName: string;
  suitableFor: string[];
  allocationRecommendation: {
    equities: number;
    bonds: number;
    commodities: number;
    cash: number;
    alternative: number;
  };
  topPicks: string[];
  implementationSteps: string[];
}

interface InvestmentAnalysis {
  executiveSummary: string;
  marketSnapshot: {
    majorIndices: Array<{name: string, value: number, change: number}>;
    keyRates: Array<{name: string, value: number, change: number}>;
    commodities: Array<{name: string, value: number, change: number}>;
    forex: Array<{pair: string, value: number, change: number}>;
  };
  topStockRecommendations: StockRecommendation[];
  sectorOutlooks: SectorOutlook[];
  macroTrends: MacroTrend[];
  technicalAnalysis: TechnicalIndicator[];
  investmentStrategies: InvestmentStrategy[];
  disclaimer: string;
}

interface NewsAnalysisData {
  success: boolean;
  data?: {
    articles: NewsArticle[];
    analysis: InvestmentAnalysis;
    timestamp: string;
  };
  error?: string;
}

// Google Search API response interfaces
interface GoogleSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
  source?: { name?: string };
  pagemap?: {
    metatags?: Array<{
      'og:site_name'?: string;
      'article:published_time'?: string;
    }>;
  };
  displayLink?: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// Groq API response interfaces
interface GroqChoice {
  message?: {
    content?: string;
  };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

// Configuration
const CONFIG = {
  REQUEST_TIMEOUT: 60000,
  API_KEYS: {
    GOOGLE_SEARCH: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY,
    GOOGLE_CX: process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX_ID,
    GROQ: process.env.NEXT_PUBLIC_GROQ_API_KEY
  },
  DEFAULT_QUERY: "Indian Stock Market Today",
  REFRESH_INTERVAL: 3600000, // 1 hour in milliseconds
  NEWS_SOURCES: [
    "economictimes.indiatimes.com",
    "moneycontrol.com",
    "livemint.com",
    "business-standard.com"
  ],
  MAX_RETRIES: 1,
  RETRY_DELAY: 1000 // 1 second
} as const;

const INDIAN_MARKET_ANALYSIS_PROMPT = `You are a professional investment analyst specializing in Indian financial markets, with expertise in NSE, BSE, and macroeconomic trends in India. Analyze the provided news articles and generate a comprehensive investment recommendation report in JSON format focused on Indian markets. This report should provide actionable investment insights based on current market news, trends, and data.

The report should follow this structure:
{
  "executiveSummary": "HTML-formatted overview highlighting key events in Indian markets and investment opportunities",
  
  "marketSnapshot": {
    "majorIndices": [{"name": "Index name (e.g., NIFTY 50, SENSEX)", "value": 0, "change": 0}],
    "keyRates": [{"name": "Rate name (e.g., RBI Repo Rate)", "value": 0, "change": 0}],
    "commodities": [{"name": "Commodity name", "value": 0, "change": 0}],
    "forex": [{"pair": "Currency pair (e.g., INR/USD)", "value": 0, "change": 0}]
  },
  
  "topStockRecommendations": [
    {
      "ticker": "Stock ticker symbol (NSE/BSE)",
      "companyName": "Company name",
      "recommendationType": "buy|sell|hold",
      "targetPrice": 0,
      "currentPrice": 0,
      "potentialUpside": 0,
      "timeHorizon": "Short-term/Mid-term/Long-term",
      "riskLevel": "low|medium|high",
      "rationale": ["Reasons for recommendation"]
    }
  ],
  
  "sectorOutlooks": [
    {
      "sector": "Sector name (e.g., IT, Pharma, Banking)",
      "sentiment": "bullish|bearish|neutral",
      "impactScore": 0,
      "keyDrivers": ["Key drivers affecting this sector in India"],
      "opportunities": ["Investment opportunities"],
      "risks": ["Potential risks"],
      "recommendedStocks": ["Stock recommendations (NSE/BSE tickers)"]
    }
  ],
  
  "macroTrends": [
    {
      "title": "Trend name",
      "description": "HTML-formatted trend analysis for Indian context",
      "impactAssessment": "Assessment of impact on Indian markets",
      "affectedSectors": ["Sectors in India affected by this trend"],
      "investmentImplications": ["Investment implications for Indian investors"],
      "timelineProjection": "Expected timeline"
    }
  ],
  
  "technicalAnalysis": [
    {
      "indicator": "Technical indicator name",
      "signal": "buy|sell|neutral",
      "strength": 0,
      "description": "What this indicator suggests for Indian markets",
      "applicableStocks": ["Indian stocks this applies to (NSE/BSE tickers)"]
    }
  ],
  
  "investmentStrategies": [
    {
      "strategyName": "Strategy name",
      "suitableFor": ["Indian investor profiles this suits"],
      "allocationRecommendation": {
        "equities": 0,
        "bonds": 0,
        "commodities": 0,
        "cash": 0,
        "alternative": 0
      },
      "topPicks": ["Top investment picks in Indian markets"],
      "implementationSteps": ["How to implement this strategy in Indian markets"]
    }
  ],
  
  "disclaimer": "Investment disclaimer notice appropriate for Indian regulatory context"
}

Guidelines:
- Focus exclusively on Indian markets (NSE, BSE)
- Provide at least 5 specific stock recommendations from NSE/BSE with clear rationales
- Include analysis of at least 4 major market sectors relevant to India
- Identify 3-5 significant macroeconomic trends affecting Indian markets
- Consider RBI policies, government regulations, and India-specific economic factors
- Provide 3 different investment strategies for different Indian investor profiles
- Ensure all recommendations are tied directly to news events and market data
- Include both technical and fundamental analysis in your recommendations
- Discuss potential risks alongside opportunities in the Indian context
- All price targets should be in INR and predictions should be realistic
- Include an appropriate investment disclaimer for Indian markets
- Use sophisticated financial terminology while contextualizing for Indian markets`;

// Main service class
export class IndianMarketInvestmentService {
  private static lastFetchTime: number = 0;
  private static cachedData: NewsAnalysisData | null = null;
  private static isFetchingData: boolean = false;
  private static pendingPromises: Array<{
    resolve: (data: NewsAnalysisData) => void;
    reject: (error: Error) => void;
  }> = [];

  private static async fetchWithTimeout(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // If response is not OK and we haven't exceeded retry limit, retry
      if (!response.ok && retryCount < CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.fetchWithTimeout(url, options, retryCount + 1);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If error is not an abort error and we haven't exceeded retry limit, retry
      if (!(error instanceof Error && error.name === 'AbortError') && retryCount < CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.fetchWithTimeout(url, options, retryCount + 1);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  private static validateConfiguration(): void {
    const { GOOGLE_SEARCH, GOOGLE_CX, GROQ } = CONFIG.API_KEYS;
    
    if (!GOOGLE_SEARCH || GOOGLE_SEARCH === '') {
      throw new Error('Google Search API key is missing or empty');
    }
    
    if (!GOOGLE_CX || GOOGLE_CX === '') {
      throw new Error('Google Custom Search Engine ID is missing or empty');
    }
    
    if (!GROQ || GROQ === '') {
      throw new Error('Groq API key is missing or empty');
    }
  }

  private static async fetchIndianFinancialNews(): Promise<NewsArticle[]> {
    try {
      // Try various query combinations to increase chances of finding results
      const queries = [
        CONFIG.DEFAULT_QUERY,
        "NIFTY Sensex latest news",
        "Indian stock market updates",
        "NSE BSE market news"
      ];
      
      // Try each query until we get results
      for (const query of queries) {
        try {
          const articles = await this.executeGoogleSearch(query);
          if (articles.length > 0) {
            return articles;
          }
        } catch (error) {
          console.warn(`Search with query "${query}" failed:`, error);
          // Continue to next query
        }
      }
      
      // If we've made it here, we couldn't get results from any query
      throw new Error('Failed to fetch Indian market news after multiple attempts');
    } catch (error) {
      // Create placeholder news articles with direct links to financial sites
      const currentDate = new Date().toISOString();
      
      // Create articles from direct access to news sites
      const placeholderArticles: NewsArticle[] = [
        {
          title: 'Unable to fetch latest market news - Using direct sources',
          summary: 'Please visit the source links for the latest Indian market news and updates.',
          source: 'Direct Access',
          url: 'https://economictimes.indiatimes.com/markets',
          publishedDate: currentDate
        },
        {
          title: 'NIFTY and SENSEX market updates',
          summary: 'Visit MoneyControl for the latest NIFTY and SENSEX updates and market analysis.',
          source: 'MoneyControl',
          url: 'https://www.moneycontrol.com/stocksmarketsindia/',
          publishedDate: currentDate
        },
        {
          title: 'Business news and market analysis',
          summary: 'Check Livemint for comprehensive business news and market analysis for Indian markets.',
          source: 'Livemint',
          url: 'https://www.livemint.com/market',
          publishedDate: currentDate
        },
        {
          title: 'Stock market and corporate updates',
          summary: 'Find the latest corporate news and stock market updates on Business Standard.',
          source: 'Business Standard',
          url: 'https://www.business-standard.com/markets',
          publishedDate: currentDate
        }
      ];
      
      return placeholderArticles;
    }
  }
  
  private static async executeGoogleSearch(query: string): Promise<NewsArticle[]> {
    // Create search URL for Google Custom Search API
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', CONFIG.API_KEYS.GOOGLE_SEARCH || '');
    searchUrl.searchParams.append('cx', CONFIG.API_KEYS.GOOGLE_CX || '');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('num', '30'); // Request fewer results
    searchUrl.searchParams.append('sort', 'date'); 
    searchUrl.searchParams.append('dateRestrict', 'd1'); // Just last day
    searchUrl.searchParams.append('gl', 'in'); // Geographic location: India
    searchUrl.searchParams.append('hl', 'en'); // Language: English
    
    // Join the first two news sources
    searchUrl.searchParams.append('siteSearch', CONFIG.NEWS_SOURCES.slice(0, 2).join(','));
    searchUrl.searchParams.append('siteSearchFilter', 'i');

    const response = await this.fetchWithTimeout(searchUrl.toString(), { 
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`Google Search API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json() as GoogleSearchResponse;
    
    if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('No search results found');
    }

    return data.items.map((item: GoogleSearchItem) => {
      const siteName = item.pagemap?.metatags?.[0]?.['og:site_name'] || item.displayLink || 'Unknown';
      const publishedDate = item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString();
      
      return {
        title: item.title || 'No title available',
        summary: item.snippet || 'No description available',
        source: siteName,
        url: item.link || '#',
        publishedDate: publishedDate
      };
    });
  }

  private static async generateIndianMarketAnalysis(
    articles: NewsArticle[]
  ): Promise<InvestmentAnalysis> {
    try {
      const response = await this.fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.API_KEYS.GROQ}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-r1-distill-qwen-32b',
            messages: [
              { role: 'system', content: INDIAN_MARKET_ANALYSIS_PROMPT },
              { 
                role: 'user', 
                content: `Analyze these news articles about Indian financial markets and provide investment recommendations in json format:\n${JSON.stringify(articles, null, 2)}` 
              },
            ],
            temperature: 0.3,
            max_tokens: 4500,
            response_format: { type: 'json_object' },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(
          `Groq API error (${response.status}): ${errorMessage}`
        );
      }

      const data = await response.json() as GroqResponse;
      const analysisContent = data?.choices?.[0]?.message?.content;

      if (!analysisContent) {
        throw new Error('No analysis content received from Groq API');
      }

      try {
        // Ensure we can parse the JSON correctly
        return JSON.parse(analysisContent) as InvestmentAnalysis;
      } catch (parseError) {
        throw new Error(`Failed to parse Groq API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    } catch (error) {
      // Pass the error up to be handled at the service level
      throw error;
    }
  }

  public static async getIndianMarketAnalysis(): Promise<NewsAnalysisData> {
    const currentTime = Date.now();
    
    // Return cached data if available and not expired
    if (
      this.cachedData &&
      currentTime - this.lastFetchTime < CONFIG.REFRESH_INTERVAL
    ) {
      return this.cachedData;
    }
    
    // If a fetch is already in progress, queue this request
    if (this.isFetchingData) {
      return new Promise<NewsAnalysisData>((resolve, reject) => {
        this.pendingPromises.push({ resolve, reject });
      });
    }
    
    this.isFetchingData = true;
    
    try {
      // Validate configuration before making any API calls
      this.validateConfiguration();

      // Fetch news articles with our more robust method
      const articles = await this.fetchIndianFinancialNews();
      
      // Generate analysis
      const analysis = await this.generateIndianMarketAnalysis(articles);
      
      // Create successful response
      const response: NewsAnalysisData = {
        success: true,
        data: {
          articles,
          analysis,
          timestamp: new Date().toISOString(),
        },
      };

      // Update cache
      this.cachedData = response;
      this.lastFetchTime = currentTime;
      
      // Resolve all pending promises
      this.resolveAllPending(response);
      
      return response;
    } catch (error) {
      // Create error response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Indian market analysis error:', error);
      const errorResponse: NewsAnalysisData = { 
        success: false, 
        error: errorMessage 
      };
      
      // Reject all pending promises
      this.rejectAllPending(new Error(errorMessage));
      
      return errorResponse;
    } finally {
      this.isFetchingData = false;
    }
  }
  
  private static resolveAllPending(data: NewsAnalysisData): void {
    for (const pending of this.pendingPromises) {
      pending.resolve(data);
    }
    this.pendingPromises = [];
  }
  
  private static rejectAllPending(error: Error): void {
    for (const pending of this.pendingPromises) {
      pending.reject(error);
    }
    this.pendingPromises = [];
  }
  
  public static clearCache(): void {
    this.cachedData = null;
    this.lastFetchTime = 0;
  }
}

// React hook
export const useIndianMarketRecommendations = () => {
  const [investmentData, setInvestmentData] = useState<NewsAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getIndianMarketAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await IndianMarketInvestmentService.getIndianMarketAnalysis();
      setInvestmentData(result);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalysis = () => {
    IndianMarketInvestmentService.clearCache();
    return getIndianMarketAnalysis();
  };

  const clearAnalysis = () => {
    setInvestmentData(null);
    setError(null);
  };

  return {
    investmentData,
    getIndianMarketAnalysis,
    refreshAnalysis,
    clearAnalysis,
    isLoading,
    error
  };
};