import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Mic, MapPin, History, Map as MapIcon, Flag, Landmark, MoreVertical, RotateCcw, Leaf } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// Default icon fix for React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A custom marker icon to match the image
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ALL_SITES = [
  { id: 1, name: 'Galle Dutch Fort', position: [6.0264, 80.2170] as [number, number], category: 'History' },
  { id: 2, name: 'Galle Lighthouse', position: [6.0249, 80.2195] as [number, number], category: 'History' },
  { id: 3, name: 'National Museum', position: [6.0270, 80.2185] as [number, number], category: 'Knowledge' },
  { id: 4, name: 'Jungle Beach', position: [6.0150, 80.2370] as [number, number], category: 'Nature' },
];

export default function Explore() {
  const [selectedSite, setSelectedSite] = useState(ALL_SITES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredSites = ALL_SITES.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-screen bg-[#100E0A] overflow-hidden text-[#FEFBE0] font-sans">
      {/* Map layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[6.0264, 80.2170]} // Center around Galle Fort
          zoom={15}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#100E0A' }}
        >
          {/* Using a dark map tile provider to match the sleek design */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {filteredSites.map(site => (
            <Marker 
              key={site.id} 
              position={site.position} 
              icon={customIcon}
              eventHandlers={{
                click: () => setSelectedSite(site),
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Top overlay UI */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-top pointer-events-none mt-12">
        <div className="pointer-events-auto flex flex-col items-center">
          {/* Search Bar */}
          <div className="flex items-center bg-[#1A1311]/90 backdrop-blur-md rounded-[20px] px-5 py-4 shadow-lg mb-4 w-[calc(100%-48px)]">
            <Search className="w-5 h-5 text-[#FEFBE0]/60 mr-3" />
            <input 
              type="text" 
              placeholder="Search Heritage" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[#FEFBE0] placeholder-[#FEFBE0]/60 outline-none flex-1 text-[15px] font-medium"
            />
            <Mic className="w-5 h-5 text-[#FEFBE0]/60 ml-3" />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center justify-center gap-3 w-full px-6">
            <button className="flex items-center gap-2 bg-[#1A1311]/90 border border-white/5 rounded-full px-5 py-2.5 text-[14px] font-bold text-white whitespace-nowrap backdrop-blur-md">
              <GlobeIcon className="w-4 h-4" /> History
            </button>
            <button className="flex items-center gap-2 bg-[#1A1311]/90 border border-white/5 rounded-full px-5 py-2.5 text-[14px] font-bold text-white whitespace-nowrap backdrop-blur-md">
              <Leaf className="w-4 h-4" /> Nature
            </button>
            <button className="flex items-center gap-2 bg-[#1A1311]/90 border border-white/5 rounded-full px-5 py-2.5 text-[14px] font-bold text-white whitespace-nowrap backdrop-blur-md">
              <Flag className="w-4 h-4" /> Quests
            </button>
          </div>
        </div>
      </div>

      {/* Bottom info card overlay */}
      <div className="absolute bottom-[108px] left-0 right-0 z-10 px-6 pointer-events-none">
        <div className="pointer-events-auto bg-[#0F0C0A]/95 border border-white/5 rounded-[32px] p-6 shadow-2xl relative">
          
          <div className="flex justify-between items-start mb-6">
            <div className="pr-4">
              <h2 className="text-[26px] leading-[1.2] font-bold text-white mb-2 flex items-center gap-2">
                {selectedSite.name} 🏰
              </h2>
              <div className="flex items-center gap-1.5 text-[#10b981] text-[10px] font-bold tracking-[0.08em] uppercase">
                <GlobeIcon className="w-3.5 h-3.5" /> UNESCO WORLD HERITAGE SITE
              </div>
            </div>
            <button className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border border-white/5 bg-transparent active:scale-95 transition-transform overflow-hidden">
                <MoreVertical className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button className="flex-1 bg-[#F4A261] text-white rounded-[20px] py-4 text-[15px] font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_4px_16px_rgba(244,162,97,0.25)]">
              <CameraIcon /> Scan Site
            </button>
            <button className="w-14 h-14 rounded-[20px] border border-white/5 bg-transparent flex items-center justify-center transition-transform active:scale-95">
              <RotateCcw className="w-[22px] h-[22px] text-white" />
            </button>
            <button className="w-14 h-14 rounded-[20px] border border-white/5 bg-transparent flex items-center justify-center transition-transform active:scale-95">
              <Flag className="w-[22px] h-[22px] text-[#c084fc]" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

// Simple icons to match screenshot 
function FlagsIcon(props: any) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg {...props} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

function CameraIcon(props: any) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  );
}
