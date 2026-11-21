import axios from "axios";
import fs from "node:fs/promises";
import path from 'node:path';


import crawlerRepository from './repositories/crawler.repository.js'

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
const ambilData = async (name, url) => {

    console.log(`--- Memulai scraping: ${name}`);
    console.log(`URL: ${url}`);
    console.log('-------');


    
    console.log(name, url)
    if (!url) {
        throw new Error("URL tidak ditemukan dalam XML");
    }


    try {
        const result = './result'
        const folder = `${result}/${name}`

        // Buat folder result jika belum ada
        await fs.mkdir(result, { recursive: true });

        // Buat folder folder jika belum ada
        await fs.mkdir(folder, { recursive: true });

        
        // Ambil sitemap utama
        const { data } = await axios.get(url);

        const dataBaru = [...data.matchAll(

            /<sitemap>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<\/sitemap>/gs
        )].map(item => ({
            loc: item[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
            lastmod: item[2].replace(/<!\[CDATA\[|\]\]>/g, "").trim()
        }));

        // console.log(dataBaru)

        // Proses setiap sitemap
        for (const link of dataBaru) {
            // console.log(link.loc)
            let url_sitemap = link.loc
            const dateLastmod = new Date(link.lastmod)
            const dateLastParse = dateLastmod.toISOString().slice(0, 19).replace('T', ' ')

            // console.log(url_sitemap)

            const namaFile = new URL(url_sitemap).pathname
                .replace(/^\/|\.xml$/g, "")
                .replace(/[/-]/g, "_");

            const filePath = `${folder}/${namaFile}.json`;

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

            //jika file belum ada, request dan buat data
            // console.log(`Mengambil sitemap: ${link.loc}`);

            
            const { data } = await axios.get(link.loc);

            const dataParse = [...data.matchAll(
                /<url>(.*?)<\/url>/gs
            )];

            const newDataParse = dataParse.map(item => {
                const dataHasil = item[1];
                
                const myDate = (value) => {
                    if (!value) return null;

                    const date = new Date(value);

                    if (isNaN(date.getTime())) {
                        return null;
                    }

                    return date.toISOString()
                        .slice(0, 19)
                        .replace('T', ' ');
                };

                return {
                        sitemap_loc : url_sitemap,
                        sitemap_lastmod: dateLastParse,
                        loc: ambilValue(dataHasil, "loc") || null,
                        lastmod: myDate(ambilValue(dataHasil, "lastmod")) || null,
                        image: ambilValue(dataHasil, "image:loc") || null,

                        news: ambilValue(dataHasil, "news:news") ? {
                            publication: {
                                name: ambilValue(dataHasil, "news:name") || null,
                                language: ambilValue(dataHasil, "news:language") || null
                            },
                            publication_date: myDate(ambilValue(dataHasil, "news:publication_date")) || null,
                            title: ambilValue(dataHasil, "news:title") || null,
                            keywords: ambilValue(dataHasil, 'news:keywords') ?.split(',').map(item => item.trim()) || null
                        } : null,
                };
            });

            for (const file of newDataParse){
                
                if( !file.description){
                    const description = await ambilMetaDesc(file.loc)

                    file.description = description
                    console.log(file)
                }
                                
                const createData = await crawlerRepository.saveArtikel(name, file)
            }

            await fs.writeFile(`${filePath}`, JSON.stringify(newDataParse, null, 3))
            // console.log(filePath)
        }
    } catch (error) {
        console.error(error);
    }
};

export default {ambilData}