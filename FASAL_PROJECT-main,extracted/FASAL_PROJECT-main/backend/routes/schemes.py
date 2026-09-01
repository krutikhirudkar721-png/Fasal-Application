"""
backend/routes/schemes.py

Government schemes for farmers — the "LIVE header" you sketched.
There's no single unified free API for every scheme across states, so this
is set up as a curated, editable list that refreshes on a short cache TTL —
"live" in the sense that you (or an admin) can update it without a redeploy
once it's backed by a database.

Realistic data sources if you want to go further:
  - data.gov.in has an API for some central schemes (needs free API key).
  - Most schemes still change via press release, not API — a simple admin
    endpoint to add/edit schemes (protected, admin-only) is often more
    realistic than trying to scrape every state government site.
"""

import time
from typing import List, Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/schemes", tags=["schemes"])

# Curated seed data — replace/extend freely, or move into fasal.db as a
# `schemes` table once you want non-developers to be able to update it.
_SCHEMES: List[dict] = [
    {
        "id": 1,
        "name": "PM-KISAN",
        "nameHi": "पीएम किसान सम्मान निधि",
        "nameMr": "पीएम किसान सन्मान निधी",
        "description": "Direct income support of ₹6,000/year to eligible farmer families paid in 3 equal instalments.",
        "descHi": "पात्र किसान परिवारों को 3 समान किस्तों में ₹6,000/वर्ष की प्रत्यक्ष आय सहायता।",
        "descMr": "पात्र शेतकरी कुटुंबांना वर्षाला ₹६,००० थेट बँक खात्यात ३ हप्त्यांमध्ये आर्थिक साहाय्य.",
        "region": "national",
        "category": "income-support",
        "benefit": "₹6,000 / year",
        "status": "Active (17th Installment)",
        "badge": "Direct Benefit Transfer",
        "link": "https://pmkisan.gov.in",
    },
    {
        "id": 2,
        "name": "PM Fasal Bima Yojana (PMFBY)",
        "nameHi": "प्रधानमंत्री फसल बीमा योजना",
        "nameMr": "प्रधानमंत्री पीक विमा योजना",
        "description": "Comprehensive crop insurance covering yield loss due to natural calamities, pests, and post-harvest damage at minimal premium (1.5%–2%).",
        "descHi": "प्राकृतिक आपदाओं, कीटों और कटाई बाद के नुकसान के लिए न्यूनतम प्रीमियम (1.5%-2%) पर व्यापक फसल बीमा।",
        "descMr": "अतिवृष्टी, दुष्काळ आणि कीड रोगापासून नुकसानीसाठी अत्यल्प प्रीमियमवर (१.५% ते २%) सर्वसमावेशक पीक विमा.",
        "region": "national",
        "category": "insurance",
        "benefit": "Up to 100% Sum Insured",
        "status": "Enrollment Open",
        "badge": "Crop Protection",
        "link": "https://pmfby.gov.in",
    },
    {
        "id": 3,
        "name": "Soil Health Card Scheme",
        "nameHi": "मृदा स्वास्थ्य कार्ड योजना",
        "nameMr": "मृदा आरोग्य पत्रिका योजना",
        "description": "Free soil testing every 2 years with crop-wise nutrient and fertilizer dosage recommendations for optimal yield.",
        "descHi": "इष्टतम उपज के लिए फसलवार पोषक तत्व और उर्वरक खुराक की सिफारिशों के साथ हर 2 साल में मुफ्त मिट्टी परीक्षण।",
        "descMr": "उत्पादकता वाढवण्यासाठी दर २ वर्षांनी मोफत माती परीक्षण व खतांचे योग्य प्रमाण मार्गदर्शन.",
        "region": "national",
        "category": "soil",
        "benefit": "100% Free Soil Test",
        "status": "Ongoing Cycle",
        "badge": "Soil Health",
        "link": "https://soilhealth.dac.gov.in",
    },
    {
        "id": 4,
        "name": "PM-KUSUM (Solar Pumps)",
        "nameHi": "पीएम कुसुम योजना (सोलर पंप)",
        "nameMr": "पीएम कुसुम योजना (सौर कृषी पंप)",
        "description": "Up to 60% subsidy for installing standalone solar agricultural pumps and solarizing grid-connected agriculture pumps.",
        "descHi": "स्टैंडअलोन सौर कृषि पंप लगाने और ग्रिड-कनेक्टेड पंपों के सौरीकरण के लिए 60% तक सब्सिडी।",
        "descMr": "सौर कृषी पंप बसवण्यासाठी व सौरऊर्जेवर शेती चालवण्यासाठी ६०% पर्यंत शासकीय अनुदान.",
        "region": "national",
        "category": "irrigation",
        "benefit": "Up to 60% Subsidy",
        "status": "Applications Open",
        "badge": "Clean Energy",
        "link": "https://pmkusum.mnre.gov.in",
    },
    {
        "id": 5,
        "name": "Kisan Credit Card (KCC)",
        "nameHi": "किसान क्रेडिट कार्ड (केसीसी)",
        "nameMr": "किसान क्रेडिट कार्ड (KCC)",
        "description": "Low-interest institutional credit up to ₹3 Lakh at an effective 4% interest rate for seeds, fertilizers, and farm equipment.",
        "descHi": "बीज, उर्वरक और कृषि उपकरणों के लिए प्रभावी 4% ब्याज दर पर ₹3 लाख तक का कम ब्याज ऋण।",
        "descMr": "बियाणे, खते आणि अवजारांसाठी प्रभावी ४% व्याजदरावर ₹३ लाखांपर्यंत सुलभ पीक कर्ज.",
        "region": "national",
        "category": "credit",
        "benefit": "₹3 Lakh loan @ 4% interest",
        "status": "Instant Sanction",
        "badge": "Subsidized Credit",
        "link": "https://myscheme.gov.in/schemes/kcc",
    },
    {
        "id": 6,
        "name": "Paramparagat Krishi Vikas Yojana",
        "nameHi": "परंपरागत कृषि विकास योजना (PKVY)",
        "nameMr": "परंपरागत कृषी विकास योजना",
        "description": "Financial assistance of ₹50,000/ha for 3 years to support organic farming, PGS certification, and bio-inputs.",
        "descHi": "जैविक खेती, पीजीएस प्रमाणीकरण और जैव-इनपुट का समर्थन करने के लिए 3 वर्षों के लिए ₹50,000/हेक्टेयर की वित्तीय सहायता।",
        "descMr": "सेंद्रिय शेती, पीजीएस प्रमाणिकरण व सेंद्रिय खतांच्या वापरासाठी ३ वर्षात ₹५०,०००/हेक्टर अर्थसाहाय्य.",
        "region": "national",
        "category": "soil",
        "benefit": "₹50,000 / hectare",
        "status": "Cluster Grants Active",
        "badge": "Organic Farming",
        "link": "https://pgsindia-ncof.gov.in/pkvy/index.aspx",
    },
    {
        "id": 7,
        "name": "MahaDBT Magel Tyala Shettale & Drip",
        "nameHi": "महाडीबीटी मांगे उसे खेत तालाब व ड्रिप",
        "nameMr": "मागेल त्याला शेततळे व ठिबक सिंचन योजना",
        "description": "Maharashtra state subsidy up to 75%-80% for farm ponds, drip irrigation, shade-net houses, and farm mechanization.",
        "descHi": "खेत तालाबों, ड्रिप सिंचाई और कृषि यंत्रीकरण के लिए महाराष्ट्र राज्य द्वारा 75%-80% तक सब्सिडी।",
        "descMr": "शेततळे, ठिबक सिंचन, तुषार सिंचन व कृषी यांत्रिकीकरणासाठी ७५% ते ८०% पर्यंत राज्य अनुदान.",
        "region": "maharashtra",
        "category": "irrigation",
        "benefit": "Up to 80% Subsidy",
        "status": "Direct Lottery Active",
        "badge": "State Special",
        "link": "https://mahadbt.maharashtra.gov.in",
    }
]

_last_refreshed = time.time()


@router.get("")
def list_schemes(region: Optional[str] = Query(None), category: Optional[str] = None):
    results = _SCHEMES
    if region:
        reg_clean = region.strip().lower()
        results = [s for s in results if s["region"] in (reg_clean, "national") or reg_clean in s["region"]]
    if category and category != "all":
        results = [s for s in results if s["category"] == category]
    return {"schemes": results, "lastRefreshed": _last_refreshed}
