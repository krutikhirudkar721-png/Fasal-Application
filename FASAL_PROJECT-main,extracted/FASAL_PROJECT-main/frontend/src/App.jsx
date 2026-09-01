import React, { useState, useEffect } from 'react';
import Background from './components/Background';
import SchemesBanner from './components/SchemesBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecommendationEngine from './components/RecommendationEngine';
import WeatherDashboard from './components/WeatherDashboard';
import SoilDashboard from './components/SoilDashboard';
import MarketTrends from './components/MarketTrends';
import SeasonCalendar from './components/SeasonCalendar';
import GovernmentSchemes from './components/GovernmentSchemes';
import CommunityForum from './components/CommunityForum';
import ProfitCalculator from './components/ProfitCalculator';
import About from './components/About';
import AuthModal from './components/AuthModal';
import AskAiModal from './components/AskAiModal';

import { useWeather } from './hooks/useWeather';
import { useSoilData } from './hooks/useSoilData';
import { useMarketPrices } from './hooks/useMarketPrices';
import { useAuth } from './hooks/useAuth';

function App() {
  const [lang, setLang] = useState('en');
  const [activeSection, setActiveSection] = useState('hero');
  const [location, setLocation] = useState({ lat: null, lon: null, name: '' });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAskAiModalOpen, setIsAskAiModalOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Auth state
  const { user } = useAuth();

  // Default field data
  const [fieldData, setFieldData] = useState({
    location: 'Nagpur', soilType: 'Black (Regur)', ph: 6.6, n: 60, p: 40, k: 35, 
    rainfall: 650, irrigation: 'partial', landSize: 4, season: 'kharif', budget: 16000
  });

  // When farmer logs in, sync land size and location if available
  useEffect(() => {
    if (user) {
      if (user.district && user.state) {
        setFieldData(prev => ({
          ...prev,
          location: `${user.district}, ${user.state}`,
          landSize: user.landSize || prev.landSize,
        }));
      }
    }
  }, [user]);

  // Global data hooks
  const { weather, loading: weatherLoading } = useWeather(location.lat, location.lon, location.name || fieldData.location);
  const { soil } = useSoilData(location.lat, location.lon);
  const { prices, loading: marketLoading } = useMarketPrices();

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'engine', 'weather', 'soil', 'market', 'season', 'schemes', 'community', 'about'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When real soil data loads, auto-update the form
  useEffect(() => {
    if (soil && typeof soil.ph === 'number' && typeof soil.nitrogen === 'number') {
      setFieldData(prev => ({
        ...prev,
        ph: Number(soil.ph.toFixed(1)),
        n: Math.min(150, Math.round(soil.nitrogen * 20))
      }));
    }
  }, [soil]);

  const handleStart = () => {
    document.getElementById('engine')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreSchemes = () => {
    document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLocationSelect = (lat, lon, name) => {
    setLocation({ lat, lon, name });
    setFieldData(prev => ({ ...prev, location: name }));
  };

  const Divider = () => <div className="section-divider" />;

  return (
    <>
      <Background />
      
      {/* Live Header Banner for Schemes */}
      <SchemesBanner lang={lang} onExploreSchemes={handleExploreSchemes} />
      
      {/* Main Glass Navbar */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        activeSection={activeSection} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAskAi={() => {
          setIsVoiceMode(false);
          setIsAskAiModalOpen(true);
        }}
        onOpenVoice={() => {
          setIsVoiceMode(true);
          setIsAskAiModalOpen(true);
        }}
      />
      
      <main style={{ paddingTop: '70px' }}>
        <Hero 
          lang={lang} 
          onStart={handleStart} 
          onOpenAskAi={() => {
            setIsVoiceMode(false);
            setIsAskAiModalOpen(true);
          }}
          onOpenVoice={() => {
            setIsVoiceMode(true);
            setIsAskAiModalOpen(true);
          }}
        />
        
        <Divider />
        
        <RecommendationEngine 
          lang={lang} 
          fieldData={fieldData} 
          setFieldData={setFieldData} 
          handleLocationSelect={handleLocationSelect}
        />
        
        <Divider />
        
        <WeatherDashboard 
          lang={lang} 
          weatherData={weather} 
          loading={weatherLoading} 
        />
        
        <Divider />
        
        <SoilDashboard 
          lang={lang} 
          fieldData={fieldData} 
          soilData={soil} 
        />
        
        <Divider />
        
        <MarketTrends 
          lang={lang} 
          marketData={prices} 
          loading={marketLoading} 
        />
        
        <Divider />
        
        <SeasonCalendar lang={lang} />
        
        <Divider />

        <GovernmentSchemes lang={lang} />

        <Divider />

        <CommunityForum 
          lang={lang} 
          user={user} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
        />

        <Divider />
        
        <ProfitCalculator lang={lang} />
        
        <About lang={lang} />
      </main>

      {/* Farmer OTP Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        lang={lang}
        onFarmerLocationSync={(state, district) => {
          setFieldData(prev => ({ ...prev, location: `${district}, ${state}` }));
        }}
      />

      {/* Gemini AI Plant Doctor & Voice Assistant Modal */}
      <AskAiModal 
        isOpen={isAskAiModalOpen} 
        onClose={() => {
          setIsAskAiModalOpen(false);
          setIsVoiceMode(false);
        }} 
        lang={lang} 
        weather={weather}
        initialVoiceMode={isVoiceMode}
      />
    </>
  );
}

export default App;
