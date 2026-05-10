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

// ─── Products ─────────────────────────────────────────────────────────────────
// category  → must match exactly what's in the categories table (name field)
// tags[0]   → subcategory slug (used by shop shelf & filter)
// image_url → empty for now; upload via /admin/products

const products = [

  // ── Anime & Manga › Attack on Titan ──────────────────────────────────────
  {
    name: "Colossal Titan",
    name_ar: "العملاق الهائل",
    description: "The steam, the scale, the terror — the Colossal Titan on your lighter.",
    description_ar: "البخار والحجم والرعب — العملاق الهائل على ولاعتك.",
    price: 5.00, category: "Anime & Manga", tags: ["attack-on-titan"], image_url: "",
  },
  {
    name: "Beast Titan",
    name_ar: "عملاق الوحش",
    description: "Zeke's titan form unleashed. For those who play the long game.",
    description_ar: "شكل عملاق زيك محرراً. لمن يلعبون على المدى البعيد.",
    price: 5.00, category: "Anime & Manga", tags: ["attack-on-titan"], image_url: "",
  },
  {
    name: "Eren Jaeger",
    name_ar: "إيرين ياغر",
    description: "The Founding Titan. Freedom or destruction — you decide.",
    description_ar: "عملاق التأسيس. الحرية أو الدمار — أنت تقرر.",
    price: 5.00, category: "Anime & Manga", tags: ["attack-on-titan"], image_url: "",
  },

  // ── Anime & Manga › Naruto ────────────────────────────────────────────────
  {
    name: "Madara Uchiha",
    name_ar: "ماداره أوتشيها",
    description: "The legendary shinobi. Power that reshaped the world.",
    description_ar: "الشينوبي الأسطوري. قوة أعادت تشكيل العالم.",
    price: 5.00, category: "Anime & Manga", tags: ["naruto"], image_url: "",
  },
  {
    name: "Akatsuki Trio",
    name_ar: "ثلاثي الأكاتسوكي",
    description: "Three Akatsuki members, one mission, zero chill.",
    description_ar: "ثلاثة أعضاء من الأكاتسوكي، مهمة واحدة، صفر برود.",
    price: 5.00, category: "Anime & Manga", tags: ["naruto"], image_url: "",
  },
  {
    name: "Akatsuki Pose",
    name_ar: "وقفة الأكاتسوكي",
    description: "The iconic red cloud cloak. You know the vibe.",
    description_ar: "العباءة الأيقونية بالغيوم الحمراء. تعرف الجو.",
    price: 5.00, category: "Anime & Manga", tags: ["naruto"], image_url: "",
  },
  {
    name: "Akatsuki Clouds",
    name_ar: "غيوم الأكاتسوكي",
    description: "Red clouds on black. Minimal. Menacing. Perfect.",
    description_ar: "غيوم حمراء على أسود. بسيط. مخيف. مثالي.",
    price: 5.00, category: "Anime & Manga", tags: ["naruto"], image_url: "",
  },
  {
    name: "Obito",
    name_ar: "أوبيتو",
    description: "Half mask, full pain. Obito's story on a lighter.",
    description_ar: "نصف قناع، ألم كامل. قصة أوبيتو على ولاعة.",
    price: 5.00, category: "Anime & Manga", tags: ["naruto"], image_url: "",
  },

  // ── Anime & Manga › Hunter x Hunter ──────────────────────────────────────
  {
    name: "Killua",
    name_ar: "كيلوا",
    description: "Lightning speed, cold eyes, warm heart. The assassin who chose friendship.",
    description_ar: "سرعة البرق، عيون باردة، قلب دافئ. القاتل الذي اختار الصداقة.",
    price: 5.00, category: "Anime & Manga", tags: ["hunter-x-hunter"], image_url: "",
  },
  {
    name: "Gon",
    name_ar: "غون",
    description: "Pure determination in one character. Gon never gives up.",
    description_ar: "عزيمة خالصة في شخصية واحدة. غون لا يستسلم أبداً.",
    price: 5.00, category: "Anime & Manga", tags: ["hunter-x-hunter"], image_url: "",
  },
  {
    name: "Gon Freecss",
    name_ar: "غون فريكس",
    description: "The boy who wanted to find his father and found himself instead.",
    description_ar: "الصبي الذي أراد إيجاد والده فوجد نفسه بدلاً من ذلك.",
    price: 5.00, category: "Anime & Manga", tags: ["hunter-x-hunter"], image_url: "",
  },

  // ── Characters › Pokemon ──────────────────────────────────────────────────
  {
    name: "Pokeball",
    name_ar: "كرة البوكيمون",
    description: "The OG. Red and white — gotta catch 'em all.",
    description_ar: "الأصلية. أحمر وأبيض — يجب عليك اصطيادهم جميعاً.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Gengar",
    name_ar: "جينغار",
    description: "The shadow Pokémon. Spooky, iconic, unforgettable.",
    description_ar: "بوكيمون الظل. مخيف وأيقوني ولا يُنسى.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Togepi",
    name_ar: "توجيبي",
    description: "Small, cute, chaotic. Togepi energy in your pocket.",
    description_ar: "صغير ولطيف وفوضوي. طاقة توجيبي في جيبك.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Squirtle",
    name_ar: "سكويرتل",
    description: "The water starter. Cool as ever.",
    description_ar: "بوكيمون الماء المبتدئ. رائع كما هو دائماً.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Charmander",
    name_ar: "تشارماندر",
    description: "Fire type from day one. The classic choice.",
    description_ar: "نوع النار من اليوم الأول. الاختيار الكلاسيكي.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Pikachu",
    name_ar: "بيكاشو",
    description: "The face of a generation. Electric yellow on your BIC.",
    description_ar: "وجه جيل كامل. الأصفر الكهربائي على ولاعة BIC.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },
  {
    name: "Bulbasaur",
    name_ar: "بولباصور",
    description: "The most underrated starter. Grass-type loyalists only.",
    description_ar: "المبتدئ الأكثر استخفافاً. لمحبي نوع العشب فقط.",
    price: 5.00, category: "Characters", tags: ["pokemon"], image_url: "",
  },

  // ── Characters › Sanrio ───────────────────────────────────────────────────
  {
    name: "Kuromi Pattern",
    name_ar: "نمط كوروميغ",
    description: "All-over Kuromi print. Chaotic cute energy.",
    description_ar: "طباعة كورومي على الكل. طاقة لطيفة وفوضوية.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },
  {
    name: "Kuromi",
    name_ar: "كورومي",
    description: "The dark side of cute. Kuromi in full character.",
    description_ar: "الجانب المظلم من اللطافة. كورومي بشخصيتها الكاملة.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },
  {
    name: "My Melody",
    name_ar: "ماي ميلودي",
    description: "Sweet and soft. My Melody brings the pink pastel vibes.",
    description_ar: "حلوة وناعمة. ماي ميلودي تجلب أجواء الباستيل الوردي.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },
  {
    name: "Cinnamoroll",
    name_ar: "سينامورول",
    description: "The fluffiest lighter wrap in existence. Soft energy only.",
    description_ar: "غلاف الولاعة الأكثر نعومة على الإطلاق. طاقة ناعمة فقط.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },
  {
    name: "Pochacco",
    name_ar: "بوتشاكو",
    description: "The chill Sanrio dog. Low key cute.",
    description_ar: "الكلب الهادئ من سانريو. لطيف بشكل منخفض.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },
  {
    name: "Hello Kitty",
    name_ar: "هيلو كيتي",
    description: "The original icon. No mouth needed — the fit speaks.",
    description_ar: "الأيقونة الأصلية. لا فم مطلوب — المظهر يتكلم.",
    price: 5.00, category: "Characters", tags: ["sanrio"], image_url: "",
  },

  // ── Characters › Cartoons ─────────────────────────────────────────────────
  {
    name: "Patrick Star",
    name_ar: "باتريك ستار",
    description: "Is mayonnaise an instrument? Patrick doesn't care. Neither should you.",
    description_ar: "هل المايونيز آلة موسيقية؟ باتريك لا يهتم. أنت أيضاً لا يجب.",
    price: 5.00, category: "Characters", tags: ["cartoons"], image_url: "",
  },
  {
    name: "Bart Simpson",
    name_ar: "بارت سيمبسون",
    description: "Don't have a cow, man. Classic Bart on your lighter.",
    description_ar: "لا تبالغ يا صاح. بارت الكلاسيكي على ولاعتك.",
    price: 5.00, category: "Characters", tags: ["cartoons"], image_url: "",
  },

  // ── Lebanese & Arabic › Lebanese Culture ──────────────────────────────────
  {
    name: "Lebanese Bus",
    name_ar: "الباص اللبناني",
    description: "Buss el nahr. The ride that built memories for generations.",
    description_ar: "بص النهر. الرحلة التي بنت ذكريات لأجيال.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanese Plate 1.6or",
    name_ar: "لوحة لبنانية ١.٦٠ر",
    description: "The iconic Lebanese license plate. Old school respect.",
    description_ar: "اللوحة اللبنانية الأيقونية. احترام من الزمن القديم.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanese Plate Alt",
    name_ar: "لوحة لبنانية بديلة",
    description: "Another take on the classic plate. Lebanon always.",
    description_ar: "نسخة أخرى من اللوحة الكلاسيكية. لبنان دائماً.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanon Map",
    name_ar: "خريطة لبنان",
    description: "The shape of home. Small country, massive heart.",
    description_ar: "شكل الوطن. بلد صغير وقلب ضخم.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanon Design",
    name_ar: "تصميم لبنان",
    description: "Cedar, colors, pride. Lebanon in one wrap.",
    description_ar: "أرز وألوان وفخر. لبنان في ملصق واحد.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanese Spotify",
    name_ar: "سبوتيفاي لبناني",
    description: "Your Lebanese playlist, wrapped. You know the songs.",
    description_ar: "قائمتك الموسيقية اللبنانية ملفوفة. تعرف الأغاني.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanese Food Icons",
    name_ar: "أيقونات الطعام اللبناني",
    description: "Coffee, maamoul, and all the good stuff. Taste the culture.",
    description_ar: "قهوة ومعمول وكل الأشياء الجيدة. تذوق الثقافة.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Lebanese Lighter",
    name_ar: "الولاعة اللبنانية",
    description: "Cedar on a BIC. It doesn't get more Lebanese than this.",
    description_ar: "أرز على BIC. لا يوجد شيء أكثر لبنانية من هذا.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "Fez & Red",
    name_ar: "طربوش وأحمر",
    description: "The fez and the patterns — Lebanese heritage in textile form.",
    description_ar: "الطربوش والأنماط — التراث اللبناني بشكل نسيجي.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },
  {
    name: "The Boys",
    name_ar: "الشباب",
    description: "Your crew, your energy, captured on a wrap. This one's for the group chat.",
    description_ar: "رفقتك وطاقتك، محتجزة على ملصق. هذه للمجموعة.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["lebanese-culture"], image_url: "",
  },

  // ── Lebanese & Arabic › Arabic Typography ────────────────────────────────
  {
    name: "Ride a Little",
    name_ar: "ركب شوي",
    description: "Slow down. Ride a little. Arabic calligraphy that hits.",
    description_ar: "تمهل. ركب شوي. خط عربي يلمس القلب.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },
  {
    name: "Bonjour بونجور",
    name_ar: "بونجور",
    description: "French x Arabic — the Beirut way of saying hello.",
    description_ar: "فرنسي × عربي — الطريقة البيروتية لقول مرحباً.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },
  {
    name: "Bonjour Alt",
    name_ar: "بونجور - نسخة أخرى",
    description: "Another Bonjour. Because one was never enough in Beirut.",
    description_ar: "بونجور آخر. لأن واحدة لم تكن كافية في بيروت.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },
  {
    name: "ميت عشقة قهوة",
    name_ar: "ميت عشقة قهوة",
    description: "Dead in love with coffee. A Lebanese way of life.",
    description_ar: "ميت عشقة قهوة. أسلوب حياة لبناني.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },
  {
    name: "Arabic Floral",
    name_ar: "الزهري العربي",
    description: "Traditional Arabic patterns reimagined for modern lighters.",
    description_ar: "الأنماط العربية التقليدية معاد تصورها للولاعات الحديثة.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },
  {
    name: "Arabic Art",
    name_ar: "فن عربي",
    description: "Arabic calligraphy meets contemporary illustration.",
    description_ar: "الخط العربي يلتقي بالرسوم التوضيحية المعاصرة.",
    price: 5.00, category: "Lebanese & Arabic", tags: ["arabic-typography"], image_url: "",
  },

  // ── Hip-Hop ───────────────────────────────────────────────────────────────
  {
    name: "Nipsey Hussle",
    name_ar: "نيبسي هوسل",
    description: "The Marathon continues. TMC forever.",
    description_ar: "الماراثون يستمر. TMC إلى الأبد.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },
  {
    name: "Juice WRLD",
    name_ar: "جوس وورلد",
    description: "999. Legends never die.",
    description_ar: "٩٩٩. الأساطير لا تموت أبداً.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },
  {
    name: "YYY",
    name_ar: "واي واي واي",
    description: "Drip season. The lighter that matches your playlist.",
    description_ar: "موسم التنقيط. الولاعة التي تتناسب مع قائمتك.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },
  {
    name: "Lakers Drip",
    name_ar: "ليكرز دريب",
    description: "Showtime meets streetwear. Purple and gold forever.",
    description_ar: "عرض يلتقي بالشارع. بنفسجي وذهبي إلى الأبد.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },
  {
    name: "Smoke & Lean",
    name_ar: "دخان وانحناء",
    description: "Late night, deep thoughts, lighter in hand.",
    description_ar: "ليل متأخر، أفكار عميقة، ولاعة في اليد.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },
  {
    name: "Stack It Up",
    name_ar: "راكم المال",
    description: "Hustle culture. Fire and finesse.",
    description_ar: "ثقافة الكدح. نار وأناقة.",
    price: 5.00, category: "Hip-Hop", tags: [], image_url: "",
  },

  // ── Dark & Streetwear ─────────────────────────────────────────────────────
  {
    name: "Weed Head",
    name_ar: "رأس الأخضر",
    description: "High vibes only. The beanie character that gets it.",
    description_ar: "أجواء عالية فقط. شخصية القبعة التي تفهم.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Crossbones",
    name_ar: "عظام متقاطعة",
    description: "Skull and cross pattern. Classic danger energy.",
    description_ar: "نمط الجمجمة والتقاطع. طاقة الخطر الكلاسيكية.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Play Hard Or Die",
    name_ar: "العب بشدة أو مت",
    description: "Skull with a controller. Gaming is life, rest is death.",
    description_ar: "جمجمة مع وحدة تحكم. الألعاب هي الحياة، والراحة هي الموت.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Gnarlbro",
    name_ar: "نارل برو",
    description: "Pack design, rebellious energy. Gnarlbro hits different.",
    description_ar: "تصميم العلبة، طاقة متمردة. نارل برو مختلف.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Nike × Arabic",
    name_ar: "نايكي × عربي",
    description: "Just Do It — فقط افعلها. Two cultures, one lighter.",
    description_ar: "فقط افعلها — Just Do It. ثقافتان، ولاعة واحدة.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Fucktus",
    name_ar: "فاكتوس",
    description: "The cactus duo that doesn't care. Fucktus energy.",
    description_ar: "ثنائي الصبار الذي لا يهتم. طاقة فاكتوس.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Dino Bones",
    name_ar: "عظام ديناصور",
    description: "Extinct but iconic. Dino skeleton does what it wants.",
    description_ar: "منقرض لكن أيقوني. هيكل الديناصور يفعل ما يريد.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Dark Beast",
    name_ar: "الوحش المظلم",
    description: "Fantasy creature, dark energy. Not for the faint-hearted.",
    description_ar: "مخلوق خيالي، طاقة مظلمة. ليس لضعاف القلوب.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "The Door",
    name_ar: "الباب",
    description: "A door to somewhere darker. What's on the other side?",
    description_ar: "باب إلى مكان أكثر ظلاماً. ما الذي على الجانب الآخر؟",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },
  {
    name: "Dark Bird",
    name_ar: "الطائر الداكن",
    description: "Wings spread, eyes sharp. Dark energy in flight.",
    description_ar: "أجنحة ممتدة وعيون حادة. طاقة داكنة في الطيران.",
    price: 5.00, category: "Dark & Streetwear", tags: [], image_url: "",
  },

  // ── Aesthetic ─────────────────────────────────────────────────────────────
  {
    name: "Snake Hand",
    name_ar: "يد الثعبان",
    description: "Art-house energy. Snake wrapped around a hand — mysterious.",
    description_ar: "طاقة فنية. ثعبان ملتف حول يد — غامض.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Japanese Dagger",
    name_ar: "الخنجر الياباني",
    description: "Japanese art meets lighter art. Sharp in every sense.",
    description_ar: "الفن الياباني يلتقي بفن الولاعة. حاد بكل معنى الكلمة.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Ghost Moon",
    name_ar: "شبح القمر",
    description: "Floating ghost under a full moon. Eerie and peaceful at once.",
    description_ar: "شبح عائم تحت قمر كامل. مخيف وهادئ في آن واحد.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Holographic",
    name_ar: "هولوغرافي",
    description: "Rainbow holographic wrap. Impossible to look away.",
    description_ar: "غلاف هولوغرافي قوس قزح. مستحيل أن تبعد نظرك.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Triple Flames",
    name_ar: "ثلاثة لهب",
    description: "Three flame characters, one vibe. Burning energy.",
    description_ar: "ثلاث شخصيات من اللهب، جو واحد. طاقة محترقة.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Playing Card",
    name_ar: "ورقة اللعب",
    description: "Ace of spades. You're holding the winning hand.",
    description_ar: "بستوني الأس. أنت تحمل اليد الفائزة.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Earth Rise",
    name_ar: "شروق الأرض",
    description: "The blue marble from space. Cosmic perspective on a lighter.",
    description_ar: "الكرة الزرقاء من الفضاء. منظور كوني على ولاعة.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Alien Face",
    name_ar: "وجه فضائي",
    description: "Big eyes, grey skin, universal energy. Alien approved.",
    description_ar: "عيون كبيرة وبشرة رمادية وطاقة كونية. معتمد من الفضائي.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Alien Green",
    name_ar: "الفضائي الأخضر",
    description: "The classic alien silhouette. Take me to your dealer.",
    description_ar: "صورة ظلية الفضائي الكلاسيكية. خذني إلى بائعك.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Big Eye",
    name_ar: "العين الكبيرة",
    description: "Surreal eye staring into your soul. It sees you.",
    description_ar: "عين سريالية تحدق في روحك. تراك.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Abstract Swirl",
    name_ar: "دوامة تجريدية",
    description: "Colorful chaos, perfectly balanced. Abstract art on fire.",
    description_ar: "فوضى ملونة ومتوازنة بشكل مثالي. فن تجريدي على نار.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },
  {
    name: "Orange Flame",
    name_ar: "اللهب البرتقالي",
    description: "Simple. Bold. Orange. The lighter that lights lighters.",
    description_ar: "بسيط. جريء. برتقالي. الولاعة التي تضيء الولاعات.",
    price: 5.00, category: "Aesthetic", tags: [], image_url: "",
  },

  // ── Cats ──────────────────────────────────────────────────────────────────
  {
    name: "Guitar Cat",
    name_ar: "قطة الغيتار",
    description: "The black cat that shreds. Rock and roll, purr edition.",
    description_ar: "القطة السوداء التي تعزف. روك آند رول، إصدار المواء.",
    price: 5.00, category: "Cats", tags: [], image_url: "",
  },
  {
    name: "Guitar Cat Alt",
    name_ar: "قطة الغيتار - نسخة أخرى",
    description: "Same cat, different angle. Still shredding.",
    description_ar: "نفس القطة، زاوية مختلفة. لا تزال تعزف.",
    price: 5.00, category: "Cats", tags: [], image_url: "",
  },
  {
    name: "Smoking Cat",
    name_ar: "القطة المدخنة",
    description: "Unbothered. Iconic. The smoking cat does not care.",
    description_ar: "غير مكترثة. أيقونية. القطة المدخنة لا تهتم.",
    price: 5.00, category: "Cats", tags: [], image_url: "",
  },
  {
    name: "Black Cat",
    name_ar: "القطة السوداء",
    description: "Sleek, mysterious, magnetic. The black cat owns the night.",
    description_ar: "أنيقة وغامضة وجذابة. القطة السوداء تملك الليل.",
    price: 5.00, category: "Cats", tags: [], image_url: "",
  },
  {
    name: "Cat Pack",
    name_ar: "مجموعة القطط",
    description: "The whole crew. Where one cat goes, they all go.",
    description_ar: "الطاقم بالكامل. أينما ذهبت قطة ذهبن جميعاً.",
    price: 5.00, category: "Cats", tags: [], image_url: "",
  },
];

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔌 Connecting to Supabase...");

  const { error: pingError } = await supabase.from("products").select("count").limit(1);
  if (pingError) {
    console.error("❌ Connection failed:", pingError.message);
    process.exit(1);
  }
  console.log("✅ Connected\n");

  console.log("🗑️  Deleting existing products...");
  const { error: delError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) {
    console.error("❌ Delete failed:", delError.message);
    process.exit(1);
  }
  console.log(`✅ Cleared\n`);

  console.log(`🌱 Seeding ${products.length} products...`);
  const { data, error } = await supabase.from("products").insert(products).select();
  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} products\n`);
  console.log("By category:");
  const byCategory = data.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byCategory).forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));
  console.log("\n🔥 Done! Go to /admin/products to upload images for each wrap.");
}

main();
