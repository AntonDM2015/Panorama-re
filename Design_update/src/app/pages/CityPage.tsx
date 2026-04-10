import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Building2, ChevronRight, Search, MapPin, Clock, Phone } from "lucide-react";
import { getCityById } from "../data/locations";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const buildingImages: Record<string, string> = {
  "modern university building": "https://images.unsplash.com/photo-1679653226697-2b0fbf7c17f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1NzI4MTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "student dormitory building": "https://images.unsplash.com/photo-1721657197499-5c12825c3a11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZG9ybWl0b3J5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1NzgyNTA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "moscow university main building": "https://images.unsplash.com/photo-1614763607331-7163d2545757?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3Njb3clMjB1bml2ZXJzaXR5JTIwbWFpbiUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NTc4MjUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "modern office building moscow": "https://images.unsplash.com/photo-1730656447409-eacbfc60dd47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZyUyMG1vc2Nvd3xlbnwxfHx8fDE3NzU3ODI1MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "modern dormitory interior": "https://images.unsplash.com/photo-1561124928-eda0f74e3847?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkb3JtaXRvcnklMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzU3ODI1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "sports complex gym": "https://images.unsplash.com/photo-1759200135568-566eb9ecaa81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb21wbGV4JTIwZ3ltfGVufDF8fHx8MTc3NTc4MjUxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "university campus bryansk": "https://images.unsplash.com/photo-1679653226697-2b0fbf7c17f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzc1NzI4MTcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export function CityPage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const city = cityId ? getCityById(cityId) : undefined;
  const [searchQuery, setSearchQuery] = useState("");

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Город не найден
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Вернуться к выбору города
          </button>
        </div>
      </div>
    );
  }

  const filteredBuildings = city.buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <Header title={city.name} subtitle={city.country} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск корпусов по названию или адресу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
              />
            </div>
          </div>

          {/* Buildings Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-7 h-7" />
              Корпуса
            </h2>

            {filteredBuildings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  Корпусы не найдены
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBuildings.map((building, index) => (
                  <motion.div
                    key={building.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
                  >
                    {/* Building Image */}
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback
                        src={buildingImages[building.image]}
                        alt={building.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                        {building.name}
                      </h3>
                    </div>

                    {/* Building Info */}
                    <div className="p-6">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{building.address}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{building.workingHours}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{building.phone}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {building.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {building.facilities.slice(0, 3).map((facility) => (
                          <span
                            key={facility}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                          >
                            {facility}
                          </span>
                        ))}
                        {building.facilities.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                            +{building.facilities.length - 3}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/city/${cityId}/building/${building.id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                      >
                        Подробнее
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
