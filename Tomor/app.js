/* ================= الإعدادات — عدّلها هنا فقط ================= */
// https://docs.google.com/spreadsheets/d/19zBeVvG_HsNVE--k_1VCXQrNsPTmdr6Vz-xgDEeFApw/edit?usp=sharing
// docs.google.com/spreadsheets/d/هذا_الجزء/edit
const CONFIG={
  SHEET_ID:'19zBeVvG_HsNVE--k_1VCXQrNsPTmdr6Vz-xgDEeFApw',            // معرّف ملف Google Sheet (الجزء الطويل في رابط الشيت). اتركه فارغاً لعرض منتجات تجريبية
  SHEET_NAME:'Products',  // اسم الورقة (التبويب) داخل الشيت
  WHATSAPP:'201098027136',// رقم واتساب بالصيغة الدولية بدون + أو أصفار
  CURRENCY:'جنيه',
  STORE:'ثمار النخبة'
};
/* ============================================================== */
const DEMO=[
{id:'1',name:'تمر سكري فاخر',price:'85',old_price:'100',image:'',images:'',category:'سكري',weight:'1 كجم',description:'تمر سكري طري بحلاوة طبيعية ونكهة الكراميل، مختار بعناية من أجود مزارع القصيم.',available:'yes',badge:'الأكثر مبيعاً'},
{id:'2',name:'تمر عجوة المدينة',price:'120',old_price:'',image:'',images:'',category:'عجوة',weight:'1 كجم',description:'عجوة المدينة الأصلية، ثمرة مباركة غنية بالألياف والطاقة.',available:'yes',badge:''},
{id:'3',name:'تمر خلاص الأحساء',price:'70',old_price:'80',image:'',images:'',category:'خلاص',weight:'1 كجم',description:'خلاص الأحساء بقوام ناعم ومذاق غني لا يُنسى.',available:'yes',badge:'خصم'},
{id:'4',name:'تمر مجدول جامبو',price:'150',old_price:'',image:'',images:'',category:'مجدول',weight:'1 كجم',description:'ثمار كبيرة وسميكة اللب، تُعرف بملك التمور.',available:'yes',badge:'فاخر'},
{id:'5',name:'تمر صقعي',price:'95',old_price:'',image:'',images:'',category:'صقعي',weight:'1 كجم',description:'تمر صقعي جاف قوامه متماسك ومناسب للتخزين والضيافة.',available:'yes',badge:''},
{id:'6',name:'علبة هدايا تمر ملكي',price:'220',old_price:'250',image:'',images:'',category:'هدايا',weight:'2 كجم',description:'علبة أنيقة تضم تشكيلة من أفخر التمور، مناسبة للهدايا والمناسبات.',available:'yes',badge:'هدية'}];

const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('en-US');
const price=n=>`${money(n)} ${CONFIG.CURRENCY}`;

function parseCSV(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];
 if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}
 else if(ch=='"')q=true;else if(ch==','){r.push(c);c=''}else if(ch=='\n'){r.push(c);rows.push(r);r=[];c=''}else if(ch!='\r')c+=ch}
 if(c||r.length){r.push(c);rows.push(r)}return rows}

async function loadProducts(){
 if(!CONFIG.SHEET_ID)return DEMO;
 const u=`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
 const res=await fetch(u);if(!res.ok)throw new Error('sheet');
 const [h,...rows]=parseCSV(await res.text());const keys=h.map(x=>x.trim().toLowerCase());
 return rows.map(r=>Object.fromEntries(keys.map((k,i)=>[k,(r[i]||'').trim()])))
  .filter(p=>p.id&&p.name&&!/^(no|false|لا|0)$/i.test(p.available||''));
}

/* ---------- السلة ---------- */
const Cart={
 get(){try{return JSON.parse(localStorage.getItem('nk_cart'))||[]}catch{return[]}},
 set(c){try{localStorage.setItem('nk_cart',JSON.stringify(c))}catch{}Cart._mem=c;renderCart()},
 add(p,q=1){const c=this.get(),i=c.find(x=>x.id==p.id);i?i.qty+=q:c.push({id:p.id,name:p.name,price:+p.price||0,weight:p.weight||'',qty:q});this.set(c);toggleCart(true)},
 change(id,d){const c=this.get(),i=c.find(x=>x.id==id);if(!i)return;i.qty+=d;this.set(c.filter(x=>x.qty>0))},
 total(c=this.get()){return c.reduce((s,x)=>s+x.price*x.qty,0)}
};
function orderMsg(items,name,addr){
 let m=`السلام عليكم  \nعايز اطلب الاوردر ده من متجر *${CONFIG.STORE}*:\n\n`;
 items.forEach((x,i)=>{m+=`${i+1}. ${x.name}${x.weight?` (${x.weight})`:''} × ${x.qty} = ${price(x.price*x.qty)}\n`});
 m+=`\n*الإجمالي:* ${price(Cart.total(items))}\n`;
 if(name)m+=`\n*الاسم:* ${name}`;if(addr)m+=`\n*العنوان:* ${addr}`;
 return m+`\n\nبانتظار تأكيد الطلب، شكراً لكم.`;
}
const waLink=m=>`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(m)}`;
function toggleCart(o){document.body.classList.toggle('cartopen',o)}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1800)}

function renderCart(){
 const c=Cart.get();$('#cc').textContent=c.reduce((s,x)=>s+x.qty,0);
 $('#items').innerHTML=c.length?c.map(x=>`<div class="it"><div><p>${esc(x.name)}</p><small>${price(x.price)} ${x.weight?'· '+esc(x.weight):''}</small></div>
 <div class="qty"><button data-q="${esc(x.id)}" data-d="1" aria-label="زيادة">+</button><span>${x.qty}</span><button data-q="${esc(x.id)}" data-d="-1" aria-label="إنقاص">−</button></div></div>`).join(''):'<p class="msg">سلتك فارغة، أضف بعض التمور الشهية.</p>';
 $('#tot').textContent=price(Cart.total(c));$('#send').style.display=c.length?'':'none';
}

/* ---------- الهيكل المشترك ---------- */
function layout(){
 document.body.insertAdjacentHTML('afterbegin',`<header><div class="wrap hd"><a class="logo" href="index.html"><i>🌴</i>${CONFIG.STORE}</a>
 <nav><a href="index.html">الرئيسية</a><a href="index.html#products">المنتجات</a><a href="index.html#why">لماذا نحن</a></nav>
 <button class="cartbtn" id="opencart">السلة <span id="cc">0</span></button></div></header>`);
 document.body.insertAdjacentHTML('beforeend',`<footer><div class="wrap"><b>${CONFIG.STORE}</b><p>أجود أنواع التمور · الطلب والتواصل عبر واتساب</p></div></footer>
 <div class="shade" id="shade"></div>
 <aside class="drawer" aria-label="سلة الطلبات"><div class="dh"><h3>سلة الطلبات</h3><button id="closecart" aria-label="إغلاق">×</button></div>
 <div class="items" id="items"></div>
 <div class="df" id="send"><div class="tot"><span>الإجمالي</span><span id="tot"></span></div>
 <input id="cname" placeholder="اسمك" autocomplete="name"><textarea id="caddr" rows="2" placeholder="المدينة والعنوان"></textarea>
 <a class="btn wa" id="wabtn" href="#" target="_blank" rel="noopener">إتمام الطلب عبر واتساب</a></div></aside>`);
 $('#opencart').onclick=()=>toggleCart(true);$('#closecart').onclick=$('#shade').onclick=()=>toggleCart(false);
 $('#wabtn').onclick=e=>{const c=Cart.get();if(!c.length){e.preventDefault();return}
  e.currentTarget.href=waLink(orderMsg(c,$('#cname').value.trim(),$('#caddr').value.trim()))};
 document.addEventListener('click',e=>{
  const q=e.target.closest('[data-q]');if(q)Cart.change(q.dataset.q,+q.dataset.d);
  const a=e.target.closest('[data-add]');if(a){const p=window.PRODUCTS.find(x=>x.id==a.dataset.add);if(p)Cart.add(p)}});
 renderCart();
}

/* ---------- عناصر العرض ---------- */
const img=(src,alt)=>src?`<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.display='none'">`:'';
function card(p){return `<article class="card"><a class="ph" href="product.html?id=${encodeURIComponent(p.id)}">${img(p.image,p.name)}${p.badge?`<span class="badge">${esc(p.badge)}</span>`:''}</a>
 <div class="cb"><small>${esc(p.category)}</small><a href="product.html?id=${encodeURIComponent(p.id)}"><h3>${esc(p.name)}</h3></a>
 <div class="pr"><b>${price(p.price)}</b>${p.old_price?`<s>${price(p.old_price)}</s>`:''}</div></div>
 <button class="add" data-add="${esc(p.id)}">أضف إلى السلة</button></article>`}

function homePage(){
 const g=$('#grid'),cats=$('#cats');let cat='الكل',q='';
 const draw=()=>{const l=window.PRODUCTS.filter(p=>(cat=='الكل'||p.category==cat)&&(p.name+p.category).includes(q));
  g.innerHTML=l.length?l.map(card).join(''):'<p class="msg">لا توجد منتجات مطابقة.</p>'};
 const names=['الكل',...new Set(window.PRODUCTS.map(p=>p.category).filter(Boolean))];
 cats.innerHTML=names.map(n=>`<button class="chip${n==cat?' on':''}">${esc(n)}</button>`).join('');
 cats.onclick=e=>{if(!e.target.matches('.chip'))return;cat=e.target.textContent;cats.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c==e.target));draw()};
 $('#search').oninput=e=>{q=e.target.value.trim();draw()};draw();
}

function productPage(){
 const id=new URLSearchParams(location.search).get('id'),p=window.PRODUCTS.find(x=>x.id==id),box=$('#pd');
 if(!p){box.innerHTML='<p class="msg">المنتج غير موجود. <a class="btn" href="index.html">العودة للمتجر</a></p>';return}
 document.title=`${p.name} | ${CONFIG.STORE}`;
 const pics=[p.image,...(p.images||'').split(/[,\n|]/).map(s=>s.trim())].filter(Boolean);let qty=1;
 box.innerHTML=`<div><div class="ph main" id="main">${img(pics[0],p.name)}</div>
 ${pics.length>1?`<div class="thumbs">${pics.map((s,i)=>`<button class="${i?'':'on'}" data-i="${i}" aria-label="صورة ${i+1}"><img src="${esc(s)}" alt=""></button>`).join('')}</div>`:''}</div>
 <div><small style="color:var(--g2);font-weight:700">${esc(p.category)}</small><h1>${esc(p.name)}</h1>
 <div class="pr"><b>${price(p.price)}</b>${p.old_price?`<s>${price(p.old_price)}</s>`:''}</div>
 <div class="meta">${p.weight?`<span>الوزن: ${esc(p.weight)}</span>`:''}${p.badge?`<span>${esc(p.badge)}</span>`:''}</div>
 <p class="desc">${esc(p.description)}</p>
 <div class="buy"><div class="qty"><button id="plus" aria-label="زيادة">+</button><span id="q">1</span><button id="minus" aria-label="إنقاص">−</button></div>
 <button class="btn out" id="addc">أضف إلى السلة</button><a class="btn wa" id="now" href="#" target="_blank" rel="noopener">اطلب الآن عبر واتساب</a></div></div>`;
 const set=n=>{qty=Math.max(1,n);$('#q').textContent=qty};
 $('#plus').onclick=()=>set(qty+1);$('#minus').onclick=()=>set(qty-1);
 $('#addc').onclick=()=>Cart.add(p,qty);
 $('#now').onclick=e=>{e.currentTarget.href=waLink(orderMsg([{name:p.name,weight:p.weight,price:+p.price||0,qty}]))};
 box.querySelectorAll('.thumbs button').forEach(b=>b.onclick=()=>{$('#main').innerHTML=img(pics[b.dataset.i],p.name);box.querySelectorAll('.thumbs button').forEach(x=>x.classList.toggle('on',x==b))});
 const rel=window.PRODUCTS.filter(x=>x.id!=p.id&&(x.category==p.category||true)).slice(0,4);
 $('#rel').innerHTML=rel.map(card).join('');
}

(async()=>{
 layout();
 try{window.PRODUCTS=await loadProducts()}catch{window.PRODUCTS=[];const m=$('#grid')||$('#pd');if(m)m.innerHTML='<p class="msg">تعذّر تحميل المنتجات. تأكد من مشاركة الشيت للعرض العام وصحة SHEET_ID.</p>';return}
 document.body.dataset.page=='product'?productPage():homePage();
})();
