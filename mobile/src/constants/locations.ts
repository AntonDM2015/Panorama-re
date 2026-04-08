import { CampusLocation, CampusFloor } from "../types/navigation";

// Панорамы общих локаций (1 этаж)
const buffet_panorama_1 = "http://192.168.0.1:5000/panoramas/buffet_1.jpg";
const buffet_panorama_2 = "http://192.168.0.1:5000/panoramas/buffet_2.jpg";

const library_panorama_1 = "http://192.168.0.1:5000/panoramas/library_1.jpg";
const library_panorama_2 = "http://192.168.0.1:5000/panoramas/library_2.jpg";
const library_panorama_3 = "http://192.168.0.1:5000/panoramas/library_3.jpg";

const main_hall_panorama_1 = "http://192.168.0.1:5000/panoramas/main_hall_1.jpg";
const main_hall_panorama_2 = "http://192.168.0.1:5000/panoramas/main_hall_2.jpg";

const street_panorama_1 = "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_1.jpg";
const street_panorama_2 = "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_2.jpg";
const street_panorama_3 = "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_3.jpg";

// Панорамы аудиторий 1 этаж
const room_104_panorama_1 = "http://192.168.0.1:5000/panoramas/104.jpg";
const room_105_panorama_1 = "http://192.168.0.1:5000/panoramas/105.jpg";
const room_106_panorama_1 = "http://192.168.0.1:5000/panoramas/106.jpg";
const room_107_panorama_1 = "http://192.168.0.1:5000/panoramas/107.jpg";
const room_108_panorama_1 = "http://192.168.0.1:5000/panoramas/108.jpg";
const room_109_panorama_1 = "http://192.168.0.1:5000/panoramas/109.jpg";
const room_110_panorama_1 = "http://192.168.0.1:5000/panoramas/110.jpg";
const room_111_panorama_1 = "http://192.168.0.1:5000/panoramas/111.jpg";
const room_112_panorama_1 = "http://192.168.0.1:5000/panoramas/112.jpg";
const room_113_panorama_1 = "http://192.168.0.1:5000/panoramas/113.jpg";
const room_114_panorama_1 = "http://192.168.0.1:5000/panoramas/114.jpg";
const room_115_panorama_1 = "http://192.168.0.1:5000/panoramas/115.jpg";
const room_116_panorama_1 = "http://192.168.0.1:5000/panoramas/116.jpg";
const room_117_panorama_1 = "http://192.168.0.1:5000/panoramas/117.jpg";
const room_118_panorama_1 = "http://192.168.0.1:5000/panoramas/118.jpg";
const room_119_panorama_1 = "http://192.168.0.1:5000/panoramas/119.jpg";
const room_120_panorama_1 = "http://192.168.0.1:5000/panoramas/120.jpg";
const room_121_panorama_1 = "http://192.168.0.1:5000/panoramas/121.jpg";
const room_122_panorama_1 = "http://192.168.0.1:5000/panoramas/122.jpg";

// Панорамы аудиторий 2 этаж
const room_201_panorama_1 = "http://192.168.0.1:5000/panoramas/201.jpg";
const room_202_panorama_1 = "http://192.168.0.1:5000/panoramas/202.jpg";
const room_203_panorama_1 = "http://192.168.0.1:5000/panoramas/203.jpg";
const room_204_panorama_1 = "http://192.168.0.1:5000/panoramas/204.jpg";
const room_205_panorama_1 = "http://192.168.0.1:5000/panoramas/205.jpg";
const room_206_panorama_1 = "http://192.168.0.1:5000/panoramas/206.jpg";
const room_207_panorama_1 = "http://192.168.0.1:5000/panoramas/207.jpg";
const room_208_panorama_1 = "http://192.168.0.1:5000/panoramas/208.jpg";
const room_209_panorama_1 = "http://192.168.0.1:5000/panoramas/209.jpg";
const room_210_panorama_1 = "http://192.168.0.1:5000/panoramas/210.jpg";
const room_211_panorama_1 = "http://192.168.0.1:5000/panoramas/211.jpg";
const room_212_panorama_1 = "http://192.168.0.1:5000/panoramas/212.jpg";
const room_213_panorama_1 = "http://192.168.0.1:5000/panoramas/213.jpg";
const room_214_panorama_1 = "http://192.168.0.1:5000/panoramas/214.jpg";
const room_215_panorama_1 = "http://192.168.0.1:5000/panoramas/215.jpg";

// Панорамы 3 этаж
const conference_hall_panorama_1 = "http://192.168.0.1:5000/panoramas/conference_hall_1.jpg";
const conference_hall_panorama_2 = "http://192.168.0.1:5000/panoramas/conference_hall_2.jpg";

const room_300_panorama_1 = "http://192.168.0.1:5000/panoramas/300.jpg";
const room_301_panorama_1 = "http://192.168.0.1:5000/panoramas/301.jpg";
const room_302_panorama_1 = "http://192.168.0.1:5000/panoramas/302.jpg";
const room_303_panorama_1 = "http://192.168.0.1:5000/panoramas/303.jpg";
const room_304_panorama_1 = "http://192.168.0.1:5000/panoramas/304.jpg";
const room_305_panorama_1 = "http://192.168.0.1:5000/panoramas/305.jpg";
const room_306_panorama_1 = "http://192.168.0.1:5000/panoramas/306.jpg";
const room_307_panorama_1 = "http://192.168.0.1:5000/panoramas/307.jpg";
const room_308_panorama_1 = "http://192.168.0.1:5000/panoramas/308.jpg";
const room_309_panorama_1 = "http://192.168.0.1:5000/panoramas/309.jpg";

// Этаж 1
export const FLOOR_1: CampusFloor = {
  floorNumber: 1,
  locations: [
    {
      id: "campus-territory",
      title: "Территория кампуса",
      description: "Прогулка по территории РЭУ им. Г.В. Плеханова и прилегающим улицам",
      category: "common",
      panoramas: [
        { 
          id: "street-1", 
          url: street_panorama_1, 
          title: "Вход на территорию",
          hotspots: [
            {
              id: "to-street-2",
              pitch: 0,
              yaw: 45,
              text: "→",
              targetLocationId: "campus-territory",
              targetPanoramaIndex: 1,
            },
            {
              id: "to-main-hall",
              pitch: 0,
              yaw: 180,
              text: "→",
              targetLocationId: "floor1-main-hall",
              targetPanoramaIndex: 0,
            },
          ],
        },
        { 
          id: "street-2", 
          url: street_panorama_2, 
          title: "Аллея",
          hotspots: [
            {
              id: "to-street-1",
              pitch: 0,
              yaw: 180,
              text: "→",
              targetLocationId: "campus-territory",
              targetPanoramaIndex: 0,
            },
            {
              id: "to-street-3",
              pitch: 0,
              yaw: 0,
              text: "→",
              targetLocationId: "campus-territory",
              targetPanoramaIndex: 2,
            },
          ],
        },
        { 
          id: "street-3", 
          url: street_panorama_3, 
          title: "Вид на главный корпус",
          hotspots: [
            {
              id: "to-street-2",
              pitch: 0,
              yaw: 180,
              text: "→",
              targetLocationId: "campus-territory",
              targetPanoramaIndex: 1,
            },
          ],
        },
      ],
      connections: [
        {
          targetLocationId: "floor1-main-hall",
          targetPanoramaIndex: 0,
          direction: "forward",
          label: "Войти в главный корпус",
        },
      ],
    },
    {
      id: "floor1-buffet",
      title: "Буфет",
      description: "Буфет на первом этаже - закуски, напитки и лёгкие блюда",
      floor: 1,
      category: "common",
      panoramas: [
        { id: "buffet-1", url: buffet_panorama_1, title: "Общий вид" },
        { id: "buffet-2", url: buffet_panorama_2, title: "Линия раздачи" },
      ],
    },
    {
      id: "floor1-library",
      title: "Библиотека",
      description: "Научная библиотека РЭУ им. Г.В. Плеханова",
      floor: 1,
      category: "common",
      panoramas: [
        { id: "library-1", url: library_panorama_1, title: "Вход" },
        { id: "library-2", url: library_panorama_2, title: "Читальный зал" },
        { id: "library-3", url: library_panorama_3, title: "Книгохранилище" },
      ],
    },
    {
      id: "floor1-main-hall",
      title: "Главный холл",
      description: "Центральный вход и ресепшен главного корпуса",
      floor: 1,
      category: "common",
      panoramas: [
        { id: "main-hall-1", url: main_hall_panorama_1, title: "Входная группа" },
        { id: "main-hall-2", url: main_hall_panorama_2, title: "Ресепшен" },
      ],
      connections: [
        {
          targetLocationId: "campus-territory",
          targetPanoramaIndex: 0,
          direction: "backward",
          label: "Выйти на территорию",
        },
      ]
    },
    {
      id: "floor1-room-104",
      title: "Аудитория 104",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-104-1", url: room_104_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-105",
      title: "Аудитория 105",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-105-1", url: room_105_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-106",
      title: "Аудитория 106",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-106-1", url: room_106_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-107",
      title: "Аудитория 107",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-107-1", url: room_107_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-108",
      title: "Аудитория 108",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-108-1", url: room_108_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-109",
      title: "Аудитория 109",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-109-1", url: room_109_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-110",
      title: "Аудитория 110",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-110-1", url: room_110_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-111",
      title: "Аудитория 111",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-111-1", url: room_111_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-112",
      title: "Аудитория 112",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-112-1", url: room_112_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-113",
      title: "Аудитория 113",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-113-1", url: room_113_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-114",
      title: "Аудитория 114",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-114-1", url: room_114_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-115",
      title: "Аудитория 115",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-115-1", url: room_115_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-116",
      title: "Аудитория 116",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-116-1", url: room_116_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-117",
      title: "Аудитория 117",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-117-1", url: room_117_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-118",
      title: "Аудитория 118",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-118-1", url: room_118_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-119",
      title: "Аудитория 119",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-119-1", url: room_119_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-120",
      title: "Аудитория 120",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-120-1", url: room_120_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-121",
      title: "Аудитория 121",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-121-1", url: room_121_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor1-room-122",
      title: "Аудитория 122",
      description: "Учебная аудитория на 1 этаже",
      floor: 1,
      category: "room",
      panoramas: [
        { id: "room-122-1", url: room_122_panorama_1, title: "Общий вид" },
      ],
    },
  ],
};

// Этаж 2
export const FLOOR_2: CampusFloor = {
  floorNumber: 2,
  locations: [
    {
      id: "floor2-room-201",
      title: "Аудитория 201",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-201-1", url: room_201_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-202",
      title: "Аудитория 202",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-202-1", url: room_202_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-203",
      title: "Аудитория 203",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-203-1", url: room_203_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-204",
      title: "Аудитория 204",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-204-1", url: room_204_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-205",
      title: "Аудитория 205",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-205-1", url: room_205_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-206",
      title: "Аудитория 206",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-206-1", url: room_206_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-207",
      title: "Аудитория 207",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-207-1", url: room_207_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-208",
      title: "Аудитория 208",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-208-1", url: room_208_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-209",
      title: "Аудитория 209",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-209-1", url: room_209_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-210",
      title: "Аудитория 210",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-210-1", url: room_210_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-211",
      title: "Аудитория 211",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-211-1", url: room_211_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-212",
      title: "Аудитория 212",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-212-1", url: room_212_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-213",
      title: "Аудитория 213",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-213-1", url: room_213_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-214",
      title: "Аудитория 214",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-214-1", url: room_214_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor2-room-215",
      title: "Аудитория 215",
      description: "Учебная аудитория на 2 этаже",
      floor: 2,
      category: "room",
      panoramas: [
        { id: "room-215-1", url: room_215_panorama_1, title: "Общий вид" },
      ],
    },
  ],
};

// Этаж 3
export const FLOOR_3: CampusFloor = {
  floorNumber: 3,
  locations: [
    {
      id: "floor3-conference-hall",
      title: "Конференц-зал",
      description: "Большой конференц-зал для мероприятий и лекций",
      floor: 3,
      category: "common",
      panoramas: [
        { id: "conference-1", url: conference_hall_panorama_1, title: "Сцена" },
        { id: "conference-2", url: conference_hall_panorama_2, title: "Зрительный зал" },
      ],
    },
    {
      id: "floor3-room-300",
      title: "Аудитория 300",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-300-1", url: room_300_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-301",
      title: "Аудитория 301",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-301-1", url: room_301_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-302",
      title: "Аудитория 302",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-302-1", url: room_302_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-303",
      title: "Аудитория 303",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-303-1", url: room_303_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-304",
      title: "Аудитория 304",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-304-1", url: room_304_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-305",
      title: "Аудитория 305",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-305-1", url: room_305_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-306",
      title: "Аудитория 306",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-306-1", url: room_306_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-307",
      title: "Аудитория 307",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-307-1", url: room_307_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-308",
      title: "Аудитория 308",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-308-1", url: room_308_panorama_1, title: "Общий вид" },
      ],
    },
    {
      id: "floor3-room-309",
      title: "Аудитория 309",
      description: "Учебная аудитория на 3 этаже",
      floor: 3,
      category: "room",
      panoramas: [
        { id: "room-309-1", url: room_309_panorama_1, title: "Общий вид" },
      ],
    },
  ],
};

export const ALL_FLOORS: CampusFloor[] = [FLOOR_1, FLOOR_2, FLOOR_3];

export const ALL_LOCATIONS: CampusLocation[] = ALL_FLOORS.flatMap((floor) => floor.locations);
