const { writeFile } = require('fs/promises');
const moment = require('moment');

moment.locale('zh-cn');

const path = __dirname;
const name = process.argv[2];

const json = require(path + '/' + name);

const filename = `./output/oneforall/${moment().format('YYYY-MM-DD_HH.mm.ss')}.txt`;

let dict = '';

json.map( e => {
    dict += e.subdomain + '\n';
});

(async function(){
    await writeFile(filename, dict, { encoding: 'utf-8', flag: 'w' });
})();