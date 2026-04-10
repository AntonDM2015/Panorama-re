import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Clock, Phone, Building2, CheckCircle, Navigation } from "lucide-react";
import { getBuildingById, getCityById } from "../data/locations";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";
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

export function BuildingDetailsPage() {
  const { cityId, buildingId } = useParams();
  const navigate = useNavigate();
  const building = cityId && buildingId ? getBuildingById(cityId, buildingId) : undefined;
  const city = cityId ? getCityById(cityId) : undefined;

  if (!building || !city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Корпус не найден
          </h1>
          <button
            onClick={() => navigate(`/city/${cityId}`)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Вернуться к списку корпусов
          </button>
        </div>
      </div>
    );
  }

  const handleOpenMap = () => {
    if (building.coordinates) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${building.coordinates.lat},${building.coordinates.lng}`,
        '_blank'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <Header title={building.name} subtitle={city.name} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(`/city/${cityId}`)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад к списку корпусов</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
              >
                <ImageWithFallback
                  src={buildingImages[building.image]}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {building.name}
                  </h1>
                  <p className="text-white/90 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {building.address}
                  </p>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    О корпусе
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {building.description}
                </p>
              </motion.div>

              {/* Facilities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Удобства
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {building.facilities.map((facility, index) => (
                    <motion.div
                      key={facility}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {facility}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Virtual Tour Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-2xl p-8 shadow-lg text-white"
              >
                <h3 className="text-2xl font-bold mb-3">Виртуальный тур</h3>
                <p className="mb-6 text-white/90">
                  Совершите виртуальную экскурсию по корпусу и ознакомьтесь со всеми помещениями
                </p>
                <button 
                  onClick={() => navigate(`/city/${cityId}/building/${buildingId}/tour`)}
                  className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                >
                  Начать тур
                </button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 sticky top-24"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Контактная информация
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Адрес</p>
                      <p className="text-slate-900 dark:text-white">{building.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Режим работы</p>
                      <p className="text-slate-900 dark:text-white">{building.workingHours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Телефон</p>
                      <a
                        href={`tel:${building.phone.replace(/\s/g, '')}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {building.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {building.coordinates && (
                  <button
                    onClick={handleOpenMap}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                  >
                    <Navigation className="w-5 h-5" />
                    Открыть на карте
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}