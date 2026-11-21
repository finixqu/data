// https://www.kompas.com/sitemap.xml
import crawler from "./crawler.js";

import axios from "axios";

const crawlKompas = () => {
    return crawler.ambilData("kompas", "https://www.kompas.com/sitemap.xml")
}

crawlKompas()
export default crawlKompas;
