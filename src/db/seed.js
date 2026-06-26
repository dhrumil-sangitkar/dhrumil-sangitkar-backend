const { query } = require('../config/db');

const DEFAULT_SERVICES = [
  { icon: 'fa-hands-praying',  name: 'Prabhu Bhakti',        gujarati: 'પ્રભુ ભક્તિ',        description: "Divine Lord Adoration. Elevating devotional bhajan, stavan, and kirtan evenings sung live with captivating synthesizer instrumentals to move every devotee's heart.", sort_order: 1 },
  { icon: 'fa-dharmachakra',   name: 'Guru Bhakti',          gujarati: 'ગુરુ ભક્તિ',          description: 'Spiritual Master Veneration. Deeply respectful musical programs dedicated to thanking, honoring, and commemorating Jain spiritual leaders.', sort_order: 2 },
  { icon: 'fa-heart',          name: 'Diksha Mahotsav',      gujarati: 'દિક્ષા મહોત્સવ',      description: 'Renunciation Ceremony Celebration. Providing majestic, grand traditional soundtracks for those committing their life to ascetism.', sort_order: 3 },
  { icon: 'fa-sun',            name: 'Tap Vandana',          gujarati: 'તપ વંદના',            description: 'Celebrating and validating the power of physical penance and fasts, with soul-strengthening chants, stotra rhythms, and spiritual praises.', sort_order: 4 },
  { icon: 'fa-water',          name: 'Snatra Mahotsav',      gujarati: 'સ્નાત્ર મહોત્સવ',      description: 'Holy Bathing Ceremony Orchestration. Authentic rhythms and continuous Sanskrit & Prakrit chanting to synchronize perfectly with ritual practices.', sort_order: 5 },
  { icon: 'fa-dove',           name: 'Shradhanjali',         gujarati: 'શ્રદ્ધાંજલિ',         description: 'Prayer & Remembrance Tributes. Peaceful, calming acoustic sets and respectful stavan melodies to help families remember their beloved passed ones.', sort_order: 6 },
  { icon: 'fa-leaf',           name: 'Jain Pooja (Pujan)',   gujarati: 'જૈન પૂજા - પૂજન',   description: 'Sacred Ritual Music. Custom orchestrations, stotras, and classical ragas tailored beautifully for complex Jain rituals, Pujas, and vidhis.', sort_order: 7 },
  { icon: 'fa-users',          name: 'Matru-Pitru Vandana',  gujarati: 'માતૃ-પિતૃ વંદના',  description: 'Parental Reverence. Emotionally moving stavan performances celebrating parental love, respect, values, and strong family legacies.', sort_order: 8 },
  { icon: 'fa-crown',          name: 'Shakrastav Abhishek',  gujarati: 'શક્રસ્તવ અભિષેક',  description: 'Sacred Bathing Chants. Powerfully synchronized live audio-visual stotras, mantras, and devotional high-energy singing for the divine Abhishek ritual.', sort_order: 9 },
  { icon: 'fa-mountain',       name: 'Shetrunjay Bhav Yatra',gujarati: 'શેત્રુંજય ભાવ યાત્રા', description: 'Sacred Pilgrimage Musical Journey. Devotional compositions and spiritual chants celebrating the divine journey to Shetrunjay.', sort_order: 10 },
  { icon: 'fa-star',           name: 'Other Religious Programs', gujarati: 'અન્ય ધાર્મિક પ્રોગ્રામ', description: 'Custom Celebrations. Tailor-made classical, semi-classical, stavan sandhyas, and customized Jain music sequences for any local or national holy events.', sort_order: 11 },
];

const DEFAULT_MEDIA = [
  {
    title: 'Live Bhakti Sandhya Highlights',
    gujarati_title: 'લાઇવ ભક્તિ સંધ્યા',
    type: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/YpXqN_z1iQY',
    images: [],
    description: 'Experiencing serene divine vibrations with beautiful Jain stavans.',
    category: 'Video',
  },
  {
    title: 'Traditional Snatra Puja',
    gujarati_title: 'સ્નાત્ર મહોત્સવ સંગીત',
    type: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/YpXqN_z1iQY',
    images: [],
    description: 'Live devotional orchestration during sacred bathing ceremony.',
    category: 'Video',
  },
  {
    title: 'Golden Harmonium & Vocals',
    gujarati_title: 'મધુર હાર્મોનિયમ સૂર',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop',
    images: [],
    description: 'Spiritual practice session getting ready for the next Diksha Mahotsav.',
    category: 'Image',
  },
];

async function seedDatabase() {
  console.log('🌱 Seeding default data...');

  // Seed services only if empty
  const { rows: existingServices } = await query('SELECT COUNT(*) FROM services');
  if (parseInt(existingServices[0].count) === 0) {
    for (const svc of DEFAULT_SERVICES) {
      await query(
        `INSERT INTO services (icon, name, gujarati, description, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [svc.icon, svc.name, svc.gujarati, svc.description, svc.sort_order]
      );
    }
    console.log(`  ✅ Seeded ${DEFAULT_SERVICES.length} default services`);
  } else {
    console.log('  ℹ️  Services already populated — skipping seed');
  }

  // Seed media only if empty
  const { rows: existingMedia } = await query('SELECT COUNT(*) FROM media_gallery');
  if (parseInt(existingMedia[0].count) === 0) {
    for (const media of DEFAULT_MEDIA) {
      await query(
        `INSERT INTO media_gallery (title, gujarati_title, type, url, images, description, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [media.title, media.gujarati_title, media.type, media.url, media.images, media.description, media.category]
      );
    }
    console.log(`  ✅ Seeded ${DEFAULT_MEDIA.length} default media items`);
  } else {
    console.log('  ℹ️  Media already populated — skipping seed');
  }

  console.log('✅ Seeding complete.\n');
}

module.exports = { seedDatabase };
