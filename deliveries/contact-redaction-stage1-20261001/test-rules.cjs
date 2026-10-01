const assert=require('assert/strict'),fs=require('fs');const {mask}=require('./assets/contact-rules.js');
const cases=[
 ['Обычный текст','Спасибо! Продолжим после 18:00.','Спасибо! Продолжим после 18:00.'],
 ['Короткий контакт','tester@example.test','[контакт скрыт]'],
 ['E-mail внутри текста','Напишите tester@example.test завтра.','Напишите [контакт скрыт] завтра.'],
 ['E-mail с поддоменами','До: a@sub.mail.example.test; после','До: [контакт скрыт]; после'],
 ['E-mail с пробелами','До: test @ example . test; после','До: [контакт скрыт]; после'],
 ['E-mail at/dot','До: test [at] example [dot] test; после','До: [контакт скрыт]; после'],
 ['Телефон','Звоните +1 202 555 0147 вечером.','Звоните [контакт скрыт] вечером.'],
 ['Телефон со скобками','До +1 (202) 555-0147 после','До [контакт скрыт] после'],
 ['Телефон по Unicode','До +１ ２０２ ５５５ ０１４７ после','До [контакт скрыт] после'],
 ['Zero width','До te\u200Bster@example.test после','До [контакт скрыт] после'],
 ['URL с точкой','Ссылка https://example.test/info. Спасибо!','Ссылка [контакт скрыт]. Спасибо!'],
 ['www URL','Открыть www.example.test завтра','Открыть [контакт скрыт] завтра'],
 ['Домен','Открыть example.test завтра','Открыть [контакт скрыт] завтра'],
 ['Telegram','Мой Telegram @demo_contact_61. Спасибо!','Мой [контакт скрыт]. Спасибо!'],
 ['Распознаваемый handle','Напишите @demo_contact_61 завтра','Напишите [контакт скрыт] завтра'],
 ['Мессенджер по ссылке','До https://t.me/demo_contact_61 после','До [контакт скрыт] после'],
 ['Несколько контактов','Почта tester@example.test, телефон +1 202 555 0147. Спасибо!','Почта [контакт скрыт], телефон [контакт скрыт]. Спасибо!'],
 ['Перекрывающиеся совпадения','tester@example.test','[контакт скрыт]'],
 ['Переносы строк','До\ntester@example.test\nпосле','До\n[контакт скрыт]\nпосле'],
 ['Длинный текст','Начало. '+'Обычный текст. '.repeat(500)+'tester@example.test. Конец.','Начало. '+'Обычный текст. '.repeat(500)+'[контакт скрыт]. Конец.'],
 ['Дата и время','01.10.2026 в 18:00','01.10.2026 в 18:00'],
 ['Сумма','Оплатил 1500.00 credits','Оплатил 1500.00 credits'],
 ['Короткий номер','Заказ 12345','Заказ 12345'],
 ['XSS как текст','<img src=x onerror=alert(1)>','<img src=x onerror=alert(1)>']
];
let results=[];for(const [name,input,expected] of cases){try{assert.equal(mask(input).text,expected);results.push({name,status:'pass'});}catch(e){results.push({name,status:'fail',actual:mask(input).text});}}
for(const sender of ['client','expert']){assert.equal(mask('tester@example.test',undefined,{sender,channel:'consultation'}).redacted,true);results.push({name:'Обе стороны: '+sender,status:'pass'});}
const disabled={senders:{client:false,expert:true},rules:{phone:true,email:true,link:true,messenger:true}};
assert.deepEqual(mask('tester@example.test').categories,['email']);results.push({name:'E-mail без повторных категорий',status:'pass'});
assert.deepEqual(mask('https://t.me/demo_contact_61').categories,['messenger']);results.push({name:'Категория мессенджера по ссылке',status:'pass'});
assert.equal(mask('tester@example.test',disabled,{sender:'client',channel:'consultation'}).redacted,false);results.push({name:'Отключение типа отправителя',status:'pass'});
assert.equal(mask('tester@example.test',undefined,{sender:'expert',channel:'support'}).text,'tester@example.test');results.push({name:'Support без фильтрации',status:'pass'});
assert.equal(mask('tester@example.test',{senders:{client:true,expert:true},rules:{phone:false,email:false,link:false,messenger:false}}).redacted,false);results.push({name:'Отключение правил',status:'pass'});
// Measured limitations are fixtures, not claims of universal recognition.
const limits=[{name:'Номер заказа из 10 цифр',input:'Заказ 1234567890',observed:mask('Заказ 1234567890').text,expected_limit:'false_positive'},{name:'Телефон словами',input:'два ноль два пять пять пять ноль один четыре семь',observed:mask('два ноль два пять пять пять ноль один четыре семь').text,expected_limit:'not_detected'},{name:'Домен вне базового списка',input:'example.xyz',observed:mask('example.xyz').text,expected_limit:'not_detected'}];
const evidenceDir=require('path').join(__dirname,'evidence');fs.mkdirSync(evidenceDir,{recursive:true});fs.writeFileSync(require('path').join(evidenceDir,'rules-test.json'),JSON.stringify({scope:'local_js_demo_only',results,known_limits:limits},null,2));
console.log(JSON.stringify({pass:results.filter(r=>r.status==='pass').length,fail:results.filter(r=>r.status==='fail').map(r=>r.name),known_limits:limits.length}));if(results.some(r=>r.status==='fail'))process.exitCode=1;
