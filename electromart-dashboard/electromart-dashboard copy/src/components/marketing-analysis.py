import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from scipy import stats
import datetime
import calendar
import warnings
warnings.filterwarnings('ignore')

# Set plotting style
plt.style.use('ggplot')
sns.set(style='whitegrid')

# Load datasets
def load_data():
    weather_data = pd.read_csv('weather_combined_missing.csv')
    order_data = pd.read_csv('daily_data.csv')
    return weather_data, order_data

# Preprocess weather data
def preprocess_weather(weather_data):
    weather_clean = weather_data.copy()
    
    # Fill missing values
    for col in weather_clean.columns:
        if weather_clean[col].dtype in [np.float64, np.int64]:
            weather_clean[col].fillna(weather_clean[col].median(), inplace=True)
    
    # Calculate additional weather metrics
    weather_clean['Extreme_Temp'] = (weather_clean['Max Temp (°C)'] > 30) | (weather_clean['Min Temp (°C)'] < -20)
    weather_clean['Heavy_Precip'] = weather_clean['Total Precip (mm)'] > 20
    weather_clean['Snow_Presence'] = weather_clean['Snow on Grnd (cm)'] > 0
    
    # Add date information (assuming this is daily data for a year, starting from Jan 1, 2023)
    date_range = pd.date_range(start='2023-01-01', periods=len(weather_clean))
    weather_clean['Date'] = date_range
    weather_clean['Month'] = weather_clean['Date'].dt.month
    weather_clean['Year'] = weather_clean['Date'].dt.year
    weather_clean['Season'] = weather_clean['Month'].apply(get_season)
    
    return weather_clean

# Get season from month
def get_season(month):
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    else:
        return 'Fall'

# Preprocess order data
def preprocess_orders(order_data):
    orders_clean = order_data.copy()
    
    # Convert SaleDay to boolean
    orders_clean['SaleDay'] = orders_clean['SaleDay'].apply(lambda x: x == 'True')
    
    # Fill missing GMV values
    orders_clean['gmv'].fillna(orders_clean['gmv'].median(), inplace=True)
    
    # Replace "\N" values in delivery columns with 0
    for col in ['deliverybdays', 'deliverycdays']:
        orders_clean[col] = pd.to_numeric(orders_clean[col], errors='coerce').fillna(0)
    
    # Calculate discount percentage
    orders_clean['list_price'] = orders_clean['gmv'] / orders_clean['units']
    orders_clean['discount_percent'] = (
        (orders_clean['product_mrp'] - orders_clean['list_price']) / 
        orders_clean['product_mrp'] * 100
    ).clip(0, 100)  # Clip to avoid negative discounts
    
    # Calculate total delivery time
    orders_clean['total_delivery_days'] = orders_clean['deliverybdays'] + orders_clean['deliverycdays']
    
    # Classify products as luxury or mass-market (80th percentile GMV threshold)
    gmv_threshold = orders_clean['gmv'].quantile(0.8)
    orders_clean['product_type'] = orders_clean['gmv'].apply(
        lambda x: 'Luxury' if x >= gmv_threshold else 'Mass-market'
    )
    
    # Extract category and sub-category counts and revenue
    category_revenue = orders_clean.groupby('product_analytic_category')['gmv'].sum().reset_index()
    category_revenue.rename(columns={'gmv': 'category_revenue'}, inplace=True)
    
    subcategory_revenue = orders_clean.groupby('product_analytic_sub_category')['gmv'].sum().reset_index()
    subcategory_revenue.rename(columns={'gmv': 'subcategory_revenue'}, inplace=True)
    
    # Merge back
    orders_clean = orders_clean.merge(category_revenue, on='product_analytic_category', how='left')
    orders_clean = orders_clean.merge(subcategory_revenue, on='product_analytic_sub_category', how='left')
    
    # Categorize order size
    orders_clean['order_size'] = pd.qcut(
        orders_clean['gmv'], 
        q=3, 
        labels=['Small', 'Medium', 'Large']
    )
    
    return orders_clean

# Generate synthetic media spend data (since it wasn't provided)
def generate_synthetic_media_data():
    months = pd.date_range(start='2023-01-01', end='2024-06-30', freq='MS')
    media_channels = ['TV', 'Radio', 'Digital', 'Social Media', 'Print', 'Outdoor']
    
    media_data = []
    
    for month in months:
        month_data = {'Date': month, 'Month': month.month, 'Year': month.year}
        
        # Base spends that vary by month with some randomness
        tv_base = 50000 + (month.month % 3) * 10000
        radio_base = 20000 + (month.month % 4) * 5000
        digital_base = 40000 + (month.month % 2) * 15000
        social_base = 30000 + (month.month % 3) * 8000
        print_base = 15000 + (month.month % 5) * 3000
        outdoor_base = 10000 + (month.month % 6) * 2000
        
        # Add seasonal effects
        season = get_season(month.month)
        if season == 'Winter':
            tv_base *= 1.2
            digital_base *= 1.3
            social_base *= 1.1
        elif season == 'Summer':
            outdoor_base *= 1.4
            radio_base *= 1.2
            print_base *= 0.9
        
        # Add random noise
        month_data['TV_Spend'] = tv_base * np.random.uniform(0.9, 1.1)
        month_data['Radio_Spend'] = radio_base * np.random.uniform(0.85, 1.15)
        month_data['Digital_Spend'] = digital_base * np.random.uniform(0.95, 1.05)
        month_data['SocialMedia_Spend'] = social_base * np.random.uniform(0.9, 1.1)
        month_data['Print_Spend'] = print_base * np.random.uniform(0.8, 1.2)
        month_data['Outdoor_Spend'] = outdoor_base * np.random.uniform(0.75, 1.25)
        
        # Calculate total spend
        month_data['Total_Spend'] = (
            month_data['TV_Spend'] + month_data['Radio_Spend'] + 
            month_data['Digital_Spend'] + month_data['SocialMedia_Spend'] + 
            month_data['Print_Spend'] + month_data['Outdoor_Spend']
        )
        
        # Generate synthetic NPS score
        base_nps = 70  # Start with base NPS
        
        # Add seasonal variation
        if season == 'Winter':
            base_nps -= 5
        elif season == 'Summer':
            base_nps += 5
        
        # Make NPS partially correlated with marketing spend
        spend_effect = (month_data['Total_Spend'] / 200000) * 10
        
        # Add some randomness
        nps_noise = np.random.normal(0, 3)
        
        month_data['NPS_Score'] = min(max(base_nps + spend_effect + nps_noise, 0), 100)
        
        # Generate synthetic stock value that correlates with NPS and has upward trend
        base_stock = 50 + (month.month - 1 + (month.year - 2023) * 12) * 0.5
        nps_impact = (month_data['NPS_Score'] - 50) * 0.1
        month_data['Stock_Value'] = base_stock + nps_impact + np.random.normal(0, 1)
        
        media_data.append(month_data)
    
    return pd.DataFrame(media_data)

# Generate synthetic holiday data
def generate_holidays():
    holidays = [
        {'date': '2023-01-01', 'holiday': 'New Year\'s Day'},
        {'date': '2023-02-20', 'holiday': 'Family Day'},
        {'date': '2023-04-07', 'holiday': 'Good Friday'},
        {'date': '2023-05-22', 'holiday': 'Victoria Day'},
        {'date': '2023-07-01', 'holiday': 'Canada Day'},
        {'date': '2023-08-07', 'holiday': 'Civic Holiday'},
        {'date': '2023-09-04', 'holiday': 'Labour Day'},
        {'date': '2023-10-09', 'holiday': 'Thanksgiving'},
        {'date': '2023-11-11', 'holiday': 'Remembrance Day'},
        {'date': '2023-12-25', 'holiday': 'Christmas Day'},
        {'date': '2023-12-26', 'holiday': 'Boxing Day'},
        {'date': '2024-01-01', 'holiday': 'New Year\'s Day'},
        {'date': '2024-02-19', 'holiday': 'Family Day'},
        {'date': '2024-03-29', 'holiday': 'Good Friday'},
        {'date': '2024-05-20', 'holiday': 'Victoria Day'},
        {'date': '2024-07-01', 'holiday': 'Canada Day'}
    ]
    
    return pd.DataFrame(holidays)

# Generate synthetic sale calendar
def generate_sale_calendar():
    # Special sales days
    sales_events = [
        {'date': '2023-01-15', 'event': 'Winter Sale'},
        {'date': '2023-02-14', 'event': 'Valentine\'s Day Sale'},
        {'date': '2023-03-17', 'event': 'St. Patrick\'s Day Sale'},
        {'date': '2023-04-10', 'event': 'Easter Sale'},
        {'date': '2023-05-14', 'event': 'Mother\'s Day Sale'},
        {'date': '2023-06-18', 'event': 'Father\'s Day Sale'},
        {'date': '2023-07-01', 'event': 'Canada Day Sale'},
        {'date': '2023-08-15', 'event': 'Summer Clearance'},
        {'date': '2023-09-04', 'event': 'Labor Day Sale'},
        {'date': '2023-10-31', 'event': 'Halloween Sale'},
        {'date': '2023-11-24', 'event': 'Black Friday'},
        {'date': '2023-11-27', 'event': 'Cyber Monday'},
        {'date': '2023-12-26', 'event': 'Boxing Day Sale'},
        {'date': '2024-01-15', 'event': 'Winter Sale'},
        {'date': '2024-02-14', 'event': 'Valentine\'s Day Sale'},
        {'date': '2024-03-17', 'event': 'St. Patrick\'s Day Sale'},
        {'date': '2024-04-01', 'event': 'Easter Sale'},
        {'date': '2024-05-12', 'event': 'Mother\'s Day Sale'},
        {'date': '2024-06-16', 'event': 'Father\'s Day Sale'}
    ]
    
    return pd.DataFrame(sales_events)

# Generate synthetic daily aggregated order data
def generate_daily_order_data(orders_clean, media_data, holidays_df, sales_df):
    # Create a date range covering the entire period
    start_date = pd.to_datetime('2023-01-01')
    end_date = pd.to_datetime('2024-06-30')
    date_range = pd.date_range(start=start_date, end=end_date)
    
    # Generate synthetic daily order data
    daily_orders = []
    
    for date in date_range:
        # Base daily revenue with weekday effect
        weekday = date.weekday()
        base_revenue = 50000 + (4 - weekday if weekday < 5 else -15000)  # Less revenue on weekends
        
        # Month effect
        month = date.month
        if month in [11, 12]:  # Holiday season
            month_factor = 1.3
        elif month in [6, 7, 8]:  # Summer
            month_factor = 1.1
        else:
            month_factor = 1.0
        
        # Holiday effect
        is_holiday = date.strftime('%Y-%m-%d') in holidays_df['date'].values
        holiday_factor = 1.3 if is_holiday else 1.0
        
        # Sale day effect
        is_sale = date.strftime('%Y-%m-%d') in sales_df['date'].values
        sale_factor = 1.5 if is_sale else 1.0
        
        # Payday effect (assume 15th and last day of month)
        is_payday = date.day == 15 or date.day == calendar.monthrange(date.year, date.month)[1]
        payday_factor = 1.2 if is_payday else 1.0
        
        # Marketing effect (using previous month's spending)
        prev_month = (date - pd.DateOffset(months=1)).replace(day=1)
        prev_month_str = prev_month.strftime('%Y-%m-%d')
        
        media_effect = 1.0
        if any(media_data['Date'].dt.strftime('%Y-%m-%d') == prev_month_str):
            month_media = media_data[media_data['Date'].dt.strftime('%Y-%m-%d') == prev_month_str].iloc[0]
            # Simplified media effect model
            tv_effect = month_media['TV_Spend'] / 50000 * 0.05
            digital_effect = month_media['Digital_Spend'] / 40000 * 0.08
            social_effect = month_media['SocialMedia_Spend'] / 30000 * 0.07
            radio_effect = month_media['Radio_Spend'] / 20000 * 0.03
            print_effect = month_media['Print_Spend'] / 15000 * 0.02
            outdoor_effect = month_media['Outdoor_Spend'] / 10000 * 0.01
            
            media_effect = 1.0 + tv_effect + digital_effect + social_effect + radio_effect + print_effect + outdoor_effect
        
        # Random fluctuation
        random_factor = np.random.normal(1, 0.05)
        
        # Calculate final daily revenue
        daily_revenue = base_revenue * month_factor * holiday_factor * sale_factor * payday_factor * media_effect * random_factor
        
        # Calculate daily orders based on average order value
        avg_order_value = 250
        daily_order_count = int(daily_revenue / avg_order_value)
        
        # Get the nearest month's NPS and Stock value
        month_start = date.replace(day=1)
        month_str = month_start.strftime('%Y-%m-%d')
        nps = 70  # Default
        stock = 50  # Default
        
        if any(media_data['Date'].dt.strftime('%Y-%m-%d') == month_str):
            month_data = media_data[media_data['Date'].dt.strftime('%Y-%m-%d') == month_str].iloc[0]
            nps = month_data['NPS_Score']
            stock = month_data['Stock_Value']
        
        # Calculate media spend data for the specific day
        tv_spend = 0
        radio_spend = 0
        digital_spend = 0
        social_spend = 0
        print_spend = 0
        outdoor_spend = 0
        
        if any(media_data['Date'].dt.strftime('%Y-%m-%d') == month_str):
            month_data = media_data[media_data['Date'].dt.strftime('%Y-%m-%d') == month_str].iloc[0]
            # Divide monthly spend by days in month to get daily spend
            days_in_month = calendar.monthrange(date.year, date.month)[1]
            tv_spend = month_data['TV_Spend'] / days_in_month
            radio_spend = month_data['Radio_Spend'] / days_in_month
            digital_spend = month_data['Digital_Spend'] / days_in_month
            social_spend = month_data['SocialMedia_Spend'] / days_in_month
            print_spend = month_data['Print_Spend'] / days_in_month
            outdoor_spend = month_data['Outdoor_Spend'] / days_in_month
        
        # Append to daily_orders list
        daily_orders.append({
            'Date': date,
            'Revenue': daily_revenue,
            'Orders': daily_order_count,
            'Is_Holiday': is_holiday,
            'Is_Sale_Day': is_sale,
            'Is_Payday': is_payday,
            'NPS_Score': nps,
            'Stock_Value': stock,
            'TV_Spend': tv_spend,
            'Radio_Spend': radio_spend,
            'Digital_Spend': digital_spend,
            'Social_Spend': social_spend,
            'Print_Spend': print_spend,
            'Outdoor_Spend': outdoor_spend,
            'Weekday': date.weekday(),
            'Month': date.month,
            'Year': date.year,
            'Day': date.day
        })
    
    return pd.DataFrame(daily_orders)

# Aggregate orders by product category
def aggregate_orders_by_category(orders_clean):
    category_agg = orders_clean.groupby('product_analytic_category').agg({
        'gmv': 'sum',
        'units': 'sum',
        'order_item_id': 'count',
        'discount_percent': 'mean'
    }).reset_index()
    
    category_agg.rename(columns={
        'gmv': 'Total_Revenue',
        'units': 'Total_Units',
        'order_item_id': 'Total_Orders',
        'discount_percent': 'Avg_Discount'
    }, inplace=True)
    
    category_agg['Revenue_Per_Order'] = category_agg['Total_Revenue'] / category_agg['Total_Orders']
    category_agg['Revenue_Percentage'] = category_agg['Total_Revenue'] / category_agg['Total_Revenue'].sum() * 100
    
    return category_agg

# Perform time series analysis on daily order data
def time_series_analysis(daily_orders):
    # Convert date to datetime if it's not already
    daily_orders['Date'] = pd.to_datetime(daily_orders['Date'])
    
    # Set date as index
    daily_orders_ts = daily_orders.set_index('Date')
    
    # Resample to monthly data for easier visualization
    monthly_orders = daily_orders_ts.resample('M').agg({
        'Revenue': 'sum',
        'Orders': 'sum',
        'TV_Spend': 'sum',
        'Radio_Spend': 'sum',
        'Digital_Spend': 'sum',
        'Social_Spend': 'sum',
        'Print_Spend': 'sum',
        'Outdoor_Spend': 'sum',
        'NPS_Score': 'mean',
        'Stock_Value': 'mean',
        'Is_Holiday': 'sum',
        'Is_Sale_Day': 'sum',
        'Is_Payday': 'sum'
    })
    
    # Calculate total spend
    monthly_orders['Total_Spend'] = (
        monthly_orders['TV_Spend'] + monthly_orders['Radio_Spend'] + 
        monthly_orders['Digital_Spend'] + monthly_orders['Social_Spend'] + 
        monthly_orders['Print_Spend'] + monthly_orders['Outdoor_Spend']
    )
    
    # Calculate ROI for each channel
    monthly_orders['TV_ROI'] = monthly_orders['Revenue'] / monthly_orders['TV_Spend']
    monthly_orders['Radio_ROI'] = monthly_orders['Revenue'] / monthly_orders['Radio_Spend']
    monthly_orders['Digital_ROI'] = monthly_orders['Revenue'] / monthly_orders['Digital_Spend']
    monthly_orders['Social_ROI'] = monthly_orders['Revenue'] / monthly_orders['Social_Spend']
    monthly_orders['Print_ROI'] = monthly_orders['Revenue'] / monthly_orders['Print_Spend']
    monthly_orders['Outdoor_ROI'] = monthly_orders['Revenue'] / monthly_orders['Outdoor_Spend']
    monthly_orders['Overall_ROI'] = monthly_orders['Revenue'] / monthly_orders['Total_Spend']
    
    # Reset index for easier manipulation
    monthly_orders = monthly_orders.reset_index()
    
    return monthly_orders

# Analyze the impact of marketing spending on revenue
def marketing_impact_analysis(monthly_orders):
    # Create lag features for marketing spend
    for channel in ['TV_Spend', 'Radio_Spend', 'Digital_Spend', 'Social_Spend', 'Print_Spend', 'Outdoor_Spend']:
        monthly_orders[f'{channel}_Lag1'] = monthly_orders[channel].shift(1)
        monthly_orders[f'{channel}_Lag2'] = monthly_orders[channel].shift(2)
    
    # Drop NaN values (first 2 months)
    model_data = monthly_orders.dropna().copy()
    
    # Prepare features and target
    X_cols = [
        'TV_Spend_Lag1', 'Radio_Spend_Lag1', 'Digital_Spend_Lag1', 
        'Social_Spend_Lag1', 'Print_Spend_Lag1', 'Outdoor_Spend_Lag1',
        'TV_Spend_Lag2', 'Radio_Spend_Lag2', 'Digital_Spend_Lag2', 
        'Social_Spend_Lag2', 'Print_Spend_Lag2', 'Outdoor_Spend_Lag2',
        'Is_Holiday', 'Is_Sale_Day', 'Is_Payday', 'NPS_Score'
    ]
    
    X = model_data[X_cols]
    y = model_data['Revenue']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    
    # Train multiple models
    models = {
        'Linear Regression': LinearRegression(),
        'ElasticNet': ElasticNet(alpha=0.5, l1_ratio=0.5, random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
    }
    
    best_model = None
    best_score = -float('inf')
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        
        if r2 > best_score:
            best_score = r2
            best_model = model
    
    # For interpretability, use statsmodels with the same features
    X_sm = sm.add_constant(X)
    sm_model = sm.OLS(y, X_sm).fit()
    
    # Store model summary
    model_summary = {
        'best_model': best_model,
        'best_model_score': best_score,
        'statsmodels_summary': sm_model.summary(),
        'feature_importance': None
    }
    
    # Extract feature importance
    if hasattr(best_model, 'feature_importances_'):
        # For tree-based models
        feature_importance = pd.DataFrame({
            'Feature': X_cols,
            'Importance': best_model.feature_importances_
        }).sort_values('Importance', ascending=False)
        model_summary['feature_importance'] = feature_importance
    elif hasattr(best_model, 'coef_'):
        # For linear models
        feature_importance = pd.DataFrame({
            'Feature': X_cols,
            'Coefficient': best_model.coef_
        }).sort_values('Coefficient', ascending=False)
        model_summary['feature_importance'] = feature_importance
    
    return model_summary, sm_model

# Calculate the optimal budget allocation
def optimize_marketing_budget(sm_model, monthly_orders, future_budget=None):
    # Get the last month's total spend as baseline
    last_month_spend = monthly_orders.iloc[-1]
    total_current_spend = (
        last_month_spend['TV_Spend'] + last_month_spend['Radio_Spend'] + 
        last_month_spend['Digital_Spend'] + last_month_spend['Social_Spend'] + 
        last_month_spend['Print_Spend'] + last_month_spend['Outdoor_Spend']
    )
    
    # If no future budget provided, use the same as current
    if future_budget is None:
        future_budget = total_current_spend
    
    # Extract coefficients from statsmodels results
    coefs = sm_model.params
    
    # Create a dictionary of channel -> coefficient (ROI impact)
    channel_impact = {
        'TV': coefs['TV_Spend_Lag1'] + coefs['TV_Spend_Lag2'],
        'Radio': coefs['Radio_Spend_Lag1'] + coefs['Radio_Spend_Lag2'],
        'Digital': coefs['Digital_Spend_Lag1'] + coefs['Digital_Spend_Lag2'],
        'Social': coefs['Social_Spend_Lag1'] + coefs['Social_Spend_Lag2'],
        'Print': coefs['Print_Spend_Lag1'] + coefs['Print_Spend_Lag2'],
        'Outdoor': coefs['Outdoor_Spend_Lag1'] + coefs['Outdoor_Spend_Lag2']
    }
    
    # Calculate total impact
    total_impact = sum(max(0, impact) for impact in channel_impact.values())
    
    # Allocate budget based on relative impact (only for positive impacts)
    optimized_budget = {}
    
    for channel, impact in channel_impact.items():
        if impact > 0:
            optimized_budget[channel] = future_budget * (impact / total_impact)
        else:
            optimized_budget[channel] = 0
    
    # Handle the case where all channels have negative impact (unlikely)
    if total_impact <= 0:
        # Fallback to equal distribution
        for channel in channel_impact.keys():
            optimized_budget[channel] = future_budget / len(channel_impact)
    
    # Create a comparison with current allocation
    current_allocation = {
        'TV': last_month_spend['TV_Spend'],
        'Radio': last_month_spend['Radio_Spend'],
        'Digital': last_month_spend['Digital_Spend'],
        'Social': last_month_spend['Social_Spend'],
        'Print': last_month_spend['Print_Spend'],
        'Outdoor': last_month_spend['Outdoor_Spend']
    }
    
    comparison = pd.DataFrame({
        'Channel': list(optimized_budget.keys()),
        'Current_Budget': [current_allocation[channel] for channel in optimized_budget.keys()],
        'Optimized_Budget': list(optimized_budget.values()),
        'Impact_Coefficient': [channel_impact[channel] for channel in optimized_budget.keys()]
    })
    
    comparison['Current_Percentage'] = comparison['Current_Budget'] / comparison['Current_Budget'].sum() * 100
    comparison['Optimized_Percentage'] = comparison['Optimized_Budget'] / comparison['Optimized_Budget'].sum() * 100
    comparison['Change_Percentage'] = comparison['Optimized_Percentage'] - comparison['Current_Percentage']
    
    # Sort by optimized budget (descending)
    comparison = comparison.sort_values('Optimized_Budget', ascending=False)
    
    return comparison

# Analyze the relationship between product categories and marketing channels
def category_channel_analysis(orders_clean, media_data):
    # Simulate category response to different channels
    # In a real-world scenario, this would be based on actual data
    category_channel_response = {
        'EntertainmentSmall': {
            'TV': 0.6,
            'Radio': 0.3,
            'Digital': 0.8,
            'Social': 0.7,
            'Print': 0.2,
            'Outdoor': 0.1
        },
        'GamingHardware': {
            'TV': 0.5,
            'Radio': 0.2,
            'Digital': 0.9,
            'Social': 0.8,
            'Print': 0.1,
            'Outdoor': 0.1
        },
        'ComputersHardware': {
            'TV': 0.7,
            'Radio': 0.4,
            'Digital': 0.8,
            'Social': 0.6,
            'Print': 0.5,
            'Outdoor': 0.3
        },
        'MobilesPhones': {
            'TV': 0.8,
            'Radio': 0.5,
            'Digital': 0.9,
            'Social': 0.8,
            'Print': 0.5,
            'Outdoor': 0.4
        },
        'Audio': {
            'TV': 0.6,
            'Radio': 0.7,
            'Digital': 0.7,
            'Social': 0.6,
            'Print': 0.3,
            'Outdoor': 0.2
        }
    }
    
    # Create a response matrix (will use synthetic data since we don't have real mappings)
    categories = list(set(orders_clean['product_analytic_category']))
    channels = ['TV', 'Radio', 'Digital', 'Social', 'Print', 'Outdoor']
    
    response_data = []
    
    for category in categories:
        category_response = category_channel_response.get(category, {})
        
        for channel in channels:
            # Default response if category not in predefined dict
            response = category_response.get(channel, np.random.uniform(0.1, 0.9))
            
            response_data.append({
                'Category': category,
                'Channel': channel,
                'Response_Factor': response
            })
    
    response_df = pd.DataFrame(response_data)
    
    # Get revenue by category
    category_revenue = orders_clean.groupby('product_analytic_category')['gmv'].sum().reset_index()
    category_revenue.rename(columns={'gmv': 'Revenue'}, inplace=True)
    
    # Merge with response data
    response_df = response_df.merge(category_revenue, left_on='Category', right_on='product_analytic_category', how='left')
    
    # Calculate an effectiveness score (revenue * response factor)
    response_df['Effectiveness_Score'] = response_df['Revenue'] * response_df['Response_Factor']
    
    # Get top channel for each category
    top_channels = response_df.sort_values('Effectiveness_Score', ascending=False).groupby('Category').head(2)
    
    return response_df, top_channels

# Generate visualizations
def create_visualizations(orders_clean, weather_clean, monthly_orders, comparison, category_agg, response_df, top_channels):
    # Create a directory for visualizations
    import os
    if not os.path.exists('visualizations'):
        os.makedirs('visualizations')
    
    # 1. Revenue Trend Analysis
    plt.figure(figsize=(12, 6))
    plt.plot(monthly_orders['Date'], monthly_orders['Revenue'] / 1000, marker='o', linewidth=2)
    plt.title('Monthly Revenue Trend (2023-2024)', fontsize=14)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Revenue (Thousands)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/revenue_trend.png')
    plt.close()
    
    # 2. Marketing Spend by Channel
    plt.figure(figsize=(12, 6))
    channels = ['TV_Spend', 'Digital_Spend', 'Social_Spend', 'Radio_Spend', 'Print_Spend', 'Outdoor_Spend']
    for channel in channels:
        plt.plot(monthly_orders['Date'], monthly_orders[channel] / 1000, marker='o', label=channel.replace('_Spend', ''))
    plt.title('Monthly Marketing Spend by Channel', fontsize=14)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Spend (Thousands)', fontsize=12)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/marketing_spend.png')
    plt.close()
    
    # 3. ROI by Marketing Channel
    plt.figure(figsize=(12, 6))
    roi_cols = ['TV_ROI', 'Radio_ROI', 'Digital_ROI', 'Social_ROI', 'Print_ROI', 'Outdoor_ROI']
    for col in roi_cols:
        plt.plot(monthly_orders['Date'], monthly_orders[col], marker='o', label=col.replace('_ROI', ''))
    plt.title('ROI by Marketing Channel', fontsize=14)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('ROI', fontsize=12)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/channel_roi.png')
    plt.close()
    
    # 4. Budget Optimization Comparison
    plt.figure(figsize=(12, 6))
    x = np.arange(len(comparison))
    width = 0.35
    plt.bar(x - width/2, comparison['Current_Percentage'], width, label='Current Allocation (%)')
    plt.bar(x + width/2, comparison['Optimized_Percentage'], width, label='Optimized Allocation (%)')
    plt.axhline(y=0, color='black', linestyle='-', alpha=0.3)
    plt.xticks(x, comparison['Channel'])
    plt.title('Current vs Optimized Budget Allocation', fontsize=14)
    plt.xlabel('Channel', fontsize=12)
    plt.ylabel('Budget Percentage', fontsize=12)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/budget_optimization.png')
    plt.close()
    
    # 5. Category Revenue Analysis
    plt.figure(figsize=(12, 6))
    plt.bar(category_agg['product_analytic_category'], category_agg['Total_Revenue'] / 1000)
    plt.title('Revenue by Product Category', fontsize=14)
    plt.xlabel('Category', fontsize=12)
    plt.ylabel('Revenue (Thousands)', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/category_revenue.png')
    plt.close()
    
    # 6. NPS Score vs Revenue
    plt.figure(figsize=(12, 6))
    plt.scatter(monthly_orders['NPS_Score'], monthly_orders['Revenue'] / 1000, s=100, alpha=0.7)
    plt.title('NPS Score vs Revenue', fontsize=14)
    plt.xlabel('NPS Score', fontsize=12)
    plt.ylabel('Revenue (Thousands)', fontsize=12)
    z = np.polyfit(monthly_orders['NPS_Score'], monthly_orders['Revenue'] / 1000, 1)
    p = np.poly1d(z)
    plt.plot(monthly_orders['NPS_Score'], p(monthly_orders['NPS_Score']), "r--", alpha=0.7)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/nps_revenue.png')
    plt.close()
    
    # 7. Category-Channel Response Heatmap
    pivot_data = response_df.pivot(index='Category', columns='Channel', values='Response_Factor')
    plt.figure(figsize=(12, 8))
    sns.heatmap(pivot_data, annot=True, cmap='YlGnBu', vmin=0, vmax=1)
    plt.title('Marketing Channel Effectiveness by Product Category', fontsize=14)
    plt.tight_layout()
    plt.savefig('visualizations/category_channel_heatmap.png')
    plt.close()
    
    # 8. Weather Impact on Revenue (if correlation exists)
    # Merge weather data with daily_orders for analysis
    # This is a simplified approach since we're using synthetic data
    plt.figure(figsize=(12, 6))
    weather_groups = weather_clean.groupby('Season')['Mean Temp (°C)'].mean().reset_index()
    season_colors = {'Winter': 'blue', 'Spring': 'green', 'Summer': 'red', 'Fall': 'orange'}
    plt.bar(weather_groups['Season'], weather_groups['Mean Temp (°C)'], color=[season_colors[s] for s in weather_groups['Season']])
    plt.title('Average Temperature by Season', fontsize=14)
    plt.xlabel('Season', fontsize=12)
    plt.ylabel('Mean Temperature (°C)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/seasonal_temperature.png')
    plt.close()
    
    # 9. Top Marketing Channels by Product Category
    plt.figure(figsize=(12, 8))
    sns.barplot(data=top_channels, x='Category', y='Effectiveness_Score', hue='Channel')
    plt.title('Top Marketing Channels by Product Category', fontsize=14)
    plt.xlabel('Product Category', fontsize=12)
    plt.ylabel('Effectiveness Score', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Channel')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('visualizations/top_channels_by_category.png')
    plt.close()
    
    # 10. Correlation Heatmap for Marketing Variables
    plt.figure(figsize=(14, 10))
    corr_cols = ['Revenue', 'Orders', 'TV_Spend', 'Radio_Spend', 'Digital_Spend', 
                'Social_Spend', 'Print_Spend', 'Outdoor_Spend', 'NPS_Score']
    corr = monthly_orders[corr_cols].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, cmap='coolwarm', annot=True, fmt='.2f', linewidths=0.5)
    plt.title('Correlation Heatmap for Marketing Variables', fontsize=14)
    plt.tight_layout()
    plt.savefig('visualizations/correlation_heatmap.png')
    plt.close()

# Main function to run the entire analysis
def main():
    # Load data
    weather_data, order_data = load_data()
    
    # Preprocess data
    weather_clean = preprocess_weather(weather_data)
    orders_clean = preprocess_orders(order_data)
    
    # Generate synthetic data
    media_data = generate_synthetic_media_data()
    holidays_df = generate_holidays()
    sales_df = generate_sale_calendar()
    
    # Generate daily order aggregates
    daily_orders = generate_daily_order_data(orders_clean, media_data, holidays_df, sales_df)
    
    # Perform time series analysis
    monthly_orders = time_series_analysis(daily_orders)
    
    # Analyze the impact of marketing spending
    model_summary, sm_model = marketing_impact_analysis(monthly_orders)
    
    # Optimize marketing budget
    comparison = optimize_marketing_budget(sm_model, monthly_orders)
    
    # Aggregate orders by product category
    category_agg = aggregate_orders_by_category(orders_clean)
    
    # Analyze relationship between product categories and marketing channels
    response_df, top_channels = category_channel_analysis(orders_clean, media_data)
    
    # Create visualizations
    create_visualizations(orders_clean, weather_clean, monthly_orders, comparison, category_agg, response_df, top_channels)
    
    # Return key results
    results = {
        'weather_clean': weather_clean,
        'orders_clean': orders_clean,
        'media_data': media_data,
        'daily_orders': daily_orders,
        'monthly_orders': monthly_orders,
        'model_summary': model_summary,
        'budget_comparison': comparison,
        'category_analysis': category_agg,
        'channel_response': response_df,
        'top_channels': top_channels
    }
    
    return results

# Add this function to your marketing-analysis.py file
def export_results_to_json(results):
    """Export analysis results to JSON files for the React dashboard"""
    import json
    import os
    import pandas as pd
    
    # Create export directory if it doesn't exist
    export_dir = 'src/data'
    if not os.path.exists(export_dir):
        os.makedirs(export_dir)
    
    # Export monthly data
    monthly_data = results['monthly_orders'].copy()
    monthly_data['Date'] = monthly_data['Date'].dt.strftime('%Y-%m-%d')
    monthly_data_json = monthly_data.to_dict(orient='records')
    
    with open(f'{export_dir}/monthly_data.json', 'w') as f:
        json.dump(monthly_data_json, f)
    
    # Export budget optimization results
    budget_data = results['budget_comparison'].copy()
    budget_data_json = budget_data.to_dict(orient='records')
    
    with open(f'{export_dir}/budget_optimization.json', 'w') as f:
        json.dump(budget_data_json, f)
    
    # Export category analysis
    category_data = results['category_analysis'].copy()
    category_data_json = category_data.to_dict(orient='records')
    
    with open(f'{export_dir}/category_revenue.json', 'w') as f:
        json.dump(category_data_json, f)
    
    # Export channel response data
    channel_data = results['channel_response'].copy()
    channel_data_json = channel_data.to_dict(orient='records')
    
    with open(f'{export_dir}/channel_response.json', 'w') as f:
        json.dump(channel_data_json, f)
    
    # Export top channels for each category
    top_channels = results['top_channels'].copy()
    top_channels_json = top_channels.to_dict(orient='records')
    
    with open(f'{export_dir}/top_channels.json', 'w') as f:
        json.dump(top_channels_json, f)
    
    # Create a summary stats file
    last_month = monthly_data.iloc[-1]
    summary_stats = {
        'ytd_revenue': float(monthly_data[monthly_data['Date'].str.startswith('2024')]['Revenue'].sum()),
        'marketing_spend': float(monthly_data[monthly_data['Date'].str.startswith('2024')]['Total_Spend'].sum()),
        'overall_roi': float(last_month['Overall_ROI']),
        'previous_ytd_revenue': float(monthly_data[monthly_data['Date'].str.startswith('2023')]['Revenue'].sum()),
        'previous_marketing_spend': float(monthly_data[monthly_data['Date'].str.startswith('2023')]['Total_Spend'].sum()),
        'previous_overall_roi': float(monthly_data[monthly_data['Date'].str.startswith('2023')]['Overall_ROI'].mean())
    }
    
    with open(f'{export_dir}/summary_stats.json', 'w') as f:
        json.dump(summary_stats, f)
    
    print(f"All data exported to {export_dir} directory")

# Add this to the end of your main() function
if __name__ == "__main__":
    results = main()
    export_results_to_json(results)