// --- CONFIGURE YOUR API KEYS & ENDPOINTS HERE ---
const HINDU_RSS_URL = 'https://www.thehindu.com/opinion/editorial/?service=rss';
const RSS2JSON_KEY  = 'qhdcvpx2fajybtctr4y16ztbcw9mvpf6v0fntgwk';           // https://rss2json.com
const NEWSAPI_KEY   = 'pub_3536f71434904ae1bef5c891c7c872db';                // https://newsapi.org
// RBI might not offer a JSON; use a custom endpoint or mock JSON.
const RBI_RULES_URL = 'https://gist.githubusercontent.com/rahul-kumar1431/29c7bac577bac41eaa5ae904cdee84dd/raw/aa944d3ac83b73bba9fb110b74fd2a13536f8134/bank-rules.json';                  
const BANK_RATES_URL= 'https://gist.githubusercontent.com/rahul-kumar1431/0cdbd2c016ea69e7bc0be4ee6632f3e5/raw/c4e0b4cfd85b058f880894f687d949d028408ef1/bank-rates.json';                 

// --- UTILS ---
function el(id){ return document.getElementById(id); }
function sanitize(html){ return html; /* Or use a library */ }

// --- FETCH & RENDER EDITORIAL ---
async function loadEditorial(){
  let out = 'Unable to load editorial.';
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(HINDU_RSS_URL)}&api_key=${RSS2JSON_KEY}`
    );
    const { items } = await res.json();
    // pick today's top item
    const item = items[0];
    // Highlight a few vocab words
    let content = sanitize(item.contentSnippet);
    const vocab = {
      crisis:  'संकट', 
      immediate: 'तत्काल',
      stability: 'स्थिरता',
    };
    // wrap each vocab
    Object.keys(vocab).forEach(word => {
      const re = new RegExp(`\\b${word}\\b`, 'gi');
      content = content.replace(re, `<span class="vocab" data-meaning="${vocab[word]}">${word}</span>`);
    });
    out = `<p>${content}</p><p><a href="${item.link}" target="_blank">Read more…</a></p>`;
  } catch(e){}
  el('editorial-content').innerHTML = out;
}

// --- FETCH & RENDER SYNONYMS (PLACEHOLDER) ---
async function loadSynonyms(){
  // In practice, fetch from your own endpoint
  const sample = [
    ['Abandon','त्यागना'], ['Boost','बढ़ावा देना'], 
    ['Convey','व्यक्त करना'], ['Deter','रोकना'],
    /* … up to 15 … */
  ];
  const ul = el('syn-list');
  ul.innerHTML = sample.map(pair=>
    `<li>${pair[0]} – ${pair[1]}</li>`
  ).join('');
}

// --- CURRENT AFFAIRS via NewsAPI ---
async function loadCurrentAffairs(){
  let html = 'Unable to fetch news.';
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&category=general&pageSize=5&apiKey=${NEWSAPI_KEY}`
    );
    const { articles } = await res.json();
    html = articles.map(a=>
      `<p><strong>${a.title}</strong><br/><em>${new Date(a.publishedAt).toLocaleDateString()}</em><br/>
       ${a.description || ''} <a href="${a.url}" target="_blank">[more]</a></p>`
    ).join('');
  } catch(e){}
  el('ca-content').innerHTML = html;
}

// --- RBI Rules & News ---
async function loadRbiNews(){
  let html = 'Unable to fetch RBI updates.';
  try {
    const res = await fetch(RBI_RULES_URL);
    const data = await res.json(); // { rule: "...", note: "..." }
    html = `<p>${data.rule}</p><p><em>${data.note}</em></p>`;
  } catch(e){}
  el('rbi-content').innerHTML = html;
}

// --- Bank Rates Box ---
async function loadBankRates(){
  let html = 'Unable to fetch rates.';
  try {
    const res = await fetch(BANK_RATES_URL);
    const rates = await res.json(); 
    html = `
      <p>Repo Rate: ${rates.repo}%</p>
      <p>Reverse Repo: ${rates.reverseRepo}%</p>
      <p>CRR: ${rates.crr}%</p>
      <p>SLR: ${rates.slr}%</p>
    `;
  } catch(e){}
  el('rates-content').innerHTML = html;
}

// --- ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  loadEditorial();
  loadSynonyms();
  loadCurrentAffairs();
  loadRbiNews();
  loadBankRates();
});
