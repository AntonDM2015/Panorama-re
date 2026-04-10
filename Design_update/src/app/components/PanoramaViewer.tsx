import { useEffect, useRef } from 'react';
import { PanoramaScene } from '../data/virtualTours';

// Импортируем типы из pannellum
declare global {
  interface Window {
    pannellum: {
      viewer: (
        container: string | HTMLElement,
        config: {
          type: string;
          panorama: string;
          autoLoad?: boolean;
          showControls?: boolean;
          hotSpots?: Array<{
            pitch: number;
            yaw: number;
            type: string;
            text?: string;
            clickHandlerFunc?: () => void;
            cssClass?: string;
          }>;
          compass?: boolean;
          orientationOnByDefault?: boolean;
          draggable?: boolean;
          mouseZoom?: boolean;
          doubleClickZoom?: boolean;
          showZoomCtrl?: boolean;
          showFullscreenCtrl?: boolean;
        }
      ) => {
        destroy: () => void;
        loadScene: (sceneId: string) => void;
      };
    };
  }
}

interface PanoramaViewerProps {
  scene: PanoramaScene;
  onSceneChange?: (sceneId: string) => void;
  onInfoClick?: (text: string) => void;
}

export function PanoramaViewer({ scene, onSceneChange, onInfoClick }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Загружаем CSS и JS для pannellum
    const loadPannellum = async () => {
      // Проверяем, не загружен ли уже pannellum
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);
      }

      if (!window.pannellum) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      // Инициализируем viewer
      if (containerRef.current && window.pannellum) {
        // Уничтожаем предыдущий viewer если он есть
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        const hotSpots = scene.hotSpots?.map((hotSpot) => ({
          pitch: hotSpot.pitch,
          yaw: hotSpot.yaw,
          type: hotSpot.type === 'scene' ? 'custom' : 'info',
          text: hotSpot.text,
          cssClass: hotSpot.type === 'scene' ? 'custom-hotspot-scene' : 'custom-hotspot-info',
          clickHandlerFunc: () => {
            if (hotSpot.type === 'scene' && hotSpot.sceneId && onSceneChange) {
              onSceneChange(hotSpot.sceneId);
            } else if (hotSpot.type === 'info' && hotSpot.text && onInfoClick) {
              onInfoClick(hotSpot.text);
            }
          }
        })) || [];

        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: scene.image,
          autoLoad: true,
          showControls: true,
          hotSpots: hotSpots,
          compass: false,
          orientationOnByDefault: false,
          draggable: true,
          mouseZoom: true,
          doubleClickZoom: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
        });
      }
    };

    loadPannellum();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [scene, onSceneChange, onInfoClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
}
