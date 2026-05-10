// Run with: node --env-file=.env.local scripts/seed-categories.mjs
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key, { realtime: { transport: ws } });

const categories = [
  { name: "Anime & Manga",      name_ar: "أنمي ومانغا",      slug: "anime-manga",      sort_order: 1 },
  { name: "Characters",         name_ar: "شخصيات",            slug: "characters",        sort_order: 2 },
  { name: "Lebanese & Arabic",  name_ar: "لبناني وعربي",      slug: "lebanese-arabic",  sort_order: 3 },
  { name: "Hip-Hop",            name_ar: "هيب هوب",           slug: "hip-hop",           sort_order: 4 },
  { name: "Dark & Streetwear",  name_ar: "داكن وستريتوير",    slug: "dark-streetwear",  sort_order: 5 },
  { name: "Aesthetic",          name_ar: "أيستيتيك",           slug: "aesthetic",         sort_order: 6 },
  { name: "Cats",               name_ar: "قطط",               slug: "cats",              sort_order: 7 },
];

const subcategories = [
  // Anime & Manga
  { categorySlug: "anime-manga",     name: "Attack on Titan",  name_ar: "هجوم العمالقة",       slug: "attack-on-titan",   sort_order: 1 },
  { categorySlug: "anime-manga",     name: "Naruto",           name_ar: "ناروتو",               slug: "naruto",            sort_order: 2 },
  { categorySlug: "anime-manga",     name: "Hunter x Hunter",  name_ar: "هانتر × هانتر",        slug: "hunter-x-hunter",  sort_order: 3 },
  // Characters
  { categorySlug: "characters",      name: "Pokemon",          name_ar: "بوكيمون",              slug: "pokemon",           sort_order: 1 },
  { categorySlug: "characters",      name: "Sanrio",           name_ar: "سانريو",               slug: "sanrio",            sort_order: 2 },
  { categorySlug: "characters",      name: "Cartoons",         name_ar: "كرتون",                slug: "cartoons",          sort_order: 3 },
  // Lebanese & Arabic
  { categorySlug: "lebanese-arabic", name: "Lebanese Culture", name_ar: "الثقافة اللبنانية",    slug: "lebanese-culture",  sort_order: 1 },
  { categorySlug: "lebanese-arabic", name: "Arabic Typography",name_ar: "الخط العربي",          slug: "arabic-typography", sort_order: 2 },
];

async function main() {
  console.log("🔌 Connecting...");
  const { error: ping } = await supabase.from("categories").select("count").limit(1);
  if (ping) { console.error("❌ Connection failed:", ping.message); process.exit(1); }
  console.log("✅ Connected\n");

  // Clear existing
  console.log("🗑️  Clearing existing categories & subcategories...");
  await supabase.from("subcategories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert categories
  console.log("🌱 Seeding categories...");
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .insert(categories)
    .select();
  if (catErr) { console.error("❌ Categories failed:", catErr.message); process.exit(1); }
  console.log(`✅ Inserted ${cats.length} categories\n`);

  // Build slug → id map
  const slugToId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Insert subcategories
  console.log("🌱 Seeding subcategories...");
  const subRows = subcategories.map(({ categorySlug, ...rest }) => ({
    ...rest,
    category_id: slugToId[categorySlug],
  }));

  const { data: subs, error: subErr } = await supabase
    .from("subcategories")
    .insert(subRows)
    .select();
  if (subErr) { console.error("❌ Subcategories failed:", subErr.message); process.exit(1); }
  console.log(`✅ Inserted ${subs.length} subcategories\n`);

  console.log("By category:");
  cats.forEach((c) => {
    const count = subs.filter((s) => s.category_id === c.id).length;
    console.log(`   ${c.name}: ${count} subcategories`);
  });
  console.log("\n🔥 Done!");
}

main();
