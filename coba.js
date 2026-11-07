import axios from "axios";

import fs from 'fs'

const ambilValue = (xml, tag ) => {

    // if(tag === 'news:publication') {
    //     const publication = new RegExp(`<${tag}>\\s*<news:name>(.*?)<\\/news:name>\\s*<news:language>(.*?)<\\/news:language>\\s*<\\/${tag}>`, 'gs')
       
       
    //     const daftarIsi = [...xml.matchAll(publication)].map(item => ({
    //         name: item[1],
    //         language: item[2]
    //     }))
    //     console.log(daftarIsi)
    // }

    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)
    
    return xml.match(regex)?.[1]
                ?.replace(/<!\[CDATA\[|\]\]>/g, '')
                ?.replace(/&lt;!\[CDATA\[/g, '')
                ?.replace(/\]\]&gt;/g, '')
                ?.trim()
                .replace(/\s+/g, " ") || null;
                
}




const fetchData = async () => {
    try {
        //ambil data
        const {data} = await axios.get(`https://www.liputan6.com/sitemap.xml`)

        if(!data) throw new Error('Data tidak ditemukan')
        
        const dataBaru = [...data.matchAll(/<sitemap>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s+<\/sitemap>/gs)]
                            .map((item) => {
                                return {
                                    loc: item[1],
                                }
                            })

                    
        // console.log(dataBaru)
        
        const dataBaru2 = await dataBaru.reduce(
            async (nilaiAwal, nilaiSekarang, index) => {
                const nilai = await nilaiAwal

                const namaFile = []
                namaFile.push(nilaiSekarang.loc)
                // console.log(namaFile)

                //nilaiSekarang adalah kumpulan link yang berhasil diperoleh
                const {data} = await axios.get(nilaiSekarang.loc)
                // console.log(data)

                const newData = [...data.matchAll(/<url>(.*?)<\/url>/gs)]
                                    .map(item => {
                                        const xml = item[1]
                                        
                                        return {
                                            loc: ambilValue(xml, 'loc'),
                                            lastmod: ambilValue(xml, 'lastmod'),
                                            image: ambilValue(xml, 'image:loc'),
                                            news: ambilValue(xml, 'news:news') ? {
                                                publication : { 
                                                    name : ambilValue(xml, 'news:name'),
                                                    language: ambilValue(xml, 'news:language')
                                                },
                                                publication_date: ambilValue(xml, 'news:publication_date'),
                                                title: ambilValue(xml, 'news:title')
                                                
                                            } : null
                                        }
                                    })
                // console.dir(newData, {depth: null})
                
                const hasilTotal = [
                    ...nilai,
                    ...newData
                ]
                console.dir(hasilTotal, {depth: null})
                return hasilTotal
        }, [])  

        // console.log(dataBaru2)
 
    }catch (error) {
        throw new Error(error.message)
    }

}
fetchData()
