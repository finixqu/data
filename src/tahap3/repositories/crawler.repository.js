import db from '../config/db.js';

const saveArtikel = async (table, data) => {

    // Validasi nama tabel untuk mencegah SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        throw new Error('Nama tabel tidak valid');
    }

    const sql = `
        INSERT INTO ${table} (
            sitemap_loc,
            sitemap_lastmod,
            loc,
            lastmod,
            image,
            publication_name,
            publication_language,
            publication_date,
            title,
            keywords,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            sitemap_loc = VALUES(sitemap_loc),
            sitemap_lastmod = VALUES(sitemap_lastmod),
            lastmod = VALUES(lastmod),
            image = VALUES(image),
            publication_name = VALUES(publication_name),
            publication_language = VALUES(publication_language),
            publication_date = VALUES(publication_date),
            title = VALUES(title),
            keywords = VALUES(keywords),
            description = VALUES(description)
    `;

    const values = [
        data.sitemap_loc,
        data.sitemap_lastmod,
        data.loc,
        data.lastmod,
        data.image,
        data.news?.publication?.name ?? null,
        data.news?.publication?.language ?? null,
        data.news?.publication_date ?? null,
        data.news?.title ?? null,
        JSON.stringify(data.news?.keywords ?? []),
        data.description ?? null
    ];

    const [result] = await db.execute(sql, values);

    return result;
};


const getArtikel = async (table) => {

    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
        throw new Error('Nama tabel tidak valid');
    }

    const sql = `
        SELECT *
        FROM ${table}
        ORDER BY id DESC
    `;

    const [rows] = await db.execute(sql);
    return rows
}



export default {
    saveArtikel,
    getArtikel
};

