// Run with: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { realtime: { transport: ws } });

const products = [
  // Lebanese & Cultural
  { name: "Cedar Tree", name_ar: "شجرة الأرز", description: "Proud Lebanese cedar in vivid detail — carry your roots everywhere you go.", description_ar: "أرز لبنان بكل فخر — احمل جذورك معك أينما ذهبت.", price: 5.00, image_url: "https://picsum.photos/seed/cedar/600/600", category: "Lebanese & Cultural", tags: ["cedar", "lebanon", "nature", "pride"] },
  { name: "Lebanese Flag Wave", name_ar: "علم لبنان", description: "The red, white, and cedar — reimagined as a wrap that speaks for itself.", description_ar: "الأحمر والأبيض والأرز — معاد تصوره كملصق يعبّر عن نفسه.", price: 5.00, image_url: "https://picsum.photos/seed/lbflag/600/600", category: "Lebanese & Cultural", tags: ["flag", "lebanon", "patriot", "red"] },
  { name: "Dabke Vibes", name_ar: "تيبس الدبكة", description: "Celebrate the dance, the energy, the spirit of the dabke in one wrap.", description_ar: "احتفل بالرقصة والطاقة وروح الدبكة في ملصق واحد.", price: 5.00, image_url: "https://picsum.photos/seed/dabke/600/600", category: "Lebanese & Cultural", tags: ["dabke", "dance", "culture", "lebanon"] },
  // Aesthetic & Visual
  { name: "Retro Wave Grid", name_ar: "شبكة الموجة الرجعية", description: "Synthwave sunset meets lighter wrap. Pure 80s nostalgia in your pocket.", description_ar: "غروب سينث ويف يلتقي بملصق الولاعة. حنين الثمانينيات في جيبك.", price: 5.00, image_url: "https://picsum.photos/seed/retrowave/600/600", category: "Aesthetic & Visual", tags: ["retro", "wave", "80s", "synthwave", "grid"] },
  { name: "Marble Drip", name_ar: "رخام متقطر", description: "Liquid marble swirls in black and white — effortlessly clean aesthetic.", description_ar: "دوامات الرخام السائل بالأبيض والأسود — جمالية نظيفة بلا جهد.", price: 5.00, image_url: "https://picsum.photos/seed/marble/600/600", category: "Aesthetic & Visual", tags: ["marble", "minimal", "black", "white", "clean"] },
  { name: "Geometric Storm", name_ar: "عاصفة هندسية", description: "Sharp lines, bold geometry, controlled chaos on a 3.5cm canvas.", description_ar: "خطوط حادة وهندسة جريئة وفوضى منضبطة على لوحة 3.5 سم.", price: 5.00, image_url: "https://picsum.photos/seed/geometric/600/600", category: "Aesthetic & Visual", tags: ["geometric", "lines", "abstract", "bold"] },
  // Girly & Cute
  { name: "Butterfly Garden", name_ar: "حديقة الفراشات", description: "Delicate butterflies in pastel hues — soft energy for a hard lighter.", description_ar: "فراشات رقيقة بألوان باستيل ناعمة — طاقة ناعمة لولاعة قوية.", price: 5.00, image_url: "https://picsum.photos/seed/butterfly/600/600", category: "Girly & Cute", tags: ["butterfly", "pastel", "cute", "floral", "pink"] },
  { name: "Cherry Blossom", name_ar: "أزهار الكرز", description: "Japanese sakura blooms in full spring glory. Delicate and dreamy.", description_ar: "أزهار ساكورا اليابانية في ربيعها الكامل. رقيقة وحالمة.", price: 5.00, image_url: "https://picsum.photos/seed/sakura/600/600", category: "Girly & Cute", tags: ["cherry", "blossom", "japan", "pink", "spring", "floral"] },
  // Manly
  { name: "Skull & Smoke", name_ar: "جمجمة ودخان", description: "Old school tattoo skull rising through smoke. Zero apologies.", description_ar: "جمجمة وشم كلاسيكية ترتفع خلال الدخان. بدون اعتذارات.", price: 5.00, image_url: "https://picsum.photos/seed/skull/600/600", category: "Manly", tags: ["skull", "smoke", "tattoo", "dark", "oldschool"] },
  { name: "Eagle Strike", name_ar: "ضربة النسر", description: "A sharp-eyed eagle in full strike mode. Power, precision, pride.", description_ar: "نسر حاد البصر في وضع الضربة الكاملة. قوة ودقة وفخر.", price: 5.00, image_url: "https://picsum.photos/seed/eagle/600/600", category: "Manly", tags: ["eagle", "bird", "power", "bold", "dark"] },
  // Sporty
  { name: "Soccer Flames", name_ar: "ألسنة كرة القدم", description: "For the ones who live and die for the beautiful game.", description_ar: "لأولئك الذين يعيشون ويموتون من أجل اللعبة الجميلة.", price: 5.00, image_url: "https://picsum.photos/seed/soccer/600/600", category: "Sporty", tags: ["soccer", "football", "sport", "fire", "game"] },
  { name: "Skate or Burn", name_ar: "تزلج أو احترق", description: "Street skate culture meets lighter art. Drop in and never stop.", description_ar: "ثقافة التزلج في الشوارع تلتقي بفن الولاعة. ابدأ ولا تتوقف أبدًا.", price: 5.00, image_url: "https://picsum.photos/seed/skate/600/600", category: "Sporty", tags: ["skate", "street", "sport", "urban", "board"] },
  // Personality & Lifestyle
  { name: "Coffee & Chaos", name_ar: "قهوة وفوضى", description: "For those who run on caffeine and controlled chaos.", description_ar: "لمن يعيشون على الكافيين والفوضى المنضبطة.", price: 5.00, image_url: "https://picsum.photos/seed/coffee/600/600", category: "Personality & Lifestyle", tags: ["coffee", "cafe", "lifestyle", "mood", "vibe"] },
  { name: "Music Is Life", name_ar: "الموسيقى حياة", description: "Sound waves, vinyl, and headphones. The wrap for those who hear in color.", description_ar: "موجات الصوت والفينيل وسماعات الرأس. الملصق لمن يسمعون بالألوان.", price: 5.00, image_url: "https://picsum.photos/seed/music/600/600", category: "Personality & Lifestyle", tags: ["music", "sound", "vinyl", "headphones", "beats"] },
  // LGBTQ+
  { name: "Rainbow Fire", name_ar: "نار قوس قزح", description: "Pride colors ignited. Bright, loud, unapologetic — just like you.", description_ar: "ألوان الفخر مشتعلة. مشرقة وصاخبة وبلا اعتذارات — تماماً مثلك.", price: 5.00, image_url: "https://picsum.photos/seed/rainbow/600/600", category: "LGBTQ+", tags: ["rainbow", "pride", "lgbtq", "color", "fire"] },
  { name: "Love Is Love", name_ar: "الحب هو الحب", description: "Simple message. Infinite meaning. Light it with pride.", description_ar: "رسالة بسيطة. معنى لا نهائي. أشعلها بكل فخر.", price: 5.00, image_url: "https://picsum.photos/seed/loveislove/600/600", category: "LGBTQ+", tags: ["love", "pride", "lgbtq", "heart", "equality"] },
  // Weird & Wild
  { name: "Glitch Reality", name_ar: "واقع مشوه", description: "When the simulation breaks. Corrupted pixels, glitched reality, no ctrl+Z.", description_ar: "عندما ينكسر المحاكاة. بكسلات تالفة وواقع مشوه، لا تراجع.", price: 5.00, image_url: "https://picsum.photos/seed/glitch/600/600", category: "Weird & Wild", tags: ["glitch", "digital", "pixel", "weird", "art", "vaporwave"] },
  { name: "Alien Raver", name_ar: "رافر فضائي", description: "Part alien, part rave creature — 100% unclassifiable.", description_ar: "نصف كائن فضائي ونصف مخلوق رقص — 100% لا تصنيف له.", price: 5.00, image_url: "https://picsum.photos/seed/alien/600/600", category: "Weird & Wild", tags: ["alien", "rave", "weird", "psychedelic", "space"] },
  // Custom & Personalized
  { name: "Your Name Here", name_ar: "اسمك هنا", description: "Submit your name or phrase and we'll wrap it in fire.", description_ar: "أرسل اسمك أو عبارتك وسنلفها بالنار. مخصص بالكامل لك.", price: 5.00, image_url: "https://picsum.photos/seed/customname/600/600", category: "Custom & Personalized", tags: ["custom", "name", "personal", "text", "bespoke"] },
  { name: "Your Design", name_ar: "تصميمك أنت", description: "Send us your art, logo, or photo. We'll put it on a lighter wrap.", description_ar: "أرسل لنا فنك أو شعارك أو صورتك. سنضعه على ملصق ولاعة.", price: 5.00, image_url: "https://picsum.photos/seed/customdesign/600/600", category: "Custom & Personalized", tags: ["custom", "design", "logo", "art", "upload", "bespoke"] },
];

async function main() {
  console.log("🔌 Testing Supabase connection...");
  console.log(`   URL: ${url}`);

  // Test connection
  const { error: pingError } = await supabase.from("products").select("count").limit(1);
  if (pingError) {
    console.error("❌ Connection failed:", pingError.message);
    console.error("\nMake sure you've run supabase/schema.sql in your Supabase SQL editor first.");
    process.exit(1);
  }
  console.log("✅ Connection successful!\n");

  // Clear existing seed data
  console.log("🗑️  Clearing existing products...");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert products
  console.log("🌱 Seeding 20 products...");
  const { data, error } = await supabase.from("products").insert(products).select();

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} products successfully!\n`);
  console.log("Products by category:");
  const byCategory = data.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  console.log("\n🔥 Done! Your Spark'd database is ready.");
}

main();
