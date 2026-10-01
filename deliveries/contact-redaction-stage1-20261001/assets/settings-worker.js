importScripts('contact-rules.js');
onmessage=function(event){
  try {
    var cfg=event.data.config,result=ContactRules.mask(event.data.text,cfg,event.data.context);
    var fixtures=[
      {name:'Телефон',category:'phone',raw:'До +1 202 555 0147 после.',safe:'До [контакт скрыт] после.'},
      {name:'E-mail',category:'email',raw:'До tester@example.test после.',safe:'До [контакт скрыт] после.'},
      {name:'Ссылка',category:'link',raw:'До https://example.test/guide после.',safe:'До [контакт скрыт] после.'},
      {name:'Мессенджер',category:'messenger',raw:'До Telegram @demo_contact_61 после.',safe:'До [контакт скрыт] после.'},
      {name:'Дата, время и сумма',raw:'Встреча 01.10.2026 в 18:00. Цена 150 рублей.',safe:'Встреча 01.10.2026 в 18:00. Цена 150 рублей.'},
      {name:'Обычный текст',raw:'Спасибо! Продолжим обсуждение здесь.',safe:'Спасибо! Продолжим обсуждение здесь.'}
    ];
    var checks=[],sender=cfg.senders.client?'client':'expert';
    fixtures.forEach(function(f){
      if(f.category&&(!cfg.enabled||!cfg.definitions.some(function(d){return d.enabled&&d.category===f.category;})))return;
      var actual=ContactRules.mask(f.raw,cfg,{channel:'consultation',sender:sender}).text;
      checks.push({name:f.name,status:actual===f.safe?'pass':'fail'});
    });
    var support='Контакт tester@example.test.';
    checks.push({name:'Support исключён',status:ContactRules.mask(support,cfg,{channel:'support',sender:'client'}).text===support?'pass':'fail'});
    postMessage({ok:true,result:result,checks:checks});
  } catch(error){postMessage({ok:false,error:error.message});}
};
