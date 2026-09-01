class MarketAnalyzer:
    def __init__(self, db):
        self.db = db

    async def analyze(self, crops=None, region=None):
        results = []
        
        query = "SELECT crops.id, crops.name_en, market_prices.season, market_prices.price FROM crops JOIN market_prices ON crops.id = market_prices.crop_id"
        params = []
        if crops:
            crop_list = [c.strip() for c in crops.split(',')]
            placeholders = ','.join(['?']*len(crop_list))
            query += f" WHERE crops.name_en IN ({placeholders})"
            params.extend(crop_list)
            
        query += " ORDER BY crops.id, market_prices.season"
        
        async with self.db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            
        crop_data = {}
        for r in rows:
            c_id = r['id']
            if c_id not in crop_data:
                crop_data[c_id] = {'name': r['name_en'], 'prices': []}
            crop_data[c_id]['prices'].append(r['price'])
            
        for c_id, data in crop_data.items():
            prices = data['prices']
            if len(prices) > 1:
                growth = ((prices[-1] - prices[0]) / prices[0]) * 100
                trend_label = "Upward" if growth > 5 else "Stable" if growth > -5 else "Downward"
                avg_price = sum(prices) / len(prices)
                volatility = (max(prices) - min(prices)) / avg_price * 100
                forecast = prices[-1] * (1 + growth / 100.0)
            else:
                growth = 0
                trend_label = "Stable"
                volatility = 0
                forecast = prices[0] if prices else 0
                
            results.append({
                'crop_id': c_id,
                'name_en': data['name'],
                'growth_pct': round(growth, 2),
                'volatility_pct': round(volatility, 2),
                'trend_label': trend_label,
                'linear_forecast': round(forecast, 2),
                'historical_prices': prices
            })
            
        return results
