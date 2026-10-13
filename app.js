/* Rendu, actions, formulaires et simulation du direct */
let lastKey='',lastFoot='',slT,toastT;
function slide(c){const m=$('main');m.classList.remove('pg-r','pg-l','sg-r','sg-l');void m.offsetWidth;m.classList.add(c);clearTimeout(slT);slT=setTimeout(()=>m.classList.remove(c),320)}
const ROLE={admin:'Bureau du club',cap:'Capitaine',mem:'Adhérent',kid:'Compte jeune'};
const TITLES={home:()=>[club().name,'Le mur du club'],chans:()=>['Canaux',club().name],recs:()=>['Équipes','Rencontres et championnats'],club:()=>['Le club','Saison '+S.season],me:()=>['Mon profil',ROLE[S.role]],
 admin:()=>[isAdmin()?'Gérer le club':'Mon équipe','Édition'],list:()=>['Adhérents',club().name],reports:()=>['Signalements','Modération'],legal:()=>['Mentions',club().name],post:()=>['Publication',club().name],art:()=>['Journal',club().name]};
function render(keep){const v=view(),key=v.v+(v.id||''),main=$('main'),y=main.scrollTop;let t,sub;
 if(TITLES[v.v])[t,sub]=TITLES[v.v]();
 else if(v.v==='chan'){const c=chans.find(c=>c.id===v.id);t='# '+c.name;sub=c.desc}
 else if(v.v==='rec'){const r=recs.find(r=>r.id===v.id);t=teamName(grp(r.tid))+' – '+r.opp;sub=r.comp}
 else if(v.v==='grp'){const g=grp(v.id);t=g.name;sub=g.sub}
 else if(v.v==='team'){const g=grp(v.id);t=teamName(g);sub=champOf(g).name}
 else if(v.v==='champ'){t=CHAMPS.find(c=>c.id===v.id).name;sub='Championnat'}
 else{t=M[v.id].n;sub='Profil'}
 const edit=(isAdmin()||S.role==='cap')&&!['chan','admin','grp','champ','reports'].includes(v.v);
 $('top').innerHTML=(S.stack.length?`<button class="ib" data-a="back" aria-label="Retour">${ic('back')}</button>`:`<span class="crest" ${club().logo?`style="background-image:url(${club().logo})"`:''}>${club().logo?'':club().short}</span>`)+`<h1>${t}<span class="sub">${sub}</span></h1>${v.v==='chan'?muteBtn(chans.find(c=>c.id===v.id)):(['admin','grp','champ','reports','legal'].includes(v.v)?'':`<button class="ib acc" data-a="plus" aria-label="Publier ou ajouter">${ic('plus')}</button>`)+(edit?`<button class="ib rnd" data-a="admin" aria-label="${isAdmin()?'Gérer le club':'Gérer mon équipe'}">${ic('edit')}</button>`:'')}<button class="ib" data-a="notifs" aria-label="Notifications">${ic('heart')}${NOTIFS.some(n=>n.n)?'<span class="dot"></span>':''}</button>`;
 const strips='.seg,.chips,.stories',sx=key===lastKey?[...main.querySelectorAll(strips)].map(e=>e.scrollLeft):[];
 main.innerHTML=V[v.v](v.id);
 main.querySelectorAll(strips).forEach((e,i)=>{if(sx[i])e.scrollLeft=sx[i]});
 const foot=$('foot'),tabs=$('tabs'),liveRec=v.v==='rec'&&recs.find(r=>r.id===v.id).st==='live',fk=key+(liveRec?'L':'');
 if(v.v==='chan'||liveRec){foot.hidden=false;tabs.hidden=true;
  if(fk!==lastFoot){const c=v.v==='chan'?chans.find(c=>c.id===v.id):null;S.img=null;
   foot.innerHTML=c&&c.ro&&!isAdmin()?'<div class="muted small" style="text-align:center;padding:8px">Seul le club publie dans ce canal.</div>':`<form class="composer" id="composer"><label class="attach" aria-label="Joindre une photo">${ic('image')}<input type="file" id="m-img" accept="image/*"></label><input type="text" id="msg-input" autocomplete="off" placeholder="${c?'Écrire dans '+esc(c.name):"Encourager l'équipe en direct"}" aria-label="Message"><button class="send" aria-label="Envoyer">${ic('send')}</button></form>`}}
 else{foot.hidden=true;tabs.hidden=false;const un=chans.reduce((a,c)=>a+(c.mute||!chanOk(c)?0:c.un),0),tb=(k,i,l)=>`<button data-a="tab" data-t="${k}" ${S.tab===k?'aria-current="page"':''}>${ic(i)}${l}${k==='chans'&&un?`<span class="cnt">${un}</span>`:''}</button>`;
  tabs.innerHTML=tb('home','home','Accueil')+tb('chans','chat','Canaux')+tb('recs','users','Équipes')+tb('club','club','Club')+tb('me','user','Profil')}
 main.scrollTop=keep&&key===lastKey?y:(v.v==='chan'?main.scrollHeight:0);
 if(S.dir){slide((key!==lastKey?'pg-':'sg-')+(S.dir>0?'r':'l'));S.dir=0}
 lastKey=key;lastFoot=fk}

function toast(msg){clearTimeout(toastT);$('layer').querySelectorAll('.toast').forEach(e=>e.remove());const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;$('layer').appendChild(d);toastT=setTimeout(()=>d.remove(),3200)}
function sheet(title,body,quiet){closeSheet();const d=document.createElement('div');d.className='back'+(quiet?'':' anim');d.id='sheet';d.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><header><span class="h3">${title}</span><button class="ib" data-a="close" aria-label="Fermer">${ic('x')}</button></header>${body}</div>`;$('layer').appendChild(d);d.firstChild.focus({preventScroll:true})}
function closeSheet(){const s=$('sheet');if(s)s.remove()}
const menuSheet=(title,items)=>sheet(title,`<div class="body"><div class="menu">${items.filter(Boolean).map(i=>`<button class="${i[4]?'danger':''}" data-a="${i[2]}" ${i[3]||''}>${ic(i[0])}${i[1]}</button>`).join('')}</div></div>`);
function commentsBody(p){const l=p.com.filter(c=>!S.blocked.has(c.by));return `<div class="body" id="com-list">${l.length?l.map(c=>`<div class="msg">${av(c.by,'sm')}<div class="grow"><div class="hd"><span class="nm">${name(c.by)}</span>${bd(c.by,postSport(p))}</div><div>${esc(c.x)}</div></div></div>`).join(''):empty('com','Aucun commentaire','Sois le premier à réagir.')}</div><div class="foot"><form class="composer" id="com-form" data-id="${p.id}"><input type="text" id="com-input" autocomplete="off" placeholder="Ajouter un commentaire" aria-label="Commentaire"><button class="send" aria-label="Publier">${ic('send')}</button></form></div>`}

/* Couleurs du club : le texte posé sur une couleur est choisi clair ou sombre selon sa luminosité */
function lum(hex){const n=parseInt(hex.slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const onColor=hex=>lum(hex)>.36?'#0B0B0B':'#FFFFFF';
const BASE={true:{bg:'#0B0B0B',card:'#161616',card2:'#222222',line:'#2E2E2E',fg:'#F5F3EE',muted:'#A09C93'},false:{bg:'#F3F5FA',card:'#FFFFFF',card2:'#E4E9F3',line:'#D0D7E5',fg:'#0C1630',muted:'#5A647E'}};
function setTheme(i){S.club=i;const c=CLUBS[i],r=document.documentElement.style,b=BASE[!!c.dark];
 Object.keys(b).forEach(k=>r.setProperty('--'+k,c[k]||b[k]));r.setProperty('--accent',c.accent);r.setProperty('--on-accent',onColor(c.accent));r.setProperty('--hot',c.hot);r.setProperty('--on-hot',onColor(c.hot));r.setProperty('--stage',c.dark?'#050505':'#DDE2EC');r.colorScheme=c.dark?'dark':'light';try{localStorage.setItem('club-theme',i)}catch(e){}}

function notify(type,by,txt){if(!S.nset[type]||by===ME())return;NOTIFS.unshift({by,txt,t:"À l'instant",n:1});if(NOTIFS.length>30)NOTIFS.pop()}
const msgList=ref=>{const [k,id]=ref.split(':');const o=k==='c'?chans.find(c=>c.id===id):recs.find(r=>r.id===id);return o?(k==='c'?o.msgs:o.chat):null};

/* ---------- score en direct ---------- */
function addGame(r,i,side){const m=r.ms[i];if(m.st!=='live')return;const k=m.sets.length-1,st=m.sets[k];st[side]++;S.flash=[i,side,k];
 const a=st[side],b=st[1-side];
 if((a>=6&&a-b>=2)||a===7){const w=[0,0];m.sets.forEach(s=>w[s[0]>s[1]?0:1]++);
  if(w[side]===2){m.st='done';m.w=side;if(m.a&&side===0)notify(S.follow.has(m.a)?'follow':'team',m.a,`a gagné son match contre ${m.b[0]}`);
   if(r.ms.every(x=>x.st==='done')){if(S.scoring)toast('Tous les matchs sont terminés · vérifie les scores puis clôture la rencontre');else endRec(r)}
   else{toast(`${m.l} terminé · point pour ${side===0?club().short:r.opp}`);if(!S.scoring){const n=r.ms.find(x=>x.st==='soon');if(n){n.st='live';n.sets=[[0,0]]}}}}
  else m.sets.push([0,0])}}
/* Fin de rencontre : le résultat part tout seul sur le mur et la discussion du direct s'efface */
function endRec(r){r.st='done';delete r.chat;S.scoring=false;const s=teamScore(r);
 posts.unshift({id:'p'+Date.now(),by:'club',t:"À l'instant",kind:'result',rec:r.id,likes:0,com:[]});notify('club','club',`a publié le résultat : ${teamName(grp(r.tid))} ${s[0]} à ${s[1]} contre ${r.opp}`);
 toast(`Rencontre terminée ${s[0]} à ${s[1]} · résultat publié sur le mur`)}
function shrink(file,cb){const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8))};im.src=fr.result};fr.readAsDataURL(file)}

/* ---------- formulaires ---------- */
const F=(id,l,ph,v)=>`<div class="fld"><label for="${id}">${l}</label><input id="${id}" required placeholder="${ph||''}" value="${v?esc(v):''}" autocomplete="off"></div>`,
 O=(id,l,ph,v)=>`<div class="fld"><label for="${id}">${l}</label><input id="${id}" placeholder="${ph||''}" value="${v?esc(v):''}" autocomplete="off"></div>`,
 T=(id,l,ph,v)=>`<div class="fld"><label for="${id}">${l}</label><textarea id="${id}" required placeholder="${ph||''}">${v?esc(v):''}</textarea></div>`,
 Sel=(id,l,opts,sel)=>`<div class="fld"><label for="${id}">${l}</label><select id="${id}">${opts.map(o=>`<option ${o===sel?'selected':''}>${o}</option>`).join('')}</select></div>`,
 Dt=(id,l,req,v)=>`<div class="fld"><label for="${id}">${l}</label><input type="date" id="${id}" ${req?'required':''} value="${v||isoIn(7)}"></div>`,
 Who=(id,l,ids)=>`<div class="fld"><label for="${id}">${l}</label><select id="${id}">${ids.map(k=>`<option value="${k}">${M[k].n}</option>`).join('')}</select></div>`,
 IMG=`<div class="fld"><label for="a-img">Photo (facultative)</label><input type="file" id="a-img" accept="image/*"><div class="prev" id="a-prev" hidden></div></div>`;
const adults=()=>Object.keys(M).filter(k=>k!=='club'&&M[k].role!=='Jeune');
function visBlock(){return `<details class="more"><summary>Sport et visibilité</summary><div class="in">${Sel('v-sport','Sport concerné',['Tennis et padel','Tennis','Padel'])}${Sel('v-pub','Visible par',['Tous les adhérents','Bureau uniquement','Équipe pédagogique','Parents'])}
 <div class="two">${Sel('v-gen','Genre',['Hommes et femmes','Hommes','Femmes'])}${Sel('v-age','Âge',['Jeunes et adultes','Jeunes','Adultes'])}</div>${Sel('v-prat','Pratique',['Compétiteurs et loisir','Compétiteurs (classés 40 et plus)','Loisir (non classés)'])}
 <div class="fld"><label class="chk" for="v-all"><input type="checkbox" id="v-all" checked data-hide="v-range">Tous classements et niveaux</label></div>
 <div id="v-range" class="stack" hidden><div class="two" id="v-rk">${Sel('v-lo','Tennis, de',RANKS,'30/1')}${Sel('v-hi','à',RANKS,'15/1')}</div><div class="two" id="v-nv">${Sel('n-lo','Padel, de',LV,'Niveau 3')}${Sel('n-hi','à',LV,'Niveau 7')}</div></div></div></details>`}
function readVis(){const x=id=>$(id).value,vis=[],rule={},sp=x('v-sport');
 if(x('v-pub')!=='Tous les adhérents'){vis.push(x('v-pub'));rule.pub=x('v-pub')}
 if(x('v-gen')!=='Hommes et femmes'){vis.push(x('v-gen'));rule.gen=x('v-gen')}
 if(x('v-age')!=='Jeunes et adultes'){vis.push(x('v-age'));rule.age=x('v-age')}
 if(x('v-prat')!=='Compétiteurs et loisir'){const p=x('v-prat').split(' (')[0];vis.push(p);rule.prat=p}
 if(!$('v-all').checked){
  if(sp!=='Padel'){const a=rIdx(x('v-lo')),b=rIdx(x('v-hi'));rule.tn=[Math.min(a,b),Math.max(a,b)];vis.push(RANKS[rule.tn[0]]+' à '+RANKS[rule.tn[1]])}
  if(sp!=='Tennis'){const a=LV.indexOf(x('n-lo'))+1,b=LV.indexOf(x('n-hi'))+1;rule.pd=[Math.min(a,b),Math.max(a,b)];vis.push('Niveau '+rule.pd[0]+' à '+rule.pd[1])}}
 return {vis,rule:Object.keys(rule).length?rule:null,sport:sp==='Tennis et padel'?'':sp}}
function forms(k){const coaches=Object.keys(M).filter(x=>(M[x].role||'').startsWith('Enseignant'));
 return ({
  annonce:['Nouvelle annonce',F('a-title','Titre','Court 3 fermé jeudi')+T('a-body','Message','Ce que les adhérents doivent savoir')+IMG+visBlock(),'Publier sur le mur'],
  event:['Nouvel événement',F('a-title','Titre','Soirée des bénévoles')+IMG+Dt('a-d1','Date de début',1)+`<div class="fld"><label for="a-d2">Date de fin</label><input type="date" id="a-d2" value="${isoIn(7)}" hidden><label class="chk" for="a-same"><input type="checkbox" id="a-same" checked data-hide="a-d2">Même jour</label></div><div class="two">${Sel('a-h1','Heure de début',HOURS,'14 h')}${Sel('a-h2','Heure de fin',HOURS,'18 h')}</div>`+F('a-place','Lieu','Club-house')+T('a-body','Description','Le programme en deux phrases')+`<div class="fld"><span class="lb">Inscription</span><div class="radio"><label for="a-reg-int"><input type="radio" name="a-reg" value="int" id="a-reg-int" checked>Dans l'appli</label><label for="a-reg-ext"><input type="radio" name="a-reg" value="ext" id="a-reg-ext">Sur Ten'Up</label></div></div>`+visBlock(),"Publier l'événement"],
  cta:["Nouveau bouton d'action",F('a-title','Titre','Revivez la finale en vidéo')+T('a-body','Description','Ce que les adhérents trouveront derrière le bouton')+F('a-label','Texte du bouton','Voir la vidéo')+`<div class="fld"><label for="a-url">Lien</label><input id="a-url" required inputmode="url" placeholder="https://www.youtube.com/…" autocomplete="off"></div>`+IMG+visBlock(),'Publier sur le mur'],
  poll:['Nouveau sondage',F('a-title','Question','Quel jour pour la fête du club ?')+F('a-o1','Réponse 1','Samedi')+F('a-o2','Réponse 2','Dimanche')+O('a-o3','Réponse 3 (facultative)','Peu importe')+visBlock(),'Publier le sondage'],
  article:['Nouvel article',Sel('a-cat','Rubrique',['Vie du club','Compétition','Jeunes','Padel','Portrait'])+F('a-title','Titre',"L'équipe 1 monte en Régional 1")+F('a-lead','Chapeau',"L'essentiel en une phrase")+T('a-body','Texte','Un paragraphe par ligne')+IMG+Sel('v-sport','Sport concerné',['Tennis et padel','Tennis','Padel']),'Publier dans le journal'],
  champ:['Créer un championnat',F('a-title','Nom','Interclubs de printemps')+`<div class="two">${Sel('a-sport','Sport',['Tennis','Padel'])}${Sel('a-age','Catégorie',['Adultes','Jeunes'])}</div>`+O('a-season','Saison','Printemps 2027'),'Créer le championnat'],
  team:['Ajouter une équipe',F('a-title','Nom','Équipe 3')+`<div class="two">${F('a-sub','Division','Départemental 2')}${Sel('a-gen','Genre',['Hommes','Femmes','Mixte'])}</div>`+Who('a-cap','Capitaine',adults()),"Créer l'équipe"],
  train:['Créer un groupe',F('a-title','Nom','Adultes loisir')+`<div class="two">${Sel('t-sport','Sport',['Tennis','Padel'])}${Sel('t-day','Jour',['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],'Jeudi')}</div><div class="two">${Sel('a-h1','Heure de début',HOURS,'19 h')}${Sel('t-dur','Durée du cours',['1 h','1 h 30'],'1 h 30')}</div><div class="two">${Who('t-coach','Enseignant',coaches)}${Sel('a-gen','Public',['Mixte','Hommes','Femmes'])}</div><div class="two">${Sel('v-lo','Classement de',RANKS,'NC')}${Sel('v-hi','à',RANKS,'15')}</div><p class="muted small">Le groupe est créé vide. Sa page te propose ensuite les adhérents qui correspondent à ces critères.</p>`,'Créer le groupe'],
  fixture:['Ajouter une rencontre',F('a-opp','Adversaire','TC Égletons')+Dt('a-d1','Date',1)+`<div class="two">${Sel('a-h1','Heure',HOURS,'14 h')}${Sel('a-loc','Lieu',['À domicile',"À l'extérieur"])}</div>`+O('a-comp','Journée','Journée 5'),'Ajouter au calendrier'],
  play:['Chercher une partie',Sel('p-sport','Sport',['Tennis','Padel'])+Dt('a-d1','Date',1)+`<div class="two">${Sel('a-h1','Heure',HOURS,'18 h')}${Sel('a-dur','Durée du créneau',['1 h','1 h 30','2 h'],'1 h 30')}</div><div class="two">${Sel('a-fmt','Format',['Simple','Double'])}${Sel('a-pl','Places (en double)',['1','2','3'],'3')}</div><div class="two" id="p-rk">${Sel('v-lo','Classement de',RANKS,'30/1')}${Sel('v-hi','à',RANKS,'15/1')}</div><div class="two" id="p-lv" hidden>${Sel('l-lo','Niveau de',LV,'Niveau 4')}${Sel('l-hi','à',LV,'Niveau 6')}</div><p class="muted small">Seuls les adhérents de cette fourchette voient ta recherche et sont notifiés. En simple, une seule place. Le padel se joue toujours en double.</p>`,'Publier ma recherche']
 })[k]}

/* ---------- actions ---------- */
const A={
 tab(d){const o=['home','chans','recs','club','me'];S.dir=d.t===S.tab&&!S.stack.length?0:S.stack.length||o.indexOf(d.t)<o.indexOf(S.tab)?-1:1;S.tab=d.t;S.stack=[];render()},
 back(){S.dir=-1;S.stack.pop();render()},
 open(d){closeSheet();S.dir=1;S.stack.push({v:d.v,id:d.id});if(d.v==='chan')chans.find(c=>c.id===d.id).un=0;if(d.v==='grp')S.grpAll=false;render()},
 goClub(d){S.dir=1;S.tab='club';S.clubTab=d.t;S.stack=[];render()},
 member(d){closeSheet();if(d.id===ME()){A.tab({t:'me'});return}S.dir=1;S.stack.push({v:'member',id:d.id});render()},
 admin(){closeSheet();S.dir=1;S.stack.push({v:'admin'});render()},
 seg(d,el){if(S[d.k]===d.val)return;if(el){const b=[...el.parentNode.children];S.dir=b.indexOf(el)>b.findIndex(x=>x.getAttribute('aria-selected')==='true')?1:-1}S[d.k]=d.val;render()},
 close(){closeSheet()},
 toast(d){toast(d.msg)},
 like(d){if(S.liked.has(d.id))S.liked.delete(d.id);else{S.liked.add(d.id);S.pop=d.id}render(true);S.pop=null},
 comments(d){sheet('Commentaires',commentsBody(posts.find(p=>p.id===d.id)))},
 follow(d){const on=!S.follow.has(d.id);on?S.follow.add(d.id):S.follow.delete(d.id);render(true);toast(on?`Tu suis ${first(d.id)} : tu seras notifié de ses résultats et de ses messages`:`Tu ne suis plus ${first(d.id)}`)},
 notifs(){sheet('Notifications',`<div class="body">${NOTIFS.length?NOTIFS.filter(n=>!S.blocked.has(n.by)).map(n=>`<div class="msg">${av(n.by,'sm')}<div class="grow"><span class="nm">${name(n.by)}</span> ${n.txt}<br><time>${n.t}</time></div>${n.n?'<span class="st no">Nouveau</span>':''}</div>`).join(''):empty('heart','Aucune notification','Suis des adhérents pour être prévenu de leurs résultats.')}<div class="note">Tu choisis ce que tu reçois dans ton profil, rubrique « Mes notifications ».</div></div>`);NOTIFS.forEach(n=>n.n=0);render(true)},
 plus(){menuSheet('Publier',[['score','Ajouter un résultat','result'],S.role!=='kid'&&['search','Chercher une partie','newPost','data-k="play"'],isAdmin()&&['info','Annonce du club','newPost','data-k="annonce"'],isAdmin()&&['cal','Événement','newPost','data-k="event"'],isAdmin()&&['poll','Sondage','newPost','data-k="poll"'],isAdmin()&&['link',"Bouton d'action",'newPost','data-k="cta"'],isAdmin()&&['news','Article du journal','newPost','data-k="article"']])},
 newPost(d){const [t,b,cta]=forms(d.k);S.img=null;sheet(t,`<form class="body" id="adm-form" data-k="${d.k}" data-c="${d.c||''}">${b}<button class="btn full">${cta}</button></form>`)},
 /* publications : menu, modification, suppression, signalement */
 pmenu(d){const p=posts.find(p=>p.id===d.id),mine=p.by===ME(),adm=isAdmin(),ev=p.kind==='event'&&adm&&!p.done&&!p.arch,at=`data-id="${p.id}"`;
  menuSheet('Options',[ev&&p.reg!=='ext'&&['users','Voir les inscrits','evList',at],ev&&p.reg!=='ext'&&['check',p.closed?'Rouvrir les inscriptions':'Clore les inscriptions','evClose',at],ev&&['image',"Terminer l'événement",'evDone',at],
   (mine||adm)&&['annonce','event','cta','poll'].includes(p.kind)&&!p.arch&&['edit','Modifier','pedit',at],(mine||adm)&&['trash','Supprimer','pdel',at,1],
   !mine&&['flag','Signaler cette publication','preport',at],!mine&&p.by!=='club'&&['block','Bloquer '+first(p.by),'block',`data-id="${p.by}"`,1]])},
 pedit(d){const p=posts.find(p=>p.id===d.id),plain=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  sheet('Modifier',`<form class="body" id="edit-form" data-id="${p.id}">${p.kind==='poll'?F('e-title','Question','',plain(p.q)):F('e-title','Titre','',plain(p.title))+T('e-body','Texte','',plain(p.body))}${p.kind==='event'?F('e-place','Lieu','',plain(p.place)):''}<button class="btn full">Enregistrer</button></form>`)},
 pdel(d){const i=posts.findIndex(p=>p.id===d.id);if(i>=0)posts.splice(i,1);closeSheet();if(view().v==='post')S.stack.pop();render(true);toast('Publication supprimée')},
 preport(d){const p=posts.find(p=>p.id===d.id);REPORTS.push({kind:'post',author:p.by,by:ME(),excerpt:esc(String(p.title||p.q||p.body||(p.res&&p.res.sc)||'Publication').replace(/<[^>]+>/g,'')),post:p.id});closeSheet();toast('Signalement envoyé au bureau du club')},
 block(d){S.blocked.add(d.id);S.follow.delete(d.id);closeSheet();render(true);toast(`${first(d.id)} est bloqué : tu ne vois plus ses publications ni ses messages`)},
 unblock(d){S.blocked.delete(d.id);render(true);toast(`${first(d.id)} est débloqué`)},
 umenu(d){menuSheet(name(d.id),[['flag','Signaler ce profil','toast','data-msg="Signalement envoyé au bureau du club"'],S.blocked.has(d.id)?['check','Débloquer','unblock',`data-id="${d.id}"`]:['block','Bloquer '+first(d.id),'block',`data-id="${d.id}"`,1]])},
 mmenu(d){const l=msgList(d.ref),m=l&&l[+d.i];if(!m)return;const mine=m.by===ME(),at=`data-ref="${d.ref}" data-i="${d.i}"`;
  menuSheet('Message',[(mine||isAdmin())&&['trash','Supprimer le message','mdel',at,1],!mine&&['flag','Signaler ce message','mreport',at],!mine&&m.by!=='club'&&['block','Bloquer '+first(m.by),'block',`data-id="${m.by}"`,1]])},
 mdel(d){const l=msgList(d.ref);if(l)l.splice(+d.i,1);closeSheet();render(true);toast('Message supprimé')},
 mreport(d){const l=msgList(d.ref),m=l[+d.i];REPORTS.push({kind:'msg',author:m.by,by:ME(),excerpt:esc(m.x||'Photo'),msg:m,ref:d.ref});closeSheet();toast('Signalement envoyé au bureau du club')},
 repDel(d){const r=REPORTS.splice(+d.i,1)[0];if(r.post){const i=posts.findIndex(p=>p.id===r.post);if(i>=0)posts.splice(i,1)}else{const l=msgList(r.ref),i=l?l.indexOf(r.msg):-1;if(i>=0)l.splice(i,1)}render(true);toast('Contenu supprimé')},
 repIgn(d){REPORTS.splice(+d.i,1);render(true);toast('Signalement classé')},
 photo(d,el){const u=el.style.backgroundImage.replace(/^url\(["']?|["']?\)$/g,'');closeSheet();const b=document.createElement('div');b.className='back anim';b.id='sheet';b.style.alignItems='center';b.innerHTML=`<img src="${u}" alt="" data-a="close" style="width:100%;max-height:100%;object-fit:contain">`;$('layer').appendChild(b)},
 /* événements, sondages, parties */
 rsvp(d){const p=posts.find(p=>p.id===d.id);p.my=p.my===d.r?null:d.r;render(true);toast(p.my==='yes'?'Tu es inscrit · le club est prévenu':p.my==='maybe'?'Noté en peut-être':'Inscription retirée')},
 evClose(d){const p=posts.find(p=>p.id===d.id);p.closed=!p.closed;closeSheet();render(true);toast(p.closed?'Inscriptions closes · les inscrits sont conservés':'Inscriptions rouvertes')},
 evList(d){const p=posts.find(p=>p.id===d.id),l=(p.ins||[]).concat(p.my==='yes'?[ME()]:[]),rest=Math.max(0,(p.yes||0)-(p.ins||[]).length),txt=l.map(name).join('\n');
  sheet('Inscrits',`<div class="body"><span class="kicker">${(p.yes||0)+(p.my==='yes'?1:0)} inscrits · ${(p.maybe||0)+(p.my==='maybe'?1:0)} peut-être</span><div>${l.map(i=>`<div class="item">${av(i,'sm')}<span class="grow"><span class="nm">${name(i)}</span> ${bd(i,p.sport)}</span></div>`).join('')}${rest?`<p class="muted small" style="padding-top:10px">et ${rest} autres adhérents (non détaillés dans cette démo).</p>`:''}</div><button class="btn full ghost" data-a="copy" data-txt="${esc(txt)}">Copier la liste des noms</button></div>`)},
 copy(d){(navigator.clipboard?navigator.clipboard.writeText(d.txt):Promise.reject()).then(()=>toast('Liste copiée')).catch(()=>toast('Copie impossible ici : sélectionne les noms à la main'))},
 evDone(d){S.imgs=[];sheet("Terminer l'événement",`<form class="body" id="done-form" data-id="${d.id}"><div class="note">L'événement repasse en haut du mur avec le badge « Terminé », ton commentaire et les photos. Les commentaires des adhérents sont conservés, y compris dans les archives.</div><div class="fld"><label for="d-txt">Le mot du club (facultatif)</label><textarea id="d-txt" placeholder="Merci aux 60 participants, bravo aux vainqueurs…"></textarea></div><div class="fld"><label for="d-ph">Photos (10 maximum)</label><input type="file" id="d-ph" accept="image/*" multiple><div class="gal" id="d-prev"></div></div><button class="btn full">Terminer et publier sur le mur</button></form>`)},
 vote(d){const p=posts.find(p=>p.id===d.id);p.my=p.my===+d.i?null:+d.i;render(true)},
 play(d){const p=posts.find(p=>p.id===d.id),y=p.play,arr=d.r==='in'?y.in:y.wait,i=arr.indexOf(ME());i>=0?arr.splice(i,1):arr.push(ME());render(true);
  toast(d.r==='in'?(i>=0?`${first(p.by)} est prévenu de ton désistement`:`C'est noté · ${first(p.by)} est prévenu`):(i>=0?"Tu as quitté la liste d'attente":"Tu es sur la liste d'attente · prévenu si une place se libère"))},
 /* canaux */
 mute(d){const c=chans.find(c=>c.id===d.id);c.mute=!c.mute;render(true);toast(c.mute?`${c.name} en sourdine : plus de notifications`:`Notifications réactivées pour ${c.name}`)},
 /* équipes et rencontres */
 champ(d){S.champ=d.id;render(true)},
 scoring(){S.scoring=!S.scoring;render(true)},
 game(d){addGame(recs.find(r=>r.id===d.r),+d.i,+d.s);render(true);S.flash=null},
 ungame(d){const m=recs.find(r=>r.id===d.r).ms[+d.i],s=+d.s;let k=m.sets.length-1;
  if(m.st==='live'&&k>0&&m.sets[k][0]===0&&m.sets[k][1]===0&&m.sets[k-1][s]>0){m.sets.pop();k--}
  if(m.sets[k][s]>0){m.sets[k][s]--;if(m.st==='done'){m.st='live';delete m.w}toast('Jeu retiré · score corrigé chez tous les adhérents')}else toast('Aucun jeu à retirer pour ce joueur sur ce set');render(true)},
 start(d){const m=recs.find(r=>r.id===d.r).ms[+d.i];m.st='live';m.sets=[[0,0]];render(true);toast(`${m.l} lancé`)},
 endrec(d){endRec(recs.find(r=>r.id===d.r));render(true)},
 startRec(d){const r=recs.find(r=>r.id===d.r),g=grp(r.tid),T2=g.mem.filter(p=>r.lineup&&r.lineup[p]==='T'),pad=recSport(r)==='Padel';
  if(!T2.length){toast("Choisis d'abord les titulaires de la rencontre");return}
  const rows=pad?Array.from({length:Math.ceil(T2.length/2)},(_,i)=>O('so-'+i,`Double ${i+1} · adversaires de ${T2.slice(i*2,i*2+2).map(first).join(' et ')}`,'Noms de la paire adverse')).join(''):T2.map((p,i)=>O('so-'+i,`Simple ${i+1} · adversaire de ${first(p)}`,"Nom de l'adversaire")).join('')+(T2.length>=2?O('so-d','Double · paire adverse','Noms de la paire adverse'):'');
  sheet('Lancer la rencontre',`<form class="body" id="start-form" data-r="${r.id}"><div class="note">Les matchs sont créés à partir des titulaires. Tu saisis ensuite les scores jeu par jeu, visibles en direct par tous les adhérents.</div>${rows}<button class="btn full">Lancer le direct</button></form>`)},
 delRec(d){const i=recs.findIndex(r=>r.id===d.r);if(i>=0)recs.splice(i,1);for(let k=posts.length-1;k>=0;k--)if(posts[k].rec===d.r)posts.splice(k,1);S.dir=-1;S.stack.pop();render();toast('Rencontre supprimée du calendrier')},
 lineup(d){const r=recs.find(r=>r.id===d.r),L=r.lineup,was=L[d.id];if(was===d.s){delete L[d.id];delete r.conv[d.id]}else{L[d.id]=d.s;if(!was)delete r.conv[d.id]}
  render(true);toast(was===d.s?`${name(d.id)} retiré de la compo`:`${name(d.id)} convoqué comme ${d.s==='T'?'titulaire':'remplaçant'}`)},
 conv(d){const r=recs.find(r=>r.id===d.r),me=ME();r.conv[me]=r.conv[me]===d.s?'wait':d.s;render(true);toast(r.conv[me]==='ok'?'Réponse envoyée : tu es disponible':r.conv[me]==='no'?'Réponse envoyée : tu es indisponible':'Réponse retirée')},
 grpToggle(d){const g=grp(d.g),i=g.mem.indexOf(d.id);let extra='';
  if(i>=0){g.mem.splice(i,1);recs.filter(r=>r.tid===g.id&&r.st==='soon').forEach(r=>{if(r.lineup)delete r.lineup[d.id];if(r.conv)delete r.conv[d.id]});
   if(g.cap===d.id){g.cap=g.mem[0]||null;extra=g.cap?` · ${first(g.cap)} devient capitaine`:' · équipe sans capitaine'}}
  else g.mem.push(d.id);
  render(true);toast(i>=0?`${name(d.id)} retiré de ${g.name} et de ses compositions${extra}`:`${name(d.id)} ajouté à ${g.name} et prévenu`)},
 grpAll(){S.grpAll=!S.grpAll;render(true)},
 /* planning, archives, saison */
 planNav(d){S.plan.d=isoIn(+d.n*(S.plan.mode==='day'?1:7),S.plan.d);S.dir=+d.n;render(true)},
 planDay(d){S.plan.d=d.d;S.plan.mode='day';render(true)},
 planMode(d){S.plan.mode=d.m;render(true)},
 planF(d){S.plan[d.g][d.k]=!S.plan[d.g][d.k];render(true)},
 arch(d){S.arch[d.k]=d.val;render(true)},
 season(){const e=+S.season.split('-')[1];sheet('Changer de saison',`<form class="body" id="season-form"><div class="note">Clôturer ${S.season} envoie dans les archives tous les articles, tous les événements et toutes les rencontres terminées. Le journal, l'agenda et les résultats repartent de zéro. Les rencontres à venir et les équipes sont conservées.</div><div class="two">${Sel('y1','Première année',[e,e+1,e+2].map(String))}${Sel('y2','Seconde année',[e+1,e+2,e+3].map(String))}</div><button class="btn full">Clôturer ${S.season} et lancer la prochaine</button></form>`)},
 delArt(d){const i=arts.findIndex(a=>a.id===d.id);if(i>=0)arts.splice(i,1);S.dir=-1;S.stack.pop();render();toast('Article supprimé')},
 /* profil */
 theme(d){setTheme(+d.i);render(true);toast(`Appli aux couleurs de ${club().name}`)},
 role(d){S.role=d.r;S.scoring=false;S.tab='me';S.stack=[];S.chanTab='club';render();toast(`Tu vois l'appli en tant que : ${ROLE[d.r]}`)},
 share(d){S.share[d.k]=!S.share[d.k];render(true);toast(S.share[d.k]?`${MYCT[d.k][1]} visible par les adhérents`:`${MYCT[d.k][1]} masqué`)},
 nset(d){S.nset[d.k]=!S.nset[d.k];render(true)},
 delRes(d){const r=M[ME()].res.splice(+d.i,1)[0],pi=posts.findIndex(p=>p.res===r);if(pi>=0)posts.splice(pi,1);render(true);toast('Résultat supprimé de ton palmarès')},
 result(){const opt=`<option value="">–</option>`+[0,1,2,3,4,5,6,7].map(n=>`<option>${n}</option>`).join(''),row=(n,l)=>`<div class="setrow"><span class="nm">${l}</span><select id="s${n}a" aria-label="${l}, tes jeux">${opt}</select><span>/</span><select id="s${n}b" aria-label="${l}, jeux de l'adversaire">${opt}</select></div>`;
  sheet('Ajouter un résultat',`<form class="body" id="res-form">${F('r-opp','Adversaire','Prénom Nom')}<div class="two">${Sel('r-rank','Son classement',RANKS,'15/1')}${Sel('r-ctx','Compétition',['Tournoi','Championnat par équipes','Tournoi interne','Match amical'])}</div>${O('r-name','Nom du tournoi (facultatif)','Open de Brive')}
  <div class="fld"><span class="lb">Score · tes jeux / ceux de l'adversaire</span>${row(1,'1er set')}${row(2,'2e set')}${row(3,'3e set')}<span class="muted small">Laisse le 3e set vide si le match s'est joué en deux sets.</span></div><button class="btn full">Publier et notifier mes ${M[ME()].fol} abonnés</button></form>`)},
 rank(d){const tn=d.k==='tennis',me=M[ME()];sheet(tn?'Mon classement tennis':'Mon classement padel',`<form class="body" id="rank-form" data-k="${d.k}">`+(tn?`<div class="fld"><label for="r-new">Classement</label><select id="r-new">${RANKS.map(r=>`<option value="${r}" ${r===me.r?'selected':''}>${r==='NC'?'Non classé':r}</option>`).join('')}</select></div>`:`<div class="fld"><label for="r-pad">Classement national</label><input id="r-pad" inputmode="numeric" pattern="[0-9]*" placeholder="Laisse vide si non classé" value="${me.pad||''}" autocomplete="off"></div><div class="fld"><label for="r-pl">Niveau de jeu</label><select id="r-pl">${['Aucun',...LV].map((l,i)=>`<option ${(me.pl||0)===i?'selected':''}>${l}</option>`).join('')}</select></div>`)+`<p class="muted small">Le classement n'est pas relié à Ten'Up : tu le mets à jour toi-même, et tes abonnés sont prévenus.</p><button class="btn full">Enregistrer</button></form>`)},
 editMe(){const me=M.me,sx=me.g==='F'?'Femme':'Homme';
  sheet('Mes informations',`<form class="body" id="me-form">${F('e-name','Prénom et nom','',me.n)}<div class="two">${Sel('e-g','Sexe',['Homme','Femme'],sx)}${Dt('e-bd','Date de naissance',1,me.bd)}</div><div class="fld"><label for="e-tel">Téléphone</label><input id="e-tel" inputmode="tel" value="${esc(MYCT.tel[2])}" autocomplete="off"></div><div class="fld"><label for="e-mail">E-mail</label><input id="e-mail" type="email" value="${esc(MYCT.mail[2])}" autocomplete="off"></div><div class="two">${Sel('e-net','Réseau social',['Instagram','Facebook','TikTok'],MYCT.soc[1])}${O('e-soc','Identifiant','',MYCT.soc[2])}</div><p class="muted small">Téléphone, e-mail et réseau social ne sont visibles que si leur interrupteur est activé dans ton profil.</p><button class="btn full">Enregistrer</button></form>`)},
 addKid(){sheet('Ajouter un enfant',`<form class="body" id="kid-form">${F('k-name','Prénom et nom','Zoé Roux')}<div class="two">${Sel('k-g','Sexe',['Fille','Garçon'])}${Dt('k-bd','Date de naissance',1,'2016-01-01')}</div>${Sel('k-grp','Groupe',GROUPS.filter(g=>g.type==='train').map(g=>g.name))}<div class="fld"><label class="chk" for="k-ok"><input type="checkbox" id="k-ok" required>Je suis son représentant légal et j'autorise la création de son compte.</label></div><p class="muted small">Un compte jeune n'a pas de messagerie privée et n'accède qu'aux annonces et aux canaux de son groupe. Tu peux le consulter et le supprimer à tout moment.</p><button class="btn full">Créer le compte jeune</button></form>`)},
 look(){const c=club();S.img=null;sheet('Apparence du club',`<form class="body" id="look-form"><div class="two">${F('lk-name','Nom du club','',c.name)}${F('lk-short','Sigle (3 lettres)','',c.short)}</div><div class="two"><div class="fld"><label for="lk-acc">Couleur principale</label><input type="color" id="lk-acc" value="${c.accent}"></div><div class="fld"><label for="lk-hot">Couleur d'alerte</label><input type="color" id="lk-hot" value="${c.hot}"></div></div>${Sel('lk-bg','Fond',['Sombre','Clair'],c.dark?'Sombre':'Clair')}<div class="fld"><label for="lk-logo">Logo (facultatif)</label><input type="file" id="lk-logo" accept="image/*"><div class="prev" id="a-prev" hidden></div></div><p class="muted small">La couleur du texte posé sur tes couleurs est choisie automatiquement pour rester lisible.</p><button class="btn full">Appliquer au club</button></form>`)},
 delAccount(){sheet('Supprimer mon compte',`<form class="body" id="del-form"><div class="note">Ton profil, tes résultats, tes messages et tes inscriptions seront supprimés définitivement. Les comptes jeunes qui te sont rattachés le seront aussi.</div><div class="fld"><label class="chk" for="del-ok"><input type="checkbox" id="del-ok" required>Je comprends que cette action est définitive.</label></div><button class="btn full hot">Supprimer définitivement mon compte</button></form>`)}
};

/* ---------- événements du navigateur ---------- */
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(el){if(el.disabled)return;A[el.dataset.a](el.dataset,el);return}if(e.target.id==='sheet')closeSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
let tsx=null,tsy=0;
document.addEventListener('touchstart',e=>{const g=e.target.closest('#plan')&&!e.target.closest('.chips')&&S.plan.mode!=='events';tsx=g?e.touches[0].clientX:null;tsy=g?e.touches[0].clientY:0},{passive:true});
document.addEventListener('touchend',e=>{if(tsx===null)return;const t=e.changedTouches[0],dx=t.clientX-tsx,dy=t.clientY-tsy;tsx=null;if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy))A.planNav({n:dx<0?1:-1})},{passive:true});
document.addEventListener('input',e=>{if(e.target.id==='l-q'){S.list.q=e.target.value;render(true);const i=$('l-q');i.focus();i.setSelectionRange(i.value.length,i.value.length)}});
document.addEventListener('change',e=>{const el=e.target,prev=u=>{const p=$('a-prev');if(p){p.hidden=false;p.style.backgroundImage=`url(${u})`}};
 if(el.dataset.hide)$(el.dataset.hide).hidden=el.checked;
 if(el.id==='v-sport'&&$('v-rk')){$('v-rk').hidden=el.value==='Padel';$('v-nv').hidden=el.value==='Tennis'}
 if(el.id==='l-sort'){S.list.sort=el.value;render(true)}
 if(el.id==='l-f'){S.list.f=el.value;render(true)}
 if(el.id==='p-sport'){const pad=el.value==='Padel',f=$('a-fmt');$('p-rk').hidden=pad;$('p-lv').hidden=!pad;if(pad)f.value='Double';f.disabled=pad}
 if(el.id==='cap-sel'){grp(el.dataset.team).cap=el.value;render(true);toast(`${name(el.value)} est capitaine · prévenu`)}
 if((el.id==='a-img'||el.id==='lk-logo')&&el.files[0])shrink(el.files[0],u=>{S.img=u;prev(u)});
 if(el.id==='m-img'&&el.files[0])shrink(el.files[0],u=>{S.img=u;toast('Photo prête : touche Envoyer')});
 if(el.id==='d-ph'){[...el.files].slice(0,10-S.imgs.length).forEach(f=>shrink(f,u=>{if(S.imgs.length<10)S.imgs.push(u);const p=$('d-prev');if(p)p.innerHTML=S.imgs.map(x=>`<span class="ph" style="background-image:url(${x})"></span>`).join('')+`<span class="muted small" style="grid-column:1/-1">${S.imgs.length} photo${S.imgs.length>1?'s':''} sur 10</span>`}));el.value=''}
 if(el.id==='rec-ph'&&el.files[0])shrink(el.files[0],u=>{recs.find(r=>r.id===el.dataset.r).img=u;render(true);toast('Photo ajoutée · la publication du mur est à jour')})});

document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,val=id=>{const x=$(id);return x?x.value.trim():''},g=id=>esc(val(id)),home=msg=>{closeSheet();S.tab='home';S.stack=[];render();toast(msg)};
 if(f.id==='composer'){const inp=$('msg-input'),x=inp.value.trim(),img=S.img;if(!x&&!img)return;const v=view(),list=v.v==='rec'?recs.find(r=>r.id===v.id).chat:chans.find(c=>c.id===v.id).msgs;if(!list)return;
  list.push({by:ME(),x,img,t:"À l'instant"});S.img=null;inp.value='';S.sent=true;render(true);S.sent=false;$('main').scrollTop=$('main').scrollHeight;inp.focus();return}
 if(f.id==='com-form'){const x=val('com-input');if(!x)return;const p=posts.find(p=>p.id===f.dataset.id);p.com.push({by:ME(),x});sheet('Commentaires',commentsBody(p),true);const l=$('com-list');l.scrollTop=l.scrollHeight;render(true);return}
 if(f.id==='edit-form'){const p=posts.find(p=>p.id===f.dataset.id);if(p.kind==='poll')p.q=g('e-title');else{p.title=g('e-title');p.body=g('e-body');if($('e-place'))p.place=g('e-place')}closeSheet();render(true);toast('Publication modifiée');return}
 if(f.id==='done-form'){const i=posts.findIndex(p=>p.id===f.dataset.id),p=posts[i],n=Math.min(S.imgs.length,10);p.done={txt:g('d-txt'),photos:S.imgs.slice(0,10)};S.imgs=[];p.t="À l'instant";posts.splice(i,1);posts.unshift(p);home(`Événement terminé · publié sur le mur${n?' avec '+n+' photo'+(n>1?'s':''):''}`);return}
 if(f.id==='start-form'){const r=recs.find(r=>r.id===f.dataset.r),gr=grp(r.tid),T2=gr.mem.filter(p=>r.lineup[p]==='T'),pad=recSport(r)==='Padel',last=p=>M[p].n.split(' ').slice(1).join(' ')||M[p].n;
  r.ms=pad?Array.from({length:Math.ceil(T2.length/2)},(_,i)=>({l:'Double '+(i+1),an:T2.slice(i*2,i*2+2).map(last).join(' / '),b:[val('so-'+i)||'Paire adverse '+(i+1),''],sets:[],st:'soon'})):T2.map((p,i)=>({l:'Simple '+(i+1),a:p,b:[val('so-'+i)||'Adversaire '+(i+1),''],sets:[],st:'soon'})).concat(T2.length>=2?[{l:'Double',an:T2.slice(0,2).map(last).join(' / '),b:[val('so-d')||'Paire adverse',''],sets:[],st:'soon'}]:[]);
  r.ms.slice(0,2).forEach(m=>{m.st='live';m.sets=[[0,0]]});r.st='live';r.chat=[];S.scoring=true;closeSheet();render();toast('Rencontre lancée · les adhérents suivent le score en direct');return}
 if(f.id==='me-form'){const me=M.me;me.n=val('e-name')||me.n;me.g=val('e-g')==='Femme'?'F':'H';if(val('e-bd'))me.bd=val('e-bd');MYCT.tel[2]=val('e-tel');MYCT.mail[2]=val('e-mail');MYCT.soc[1]=val('e-net');MYCT.soc[2]=val('e-soc');closeSheet();render(true);toast('Informations mises à jour');return}
 if(f.id==='kid-form'){const id='k'+Date.now(),gr=GROUPS.find(x=>x.name===val('k-grp'));M[id]={n:g('k-name'),r:'NC',role:'Jeune',team:gr.name,fol:0,g:val('k-g')==='Fille'?'F':'H',bd:val('k-bd'),parent:'me',res:[]};M.me.kids.push(id);gr.mem.push(id);closeSheet();render(true);toast(`Compte jeune créé · ${first(id)} rejoint ${gr.name}`);return}
 if(f.id==='look-form'){const c=club(),acc=$('lk-acc').value,dark=val('lk-bg')==='Sombre';['bg','card','card2','line','fg','muted'].forEach(k=>delete c[k]);Object.assign(c,{name:val('lk-name')||c.name,short:(val('lk-short')||c.short).slice(0,4).toUpperCase(),accent:acc,hot:$('lk-hot').value,dark});if(S.img)c.logo=S.img;S.img=null;setTheme(S.club);closeSheet();render(true);
  toast(contrast(acc,BASE[dark].bg)<3?'Appliqué. Attention : la couleur principale ressort peu sur ce fond, choisis une teinte plus contrastée':`Appli aux couleurs de ${c.name}`);return}
 if(f.id==='del-form'){closeSheet();toast('Demande enregistrée. Dans la vraie appli, ton compte et tes données seraient supprimés.');return}
 if(f.id==='season-form'){const y1=+val('y1'),y2=+val('y2'),old=S.season;if(y2!==y1+1){toast('Une saison couvre deux années qui se suivent');return}
  let n=0;arts.forEach(a=>{if(!a.arch){a.arch=old;n++}});recs.forEach(r=>{if(!r.arch&&r.st==='done'){r.arch=old;n++}});posts.forEach(p=>{if(!p.arch&&p.kind==='event'){p.arch=old;n++}});
  S.season=y1+'-'+y2;S.arch={s:old,t:'arts'};closeSheet();S.tab='club';S.stack=[];S.clubTab='arch';render();toast(`Saison ${old} clôturée · ${n} éléments archivés · saison ${S.season} lancée`);return}
 if(f.id==='rank-form'){const me=M[ME()],tn=f.dataset.k==='tennis';let title,body;
  if(tn){const o=me.r,n=val('r-new');if(o===n){closeSheet();return}me.r=n;title=`Classement tennis <em>${n==='NC'?'non classé':n}</em>`;body=`${first(ME())} passe de ${o} à ${n}.`}
  else{const num=val('r-pad').replace(/\D/g,''),lv=val('r-pl'),np=num?+num:null,nl=lv==='Aucun'?null:LV.indexOf(lv)+1;if(np===(me.pad||null)&&nl===(me.pl||null)){closeSheet();return}me.pad=np;me.pl=nl;title=`Classement padel <em>${np?'n° '+np:'non classé'}</em>`;body=np?`${first(ME())} est désormais n° ${np} au classement padel${nl?', niveau '+nl:''}.`:`${first(ME())} n'est pas classé en padel${nl?', niveau '+nl:''}.`}
  posts.unshift({id:'p'+Date.now(),by:ME(),t:"À l'instant",kind:'annonce',sport:tn?'Tennis':'Padel',title,body,likes:0,com:[]});closeSheet();render(true);toast(`Classement mis à jour · ${me.fol} abonnés notifiés`);return}
 if(f.id==='res-form'){const me=M[ME()],sets=[1,2,3].map(n=>[val('s'+n+'a'),val('s'+n+'b')]).filter(s=>s[0]!==''&&s[1]!=='').map(s=>[+s[0],+s[1]]);
  if(sets.length<2){toast('Indique au moins les deux premiers sets');return}
  const bad=sets.findIndex(s=>!setOk(s[0],s[1]));if(bad>=0){toast(`Le ${bad+1}${bad?'e':'er'} set est impossible : un set se termine 6-0 à 6-4, 7-5 ou 7-6`);return}
  let mine=0,theirs=0;sets.forEach(s=>s[0]>s[1]?mine++:theirs++);
  if(sets.length===2&&mine===1){toast('Un set partout : ajoute le 3e set');return}
  if(sets.length===3&&(sets[0][0]>sets[0][1])===(sets[1][0]>sets[1][1])){toast('Le match était déjà gagné en deux sets : retire le 3e');return}
  const w=mine>theirs?1:0,or=val('r-rank'),perf=!!w&&rIdx(or)>rIdx(me.r),nm=val('r-name'),r={w,opp:val('r-opp'),or,sc:sets.map(s=>s.join('-')).join(' '),ctx:val('r-ctx')+(nm?' · '+nm:''),perf};
  me.res.unshift(r);posts.unshift({id:'p'+Date.now(),by:ME(),t:"À l'instant",kind:'perf',res:r,likes:0,com:[]});home(perf?`Perf à ${or} publiée · ${me.fol} abonnés notifiés`:`Résultat publié · ${me.fol} abonnés notifiés`);return}
 if(f.id==='adm-form'){const k=f.dataset.k,cid=f.dataset.c,V2=$('v-pub')?readVis():{vis:[],rule:null,sport:$('v-sport')&&val('v-sport')!=='Tennis et padel'?val('v-sport'):''},img=S.img,base={id:'p'+Date.now(),by:'club',t:"À l'instant",likes:0,com:[],sport:V2.sport,vis:V2.vis,rule:V2.rule};
  if(k==='annonce'){posts.unshift({...base,kind:'annonce',title:g('a-title'),body:g('a-body'),img});S.img=null;home(V2.vis.length?'Annonce publiée · adhérents concernés notifiés':'Annonce publiée · tous les adhérents notifiés');return}
  if(k==='event'){const reg=f.querySelector('input[name="a-reg"]:checked').value,d1=val('a-d1'),d2=val('a-d2'),one=$('a-same').checked||!d2||d2===d1;
   if(!one&&d2<d1){toast('La date de fin est avant la date de début');return}
   if(hMin(val('a-h2'))<=hMin(val('a-h1'))){toast("L'heure de fin doit être après l'heure de début");return}
   posts.unshift({...base,kind:'event',reg,title:g('a-title'),d:d1,d2:one?'':d2,h1:val('a-h1'),h2:val('a-h2'),date:(one?fmtD(d1):`Du ${fmtD(d1,1)} au ${fmtD(d2,1)}`)+' · '+val('a-h1')+' – '+val('a-h2'),place:g('a-place'),body:g('a-body'),img,yes:0,maybe:0,my:null,ins:[]});S.img=null;home(reg==='int'?"Événement publié · inscriptions ouvertes dans l'appli":"Événement publié · inscription sur Ten'Up");return}
  if(k==='cta'){let u=val('a-url');if(!/^https?:\/\//i.test(u))u='https://'+u;posts.unshift({...base,kind:'cta',title:g('a-title'),body:g('a-body'),label:g('a-label'),url:esc(u),img});S.img=null;home('Publication en ligne · adhérents concernés notifiés');return}
  if(k==='poll'){const o=['a-o1','a-o2','a-o3'].map(g).filter(Boolean);if(new Set(o.map(x=>x.toLowerCase())).size<o.length){toast('Deux réponses sont identiques : modifie-en une');return}posts.unshift({...base,kind:'poll',q:g('a-title'),opts:o.map(t=>[t,0]),my:null});home('Sondage publié · adhérents concernés notifiés');return}
  if(k==='article'){const a={id:'a'+Date.now(),img,sport:V2.sport,cat:val('a-cat'),title:g('a-title'),date:"Aujourd'hui",lead:g('a-lead'),body:g('a-body').split(/\n+/).filter(Boolean)};arts.unshift(a);posts.unshift({...base,kind:'journal',art:a.id});S.img=null;home('Article publié dans le journal');return}
  if(k==='champ'){const id='c'+Date.now();CHAMPS.push({id,name:g('a-title'),sport:val('a-sport'),age:val('a-age'),season:g('a-season')||'Saison '+S.season});closeSheet();S.dir=1;S.stack.push({v:'champ',id});render();toast('Championnat créé · ajoute ses équipes');return}
  if(k==='team'||k==='train'){const id='g'+Date.now(),nm=g('a-title');
   const o=k==='team'?{id,type:k,champ:cid,name:nm,gen:val('a-gen'),sub:g('a-sub'),cap:val('a-cap'),mem:[val('a-cap')]}:{id,type:k,name:nm,sport:val('t-sport'),day:DAYS.indexOf(val('t-day')),h:val('a-h1'),dur:val('t-dur'),coach:val('t-coach'),gen:val('a-gen'),lo:val('v-lo'),hi:val('v-hi'),sub:val('t-day')+' '+val('a-h1')+' · '+val('t-dur')+' · '+first(val('t-coach')),mem:[]};
   GROUPS.push(o);chans.push({id,g:k,sport:k==='team'?champOf(o).sport:o.sport,name:k==='team'?teamName(o):nm,desc:o.sub,un:0,msgs:[{by:'club',x:'Canal ouvert. Bienvenue à tous !',t:"À l'instant"}]});closeSheet();S.dir=1;S.stack.push({v:k==='team'?'team':'grp',id});render();toast(`${nm} créé · son canal de discussion est ouvert`);return}
  if(k==='fixture'){const tm=grp(cid);recs.push({id:'r'+Date.now(),d:val('a-d1'),h:val('a-h1'),tid:cid,opp:g('a-opp'),comp:tm.sub+(val('a-comp')?' · '+g('a-comp'):''),when:fmtD(val('a-d1'))+' · '+val('a-h1')+' · '+val('a-loc').toLowerCase(),st:'soon',lineup:{},conv:{}});closeSheet();render(true);toast("Rencontre ajoutée au calendrier · l'équipe est prévenue");return}
  if(k==='play'){const pad=val('p-sport')==='Padel',fmt=pad?'Double':val('a-fmt'),others=adults().filter(x=>x!==ME());let lo,hi,n,txt;
   if(pad){const a=LV.indexOf(val('l-lo'))+1,b=LV.indexOf(val('l-hi'))+1;lo=Math.min(a,b);hi=Math.max(a,b);n=others.filter(x=>M[x].pl>=lo&&M[x].pl<=hi).length;txt='de niveau '+lo+' à '+hi}
   else{const a=rIdx(val('v-lo')),b=rIdx(val('v-hi')),i0=Math.min(a,b),i1=Math.max(a,b);lo=RANKS[i0];hi=RANKS[i1];n=others.filter(x=>rIdx(M[x].r)>=i0&&rIdx(M[x].r)<=i1).length;txt='de '+lo+' à '+hi}
   posts.unshift({id:'p'+Date.now(),by:ME(),t:"À l'instant",kind:'play',likes:0,com:[],play:{sport:pad?'Padel':'Tennis',date:fmtD(val('a-d1')),time:val('a-h1'),dur:val('a-dur'),fmt,lo,hi,places:fmt==='Simple'?1:+val('a-pl'),in:[],wait:[]}});home(`Recherche publiée · visible par ${n} adhérent${n>1?'s':''} ${txt}`);return}}});

/* ---------- la démo vit : le direct avance, des messages arrivent ---------- */
setInterval(()=>{if(S.scoring)return;const r=recs.find(r=>r.sim&&r.st==='live');if(!r)return;const lives=r.ms.map((m,i)=>m.st==='live'?i:-1).filter(i=>i>=0),v=view(),here=()=>['home','recs'].includes(v.v)||(v.v==='rec'&&v.id===r.id);
 if(!lives.length){if(r.ms.every(x=>x.st==='done'))endRec(r);else{const n=r.ms.find(x=>x.st==='soon');n.st='live';n.sets=[[0,0]]}if(here()&&!$('sheet'))render(true);return}
 addGame(r,lives[Math.floor(Math.random()*lives.length)],Math.random()<.58?0:1);if(here()&&!$('sheet'))render(true);S.flash=null},6500);
let simN=0;
setInterval(()=>{if(simN>=8)return;const v=view(),pool=chans.filter(c=>!c.ro&&chanOk(c)&&!(v.v==='chan'&&v.id===c.id)),who2=adults().filter(x=>x!=='me'&&!S.blocked.has(x));if(!pool.length||!who2.length)return;
 const c=pool[Math.floor(Math.random()*pool.length)],by=who2[Math.floor(Math.random()*who2.length)];simN++;c.msgs.push({by,x:CANNED[simN%CANNED.length],t:'Maintenant'});c.un++;if(!c.mute)notify('chan',by,`a écrit dans ${c.name}`);
 if(['home','chans'].includes(v.v)&&!$('sheet'))render(true)},24000);

let saved=0;try{saved=+localStorage.getItem('club-theme')||0}catch(e){}
setTheme(CLUBS[saved]?saved:0);render();
