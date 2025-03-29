import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data files
        const [
          monthlyDataResponse,
          budgetOptimizationResponse,
          categoryRevenueResponse,
          channelResponseResponse,
          topChannelsResponse,
          summaryStatsResponse
        ] = await Promise.all([
          fetch('/data/monthly_data.json'),
          fetch('/data/budget_optimization.json'),
          fetch('/data/category_revenue.json'),
          fetch('/data/channel_response.json'),
          fetch('/data/top_channels.json'),
          fetch('/data/summary_stats.json')
        ]);

        // Check if all responses are OK
        if (!monthlyDataResponse.ok || !budgetOptimizationResponse.ok || 
            !categoryRevenueResponse.ok || !channelResponseResponse.ok || 
            !topChannelsResponse.ok || !summaryStatsResponse.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        // Parse JSON from each response
        const monthlyData = await monthlyDataResponse.json();
        const budgetOptimization = await budgetOptimizationResponse.json();
        const categoryRevenue = await categoryRevenueResponse.json();
        const channelResponse = await channelResponseResponse.json();
        const topChannels = await topChannelsResponse.json();
        const summaryStats = await summaryStatsResponse.json();

        // Update state with fetched data
        setData({
          monthlyData,
          budgetOptimization,
          categoryRevenue,
          channelResponse,
          topChannels,
          summaryStats,
          isLoaded: true
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`${err.message}. Using fallback data.`);
        // Generate fallback data if the fetch fails
        generateFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate fallback data if API calls fail
  const generateFallbackData = () => {
    // Generate monthly data
    const months = [
      'Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023',
      'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023',
      'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'
    ];
    
    const monthlyData = months.map((month, index) => {
      const baseRevenue = 800000 + (index * 20000);
      const revenue = Math.round(baseRevenue * (0.9 + Math.random() * 0.2));
      const tvSpend = Math.round(50000 * (0.9 + Math.random() * 0.2));
      const digitalSpend = Math.round(40000 * (0.9 + Math.random() * 0.2));
      const socialSpend = Math.round(30000 * (0.9 + Math.random() * 0.2));
      const radioSpend = Math.round(20000 * (0.9 + Math.random() * 0.2));
      const printSpend = Math.round(15000 * (0.9 + Math.random() * 0.2));
      const outdoorSpend = Math.round(10000 * (0.9 + Math.random() * 0.2));
      
      const totalSpend = tvSpend + digitalSpend + socialSpend + radioSpend + printSpend + outdoorSpend;
      
      return {
        Date: month,
        Revenue: revenue,
        TV_Spend: tvSpend,
        Digital_Spend: digitalSpend,
        Social_Spend: socialSpend,
        Radio_Spend: radioSpend,
        Print_Spend: printSpend,
        Outdoor_Spend: outdoorSpend,
        Total_Spend: totalSpend,
        TV_ROI: parseFloat((revenue / tvSpend).toFixed(2)),
        Digital_ROI: parseFloat((revenue / digitalSpend).toFixed(2)),
        Social_ROI: parseFloat((revenue / socialSpend).toFixed(2)),
        Radio_ROI: parseFloat((revenue / radioSpend).toFixed(2)),
        Print_ROI: parseFloat((revenue / printSpend).toFixed(2)),
        Outdoor_ROI: parseFloat((revenue / outdoorSpend).toFixed(2)),
        Overall_ROI: parseFloat((revenue / totalSpend).toFixed(2))
      };
    });

    // Budget optimization data
    const budgetOptimization = [
      { Channel: 'Digital', Current_Percentage: 25, Optimized_Percentage: 35, Change_Percentage: +10 },
      { Channel: 'TV', Current_Percentage: 30, Optimized_Percentage: 28, Change_Percentage: -2 },
      { Channel: 'Social', Current_Percentage: 18, Optimized_Percentage: 22, Change_Percentage: +4 },
      { Channel: 'Radio', Current_Percentage: 12, Optimized_Percentage: 8, Change_Percentage: -4 },
      { Channel: 'Print', Current_Percentage: 9, Optimized_Percentage: 5, Change_Percentage: -4 },
      { Channel: 'Outdoor', Current_Percentage: 6, Optimized_Percentage: 2, Change_Percentage: -4 }
    ];

    // Category revenue data
    const categoryRevenue = [
      { product_analytic_category: 'MobilesPhones', Total_Revenue: 2800000, Revenue_Percentage: 28 },
      { product_analytic_category: 'ComputersHardware', Total_Revenue: 2300000, Revenue_Percentage: 23 },
      { product_analytic_category: 'EntertainmentSmall', Total_Revenue: 1800000, Revenue_Percentage: 18 },
      { product_analytic_category: 'GamingHardware', Total_Revenue: 1500000, Revenue_Percentage: 15 },
      { product_analytic_category: 'Audio', Total_Revenue: 1000000, Revenue_Percentage: 10 },
      { product_analytic_category: 'Others', Total_Revenue: 600000, Revenue_Percentage: 6 }
    ];

    // Channel response data
    const categories = ['MobilesPhones', 'ComputersHardware', 'EntertainmentSmall', 'GamingHardware', 'Audio'];
    const channels = ['TV', 'Radio', 'Digital', 'Social', 'Print', 'Outdoor'];
    
    const channelResponse = [];
    
    categories.forEach(category => {
      channels.forEach(channel => {
        let responseFactor = 0.4;
        
        if (category === 'MobilesPhones' && (channel === 'Digital' || channel === 'TV')) {
          responseFactor = 0.8;
        } else if (category === 'GamingHardware' && (channel === 'Digital' || channel === 'Social')) {
          responseFactor = 0.85;
        } else if (category === 'Audio' && channel === 'Radio') {
          responseFactor = 0.75;
        }
        
        channelResponse.push({
          Category: category,
          Channel: channel,
          Response_Factor: responseFactor
        });
      });
    });

    // Top channels data
    const topChannels = [
      { Category: 'MobilesPhones', Channel: 'Digital', Effectiveness_Score: 2240000 },
      { Category: 'ComputersHardware', Channel: 'TV', Effectiveness_Score: 1610000 },
      { Category: 'EntertainmentSmall', Channel: 'Social', Effectiveness_Score: 1260000 },
      { Category: 'GamingHardware', Channel: 'Digital', Effectiveness_Score: 1275000 },
      { Category: 'Audio', Channel: 'Radio', Effectiveness_Score: 750000 }
    ];

    // Summary stats
    const summaryStats = {
      ytd_revenue: 16200000,
      marketing_spend: 3100000,
      overall_roi: 5.2,
      previous_ytd_revenue: 14900000,
      previous_marketing_spend: 2950000,
      previous_overall_roi: 4.9
    };

    setData({
      monthlyData,
      budgetOptimization,
      categoryRevenue,
      channelResponse,
      topChannels,
      summaryStats,
      isLoaded: false
    });
  };

  // Get top channels for each category
  const getTopChannelsByCategory = () => {
    if (!data.topChannels || data.topChannels.length === 0) {
      return [];
    }
    
    return data.topChannels.map(item => ({
      category: item.Category,
      topChannel: item.Channel,
      effectiveness: item.Effectiveness_Score / 10000000 // Normalize to 0-1 range
    }));
  };

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading dashboard data...</div>;
  }

  // Calculate YTD percentage change for display
  const ytdRevenueChange = ((data.summaryStats.ytd_revenue / data.summaryStats.previous_ytd_revenue - 1) * 100).toFixed(1);
  const spendChange = ((data.summaryStats.marketing_spend / data.summaryStats.previous_marketing_spend - 1) * 100).toFixed(1);
  const roiChange = (data.summaryStats.overall_roi - data.summaryStats.previous_overall_roi).toFixed(1);

  return (
    <div className="p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ElectroMart Marketing Dashboard</h1>
        <div className="text-sm text-gray-500">Data period: Jan 2023 - Jun 2024</div>
      </div>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Note</p>
          <p>{error}</p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channelAnalysis">Channel Analysis</TabsTrigger>
          <TabsTrigger value="categoryAnalysis">Category Analysis</TabsTrigger>
          <TabsTrigger value="budgetOptimization">Budget Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">YTD Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(data.summaryStats.ytd_revenue / 1000000).toFixed(1)}M</div>
                <div className={`text-sm ${parseFloat(ytdRevenueChange) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ytdRevenueChange > 0 ? '+' : ''}{ytdRevenueChange}% vs Previous Year
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Marketing Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(data.summaryStats.marketing_spend / 1000000).toFixed(1)}M</div>
                <div className={`text-sm ${parseFloat(spendChange) < 5 ? 'text-green-600' : 'text-amber-600'}`}>
                  {spendChange > 0 ? '+' : ''}{spendChange}% vs Previous Year
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overall ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.summaryStats.overall_roi.toFixed(1)}x</div>
                <div className={`text-sm ${parseFloat(roiChange) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roiChange > 0 ? '+' : ''}{roiChange}x vs Previous Year
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => `$${(value/1000000).toFixed(2)}M`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Revenue" 
                        name="Revenue" 
                        stroke="#0088FE" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Marketing Spend by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                      <Legend />
                      <Bar dataKey="TV_Spend" name="TV" stackId="a" fill="#0088FE" />
                      <Bar dataKey="Digital_Spend" name="Digital" stackId="a" fill="#00C49F" />
                      <Bar dataKey="Social_Spend" name="Social" stackId="a" fill="#FFBB28" />
                      <Bar dataKey="Radio_Spend" name="Radio" stackId="a" fill="#FF8042" />
                      <Bar dataKey="Print_Spend" name="Print" stackId="a" fill="#8884d8" />
                      <Bar dataKey="Outdoor_Spend" name="Outdoor" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="Total_Revenue"
                        nameKey="product_analytic_category"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.categoryRevenue && data.categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${(value/1000000).toFixed(2)}M`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Channel ROI Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      data={[
                        { channel: 'TV', roi: data.monthlyData[data.monthlyData.length - 1]?.TV_ROI || 0 },
                        { channel: 'Digital', roi: data.monthlyData[data.monthlyData.length - 1]?.Digital_ROI || 0 },
                        { channel: 'Social', roi: data.monthlyData[data.monthlyData.length - 1]?.Social_ROI || 0 },
                        { channel: 'Radio', roi: data.monthlyData[data.monthlyData.length - 1]?.Radio_ROI || 0 },
                        { channel: 'Print', roi: data.monthlyData[data.monthlyData.length - 1]?.Print_ROI || 0 },
                        { channel: 'Outdoor', roi: data.monthlyData[data.monthlyData.length - 1]?.Outdoor_ROI || 0 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax + 1']} />
                      <YAxis dataKey="channel" type="category" width={80} />
                      <Tooltip formatter={(value) => `${value.toFixed(2)}x`} />
                      <Legend />
                      <Bar dataKey="roi" name="ROI" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="channelAnalysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['TV', 'Digital', 'Social', 'Radio', 'Print', 'Outdoor'].map((channel, idx) => {
              const roi = data.monthlyData[data.monthlyData.length - 1]?.[`${channel}_ROI`] || 0;
              const avgRoi = data.monthlyData.reduce((acc, curr) => acc + (curr[`${channel}_ROI`] || 0), 0) / data.monthlyData.length;
              
              return (
                <Card key={idx}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{channel} Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{roi.toFixed(1)}x</div>
                    <div className={`text-sm ${roi > avgRoi ? 'text-green-600' : 'text-red-600'}`}>
                      {roi > avgRoi 
                        ? `+${(roi - avgRoi).toFixed(1)}x vs Avg` 
                        : `${(roi - avgRoi).toFixed(1)}x vs Avg`}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Channel Effectiveness by Product Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopChannelsByCategory()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Legend />
                    <Bar dataKey="effectiveness" name="Best Channel Effectiveness" fill="#0088FE">
                      {getTopChannelsByCategory().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTopChannelsByCategory().map((item, idx) => (
                  <div key={idx} className="border p-4 rounded-md">
                    <h3 className="font-bold">{item.category}</h3>
                    <p className="text-sm">Best Channel: <span className="font-medium">{item.topChannel}</span></p>
                    <p className="text-sm">Effectiveness: <span className="font-medium">{(item.effectiveness * 100).toFixed(0)}%</span></p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categoryAnalysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Bar dataKey="Total_Revenue" name="Revenue" fill="#0088FE">
                        {data.categoryRevenue && data.categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Categories by Market Share</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="Revenue_Percentage"
                        nameKey="product_analytic_category"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {data.categoryRevenue && data.categoryRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommended Marketing Channels by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getTopChannelsByCategory().map((item, idx) => (
                  <div key={idx} className="border p-4 rounded-md shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <h3 className="font-bold">{item.category}</h3>
                    </div>
                    <p className="text-sm mb-1">Primary Channel: <span className="font-medium">{item.topChannel}</span></p>
                    <p className="text-sm mb-2">Effectiveness: <span className="font-medium">{(item.effectiveness * 100).toFixed(0)}%</span></p>
                    <div className="text-xs text-gray-600">
                      {item.category === 'MobilesPhones' && "Focus on premium positioning and latest tech features"}
                      {item.category === 'ComputersHardware' && "Emphasize performance and reliability in messaging"}
                      {item.category === 'EntertainmentSmall' && "Target lifestyle and convenience benefits"}
                      {item.category === 'GamingHardware' && "Highlight performance and gaming-specific features"}
                      {item.category === 'Audio' && "Focus on sound quality and lifestyle integration"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budgetOptimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current vs Optimized Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.budgetOptimization} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Channel" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="Current_Percentage" name="Current Allocation" fill="#8884d8" />
                    <Bar dataKey="Optimized_Percentage" name="Optimized Allocation" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Shift Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.budgetOptimization} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[-10, 10]} tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`} />
                      <YAxis dataKey="Channel" type="category" width={80} />
                      <Tooltip formatter={(value) => `${value > 0 ? '+' : ''}${value}%`} />
                      <Legend />
                      <Bar dataKey="Change_Percentage" name="Recommended Shift" fill={(data) => (data.Change_Percentage > 0 ? '#00C49F' : '#FF8042')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expected ROI Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-center items-center flex-col p-6">
                    <div className="text-6xl font-bold text-green-600">+18%</div>
                    <div className="text-xl mt-2">Projected ROI Increase</div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">Key Recommendations:</h3>
                    <ul className="space-y-2">
                      {data.budgetOptimization
                        .filter(item => item.Change_Percentage !== 0)
                        .sort((a, b) => Math.abs(b.Change_Percentage) - Math.abs(a.Change_Percentage))
                        .map((item, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${item.Change_Percentage > 0 ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                            <span>
                              {item.Change_Percentage > 0 ? 'Increase' : 'Decrease'} {item.Channel} spend by {Math.abs(item.Change_Percentage)}%
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold">Performance Drivers:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 mt-1.5"></div>
                      <span>
                        {data.budgetOptimization
                          .filter(item => item.Change_Percentage > 0)
                          .slice(0, 2)
                          .map(item => item.Channel)
                          .join(' and ')} channels show the highest ROI and effectiveness
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 mt-1.5"></div>
                      <span>
                        {getTopChannelsByCategory().slice(0, 2).map(item => item.category).join(' and ')} categories 
                        respond best to {getTopChannelsByCategory().slice(0, 2).map(item => item.topChannel).join(' and ')} marketing
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 mt-1.5"></div>
                      <span>NPS scores show strong correlation with revenue performance</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold">Strategic Recommendations:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 mt-1.5"></div>
                      <span>
                        Reallocate budget from {data.budgetOptimization
                          .filter(item => item.Change_Percentage < 0)
                          .map(item => item.Channel)
                          .join(', ')} to {data.budgetOptimization
                          .filter(item => item.Change_Percentage > 0)
                          .map(item => item.Channel)
                          .join(', ')} channels
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 mt-1.5"></div>
                      <span>
                        Focus campaigns on {data.categoryRevenue
                          .sort((a, b) => b.Total_Revenue - a.Total_Revenue)
                          .slice(0, 2)
                          .map(item => item.product_analytic_category)
                          .join(' and ')} product categories
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 mt-1.5"></div>
                      <span>Increase marketing activities during Q4 to maximize seasonal impact</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 mt-1.5"></div>
                      <span>
                        Implement targeted {getTopChannelsByCategory()
                          .find(item => item.category === 'GamingHardware')?.topChannel || 'Social'} campaigns 
                        for GamingHardware
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingDashboard;