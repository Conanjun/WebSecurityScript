const { readFile, writeFile } = require('fs/promises');
const moment = require('moment');

moment.locale('zh-cn');

const path = __dirname;
const name = process.argv[2];

const filename = `./output/teemo-linux-command/${moment().format('YYYY-MM-DD_HH.mm.ss')}.sh`;

(async function(){
    const file = await readFile(path + '/' + name, { encoding: 'utf-8' });
    const domains = file.split(/[\r\n]/g);
    const commands = [];
    domains.forEach(d => {
        commands.push('python teemo.py -d ' + d + ' -b');
    });
    await writeFile(filename, commands.join('\n'), { encoding: 'utf-8', flag: 'w' });
})();