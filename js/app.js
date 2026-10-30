let weights = [...presets.balanced];
let selectedCategory = "all";
let selectedArea = "all";
let selectedBudget = "all";
let favorites = new Set();
let comparison = new Set();
let lastResults = [];
let tableVisible = false;
let toastTimer;

const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];
const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const fmt = n => Number(n).toLocaleString("id-ID",{minimumFractionDigits:3,maximumFractionDigits:4});
const totalCost = d => d.ticket+d.parking+d.food+d.transport+d.extra;
const safeImage = (url,name) => `<img src="${url}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/700x450/e7eee1/284c35?text=Foto+Wisata'">`;

function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2700);
}
function renderDestinations(){
  const list=destinations.filter(d=>(selectedCategory==="all"||d.category===selectedCategory)&&(selectedArea==="all"||d.area===selectedArea)&&(selectedBudget==="all"||totalCost(d)<=Number(selectedBudget)));
  $("#resultCount").textContent=`${list.length} destinasi`;
  $("#destinationGrid").innerHTML=list.map(d=>`
    <article class="destination-card">
      <div class="destination-image">${safeImage(d.image,d.name)}<span class="category-tag">${d.category}</span><button class="heart-button ${favorites.has(d.id)?"saved":""}" data-favorite="${d.id}" aria-label="Simpan ${d.name}"><i class="${favorites.has(d.id)?"fa-solid":"fa-regular"} fa-heart"></i></button></div>
      <div class="destination-info"><div class="destination-location"><i class="fa-solid fa-location-dot"></i> ${d.location}</div><h3>${d.name}</h3><p class="destination-desc">${d.desc}</p>
      <div class="destination-bottom"><div><span class="price-label">Estimasi total / orang</span><span class="price-value">${rupiah(totalCost(d))}</span></div><button class="detail-btn" data-detail="${d.id}">Detail <i class="fa-solid fa-arrow-right"></i></button></div></div>
    </article>`).join("") || `<div class="no-results">Tidak ada destinasi yang cocok dengan filter tersebut. Coba ubah kategori, area, atau budget.</div>`;
  $$("[data-favorite]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);renderDestinations();showToast(favorites.has(id)?"Ditambahkan ke favorit":"Dihapus dari favorit");}));
  $$("[data-detail]").forEach(b=>b.addEventListener("click",()=>openDetail(b.dataset.detail)));
  
}
function renderHeroPicks(){
  const picks=["kawah-putih","orchid-forest","situ-patenggang"].map(id=>destinations.find(d=>d.id===id)).filter(Boolean);
  $("#heroPicks").innerHTML=picks.map(d=>`<button class="pick-card" data-detail="${d.id}">${safeImage(d.image,d.name)}<span><strong>${d.name}</strong><small><i class="fa-solid fa-location-dot"></i> ${d.location.split(",")[0]}</small><em>${rupiah(totalCost(d))} / orang</em></span></button>`).join("");
  $$("#heroPicks [data-detail]").forEach(b=>b.addEventListener("click",()=>openDetail(b.dataset.detail)));
}
function renderWeights(){
  weights = weights.map(w => Math.max(1, Math.min(MAX_WEIGHT, Number(w) || 1)));
  $("#weightControls").innerHTML = criteria.map((c,i)=>`
    <div class="weight-card">
      <div class="weight-card-head"><i class="fa-solid ${CRITERIA_ICONS[c.key]}"></i><div><strong>${c.short}</strong><small>${c.hint}</small></div><b class="weight-badge" id="badge-${c.key}">${weights[i]}<small>/10</small></b></div>
      <fieldset class="score-group" aria-label="Seberapa penting ${c.name}">
        ${Array.from({length:MAX_WEIGHT},(_,n)=>`<label class="score-option"><input type="radio" name="weight-${c.key}" value="${n+1}" data-weight-index="${i}" ${weights[i]===n+1?"checked":""}><span>${n+1}</span></label>`).join("")}
      </fieldset>
    </div>`).join("");
  $$('[data-weight-index]').forEach(input=>input.addEventListener('change',()=>{
    const idx=Number(input.dataset.weightIndex);weights[idx]=Number(input.value);$(`#badge-${criteria[idx].key}`).innerHTML=`${input.value}<small>/10</small>`;
    updateWeightTotal();
    setActivePreset(null);
  }));
  updateWeightTotal();
}
function updateWeightTotal(){
  const total=weights.reduce((a,b)=>a+b,0), max=criteria.length*MAX_WEIGHT;
  $("#weightTotal").textContent=`${total} / ${max} poin`;
  $("#weightBar").style.width=`${(total/max)*100}%`;
}
function setActivePreset(name){
  $$(".preset-btn").forEach(b=>b.classList.toggle("active",b.dataset.preset===name));
}
function applyPreset(name){
  weights=[...presets[name]];renderWeights();setActivePreset(name);
  showToast(`Preferensi "${({balanced:"Seimbang",cheap:"Hemat",comfort:"Nyaman",nature:"Pemandangan"})[name]}" diterapkan`);
}
function scoreDestination(d, normalizedWeights){
  const raw={cost:totalCost(d),facility:d.facility,beauty:d.beauty,cleanliness:d.cleanliness,safety:d.safety,access:d.access,activities:d.activities,comfort:d.comfort};
  return {destination:d,raw,normalized:{},contributions:{},score:0};
}
function calculateSAW(){
  const weightSum=weights.reduce((a,b)=>a+b,0);
  if(weightSum<=0){showToast("Atur minimal satu bobot lebih besar dari nol.");return;}
  const normalizedWeights=weights.map(w=>w/weightSum);
  const eligible=destinations.filter(d=>!$("#useBudget").checked||totalCost(d)<=Math.max(0,Number($("#maxBudget").value)||0));
  if(!eligible.length){lastResults=[];renderResults();showToast("Tidak ada wisata yang masuk budget. Coba naikkan batas anggaran.");return;}
  const rows=eligible.map(d=>scoreDestination(d,normalizedWeights));
  criteria.forEach((c,i)=>{
    const values=rows.map(r=>r.raw[c.key]);
    const positive=values.filter(v=>Number.isFinite(v)&&v>0);
    const min=positive.length?Math.min(...positive):0;
    const max=values.length?Math.max(...values):0;
    rows.forEach(r=>{
      const x=r.raw[c.key];
      let norm=0;
      if(c.attribute==="Cost"){
        // Biaya nol dianggap ideal untuk Cost. Jika seluruh nilai nol, semua alternatif setara pada kriteria ini.
        norm=max===0?1:(x===0?1:(min===0?0:min/x));
      }else{
        norm=max===0?0:x/max;
      }
      r.normalized[c.key]=norm;
      r.contributions[c.key]=norm*normalizedWeights[i];
      r.score+=r.contributions[c.key];
    });
  });
  rows.sort((a,b)=>b.score-a.score);
  lastResults=rows;
  renderResults();
  $("#resultSubtitle").textContent=`${rows.length} destinasi dihitung ulang berdasarkan ${criteria.filter((c,i)=>weights[i]>0).length} kriteria berbobot.`;
  $("#hasil").scrollIntoView({behavior:"smooth",block:"start"});
  showToast("Perhitungan SAW berhasil diperbarui.");
}
function renderResults(){
  const summary=$("#resultSummary");
  if(!lastResults.length){
    summary.innerHTML=`<div class="empty-results"><i class="fa-solid fa-route"></i><div><strong>Belum ada hasil rekomendasi</strong><p>Sesuaikan bobot dan hitung ulang untuk melihat ranking.</p></div><button class="btn btn-primary" id="emptyCalculate">Hitung sekarang <i class="fa-solid fa-calculator"></i></button></div>`;
    $("#emptyCalculate").addEventListener("click",calculateSAW);
    $("#calculationTable").innerHTML="";$("#compareSelected").disabled=true;return;
  }
  const top=lastResults.slice(0,3);
  summary.innerHTML=`<div class="top-results">${top.map((r,i)=>`
    <article class="result-card ${i===0?"winner":""}"><div class="result-card-image">${safeImage(r.destination.image,r.destination.name)}<span class="rank-badge">${i===0?"<i class=\"fa-solid fa-crown\"></i> Pilihan teratas":`Peringkat #${i+1}`}</span></div>
    <div class="result-card-body"><div class="destination-location"><i class="fa-solid fa-location-dot"></i> ${r.destination.location}</div><h3>${r.destination.name}</h3>
    <div class="score-line"><div><small>Nilai SAW</small><strong>${Math.round(r.score*10)}<small class="score-denom">/10</small></strong></div><div><small>Estimasi total / orang</small><strong class="cost-value">${rupiah(totalCost(r.destination))}</strong></div></div>
    <div class="result-card-actions"><button data-result-detail="${r.destination.id}">Lihat detail</button><button data-compare="${r.destination.id}" class="${comparison.has(r.destination.id)?"selected":""}">${comparison.has(r.destination.id)?"<i class=\"fa-solid fa-check\"></i> Dipilih":"Bandingkan"}</button></div></div></article>`).join("")}</div>`;
  $$("[data-result-detail]").forEach(b=>b.addEventListener("click",()=>openDetail(b.dataset.resultDetail)));
  $$("[data-compare]").forEach(b=>b.addEventListener("click",()=>toggleComparison(b.dataset.compare)));
  $("#compareSelected").disabled=comparison.size<2;
  renderCalculationTable();
  
}
function renderCalculationTable(){
  if(!lastResults.length)return;
  const heads=criteria.map(c=>`<th title="${c.name}">${c.code} norm.</th>`).join("");
  const rows=lastResults.map((r,i)=>`<tr class="${i===0?"ranked-row":""}"><td><strong>#${i+1} ${r.destination.name}</strong></td>${criteria.map(c=>`<td>${fmt(r.normalized[c.key])}</td>`).join("")}<td>${Math.round(r.score*10)}/10</td><td>${rupiah(totalCost(r.destination))}</td></tr>`).join("");
  const contributionRows=lastResults.map((r,i)=>`<tr class="${i===0?"ranked-row":""}"><td><strong>#${i+1} ${r.destination.name}</strong></td>${criteria.map(c=>`<td>${fmt(r.contributions[c.key])}</td>`).join("")}<td><strong>${Math.round(r.score*10)}/10</strong></td></tr>`).join("");
  const rawRows=lastResults.map((r,i)=>`<tr><td><strong>${r.destination.name}</strong></td>${criteria.map(c=>`<td>${c.key==="cost"?rupiah(r.raw[c.key]):r.raw[c.key]}</td>`).join("")}</tr>`).join("");
  $("#calculationTable").innerHTML=`
  <div class="table-note"><strong>Data mentah (X).</strong> Nilai kualitas menggunakan skala simulasi 1–10; biaya dalam rupiah.</div>
  <table><thead><tr><th>Alternatif</th>${criteria.map(c=>`<th>${c.code} · ${c.attribute}</th>`).join("")}</tr></thead><tbody>${rawRows}</tbody></table>`;
  $("#calculationTable").classList.toggle("hidden",!tableVisible);
  $("#toggleTable").innerHTML=(tableVisible?"Sembunyikan tabel":"Tampilkan tabel")+` <i class="fa-solid fa-chevron-${tableVisible?"up":"down"}"></i>`;
}
function openDetail(id){
  const d=destinations.find(x=>x.id===id);if(!d)return;
  const r=lastResults.find(x=>x.destination.id===id);
  $("#modalContent").innerHTML=`${safeImage(d.image,d.name).replace("<img ","<img class=\"modal-image\" ")}
    <small>${d.category} di ${d.area}</small><h2 id="modalTitle">${d.name}</h2><p>${d.desc} Informasi biaya dan skor pada prototipe ini merupakan data demonstrasi, bukan kutipan harga resmi.</p>
    <div class="modal-meta"><div><small>Tiket masuk</small><strong>${rupiah(d.ticket)}</strong></div><div><small>Parkir</small><strong>${rupiah(d.parking)}</strong></div><div><small>Total estimasi</small><strong>${rupiah(totalCost(d))}</strong></div><div><small>Makan</small><strong>${rupiah(d.food)}</strong></div><div><small>Transportasi</small><strong>${rupiah(d.transport)}</strong></div><div><small>Biaya tambahan</small><strong>${rupiah(d.extra)}</strong></div></div>
    <h3>Skor kriteria (simulasi)</h3><div class="modal-criteria">${criteria.filter(c=>c.key!=="cost").map(c=>`<div class="criterion-pill"><span>${c.name}</span><strong>${d[c.key]}/10</strong></div>`).join("")}</div>
    ${r?`<p style="margin-top:16px"><strong>Nilai SAW saat ini: ${Math.round(r.score*10)}/10, peringkat #${lastResults.indexOf(r)+1}</strong></p>`:""}
    <p><small>Catatan: cek harga, jam operasional, akses, dan biaya aktual dari sumber resmi sebelum berangkat. Biaya pungutan liar tidak diasumsikan atau dituduhkan pada destinasi mana pun.</small></p>
    <button class="btn btn-primary" id="modalCompare">${comparison.has(id)?"Hapus dari perbandingan":"Bandingkan destinasi"} <i class="fa-solid fa-code-compare"></i></button>`;
  $("#modalCompare").addEventListener("click",()=>{toggleComparison(id);openDetail(id);});
  $("#modalBackdrop").classList.remove("hidden");
}
function toggleComparison(id){
  if(comparison.has(id)){comparison.delete(id);showToast("Destinasi dihapus dari perbandingan.");}
  else if(comparison.size>=3){showToast("Maksimal bandingkan 3 destinasi.");return;}
  else{comparison.add(id);showToast("Destinasi ditambahkan ke perbandingan.");}
  $("#compareSelected").disabled=comparison.size<2;
  renderResults();
}
function openComparePicker(){
  $("#modalContent").innerHTML=`<h2 id="modalTitle">Pilih 2–3 wisata.</h2><p>Pilih destinasi yang ingin dibandingkan. Data biaya di sini adalah estimasi simulasi.</p>
  <div class="compare-select-list">${destinations.map(d=>`<label class="compare-select-item">${safeImage(d.image,d.name)}<span>${d.name}<small>${rupiah(totalCost(d))} / orang</small></span><input type="checkbox" value="${d.id}" ${comparison.has(d.id)?"checked":""} aria-label="Bandingkan ${d.name}"></label>`).join("")}</div>
  <button class="btn btn-primary" id="doCompare">Lihat perbandingan</button>`;
  $$('input[type="checkbox"]',$("#modalContent")).forEach(input=>input.addEventListener("change",()=>{
    if(input.checked){if(comparison.size>=3){input.checked=false;showToast("Maksimal bandingkan 3 destinasi.");return;}comparison.add(input.value);}
    else comparison.delete(input.value);
    $("#compareSelected").disabled=comparison.size<2;
  }));
  $("#doCompare").addEventListener("click",renderCompareTable);
  $("#modalBackdrop").classList.remove("hidden");
}
function renderCompareTable(){
  if(comparison.size<2){showToast("Pilih minimal dua destinasi.");return;}
  const chosen=[...comparison].map(id=>destinations.find(d=>d.id===id)).filter(Boolean);
  const row=(label,fn)=>`<tr><th>${label}</th>${chosen.map(fn).join("")}</tr>`;
  const rankFor=d=>lastResults.findIndex(r=>r.destination.id===d.id);
  $("#modalContent").innerHTML=`<h2 id="modalTitle">Mana yang lebih cocok?</h2><p>Bandingkan estimasi biaya dan skor kriteria sebelum menentukan pilihan.</p><div style="overflow:auto"><table class="compare-modal-table"><thead><tr><th>Kriteria</th>${chosen.map(d=>`<th>${d.name}</th>`).join("")}</tr></thead><tbody>
  ${row("Total biaya",d=>`<td><strong>${rupiah(totalCost(d))}</strong></td>`)}
  ${row("Tiket",d=>`<td>${rupiah(d.ticket)}</td>`)}${row("Parkir",d=>`<td>${rupiah(d.parking)}</td>`)}${row("Makan",d=>`<td>${rupiah(d.food)}</td>`)}${row("Transportasi",d=>`<td>${rupiah(d.transport)}</td>`)}${row("Biaya tambahan",d=>`<td>${rupiah(d.extra)}</td>`)}
  ${criteria.filter(c=>c.key!=="cost").map(c=>row(c.name,d=>`<td>${d[c.key]}/10</td>`)).join("")}
  ${row("Nilai SAW",d=>`<td><strong>${lastResults.find(r=>r.destination.id===d.id)?Math.round(lastResults.find(r=>r.destination.id===d.id).score*10)+"/10":"—"}</strong></td>`)}
  ${row("Peringkat SAW",d=>`<td>${rankFor(d)>=0?"#"+(rankFor(d)+1):"Belum dihitung"}</td>`)}
  </tbody></table></div><p><small>Skor kualitas dan biaya pada prototipe merupakan data simulasi. Nilai SAW hanya tersedia setelah perhitungan dijalankan.</small></p><button class="btn btn-outline" id="backCompare">Ubah pilihan</button>`;
  $("#backCompare").addEventListener("click",openComparePicker);
}
function closeModal(){ $("#modalBackdrop").classList.add("hidden"); }
function init(){
  renderHeroPicks();renderDestinations();renderWeights();renderResults();
  $$(".preset-btn").forEach(b=>b.addEventListener("click",()=>applyPreset(b.dataset.preset)));
  $("#resetWeights").addEventListener("click",()=>applyPreset("balanced"));
  $("#calculateBtn").addEventListener("click",calculateSAW);
  $("#emptyCalculate").addEventListener("click",calculateSAW);
  $("#useBudget").addEventListener("change",e=>{$("#maxBudget").disabled=!e.target.checked;});
  $("#categoryRow").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;selectedCategory=b.dataset.category;$$(".category-chip").forEach(x=>x.classList.toggle("selected",x===b));renderDestinations();});
  $("#areaFilter").addEventListener("change",e=>{selectedArea=e.target.value;renderDestinations();});
  $("#budgetFilter").addEventListener("change",e=>{selectedBudget=e.target.value;renderDestinations();});
  $("#quickFind").addEventListener("click",()=>{$("#jelajahi").scrollIntoView({behavior:"smooth"});showToast("Destinasi disaring sesuai pilihanmu.");});
  $("#showAll").addEventListener("click",()=>{selectedCategory="all";selectedArea="all";selectedBudget="all";$("#areaFilter").value="all";$("#budgetFilter").value="all";$$(".category-chip").forEach(x=>x.classList.toggle("selected",x.dataset.category==="all"));renderDestinations();showToast("Semua destinasi ditampilkan.");});
  $("#scrollLeft").addEventListener("click",()=>$("#destinationGrid").scrollBy({left:-400,behavior:"smooth"}));
  $("#scrollRight").addEventListener("click",()=>$("#destinationGrid").scrollBy({left:400,behavior:"smooth"}));
  $("#toggleTable").addEventListener("click",()=>{tableVisible=!tableVisible;$("#calculationTable").classList.toggle("hidden",!tableVisible);$("#toggleTable").innerHTML=(tableVisible?"Sembunyikan tabel":"Tampilkan tabel")+` <i class="fa-solid fa-chevron-${tableVisible?"up":"down"}"></i>`;});
  $("#compareSelected").addEventListener("click",openComparePicker);
  $("#modalClose").addEventListener("click",closeModal);
  $("#modalBackdrop").addEventListener("click",e=>{if(e.target===$("#modalBackdrop"))closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
  $("#menuToggle").addEventListener("click",()=>setMenu($("#menuToggle").getAttribute("aria-expanded")!=="true"));
  $$(".nav-link").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false);});
}
init();

/* ---------- Header, loader ---------- */
function setMenu(open){
  $("#menuToggle").setAttribute("aria-expanded",String(open));
  $("#menuToggle").setAttribute("aria-label",open?"Tutup menu":"Buka menu");
  $("#mainNav").classList.toggle("open",open);
  document.body.classList.toggle("menu-open",open);
  if(open) header.classList.remove("nav-hidden");
}

/* Navbar: sembunyi saat scroll turun, muncul lagi saat scroll naik sedikit */
const header = $("#siteHeader");
let lastY = scrollY;
addEventListener("scroll", ()=>{
  const y = scrollY, delta = y - lastY;
  header.classList.toggle("scrolled", y > 40);
  if(!document.body.classList.contains("menu-open")){
    if(y < 80 || delta < -4) header.classList.remove("nav-hidden");
    else if(delta > 6) header.classList.add("nav-hidden");
  }
  lastY = y;
}, {passive:true});

/* Tandai menu aktif sesuai bagian yang sedang dilihat */
const navObserver = new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting) $$(".main-nav .nav-link").forEach(l=>l.classList.toggle("active", l.getAttribute("href")==="#"+e.target.id));
}),{rootMargin:"-45% 0px -50% 0px"});
["beranda","jelajahi","rekomendasi","tentang"].forEach(id=>navObserver.observe($("#"+id)));

function hideLoader(){
  const loader = $("#loader");
  if (loader.classList.contains("done")) return;
  $("#loaderBar").style.width = "100%";
  setTimeout(()=>loader.classList.add("done"), 350);
}
function initLoader(){
  // GIF belum ada? pakai animasi SVG bawaan.
  const gif = $("#loaderGif");
  gif.addEventListener("error", ()=>{gif.classList.add("hidden"); $("#loaderSvg").classList.remove("hidden");});
  let progress = 10; const tick = setInterval(()=>{progress=Math.min(progress+8,90); $("#loaderBar").style.width=progress+"%";},200);
  const pageReady = new Promise(r=>addEventListener("load",r,{once:true}));
  const minTime = new Promise(r=>setTimeout(r,1500));
  const timeout = new Promise(r=>setTimeout(r,9000));
  Promise.race([Promise.all([pageReady,minTime]), timeout]).then(()=>{clearInterval(tick);hideLoader();});
}
initLoader();
