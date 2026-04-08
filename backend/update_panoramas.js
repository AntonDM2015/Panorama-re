const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://oyzcqekxrqywdlykpdic.supabase.co";
const SUPABASE_KEY = "sb_publishable_wuqhR4tr2CZ13guBpOsNsw_-QR1LuWP";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function updatePanoramas() {
  console.log("Updating panoramas...\n");

  const updates = [
    {
      id: "e7024c85-cfa0-4411-8bba-2c156b5f1797",
      name: "Территория кампуса - Вход",
      description: "Прогулка по территории РЭУ им. Г.В. Плеханова и прилегающим улицам",
      panoramaUrl: "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_1.jpg",
    },
    {
      id: "6e8b8175-b707-4125-8d51-f277419f848d",
      name: "Территория кампуса - Аллея",
      description: "Аллея между корпусами университета",
      panoramaUrl: "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_2.jpg",
    },
    {
      id: "8cb9f96c-00d6-411a-9aaf-9601342af9ad",
      name: "Территория кампуса - Выход",
      description: "Выход с территории кампуса на главную улицу",
      panoramaUrl: "https://oyzcqekxrqywdlykpdic.supabase.co/storage/v1/object/public/Panoramas/street_3.jpg",
    },
  ];

  for (const update of updates) {
    console.log(`Updating ${update.name}...`);
    
    const { data, error } = await supabase
      .from("locations")
      .update({
        name: update.name,
        description: update.description,
        panorama_url: update.panoramaUrl,
      })
      .eq("id", update.id)
      .select();

    if (error) {
      console.error(`Error updating ${update.name}:`, error);
    } else {
      console.log(`✓ Updated: ${data[0]?.name}`);
    }
    console.log();
  }

  console.log("Done! Fetching updated locations...\n");

  const { data: locations, error: fetchError } = await supabase
    .from("locations")
    .select("id, name, description, panorama_url")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching locations:", fetchError);
  } else {
    console.log("Updated locations:");
    locations.forEach((loc, i) => {
      console.log(`${i + 1}. ${loc.name}`);
      console.log(`   ${loc.description}`);
      console.log(`   ${loc.panorama_url}\n`);
    });
  }
}

updatePanoramas().catch(console.error);
