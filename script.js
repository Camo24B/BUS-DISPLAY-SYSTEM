const $=id=>document.getElementById(id);
const defaults={
 '2401':{route:'24',dest:'Nottingham',via:'Mapperley'},
 '1501':{route:'15',dest:'Hucknall',via:'Bulwell'},
 '5601':{route:'56',dest:'Nottingham',via:'Wollaton'},
 '7001':{route:'70',dest:'City Hospital',via:''},
 '8701':{route:'87',dest:'Arnold',via:''}
};
let custom={};try{custom=JSON.parse(localStorage.getItem('busDestCodes')||'{}')}catch(e){custom={}}
let entered='';
function showCode(){ $('codeValue').textContent=entered.padEnd(4,'-'); }
function updateBoard(code,route,dest,via=''){
 const text=(dest+(via?' VIA '+via:'' )).toUpperCase();
 ['f','s','r'].forEach(p=>{$(p+'Route').textContent=route.toUpperCase();$(p+'Dest').textContent=text;});
 $('activeCode').textContent='CODE '+code;
 $('status').textContent='Destination loaded · '+route+' '+dest;
 $('feedback').textContent='Loaded code '+code+'. Enter another code to change destination.';
}
function enterCode(){
 if(entered.length!==4){$('feedback').textContent='Enter a 4-digit destination code first.';return}
 const item=custom[entered]||defaults[entered];
 if(!item){$('feedback').textContent='Code not found. Add it under “Manage destination codes”.';return}
 updateBoard(entered,item.route,item.dest,item.via||'');
}
document.querySelectorAll('[data-key]').forEach(btn=>btn.addEventListener('click',()=>{if(entered.length<4)entered+=btn.dataset.key;showCode();}));
$('clear').addEventListener('click',()=>{entered='';showCode();$('feedback').textContent='Code cleared.'});
$('back').addEventListener('click',()=>{entered=entered.slice(0,-1);showCode()});
$('enter').addEventListener('click',enterCode);
document.addEventListener('keydown',e=>{if(/^\d$/.test(e.key)&&entered.length<4){entered+=e.key;showCode()}else if(e.key==='Backspace'){entered=entered.slice(0,-1);showCode()}else if(e.key==='Enter')enterCode()});
function renderCodes(){
 const list=$('codeList');list.innerHTML='';
 Object.entries({...defaults,...custom}).sort(([a],[b])=>a.localeCompare(b)).forEach(([code,item])=>{
 const row=document.createElement('div');row.className='code-item';
 const name=document.createElement('span');name.textContent=code+' · '+item.route+' — '+item.dest+(item.via?' via '+item.via:'');
 row.appendChild(name);
 if(custom[code]){const del=document.createElement('button');del.textContent='DELETE';del.addEventListener('click',()=>{delete custom[code];localStorage.setItem('busDestCodes',JSON.stringify(custom));renderCodes()});row.appendChild(del)}
 list.appendChild(row);
 });
}
$('save').addEventListener('click',()=>{
 const code=$('newCode').value.trim(),route=$('newRoute').value.trim(),dest=$('newDest').value.trim(),via=$('newVia').value.trim();
 if(!/^\d{4}$/.test(code)||!route||!dest){$('feedback').textContent='Enter a 4-digit code, route number and destination.';return}
 custom[code]={route,dest,via};localStorage.setItem('busDestCodes',JSON.stringify(custom));
 entered=code;showCode();updateBoard(code,route,dest,via);renderCodes();
 $('newCode').value='';$('newRoute').value='';$('newDest').value='';$('newVia').value='';
});
showCode();renderCodes();
