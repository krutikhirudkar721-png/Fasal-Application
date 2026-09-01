class SoilAnalyzer:
    def band(self, value: float, ideal_low: float, ideal_high: float, range_low: float, range_high: float):
        if ideal_low <= value <= ideal_high:
            return 100.0
        if value < range_low or value > range_high:
            return 0.0
        if value < ideal_low:
            return 100.0 * (value - range_low) / (ideal_low - range_low)
        else:
            return 100.0 * (range_high - value) / (range_high - ideal_high)

    def analyze(self, ph: float, n: float, p: float, k: float, oc: float, moisture: float, locale: str = 'en'):
        ph_idx = self.band(ph, 6.0, 7.5, 4.5, 9.0)
        n_idx = self.band(n, 60.0, 120.0, 0.0, 200.0)
        p_idx = self.band(p, 30.0, 60.0, 0.0, 100.0)
        k_idx = self.band(k, 30.0, 60.0, 0.0, 150.0)
        oc_idx = self.band(oc, 0.5, 0.75, 0.0, 1.5)
        m_idx = self.band(moisture, 25.0, 40.0, 0.0, 60.0)
        
        overall = (ph_idx*0.2 + n_idx*0.2 + p_idx*0.15 + k_idx*0.15 + oc_idx*0.2 + m_idx*0.1)
        
        recommendations = []
        
        msgs = {
            'en': {
                'ph_low': "Apply lime to increase soil pH.",
                'ph_high': "Apply gypsum or elemental sulfur to reduce soil pH.",
                'n_low': "Apply urea or nitrogen-rich fertilizers.",
                'p_low': "Use DAP or SSP for phosphorus.",
                'k_low': "Apply MOP for potassium deficiency.",
                'oc_low': "Add organic compost or farm yard manure.",
                'm_low': "Increase irrigation frequency."
            },
            'hi': {
                'ph_low': "मिट्टी का पीएच बढ़ाने के लिए चूना डालें।",
                'ph_high': "पीएच कम करने के लिए जिप्सम डालें।",
                'n_low': "यूरिया या नाइट्रोजन युक्त उर्वरक डालें।",
                'p_low': "फास्फोरस के लिए डीएपी का उपयोग करें।",
                'k_low': "पोटेशियम की कमी के लिए एमओपी डालें।",
                'oc_low': "जैविक खाद का प्रयोग करें।",
                'm_low': "सिंचाई की आवृत्ति बढ़ाएं।"
            }
        }
        
        lang = msgs.get(locale, msgs['en'])
        
        if ph < 6.0: recommendations.append(lang['ph_low'])
        elif ph > 7.5: recommendations.append(lang['ph_high'])
        if n < 60: recommendations.append(lang['n_low'])
        if p < 30: recommendations.append(lang['p_low'])
        if k < 30: recommendations.append(lang['k_low'])
        if oc < 0.5: recommendations.append(lang['oc_low'])
        if moisture < 25: recommendations.append(lang['m_low'])
        
        return {
            'indices': {
                'ph': round(ph_idx, 2),
                'n': round(n_idx, 2),
                'p': round(p_idx, 2),
                'k': round(k_idx, 2),
                'oc': round(oc_idx, 2),
                'moisture': round(m_idx, 2)
            },
            'overall_health': round(overall, 2),
            'recommendations': recommendations
        }
