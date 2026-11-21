import db from '../config/db.js';

try {
    const [rows] = await db.execute('SELECT 1 AS status');

    console.log('Koneksi database berhasil!');
    console.log(rows);

} catch (error) {
    console.error('Database error:', error.message);

} finally {
    await db.end();
}
