import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './SiteChrome.css';

interface SiteHeaderProps {
  title?: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = 'РЭУ им. Г.В. Плеханова',
  subtitle = 'Виртуальный тур по кампусу',
  backTo,
  backLabel = 'Назад',
}) => {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-brand">
          {backTo ? (
            <Link to={backTo} className="site-header-back">
              {backLabel}
            </Link>
          ) : null}
          <div className="site-header-logo-wrap">
            <div className="site-header-logo">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="site-header-title">{title}</h1>
              <p className="site-header-subtitle">{subtitle}</p>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default SiteHeader;
