(function (root) {
  'use strict';
  var patterns = {
    email: /[A-Z0-9._%+\-]+(?:\s*@\s*|\s*\[at\]\s*)[A-Z0-9\-]+(?:(?:\s*\.\s*|\s*\[dot\]\s*)[A-Z0-9\-]+)*?(?:\s*\.\s*|\s*\[dot\]\s*)[A-Z]{2,}(?![A-Z0-9\-]|\.[A-Z0-9])/gi,
    link: /(?:https?:\/\/|www\.)[^\s<>]+|\b(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+(?:com|org|net|by|ru|io|me|app|dev|test|info|co|uk|de|eu)(?:\/[^\s<>]*)?/gi,
    messenger: /(?:(?:https?:\/\/)?(?:t\.me|wa\.me)\/[^\s<>]+|\b(?:telegram|телеграм(?:м)?|tg|instagram|инстаграм|skype|скайп|signal|сигнал|viber|вайбер|whatsapp|ватсап)\s*[:—\-]?\s*@?[a-z0-9_.\-]{3,}|@[a-z][a-z0-9_]{4,31})/gi,
    phone: /(?:\+\s*\d|\b\d)(?:[\s().\-]*\d){6,14}\b/g
  };
  function mask(text, settings, context) {
    var config = settings || {senders:{client:true,expert:true},rules:{email:true,link:true,messenger:true,phone:true}};
    var ctx = context || {channel:'consultation',sender:'client'};
    if(config.enabled === false || ctx.channel === 'support' || !config.senders[ctx.sender]) return {text:text,redacted:false,categories:[],matches:[]};
    var normalized = '', positions = [];
    for(var i=0;i<text.length;i++) {
      if(/[\u200B-\u200D\uFEFF]/.test(text[i])) continue;
      var ch = text[i].replace(/[０-９]/g,function(n){return String.fromCharCode(n.charCodeAt(0)-65248);});
      normalized += ch; positions.push(i);
    }
    var spans=[];
    var definitions=config.definitions || Object.keys(patterns).map(function(category){return {category:category,source:patterns[category].source,flags:patterns[category].flags,enabled:config.rules[category],minDigits:category==='phone'?10:0};});
    definitions.forEach(function(rule){
      if(!rule.enabled) return;
      var category=rule.category,re = new RegExp(rule.source,rule.flags.indexOf('g')>=0?rule.flags:rule.flags+'g'), m;
      while((m=re.exec(normalized))) {
        if(!m[0].length){re.lastIndex++;continue;}
        var candidate=m[0].replace(/[.,;!?]+$/g,'');
        if(category==='phone') {
          var n=candidate.replace(/\D/g,'');
          if(n.length<(rule.minDigits||10)||n.length>15||/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(candidate)) continue;
        }
        if(!candidate.length) continue;
        spans.push({start:positions[m.index],end:positions[m.index+candidate.length-1]+1,categories:[category]});
      }
    });
    var priority={email:0,messenger:1,link:2,phone:3};
    spans=spans.filter(function(s){return !spans.some(function(other){return other!==s&&other.start<=s.start&&other.end>=s.end&&priority[other.categories[0]]<priority[s.categories[0]];});});
    spans.sort(function(a,b){return a.start-b.start||b.end-a.end;});
    var merged=[];
    spans.forEach(function(s){
      var last=merged[merged.length-1];
      if(last&&s.start<last.end){last.end=Math.max(last.end,s.end);s.categories.forEach(function(c){if(last.categories.indexOf(c)<0)last.categories.push(c);});}
      else merged.push(s);
    });
    var cursor=0, safe='', categories=[];
    merged.forEach(function(s){safe+=text.slice(cursor,s.start)+'[контакт скрыт]';cursor=s.end;s.categories.forEach(function(c){if(categories.indexOf(c)<0)categories.push(c);});});
    safe+=text.slice(cursor);
    return {text:safe,redacted:merged.length>0,categories:categories,matches:merged};
  }
  var api={mask:mask,patterns:patterns};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.ContactRules=api;
})(typeof window!=='undefined'?window:this);
