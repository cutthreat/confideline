'use strict';
const expertSnapshotRows=[];
const expertSourceParams=new URLSearchParams(location.search);
const selectedExpertId=expertSourceParams.get('expert');
const names=['Марина Север','София Луна','Анна Веста','Алекс Мир','Ева Роса','Ирина Сова','Вера Грин','Виктор Стел'];
// Option order follows the saved values of profile fields #17 and #21.
const expertAreaOptions=[
 "Tarot Reader",
 "Astrologer",
 "Psychic",
 "Clairvoyant",
 "Medium",
 "Spiritual Practitioner",
 "Numerologist",
 "Psychoenergetic Practitioner",
 "Energy Healer",
 "Intuitive Consultant",
 "Karmic Consultant",
 "Spiritual Mentor",
 "Mindfulness Practitioner",
 "Subconscious Work Specialist",
 "Empath"
];
const expertLanguageOptions=[
 ["AR", "Арабский"],
 ["FR", "Французский"],
 ["IT", "Итальянский"],
 ["RU", "Русский"],
 ["ES", "Испанский"],
 ["EN", "Английский"],
 ["DE", "Немецкий"],
 ["UK", "Украинский"],
 ["CS", "Чешский"],
 ["KO", "Корейский"],
 ["ZH", "Китайский"],
 ["EL", "Греческий"],
 ["JA", "Японский"]
];
const areasByExpert=[[1,10],[2,11],[7,12],[5],[6],[8,9],[],[3,4]];
const languagesByExpert=[[4,6,3,7,5],[4],[3,6],[6],[4],[3],[],[4,3]];
const citiesByExpert=[
 ['minsk','vilnius','riga'], ['warsaw','krakow'], ['prague'], ['riga','tallinn'],
 ['minsk'], ['krakow','warsaw'], [], ['vilnius','tallinn']
];
const agentByExpert=['Партнёр А',null,'Партнёр Б','Партнёр А','Партнёр А',null,'Партнёр Б','Партнёр Б'];
const ratingsByExpert=[[4.8,37],[4.9,21],[4.7,14],[5,8],[4.6,12],[4.8,16],null,null];
const gendersByExpert=['Женщина','Женщина','Женщина','Мужчина','Женщина','Женщина',null,'Мужчина'];
// Option values and thresholds from expert profile fields #19 (ncons) and #20 (experience).
const consultationThresholds=[10,50,100,250,500,1000,2000,3000,4000];
const experienceThresholds=[1,3,5,7,10,15,20];
const profileConsultationOptions=[
 ['5','3'],['3','2'],['6','5'],['1','1'],['2',null],['4','4'],[null,null],[null,'6']
];
function expertProfileThreshold(options,value){
 const index=Number(value);
 return Number.isInteger(index)&&index>=1&&index<=options.length?options[index-1]:null;
}
function consultationThreshold(row){
 return expertProfileThreshold(consultationThresholds,row.ncons);
}
function experienceThreshold(row){
 return expertProfileThreshold(experienceThresholds,row.experience);
}
const demoExperts=names.map((name,i)=>({
 id:512-i, person:name, login:'expert.demo'+(i+1),
 areas:areasByExpert[i].map(option=>expertAreaOptions[option-1]),
 langs:languagesByExpert[i].map(option=>expertLanguageOptions[option-1][1]),
 agent:agentByExpert[i], cities:citiesByExpert[i], rating:ratingsByExpert[i],
 gender:gendersByExpert[i], verified:i%3===0?'Да':'Нет', blocked:i===6?'Да':'Нет',
 ncons:profileConsultationOptions[i][0], experience:profileConsultationOptions[i][1]
}));
for(let i=demoExperts.length;i<248;i++){
 const id=512-i;
 const template=demoExperts[1+(i-1)%(names.length-1)];
 demoExperts.push({...template,id,person:'Эксперт '+id,login:'expert.demo'+(i+1)});
}
const expertDemoStorage='confideline-directory-demo-experts';
function loadExpertDemoState(){
 try {
  const stored=JSON.parse(sessionStorage.getItem(expertDemoStorage));
  if(Array.isArray(stored?.created)&&stored.assigned)return stored;
 } catch {}
 return {created:[],assigned:{}};
}
const expertDemoState=loadExpertDemoState();
demoExperts.push(...expertDemoState.created.map(row=>({
 gender:null,verified:'Нет',blocked:'Нет',ncons:null,experience:null,...row
})));
for(const row of demoExperts){
 if(Object.hasOwn(expertDemoState.assigned,row.id))row.agent=expertDemoState.assigned[row.id];
}
const expertSnapshot=false;
const experts=demoExperts;
function saveExpertDemoState(){
 try {sessionStorage.setItem(expertDemoStorage,JSON.stringify(expertDemoState));} catch {}
}
function createDemoExpert(person,description){
 const id=Math.max(...demoExperts.map(row=>row.id))+1;
 const row={
  id,person,description,login:'expert.demo.new'+id,
  areas:[],langs:[],cities:[],agent:null,rating:null,
  gender:null,verified:'Нет',blocked:'Нет',ncons:null,experience:null
 };
 expertDemoState.created.push(row);
 demoExperts.push(row);
 saveExpertDemoState();
 return row;
}
function assignDemoAgent(row,agent){
 row.agent=agent;
 expertDemoState.assigned[row.id]=agent;
 saveExpertDemoState();
}
const unrated='Оценок пока нет';
const ratingNumber=new Intl.NumberFormat('ru',{maximumFractionDigits:1});
const ratingPlural=new Intl.PluralRules('ru');
const ratingUnits={one:'оценка',few:'оценки',many:'оценок',other:'оценки'};
function ratingText(rating){
 if(!rating)return unrated;
 const [score,count]=rating;
 return ratingNumber.format(score)+' из 5 · '+count+' '+ratingUnits[ratingPlural.select(count)];
}
