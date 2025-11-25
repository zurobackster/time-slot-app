import { getDatabase, closeDatabase } from './database.js';

const defaultCategories = [
  { name: 'Work', color: '#3b82f6' },        // Blue
  { name: 'Personal', color: '#8b5cf6' },    // Violet
  { name: 'Health', color: '#10b981' },      // Emerald
  { name: 'Learning', color: '#f59e0b' },    // Amber
  { name: 'Exercise', color: '#14b8a6' },    // Teal
  { name: 'Social', color: '#ec4899' },      // Pink
  { name: 'Hobbies', color: '#f97316' },     // Orange
  { name: 'Chores', color: '#84cc16' },      // Lime
];

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    const db = await getDatabase();

    // Check if categories already exist
    const existingCount = await db.get('SELECT COUNT(*) as count FROM categories');

    if (existingCount.count > 0) {
      console.log('Categories already exist. Skipping seed.');
      return;
    }

    // Insert default categories
    const stmt = await db.prepare(
      'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)'
    );

    for (const category of defaultCategories) {
      await stmt.run(category.name, category.color, 1); // user_id = 1 for MVP
    }

    await stmt.finalize();

    console.log(`Seeded ${defaultCategories.length} default categories:`);
    defaultCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.color})`));

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
