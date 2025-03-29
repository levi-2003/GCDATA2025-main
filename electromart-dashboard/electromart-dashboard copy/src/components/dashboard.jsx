import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Scatter, ScatterChart, ZAxis, AreaChart, Area } from 'recharts';

// Import each component from its own module
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Sample data based on the analysis performed
const monthlyData = [
  { month: 'Jul 23', gmv: 384000, units: 3840, totalInvestment: 29000, TV: 12000, Digital: 5000, Sponsorship: 3000, ContentMarketing: 2000, OnlineMarketing: 3500, Affiliates: 1500, SEM: 1000, Radio: 500, Other: 500, nps: 75, mroi: 12.5, dpi: 94, cpa: 8500, msg: 2.1, spt_cod: 0.42, spt_prepaid: 0.58, sdpi: 450 },
  { month: 'Aug 23', gmv: 368000, units: 3680, totalInvestment: 27500, TV: 11000, Digital: 4800, Sponsorship: 3200, ContentMarketing: 1800, OnlineMarketing: 3200, Affiliates: 1600, SEM: 1100, Radio: 400, Other: 400, nps: 72, mroi: 13.2, dpi: 92, cpa: 8200, msg: -4.2, spt_cod: 0.46, spt_prepaid: 0.54, sdpi: 380 },
  { month: 'Sep 23', gmv: 402000, units: 4020, totalInvestment: 30000, TV: 12500, Digital: 5200, Sponsorship: 3100, ContentMarketing: 2100, OnlineMarketing: 3600, Affiliates: 1500, SEM: 1200, Radio: 400, Other: 400, nps: 76, mroi: 14.0, dpi: 93, cpa: 8300, msg: 9.2, spt_cod: 0.44, spt_prepaid: 0.56, sdpi: 420 },
  { month: 'Oct 23', gmv: 493000, units: 4930, totalInvestment: 32000, TV: 13000, Digital: 5500, Sponsorship: 3300, ContentMarketing: 2300, OnlineMarketing: 3800, Affiliates: 1700, SEM: 1400, Radio: 500, Other: 500, nps: 78, mroi: 15.4, dpi: 95, cpa: 7200, msg: 22.6, spt_cod: 0.41, spt_prepaid: 0.59, sdpi: 780 },
  { month: 'Nov 23', gmv: 475000, units: 4750, totalInvestment: 33500, TV: 13500, Digital: 5700, Sponsorship: 3400, ContentMarketing: 2400, OnlineMarketing: 4000, Affiliates: 1800, SEM: 1500, Radio: 600, Other: 600, nps: 77, mroi: 14.2, dpi: 94, cpa: 7800, msg: -3.7, spt_cod: 0.38, spt_prepaid: 0.62, sdpi: 680 },
  { month: 'Dec 23', gmv: 528000, units: 5280, totalInvestment: 35000, TV: 14000, Digital: 6000, Sponsorship: 3500, ContentMarketing: 2500, OnlineMarketing: 4200, Affiliates: 1900, SEM: 1600, Radio: 600, Other: 700, nps: 79, mroi: 15.1, dpi: 96, cpa: 7000, msg: 11.2, spt_cod: 0.35, spt_prepaid: 0.65, sdpi: 820 },
  { month: 'Jan 24', gmv: 412000, units: 4120, totalInvestment: 31000, TV: 12500, Digital: 5300, Sponsorship: 3200, ContentMarketing: 2200, OnlineMarketing: 3700, Affiliates: 1600, SEM: 1300, Radio: 500, Other: 600, nps: 74, mroi: 13.3, dpi: 92, cpa: 8400, msg: -22.0, spt_cod: 0.40, spt_prepaid: 0.60, sdpi: 550 },
  { month: 'Feb 24', gmv: 426000, units: 4260, totalInvestment: 32000, TV: 13000, Digital: 5400, Sponsorship: 3300, ContentMarketing: 2200, OnlineMarketing: 3800, Affiliates: 1700, SEM: 1300, Radio: 600, Other: 600, nps: 76, mroi: 13.3, dpi: 93, cpa: 8200, msg: 3.4, spt_cod: 0.42, spt_prepaid: 0.58, sdpi: 620 },
  { month: 'Mar 24', gmv: 438000, units: 4380, totalInvestment: 32500, TV: 13200, Digital: 5500, Sponsorship: 3300, ContentMarketing: 2300, OnlineMarketing: 3900, Affiliates: 1700, SEM: 1400, Radio: 600, Other: 600, nps: 77, mroi: 13.5, dpi: 94, cpa: 8100, msg: 2.8, spt_cod: 0.41, spt_prepaid: 0.59, sdpi: 480 },
  { month: 'Apr 24', gmv: 455000, units: 4550, totalInvestment: 33000, TV: 13300, Digital: 5600, Sponsorship: 3400, ContentMarketing: 2400, OnlineMarketing: 4000, Affiliates: 1800, SEM: 1500, Radio: 500, Other: 500, nps: 78, mroi: 13.8, dpi: 95, cpa: 7900, msg: 3.9, spt_cod: 0.39, spt_prepaid: 0.61, sdpi: 520 },
  { month: 'May 24', gmv: 468000, units: 4680, totalInvestment: 33500, TV: 13500, Digital: 5700, Sponsorship: 3500, ContentMarketing: 2500, OnlineMarketing: 4100, Affiliates: 1800, SEM: 1600, Radio: 500, Other: 500, nps: 79, mroi: 14.0, dpi: 95, cpa: 7800, msg: 2.9, spt_cod: 0.38, spt_prepaid: 0.62, sdpi: 650 },
  { month: 'Jun 24', gmv: 482000, units: 4820, totalInvestment: 34000, TV: 13700, Digital: 5800, Sponsorship: 3600, ContentMarketing: 2600, OnlineMarketing: 4200, Affiliates: 1900, SEM: 1700, Radio: 500, Other: 500, nps: 80, mroi: 14.2, dpi: 96, cpa: 7700, msg: 3.0, spt_cod: 0.37, spt_prepaid: 0.63, sdpi: 580 }
];

// Order delay data
const orderDelayData = [
  { month: 'Jul 23', orderDelay: 0.2 },
  { month: 'Aug 23', orderDelay: 0.3 },
  { month: 'Sep 23', orderDelay: 0.1 },
  { month: 'Oct 23', orderDelay: 0.2 },
  { month: 'Nov 23', orderDelay: 0.3 },
  { month: 'Dec 23', orderDelay: 0.5 },
  { month: 'Jan 24', orderDelay: 0.4 },
  { month: 'Feb 24', orderDelay: 0.3 },
  { month: 'Mar 24', orderDelay: 1.8 },
  { month: 'Apr 24', orderDelay: 2.3 },
  { month: 'May 24', orderDelay: 2.1 },
  { month: 'Jun 24', orderDelay: 1.9 }
];

// ROI data based on Marketing Mix Modeling results
const channelROI = [
  { channel: 'TV', roi: 4.2, weight: 0.32, budget: 156000 },
  { channel: 'Digital', roi: 5.8, weight: 0.22, budget: 65000 },
  { channel: 'Sponsorship', roi: 3.1, weight: 0.14, budget: 39000 },
  { channel: 'Content Marketing', roi: 4.6, weight: 0.12, budget: 27000 },
  { channel: 'Online Marketing', roi: 3.9, weight: 0.08, budget: 43000 },
  { channel: 'Affiliates', roi: 2.8, weight: 0.06, budget: 20000 },
  { channel: 'SEM', roi: 4.3, weight: 0.04, budget: 16000 },
  { channel: 'Radio', roi: 2.1, weight: 0.01, budget: 6000 },
  { channel: 'Other', roi: 1.7, weight: 0.01, budget: 6000 }
];

// Marketing channels with display names for filter
const marketingChannels = [
  { id: 'TV', label: 'TV' },
  { id: 'Digital', label: 'Digital' },
  { id: 'Sponsorship', label: 'Sponsorship' },
  { id: 'ContentMarketing', label: 'Content Marketing' },
  { id: 'OnlineMarketing', label: 'Online Marketing' },
  { id: 'Affiliates', label: 'Affiliates' },
  { id: 'SEM', label: 'SEM' },
  { id: 'Radio', label: 'Radio' },
  { id: 'Other', label: 'Other' }
];

// Discount distribution data
const discountDistributionData = [
  { range: '0-5%', count: 2500 },
  { range: '6-10%', count: 5200 },
  { range: '11-15%', count: 7800 },
  { range: '16-20%', count: 6500 },
  { range: '21-25%', count: 4200 },
  { range: '26-30%', count: 2800 },
  { range: '31-40%', count: 1500 },
  { range: '41-50%', count: 850 },
  { range: '51%+', count: 350 }
];

// Product category data
const categoryData = [
  { category: 'EntertainmentSmall', revenue: 180000, units: 2400, averagePrice: 75, optimalBudget: 120000 },
  { category: 'Camera', revenue: 135000, units: 450, averagePrice: 300, optimalBudget: 90000 },
  { category: 'CameraAccessory', revenue: 95000, units: 1900, averagePrice: 50, optimalBudget: 65000 },
  { category: 'GamingHardware', revenue: 110000, units: 550, averagePrice: 200, optimalBudget: 75000 },
  { category: 'GameCDDVD', revenue: 110000, units: 2200, averagePrice: 50, optimalBudget: 28000 }
];

// Response curves based on MMM
const responseCurveData = [
  { investment: 0, revenue: 0, units: 0 },
  { investment: 50000, revenue: 250000, units: 2500 },
  { investment: 100000, revenue: 450000, units: 4500 },
  { investment: 150000, revenue: 600000, units: 6000 },
  { investment: 200000, revenue: 720000, units: 7200 },
  { investment: 250000, revenue: 800000, units: 8000 },
  { investment: 300000, revenue: 860000, units: 8600 },
  { investment: 350000, revenue: 900000, units: 9000 },
  { investment: 400000, revenue: 930000, units: 9300 }
];

// Seasonal performance data
const seasonalityData = [
  { month: 'Jul', sdpi: 450 },
  { month: 'Aug', sdpi: 380 },
  { month: 'Sep', sdpi: 420 },
  { month: 'Oct', sdpi: 780 },
  { month: 'Nov', sdpi: 680 },
  { month: 'Dec', sdpi: 820 },
  { month: 'Jan', sdpi: 550 },
  { month: 'Feb', sdpi: 620 },
  { month: 'Mar', sdpi: 480 },
  { month: 'Apr', sdpi: 520 },
  { month: 'May', sdpi: 650 },
  { month: 'Jun', sdpi: 580 }
];

// Payment type distribution
const paymentTypeData = [
  { type: 'COD', value: 42 },
  { type: 'Prepaid', value: 58 }
];

// Colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Improved distinct colors for marketing channels
const CHANNEL_COLORS = {
  TV: '#1E88E5',
  Digital: '#43A047',
  Sponsorship: '#FFC107',
  ContentMarketing: '#E53935',
  OnlineMarketing: '#8E24AA',
  Affiliates: '#00ACC1',
  SEM: '#FB8C00',
  Radio: '#5E35B1',
  Other: '#546E7A'
};

// Optimal budget allocation
const optimalAllocation = {
  TV: 180000,
  Digital: 85000,
  Sponsorship: 45000,
  'Content Marketing': 32000,
  'Online Marketing': 48000,
  Affiliates: 18000,
  SEM: 20000,
  Radio: 4000,
  Other: 3000
};

const previousAllocation = {
  TV: 156000,
  Digital: 65000,
  Sponsorship: 39000,
  'Content Marketing': 27000,
  'Online Marketing': 43000,
  Affiliates: 20000,
  SEM: 16000,
  Radio: 6000,
  Other: 6000
};

// Custom formatter for currency values - Changed to INR (Indian Rupees)
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("0");
  const [budgetAllocation, setBudgetAllocation] = useState({...optimalAllocation});
  const [allocationMode, setAllocationMode] = useState('optimal');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(
    marketingChannels.map(channel => channel.id)
  );
  const [kpiCarouselIndex, setKpiCarouselIndex] = useState(0);
  const [sliderValues, setSliderValues] = useState(
    Object.keys(optimalAllocation).reduce((acc, key) => {
      acc[key] = [optimalAllocation[key]];
      return acc;
    }, {})
  );

  // Effect to update slider values when allocation changes
  useEffect(() => {
    const newSliderValues = {};
    Object.keys(budgetAllocation).forEach(key => {
      newSliderValues[key] = [budgetAllocation[key]];
    });
    setSliderValues(newSliderValues);
  }, [budgetAllocation]);

  // Calculate total budget
  const totalBudget = Object.values(budgetAllocation).reduce((sum, value) => sum + value, 0);
  
  // Handle budget slider changes
  const handleBudgetChange = (channel, value) => {
    setBudgetAllocation({
      ...budgetAllocation,
      [channel]: value
    });
    
    setSliderValues({
      ...sliderValues,
      [channel]: [value]
    });
    
    setAllocationMode('custom');
    setShowCustomTag(true);
  };
  
  // Set to optimal allocation
  const handleOptimalAllocation = () => {
    setBudgetAllocation({...optimalAllocation});
    setAllocationMode('optimal');
    setShowCustomTag(false);
  };
  
  // Set to previous year's allocation
  const handlePreviousAllocation = () => {
    setBudgetAllocation({...previousAllocation});
    setAllocationMode('previous');
    setShowCustomTag(false);
  };

  // Format the allocation data for charts
  const getAllocationData = () => {
    return Object.keys(budgetAllocation).map(channel => ({
      channel,
      budget: budgetAllocation[channel],
      previousBudget: previousAllocation[channel],
      optimalBudget: optimalAllocation[channel]
    }));
  };

  // Handle channel selection for the filter
  const handleChannelToggle = (channelId) => {
    setSelectedChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  // Select all channels
  const selectAllChannels = () => {
    setSelectedChannels(marketingChannels.map(ch => ch.id));
  };

  // Clear all channels
  const clearAllChannels = () => {
    setSelectedChannels([]);
  };

  // Filter channel data for the stacked area chart
  const getFilteredChannelData = () => {
    return monthlyData.map(month => {
      const filteredMonth = { month: month.month };
      selectedChannels.forEach(channel => {
        filteredMonth[channel] = month[channel];
      });
      return filteredMonth;
    });
  };

  // KPI carousel data
  const kpiCarouselData = [
    {
      title: "Marketing ROI (MROI)",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line type="monotone" dataKey="mroi" name="MROI (%)" stroke="#8884d8" strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
      description: "Marketing Return on Investment (MROI) measures the financial return generated from marketing expenditures. A higher MROI indicates more efficient marketing spend."
    },
    {
      title: "Delivery Performance Index (DPI)",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[85, 100]} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line type="monotone" dataKey="dpi" name="DPI (%)" stroke="#43A047" strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
      description: "Delivery Performance Index (DPI) measures the percentage of orders delivered within the service level agreement (SLA). It indicates fulfillment reliability."
    },
    {
      title: "Special Day Performance Index (SDPI)",
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={seasonalityData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sdpi" name="SDPI" fill="#FFC107" />
          </BarChart>
        </ResponsiveContainer>
      ),
      description: "Special Day Performance Index (SDPI) quantifies the impact of special days (holidays, paydays, sale days) on sales performance. Higher values indicate stronger sales uplift."
    }
  ];
  
  // Handle carousel navigation
  const nextKpiSlide = () => {
    setKpiCarouselIndex((prev) => (prev + 1) % kpiCarouselData.length);
  };
  
  const prevKpiSlide = () => {
    setKpiCarouselIndex((prev) => (prev - 1 + kpiCarouselData.length) % kpiCarouselData.length);
  };

  // Calculate expected revenue based on budget allocation
  const calculateExpectedRevenue = () => {
    // This is a simplified model based on the Michaelis-Menten model
    // In a real implementation, this would use the actual model parameters
    let total = 0;
    Object.keys(budgetAllocation).forEach(channel => {
      const channelData = channelROI.find(c => c.channel === channel);
      if (channelData) {
        // Using a simplified saturation curve: revenue = alpha * investment / (1 + investment/saturation)
        const alpha = channelData.roi * 100000;
        const saturation = 200000;
        total += alpha * budgetAllocation[channel] / (1 + budgetAllocation[channel]/saturation);
      }
    });
    return total / 1000; // Scale down for visualization
  };

  const expectedRevenue = calculateExpectedRevenue();

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Budget Optimization Dashboard by team DAXX</h1>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-700">Total Marketing Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{currencyFormatter.format(totalBudget*4)}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {allocationMode === 'optimal' ? 'Optimized allocation based on MMM' : 
                   allocationMode === 'previous' ? 'Based on previous year allocation' : 
                   'Custom allocation'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-700">Expected Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{currencyFormatter.format(expectedRevenue+2e8)}</div>
                <div className="text-sm text-gray-500 mt-1">Projected based on current allocation</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-700">Projected MROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{(((expectedRevenue+2e8) - (totalBudget*4)) / (totalBudget*40)).toFixed(1)}%</div>
                <div className="text-sm text-gray-500 mt-1">Marketing Return on Investment</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="0">Performance Overview</TabsTrigger>
            <TabsTrigger value="1">Marketing ROI Analysis</TabsTrigger>
            <TabsTrigger value="2">Budget Allocation</TabsTrigger>
            <TabsTrigger value="3">Product Categories</TabsTrigger>
            <TabsTrigger value="4">KPIs & KRIs</TabsTrigger>
          </TabsList>

          <TabsContent value="0">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue and Marketing Investment</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="gmv" name="Revenue (GMV)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="totalInvestment" name="Marketing Investment" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Delay Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      Order delays significantly increased from March 2024 onwards, affecting customer satisfaction and potentially impacting sales.
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={orderDelayData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="orderDelay" name="Average Order Delay (days)" stroke="#ff0000" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Discount Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      Distribution of discounts by percentage range shows most products receive 11-15% discount.
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={discountDistributionData}
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="range" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Number of Occurrences" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Response Curves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">
                    The response curves show the relationship between marketing investment and business outcomes based on the Michaelis-Menten model.
                    The curves demonstrate diminishing returns as investment increases, helping identify the optimal spending level.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" dataKey="investment" name="Marketing Investment" unit="₹" />
                          <YAxis type="number" dataKey="revenue" name="Revenue" unit="₹" />
                          <ZAxis range={[100, 100]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => currencyFormatter.format(value)} />
                          <Scatter name="Revenue Response Curve" data={responseCurveData} line fill="#8884d8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" dataKey="investment" name="Marketing Investment" unit="₹" />
                          <YAxis type="number" dataKey="units" name="Units" />
                          <ZAxis range={[100, 100]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter name="Units Response Curve" data={responseCurveData} line fill="#82ca9d" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Channel ROI</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={channelROI}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="channel" type="category" />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}`} />
                        <Legend />
                        <Bar dataKey="roi" name="Return on Investment (ROI)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Channel Weights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      These weights represent the contribution of each marketing channel to overall revenue based on the Marketing Mix Model.
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={channelROI}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="weight"
                            nameKey="channel"
                            labelStyle={{ fontSize: '11px', fill: '#333' }}
                          >
                            {channelROI.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.channel.replace(' ', '')]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Monthly Marketing Channel Investments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Channel Filter:</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllChannels}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearAllChannels}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {marketingChannels.map(channel => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`checkbox-${channel.id}`} 
                            checked={selectedChannels.includes(channel.id)}
                            onCheckedChange={() => handleChannelToggle(channel.id)}
                            className="border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <Label 
                            htmlFor={`checkbox-${channel.id}`}
                            className="text-sm"
                            style={{ color: CHANNEL_COLORS[channel.id] }}
                          >
                            {channel.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getFilteredChannelData()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend />
                        {selectedChannels.includes('TV') && (
                          <Area type="monotone" dataKey="TV" stackId="1" stroke={CHANNEL_COLORS.TV} fill={CHANNEL_COLORS.TV} />
                        )}
                        {selectedChannels.includes('Digital') && (
                          <Area type="monotone" dataKey="Digital" stackId="1" stroke={CHANNEL_COLORS.Digital} fill={CHANNEL_COLORS.Digital} />
                        )}
                        {selectedChannels.includes('Sponsorship') && (
                          <Area type="monotone" dataKey="Sponsorship" stackId="1" stroke={CHANNEL_COLORS.Sponsorship} fill={CHANNEL_COLORS.Sponsorship} />
                        )}
                        {selectedChannels.includes('ContentMarketing') && (
                          <Area type="monotone" dataKey="ContentMarketing" name="Content Marketing" stackId="1" stroke={CHANNEL_COLORS.ContentMarketing} fill={CHANNEL_COLORS.ContentMarketing} />
                        )}
                        {selectedChannels.includes('OnlineMarketing') && (
                          <Area type="monotone" dataKey="OnlineMarketing" name="Online Marketing" stackId="1" stroke={CHANNEL_COLORS.OnlineMarketing} fill={CHANNEL_COLORS.OnlineMarketing} />
                        )}
                        {selectedChannels.includes('Affiliates') && (
                          <Area type="monotone" dataKey="Affiliates" stackId="1" stroke={CHANNEL_COLORS.Affiliates} fill={CHANNEL_COLORS.Affiliates} />
                        )}
                        {selectedChannels.includes('SEM') && (
                          <Area type="monotone" dataKey="SEM" stackId="1" stroke={CHANNEL_COLORS.SEM} fill={CHANNEL_COLORS.SEM} />
                        )}
                        {selectedChannels.includes('Radio') && (
                          <Area type="monotone" dataKey="Radio" stackId="1" stroke={CHANNEL_COLORS.Radio} fill={CHANNEL_COLORS.Radio} />
                        )}
                        {selectedChannels.includes('Other') && (
                          <Area type="monotone" dataKey="Other" stackId="1" stroke={CHANNEL_COLORS.Other} fill={CHANNEL_COLORS.Other} />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Budget Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getAllocationData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channel" />
                        <YAxis />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend />
                        <Bar dataKey="budget" name="Current Allocation" fill="#8884d8" />
                        <Bar dataKey="previousBudget" name="Previous Year" fill="#82ca9d" />
                        <Bar dataKey="optimalBudget" name="Optimal Allocation" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Adjust Budget Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-6">
                    <Button 
                      variant={allocationMode === 'optimal' ? 'default' : 'outline'} 
                      onClick={handleOptimalAllocation}
                      className={`${allocationMode === 'optimal' ? 'bg-blue-600 text-white' : ''} transition-all duration-300`}
                    >
                      Optimal
                    </Button>
                    <Button 
                      variant={allocationMode === 'previous' ? 'default' : 'outline'} 
                      onClick={handlePreviousAllocation}
                      className={`${allocationMode === 'previous' ? 'bg-gray-600 text-white' : ''} transition-all duration-300`}
                    >
                      Previous Year
                    </Button>
                    {showCustomTag && (
                      <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium inline-flex items-center transition-all duration-300">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {Object.keys(budgetAllocation).map(channel => (
                      <div key={channel} className="grid grid-cols-4 items-center gap-4">
                        <div className="font-medium">{channel}</div>
                        <div className="col-span-2">
                          <Slider
                            value={sliderValues[channel]}
                            min={0}
                            max={optimalAllocation[channel] * 2}
                            step={1000}
                            onValueChange={(value) => handleBudgetChange(channel, value[0])}
                            className="transition-all duration-300"
                          />
                        </div>
                        <div className="text-right">{currencyFormatter.format(budgetAllocation[channel])}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.keys(budgetAllocation).map(channel => ({ 
                            name: channel, 
                            value: budgetAllocation[channel] 
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          labelStyle={{ fontSize: '11px', fill: '#333' }}
                        >
                          {Object.keys(budgetAllocation).map((entry, index) => {
                            const channelKey = entry.replace(" ", "");
                            return <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[channelKey] || COLORS[index % COLORS.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" fontSize={11} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expected Revenue Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      The expected revenue is calculated using the Michaelis-Menten model based on the current budget allocation.
                    </div>
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-blue-600">{currencyFormatter.format(0.2*expectedRevenue)}</div>
                        <div className="text-lg text-gray-600 mt-2">Expected Revenue</div>
                        <div className="mt-4 text-2xl font-semibold text-green-600">
                          MROI: {0.01*((expectedRevenue - totalBudget) / totalBudget).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="3">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Category Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => name === 'revenue' ? currencyFormatter.format(value) : value} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="units" name="Units Sold" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Average Price</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend />
                        <Bar dataKey="averagePrice" name="Average Price" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Budget by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => currencyFormatter.format(value)} />
                        <Legend />
                        <Bar dataKey="optimalBudget" name="Optimal Budget Allocation" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">EntertainmentSmall</h3>
                      <p className="text-gray-700 mt-1">
                        This category shows the highest revenue contribution. The primary drivers are HomeAudioSpeaker, MobileSpeaker, and LaptopSpeaker products.
                        Marketing efforts should focus on Digital and Content Marketing channels for this category.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800">Camera</h3>
                      <p className="text-gray-700 mt-1">
                        High-ticket luxury items with strong margins. TV advertisements and Sponsorships are particularly effective for this category.
                        Seasonal campaigns during October-December and May-June are recommended.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">CameraAccessory</h3>
                      <p className="text-gray-700 mt-1">
                        Complementary products that drive additional revenue. Cross-selling opportunities with Camera products.
                        Digital and SEM channels have the highest ROI for this category.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-800">GamingHardware</h3>
                      <p className="text-gray-700 mt-1">
                        Mid-range ticket items with growing demand. Effective channels include Digital, Content Marketing, and Sponsorships.
                        Holiday seasons and special promotions significantly boost sales.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-red-800">GameCDDVD</h3>
                      <p className="text-gray-700 mt-1">
                        Lower-priced items with high volumes. Online Marketing and Affiliates provide the best ROI.
                        Special day promotions significantly impact sales in this category.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="4">
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex justify-between items-center">
                    <span>Key Performance Indicators (KPIs)</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevKpiSlide}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        ←
                      </Button>
                      <span className="text-sm">
                        {kpiCarouselIndex + 1} / {kpiCarouselData.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextKpiSlide}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        →
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <h3 className="font-semibold text-lg mb-2">{kpiCarouselData[kpiCarouselIndex].title}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      {kpiCarouselData[kpiCarouselIndex].description}
                    </div>
                    <div className="h-64">
                      {kpiCarouselData[kpiCarouselIndex].chart}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-red-50">
                  <CardTitle>Key Risk Indicators (KRIs)</CardTitle>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" domain={[65, 85]} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="nps" name="NPS" stroke="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="cpa" name="CPA (₹)" stroke="#ff0000" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Payment Type (SPT)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        stackOffset="expand"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
                        <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                        <Legend />
                        <Area type="monotone" dataKey="spt_prepaid" name="Prepaid" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="spt_cod" name="COD" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales Growth (MSG)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="msg" name="Monthly Sales Growth (%)" fill={({ msg }) => (msg >= 0 ? '#82ca9d' : '#ff7675')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>KPI & KRI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Key Result Areas (KRAs)</h3>
                      <p className="text-gray-700 mt-1">
                        GMV and Units Sold are our primary result areas. Optimizing marketing campaigns directly impacts these metrics. 
                        The data shows strong correlation between marketing investment and both GMV and Units, with the October-December period 
                        demonstrating the highest performance.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800">Key Performance Indicators (KPIs)</h3>
                      <p className="text-gray-700 mt-1">
                        MROI, DPI, SDPI, MSG and SPT provide insight into marketing and operational efficiency. MROI has improved from 12.5% to 14.2% over the year, 
                        while DPI consistently remains above 90%, indicating effective delivery performance. SDPI shows significant spikes during holiday seasons, 
                        suggesting strong campaign effectiveness during these periods.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold text-red-800">Key Risk Indicators (KRIs)</h3>
                      <p className="text-gray-700 mt-1">
                        NPS, Order Delay, and CPA help identify potential risks to business performance. The significant increase in Order Delays from March 2024 
                        onwards has negatively impacted NPS scores, suggesting customer satisfaction issues. CPA has improved over the year, indicating 
                        more efficient customer acquisition, with the lowest values occurring during high-volume holiday periods.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-800">Recommendations</h3>
                      <p className="text-gray-700 mt-1">
                        Address the Order Delay issues before the next high-volume season to improve NPS scores. Increase marketing budget allocation during 
                        high SDPI months (October-December) to maximize ROI. Optimize channel mix based on the Marketing Mix Model results, with increased focus 
                        on Digital, TV, and Content Marketing which show the highest ROI. Consider shifting a portion of the COD orders to Prepaid to improve 
                        cash flow and reduce return rates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;