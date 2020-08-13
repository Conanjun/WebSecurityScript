/**
 * Yeuoly.Works
 */

const superagent = require('superagent');
const { writeFile } = require('fs/promises');
const { stdin, stdout, exit, domain } = require('process');
const { JSDOM } = require('jsdom');
const moment = require('moment');

const readline = require('readline').createInterface({
    input : stdin,
    output : stdout
});

moment.locale('zh-cn');

let filename = './output/tianyancha' + moment().format('YYYY-MM-DD_HH.mm.ss');
let cookie = '';

const api = 'https://beian.tianyancha.com/search/';
const all = [];

const getLine = ask => new Promise(async resolve => {
    readline.question(ask, str => resolve(str));
});

const fetchPage = (page_no, c_name) => new Promise(async resolve => {
    try{
        const { text: data } = await superagent.get(api + encodeURI(c_name) + '/p' + page_no)
            .set('Cookie', cookie);
        const cur = [];
        const { window } = new JSDOM(data);
        const $ = require('jquery')(window);
        $('.ranking-content>table>tbody>tr').each(function(i, t){
            const domain = $(this).find('td>.ranking-ym').text().trim();
            cur.push(domain);
            all.push(domain);
        });
        const tot = parseInt($('#search>.ranking-header>.beian-name').text().trim());
        console.log(`查询结果：第${page_no}页：`);
        console.log(cur);
        const now_num_max = page_no * 20;
        setTimeout(() => {
            if(now_num_max >= tot){
                resolve(true);
            }else{
                resolve(false);
            }
        }, 1000);
    }catch(e){
        console.log(e);
    }
});

(async function(){
    cookie = await getLine('请输入cookie：');
    (async function run(){
        let company_name = await getLine('请输入公司名：');
        const _filename =  filename + '_' + company_name + '.txt';
    
        const r = async index => {
            const over = await fetchPage(index , company_name);
            if(over){
                console.log('结果已输出到：' + _filename);
                try{
                    await writeFile(_filename, all.join('\n'), {encoding : 'utf-8', flag : 'w'});
                }catch(e){
                    console.log(e);
                }
            }else{
                await r(index + 1);
            }
        }
        await r(1);
        await run();
    })();
})();


