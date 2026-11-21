// https://www.liputan6.com/sitemap.xml
import crawler from "./crawler.js";

import axios from "axios";

const crawlLiputan6 = () => {
    return crawler.ambilData("liputan6", "https://www.liputan6.com/sitemap.xml")
}

crawlLiputan6()
export default crawlLiputan6;


// const crawlLiputan6 = async () => {
//     const sitemapUrl = "https://www.liputan6.com/sitemap.xml";

//     try {
//         const response = await axios.get(sitemapUrl, {
//             timeout: 15000
//         });

//         const xml = response.data;

//         // Identifikasi sitemap parent
//         const isParent = /<sitemapindex[\s>]/i.test(xml);

//         // Ekstraksi URL dari tag loc
//         const urls = [
//             ...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)
//         ].map(match => match[1]);

//         return {
//             website: "Liputan6",
//             type: isParent ? "parent" : "child",
//             total: urls.length,
//             urls
//         };

//     } catch (error) {
//         return {
//             website: "Liputan6",
//             error: error.message,
//             urls: []
//         };
//     }
// };
