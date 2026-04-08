import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NavigationLink } from '../types';
import './PanoramaViewer.css';

interface PanoramaViewerProps {
  imageUrl: string;
  navigationLinks?: NavigationLink[];
  locations?: Array<{ id: string; name: string }>;
  onNavigate?: (locationId: string) => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ 
  imageUrl, 
  navigationLinks = [], 
  locations = [],
  onNavigate,
  onLoad, 
  onError 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store callbacks in refs to avoid re-initializing viewer when they change
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  const onNavigateRef = useRef(onNavigate);
  
  useEffect(() => {
    onLoadRef.current = onLoad;
    onErrorRef.current = onError;
    onNavigateRef.current = onNavigate;
  }, [onLoad, onError, onNavigate]);

  // Helper function to calculate yaw from direction
  const calculateYawFromDirection = useCallback((direction: string): number => {
    const dir = direction.toLowerCase();
    const directionMap: Record<string, number> = {
      'north': 0,
      'south': 180,
      'east': 90,
      'west': -90,
      'forward': 0,
      'back': 180,
      'left': -90,
      'right': 90,
      'север': 0,
      'юг': 180,
      'восток': 90,
      'запад': -90,
      'вперед': 0,
      'назад': 180,
      'влево': -90,
      'вправо': 90,
    };
    return directionMap[dir] || 0;
  }, []);

  // Remove console.logs from render to prevent excessive logging
  // console.log('[PanoramaViewer] Component mounted/updated, imageUrl:', imageUrl);
  // console.log('[PanoramaViewer] window.pannellum exists:', typeof (window as any).pannellum !== 'undefined');

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Check if pannellum is loaded from CDN
    const pannellum = (window as any).pannellum;
    if (!pannellum) {
      setError('Pannellum library not loaded');
      setIsLoading(false);
      return;
    }

    // Destroy previous viewer if exists
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create hotspots for navigation links
      const hotSpots = navigationLinks.map((link) => {
        const targetLocation = locations.find(loc => loc.id === link.toLocationId);
        const yaw = link.direction ? calculateYawFromDirection(link.direction) : 0;
        
        console.log('[PanoramaViewer] Creating hotspot for:', {
          target: targetLocation?.name,
          direction: link.direction,
          yaw: yaw
        });
        
        return {
          pitch: 0,
          yaw: yaw,
          type: 'info' as const,
          text: `<div style="text-align: center; padding: 4px;"><strong>${targetLocation?.name || 'Перейти'}</strong></div>`,
          CSSClass: 'pnlm-info',
          clickHandlerFunc: () => {
            console.log('[PanoramaViewer] Hotspot clicked, navigating to:', link.toLocationId);
            onNavigateRef.current?.(link.toLocationId);
          }
        };
      });
      
      console.log('[PanoramaViewer] Total hotspots created:', hotSpots.length);
      
      const viewer = pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: imageUrl,
        autoLoad: true,
        showControls: false,
        showZoomCtrl: false,
        compass: false,
        mouseZoom: true,
        dragToZoom: false,
        hfov: 110,
        minHfov: 50,
        maxHfov: 120,
        pitch: 0,
        yaw: 0,
        minYaw: -180,
        maxYaw: 180,
        minPitch: -85,
        maxPitch: 85,
        hotSpots: hotSpots.length > 0 ? hotSpots : undefined,
      });

      viewerRef.current = viewer;

      viewer.on('load', () => {
        setIsLoading(false);
        onLoadRef.current?.();
      });

      viewer.on('error', (err: any) => {
        setError(err.message || 'Failed to load panorama');
        setIsLoading(false);
        onErrorRef.current?.(err.message || 'Failed to load panorama');
      });

      viewer.on('ierror', () => {
        setError('Failed to load panorama image');
        setIsLoading(false);
        onErrorRef.current?.('Failed to load panorama image');
      });
    } catch (err: any) {
      console.error('[PanoramaViewer] Initialization error:', err);
      setError(err.message || 'Failed to initialize panorama viewer');
      setIsLoading(false);
      onErrorRef.current?.(err.message || 'Failed to initialize panorama viewer');
    }

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl]);
  // Only re-initialize when imageUrl changes
  // navigationLinks and locations are handled separately to prevent infinite loops

  // Helper function moved above useEffect

  return (
    <div className="panorama-viewer-container">
      <div ref={containerRef} className="panorama-viewer" />
      
      {isLoading && !error && (
        <div className="panorama-loader">
          <div className="panorama-loader-spinner"></div>
          <p className="panorama-loader-text">Загрузка панорамы...</p>
        </div>
      )}
      
      {error && (
        <div className="panorama-error">
          <p className="panorama-error-title">Ошибка загрузки</p>
          <p className="panorama-error-text">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PanoramaViewer;
