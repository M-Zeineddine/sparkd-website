-- =============================================
-- Spark'd Seed Data — 20 Products
-- Run AFTER schema.sql
-- =============================================

INSERT INTO products (name, name_ar, description, description_ar, price, image_url, category, tags) VALUES

-- Lebanese & Cultural (3)
(
  'Cedar Tree',
  'شجرة الأرز',
  'Proud Lebanese cedar in vivid detail — carry your roots everywhere you go.',
  'أرز لبنان بكل فخر — احمل جذورك معك أينما ذهبت.',
  5.00,
  'https://picsum.photos/seed/cedar/600/600',
  'Lebanese & Cultural',
  ARRAY['cedar', 'lebanon', 'nature', 'pride']
),
(
  'Lebanese Flag Wave',
  'علم لبنان',
  'The red, white, and cedar — reimagined as a wrap that speaks for itself.',
  'الأحمر والأبيض والأرز — معاد تصوره كملصق يعبّر عن نفسه.',
  5.00,
  'https://picsum.photos/seed/lbflag/600/600',
  'Lebanese & Cultural',
  ARRAY['flag', 'lebanon', 'patriot', 'red']
),
(
  'Dabke Vibes',
  'تيبس الدبكة',
  'Celebrate the dance, the energy, the spirit of the dabke in one wrap.',
  'احتفل بالرقصة والطاقة وروح الدبكة في ملصق واحد.',
  5.00,
  'https://picsum.photos/seed/dabke/600/600',
  'Lebanese & Cultural',
  ARRAY['dabke', 'dance', 'culture', 'lebanon']
),

-- Aesthetic & Visual (3)
(
  'Retro Wave Grid',
  'شبكة الموجة الرجعية',
  'Synthwave sunset meets lighter wrap. Pure 80s nostalgia in your pocket.',
  'غروب سينث ويف يلتقي بملصق الولاعة. حنين الثمانينيات في جيبك.',
  5.00,
  'https://picsum.photos/seed/retrowave/600/600',
  'Aesthetic & Visual',
  ARRAY['retro', 'wave', '80s', 'synthwave', 'grid']
),
(
  'Marble Drip',
  'رخام متقطر',
  'Liquid marble swirls in black and white — effortlessly clean aesthetic.',
  'دوامات الرخام السائل بالأبيض والأسود — جمالية نظيفة بلا جهد.',
  5.00,
  'https://picsum.photos/seed/marble/600/600',
  'Aesthetic & Visual',
  ARRAY['marble', 'minimal', 'black', 'white', 'clean']
),
(
  'Geometric Storm',
  'عاصفة هندسية',
  'Sharp lines, bold geometry, controlled chaos on a 3.5cm canvas.',
  'خطوط حادة وهندسة جريئة وفوضى منضبطة على لوحة 3.5 سم.',
  5.00,
  'https://picsum.photos/seed/geometric/600/600',
  'Aesthetic & Visual',
  ARRAY['geometric', 'lines', 'abstract', 'bold']
),

-- Girly & Cute (2)
(
  'Butterfly Garden',
  'حديقة الفراشات',
  'Delicate butterflies in pastel hues — soft energy for a hard lighter.',
  'فراشات رقيقة بألوان باستيل ناعمة — طاقة ناعمة لولاعة قوية.',
  5.00,
  'https://picsum.photos/seed/butterfly/600/600',
  'Girly & Cute',
  ARRAY['butterfly', 'pastel', 'cute', 'floral', 'pink']
),
(
  'Cherry Blossom',
  'أزهار الكرز',
  'Japanese sakura blooms in full spring glory. Delicate and dreamy.',
  'أزهار ساكورا اليابانية في ربيعها الكامل. رقيقة وحالمة.',
  5.00,
  'https://picsum.photos/seed/sakura/600/600',
  'Girly & Cute',
  ARRAY['cherry', 'blossom', 'japan', 'pink', 'spring', 'floral']
),

-- Manly (2)
(
  'Skull & Smoke',
  'جمجمة ودخان',
  'Old school tattoo skull rising through smoke. Zero apologies.',
  'جمجمة وشم كلاسيكية ترتفع خلال الدخان. بدون اعتذارات.',
  5.00,
  'https://picsum.photos/seed/skull/600/600',
  'Manly',
  ARRAY['skull', 'smoke', 'tattoo', 'dark', 'oldschool']
),
(
  'Eagle Strike',
  'ضربة النسر',
  'A sharp-eyed eagle in full strike mode. Power, precision, pride.',
  'نسر حاد البصر في وضع الضربة الكاملة. قوة ودقة وفخر.',
  5.00,
  'https://picsum.photos/seed/eagle/600/600',
  'Manly',
  ARRAY['eagle', 'bird', 'power', 'bold', 'dark']
),

-- Sporty (2)
(
  'Soccer Flames',
  'ألسنة كرة القدم',
  'For the ones who live and die for the beautiful game.',
  'لأولئك الذين يعيشون ويموتون من أجل اللعبة الجميلة.',
  5.00,
  'https://picsum.photos/seed/soccer/600/600',
  'Sporty',
  ARRAY['soccer', 'football', 'sport', 'fire', 'game']
),
(
  'Skate or Burn',
  'تزلج أو احترق',
  'Street skate culture meets lighter art. Drop in and never stop.',
  'ثقافة التزلج في الشوارع تلتقي بفن الولاعة. ابدأ ولا تتوقف أبدًا.',
  5.00,
  'https://picsum.photos/seed/skate/600/600',
  'Sporty',
  ARRAY['skate', 'street', 'sport', 'urban', 'board']
),

-- Personality & Lifestyle (2)
(
  'Coffee & Chaos',
  'قهوة وفوضى',
  'For those who run on caffeine and controlled chaos. You know who you are.',
  'لمن يعيشون على الكافيين والفوضى المنضبطة. أنتم تعرفون من أنتم.',
  5.00,
  'https://picsum.photos/seed/coffee/600/600',
  'Personality & Lifestyle',
  ARRAY['coffee', 'cafe', 'lifestyle', 'mood', 'vibe']
),
(
  'Music Is Life',
  'الموسيقى حياة',
  'Sound waves, vinyl, and headphones. The wrap for those who hear in color.',
  'موجات الصوت والفينيل وسماعات الرأس. الملصق لمن يسمعون بالألوان.',
  5.00,
  'https://picsum.photos/seed/music/600/600',
  'Personality & Lifestyle',
  ARRAY['music', 'sound', 'vinyl', 'headphones', 'beats']
),

-- LGBTQ+ (2)
(
  'Rainbow Fire',
  'نار قوس قزح',
  'Pride colors ignited. Bright, loud, unapologetic — just like you.',
  'ألوان الفخر مشتعلة. مشرقة وصاخبة وبلا اعتذارات — تماماً مثلك.',
  5.00,
  'https://picsum.photos/seed/rainbow/600/600',
  'LGBTQ+',
  ARRAY['rainbow', 'pride', 'lgbtq', 'color', 'fire']
),
(
  'Love Is Love',
  'الحب هو الحب',
  'Simple message. Infinite meaning. Light it with pride.',
  'رسالة بسيطة. معنى لا نهائي. أشعلها بكل فخر.',
  5.00,
  'https://picsum.photos/seed/loveislove/600/600',
  'LGBTQ+',
  ARRAY['love', 'pride', 'lgbtq', 'heart', 'equality']
),

-- Weird & Wild (2)
(
  'Glitch Reality',
  'واقع مشوه',
  'When the simulation breaks. Corrupted pixels, glitched reality, no ctrl+Z.',
  'عندما ينكسر المحاكاة. بكسلات تالفة وواقع مشوه، لا تراجع.',
  5.00,
  'https://picsum.photos/seed/glitch/600/600',
  'Weird & Wild',
  ARRAY['glitch', 'digital', 'pixel', 'weird', 'art', 'vaporwave']
),
(
  'Alien Raver',
  'رافر فضائي',
  'Part alien, part rave creature — 100% unclassifiable. Just how we like it.',
  'نصف كائن فضائي ونصف مخلوق رقص — 100% لا تصنيف له. هكذا نحبه.',
  5.00,
  'https://picsum.photos/seed/alien/600/600',
  'Weird & Wild',
  ARRAY['alien', 'rave', 'weird', 'psychedelic', 'space']
),

-- Custom & Personalized (2)
(
  'Your Name Here',
  'اسمك هنا',
  'Submit your name or phrase and we'll wrap it in fire. Fully personalized.',
  'أرسل اسمك أو عبارتك وسنلفها بالنار. مخصص بالكامل لك.',
  5.00,
  'https://picsum.photos/seed/customname/600/600',
  'Custom & Personalized',
  ARRAY['custom', 'name', 'personal', 'text', 'bespoke']
),
(
  'Your Design',
  'تصميمك أنت',
  'Send us your art, logo, or photo. We'll put it on a lighter wrap — literally anything.',
  'أرسل لنا فنك أو شعارك أو صورتك. سنضعه على ملصق ولاعة — حرفياً أي شيء.',
  5.00,
  'https://picsum.photos/seed/customdesign/600/600',
  'Custom & Personalized',
  ARRAY['custom', 'design', 'logo', 'art', 'upload', 'bespoke']
);
