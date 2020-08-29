const { writeFile, readdir } = require('fs/promises');

const filename = `./output/oneforall-linux-command/run.sh`;

(async function(){
    //读取目录下所有文件
    const dir = '../../topdomain/';
    const command = [];
    const data = await readdir(dir, { encoding: 'utf-8' });
    data.forEach(s => {
        command.push(`python3 oneforall.py --target ./topdomain/${s} --format json --path ./subdomain/ run\nmv ./results ./all_results/${s.substring(20, s.length - 4)}`);
    });
    await writeFile(filename, command.join('\n'), { encoding: 'utf-8' });
})();