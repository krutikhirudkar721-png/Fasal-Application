export const SOIL_TYPES = [
  'Black (Regur)',
  'Red & Yellow',
  'Alluvial',
  'Laterite',
  'Arid/Desert',
];

export const CROPS = [
  { id: 'soybean', name: 'Soybean', nameHi: 'सोयाबीन', nameMr: 'सोयाबीन', season: 'kharif', minRain: 500, maxRain: 800, minPh: 6.0, maxPh: 7.5, n: 20, p: 60, k: 40, yieldPerAcre: 800, pricePerKg: 45, costPerAcre: 12000, risk: 0.4, demand: 'strong', tip: { en: 'Excellent for crop rotation.', hi: 'फसल चक्र के लिए उत्तम।', mr: 'पीक फेरपालटीसाठी उत्तम.' } },
  { id: 'tur', name: 'Pigeon Pea (Tur)', nameHi: 'अरहर (तूर)', nameMr: 'तूर', season: 'kharif', minRain: 600, maxRain: 1000, minPh: 6.5, maxPh: 7.5, n: 20, p: 50, k: 20, yieldPerAcre: 600, pricePerKg: 70, costPerAcre: 10000, risk: 0.3, demand: 'stable', tip: { en: 'Deep roots improve soil structure.', hi: 'गहरी जड़ें मिट्टी सुधारती हैं।', mr: 'खोल मुळे माती सुधारतात.' } },
  { id: 'cotton', name: 'Cotton', nameHi: 'कपास', nameMr: 'कापूस', season: 'kharif', minRain: 500, maxRain: 1000, minPh: 5.8, maxPh: 8.0, n: 80, p: 40, k: 40, yieldPerAcre: 1000, pricePerKg: 60, costPerAcre: 18000, risk: 0.6, demand: 'stable', tip: { en: 'Requires timely pest management.', hi: 'कीट प्रबंधन आवश्यक है।', mr: 'वेळेवर कीड नियंत्रण आवश्यक.' } },
  { id: 'wheat', name: 'Wheat', nameHi: 'गेहूँ', nameMr: 'गहू', season: 'rabi', minRain: 300, maxRain: 500, minPh: 6.0, maxPh: 7.5, n: 100, p: 50, k: 40, yieldPerAcre: 1500, pricePerKg: 22, costPerAcre: 14000, risk: 0.2, demand: 'strong', tip: { en: 'Ensure 3-4 irrigations.', hi: '3-4 सिंचाई सुनिश्चित करें।', mr: '3-4 सिंचन आवश्यक.' } },
  { id: 'gram', name: 'Chickpea (Gram)', nameHi: 'चना', nameMr: 'हरभरा', season: 'rabi', minRain: 200, maxRain: 400, minPh: 6.0, maxPh: 7.5, n: 20, p: 40, k: 20, yieldPerAcre: 600, pricePerKg: 50, costPerAcre: 8000, risk: 0.3, demand: 'strong', tip: { en: 'Avoid waterlogging.', hi: 'जलभराव से बचें।', mr: 'पाणी साचू देऊ नका.' } },
  { id: 'mustard', name: 'Mustard', nameHi: 'सरसों', nameMr: 'मोहरी', season: 'rabi', minRain: 250, maxRain: 400, minPh: 6.0, maxPh: 7.5, n: 60, p: 40, k: 40, yieldPerAcre: 700, pricePerKg: 55, costPerAcre: 9000, risk: 0.2, demand: 'strong', tip: { en: 'Resistant to mild frost.', hi: 'हल्के पाले के प्रति प्रतिरोधी।', mr: 'हलक्या धुक्यास प्रतिरोधक.' } },
  { id: 'maize', name: 'Maize', nameHi: 'मक्का', nameMr: 'मका', season: 'kharif', minRain: 500, maxRain: 800, minPh: 5.5, maxPh: 7.5, n: 120, p: 60, k: 40, yieldPerAcre: 2000, pricePerKg: 20, costPerAcre: 15000, risk: 0.4, demand: 'stable', tip: { en: 'Weed control is critical in first 30 days.', hi: 'पहले 30 दिन खरपतवार नियंत्रण जरूरी।', mr: 'पहिल्या 30 दिवसात तण नियंत्रण महत्त्वाचे.' } },
  { id: 'groundnut', name: 'Groundnut', nameHi: 'मूंगफली', nameMr: 'भुईमूग', season: 'kharif', minRain: 500, maxRain: 700, minPh: 6.0, maxPh: 7.5, n: 20, p: 50, k: 40, yieldPerAcre: 800, pricePerKg: 65, costPerAcre: 14000, risk: 0.5, demand: 'strong', tip: { en: 'Requires loose soil for peg penetration.', hi: 'ढीली मिट्टी आवश्यक है।', mr: 'भुसभुशीत माती आवश्यक.' } },
  { id: 'turmeric', name: 'Turmeric', nameHi: 'हल्दी', nameMr: 'हळद', season: 'kharif', minRain: 1500, maxRain: 2000, minPh: 5.0, maxPh: 7.5, n: 120, p: 50, k: 100, yieldPerAcre: 3000, pricePerKg: 80, costPerAcre: 40000, risk: 0.6, demand: 'strong', tip: { en: 'High investment, high return.', hi: 'उच्च निवेश, उच्च लाभ।', mr: 'जास्त गुंतवणूक, जास्त नफा.' } },
  { id: 'sugarcane', name: 'Sugarcane', nameHi: 'गन्ना', nameMr: 'ऊस', season: 'kharif', minRain: 1500, maxRain: 2500, minPh: 6.5, maxPh: 7.5, n: 250, p: 75, k: 115, yieldPerAcre: 30000, pricePerKg: 3.5, costPerAcre: 45000, risk: 0.4, demand: 'stable', tip: { en: 'Requires assured irrigation.', hi: 'सुनिश्चित सिंचाई आवश्यक।', mr: 'खात्रीशीर सिंचन आवश्यक.' } },
];

export const CROP_CALENDAR = [
  { crop: 'Soybean', sow: [5, 6], tend: [7, 8], harvest: [9] },
  { crop: 'Wheat', sow: [10, 11], tend: [0, 1, 2], harvest: [3] },
  { crop: 'Cotton', sow: [5, 6], tend: [7, 8, 9], harvest: [10, 11] },
  { crop: 'Gram', sow: [9, 10], tend: [11, 0, 1], harvest: [2] },
];
