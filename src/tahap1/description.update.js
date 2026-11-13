import axios from "axios";
import fs from 'node:fs/promises'


const ambilMetaDesc = async (url) => {
    try {
        //cek link
        const {data} = await axios.get(url)

        //ambil caracter <meta >
        const description = data.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']>/i)?.[1]

        // console.log(newData)

        return description || null
    } catch (error) {
        console.error(error)
    }
}

const updateValue = async () => {
    try {
        //cek file di folder hasil
        const file = await fs.readdir('./hasil')

        const parseFile = file.filter((item) => {
            //pilih file berakhiran .json
            return item.endsWith('.json')
        })

        // console.log(parseFile)

        for(let i = 0; i < parseFile.length; i++){
            // console.log(`index ke ${i} : ${parseFile[i]}`)
            const filePath = `./hasil/${parseFile[i]}`
            console.log(filePath)

            const data = JSON.parse(await fs.readFile(`${filePath}`, 'utf8'))
            // console.log(data.length)

            for(let indexData = 0; indexData < data.length; indexData++)
            
                if(data[indexData].description === undefined){
                data[indexData].description = await ambilMetaDesc(data[indexData].loc)

                console.log(data[indexData])
            }  
            
            
            await fs.writeFile(filePath, JSON.stringify(data, null, 3))
            console.log(`Berhasil update: ${filePath}`);
        }

    } catch (error) {
        console.error(error)
    }
}

updateValue()