import React from 'react';
import { Link } from 'react-router-dom';
import { Location } from '../types';
import './LocationCard.css';

interface LocationCardProps {
  location: Location;
}

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const panoramaCount = location.panoramas.length;
  
  return (
    <Link to={`/panorama/${location.id}`} className="location-card">
      <div className="location-card-content">
        <div className="location-card-header">
          <h3 className="location-card-title">{location.name}</h3>
          <span className="location-card-badge">
            {panoramaCount} {panoramaCount === 1 ? 'панорама' : panoramaCount < 5 ? 'панорамы' : 'панорам'}
          </span>
        </div>
        <p className="location-card-description">{location.description}</p>
        <div className="location-card-footer">
          <span className="location-card-link">Открыть →</span>
        </div>
      </div>
    </Link>
  );
};

export default LocationCard;
