-- Обновление панорам для первых 3 локаций
UPDATE locations 
SET panorama_url = 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_1.jpg'
WHERE id = 'e7024c85-cfa0-4411-8bba-2c156b5f1797';

UPDATE locations 
SET panorama_url = 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_2.jpg'
WHERE id = '6e8b8175-b707-4125-8d51-f277419f848d';

UPDATE locations 
SET panorama_url = 'https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_3.jpg'
WHERE id = '8cb9f96c-00d6-411a-9aaf-9601342af9ad';

-- Также обновим названия
UPDATE locations 
SET name = 'Территория кампуса - Вход'
WHERE id = 'e7024c85-cfa0-4411-8bba-2c156b5f1797';

UPDATE locations 
SET name = 'Территория кампуса - Аллея'
WHERE id = '6e8b8175-b707-4125-8d51-f277419f848d';

UPDATE locations 
SET name = 'Территория кампуса - Выход'
WHERE id = '8cb9f96c-00d6-411a-9aaf-9601342af9ad';
