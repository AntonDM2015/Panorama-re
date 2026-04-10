import { Link } from 'react-router-dom';
import './SiteChrome.css';

const SiteFooter: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-copy">© 2026 РЭУ им. Г.В. Плеханова</p>
        <Link to="/admin" className="site-footer-link">
          Панель администраторов
        </Link>
      </div>
    </footer>
  );
};

export default SiteFooter;
