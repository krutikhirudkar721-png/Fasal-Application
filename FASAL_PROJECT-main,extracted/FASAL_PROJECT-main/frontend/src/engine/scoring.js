export function scoreCrop(crop, field) {
  // 1. Soil Fit (pH and NPK) - 28%
  let soilFit = 1.0;
  if (field.ph < crop.minPh || field.ph > crop.maxPh) {
    soilFit *= 0.6;
  }
  
  const nRatio = field.n / crop.n;
  const pRatio = field.p / crop.p;
  const kRatio = field.k / crop.k;
  
  const npkAvg = (Math.min(nRatio, 1.5) + Math.min(pRatio, 1.5) + Math.min(kRatio, 1.5)) / 3;
  if (npkAvg < 0.7) soilFit *= 0.8;

  // 2. Climate / Water Fit - 24%
  let climateFit = 1.0;
  const isRainfed = field.irrigation === 'none';
  const isPartial = field.irrigation === 'partial';
  const totalWater = field.rainfall + (isRainfed ? 0 : isPartial ? 300 : 800);
  
  if (totalWater < crop.minRain) climateFit = Math.max(0.2, totalWater / crop.minRain);
  if (totalWater > crop.maxRain * 1.5) climateFit *= 0.8;
  
  // 3. Season Fit - 14%
  const seasonFit = crop.season === field.season ? 1.0 : 0.0;
  
  // 4. Market Demand - 18%
  let demandScore = 0.5;
  if (crop.demand === 'strong') demandScore = 1.0;
  if (crop.demand === 'stable') demandScore = 0.8;
  
  // 5. Affordability - 8%
  const affordable = field.budget >= crop.costPerAcre ? 1.0 : (field.budget / crop.costPerAcre);
  
  // 6. Risk Profile - 8% (inverted, so lower risk is better)
  const riskInv = 1.0 - crop.risk;
  
  // Composite Score Calculation
  const composite = 
    (soilFit * 0.28) + 
    (climateFit * 0.24) + 
    (seasonFit * 0.14) + 
    (demandScore * 0.18) + 
    (affordable * 0.08) + 
    (riskInv * 0.08);

  // Financials
  const expectedYield = crop.yieldPerAcre * (soilFit * 0.6 + climateFit * 0.4);
  const grossReturn = expectedYield * crop.pricePerKg;
  const netProfit = grossReturn - crop.costPerAcre;

  return {
    ...crop,
    score: Math.round(composite * 100),
    netProfit: Math.round(netProfit),
    expectedYield: Math.round(expectedYield),
    soilFit,
    climateFit
  };
}

export function runEngine(field, crops) {
  const scored = crops.map(c => scoreCrop(c, field));
  // Filter out completely wrong season
  const viable = scored.filter(c => c.score > 20);
  // Sort by score
  return viable.sort((a, b) => b.score - a.score);
}
