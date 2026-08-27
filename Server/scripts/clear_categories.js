const db = require('../config/db');

const clearCategoriesTable = async () => {
  try {
    console.log("Connecting and safely clearing categories table with foreign key check disabled...");
    
    // Check current count
    const [beforeRows] = await db.promise().query('SELECT COUNT(*) AS total FROM categories');
    console.log(`Found ${beforeRows[0].total} rows before deletion.`);

    // Disable foreign key checks for table truncate/delete
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Nullify or keep product category_id references safe, and delete categories
    const [result] = await db.promise().query('DELETE FROM categories');
    console.log(`Successfully deleted ${result.affectedRows} row(s) from categories table.`);

    // Re-enable foreign key checks
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');

    // Check count after deletion
    const [afterRows] = await db.promise().query('SELECT COUNT(*) AS total FROM categories');
    console.log(`Current row count in categories table: ${afterRows[0].total}`);

    process.exit(0);
  } catch (error) {
    // Ensure foreign key checks are re-enabled in case of error
    try { await db.promise().query('SET FOREIGN_KEY_CHECKS = 1'); } catch (e) {}
    console.error('Error clearing categories table:', error);
    process.exit(1);
  }
};

clearCategoriesTable();
