'use strict';
const $ = id => document.getElementById(id);
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function persist(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { notify('Browser storage is unavailable. Export events before closing this page.'); return false; } }
function notify(message) { $('notice').textContent = message; $('notice').hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => $('notice').hidden = true, 6000); }
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d,12); };
const now = new Date();
let selected = dateKey(now), view = new Date(now.getFullYear(), now.getMonth(), 1);
let events = read('daylight.events', []);
if (!Array.isArray(events)) events = [];
events = events.filter(e => e && typeof e.id === 'string' && typeof e.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date));
let editing = null, unit = read('daylight.unit', 'fahrenheit'), locationChoice = read('daylight.location', null), forecastData = null, forecastController = null;
if (!['fahrenheit','celsius'].includes(unit)) unit = 'fahrenheit';
function renderCalendar() {
  $('calendar-title').textContent = view.toLocaleDateString(undefined, {month:'long',year:'numeric'});
  $('calendar').replaceChildren();
  const start = new Date(view.getFullYear(), view.getMonth(), 1-view.getDay());
  const total = Math.ceil((view.getDay()+new Date(view.getFullYear(),view.getMonth()+1,0).getDate())/7)*7;
  for (let i=0;i<total;i++) {
    const d = new Date(start.getFullYear(),start.getMonth(),start.getDate()+i), key = dateKey(d);
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'day'+(d.getMonth()!==view.getMonth()?' other':'')+(key===dateKey(new Date())?' today':'')+(key===selected?' selected':'');
    const count = events.filter(e=>e.date===key).length;
    button.setAttribute('aria-label', d.toLocaleDateString(undefined,{dateStyle:'full'})+(count?`, ${count} event${count===1?'':'s'}`:''));
    button.setAttribute('aria-pressed', String(key===selected));
    if (key===dateKey(new Date())) button.setAttribute('aria-current','date');
    const number=document.createElement('span');number.className='number';number.textContent=d.getDate();button.append(number);
    if(count){const dot=document.createElement('span');dot.className='dot';button.append(dot);}
    button.onclick = () => { selected=key; view = new Date(d.getFullYear(),d.getMonth(),1); renderCalendar(); renderAgenda(); };
    $('calendar').append(button);
  }
}
function renderAgenda() {
  const d=parseDate(selected); $('selected-title').textContent=d.toLocaleDateString(undefined,{weekday:'long'});
  const list=events.filter(e=>e.date===selected).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  $('selected-subtitle').textContent=d.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})+` · ${list.length} event${list.length===1?'':'s'}`;
  $('events').replaceChildren();
  if(!list.length) { const empty=document.createElement('div');empty.className='empty-events';empty.innerHTML='<span aria-hidden="true">☷</span><h3>A little breathing room.</h3><p>No plans for this day yet.<br>Tap + to add something to look forward to.</p>';$('events').append(empty); }
  list.forEach(e=>{const button=document.createElement('button');button.className='event-item';button.type='button';button.setAttribute('aria-label',`Edit ${e.title}`);const time=document.createElement('time');time.textContent=e.time||'All day';const title=document.createElement('strong');title.textContent=e.title;button.append(time,title);if(e.notes){const p=document.createElement('p');p.textContent=e.notes;button.append(p);}button.onclick=()=>openEvent(e);$('events').append(button);});
}
function openEvent(event=null) {
  editing=event?.id||null; $('dialog-title').textContent=event?'A plan for your day':'Make a little plan';
  $('event-title').value=event?.title||'';$('event-date').value=event?.date||selected;$('event-time').value=event?.time||'';$('event-notes').value=event?.notes||'';$('delete-event').hidden=!event;$('event-dialog').showModal();
}
$('add-event').onclick=()=>openEvent();$('close-dialog').onclick=()=>$('event-dialog').close();
$('event-form').onsubmit=e=>{e.preventDefault();const title=$('event-title').value.trim();if(!title){$('event-title').setCustomValidity('Please enter an event title.');$('event-title').reportValidity();return;}
  const event={id:editing||(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`),title,date:$('event-date').value,time:$('event-time').value,notes:$('event-notes').value.trim()};
  events=events.filter(x=>x.id!==editing);events.push(event);persist('daylight.events',events);selected=event.date;const d=parseDate(selected);view=new Date(d.getFullYear(),d.getMonth(),1);$('event-dialog').close();renderCalendar();renderAgenda();};
$('event-title').oninput=()=>$('event-title').setCustomValidity('');
$('delete-event').onclick=()=>{events=events.filter(e=>e.id!==editing);persist('daylight.events',events);$('event-dialog').close();renderCalendar();renderAgenda();};
$('previous').onclick=()=>{view.setMonth(view.getMonth()-1);renderCalendar();};$('next').onclick=()=>{view.setMonth(view.getMonth()+1);renderCalendar();};
$('today').onclick=()=>{const d=new Date();selected=dateKey(d);view=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar();renderAgenda();};
function download(contents,type,filename){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function icsEscape(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
// Fold long iCalendar lines at UTF-8 byte boundaries (RFC 5545).
function foldLine(line){let result='',part='',bytes=0;for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>75){result+=part+'\r\n';part=' ';bytes=1;}part+=c;bytes+=size;}return result+part;}
$('backup').onclick=()=>{const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Daylight//Calendar//EN','CALSCALE:GREGORIAN'];events.forEach(e=>{lines.push('BEGIN:VEVENT',`UID:${e.id}@daylight.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z')}`);if(e.time){lines.push(`DTSTART:${e.date.replace(/-/g,'')}T${e.time.replace(':','')}00`);}else{const end=parseDate(e.date);end.setDate(end.getDate()+1);lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${dateKey(end).replace(/-/g,'')}`);}lines.push(`SUMMARY:${icsEscape(e.title)}`,`DESCRIPTION:${icsEscape(e.notes||'')}`,'END:VEVENT');});lines.push('END:VCALENDAR');download(lines.map(foldLine).join('\r\n')+'\r\n','text/calendar;charset=utf-8','daylight-events.ics');notify('Calendar exported. Import the .ics file into your calendar app.');};
const weatherType=code=>{if(code===0)return ['☀','Clear skies'];if(code<=3)return ['⛅','Partly cloudy'];if(code<=48)return ['☁','Foggy'];if(code<=57)return ['🌦','Drizzle'];if(code<=67)return ['🌧','Rain'];if(code<=77)return ['❄','Snow'];if(code<=82)return ['🌧','Rain showers'];if(code<=86)return ['❄','Snow showers'];return ['⛈','Thunderstorms'];};
function renderWeather(){
  $('fahrenheit').setAttribute('aria-pressed',String(unit==='fahrenheit'));$('celsius').setAttribute('aria-pressed',String(unit==='celsius'));
  if(!forecastData)return;
  const data=forecastData, convert=t=>Math.round(unit==='fahrenheit'?t*9/5+32:t), current=data.current;
  const [symbol,label]=weatherType(current.weather_code);$('weather-icon').textContent=symbol;$('temperature').textContent=`${convert(current.temperature_2m)}°`;$('condition').textContent=label;
  $('feels').textContent=`${convert(current.apparent_temperature)}°`;$('humidity').textContent=`${current.relative_humidity_2m}%`;$('wind').textContent=unit==='fahrenheit'?`${Math.round(current.wind_speed_10m/1.609344)} mph`:`${Math.round(current.wind_speed_10m)} km/h`;
  $('forecast').replaceChildren();data.daily.time.forEach((day,i)=>{const div=document.createElement('div');div.className='forecast-day';const heading=document.createElement('span');heading.textContent=i===0?'Today':parseDate(day).toLocaleDateString(undefined,{weekday:'short'});const icon=document.createElement('span');icon.className='forecast-symbol';const [emoji,condition]=weatherType(data.daily.weather_code[i]);icon.textContent=emoji;icon.setAttribute('role','img');icon.setAttribute('aria-label',condition);const temps=document.createElement('div');temps.className='forecast-temp';temps.textContent=`${convert(data.daily.temperature_2m_max[i])}°`;const low=document.createElement('span');low.className='forecast-low';low.textContent=`${convert(data.daily.temperature_2m_min[i])}°`;temps.append(low);div.append(heading,icon,temps);$('forecast').append(div);});
}
async function fetchJson(url,signal){const response=await fetch(url,{signal});if(!response.ok)throw new Error('Request failed');return response.json();}
async function loadWeather(place){
  forecastController?.abort();const controller=new AbortController();forecastController=controller;
  $('location-name').textContent=place.name;$('weather-status').textContent='Updating forecast…';
  forecastData=null;$('temperature').textContent='—°';$('condition').textContent='Loading weather…';$('weather-icon').textContent='☁';['feels','humidity','wind'].forEach(id=>$(id).textContent='—');$('forecast').replaceChildren();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{const params=new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min',forecast_days:'7',timezone:'auto'});
    const data=await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`,controller.signal);
    if(!data.current||!data.daily?.time||data.current.temperature_2m==null)throw new Error('Incomplete weather response');
    forecastData=data;locationChoice=place;persist('daylight.location',place);renderWeather();$('weather-status').textContent=`Updated ${new Date().toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})} · Forecast in ${data.timezone.replace(/_/g,' ')}`;
  }catch(error){if(forecastController!==controller)return;$('condition').textContent='Weather unavailable';$('weather-status').textContent='Couldn’t load weather. Check your connection and search again.';const p=document.createElement('p');p.className='muted forecast-empty';p.textContent='Forecast unavailable. Please try again.';$('forecast').replaceChildren(p);}finally{clearTimeout(timer);}
}
let searchController;
$('search-form').onsubmit=async e=>{e.preventDefault();const query=$('city').value.trim();if(query.length<2)return;searchController?.abort();const controller=new AbortController();searchController=controller;const timer=setTimeout(()=>controller.abort(),15000);$('search-results').textContent='Searching…';
  try{const data=await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name:query,count:'5',language:'en',format:'json'})}`,controller.signal);if(searchController!==controller)return;$('search-results').replaceChildren();if(!data.results?.length){$('search-results').textContent='No cities found. Try a nearby city.';return;}
    data.results.forEach(place=>{const button=document.createElement('button');button.type='button';button.textContent=[place.name,place.admin1,place.country].filter(Boolean).join(', ');button.onclick=()=>{$('search-results').replaceChildren();$('city').value='';loadWeather({name:place.name,latitude:place.latitude,longitude:place.longitude});};$('search-results').append(button);});
  }catch{if(searchController===controller)$('search-results').textContent='Search unavailable. Check your connection and try again.';}finally{clearTimeout(timer);}
};
$('locate').onclick=()=>{if(!navigator.geolocation){notify('Location isn’t supported. Search for your city instead.');return;}$('locate').disabled=true;$('weather-status').textContent='Waiting for your location permission…';navigator.geolocation.getCurrentPosition(position=>{$('locate').disabled=false;loadWeather({name:'Your location',latitude:position.coords.latitude,longitude:position.coords.longitude});},()=>{$('locate').disabled=false;$('weather-status').textContent='Location unavailable. Search for your city instead.';},{timeout:12000,maximumAge:300000});};
['fahrenheit','celsius'].forEach(value=>$(value).onclick=()=>{unit=value;persist('daylight.unit',unit);renderWeather();});
function tick(){const d=new Date();$('clock').textContent=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});$('full-date').textContent=d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();}
tick();setInterval(tick,30000);renderCalendar();renderAgenda();renderWeather();if(locationChoice&&Number.isFinite(locationChoice.latitude)&&Number.isFinite(locationChoice.longitude))loadWeather(locationChoice);
