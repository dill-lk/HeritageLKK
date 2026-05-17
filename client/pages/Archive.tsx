import { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, Search, SlidersHorizontal, Play, ChevronRight, Mic, Droplet, Sprout, BookOpen, Plus, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

export default function Archive() {
  const [activeTab, setActiveTab] = useState("All Records");
  const [searchQuery, setSearchQuery] = useState("");
  const [archives, setArchives] = useState<any[]>([
    { id: "mask", title: "Traditional Mask Carving", loc: "AMBALANGODA", category: "Ancient Sites", icon: <div className="text-2xl">🎭</div> },
    { id: "irrigation", title: "Ancient Irrigation", loc: "HYDROLOGY", category: "Ancient Sites", icon: <Droplet className="w-6 h-6 text-[#60a5fa] fill-[#60a5fa]/20" /> },
    { id: "manuscripts", title: "Palm Leaf Manuscripts", loc: "PALM LEAF", category: "Oral History", icon: <BookOpen className="w-6 h-6 text-[#F4A261] fill-[#F4A261]/20" /> },
    { id: "biodiversity", title: "Kanneliya Biodiversity", loc: "ENDEMIC", category: "Oral History", icon: <Sprout className="w-6 h-6 text-[#10b981] fill-[#10b981]/20" /> },
  ]);

  useEffect(() => {
    async function loadArchives() {
      if (!supabase) return;
      const { data, error } = await supabase.from("archives").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const dbArchives = data.map(item => ({
          id: item.id,
          title: item.title,
          loc: item.location || "SRI LANKA",
          category: item.subtitle?.toString().toLowerCase().includes("oral") ? "Oral History" : "Ancient Sites",
          icon: <BookOpen className="w-6 h-6 text-[#F4A261] fill-[#F4A261]/20" />
        }));
        setArchives(prev => [...dbArchives, ...prev.filter(p => !dbArchives.find(d => d.id === p.id))]);
      }
    }
    loadArchives();
  }, []);

  const displayedArchives = archives.filter((archive) => {
    const matchesTab = activeTab === "All Records" || archive.category === activeTab;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || archive.title.toLowerCase().includes(q) || archive.loc.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-[#100E0A] flex justify-center font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full sm:max-w-[430px] min-h-screen bg-[#100E0A] pb-[100px] text-[#FEFBE0] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between safe-top">
          <Link to="/home" className="w-10 h-10 rounded-full bg-[#1A1311] border border-white/5 flex items-center justify-center transition-colors hover:bg-[#2A1F1A]">
            <ArrowLeft className="w-5 h-5 text-[#F4A261]" />
          </Link>
          <h1 className="text-[28px] text-[#F4A261] font-normal leading-tight font-['Playfair_Display',serif]">
            Live Archive
          </h1>
          <button className="w-10 h-10 rounded-full bg-[#1A1311] border border-white/5 flex items-center justify-center transition-colors hover:bg-[#2A1F1A]">
            <Bookmark className="w-5 h-5 text-[#F4A261]" fill="#F4A261" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 mb-6">
          <div className="relative w-full h-12 rounded-2xl bg-[#1A1311] border border-white/5 flex items-center px-4">
            <Search className="w-5 h-5 text-white/40 mr-3" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder-white/40 font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex items-center gap-2 mb-8 overflow-x-auto custom-scrollbar pb-2">
          {["All Records", "Oral History", "Ancient Sites"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-[#F4A261] text-[#100E0A]"
                  : "bg-[#1A1311] border border-white/5 text-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Featured Card */}
        <div className="px-5 mb-8">
          <Link to="/archive/featured" className="block relative h-[240px] rounded-[32px] overflow-hidden border border-[#F4A261]/30">
            <img 
              src="https://images.unsplash.com/photo-1596706798032-9cb773b40bb0?q=80&w=2670&auto=format&fit=crop" 
              alt="Elder's Voice" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h2 className="text-[28px] font-bold leading-tight mb-2 text-white shadow-black drop-shadow-md">
                Elder's Voice: The Legend of Ravana
              </h2>
              <p className="text-sm font-medium text-white/60 mb-4">
                Recorded on: January 12, 2024
              </p>
              <div className="flex items-center gap-4">
                <button className="bg-[#F4A261] text-[#100E0A] px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
                  <Play className="w-4 h-4 fill-current" />
                  Listen Now
                </button>
                <span className="text-[#F4A261] text-xs font-bold tracking-wide">12 min audio</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Explore Records */}
        <div className="px-5 mb-6 flex justify-between items-end">
          <h2 className="text-[24px] text-[#F4A261] font-bold font-['Playfair_Display',serif]">
            Explore Records
          </h2>
          <button className="text-white/60 text-xs font-semibold flex items-center gap-1 uppercase tracking-wider">
            Filter <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-5 grid grid-cols-2 gap-4 pb-20">
          {displayedArchives.map((item) => (
            <Link key={item.id} to={`/archive/${item.id}`} className="bg-[#1A1311] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between aspect-[3/4] relative group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight mb-2 pr-2">{item.title}</h3>
                <p className="text-[9px] text-[#F4A261] font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} /> {item.loc}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-[#F4A261] group-hover:text-black">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
          {displayedArchives.length === 0 && (
            <div className="col-span-2 rounded-[24px] border border-white/5 bg-[#1A1311] p-6 text-center text-white/60 text-sm">
              No archive records found for this filter.
            </div>
          )}
        </div>

        {/* Floating Add Action Button */}
        <Link to="/archive/new" className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-transparent border-2 border-[#F4A261] flex items-center justify-center text-[#F4A261] hover:bg-[#F4A261] hover:text-[#100E0A] transition-colors shadow-lg z-50">
           <Plus className="w-6 h-6" />
        </Link>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
