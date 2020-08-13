const axios = require('axios');
const { stringify } = require('querystring');
const { writeFile } = require('fs/promises');
const { stdin, stdout, exit } = require('process');
const chreeio = require('cheerio');

const moment = require('moment');

const readline = require('readline').createInterface({
    input : stdin,
    output : stdout
});

moment.locale('zh-cn');

let filename = './output/' + moment().format('YYYY-MM-DD_HH.mm.ss');

const api = 'http://icp.chinaz.com/Home/PageData';
const all = [];

const getLine = ask => new Promise(async resolve => {
    readline.question(ask, str => resolve(str));
});

const fetchPage = (page_no, c_name) => new Promise(async resolve => {
    try{
        const { data } = await axios.post(api, stringify({
            Kw : c_name,
            pageNo : page_no,
            pageSize : 10
        }));
        data['data'].forEach(i => {
            all.push(i['host']);
        });
        console.log(`查询结果：第${page_no}页：`);
        console.log(data['data']);
        const now_num_max = page_no * 10;
        setTimeout(() => {
            if(now_num_max >= data['amount']){
                resolve(true);
            }else{
                resolve(false);
            }
        }, 1000);
    }catch(e){
        console.log(e);
    }
});

(async function run(){
    const company_name = await getLine('请输入公司名：');
    filename += '_' + company_name + '.txt';

    const r = async index => {
        const over = await fetchPage(index , company_name);
        if(over){
            console.log('结果已输出到：' + filename);
            try{
                await writeFile(filename, all.join('\n'), {encoding : 'utf-8', flag : 'w'});
            }catch(e){
                console.log(e);
            }
        }else{
            await r(index + 1);
        }
    }
    await r(1);
    exit();
})();
