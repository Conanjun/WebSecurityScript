const superagent = require('superagent');
const axios = require('axios');
const { writeFile } = require('fs/promises');
const { stdin, stdout, exit, domain } = require('process');
const { JSDOM } = require('jsdom');
const moment = require('moment');

const readline = require('readline').createInterface({
    input : stdin,
    output : stdout
});

console.log('\033[31m 注意!!!!: \033[0m 欢迎使用YeuolyWorks主域名爬取工具，工具使用了站长之家、安全客、天眼查等网站的功能进行爬取，爬取过程中每次爬取有1s-1.5s间隔用于防止IP被封，若有需要可以自行修改，有时出现爬取失败' + 
    '为正常现象，短暂间隔后会进行第二轮查询。最开始所询问的COOKIE为天眼查登录后的的COOKIE，若选择空置COOKIE，则最多爬取一个公司旗下的100条域名。');

moment.locale('zh-cn');

let filename = './output/tianyancha/' + moment().format('YYYY-MM-DD_HH.mm.ss');
let cookie = '';

const api = 'https://beian.tianyancha.com/search/';
const src_api = 'https://www.anquanke.com/src';
const chinaz_api = 'https://icp.chinaz.com/';
let all = [];

const getLine = ask => new Promise(async resolve => {
    readline.question(ask, str => resolve(str));
});

const sleep = timeout => new Promise(async resolve => {
    setTimeout(() => { resolve() }, timeout);
});

const console_green = v => {
    console.log('\033[32m ' + v + ' \033[0m');
}

const console_red = v => {
    console.log('\033[31m ' + v + ' \033[0m');
}

const parseDomain = str => {
    if (!str) return '';
    if (str.indexOf('://') != -1) str = str.substr(str.indexOf('://') + 3);
    var topLevel = ['com', 'net', 'org', 'gov', 'edu', 'mil', 'biz', 'name', 'info', 'mobi', 'pro', 'travel', 'museum', 'int', 'areo', 'post', 'rec'];
    var domains = str.split('.');
    if (domains.length <= 1) return str;
    if (!isNaN(domains[domains.length - 1])) return str;
    var i = 0;
    while (i < topLevel.length && topLevel[i] != domains[domains.length - 1]) i++;
    if (i != topLevel.length) return domains[domains.length - 2] + '.' + domains[domains.length - 1];
    else {
        i = 0;
        while (i < topLevel.length && topLevel[i] != domains[domains.length - 2]) i++;
        if (i == topLevel.length) return domains[domains.length - 2] + '.' + domains[domains.length - 1];
        else return domains[domains.length - 3] + '.' + domains[domains.length - 2] + '.' + domains[domains.length - 1];
    }
};

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

const getSrcsCompanyName = () => new Promise(async resolve => {
    console.log('开始查询src……');
    const c_names = [];
    const { data } = await axios.get(src_api);
    const { window } = new JSDOM(data);
    const $ = require('jquery')(window);
    const src_href = $('.src>.src-list>.row>div').map(function(i,t){ return $(this).find('a')[0].href; });
    for(let i = 0; i < src_href.length; i++){
        const anquanke_href = 'https://www.anquanke.com' + src_href[i];
        console_green(`抓取到src：${anquanke_href}`);
        console.log('开始解析src域名及公司');
        const { data: _data } = await axios.get(anquanke_href);
        const { window: _window } = new JSDOM(_data);
        const _$ = require('jquery')(_window);
        const url = _$('main>div>.meta-box>.src-detail-content>.src-desc>h3>a')[0].href;
        let domain;
        try{
            domain = parseDomain((new URL(url)).hostname);
        }catch(e){
            console_red('该SRC暂未开放');
            continue;
        }
        console_green(`解析到域名：${domain}`);
        console.log('正在获取公司名……');
        let _1 = null;
        while(true){
            try{
                const r = await axios.get(chinaz_api + domain);
                _1 = r.data;
                break;
            }catch(e){
                console_red('获取失败，尝试重新获取中……');
                await sleep(1000);
            }
        }
        const { window: _2 } = new JSDOM(_1);
        const _$1 = require('jquery')(_2);
        try{
            const c_name = _$1('.pr>.mt10>.pr>ul>li>p>a')[0].innerHTML;
            console_green(`获取到公司名：${c_name}`);
            c_names.push(c_name);
        }catch(e){
            console_red('获取失败，该域名可能没有备案');
        }
        console.log(`剩余SRC个数：${src_href.length - i - 1}`);
        await sleep(1500);
    }
    resolve(c_names);
});

(async function(){
    cookie = await getLine('请输入cookie：');
    //获取src
    const c_names = await getSrcsCompanyName();
    for(let i = 0; i < c_names.length; i++){
        const _filename = filename + '_' + c_names[i] + '.txt';
        all = [];
        const r = async index => {
            const over = await fetchPage(index , c_names[i]);
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
        console.log(`剩余SRC个数：${c_names.length - i - 1}`);
    }

    console.log('运行完毕');
    process.exit();
})();