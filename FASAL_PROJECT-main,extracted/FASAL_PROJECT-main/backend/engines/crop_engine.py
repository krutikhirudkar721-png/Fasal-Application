import json

class CropRecommendationEngine:
    WEIGHTS = {'soil_fit': 0.28, 'climate_fit': 0.24, 'season_fit': 0.14, 'demand': 0.18, 'affordability': 0.08, 'inverse_risk': 0.08}
    
    def __init__(self, crops):
        self.crops = crops

    def evaluate(self, ph: float, n: float, p: float, k: float, rainfall: float, irrigation: str, season: str, budget: float, land_size: float, limit: int = 3):
        results = []
        budget_per_acre = budget / land_size if land_size > 0 else 0
        
        for crop in self.crops:
            # Soil Fit
            ph_penalty = 0
            if ph < crop['ph_min']:
                ph_penalty = (crop['ph_min'] - ph) * 0.35
            elif ph > crop['ph_max']:
                ph_penalty = (ph - crop['ph_max']) * 0.35
            ph_score = max(0, 1 - ph_penalty)
            
            n_score = max(0, 1 - abs(n - crop['n_need'])/max(crop['n_need'], 1))
            p_score = max(0, 1 - abs(p - crop['p_need'])/max(crop['p_need'], 1))
            k_score = max(0, 1 - abs(k - crop['k_need'])/max(crop['k_need'], 1))
            
            soil_fit = ph_score * 0.4 + n_score * 0.2 + p_score * 0.2 + k_score * 0.2
            
            # Climate Fit
            water_need_mm = {'low': 300, 'medium': 600, 'high': 1000}.get(crop['water_need'], 600)
            available_water = rainfall
            if irrigation == 'high':
                available_water += 400
            elif irrigation == 'medium':
                available_water += 200
            
            water_deficit = max(0, water_need_mm - available_water)
            climate_fit = max(0, 1 - (water_deficit / water_need_mm) * 0.8)
            
            # Season Fit
            crop_seasons = crop['seasons'].split(',')
            season_fit = 1.0 if season.lower() in [s.lower() for s in crop_seasons] else 0.35
            
            # Demand Score
            try:
                trend = json.loads(crop['demand_trend'])
                if len(trend) > 1 and trend[0] > 0:
                    growth = (trend[-1] - trend[0]) / trend[0]
                    demand_score = max(0, min(1, 0.5 + growth))
                else:
                    demand_score = 0.5
            except:
                demand_score = 0.5
                
            # Affordability
            cost_per_acre = crop['cost_per_acre']
            affordability = 1.0 if budget_per_acre >= cost_per_acre else max(0, budget_per_acre / cost_per_acre)
            
            # Risk
            risk_score = crop['risk_factor'] + (1 - climate_fit) * 0.3 + (1 - soil_fit) * 0.15
            risk_score = max(0.05, min(0.95, risk_score))
            inverse_risk = 1.0 - risk_score
            
            # Economics
            yield_adj = crop['yield_per_acre'] * (0.6 + 0.4 * soil_fit) * (0.6 + 0.4 * climate_fit)
            gross_return = yield_adj * crop['price_per_q']
            net_profit = gross_return - cost_per_acre
            
            composite_score = (
                soil_fit * self.WEIGHTS['soil_fit'] +
                climate_fit * self.WEIGHTS['climate_fit'] +
                season_fit * self.WEIGHTS['season_fit'] +
                demand_score * self.WEIGHTS['demand'] +
                affordability * self.WEIGHTS['affordability'] +
                inverse_risk * self.WEIGHTS['inverse_risk']
            )
            
            results.append({
                'crop_id': crop['id'],
                'name_en': crop['name_en'],
                'name_hi': crop['name_hi'],
                'name_mr': crop['name_mr'],
                'composite_score': round(composite_score * 100, 2),
                'breakdown': {
                    'soil_fit': round(soil_fit * 100, 2),
                    'climate_fit': round(climate_fit * 100, 2),
                    'season_fit': round(season_fit * 100, 2),
                    'demand_score': round(demand_score * 100, 2),
                    'affordability': round(affordability * 100, 2),
                    'inverse_risk': round(inverse_risk * 100, 2)
                },
                'economics': {
                    'est_yield_per_acre': round(yield_adj, 2),
                    'est_gross_return': round(gross_return, 2),
                    'est_net_profit': round(net_profit, 2)
                },
                'tips': {
                    'en': crop['tip_en'],
                    'hi': crop['tip_hi'],
                    'mr': crop['tip_mr']
                }
            })
            
        results.sort(key=lambda x: x['composite_score'], reverse=True)
        return results[:limit]
