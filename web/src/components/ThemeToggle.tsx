import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="site-theme-toggle"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Переключить тему"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, scale: 0.7 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
