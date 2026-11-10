'use strict';
const clientSnapshotRows=[];
const people=[
 ["Мария Лебедева", "Женщина"],
 ["Алексей Волков", "Мужчина"],
 ["Анна Соколова", "Женщина"],
 ["Олег Смирнов", "Мужчина"],
 ["Елена Белова", "Женщина"],
 ["Ирина Орлова", "Женщина"],
 ["Леонид Васильев", null],
 ["Диана Зорина", "Женщина"],
 ["Валерия Попова", "Женщина"],
 ["Виктор Ковалёв", "Мужчина"],
 ["Нина Тихонова", "Женщина"],
 ["Лев Громов", "Мужчина"],
 ["Кира Савина", "Женщина"],
 ["Юлия Речная", "Женщина"],
 ["Павел Котов", "Мужчина"],
 ["Дарья Миронова", "Женщина"],
 ["Борис Седов", "Мужчина"],
 ["Алла Белова", "Женщина"],
 ["Роман Ветров", "Мужчина"],
 ["Алиса Долина", null],
 ["Тимур Соколов", "Мужчина"],
 ["Валерия Мартова", "Женщина"],
 ["Инна Светлова", "Женщина"],
 ["Андрей Маков", "Мужчина"]
];
const clientLocations=['minsk','riga','warsaw','prague','vilnius','krakow',null,'tallinn'];
const sampleBalances=[400,0,null,1200.5,80,25.25];
const sampleDescriptionLanguages=new Map([
 [312,['RU','EN','DE','ES','IT','PT','UK','FR']],
 [311,['RU']],
 [309,['DE','EN','ES','PT','IT','RU','UK']],
 [305,['IT','EN','RU','UK']]
]);
const demoClients=people.map(([name,gender],i)=>({id:312-i,person:name,gender,location:clientLocations[i%clientLocations.length],activated:i!==6&&i!==14,credits:sampleBalances[i%sampleBalances.length],descriptionLanguages:sampleDescriptionLanguages.get(312-i)||[],login:'client.demo'+(i+1),created:'2026-10-'+String(24-i).padStart(2,'0')+' 12:24',seen:i%4===2||i===6||i===14?'':'2026-11-0'+(8-i%7)+' 16:12',premium:i%4===1?'Да':'Нет',verified:i%3===0?'Да':'Нет',blocked:i===2||i===8?'Да':'Нет'}));
for(let i=demoClients.length;i<248;i++){
 const id=312-i;
 const date=new Date(Date.UTC(2026,9,24-i)).toISOString().slice(0,10);
 demoClients.push({
  id, person:'Клиент '+id, login:'client.demo'+(i+1), created:date+' 12:24',
  gender:[null,'Мужчина','Женщина','Женщина','Мужчина'][i%5],
  location:clientLocations[i%clientLocations.length],
  activated:i%13!==0, credits:sampleBalances[i%sampleBalances.length],
  descriptionLanguages:i%13===1?['RU','EN']:[],
  seen:i%4===2||i%13===0?'':'2026-11-0'+(8-i%7)+' 16:12',
  premium:i%4===1?'Да':'Нет', verified:i%3===0?'Да':'Нет', blocked:i%19===0?'Да':'Нет'
 });
}
const clientSnapshot=false;
const users=demoClients;
