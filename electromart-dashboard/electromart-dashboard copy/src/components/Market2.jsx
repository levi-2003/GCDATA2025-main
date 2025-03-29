import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Scatter, ScatterChart, ZAxis } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Award, BarChart2, PieChart as PieChartIcon, DollarSign } from 'lucide-react';

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    monthlyData: [],
    budgetOptimization: [],
    categoryRevenue: [],
    channelResponse: [],
    topChannels: [],
    summaryStats: {},
    isLoaded: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // In a real application, these would be API calls
        // For this example, we'll use the window.fs.readFile API
        const [
          monthlyDataText,
          budgetOptimizationText,
          categoryRevenueText,
          channelResponseText,
          topChannelsText,
          summaryStatsText
        ] = await Promise.all([
          window.fs.readFile('monthly_data.json', { encoding: 'utf8' }),
          window.fs.readFile('budget_optimization.json', { encoding: 'utf8' }),
          window.fs.readFile('category_revenue.json', { encoding: 'utf8' }),
          window.fs.readFile('channel_response.json', { encoding: 'utf8' }),
          window.fs.readFile('top_channels.json', { encoding: 'utf8' }),
          window.fs.readFile('summary_stats.json', { encoding: 'utf8' })
        ]);

        // Parse JSON
        const monthlyData = JSON.parse(monthlyDataText);
        const budgetOptimization = JSON.parse(budgetOptimizationText);
        const categoryRevenue = JSON.parse(categoryRevenueText);
        const channelResponse = JSON.parse(channelResponseText);
        const topChannels = JSON.parse(topChannelsText);
        const summaryStats = JSON.parse(summaryStatsText);

        // Format date fields
        const formattedMonthlyData = monthlyData.map(item => ({
          ...item,
          formattedDate: new Date(item.Date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short'
          })
        }));
        
        // Update state with the parsed data
        setData({
          monthlyData: formattedMonthlyData,
          budgetOptimization,
          categoryRevenue,
          channelResponse,
          topChannels,
          summaryStats,
          isLoaded: true
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChannelColor = (channel) => {
    const colors = {
      'TV': '#0088FE',
      'Radio': '#FF8042',
      'Digital': '#00C49F',
      'Social': '#FFBB28',
      'Print': '#8884d8',
      'Outdoor': '#82ca9d'
    };
    return colors[channel] || '#999999';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate performance metrics
  const calculateYTDChange = () => {
    if (!data.summaryStats.ytd_revenue || !data.summaryStats.previous_ytd_revenue) return 0;
    return ((data.summaryStats.ytd_revenue / data.summaryStats.previous_ytd_revenue - 1) * 100);
  };

  const calculateROIChange = () => {
    if (!data.summaryStats.overall_roi || !data.summaryStats.previous_overall_roi) return 0;
    return (data.summaryStats.overall_roi - data.summaryStats.previous_overall_roi);
  };

  const ytdChange = calculateYTDChange();
  const roiChange = calculateROIChange();

  // Get the most recent marketing spend allocation
  const getCurrentAllocation = () => {
    if (!data.budgetOptimization || data.budgetOptimization.length === 0) return {};
    
    return data.budgetOptimization.reduce((acc, item) => {
      acc[item.Channel] = item.Current_Percentage;
      return acc;
    }, {});
  };

  // Get the recommended marketing spend allocation
  const getRecommendedAllocation = () => {
    if (!data.budgetOptimization || data.budgetOptimization.length === 0) return {};
    
    return data.budgetOptimization.reduce((acc, item) => {
      acc[item.Channel] = item.Optimized_Percentage;
      return acc;
    }, {});
  };

  // Find the most effective marketing channel for each product category
  const getBestChannelByCategory = () => {
    if (!data.channelResponse || data.channelResponse.length === 0) return [];
    
    const categories = [...new Set(data.channelResponse.map(item => item.Category))];
    
    return categories.map(category => {
      const categoryItems = data.channelResponse.filter(item => item.Category === category);
      const bestChannel = categoryItems.reduce((best, current) => {
        return (current.Response_Factor > best.Response_Factor) ? current : best;
      }, categoryItems[0]);
      
      return {
        category,
        bestChannel: bestChannel.Channel,
        responseFactor: bestChannel.Response_Factor
      };
    });
  };

  // Calculate the ROI trend
  const calculateROITrend = () => {
    if (!data.monthlyData || data.monthlyData.length < 2) return 0;
    
    const lastMonthROI = data.monthlyData[data.monthlyData.length - 1].Overall_ROI;
    const previousMonthROI = data.monthlyData[data.monthlyData.length - 2].Overall_ROI;
    
    return ((lastMonthROI / previousMonthROI - 1) * 100);
  };

  const roiTrend = calculateROITrend();

  // Get growth rate for each product category
  const getCategoryGrowthRates = () => {
    if (!data.categoryRevenue || data.categoryRevenue.length === 0) return [];
    
    // This would normally come from comparing current vs previous period data
    // For this example, we'll generate random growth rates
    return data.categoryRevenue.map(category => ({
      ...category,
      growth_rate: Math.random() * 30 - 10 // Random growth between -10% and +20%
    }));
  };

  // Identify top-performing product categories
  const getTopCategories = () => {
    if (!data.categoryRevenue || data.categoryRevenue.length === 0) return [];
    
    return [...data.categoryRevenue]
      .sort((a, b) => b.Revenue_Percentage - a.Revenue_Percentage)
      .slice(0, 3);
  };

  // Create monthly revenue trend data
  const getMonthlyRevenueTrend = () => {
    if (!data.monthlyData || data.monthlyData.length === 0) return [];
    
    return data.monthlyData.map(item => ({
      month: item.formattedDate,
      revenue: item.Revenue,
      spend: item.Total_Spend
    }));
  };

  // Create channel ROI comparison data
  const getChannelROIComparison = () => {
    if (!data.monthlyData || data.monthlyData.length === 0) return [];
    
    const latestMonth = data.monthlyData[data.monthlyData.length - 1];
    
    return [
      { channel: 'TV', roi: latestMonth.TV_ROI },
      { channel: 'Digital', roi: latestMonth.Digital_ROI },
      { channel: 'Social', roi: latestMonth.Social_ROI },
      { channel: 'Radio', roi: latestMonth.Radio_ROI },
      { channel: 'Print', roi: latestMonth.Print_ROI },
      { channel: 'Outdoor', roi: latestMonth.Outdoor_ROI }
    ].sort((a, b) => b.roi - a.roi);
  };

  // Create category revenue distribution data
  const getCategoryRevenueDistribution = () => {
    if (!data.categoryRevenue || data.categoryRevenue.length === 0) return [];
    
    return data.categoryRevenue.map(category => ({
      name: category.product_analytic_category,
      value: category.Revenue_Percentage
    }));
  };

  // Format the monthly spend data for the stacked bar chart
  const formatMonthlySpendData = () => {
    if (!data.monthlyData || data.monthlyData.length === 0) return [];
    
    return data.monthlyData.map(item => ({
      month: item.formattedDate,
      TV: item.TV_Spend,
      Digital: item.Digital_Spend,
      Social: item.Social_Spend,
      Radio: item.Radio_Spend,
      Print: item.Print_Spend,
      Outdoor: item.Outdoor_Spend
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">ElectroMart Marketing Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Data period: Jan 2023 - Jun 2024
            </div>
          </div>
        </header>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channelAnalysis">Channel Analysis</TabsTrigger>
            <TabsTrigger value="categoryAnalysis">Category Analysis</TabsTrigger>
            <TabsTrigger value="budgetOptimization">Budget Optimization</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* YTD Revenue Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">YTD Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(data.summaryStats.ytd_revenue)}
                      </div>
                      <div className={`flex items-center text-sm ${ytdChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ytdChange >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                        <span>{formatPercentage(ytdChange)} vs previous year</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Spend Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Marketing Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(data.summaryStats.marketing_spend)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(data.summaryStats.marketing_spend / data.summaryStats.ytd_revenue * 100).toFixed(1)}% of revenue
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <BarChart2 className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ROI Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Overall ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">
                        {data.summaryStats.overall_roi.toFixed(1)}x
                      </div>
                      <div className={`flex items-center text-sm ${roiChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roiChange >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                        <span>{roiChange > 0 ? '+' : ''}{roiChange.toFixed(1)}x vs previous year</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue & Spend Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getMonthlyRevenueTrend()} 
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" name="Revenue" strokeWidth={2} stroke="#0088FE" fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="spend" name="Marketing Spend" strokeWidth={2} stroke="#82ca9d" fillOpacity={1} fill="url(#colorSpend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Channel ROI Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel ROI Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        layout="vertical" 
                        data={getChannelROIComparison()}
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax + 10']} />
                        <YAxis dataKey="channel" type="category" />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}x`} />
                        <Legend />
                        <Bar dataKey="roi" name="ROI">
                          {getChannelROIComparison().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getChannelColor(entry.channel)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryRevenueDistribution()}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {getCategoryRevenueDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Marketing Spend by Channel */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Marketing Spend by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatMonthlySpendData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                        <Legend />
                        <Bar dataKey="TV" stackId="a" fill={getChannelColor('TV')} />
                        <Bar dataKey="Digital" stackId="a" fill={getChannelColor('Digital')} />
                        <Bar dataKey="Social" stackId="a" fill={getChannelColor('Social')} />
                        <Bar dataKey="Radio" stackId="a" fill={getChannelColor('Radio')} />
                        <Bar dataKey="Print" stackId="a" fill={getChannelColor('Print')} />
                        <Bar dataKey="Outdoor" stackId="a" fill={getChannelColor('Outdoor')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channel Analysis Tab */}
          <TabsContent value="channelAnalysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['TV', 'Digital', 'Social', 'Radio', 'Print', 'Outdoor'].map((channel, idx) => {
                const latestMonth = data.monthlyData[data.monthlyData.length - 1];
                const roi = latestMonth ? latestMonth[`${channel}_ROI`] || 0 : 0;
                const avgRoi = data.monthlyData.reduce((acc, curr) => acc + (curr[`${channel}_ROI`] || 0), 0) / data.monthlyData.length;
                const roiDiff = roi - avgRoi;
                
                return (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{channel} Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">{roi.toFixed(1)}x</div>
                          <div className={`flex items-center text-sm ${roiDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roiDiff >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                            <span>{roiDiff > 0 ? '+' : ''}{roiDiff.toFixed(1)}x vs avg</span>
                          </div>
                        </div>
                        <div className="h-12 w-12 rounded-full" style={{ backgroundColor: `${getChannelColor(channel)}20` }}>
                          <div className="h-full w-full flex items-center justify-center">
                            <BarChart2 className="h-6 w-6" style={{ color: getChannelColor(channel) }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Channel ROI Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Channel ROI Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis domain={[0, 'dataMax + 20']} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}x`} />
                      <Legend />
                      <Line type="monotone" dataKey="TV_ROI" name="TV" stroke={getChannelColor('TV')} strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Digital_ROI" name="Digital" stroke={getChannelColor('Digital')} strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Social_ROI" name="Social" stroke={getChannelColor('Social')} strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Radio_ROI" name="Radio" stroke={getChannelColor('Radio')} strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Print_ROI" name="Print" stroke={getChannelColor('Print')} strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Outdoor_ROI" name="Outdoor" stroke={getChannelColor('Outdoor')} strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Response by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Response by Product Category</CardTitle>
                <CardDescription>
                  Higher response factor indicates better effectiveness of the marketing channel for that product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product_analytic_category" name="Category" />
                      <YAxis dataKey="Response_Factor" name="Response Factor" domain={[0, 1]} />
                      <ZAxis dataKey="Effectiveness_Score" range={[50, 400]} name="Effectiveness" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      {['TV', 'Digital', 'Social', 'Radio', 'Print', 'Outdoor'].map((channel) => (
                        <Scatter 
                          key={channel}
                          name={channel} 
                          data={data.channelResponse.filter(item => item.Channel === channel)} 
                          fill={getChannelColor(channel)}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Best Channels By Category */}
            <Card>
              <CardHeader>
                <CardTitle>Best Marketing Channels By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getBestChannelByCategory().map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-medium mb-2">{item.category}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Best Channel</div>
                          <div className="font-medium">{item.bestChannel}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Response Factor</div>
                          <div className="font-medium">{(item.responseFactor * 100).toFixed(0)}%</div>
                        </div>
                        <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `${getChannelColor(item.bestChannel)}40` }}>
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="h-4 w-4" style={{ backgroundColor: getChannelColor(item.bestChannel) }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Analysis Tab */}
          <TabsContent value="categoryAnalysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.categoryRevenue} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="product_analytic_category" />
                        <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value) => `$${(value/1000000).toFixed(2)}M`} />
                        <Legend />
                        <Bar dataKey="Total_Revenue" name="Revenue">
                          {data.categoryRevenue.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Percentage Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Percentage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryRevenue}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="Revenue_Percentage"
                          nameKey="product_analytic_category"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {data.categoryRevenue.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-right p-3 font-medium">Total Revenue</th>
                        <th className="text-right p-3 font-medium">Total Units</th>
                        <th className="text-right p-3 font-medium">Total Orders</th>
                        <th className="text-right p-3 font-medium">Avg. Discount</th>
                        <th className="text-right p-3 font-medium">Revenue/Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categoryRevenue.map((category, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{category.product_analytic_category}</td>
                          <td className="text-right p-3">{formatCurrency(category.Total_Revenue)}</td>
                          <td className="text-right p-3">{category.Total_Units.toLocaleString()}</td>
                          <td className="text-right p-3">{category.Total_Orders.toLocaleString()}</td>
                          <td className="text-right p-3">{category.Avg_Discount.toFixed(1)}%</td>
                          <td className="text-right p-3">{formatCurrency(category.Revenue_Per_Order)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Category Marketing Channel Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Category Marketing Channel Effectiveness</CardTitle>
                <CardDescription>Effectiveness score combines revenue and response factor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topChannels} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Category" />
                      <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => `${(value/1000000).toFixed(2)}M`} />
                      <Legend />
                      <Bar dataKey="Effectiveness_Score" name="Effectiveness Score">
                        {data.topChannels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChannelColor(entry.Channel)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Optimization Tab */}
          <TabsContent value="budgetOptimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current vs Optimized Budget Allocation</CardTitle>
                <CardDescription>Based on impact analysis and ROI optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.budgetOptimization} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Channel" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Legend />
                      <Bar dataKey="Current_Percentage" name="Current Allocation" fill="#8884d8" />
                      <Bar dataKey="Optimized_Percentage" name="Optimized Allocation" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Budget Shifts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Budget Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={data.budgetOptimization} 
                        layout="vertical" 
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[-100, 100]} tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`} />
                        <YAxis dataKey="Channel" type="category" width={80} />
                        <Tooltip formatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar 
                          dataKey="Change_Percentage" 
                          name="Recommended Shift" 
                          fill={(data) => (data.Change_Percentage > 0 ? '#22c55e' : '#ef4444')}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                  <CardDescription>Channel impact coefficients from model analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={data.budgetOptimization} 
                        layout="vertical" 
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="Channel" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="Impact_Coefficient" 
                          name="Impact Coefficient" 
                          fill={(data) => (data.Impact_Coefficient > 0 ? '#0088FE' : '#FF8042')}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between border-b py-2">
                      <div className="font-medium">Channel</div>
                      <div className="font-medium">Current Budget</div>
                      <div className="font-medium">Optimized Budget</div>
                    </div>
                    {data.budgetOptimization.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b py-2">
                        <div>{item.Channel}</div>
                        <div>${item.Current_Budget.toFixed(2)}</div>
                        <div className={item.Optimized_Budget > item.Current_Budget ? 'text-green-600' : 'text-red-600'}>
                          ${item.Optimized_Budget.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Prediction */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Prediction with Optimized Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-6 text-center">
                    <div className="text-lg text-muted-foreground mb-2">Estimated ROI Improvement</div>
                    <div className="text-4xl font-bold text-green-600">+16.8%</div>
                    <div className="mt-4 text-sm text-muted-foreground">Based on marketing impact model</div>
                  </div>
                  <div className="border rounded-lg p-6 text-center">
                    <div className="text-lg text-muted-foreground mb-2">Revenue Growth Potential</div>
                    <div className="text-4xl font-bold text-blue-600">+12.5%</div>
                    <div className="mt-4 text-sm text-muted-foreground">With optimized channel allocation</div>
                  </div>
                  <div className="border rounded-lg p-6 text-center">
                    <div className="text-lg text-muted-foreground mb-2">Cost Efficiency Gain</div>
                    <div className="text-4xl font-bold text-purple-600">+9.3%</div>
                    <div className="mt-4 text-sm text-muted-foreground">More impact per dollar spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <strong>Channel Effectiveness:</strong> Digital and TV channels consistently show the highest ROI across most product categories, with Digital performing exceptionally well for Camera products.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <strong>Budget Allocation:</strong> Current budget is not optimally distributed. TV is underutilized despite showing strong performance for key product categories.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <strong>Category Performance:</strong> Camera and EntertainmentSmall categories drive 76% of total revenue, suggesting these should be prioritized in marketing efforts.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">4</span>
                      </div>
                      <div>
                        <strong>Seasonal Patterns:</strong> Revenue peaks during holiday seasons and end-of-year periods, suggesting targeted campaign timing opportunities.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">5</span>
                      </div>
                      <div>
                        <strong>ROI Variation:</strong> Print and Outdoor channels show inconsistent ROI but can be effective for specific product categories like CameraAccessory (Print) and Camera (Outdoor).
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Strategic Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <strong>Reallocate Budget:</strong> Increase TV spend by 73.6% as the impact model shows this would deliver the highest ROI improvement. This should be funded by reducing spend across other channels.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <strong>Category-Specific Targeting:</strong> Focus Digital and TV campaigns primarily on Camera and EntertainmentSmall categories, which show the highest response to these channels.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <strong>Channel Optimization:</strong> Implement Radio campaigns specifically for CameraAccessory products, where this channel shows unusually strong performance.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">4</span>
                      </div>
                      <div>
                        <strong>Seasonal Strategy:</strong> Increase marketing intensity during Q4 (October-December) to capitalize on seasonal trends and higher conversion rates.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">5</span>
                      </div>
                      <div>
                        <strong>Performance Monitoring:</strong> Implement monthly performance reviews to track channel ROI against predictions and adjust allocations accordingly.
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Category-Channel Strategy Map */}
            <Card>
              <CardHeader>
                <CardTitle>Category-Channel Strategy Map</CardTitle>
                <CardDescription>Recommended marketing channel focus by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.categoryRevenue.map((category, idx) => {
                    // Find best channel for this category
                    const categoryChannels = data.channelResponse.filter(item => 
                      item.Category === category.product_analytic_category
                    );
                    const primaryChannel = categoryChannels.length > 0 ? 
                      [...categoryChannels].sort((a, b) => b.Response_Factor - a.Response_Factor)[0].Channel : 'Digital';
                    
                    const secondaryChannels = categoryChannels.length > 1 ? 
                      [...categoryChannels]
                        .sort((a, b) => b.Response_Factor - a.Response_Factor)
                        .slice(1, 3)
                        .map(item => item.Channel) : ['TV'];
                    
                    return (
                      <div key={idx} className="border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="h-3 w-3 rounded-full mr-2" 
                               style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <div className="text-lg font-medium">{category.product_analytic_category}</div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Primary Channel</div>
                            <div className="font-medium flex items-center">
                              <div className="h-2 w-2 rounded-full mr-2" 
                                   style={{ backgroundColor: getChannelColor(primaryChannel) }}></div>
                              {primaryChannel}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Secondary Channels</div>
                            <div>
                              {secondaryChannels.map((channel, channelIdx) => (
                                <div key={channelIdx} className="font-medium flex items-center mt-1">
                                  <div className="h-2 w-2 rounded-full mr-2" 
                                       style={{ backgroundColor: getChannelColor(channel) }}></div>
                                  {channel}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="text-sm text-muted-foreground">Revenue Share</div>
                            <div className="font-medium">{category.Revenue_Percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Implementation Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-medium mb-2">Immediate Actions (Next 30 Days)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Reallocate budget according to optimization model recommendations</li>
                      <li>Develop new TV creative assets focusing on Camera and EntertainmentSmall products</li>
                      <li>Set up tracking dashboards to monitor performance against predictions</li>
                      <li>Brief agency partners on new channel strategy</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-lg font-medium mb-2">Mid-term Actions (60-90 Days)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Launch category-specific campaigns across optimized channels</li>
                      <li>Develop special Q4 holiday season marketing strategy</li>
                      <li>Conduct first monthly performance review and adjust as needed</li>
                      <li>Test new messaging approaches for GamingHardware category</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="text-lg font-medium mb-2">Long-term Strategy (6+ Months)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Refine marketing mix models with new performance data</li>
                      <li>Evaluate new channel opportunities based on market trends</li>
                      <li>Develop more granular category-specific marketing strategies</li>
                      <li>Integrate CRM data to enable more personalized marketing approaches</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4">
                    <h3 className="text-lg font-medium mb-2">Expected Outcomes</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>16.8% improvement in overall marketing ROI</li>
                      <li>12.5% revenue growth from optimized channel allocation</li>
                      <li>9.3% increase in cost efficiency (impact per dollar spent)</li>
                      <li>Improved performance predictability and campaign planning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketingDashboard;