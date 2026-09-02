# 🌾 FASAL — Unified Farmer Decision-Intelligence Platform

> **From Data → Decision → Action**

FASAL is a smart agriculture platform designed to help farmers make better and faster farming decisions by bringing important agricultural information together in one place.

Farmers often have to check different sources for **soil conditions, weather, crop health, mandi prices, government schemes, labour and machinery**. FASAL combines these inputs and converts them into simple, actionable recommendations.

---

## 🎯 Problem

Agricultural information is often scattered across different applications, websites and local sources.

A farmer may know:

* Soil moisture
* Weather forecast
* Current mandi price
* Crop disease symptoms
* Available government schemes

But the real question is:

> **“What should I do now?”**

FASAL focuses on answering this question.

---

## 💡 Our Solution

FASAL acts as a **decision-intelligence layer** between agricultural data and the farmer.

```text
IoT Sensors ─────┐
Weather ─────────┤
Market Data ─────┤
Crop Information ┤
Farmer Profile ──┤
                  ↓
              FASAL
          Decision Layer
                  ↓
        Actionable Advisory
                  ↓
              FARMER
```

Instead of only showing raw information, FASAL aims to provide decisions such as:

* 💧 When to irrigate
* 🌦️ Whether irrigation should be delayed because of rain
* 🌱 What action to take for a crop problem
* 📈 Whether to sell or hold produce
* 🚜 Where to find machinery or labour
* 🏛️ Which government schemes may be useful

---

## 🚀 Key Features

### 🌱 IoT-Based Field Monitoring

ESP8266-based field sensors provide parameters such as:

* Soil moisture
* Temperature
* Humidity

The data is sent to the backend and displayed on the farmer dashboard.

### 🌦️ Weather Intelligence

FASAL integrates weather information to provide localized agricultural context and improve decisions such as irrigation planning.

### 🤖 AI Crop Doctor

Farmers can describe crop problems in natural language.

The AI advisory system uses **Google Gemini** to provide:

**Problem → Diagnosis → Immediate Action → Next Step**

### 📈 Mandi Intelligence

The platform provides market/mandi information and focuses on helping farmers understand market conditions for better selling decisions.

### 🚜 Machinery & Labour

Farmers can discover/contact available machinery and labour resources, helping them convert recommendations into real-world action.

### 🏛️ Government Schemes

FASAL provides access to relevant agricultural schemes and subsidy information.

### 🗣️ Multilingual & Voice Support

The platform supports:

* 🇮🇳 Marathi
* 🇮🇳 Hindi
* 🇬🇧 English

Voice assistance and **Easy Farmer Mode** are included to make the platform easier to use for farmers with limited digital literacy.

---

## 🛠️ Technology Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | HTML, JavaScript, Tailwind CSS |
| Backend  | PHP                            |
| Database | MySQL                          |
| IoT      | ESP8266 + Sensors              |
| AI       | Google Gemini                  |
| Weather  | Open-Meteo                     |
| Charts   | Chart.js                       |
| Icons    | Lucide                         |

---

## 🔄 How FASAL Works

```text
1. Farmer creates profile
          ↓
2. Farm/crop information is configured
          ↓
3. ESP8266 collects field data
          ↓
4. Weather & market data are collected
          ↓
5. FASAL combines the available information
          ↓
6. Decision/advisory is generated
          ↓
7. Farmer receives a simple recommendation
          ↓
8. Farmer takes action
```

---

## 🧠 What Makes FASAL Different?

FASAL is not designed as just another agriculture dashboard.

The main idea is:

### Traditional Approach

```text
DATA → DASHBOARD → FARMER INTERPRETS DATA
```

### FASAL Approach

```text
DATA → INTELLIGENCE → DECISION → ACTION
```

The goal is to reduce the amount of information a farmer has to interpret manually.

---

## 🌍 Real-World Implementation

For real-world deployment, FASAL can be expanded from a prototype into a multi-farm platform.

### Phase 1 — Farmer Onboarding

Create farmer profile with:

* Location
* Crop
* Farm information
* Preferred language

### Phase 2 — IoT Deployment

Install low-cost sensor nodes in farms to continuously collect field conditions.

### Phase 3 — Data Integration

Connect:

* Weather services
* Verified mandi/APMC data
* Government scheme information
* Agricultural datasets

### Phase 4 — Decision Intelligence

Combine field conditions, weather, crop information and market context to generate personalized recommendations.

### Phase 5 — Farmer Delivery

Deliver recommendations through:

* Mobile/web dashboard
* Regional languages
* Voice assistance
* Notifications

### Phase 6 — Action Ecosystem

Connect farmers with machinery, labour, market opportunities and government support.

---

## 📊 Expected Impact

FASAL aims to help farmers:

* 💧 Reduce unnecessary irrigation
* 🌱 Respond faster to crop problems
* 💰 Make better market decisions
* ⏱️ Reduce time spent searching for information
* 🚜 Find agricultural resources more easily
* 🏛️ Discover relevant government support
* 🗣️ Access information in their preferred language

---

## 🔮 Future Scope

The current prototype can be extended with:

* More advanced soil and environmental sensors
* Historical market-price forecasting
* Fully offline/low-connectivity support
* SMS/WhatsApp alerts
* More regional languages
* Expert-validated crop disease models
* Real-time machinery booking
* FPO/cooperative integration
* Multi-farm and multi-state deployment
* More personalized AI-based recommendations

---

## 🏆 Hackathon Vision

FASAL's vision is simple:

> **Farmers should not have to become data analysts to make good farming decisions.**

We want to transform scattered agricultural information into **simple, localized and actionable intelligence**.

### 🌾 FASAL

**Data → Decision → Action**
