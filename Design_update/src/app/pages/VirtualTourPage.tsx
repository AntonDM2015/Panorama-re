import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, Home, MapPin, DoorOpen, MessageCircle, ChevronDown } from "lucide-react";
import { getBuildingById, getCityById } from "../data/locations";
import { getVirtualTour, PanoramaScene } from "../data/virtualTours";
import { PanoramaViewer } from "../components/PanoramaViewer";
import { ThemeToggle } from "../components/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

export function VirtualTourPage() {
  const { cityId, buildingId } = useParams();
  const navigate = useNavigate();
  const building = cityId && buildingId ? getBuildingById(cityId, buildingId) : undefined;
  const city = cityId ? getCityById(cityId) : undefined;
  const tour = buildingId ? getVirtualTour(buildingId) : undefined;

  const [activeTab, setActiveTab] = useState<'locations' | 'rooms'>('locations');
  const [currentSceneId, setCurrentSceneId] = useState(tour?.scenes[0]?.id || 'street');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!building || !city || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Виртуальный тур недоступен
          </h1>
          <button
            onClick={() => navigate(`/city/${cityId}/building/${buildingId}`)}
            className="text-blue-400 hover:underline"
          >
            Вернуться к деталям корпуса
          </button>
        </div>
      </div>
    );
  }

  const currentScene = tour.scenes.find(s => s.id === currentSceneId) || tour.scenes[0];
  const locationScenes = tour.scenes.filter(s => s.type === 'location');
  const roomScenes = tour.scenes.filter(s => s.type === 'room');

  const handleSceneChange = (sceneId: string) => {
    setCurrentSceneId(sceneId);
    const newScene = tour.scenes.find(s => s.id === sceneId);
    if (newScene) {
      toast.success(`Переход: ${newScene.title}`);
    }
  };

  const handleInfoClick = (text: string) => {
    toast.info(text);
  };

  const handleSendMessage = () => {
    toast.success('Сообщение отправлено!');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 dark:bg-slate-950">
      <Toaster />
      
      {/* Header */}
      <header className="bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/city/${cityId}/building/${buildingId}`)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Назад</span>
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">На главную</span>
              </button>
            </div>

            <ThemeToggle />
          </div>

          <h1 className="text-xl font-bold text-white mb-1">
            {building.name}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'locations'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 inline-block mr-2" />
            Локации
            {activeTab === 'locations' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'rooms'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DoorOpen className="w-4 h-4 inline-block mr-2" />
            Кабинеты
            {activeTab === 'rooms' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        </div>
      </header>

      {/* Scene Selector */}
      <div className="px-4 py-3 bg-slate-800/50 dark:bg-slate-900/50 border-b border-slate-700 dark:border-slate-800">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-700 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{currentScene.title}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-700 dark:bg-slate-800 rounded-lg shadow-xl border border-slate-600 dark:border-slate-700 z-50 overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto">
                  {(activeTab === 'locations' ? locationScenes : roomScenes).map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => {
                        handleSceneChange(scene.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${
                        scene.id === currentSceneId ? 'bg-slate-600 dark:bg-slate-700' : ''
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{scene.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Panorama Viewer */}
      <div className="flex-1 relative bg-black">
        <PanoramaViewer
          key={currentSceneId}
          scene={currentScene}
          onSceneChange={handleSceneChange}
          onInfoClick={handleInfoClick}
        />
        
        {/* Photo Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-2 bg-black/60 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>
            {tour.scenes.findIndex(s => s.id === currentSceneId) + 1} / {tour.scenes.length}
          </span>
        </div>
      </div>

      {/* Send Message Button */}
      <div className="px-4 py-4 bg-slate-800 dark:bg-slate-900 border-t border-slate-700 dark:border-slate-800">
        <button
          onClick={handleSendMessage}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          Сообщение переведенные
        </button>
      </div>

      {/* Custom styles for pannellum hotspots */}
      <style>{`
        .custom-hotspot-scene {
          background-color: rgba(59, 130, 246, 0.9);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .custom-hotspot-scene:hover {
          background-color: rgba(37, 99, 235, 1);
          transform: scale(1.2);
        }
        
        .custom-hotspot-info {
          background-color: rgba(34, 197, 94, 0.9);
          border-radius: 50%;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .custom-hotspot-info:hover {
          background-color: rgba(22, 163, 74, 1);
          transform: scale(1.2);
        }
        
        .pnlm-hotspot-base {
          z-index: 10;
        }

        .pnlm-container {
          background-color: #000;
        }

        .pnlm-controls {
          background-color: rgba(15, 23, 42, 0.8) !important;
          backdrop-filter: blur(8px);
          border-radius: 12px !important;
          padding: 8px !important;
        }

        .pnlm-zoom-controls {
          width: auto !important;
        }

        .pnlm-zoom-in,
        .pnlm-zoom-out,
        .pnlm-fullscreen-toggle-button {
          background-color: rgba(59, 130, 246, 0.8) !important;
          border-radius: 8px !important;
          margin: 4px !important;
        }

        .pnlm-zoom-in:hover,
        .pnlm-zoom-out:hover,
        .pnlm-fullscreen-toggle-button:hover {
          background-color: rgba(37, 99, 235, 1) !important;
        }
      `}</style>
    </div>
  );
}
