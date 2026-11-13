import axios from "axios";
import fs from 'node:fs/promises'



const ambilValue = (xml, tag) => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)

    return xml.match(regex)?.[1]
            ?.replace(/<!\[CDATA\[|\]\]>/g, '')
            ?.replace(/&lt;!\[CDATA\[/g, '')
            ?.replace(/\]\]&gt;/g, '')
            ?.trim()
            ?.replace(/\s+/g, " ")
}



const ambilData = async () => {
    try {
        const {data} = await axios.get (`https://www.liputan6.com/sitemap.xml`)

        const dataBaru = [...data.matchAll(/<sitemap>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<\/sitemap>/gs)]
                            ?.map(item => ({
                                loc: item[1],
                            }))
        
        // console.log(dataBaru)

        for(const link of dataBaru){
            // console.log(link.loc)
            const namaFile = link.loc.replace(/^https:\/\/www\.liputan6\.com\/|\.xml$/g, "")
                                ?.replace(/\//g, "_")
            // console.log(namaFile, `Nama File: ${namaFile}.json`)

            const {data} = await axios.get(link.loc)

            const dataParse = [...data.matchAll(/<url>(.*?)<\/url>/gs)]

            const newaDataParse = dataParse.map( 
                (item) => {
                    const dataHasil = item[1]

                    const link = ambilValue(dataHasil, 'loc')

                    return{
                        loc: ambilValue(dataHasil, 'loc'),
                        lastmod: ambilValue(dataHasil, 'lastmod'),
                        image: ambilValue(dataHasil, 'image:loc'),
                        // description: description,
                        news: ambilValue(dataHasil, 'news:news') ? {
                            publication : { 
                                name : ambilValue(dataHasil, 'news:name'),
                                language: ambilValue(dataHasil, 'news:language')
                            },
                            publication_date: ambilValue(dataHasil, 'news:publication_date'),
                            title: ambilValue(dataHasil, 'news:title')
                            
                        } : null
                    }
                })
                            
            console.dir( newaDataParse, {depth: null})

            // await fs.writeFile(`hasil/${namaFile}.json`, JSON.stringify(dataParse, null, 2) )
        }
    } catch (error) {
        console.error(error)
    }
}
ambilData()