"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { useTransactions, Transaction } from '@/app/api/getTransaction';

// Chart configuration
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4'
];

// Chart type selection options
type ChartView = 'category' | 'transactionType';

// Loading component for lazy loading
const ChartLoading = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-700">Loading spending data...</p>
  </div>
);

const SpendingChart: React.FC = () => {
  const { transactions, isLoading, error } = useTransactions();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [chartView, setChartView] = useState<ChartView>('category');
  const [chartData, setChartData] = useState<Array<{name: string, value: number}>>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  
  // Format currency in INR
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Process transactions data based on selected view
  useEffect(() => {
    if (!transactions.length) {
      setChartData([]);
      setTotalExpenses(0);
      return;
    }
    
    const groupByField = chartView === 'category' ? 'Category' : 'Transaction Type';
    
    const aggregatedData = transactions.reduce((acc, transaction) => {
      if (transaction?.Type === 'Debit') {
        const key = transaction[groupByField] || 'Uncategorized';
        const amount = typeof transaction.Amount === 'string' 
          ? parseFloat(transaction.Amount) 
          : Number(transaction.Amount);
        
        if (!isNaN(amount)) {
          acc[key] = (acc[key] || 0) + amount;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by value (highest first)
    const processedData = Object.entries(aggregatedData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    setChartData(processedData);
    setTotalExpenses(processedData.reduce((sum, item) => sum + item.value, 0));
  }, [transactions, chartView]);

  // Render active shape with additional details when hovering
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#1F2937" className="text-xs font-medium">
          {payload.name}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#4B5563" className="text-xs">
          {`${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-gray-800">{formatCurrency(data.value)}</p>
          <p className="text-gray-700">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(undefined);
  };

  // Custom legend component
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry: any, index: number) => (
          <li 
            key={`legend-${index}`} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveIndex(index === activeIndex ? undefined : index)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm text-gray-900 ${activeIndex === index ? 'font-medium' : ''}`}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <ChartLoading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Spending Analysis</h2>
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">Error loading data: {error}</p>
          <p className="text-gray-700 mt-2">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Spending Analysis</h2>
        <div className="flex flex-col items-center justify-center h-64">
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-gray-700">No expense data available</p>
          <p className="text-gray-600 text-sm mt-2">Try adding some transactions to see your spending breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Spending Analysis</h2>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setChartView('category')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              chartView === 'category'
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            }`}
          >
            By Category
          </button>
          <button
            type="button"
            onClick={() => setChartView('transactionType')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
              chartView === 'transactionType'
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            }`}
          >
            By Transaction Type
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm uppercase tracking-wider">Total Expenses</p>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
      </div>

      <Suspense fallback={<ChartLoading />}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Suspense>
      
      {/* Breakdown table */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {chartView === 'category' ? 'Category' : 'Transaction Type'}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((item, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 transition-colors ${activeIndex === index ? 'bg-blue-50' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {((item.value / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <td className="px-6 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(totalExpenses)}
                </td>
                <td className="px-6 py-3 text-right text-gray-700">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;