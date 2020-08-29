const { writeFile, readdir } = require('fs/promises');
const moment = require('moment');

const selector = process.argv[2];

const filename = `./output/oneforall/all/${moment().format('YYYY-MM-DD_HH.mm.ss')}.txt`;
const path = './oneforall-results/';

const dict = [];

(async function(){
    const files = await readdir(path);
    for(let i of files){
        let flag = false;
        const json = require(path + i);
        const temp = [];
        json.map( e => {
            temp.push(e.subdomain);
            if(e.subdomain === selector){
                flag = true;
            }
        });
        if(flag){
            await writeFile(filename, temp.join('\n'), { encoding: 'utf-8', flag: 'w' });
            break;
        }
    }
})();