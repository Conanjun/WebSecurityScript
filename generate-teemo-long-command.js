const { readFile } = require('fs/promises');
const moment = require('moment');

moment.locale('zh-cn');

const path = __dirname;
const name = process.argv[2];

(async function(){
    let command = '';
    const file = await readFile(path + '/' + name, { encoding: 'utf-8' });
    const domains = file.split(/[\r\n]/g);
    const commands = [];
    domains.forEach(d => {
        commands.push('python teemo.py -d ' + d + ' -b');
    });
    console.log(commands.join(' && '));
})();