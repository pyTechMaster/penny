"use client"

import React, { useEffect, useState } from 'react';
import { useIndianMarketRecommendations } from '@/app/api/analyze';

// Define types for better type safety
type ChangeColorType = (change: number) => string;
type TabType = 'overview' | 'recommendations' | 'sectors' | 'macro' | 'strategies';

const IndianMarketDashboard: React.FC = () => {
  const { 
    investmentData, 
    getIndianMarketAnalysis, 
    refreshAnalysis, 
    isLoading, 
    error 
  } = useIndianMarketRecommendations();
  
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');

  useEffect(() => {
    getIndianMarketAnalysis();
  }, [getIndianMarketAnalysis]);

  // Fix the type error by explicitly typing the parameter
  const getChangeColor: ChangeColorType = (change: number) => {
    return change >= 0 ? 'text-green-700' : 'text-red-700';
  };

  // Extract loading state component for reusability
  const renderLoadingState = () => (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black mx-auto"></div>
        <p className="mt-4 text-sm text-black">Analyzing market data...</p>
      </div>
    </div>
  );

  // Extract error state component
  const renderErrorState = () => (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-black">Error Loading Data</h2>
        <p className="text-black mb-4">{error}</p>
        <button 
          onClick={refreshAnalysis}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Extract empty state component
  const renderEmptyState = () => (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-black">No Market Data Available</h2>
        <p className="text-black mb-4">Market data could not be retrieved.</p>
        <button 
          onClick={refreshAnalysis}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Load Data
        </button>
      </div>
    </div>
  );

  // Handle different states
  if (isLoading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!investmentData?.data) return renderEmptyState();

  const { analysis, timestamp } = investmentData.data;
  const formattedDate = new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Component for the Overview tab
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-black">Executive Summary</h3>
        <div className="text-black" dangerouslySetInnerHTML={{ __html: analysis.executiveSummary }} />
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-black">Market Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-3 text-black">Major Indices</h4>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-sm font-medium text-black">Index</th>
                  <th className="pb-2 text-right text-sm font-medium text-black">Value</th>
                  <th className="pb-2 text-right text-sm font-medium text-black">Change</th>
                </tr>
              </thead>
              <tbody>
                {analysis.marketSnapshot.majorIndices.map((index, i) => (
                  <tr key={i}>
                    <td className="py-2 text-sm text-black">{index.name}</td>
                    <td className="py-2 text-sm text-black text-right">{index.value.toLocaleString('en-IN')}</td>
                    <td className={`py-2 text-sm text-right font-medium ${getChangeColor(index.change)}`}>
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-3 text-black">Key Rates</h4>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-sm font-medium text-black">Rate</th>
                  <th className="pb-2 text-right text-sm font-medium text-black">Value</th>
                  <th className="pb-2 text-right text-sm font-medium text-black">Change</th>
                </tr>
              </thead>
              <tbody>
                {analysis.marketSnapshot.keyRates.map((rate, i) => (
                  <tr key={i}>
                    <td className="py-2 text-sm text-black">{rate.name}</td>
                    <td className="py-2 text-sm text-black text-right">{rate.value.toFixed(2)}%</td>
                    <td className={`py-2 text-sm text-right font-medium ${getChangeColor(rate.change)}`}>
                      {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Component for the Recommendations tab
  const RecommendationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-black">Top Stock Recommendations</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="pb-2 text-left text-sm font-medium text-black">Stock</th>
              <th className="pb-2 text-left text-sm font-medium text-black">Rec</th>
              <th className="pb-2 text-right text-sm font-medium text-black">Price</th>
              <th className="pb-2 text-right text-sm font-medium text-black">Target</th>
              <th className="pb-2 text-right text-sm font-medium text-black">Upside</th>
              <th className="pb-2 text-center text-sm font-medium text-black">Risk</th>
            </tr>
          </thead>
          <tbody>
            {analysis.topStockRecommendations.map((stock, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-3 text-sm">
                  <div className="font-medium text-black">{stock.ticker}</div>
                  <div className="text-gray-600 text-xs">{stock.companyName}</div>
                </td>
                <td className="py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    stock.recommendationType === 'buy' ? 'bg-green-50 text-green-700' : 
                    stock.recommendationType === 'sell' ? 'bg-red-50 text-red-700' : 
                    'bg-gray-50 text-black'
                  }`}>
                    {stock.recommendationType.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 text-sm text-black text-right">₹{stock.currentPrice.toLocaleString('en-IN')}</td>
                <td className="py-3 text-sm text-black text-right">₹{stock.targetPrice.toLocaleString('en-IN')}</td>
                <td className="py-3 text-sm text-right font-medium">
                  <span className={getChangeColor(stock.potentialUpside)}>
                    {stock.potentialUpside >= 0 ? '+' : ''}{stock.potentialUpside.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-sm text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    stock.riskLevel === 'high' ? 'bg-red-50 text-red-700' : 
                    stock.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-green-50 text-green-700'
                  }`}>
                    {stock.riskLevel.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {analysis.topStockRecommendations.map((stock, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-black">{stock.ticker} - {stock.companyName}</h3>
              <div className="mt-1 flex items-center text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${
                  stock.recommendationType === 'buy' ? 'bg-green-50 text-green-700' : 
                  stock.recommendationType === 'sell' ? 'bg-red-50 text-red-700' : 
                  'bg-gray-50 text-black'
                }`}>
                  {stock.recommendationType.toUpperCase()}
                </span>
                <span className="text-gray-600">{stock.timeHorizon} • {stock.riskLevel.toUpperCase()} Risk</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-black">₹{stock.targetPrice.toLocaleString('en-IN')}</div>
              <div className={`text-sm font-medium ${getChangeColor(stock.potentialUpside)}`}>
                {stock.potentialUpside >= 0 ? '+' : ''}{stock.potentialUpside.toFixed(1)}% upside
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-black mb-2">Investment Rationale</h4>
            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
              {stock.rationale.map((point, j) => (
                <li key={j}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  // Component for the Sectors tab
  const SectorsTab = () => (
    <div className="space-y-6">
      {analysis.sectorOutlooks.map((sector, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-black">{sector.sector}</h3>
              <div className="mt-1 flex items-center text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${
                  sector.sentiment === 'bullish' ? 'bg-green-50 text-green-700' : 
                  sector.sentiment === 'bearish' ? 'bg-red-50 text-red-700' : 
                  'bg-gray-50 text-black'
                }`}>
                  {sector.sentiment.toUpperCase()}
                </span>
                <span className="text-gray-600">Impact: {sector.impactScore}/10</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Key Drivers</h4>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {sector.keyDrivers.map((driver, j) => (
                  <li key={j}>{driver}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Opportunities</h4>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {sector.opportunities.map((opportunity, j) => (
                  <li key={j}>{opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-black mb-2">Recommended Stocks</h4>
            <div className="flex flex-wrap gap-2">
              {sector.recommendedStocks.map((stock, j) => (
                <span key={j} className="px-2 py-1 bg-gray-50 text-black text-xs font-medium rounded">
                  {stock}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Component for the Macro tab
  const MacroTab = () => (
    <div className="space-y-6">
      {analysis.macroTrends.map((trend, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-black">{trend.title}</h3>
          <div className="text-sm text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: trend.description }} />
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Affected Sectors</h4>
              <div className="flex flex-wrap gap-2">
                {trend.affectedSectors.map((sector, j) => (
                  <span key={j} className="px-2 py-1 bg-gray-50 text-black text-xs font-medium rounded">
                    {sector}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Investment Implications</h4>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {trend.investmentImplications.map((implication, j) => (
                  <li key={j}>{implication}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Component for the Strategies tab
  const StrategiesTab = () => (
    <div className="space-y-6">
      {analysis.investmentStrategies.map((strategy, i) => (
        <div key={i} className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-black">{strategy.strategyName}</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-black mb-2">Allocation</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(strategy.allocationRecommendation).map(([key, value]) => (
                <div key={key} className="px-3 py-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">{key}</div>
                  <div className="text-sm font-medium text-black">{value}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Top Picks</h4>
              <div className="flex flex-wrap gap-2">
                {strategy.topPicks.map((pick, j) => (
                  <span key={j} className="px-2 py-1 bg-gray-50 text-black text-xs font-medium rounded">
                    {pick}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-black mb-2">Implementation</h4>
              <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1">
                {strategy.implementationSteps.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render the appropriate tab content based on selection
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewTab />;
      case 'recommendations':
        return <RecommendationsTab />;
      case 'sectors':
        return <SectorsTab />;
      case 'macro':
        return <MacroTab />;
      case 'strategies':
        return <StrategiesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-black">Indian Market Intelligence</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Updated: {formattedDate}</span>
              <button
                onClick={refreshAnalysis}
                className="px-3 py-1 bg-black text-white text-sm rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-6">
            {(['overview', 'recommendations', 'sectors', 'macro', 'strategies'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-1 py-3 text-sm font-medium border-b-2 ${
                  selectedTab === tab ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        
        {renderTabContent()}
        
        <div className="mt-8 text-xs text-gray-600 p-4 bg-white rounded border border-gray-200">
          <p dangerouslySetInnerHTML={{ __html: analysis.disclaimer }} />
        </div>
      </main>
    </div>
  );
};

export default IndianMarketDashboard;