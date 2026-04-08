import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img 
            src="/assets/logo.png" 
            alt="РЭУ им. Г.В. Плеханова" 
            className="header-logo-img"
            onError={(e) => {
              // Fallback if logo doesn't exist
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="header-title">
            <h1 className="header-title-main">РЭУ им. Г.В. Плеханова</h1>
            <p className="header-title-sub">Панорамы кампуса</p>
          </div>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="header-nav-link">Главная</Link>
          <Link to="/admin" className="header-nav-link header-nav-link-admin">
            Админ-панель
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
