// 2000 Taiwan election — rulebook v0.1 simulator with heuristic bots.
// node sim.js [games] [variant=value ...]
'use strict';

// ---------- RNG ----------
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}

// ---------- Static data ----------
const CHEN=0,SOONG=1,LIEN=2;
const PNAME=['陳','宋','連'];
const REG=['北北基','桃竹苗','中彰投','雲嘉南','高屏','宜花東','離島'];
// name, region, G blocks, B blocks, N blocks, initial [chen,soong,lien]
const COUNTY_DATA=[
['台北市',0,6,10,3,[4,5,2]],['台北縣',0,7,13,4,[4,4,3]],['基隆市',0,1,1,1,[1,1,0]],
['桃園縣',1,2,7,2,[1,3,1]],['新竹縣',1,0,2,1,[0,1,1]],['新竹市',1,0,2,0,[0,1,0]],['苗栗縣',1,0,3,1,[0,1,1]],
['台中縣',2,2,6,2,[1,2,1]],['台中市',2,1,4,1,[1,1,1]],['彰化縣',2,2,5,2,[1,2,1]],['南投縣',2,1,2,1,[1,1,1]],
['雲林縣',3,1,3,1,[1,1,1]],['嘉義縣',3,1,2,1,[1,1,1]],['嘉義市',3,1,0,1,[1,0,0]],['台南縣',3,2,4,2,[1,1,1]],['台南市',3,1,3,1,[1,1,1]],
['高雄市',4,4,5,1,[2,2,1]],['高雄縣',4,3,4,2,[2,1,1]],['屏東縣',4,2,3,1,[1,1,1]],
['宜蘭縣',5,1,1,1,[1,1,0]],['花蓮縣',5,0,2,1,[0,1,1]],['台東縣',5,0,1,1,[0,1,0]],
['澎湖縣',6,0,1,0,[0,1,0]],['金馬',6,0,1,0,[0,1,0]]];
const CN=Object.fromEntries(COUNTY_DATA.map((c,i)=>[c[0],i]));
const NC=COUNTY_DATA.length;
const REG_ADJ=[[0,1],[1,2],[2,3],[3,4],[0,5],[4,5],[3,6],[4,6]];
const RDIST=(()=>{const d=Array.from({length:7},()=>Array(7).fill(99));for(let i=0;i<7;i++)d[i][i]=0;for(const[a,b]of REG_ADJ){d[a][b]=1;d[b][a]=1;}for(let k=0;k<7;k++)for(let i=0;i<7;i++)for(let j=0;j<7;j++)if(d[i][k]+d[k][j]<d[i][j])d[i][j]=d[i][k]+d[k][j];return d;})();
const ISS=['岸','廉','經'];
const CAMP=p=>p===CHEN?'G':'B';
const SOFT=[0,0.35,0.8,1,1];
const DPP97=['台北縣','桃園縣','新竹縣','台中縣','台中市','台南縣','台南市','高雄縣','屏東縣','宜蘭縣','嘉義市'].map(n=>CN[n]);

// ---------- Cards ----------
// fx(g,p): p = player who gets the event (owner, or the player who played an external)
// val(g,p): approx vote-equivalent value for the owner (0 = not playable as event)
// xval: for external cards, value array per player (relative)
function mkCards(){
  const C=[];
  const add=(owner,deck,name,cp,icon,val,fx,extra)=>C.push(Object.assign({owner,deck,name,cp,icon,val,fx},extra||{}));
  const ok=()=>1;
  // 陳
  add(0,'E','台灣之子',3,'廉',()=>3,(g,p)=>g.placeBest(p,3,true,c=>[3,4].includes(COUNTY_DATA[c][1])));
  add(0,'E','新中間路線',3,'岸',()=>2,(g,p)=>{g.addIssue(p,'岸',2);g.flags.chenImmune=true;});
  add(0,'E','政黨輪替',2,'廉',()=>1.5,(g,p)=>g.mom[p]+=2);
  add(0,'E','掃除黑金',3,'廉',()=>2.5,(g,p)=>{g.addIssue(p,'廉',2);g.removeIssue(LIEN,'廉',1);});
  add(0,'E','台灣前途決議文',2,'岸',()=>1.5,(g,p)=>{g.addIssue(p,'岸',1);g.convertGrey(p);});
  add(0,'E','呂秀蓮搭檔',2,'經',()=>2,(g,p)=>g.placeIn(p,CN['桃園縣'],2,true));
  add(0,'E','羅文嘉文宣部',2,'廉',()=>1.2,(g,p)=>g.mediaBest(p,2));
  add(0,'E','謝長廷高雄市長',3,'經',()=>2.5,(g,p)=>{g.placeIn(p,CN['高雄市'],2,true);g.media[4][p]++;});
  add(0,'E','民進黨執政縣市',4,'經',()=>1.5,(g,p)=>g.placeBest(p,3,false,c=>DPP97.includes(c),true));
  add(0,'E','三三三安家專案',3,'經',()=>2.5,(g,p)=>{g.addIssue(p,'經',2);g.placeBest(p,1,true,c=>true,false,'G');});
  add(0,'E','核四停建',2,'經',()=>1.2,(g,p)=>{g.addIssue(p,'經',1);g.removeIssue(LIEN,'經',1);g.mom[SOONG]++;});
  add(0,'E','林義雄主席',2,'廉',()=>1.2,(g,p)=>{g.addIssue(p,'廉',1);g.mom[p]++;});
  add(0,'L','李遠哲挺扁',4,'廉',()=>3,(g,p)=>{g.mom[p]+=2;g.flags.freeAll[p]=true;});
  add(0,'L','國政顧問團',3,'經',()=>2,(g,p)=>{g.addIssue(p,'廉',1);g.addIssue(p,'經',1);g.media[g.media[2][p]>=g.media[0][p]?2:0][p]++;});
  add(0,'L','百萬人民站出來',4,'岸',()=>3.5,(g,p)=>{g.placeBest(p,3,true);g.mom[p]++;});
  add(0,'L','棄連保扁',3,'廉',()=>1.5,(g,p)=>g.swapIn(p,LIEN));
  add(0,'L','許文龍挺扁',2,'經',()=>2,(g,p)=>{g.placeIn(p,CN['台南縣'],1,true);g.placeIn(p,CN['台南市'],1,true);});
  add(0,'L','張榮發挺扁',2,'經',()=>1.2,(g,p)=>{g.mediaBest(p,1);g.bag[p]+=2;});
  // 宋
  add(1,'E','勤政愛民',4,'經',()=>3,(g,p)=>g.placeBest(p,3,true));
  add(1,'E','走透透',3,'經',()=>2,(g,p)=>{g.flags.freeAll[p]=true;});
  add(1,'E','張昭雄搭檔',3,'岸',()=>1.5,(g,p)=>{g.flags.freeCross[p]=2;});
  add(1,'E','民調領先',2,'廉',g=>g.turn<=3?1.5:0,(g,p)=>g.mom[p]+=2);
  add(1,'E','百萬連署',2,'廉',()=>1.2,(g,p)=>{g.bag[p]+=3;g.mom[p]++;});
  add(1,'E','客家票',2,'經',()=>2,(g,p)=>{g.placeIn(p,CN['新竹縣'],1,true);g.placeIn(p,CN['苗栗縣'],1,true);});
  add(1,'E','花東原鄉',2,'經',()=>2,(g,p)=>{g.placeIn(p,CN['花蓮縣'],1,true);g.placeIn(p,CN['台東縣'],1,true);});
  add(1,'E','外省眷村',3,'岸',()=>2,(g,p)=>{for(let k=0;k<2;k++){const c=g.bestCountyFor(p,c=>g.cubes(c,LIEN)>0);if(c<0)break;g.removeFrom(c,LIEN,1,false);g.placeIn(p,c,1,false);}});
  add(1,'E','災區情誼',3,'經',()=>2,(g,p)=>{g.placeIn(p,CN['南投縣'],1,true);g.placeIn(p,CN['台中縣'],1,true);});
  add(1,'E','李敖勸選宋',2,'岸',()=>2.5,(g,p)=>{for(const n of['台北市','新竹市']){g.removeFrom(CN[n],LIEN,1,false);g.placeIn(p,CN[n],1,true);}});
  add(1,'E','省府舊部',3,'經',()=>0.8,(g,p)=>{g.flags.lienNoRest=true;g.media[2][p]++;});
  add(1,'E','李登輝授意說',2,'廉',g=>g.flags.xingpiao&&!g.flags.shouyi?2:0,(g,p)=>{g.flags.shouyi=true;const n=Math.floor(g.flags.xingpiaoRemoved/2);g.bag[p]=Math.max(0,g.bag[p]-n);g.placeBest(p,n,true,c=>true,false,'B');g.addIssue(p,'廉',1);});
  add(1,'L','棄連保宋',3,'岸',()=>1.5,(g,p)=>g.swapIn(p,LIEN));
  add(1,'L','新黨全力挺宋',3,'岸',()=>2,(g,p)=>g.placeBest(p,2,true,c=>COUNTY_DATA[c][1]===0,true));
  add(1,'L','張昭雄的醫界',2,'經',()=>1,(g,p)=>{g.mediaBest(p,1);g.bag[p]+=2;});
  add(1,'L','宋友會',2,'經',()=>1.3,(g,p)=>{g.mom[p]++;g.placeBest(p,1,true,c=>true,false,'B');});
  add(1,'L','跪票',3,'廉',()=>2,(g,p)=>{g.mom[p]+=2;g.placeBest(p,2,false);});
  // 連
  add(2,'E','開除宋楚瑜黨籍',3,'廉',()=>1,(g,p)=>{let k=2;for(let r=0;r<7&&k>0;r++)if(g.media[r][SOONG]>0){g.media[r][SOONG]--;k--;}g.mom[SOONG]++;});
  add(2,'E','楊吉雄爆料',4,'廉',g=>g.flags.xingpiao?0:5,(g,p)=>{g.flags.xingpiao=true;let n=0;for(let k=0;k<4;k++){const c=g.bestCountyFor(p,c=>g.cubes(c,SOONG)>0,SOONG);if(c<0)break;g.removeFrom(c,SOONG,1,true);n++;}g.flags.xingpiaoRemoved=n;g.issues.forEach(i=>{if(i.name==='廉')i.cubes[SOONG]=0;});g.mom[SOONG]=0;});
  add(2,'E','說法反覆',3,'廉',g=>g.flags.shouyi&&!g.flags.fanfu?2.5:0,(g,p)=>{g.flags.fanfu=true;for(let k=0;k<2;k++){const c=g.bestCountyFor(p,c=>g.cubes(c,SOONG)>0,SOONG);if(c<0)break;g.removeFrom(c,SOONG,1,true);}g.mom[p]++;});
  add(2,'E','黨機器動員',4,'經',()=>3,(g,p)=>g.placeBest(p,3,true));
  add(2,'E','黨產廣告',3,'經',()=>1.2,(g,p)=>g.mediaBest(p,2));
  add(2,'E','連蕭配',3,'經',()=>1.8,(g,p)=>g.addIssue(p,'經',2));
  add(2,'E','心手相連',2,'經',()=>1.2,(g,p)=>{g.mom[p]++;g.addIssue(p,'經',1);});
  add(2,'E','李登輝站台',3,'岸',()=>2,(g,p)=>g.placeBest(p,2,true));
  add(2,'E','李登輝痛批宋',3,'廉',()=>1.8,(g,p)=>{const c=g.bestCountyFor(p,c=>g.cubes(c,SOONG)>0,SOONG);if(c>=0)g.removeFrom(c,SOONG,2,false);g.mom[SOONG]++;});
  add(2,'E','安定牌',3,'岸',()=>1.8,(g,p)=>g.addIssue(p,'岸',2));
  add(2,'E','地方派系樁腳',2,'經',()=>1.2,(g,p)=>g.bag[p]+=4);
  add(2,'E','農會系統',2,'經',()=>2,(g,p)=>{g.placeIn(p,CN['雲林縣'],1,true);g.placeIn(p,CN['彰化縣'],1,true);});
  add(2,'E','馬英九站台',2,'廉',()=>1.2,(g,p)=>g.placeIn(p,CN['台北市'],2,false));
  add(2,'E','黨內整合',3,'岸',()=>1.5,(g,p)=>g.swapIn(p,SOONG));
  add(2,'L','鉅額文宣',4,'經',()=>1.8,(g,p)=>g.mediaBest(p,3));
  add(2,'L','馬英九公布民調',3,'廉',g=>g.turn===8?1:0,(g,p)=>{g.placeBest(p,2,false);g.mom[CHEN]++;g.mom[SOONG]++;});
  add(2,'L','李登輝告急',3,'岸',()=>1.8,(g,p)=>g.placeBest(p,3,false));
  add(2,'L','黨員大會',2,'經',()=>1.5,(g,p)=>{g.bag[p]+=4;g.mom[p]++;});
  // 外力 (owner 'X'); xval per player (relative)
  const X=(deck,name,cp,icon,xval,fx)=>C.push({owner:'X',deck,name,cp,icon,val:()=>0,xval,fx});
  X('E','民調公布',2,'廉',g=>{const l=g.issueLeader(g.slotIssue(0));const v=[0,0,0];if(l>=0)v[l]=0.5;return v;},(g)=>{const l=g.issueLeader(g.slotIssue(0));if(l>=0)g.mom[l]++;});
  X('E','兩岸緊張',3,'岸',()=>[0.5,-0.3,-0.3],(g)=>{const i=g.issues.find(i=>i.name==='岸');for(let p=0;p<3;p++)if(!(p===CHEN&&g.flags.chenImmune))i.cubes[p]=Math.max(0,i.cubes[p]-1);g.mom[CHEN]++;});
  X('L','中共白皮書',3,'岸',()=>[1.2,-0.6,-0.6],(g)=>{g.addIssue(CHEN,'岸',1);g.mom[CHEN]++;});
  X('L','朱鎔基',4,'岸',()=>[3.5,-2,-2],(g)=>{g.placeBest(CHEN,3,true);g.mom[CHEN]++;});
  X('L','美國國會譴責北京',2,'岸',()=>[0.6,-0.8,0.6],(g)=>{g.addIssue(CHEN,'岸',1);g.addIssue(LIEN,'岸',1);});
  X('L','股市重挫',2,'經',()=>[-0.5,-0.5,0.8],(g)=>{g.addIssue(LIEN,'經',1);for(let p=0;p<3;p++)g.mom[p]=Math.max(0,g.mom[p]-1);});
  X('L','李登輝暗助',3,'廉',()=>[2.4,-1,-1.6],(g)=>{g.placeBest(CHEN,2,true);g.mom[LIEN]=Math.max(0,g.mom[LIEN]-1);});
  return C;
}
// Local cards: 20 early + 16 late; counties weighted; cp 2 x20, 3 x16
const LOCAL_DIST={'台北縣':6,'台北市':5,'桃園縣':3,'台中縣':3,'高雄市':3,'彰化縣':2,'高雄縣':2,'台南縣':2,'台中市':1,'屏東縣':1,'雲林縣':1,'台南市':1,'苗栗縣':1,'南投縣':1,'嘉義縣':1,'新竹縣':1,'宜蘭縣':1,'花蓮縣':1};
function mkLocal(){const L=[];let i=0;for(const n in LOCAL_DIST)for(let k=0;k<LOCAL_DIST[n];k++){L.push({owner:'L',deck:i<20?'E':'L',name:'地方:'+n,cp:(i%9<5)?2:3,icon:null,county:CN[n],val:()=>0,fx:(g,p,card)=>g.placeIn(p,card.county,1,false,true)});i++;}return L;}

// ---------- Game ----------
class Game{
  constructor(seed,opts){
    this.rand=mulberry32(seed);this.o=Object.assign({bagInit:12,lien8:false,stealCheck:'always',endorse:'half',threshold:'half',issueDecay:'leader',mediaSteal:false,greyCP:false,soongFree:true,adj:'0,0,0',log:false},opts);
    this.counties=COUNTY_DATA.map(([name,reg,G,B,N,init])=>{const blocks=[];for(let k=0;k<G;k++)blocks.push({t:'G',o:-1});for(let k=0;k<B;k++)blocks.push({t:'B',o:-1});for(let k=0;k<N;k++)blocks.push({t:'N',o:-1});return{name,reg,blocks,init};});
    for(const c of this.counties){for(let p=0;p<3;p++){let n=c.init[p];for(const b of c.blocks){if(n===0)break;if(b.o<0&&b.t===CAMP(p)){b.o=p;n--;}}}}
    // start adjustment "dc,ds,dl": +n adds n cubes on own-camp empty blocks (largest counties first), -n removes n cubes
    const adj=String(this.o.adj).split(',').map(Number);const byBig=this.counties.map((c,i)=>i).sort((a,b)=>this.counties[b].blocks.length-this.counties[a].blocks.length);
    for(let p=0;p<3;p++){let n=adj[p]||0;while(n!==0){let done=false;for(const c of byBig){const blocks=this.counties[c].blocks;if(n>0){const b=blocks.find(b=>b.o<0&&b.t===CAMP(p));if(b){b.o=p;n--;done=true;break;}}else{const b=blocks.find(b=>b.o===p);if(b){b.o=-1;n++;done=true;break;}}}if(!done)break;}}
    this.pos=[CN['台南縣'],CN['南投縣'],CN['台北市']];
    this.mom=[3,2,1];this.bag=[this.o.bagInit,this.o.bagInit,this.o.bagInit];this.rest=[0,0,0];
    this.media=Array.from({length:7},()=>[0,0,0]);this.media[0][LIEN]=1;this.media[2][LIEN]=1;
    this.issues=this.shuffle(ISS.map(n=>({name:n,cubes:[0,0,0]})));// index = slot
    this.endorse=Array(7).fill(-1);this.endDeck=this.shuffle([0,1,2,3,4,5,6,0,1,2,3,4,5,6]);this.endDisc=[];
    const all=mkCards().concat(mkLocal());
    this.deckE=this.shuffle(all.filter(c=>c.deck==='E'));this.deckL=this.shuffle(all.filter(c=>c.deck==='L'));
    for(const c of all)if(c.county===undefined)c.county=this.weightedCounty();
    this.disc=[];this.hands=[[],[],[]];this.saveDeb=[[],[],[]];this.saveEle=[[],[],[]];
    this.candUsed=[false,false,false];this.candTurn=[1+Math.floor(this.rand()*3),1+Math.floor(this.rand()*3),1+Math.floor(this.rand()*3)];
    this.flags={freeAll:[false,false,false],freeCross:[0,0,0],chenImmune:false,lienNoRest:false,xingpiao:false,xingpiaoRemoved:0,shouyi:false,fanfu:false};
    this.turn=0;this.initiative=0;this.stats={checks:0,checkOk:0,steals:0,stealOk:0,events:0,triggers:0,preempts:0,adverts:0,issueActs:0,campaigns:0};
  }
  shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(this.rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  weightedCounty(){const tot=154;let r=this.rand()*tot;for(let c=0;c<NC;c++){r-=this.counties[c].blocks.length;if(r<0)return c;}return NC-1;}
  // ----- helpers -----
  cubes(c,p){let n=0;for(const b of this.counties[c].blocks)if(b.o===p)n++;return n;}
  emptyOf(c,t){let n=0;for(const b of this.counties[c].blocks)if(b.o<0&&b.t===t)n++;return n;}
  share(p){const t=this.bag[0]+this.bag[1]+this.bag[2];return t?this.bag[p]/t:1/3;}
  boss(c){const n=this.counties[c].blocks.length;const th=this.o.threshold==='half'?Math.ceil(n/2):4;for(let p=0;p<3;p++)if(this.cubes(c,p)>=th)return p;return -1;}
  regLead(r){const m=this.media[r];let best=-1,bv=0,tie=false;for(let p=0;p<3;p++){if(m[p]>bv){bv=m[p];best=p;tie=false;}else if(m[p]===bv&&bv>0)tie=true;}return tie?-1:best;}
  natLead(){const t=[0,0,0];for(const m of this.media)for(let p=0;p<3;p++)t[p]+=m[p];let best=-1,bv=0,tie=false;for(let p=0;p<3;p++){if(t[p]>bv){bv=t[p];best=p;tie=false;}else if(t[p]===bv&&bv>0)tie=true;}return tie?-1:best;}
  issueLeader(i){const c=i.cubes;let best=-1,bv=0,tie=false;for(let p=0;p<3;p++){if(c[p]>bv){bv=c[p];best=p;tie=false;}else if(c[p]===bv&&bv>0)tie=true;}return tie?-1:best;}
  slotIssue(k){return this.issues[k];}
  issueByName(n){return this.issues.find(i=>i.name===n);}
  addIssue(p,n,k){this.issueByName(n).cubes[p]+=k;}
  removeIssue(p,n,k){const i=this.issueByName(n);i.cubes[p]=Math.max(0,i.cubes[p]-k);}
  check(p){this.stats.checks++;const t=this.bag[0]+this.bag[1]+this.bag[2];if(t===0){for(let q=0;q<3;q++)this.bag[q]+=12;}let r=this.rand()*(this.bag[0]+this.bag[1]+this.bag[2]);let col=0;for(;col<2;col++){r-=this.bag[col];if(r<0)break;}if(col===p){this.stats.checkOk++;return true;}this.bag[col]--;return false;}
  // projection per county
  // bot projection: soft flow so one-step greedy sees the value of narrowing/widening a gap
  projCounty(c){const v=[0,0,0];let eB=0,eG=0;for(const b of this.counties[c].blocks){if(b.o>=0)v[b.o]++;else if(b.t==='B')eB++;else if(b.t==='G')eG++;}if(eB){const gap=v[SOONG]-v[LIEN];const f=SOFT[Math.min(Math.abs(gap),4)];if(gap>0)v[SOONG]+=eB*f;else if(gap<0)v[LIEN]+=eB*f;}if(eG&&v[CHEN]>0)v[CHEN]+=eG;return v;}
  projAll(){const t=[0,0,0];this.pc=[];for(let c=0;c<NC;c++){const v=this.projCounty(c);this.pc.push(v);for(let p=0;p<3;p++)t[p]+=v[p];}this.pt=t;return t;}
  score(p,t){let m=-1e9;for(let q=0;q<3;q++)if(q!==p&&t[q]>m)m=t[q];return t[p]-m;}
  // delta of score for p if county c changed; fn mutates then restores
  deltaFor(p,c,mut){const blocks=this.counties[c].blocks;const old=this.pc[c];const save=blocks.map(b=>b.o);const ok=mut();if(!ok){for(let i=0;i<blocks.length;i++)blocks[i].o=save[i];return -1e9;}const nv=this.projCounty(c);const t=[0,0,0];for(let q=0;q<3;q++)t[q]=this.pt[q]-old[q]+nv[q];const d=this.score(p,t)-this.score(p,this.pt);for(let i=0;i<blocks.length;i++)blocks[i].o=save[i];return d;}
  needsCheckFill(p,c,t){if(t!==CAMP(p)){if(this.flags.freeCross[p]>0)return false;return true;}if(this.flags.freeAll[p])return false;const r=this.counties[c].reg;if(this.regLead(r)===p)return false;const b=this.boss(c);if(b>=0&&b!==p)return true;for(let q=0;q<3;q++)if(q!==p&&this.pos[q]===c)return true;return false;}
  needsCheckSteal(p,c){if(this.o.stealCheck==='always'){if(this.o.mediaSteal&&this.regLead(this.counties[c].reg)===p)return false;return true;}const b=this.boss(c);if(b>=0&&b!==p)return !(this.regLead(this.counties[c].reg)===p);for(let q=0;q<3;q++)if(q!==p&&this.pos[q]===c)return true;return false;}
  firstEmpty(c,t){return this.counties[c].blocks.find(b=>b.o<0&&b.t===t);}
  // micro-actions in county c for p: returns list of {ev, kind, t, q}
  micro(p,c,allowGrey){const out=[];const camp=CAMP(p),cross=camp==='G'?'B':'G';
    for(const t of [camp,cross].concat(allowGrey?['N']:[])){const b=this.firstEmpty(c,t);if(!b)continue;const nc=this.needsCheckFill(p,c,t);const ps=nc?this.share(p):1;const d=this.deltaFor(p,c,()=>{b.o=p;return true;});if(d>-1e8)out.push({ev:ps*d,kind:'fill',t,q:-1,c});}
    for(let q=0;q<3;q++){if(q===p)continue;const types=new Set(this.counties[c].blocks.filter(b=>b.o===q).map(b=>b.t));for(const t of types){const nc=this.needsCheckSteal(p,c);const ps=nc?this.share(p):1;const d=this.deltaFor(p,c,()=>{const b=this.counties[c].blocks.find(b=>b.o===q&&b.t===t);b.o=-1;return true;});if(d>-1e8)out.push({ev:ps*d,kind:'steal',t,q,c});}}
    return out;}
  doMicro(p,m,freeOverride){const c=m.c;if(m.kind==='fill'){const b=this.firstEmpty(c,m.t);if(!b)return false;let nc=this.needsCheckFill(p,c,m.t);if(freeOverride)nc=false;if(nc&&!this.check(p))return false;if(m.t!==CAMP(p)&&this.flags.freeCross[p]>0&&!freeOverride)this.flags.freeCross[p]--;b.o=p;return true;}
    else{const b=this.counties[c].blocks.find(b=>b.o===m.q&&b.t===m.t);if(!b)return false;this.stats.steals++;let nc=this.needsCheckSteal(p,c);if(freeOverride)nc=false;if(nc&&!this.check(p))return false;this.stats.stealOk++;b.o=-1;return true;}}
  // event helpers
  placeBest(p,n,free,filter,allowCheck,typeOnly){filter=filter||(()=>true);for(let k=0;k<n;k++){this.projAll();let best=null;for(let c=0;c<NC;c++){if(!filter(c))continue;for(const m of this.micro(p,c,false)){if(m.kind!=='fill')continue;if(typeOnly&&m.t!==typeOnly)continue;const d=this.deltaFor(p,c,()=>{this.firstEmpty(c,m.t).o=p;return true;});const ev=free?d:(m.ev);if(!best||ev>best.ev)best={ev,m};}}if(!best)return;this.doMicro(p,best.m,free);}}
  placeIn(p,c,n,free,fillOnly){for(let k=0;k<n;k++){this.projAll();let best=null;for(const m of this.micro(p,c,false)){if(m.kind!=='fill')continue;const d=this.deltaFor(p,c,()=>{this.firstEmpty(c,m.t).o=p;return true;});const ev=free?d:m.ev;if(!best||ev>best.ev)best={ev,m};}if(!best)return;this.doMicro(p,best.m,free);}}
  removeFrom(c,q,n,toBag){for(let k=0;k<n;k++){this.projAll();const blocks=this.counties[c].blocks;let best=null;for(const b of blocks){if(b.o!==q)continue;const d=this.deltaFor(q,c,()=>{b.o=-1;return true;});if(!best||d<best.d)best={d,b};}if(!best)return;best.b.o=-1;if(toBag)this.bag[q]++;}}
  bestCountyFor(p,filter,victim){this.projAll();let best=-1,bv=-1e9;for(let c=0;c<NC;c++){if(!filter(c))continue;let v;if(victim!==undefined){const b=this.counties[c].blocks.find(b=>b.o===victim);v=this.deltaFor(p,c,()=>{b.o=-1;return true;});}else{v=0;for(const m of this.micro(p,c,false))if(m.ev>v)v=m.ev;}if(v>bv){bv=v;best=c;}}return best;}
  swapIn(p,q){const c=this.bestCountyFor(p,c=>this.cubes(c,q)>0,q);if(c<0)return;const b=this.counties[c].blocks.find(b=>b.o===q);if(this.check(p)){b.o=-1;}this.placeIn(p,c,1,false);}
  mediaBest(p,n){for(let k=0;k<n;k++){let best=0,bv=-1;for(let r=0;r<7;r++){const m=this.media[r];const lead=this.regLead(r);let v=lead===p?0.2:(m[p]+1>Math.max(...m.filter((x,i)=>i!==p))?1:0.5);v+=this.counties.filter(c=>c.reg===r).reduce((s,c)=>s+c.blocks.length,0)/50;if(v>bv){bv=v;best=r;}}this.media[best][p]++;}}
  convertGrey(p){let best=-1,bv=-1;for(let c=0;c<NC;c++){if(this.cubes(c,p)===0||this.emptyOf(c,'N')===0)continue;const v=this.cubes(c,p);if(v>bv){bv=v;best=c;}}if(best<0)return;const b=this.counties[best].blocks.find(b=>b.o<0&&b.t==='N');b.t='G';}
  // ----- bot CP action -----
  moveCost(p,from,to){const d=RDIST[from][to];if(p!==SOONG)return d;if(this.o.soongFree===true)return 0;if(this.o.soongFree==="flat1")return d>0?1:0;if(this.o.soongFree==="half")return Math.ceil(d/2);return d;}
  estCampaign(p,cp){const cur=this.counties[this.pos[p]].reg;let best={v:0,r:-1};for(let r=0;r<7;r++){const mc=this.moveCost(p,cur,r);const rem=cp-mc;if(rem<1)continue;const list=[];for(let c=0;c<NC;c++)if(this.counties[c].reg===r)for(const m of this.micro(p,c,this.o.greyCP))list.push(m.ev);list.sort((a,b)=>b-a);let v=0;for(let i=0;i<rem&&i<list.length;i++)if(list[i]>0)v+=list[i];if(v>best.v)best={v,r};}return best;}
  estIssue(p,cp){const SV=[2.2,1.4,0.8];let budget=cp,v=0,first=true;const plan=[];const its=this.issues.map((i,k)=>({i,k}));while(true){let bo=null;for(const {i,k} of its){const mine=i.cubes[p];const mo=Math.max(...i.cubes.filter((x,q)=>q!==p));const need=mine>mo?0:(mo-mine+1);let cost,val;if(need===0){cost=first?1:2;val=0.3;}else{cost=(first?1:2)+2*(need-1);val=SV[k];}if(cost<=budget&&(!bo||val/cost>bo.val/bo.cost))bo={i,k,cost,val,need:Math.max(need,1)};}if(!bo||bo.val<=0)break;budget-=bo.cost;v+=bo.val;first=false;plan.push(bo);its.splice(its.findIndex(x=>x.i===bo.i),1);if(!its.length)break;}return{v,plan};}
  estAdvert(p,cp){let best=0.5;for(let r=0;r<7;r++){const m=this.media[r];const lead=this.regLead(r);if(lead===p)continue;const other=Math.max(...m.filter((x,i)=>i!==p));if(m[p]+1>other){let opp=0;for(let c=0;c<NC;c++)if(this.counties[c].reg===r&&(this.emptyOf(c,CAMP(p))>0||this.boss(c)>=0))opp++;best=Math.max(best,0.6+0.3*opp);}}if(this.natLead()!==p)best+=0.3;return cp*this.share(p)*best;}
  bestAction(p,cp){this.projAll();const a=this.estCampaign(p,cp),b=this.estIssue(p,cp),c=this.estAdvert(p,cp);const v=Math.max(a.v,b.v,c);return{v,a,b,c};}
  doAction(p,cp){const {a,b,c}=this.bestAction(p,cp);if(a.v>=b.v&&a.v>=c&&a.r>=0){this.stats.campaigns++;const cur=this.counties[this.pos[p]].reg;let rem=cp-this.moveCost(p,cur,a.r);let last=-1;while(rem>0){this.projAll();let best=null;for(let cc=0;cc<NC;cc++)if(this.counties[cc].reg===a.r)for(const m of this.micro(p,cc,this.o.greyCP))if(!best||m.ev>best.ev)best=m;if(!best||best.ev<=0)break;this.doMicro(p,best);last=best.c;rem--;}if(last>=0)this.pos[p]=last;else if(a.r!==cur){const cc=this.counties.findIndex(x=>x.reg===a.r);this.pos[p]=cc;}}
    else if(b.v>=c&&b.plan.length){this.stats.issueActs++;for(const pl of b.plan){const i=pl.i;const mine=i.cubes[p];const mo=Math.max(...i.cubes.filter((x,q)=>q!==p));i.cubes[p]+=pl.need;}}
    else{this.stats.adverts++;for(let k=0;k<cp;k++)if(this.check(p))this.mediaBest(p,1);}}
  // ----- card play -----
  restFor(p,card){let r=card.cp===2?2:card.cp===3?1:0;if(p===LIEN&&!this.flags.lienNoRest)r++;return r;}
  netValue(p,card){const cpv=this.bestAction(p,card.cp).v;if(card.owner===p){const ev=card.val(this,p);return{net:Math.max(ev,cpv),asEvent:ev>=cpv&&ev>0,cpv,ev};}
    if(card.owner==='X'){const xv=card.xval(this);return{net:cpv+xv[p],asEvent:true,cpv,ev:xv[p]};}
    if(card.owner==='L'){return{net:cpv,asEvent:false,cpv,ev:0};}
    const q=card.owner;const harm=(this.mom[q]>=1&&card.val(this,q)>=1)?card.val(this,q):0;let net=cpv-harm,pre=false;if(harm>=2.5&&this.mom[p]>=2){net=cpv-0.8;pre=true;}return{net,asEvent:false,cpv,ev:-harm,preempt:pre};}
  playCard(p,card,info){this.rest[p]+=this.restFor(p,card);
    if(card.owner==='X'){this.stats.events++;card.fx(this,p,card);this.doAction(p,card.cp);return;}
    if(info.asEvent&&card.owner===p){this.stats.events++;card.fx(this,p,card);return;}
    // CP
    if(info.preempt){this.mom[p]-=2;this.stats.preempts++;}
    this.doAction(p,card.cp);
    if(!info.preempt&&typeof card.owner==='number'&&card.owner!==p){const q=card.owner;if(this.mom[q]>=1&&card.val(this,q)>=1){this.mom[q]--;this.stats.triggers++;card.fx(this,q,card);return;}}
    this.disc.push(card);}
  draw(p,n){const deck=this.turn<=5?this.deckE:this.deckL;while(this.hands[p].length<n){if(deck.length===0){if(!this.disc.length)break;deck.push(...this.shuffle(this.disc.splice(0)));}this.hands[p].push(deck.pop());}}
  initiativeCheck(){const seen=[0,0,0];for(let k=0;k<100;k++){const t=this.bag[0]+this.bag[1]+this.bag[2];if(t===0)for(let q=0;q<3;q++)this.bag[q]+=12;let r=this.rand()*(this.bag[0]+this.bag[1]+this.bag[2]);let col=0;for(;col<2;col++){r-=this.bag[col];if(r<0)break;}seen[col]++;if(seen[col]===2)return col;}return 0;}
  orderFor(init){// initiative holder picks a position; heuristic: last if he leads, first otherwise
    this.projAll();const lead=this.score(init,this.pt)>0;const others=[0,1,2].filter(q=>q!==init);const ord=lead?[others[0],others[1],init]:[init,others[0],others[1]];return ord;}
  // ----- turn -----
  normalTurn(){const t=this.turn;this.flags.freeAll=[false,false,false];this.flags.freeCross=[0,0,0];this.flags.chenImmune=false;this.flags.lienNoRest=false;
    for(let p=0;p<3;p++)this.draw(p,this.o.lien8&&p===LIEN?8:7);
    this.initiative=this.initiativeCheck();let ord=this.orderFor(this.initiative);
    for(let ph=0;ph<4;ph++){const order=ord.slice(ph%3).concat(ord.slice(0,ph%3));for(const p of order){
      if(!this.candUsed[p]&&this.candTurn[p]===t&&ph===0){this.candUsed[p]=true;const cp=p===LIEN?3:5;this.rest[p]+=p===LIEN?2:0;this.doAction(p,cp);continue;}
      const hand=this.hands[p];let best=null;for(const card of hand){const info=this.netValue(p,card);if(!best||info.net>best.info.net)best={card,info};}
      if(!best)continue;hand.splice(hand.indexOf(best.card),1);this.playCard(p,best.card,best.info);}}
    this.momentumPhase();
    // strategy save
    for(let p=0;p<3;p++){const hand=this.hands[p];if(t<=5){hand.sort((a,b)=>b.cp-a.cp);const s=hand.shift();if(s)this.saveDeb[p].push(s);}else{hand.sort((a,b)=>this.countyValue(b.county)-this.countyValue(a.county));for(let k=0;k<2;k++){const s=hand.shift();if(s)this.saveEle[p].push(s);}}this.disc.push(...hand.splice(0));
      this.bag[p]+=this.rest[p];this.rest[p]=0;}}
  countyValue(c){const cc=this.counties[c];let e=0;for(const b of cc.blocks)if(b.o<0)e++;return e+cc.blocks.length*0.2;}
  momentumPhase(){for(let p=0;p<3;p++)this.mom[p]=p===CHEN?Math.ceil(this.mom[p]/2):Math.floor(this.mom[p]/2);
    const nl=this.natLead();if(nl>=0){for(let k=1;k<3;k++){if(this.issueLeader(this.issues[k])===nl&&this.issueLeader(this.issues[k-1])!==nl){[this.issues[k],this.issues[k-1]]=[this.issues[k-1],this.issues[k]];break;}}}
    const l0=this.issueLeader(this.issues[0]),l1=this.issueLeader(this.issues[1]),l2=this.issueLeader(this.issues[2]);
    if(l1>=0){if(this.mom[l1]>=2)this.giveEndorse(l1);else this.mom[l1]++;}
    if(l0>=0){this.mom[l0]++;this.giveEndorse(l0);}
    if(l2>=0)this.mom[l2]++;
    for(const i of this.issues){if(this.o.issueDecay==='leader'){const l=this.issueLeader(i);if(l>=0)i.cubes[l]--;}else{for(let p=0;p<3;p++)if(i.cubes[p]>0)i.cubes[p]--;}}}
  giveEndorse(p){if(!this.endDeck.length)this.endDeck=this.shuffle(this.endDisc.splice(0));const r=this.endDeck.pop();this.endDisc.push(r);this.endorse[r]=p;}
  // ----- debate -----
  debate(){this.initiative=this.initiativeCheck();const piles=this.saveDeb.map(s=>s.slice().sort((a,b)=>b.cp-a.cp));
    const board=this.issues.map(i=>({issue:i,cards:[[],[],[]],done:false}));let resolved=0;const origOrder=this.issues.slice();this.issues=[null,null,null];
    const order=this.orderFor(this.initiative);
    for(let round=0;round<5;round++){for(const p of order){const card=piles[p].shift();if(!card)continue;let slot;if(card.icon){slot=board.find(b=>b.issue.name===card.icon);}else{let best=null;for(const b of board){if(b.done)continue;const mine=b.cards[p].reduce((s,c)=>s+c.cp,0)+card.cp;const other=Math.max(...[0,1,2].filter(q=>q!==p).map(q=>b.cards[q].reduce((s,c)=>s+c.cp,0)));const v=mine-other+(b.cards[p].length===1?2:0);if(!best||v>best.v)best={v,b};}slot=best?best.b:null;}
        if(slot&&!slot.done)slot.cards[p].push(card);}
      for(const b of board){if(b.done)continue;if(b.cards.some(cs=>cs.length>=2)){this.resolveIssue(b,resolved,order);resolved++;}}
      if(resolved===3)break;}
    for(const b of origOrder.map(i=>board.find(x=>x.issue===i))){if(!b.done){this.resolveIssue(b,resolved,order);resolved++;}}
    this.abandon(0.5);}
  resolveIssue(b,idx,order){b.done=true;const sums=b.cards.map(cs=>cs.reduce((s,c)=>s+c.cp,0));let w=-1,bv=-1;for(const p of order){if(sums[p]>bv){bv=sums[p];w=p;}}
    const n=[2,3,4][idx];this.placeBest(w,n,true);this.mom[w]++;for(let k=2;k>=0;k--)if(this.issues[k]===null){this.issues[k]=b.issue;break;}}
  abandon(frac){for(let c=0;c<NC;c++){const blocks=this.counties[c].blocks;const v=[0,0,0];let eB=[],eG=[];for(const b of blocks){if(b.o>=0)v[b.o]++;else if(b.t==='B')eB.push(b);else if(b.t==='G')eG.push(b);}
      const nb=Math.floor(eB.length*frac),ng=Math.floor(eG.length*frac);const gap=v[SOONG]-v[LIEN];if(gap>=2)for(let k=0;k<nb;k++)eB[k].o=SOONG;else if(gap<=-2)for(let k=0;k<nb;k++)eB[k].o=LIEN;if(v[CHEN]>0)for(let k=0;k<ng;k++)eG[k].o=CHEN;}}
  // ----- election day -----
  election(){for(let r=0;r<7;r++)for(let p=0;p<3;p++){this.bag[p]+=this.media[r][p];this.media[r][p]=0;}
    for(const i of this.issues)for(let p=0;p<3;p++){this.bag[p]+=i.cubes[p];i.cubes[p]=0;}
    this.finalMom=this.mom.slice();for(let p=0;p<3;p++){this.bag[p]+=2*this.mom[p];}
    this.initiative=this.initiativeCheck();const order=this.orderFor(this.initiative);
    for(const p of order){for(const card of this.saveEle[p]){const c=card.county;for(let k=0;k<3;k++){if(!this.check(p))continue;this.projAll();let best=null;for(const m of this.micro(p,c,true)){const d=m.kind==='fill'?this.deltaFor(p,c,()=>{this.firstEmpty(c,m.t).o=p;return true;}):this.deltaFor(p,c,()=>{const b=this.counties[c].blocks.find(b=>b.o===m.q&&b.t===m.t);b.o=-1;return true;});if(!best||d>best.d)best={d,m};}if(best)this.doMicro(p,best.m,true);}}}
    this.abandon(1);
    for(let r=0;r<7;r++){const p=this.endorse[r];if(p<0)continue;for(let c=0;c<NC;c++){if(this.counties[c].reg!==r)continue;const greys=this.counties[c].blocks.filter(b=>b.o<0&&b.t==='N');const n=this.o.endorse==='half'?Math.floor(greys.length/2):greys.length;for(let k=0;k<n;k++)greys[k].o=p;}}
    const v=[0,0,0];let empty=0;const leads=[0,0,0];for(let c=0;c<NC;c++){const cv=[0,0,0];for(const b of this.counties[c].blocks){if(b.o>=0){v[b.o]++;cv[b.o]++;}else empty++;}let l=-1,lv=0,tie=false;for(let p=0;p<3;p++){if(cv[p]>lv){lv=cv[p];l=p;tie=false;}else if(cv[p]===lv)tie=true;}if(l>=0&&!tie)leads[l]++;}
    let w=0;for(let p=1;p<3;p++){if(v[p]>v[w]||(v[p]===v[w]&&(leads[p]>leads[w]||(leads[p]===leads[w]&&this.finalMom[p]>this.finalMom[w]))))w=p;}
    return{votes:v,empty,leads,winner:w};}
  run(){for(this.turn=1;this.turn<=9;this.turn++){if(this.turn===6)this.debate();else if(this.turn===9)return this.election();else this.normalTurn();}}
}

// ---------- Runner ----------
function runMany(n,opts,seed0){const wins=[0,0,0],votes=[0,0,0],leads=[0,0,0];let empty=0,xp=0,shouyi=0,fanfu=0;const st={};let margin=0;const hist=[];
  for(let i=0;i<n;i++){const g=new Game(seed0+i,opts);const r=g.run();wins[r.winner]++;for(let p=0;p<3;p++){votes[p]+=r.votes[p];leads[p]+=r.leads[p];}empty+=r.empty;if(g.flags.xingpiao)xp++;if(g.flags.shouyi)shouyi++;if(g.flags.fanfu)fanfu++;for(const k in g.stats)st[k]=(st[k]||0)+g.stats[k];const s=r.votes.slice().sort((a,b)=>b-a);margin+=s[0]-s[1];hist.push(r.votes);}
  return{n,wins:wins.map(w=>(100*w/n).toFixed(1)+'%'),votes:votes.map(v=>(v/n).toFixed(1)),leads:leads.map(v=>(v/n).toFixed(1)),empty:(empty/n).toFixed(1),turnout:((1-empty/n/154)*100).toFixed(1)+'%',margin:(margin/n).toFixed(1),xingpiao:(100*xp/n).toFixed(0)+'%',shouyi:(100*shouyi/n).toFixed(0)+'%',fanfu:(100*fanfu/n).toFixed(0)+'%',checkOk:(100*st.checkOk/st.checks).toFixed(0)+'%',stealOk:(100*st.stealOk/st.steals).toFixed(0)+'%',perGame:{events:(st.events/n).toFixed(1),triggers:(st.triggers/n).toFixed(1),preempts:(st.preempts/n).toFixed(1),campaigns:(st.campaigns/n).toFixed(1),issueActs:(st.issueActs/n).toFixed(1),adverts:(st.adverts/n).toFixed(1),steals:(st.steals/n).toFixed(1)}};}

if(require.main===module){const n=parseInt(process.argv[2]||'300');const opts={};for(const a of process.argv.slice(3)){const [k,v]=a.split('=');opts[k]=v==='true'?true:v==='false'?false:isNaN(v)?v:+v;}
  const r=runMany(n,opts,1000);console.log(JSON.stringify(Object.assign({opts},r),null,1));}
module.exports={runMany,Game};
