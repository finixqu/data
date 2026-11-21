// https://www.cnnindonesia.com/sitemap.xml
import crawler from "./crawler.js";

import axios from "axios";

const crawlCnnIndonesia = () => {
    return crawler.ambilData("cnn_indonesia", "https://www.cnnindonesia.com/sitemap.xml")
}

crawlCnnIndonesia()
export default crawlCnnIndonesia;
