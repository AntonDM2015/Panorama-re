export interface PanoramaScene {
  id: string;
  title: string;
  image: string;
  type: 'location' | 'room';
  hotSpots?: {
    pitch: number;
    yaw: number;
    type: 'scene' | 'info';
    sceneId?: string;
    text?: string;
  }[];
}

export interface VirtualTour {
  buildingId: string;
  scenes: PanoramaScene[];
}

export const virtualTours: VirtualTour[] = [
  {
    buildingId: 'spartakovskaya-112',
    scenes: [
      {
        id: 'street',
        title: 'Улица',
        image: 'https://images.unsplash.com/photo-1728071692048-d3ab70514eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzNjAlMjBwYW5vcmFtYSUyMHVuaXZlcnNpdHklMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3NTc4NTA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
        type: 'location',
        hotSpots: [
          {
            pitch: -10,
            yaw: 0,
            type: 'scene',
            sceneId: 'entrance',
            text: 'Вход в здание'
          },
          {
            pitch: 0,
            yaw: 90,
            type: 'info',
            text: 'Главный корпус РЭУ им. Г.В. Плеханова'
          }
        ]
      },
      {
        id: 'entrance',
        title: 'Вход',
        image: 'https://images.unsplash.com/photo-1759889392274-246af1a984ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBvdXRkb29yJTIwY291cnR5YXJkfGVufDF8fHx8MTc3NTc4NTA3OHww',
        type: 'location',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'street',
            text: 'Выйти на улицу'
          },
          {
            pitch: -5,
            yaw: 0,
            type: 'scene',
            sceneId: 'hallway',
            text: 'Коридор первого этажа'
          }
        ]
      },
      {
        id: 'hallway',
        title: 'Коридор',
        image: 'https://images.unsplash.com/photo-1622678078898-ac7219328e91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwaGFsbHdheSUyMGNvcnJpZG9yJTIwcGFub3JhbWF8ZW58MXx8fHwxNzc1Nzg1MDc3fDA',
        type: 'location',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'entrance',
            text: 'Вернуться ко входу'
          },
          {
            pitch: -5,
            yaw: -90,
            type: 'scene',
            sceneId: 'classroom-101',
            text: 'Аудитория 101'
          },
          {
            pitch: -5,
            yaw: 90,
            type: 'scene',
            sceneId: 'library',
            text: 'Библиотека'
          }
        ]
      },
      {
        id: 'classroom-101',
        title: 'Аудитория 101',
        image: 'https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc3Jvb20lMjBsZWN0dXJlJTIwaGFsbCUyMGludGVyaW9yfGVufDF8fHx8MTc3NTc4NTA3N3ww',
        type: 'room',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'hallway',
            text: 'Вернуться в коридор'
          },
          {
            pitch: 10,
            yaw: 0,
            type: 'info',
            text: 'Лекционная аудитория на 80 мест'
          }
        ]
      },
      {
        id: 'library',
        title: 'Библиотека',
        image: 'https://images.unsplash.com/photo-1637455587265-2a3c2cbbcc84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbGlicmFyeSUyMHJlYWRpbmclMjByb29tfGVufDF8fHx8MTc3NTc4NTA3OHww',
        type: 'room',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'hallway',
            text: 'Вернуться в коридор'
          },
          {
            pitch: 5,
            yaw: 0,
            type: 'info',
            text: 'Читальный зал библиотеки'
          }
        ]
      }
    ]
  },
  {
    buildingId: 'stremyanny-36',
    scenes: [
      {
        id: 'street',
        title: 'Улица',
        image: 'https://images.unsplash.com/photo-1728071692048-d3ab70514eb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzNjAlMjBwYW5vcmFtYSUyMHVuaXZlcnNpdHklMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3NTc4NTA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
        type: 'location',
        hotSpots: [
          {
            pitch: -10,
            yaw: 0,
            type: 'scene',
            sceneId: 'entrance',
            text: 'Главный вход'
          }
        ]
      },
      {
        id: 'entrance',
        title: 'Холл',
        image: 'https://images.unsplash.com/photo-1759889392274-246af1a984ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBvdXRkb29yJTIwY291cnR5YXJkfGVufDF8fHx8MTc3NTc4NTA3OHww',
        type: 'location',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'street',
            text: 'Выход'
          },
          {
            pitch: -5,
            yaw: -45,
            type: 'scene',
            sceneId: 'hallway',
            text: 'Учебные аудитории'
          }
        ]
      },
      {
        id: 'hallway',
        title: 'Коридор',
        image: 'https://images.unsplash.com/photo-1622678078898-ac7219328e91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwaGFsbHdheSUyMGNvcnJpZG9yJTIwcGFub3JhbWF8ZW58MXx8fHwxNzc1Nzg1MDc3fDA',
        type: 'location',
        hotSpots: [
          {
            pitch: 0,
            yaw: 90,
            type: 'scene',
            sceneId: 'classroom-201',
            text: 'Аудитория 201'
          },
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'entrance',
            text: 'К выходу'
          }
        ]
      },
      {
        id: 'classroom-201',
        title: 'Аудитория 201',
        image: 'https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc3Jvb20lMjBsZWN0dXJlJTIwaGFsbCUyMGludGVyaW9yfGVufDF8fHx8MTc3NTc4NTA3N3ww',
        type: 'room',
        hotSpots: [
          {
            pitch: 0,
            yaw: 180,
            type: 'scene',
            sceneId: 'hallway',
            text: 'Выйти в коридор'
          }
        ]
      }
    ]
  }
];

export function getVirtualTour(buildingId: string): VirtualTour | undefined {
  return virtualTours.find(tour => tour.buildingId === buildingId);
}
