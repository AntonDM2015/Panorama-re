import { useNavigate } from "react-router";
import { MapPin, ChevronRight } from "lucide-react";
import { cities } from "../data/locations";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Выберите город
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {cities.map((city, index) => (
              <motion.button
                key={city.id}
                onClick={() => navigate(`/city/${city.id}`)}
                className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                          {city.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {city.country}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {city.buildings.length} {city.buildings.length === 1 ? 'корпус' : city.buildings.length < 5 ? 'корпуса' : 'корпусов'}
                    </p>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
