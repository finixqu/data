
import axios from "axios";
import fs from "node:fs/promises";

// Mengambil value dari XML
const ambilValue = (xml, tag) => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);

    return xml.match(regex)?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, "")
        ?.replace(/&lt;!\[CDATA\[/g, "")
        ?.replace(/\]\]&gt;/g, "")
        ?.trim()
        ?.replace(/\s+/g, " ");
};

// Mengambil meta description
const ambilMetaDesc = async (url) => {
    try {
        const { data } = await axios.get(url);

        const description = data.match(
            /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
        )?.[1];

        return description || null;

    } catch (error) {
        console.error(`Gagal mengambil description: ${url}`);
        return null;
    }
};

// Function utama
const ambilData = async () => {
    try {
    
        // Ambil sitemap utama
        const { data } = await axios.get(
            "https://www.liputan6.com/sitemap.xml"
        );

        const dataBaru = [...data.matchAll(
            /<sitemap>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<\/sitemap>/gs
        )].map(item => ({
            loc: item[1]
        }));

        // Proses setiap sitemap
        for (const link of dataBaru) {

            const namaFile = new URL(link.loc).pathname
                .replace(/^\/|\.xml$/g, "")
                .replace(/[/-]/g, "_");

            const filePath = `./hasil/${namaFile}.json`;

            // Cek apakah file sudah ada dan berisi data
            let fileAda = false;

            try {
                const isiFile = await fs.readFile(filePath, "utf8");

                if (isiFile.trim()) {
                    const dataLama = JSON.parse(isiFile);

                    if (Array.isArray(dataLama) && dataLama.length > 0) {
                        fileAda = true;
                    }
                    throw new Error('file belum ada')
                }
            } catch (error) {
                // File belum ada atau JSON tidak valid
                console.error()
            }

            // Jika file sudah ada dan berisi data, lewati
            if (fileAda) {
                console.log(`Lewati: ${filePath}`);
                continue;
            }

            console.log(`Mengambil sitemap: ${link.loc}`);

            const { data } = await axios.get(link.loc);

            const dataParse = [...data.matchAll(
                /<url>(.*?)<\/url>/gs
            )];

            const newDataParse = dataParse.map(item => {
                const dataHasil = item[1];

                return {
                    loc: ambilValue(dataHasil, "loc"),
                    lastmod: ambilValue(dataHasil, "lastmod"),
                    image: ambilValue(dataHasil, "image:loc"),

                    news: ambilValue(dataHasil, "news:news") ? {
                        publication: {
                            name: ambilValue(dataHasil, "news:name"),
                            language: ambilValue(dataHasil, "news:language")
                        },
                        publication_date: ambilValue(dataHasil, "news:publication_date"),
                        title: ambilValue(dataHasil, "news:title")
                    } : null
                };
            });

            // Simpan file baru
            await fs.writeFile(
                filePath,
                JSON.stringify(newDataParse, null, 3)
            );

            console.log(`Berhasil membuat: ${filePath}`);
        }

//tambah description

        console.log("\nMulai update description...");

        const files = await fs.readdir("./hasil");

        const parseFile = files.filter(item =>
            item.endsWith(".json")
        );

        for (const file of parseFile) {

            const filePath = `./hasil/${file}`;

            const data = JSON.parse(
                await fs.readFile(filePath, "utf8")
            );

            for (let i = 0; i < data.length; i++) {

                // Jika description belum ada
                if (data[i].description === undefined) {

                    data[i].description = await ambilMetaDesc(
                        data[i].loc
                    );

                    console.log(
                        `Update description: ${data[i].loc}`
                    );
                }
            }

            // Simpan kembali file
            await fs.writeFile(
                filePath,
                JSON.stringify(data, null, 3)
            );

            console.log(`Berhasil update: ${filePath}`);
        }

        console.log("\nSemua proses selesai!");

    } catch (error) {
        console.error(error);
    }
};

ambilData();
