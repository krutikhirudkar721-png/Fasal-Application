import aiosqlite
import os
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "fasal.db")

async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS crops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_en TEXT,
                name_hi TEXT,
                name_mr TEXT,
                ph_min REAL,
                ph_max REAL,
                water_need TEXT,
                n_need INTEGER,
                p_need INTEGER,
                k_need INTEGER,
                seasons TEXT,
                yield_per_acre REAL,
                price_per_q REAL,
                cost_per_acre REAL,
                risk_factor REAL,
                demand_trend TEXT,
                tip_en TEXT,
                tip_hi TEXT,
                tip_mr TEXT
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS market_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop_id INTEGER,
                season TEXT,
                price REAL,
                FOREIGN KEY(crop_id) REFERENCES crops(id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS crop_calendar (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop_id INTEGER,
                sowing_months TEXT,
                growing_months TEXT,
                harvest_months TEXT,
                FOREIGN KEY(crop_id) REFERENCES crops(id)
            )
        """)
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS farmers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT UNIQUE,
                state TEXT,
                district TEXT,
                land_size REAL DEFAULT 4.0
            )
        """)
        for col_def in ["state TEXT", "district TEXT", "land_size REAL DEFAULT 4.0"]:
            try:
                await db.execute(f"ALTER TABLE farmers ADD COLUMN {col_def}")
            except Exception:
                pass

        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS recommendation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                farmer_id INTEGER,
                crop_id INTEGER,
                score REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        async with db.execute("SELECT COUNT(*) FROM crops") as cursor:
            row = await cursor.fetchone()
            if row[0] == 0:
                await seed_data(db)
        
        await db.commit()

async def seed_data(db):
    crops_data = [
        ("Soybean", "सोयाबीन", "सोयाबीन", 6.0, 7.5, "medium", 20, 60, 40, "kharif", 12, 4200, 14000, 0.30, "[62,64,68,71,75,79]", "Good for crop rotation.", "फसल चक्र के लिए अच्छा।", "पीक फेरपालटीसाठी चांगले."),
        ("Pigeon Pea (Tur)", "अरहर (तूर)", "तूर", 6.5, 8.0, "low", 15, 50, 30, "kharif", 8, 6800, 11000, 0.22, "[55,58,60,64,66,70]", "Intercrop with cotton.", "कपास के साथ अंतर-फसल।", "कापसासोबत आंतरपीक घ्या."),
        ("Cotton (Bt)", "कपास (बीटी)", "कापूस (बीटी)", 5.8, 8.0, "medium", 60, 30, 30, "kharif", 9, 7200, 26000, 0.42, "[70,68,65,63,66,69]", "Requires pest management.", "कीट प्रबंधन आवश्यक।", "कीड व्यवस्थापन आवश्यक."),
        ("Wheat", "गेहूं", "गहू", 6.0, 7.5, "medium", 120, 60, 40, "rabi", 18, 2350, 16000, 0.18, "[80,81,82,84,85,87]", "Ensure timely irrigation.", "समय पर सिंचाई सुनिश्चित करें।", "वेळेवर सिंचन करा."),
        ("Chickpea (Gram)", "चना", "हरभरा", 6.0, 7.5, "low", 20, 60, 20, "rabi", 9, 5400, 12000, 0.20, "[58,60,63,66,69,73]", "Avoid waterlogging.", "जलभराव से बचें।", "पाणी साचू देऊ नका."),
        ("Mustard", "सरसों", "मोहरी", 6.0, 7.8, "low", 80, 40, 20, "rabi", 7, 5600, 10000, 0.24, "[50,54,59,63,68,72]", "Can be intercropped with wheat.", "गेहूं के साथ सह-फसल।", "गव्हा सोबत आंतरपीक."),
        ("Maize", "मक्का", "मका", 5.5, 7.5, "medium", 100, 50, 40, "kharif,zaid", 22, 2100, 15000, 0.28, "[65,67,70,74,78,83]", "Requires high nitrogen.", "उच्च नाइट्रोजन की आवश्यकता।", "जास्त नायट्रोजन लागते."),
        ("Groundnut", "मूंगफली", "भुईमूग", 6.0, 7.0, "low", 20, 40, 40, "kharif,zaid", 10, 5800, 17000, 0.26, "[60,62,64,67,70,74]", "Prefers sandy loam soil.", "बलुई दोमट मिट्टी पसंद।", "वाळू-मिश्रित माती उत्तम."),
        ("Turmeric", "हल्दी", "हळद", 5.5, 7.5, "high", 60, 50, 120, "kharif", 6, 9500, 38000, 0.30, "[68,72,76,81,85,90]", "Good for long-term profit.", "दीर्घकालिक लाभ के लिए अच्छा।", "दीर्घकालीन नफ्यासाठी उत्तम."),
        ("Sugarcane", "गन्ना", "ऊस", 6.0, 7.5, "high", 150, 60, 60, "kharif", 38, 340, 32000, 0.20, "[72,71,70,69,68,67]", "Requires abundant water.", "प्रचुर पानी की आवश्यकता।", "भरपूर पाण्याची गरज.")
    ]
    await db.executemany("""
        INSERT INTO crops 
        (name_en, name_hi, name_mr, ph_min, ph_max, water_need, n_need, p_need, k_need, seasons, yield_per_acre, price_per_q, cost_per_acre, risk_factor, demand_trend, tip_en, tip_hi, tip_mr) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, crops_data)
    
    calendar_data = [
        (1, "6-7", "7-9", "10-10"),
        (4, "11-12", "12-1", "2-3"),
        (5, "10-11", "11-1", "2-2"),
        (7, "6-7", "7-9", "10-10"),
        (6, "10-10", "11-12", "1-2"),
        (2, "6-7", "7-11", "12-1"),
        (3, "6-6", "7-11", "11-12"),
        (8, "6-6", "7-9", "9-10")
    ]
    await db.executemany("INSERT INTO crop_calendar (crop_id, sowing_months, growing_months, harvest_months) VALUES (?, ?, ?, ?)", calendar_data)
    
    prices = {
        1: [4000, 4100, 4150, 4100, 4180, 4200],
        4: [2200, 2250, 2300, 2310, 2330, 2350],
        5: [5100, 5200, 5150, 5250, 5300, 5400],
        6: [5200, 5300, 5400, 5500, 5550, 5600],
        3: [6800, 6900, 7000, 7100, 7150, 7200],
    }
    market_data = [(c_id, f"season_{i}", p) for c_id, pr_list in prices.items() for i, p in enumerate(pr_list)]
    await db.executemany("INSERT INTO market_prices (crop_id, season, price) VALUES (?, ?, ?)", market_data)


async def backup_database(destination_dir: Optional[str] = None) -> str:
    """Creates a timestamped snapshot backup of the SQLite database."""
    import shutil
    from datetime import datetime

    backup_folder = destination_dir or os.path.join(os.path.dirname(__file__), "backups")
    os.makedirs(backup_folder, exist_ok=True)
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_folder, f"fasal_backup_{timestamp}.db")
    
    # Safe atomic copy
    if os.path.exists(DB_PATH):
        async with aiosqlite.connect(DB_PATH) as src:
            async with aiosqlite.connect(backup_file) as dst:
                await src.backup(dst)
        return backup_file
    return ""

