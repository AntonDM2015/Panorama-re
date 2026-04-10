export interface Building {
  id: string;
  name: string;
  address: string;
  description: string;
  facilities: string[];
  workingHours: string;
  phone: string;
  image: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface City {
  id: string;
  name: string;
  country: string;
  buildings: Building[];
}

export const cities: City[] = [
  {
    id: "bryansk",
    name: "Брянск",
    country: "Россия",
    buildings: [
      {
        id: "spartakovskaya-112",
        name: "Спартаковская 112",
        address: "ул. Спартаковская, д. 112",
        description: "Главный учебный корпус в Брянске. Современное здание с полным оснащением для обучения студентов экономических специальностей.",
        facilities: ["Аудитории", "Компьютерные классы", "Библиотека", "Столовая", "Спортзал"],
        workingHours: "Пн-Пт: 8:00 - 20:00, Сб: 9:00 - 15:00",
        phone: "+7 (4832) 74-37-36",
        image: "university campus bryansk",
        coordinates: {
          lat: 53.2522,
          lng: 34.3717
        }
      },
      {
        id: "bezhitskaya-95",
        name: "Бежицкая 95",
        address: "ул. Бежицкая, д. 95",
        description: "Дополнительный учебный корпус с современными лабораториями и лекционными залами.",
        facilities: ["Лаборатории", "Лекционные залы", "Коворкинг", "Кафетерий"],
        workingHours: "Пн-Пт: 8:00 - 19:00",
        phone: "+7 (4832) 74-25-89",
        image: "modern university building",
        coordinates: {
          lat: 53.2445,
          lng: 34.3598
        }
      },
      {
        id: "krasnogvardeiskaya-32",
        name: "Красногвардейская 32",
        address: "ул. Красногвардейская, д. 32",
        description: "Корпус с общежитием для иногородних студентов.",
        facilities: ["Общежитие", "Столовая", "Прачечная", "Спортивная площадка"],
        workingHours: "Круглосуточно",
        phone: "+7 (4832) 74-18-42",
        image: "student dormitory building",
        coordinates: {
          lat: 53.2589,
          lng: 34.3892
        }
      }
    ]
  },
  {
    id: "moscow",
    name: "Москва",
    country: "Россия",
    buildings: [
      {
        id: "stremyanny-36",
        name: "Стремянный 36",
        address: "Стремянный пер., д. 36",
        description: "Главный кампус РЭУ им. Г.В. Плеханова в Москве. Исторический корпус университета с современным оснащением.",
        facilities: ["Аудитории", "Библиотека", "Музей", "Актовый зал", "Столовая", "Буфеты"],
        workingHours: "Пн-Пт: 7:00 - 22:00, Сб: 9:00 - 18:00",
        phone: "+7 (495) 958-20-48",
        image: "moscow university main building",
        coordinates: {
          lat: 55.7289,
          lng: 37.6444
        }
      },
      {
        id: "stremyanny-28",
        name: "Стремянный 28",
        address: "Стремянный пер., д. 28",
        description: "Учебный корпус с современными компьютерными классами и залами для конференций.",
        facilities: ["Компьютерные классы", "Конференц-залы", "Коворкинг", "Кафе"],
        workingHours: "Пн-Пт: 8:00 - 21:00",
        phone: "+7 (495) 958-21-95",
        image: "modern office building moscow",
        coordinates: {
          lat: 55.7295,
          lng: 37.6439
        }
      },
      {
        id: "verkhnyaya-radischevskaya",
        name: "Верхняя Радищевская",
        address: "ул. Верхняя Радищевская, д. 18",
        description: "Общежитие для студентов с современными условиями проживания.",
        facilities: ["Общежитие", "Столовая", "Прачечная", "Тренажёрный зал", "Библиотека"],
        workingHours: "Круглосуточно",
        phone: "+7 (495) 958-23-67",
        image: "modern dormitory interior",
        coordinates: {
          lat: 55.7425,
          lng: 37.6495
        }
      },
      {
        id: "zatsepsky-41",
        name: "Зацепский Вал 41",
        address: "ул. Зацепский Вал, д. 41",
        description: "Спортивный комплекс университета с полным набором спортивных сооружений.",
        facilities: ["Бассейн", "Спортзалы", "Тренажёрный зал", "Теннисные корты", "Раздевалки"],
        workingHours: "Пн-Пт: 7:00 - 22:00, Сб-Вс: 9:00 - 20:00",
        phone: "+7 (495) 958-24-89",
        image: "sports complex gym",
        coordinates: {
          lat: 55.7329,
          lng: 37.6389
        }
      }
    ]
  }
];

export function getCityById(id: string): City | undefined {
  return cities.find(city => city.id === id);
}

export function getBuildingById(cityId: string, buildingId: string): Building | undefined {
  const city = getCityById(cityId);
  return city?.buildings.find(building => building.id === buildingId);
}
