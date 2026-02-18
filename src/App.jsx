import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MONETIZATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const MONEY = {
  transactionFee: 0.10,
  plans: [
    { id:"free",    name:"Free",    price:0,   color:"#64748b", icon:"🆓", bookingFee:0.15, boosts:0,  badge:false, maxTrucks:1  },
    { id:"starter", name:"Starter", price:49,  color:"#2EC4B6", icon:"⚡", bookingFee:0.10, boosts:2,  badge:false, maxTrucks:3  },
    { id:"pro",     name:"Pro",     price:99,  color:"#FF6B35", icon:"🔥", bookingFee:0.08, boosts:5,  badge:true,  maxTrucks:10 },
    { id:"elite",   name:"Elite",   price:199, color:"#7B2FBE", icon:"👑", bookingFee:0.05, boosts:-1, badge:true,  maxTrucks:-1 },
  ],
  boosts: [
    { id:"day",   label:"1 Day",   price:9,  duration:1  },
    { id:"week",  label:"7 Days",  price:29, duration:7, popular:true },
    { id:"month", label:"30 Days", price:79, duration:30 },
  ],
  insurance: [
    { id:"basic",    label:"Basic",    price:15, coverage:"$10k",  color:"#64748b" },
    { id:"standard", label:"Standard", price:29, coverage:"$50k",  color:"#2EC4B6", popular:true },
    { id:"full",     label:"Full",     price:49, coverage:"$100k", color:"#22c55e" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════
const DAYS_OF_WEEK = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS   = {mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"};

// Each truck has independent pricing, availability, add-ons, coupons, deposit
const SEED_TRUCKS = [
  {
    id:1, vendorId:10, provider:"HaulPro", size:"10 ft", payload:"2,000 lbs",
    color:"#FF6B35", img:"🚛", available:true, payoutMethod:"stripe",
    status:"approved", plan:"pro", boostActive:true, boostExpiry:"Feb 24",
    lat:30.2672, lng:-97.7431, address:"East Austin, TX",
    earnings:4290, bookingsCount:31, rating:4.8, reviews:312,
    // Per-truck pricing
    pricing:{ hourly:39, daily:249, weekendRate:49, minimumHours:2, afterHoursSurcharge:15, mileageFee:0.85, freeMiles:50 },
    // Insurance
    insurance:{ provider:"State Farm", policyNo:"SF-2024-8821", expiry:"2027-03-01", verified:true },
    // Deposit
    deposit:{ required:true, amount:150 },
    // Add-ons
    addons:[ {id:"ramp",label:"Loading Ramp",price:0,included:true}, {id:"dolly",label:"Moving Dolly",price:15}, {id:"pads",label:"Furniture Pads (12)",price:20}, {id:"straps",label:"Cargo Straps",price:10} ],
    // Coupons
    coupons:[ {code:"HAUL10",discount:10,type:"percent",uses:0,maxUses:50,active:true}, {code:"FIRST20",discount:20,type:"flat",uses:3,maxUses:100,active:true} ],
    // Availability (which hours each day, plus blocked dates)
    schedule:{ mon:"7am–8pm",tue:"7am–8pm",wed:"7am–8pm",thu:"7am–8pm",fri:"7am–9pm",sat:"8am–6pm",sun:"Closed" },
    blockedDates:["2026-02-20","2026-02-21"],
    features:["Ramp included","Unlimited miles","24/7 roadside"],
  },
  {
    id:2, vendorId:10, provider:"HaulPro XL", size:"16 ft", payload:"4,000 lbs",
    color:"#E63946", img:"🚚", available:true, payoutMethod:"stripe",
    status:"approved", plan:"pro", boostActive:false, boostExpiry:null,
    lat:30.2780, lng:-97.7200, address:"East Austin, TX",
    earnings:2100, bookingsCount:14, rating:4.7, reviews:89,
    pricing:{ hourly:65, daily:399, weekendRate:75, minimumHours:3, afterHoursSurcharge:20, mileageFee:1.00, freeMiles:75 },
    insurance:{ provider:"State Farm", policyNo:"SF-2024-8822", expiry:"2027-03-01", verified:true },
    deposit:{ required:true, amount:250 },
    addons:[ {id:"liftgate",label:"Liftgate",price:35}, {id:"dolly",label:"Moving Dolly",price:15}, {id:"pads",label:"Furniture Pads (24)",price:35}, {id:"gps",label:"GPS Tracker",price:0,included:true} ],
    coupons:[ {code:"XL15",discount:15,type:"percent",uses:1,maxUses:30,active:true} ],
    schedule:{ mon:"8am–7pm",tue:"8am–7pm",wed:"8am–7pm",thu:"8am–7pm",fri:"8am–8pm",sat:"9am–5pm",sun:"Closed" },
    blockedDates:["2026-02-25"],
    features:["Liftgate","GPS tracker","24/7 roadside"],
  },
  {
    id:3, vendorId:11, provider:"MoveFast", size:"14 ft", payload:"3,100 lbs",
    color:"#2EC4B6", img:"📦", available:true, payoutMethod:"paypal",
    status:"approved", plan:"starter", boostActive:false, boostExpiry:null,
    lat:30.2849, lng:-97.7341, address:"North Austin, TX",
    earnings:6490, bookingsCount:22, rating:4.6, reviews:189,
    pricing:{ hourly:59, daily:349, weekendRate:69, minimumHours:2, afterHoursSurcharge:12, mileageFee:0.75, freeMiles:60 },
    insurance:{ provider:"Progressive", policyNo:"PG-9934-77", expiry:"2026-12-15", verified:true },
    deposit:{ required:false, amount:0 },
    addons:[ {id:"dolly",label:"Moving Dolly",price:0,included:true}, {id:"pads",label:"Furniture Pads (12)",price:15}, {id:"straps",label:"Cargo Straps",price:8} ],
    coupons:[ {code:"MOVE5",discount:5,type:"percent",uses:8,maxUses:200,active:true} ],
    schedule:{ mon:"8am–7pm",tue:"8am–7pm",wed:"8am–7pm",thu:"8am–7pm",fri:"8am–8pm",sat:"9am–6pm",sun:"Closed" },
    blockedDates:[],
    features:["Furniture pads","Dolly included","GPS"],
  },
  {
    id:4, vendorId:12, provider:"TruckGo", size:"16 ft", payload:"4,000 lbs",
    color:"#7B2FBE", img:"🏗️", available:false, payoutMethod:null,
    status:"approved", plan:"elite", boostActive:true, boostExpiry:"Mar 1",
    lat:30.2500, lng:-97.7500, address:"South Austin, TX",
    earnings:12750, bookingsCount:57, rating:4.9, reviews:540,
    pricing:{ hourly:75, daily:449, weekendRate:89, minimumHours:2, afterHoursSurcharge:18, mileageFee:0.90, freeMiles:100 },
    insurance:{ provider:"Allstate", policyNo:"AS-5512-003", expiry:"2027-06-30", verified:true },
    deposit:{ required:true, amount:200 },
    addons:[ {id:"liftgate",label:"Liftgate",price:0,included:true}, {id:"pads",label:"Furniture Pads (24)",price:25}, {id:"dolly",label:"Moving Dolly",price:15}, {id:"insurance",label:"Damage Waiver",price:39} ],
    coupons:[ {code:"GO20",discount:20,type:"flat",uses:12,maxUses:50,active:true}, {code:"ELITE10",discount:10,type:"percent",uses:0,maxUses:20,active:false} ],
    schedule:{ mon:"6am–9pm",tue:"6am–9pm",wed:"6am–9pm",thu:"6am–9pm",fri:"6am–10pm",sat:"7am–10pm",sun:"9am–5pm" },
    blockedDates:["2026-02-22","2026-02-23"],
    features:["Liftgate included","GPS","24/7 roadside"],
  },
];

const SEED_BOOKINGS = [
  { id:"TN-1042", customer:"Jordan Lee", truckId:4, date:"2026-01-28", hours:4, startTime:"9:00 AM", addons:["pads"], coupon:null, subtotal:300, deposit:200, insuranceFee:29, platformFee:24, total:553, status:"completed" },
  { id:"TN-1041", customer:"Sam Torres", truckId:1, date:"2026-01-25", hours:3, startTime:"8:00 AM", addons:["dolly","straps"], coupon:"HAUL10", subtotal:117, deposit:150, insuranceFee:15, platformFee:9.36, total:276, status:"completed" },
  { id:"TN-1040", customer:"Sam Torres", truckId:3, date:"2026-01-20", hours:6, startTime:"10:00 AM", addons:[], coupon:"MOVE5", subtotal:354, deposit:0, insuranceFee:29, platformFee:35.4, total:378, status:"completed" },
  { id:"TN-1039", customer:"Mia Chen",   truckId:4, date:"2026-01-15", hours:5, startTime:"7:00 AM", addons:["dolly"], coupon:null, subtotal:375, deposit:200, insuranceFee:49, platformFee:30, total:624, status:"completed" },
];

const PAYOUT_METHODS = [
  { id:"stripe", label:"Stripe", icon:"💳", color:"#635BFF" },
  { id:"paypal", label:"PayPal", icon:"🅿️", color:"#003087" },
  { id:"venmo",  label:"Venmo",  icon:"💸", color:"#008CFF" },
  { id:"ach",    label:"ACH",    icon:"🏦", color:"#22c55e" },
];

const MAP_BOUNDS = { latMin:30.17, latMax:30.37, lngMin:-97.88, lngMax:-97.62 };
const CITIES = [{name:"Austin, TX",lat:30.2672,lng:-97.7431},{name:"Houston, TX",lat:29.7604,lng:-95.3698},{name:"Dallas, TX",lat:32.7767,lng:-96.7970},{name:"San Antonio, TX",lat:29.4241,lng:-98.4936}];
const fmt = n => `$${Number(n).toLocaleString()}`;
const fmtPct = n => `${(n*100).toFixed(0)}%`;
function toXY(lat,lng,w,h){ return {x:((lng-MAP_BOUNDS.lngMin)/(MAP_BOUNDS.lngMax-MAP_BOUNDS.lngMin))*w, y:h-((lat-MAP_BOUNDS.latMin)/(MAP_BOUNDS.latMax-MAP_BOUNDS.latMin))*h}; }
function getDist(la1,lo1,la2,lo2){ const R=3958.8,dL=(la2-la1)*Math.PI/180,dG=(lo2-lo1)*Math.PI/180,a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dG/2)**2; return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }

// Generate time slots for a given day's schedule string e.g. "8am–6pm"
function getTimeSlots(scheduleStr) {
  if (!scheduleStr || scheduleStr === "Closed") return [];
  const parseHour = s => { const h=parseInt(s); return s.includes("pm")&&h!==12?h+12:s.includes("am")&&h===12?0:h; };
  const [startStr, endStr] = scheduleStr.split("–");
  const start = parseHour(startStr), end = parseHour(endStr);
  const slots = [];
  for (let h = start; h < end; h++) {
    const label = h < 12 ? `${h===0?12:h}:00 AM` : h === 12 ? "12:00 PM" : `${h-12}:00 PM`;
    slots.push(label);
  }
  return slots;
}

function getDayOfWeek(dateStr) {
  const days = ["sun","mon","tue","wed","thu","fri","sat"];
  return days[new Date(dateStr+"T12:00:00").getDay()];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════════════════════════════
function Badge({children,color="#FF6B35",dot=false}){
  const m={approved:"#22c55e",pending:"#f59e0b",rejected:"#ef4444",active:"#22c55e",suspended:"#ef4444",free:"#64748b",starter:"#2EC4B6",pro:"#FF6B35",elite:"#7B2FBE",completed:"#22c55e",verified:"#22c55e"};
  const c=m[color]||color;
  return <span style={{background:c+"18",color:c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>{dot&&<span style={{width:6,height:6,borderRadius:"50%",background:c}}/>}{children}</span>;
}
function Toast({msg,type}){ const bg=type==="error"?"#ef4444":type==="info"?"#3b82f6":"#22c55e"; return <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:bg,color:"#fff",padding:"12px 22px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 30px #00000040",animation:"slideIn 0.3s ease"}}>{msg}</div>; }
function Avatar({name="?",size=34,bg="linear-gradient(135deg,#FF6B35,#7B2FBE)"}){ return <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:size*0.36,flexShrink:0}}>{name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>; }
function Lbl({children}){ return <label style={{display:"block",fontSize:10,fontWeight:800,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,marginTop:12}}>{children}</label>; }
function Inp({style={}, ...props}){ return <input style={{width:"100%",padding:"9px 11px",border:"1.5px solid #334155",borderRadius:8,fontSize:13,fontFamily:"inherit",background:"#0f172a",color:"#f1f5f9",...style}} {...props}/>; }
function Select({style={},children,...props}){ return <select style={{width:"100%",padding:"9px 11px",border:"1.5px solid #334155",borderRadius:8,fontSize:13,fontFamily:"inherit",background:"#0f172a",color:"#f1f5f9",...style}} {...props}>{children}</select>; }

// ─── SVG Map ─────────────────────────────────────────────────────────────────
function TruckMap({trucks,userPos,selectedId,onSelect,radiusMiles}){
  const W=560,H=320;
  const uXY=userPos?toXY(userPos.lat,userPos.lng,W,H):null;
  const rPx=(radiusMiles*W)/((MAP_BOUNDS.lngMax-MAP_BOUNDS.lngMin)*69);
  return(
    <div style={{position:"relative",width:"100%",paddingBottom:"57%",borderRadius:14,overflow:"hidden"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        <rect width={W} height={H} fill="#0f1e2e"/>
        {[.25,.5,.75].map(f=><g key={f}><line x1={W*f} y1={0} x2={W*f} y2={H} stroke="#1a2e42" strokeWidth="1"/><line x1={0} y1={H*f} x2={W} y2={H*f} stroke="#1a2e42" strokeWidth="1"/></g>)}
        <path d={`M ${W*.42} 0 Q ${W*.44} ${H*.5} ${W*.46} ${H}`} stroke="#2d5078" strokeWidth="5" fill="none"/>
        <text x={W*.44} y={H*.45} fill="#172840" fontSize="26" fontWeight="800" textAnchor="middle" fontFamily="Georgia">AUSTIN</text>
        {uXY&&radiusMiles<50&&<circle cx={uXY.x} cy={uXY.y} r={rPx} fill="#3b82f610" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,3"/>}
        {trucks.map(t=>{
          const inB=t.lat>=MAP_BOUNDS.latMin&&t.lat<=MAP_BOUNDS.latMax&&t.lng>=MAP_BOUNDS.lngMin&&t.lng<=MAP_BOUNDS.lngMax;
          if(!inB)return null;
          const {x,y}=toXY(t.lat,t.lng,W,H); const isSel=t.id===selectedId;
          const plan=MONEY.plans.find(p=>p.id===t.plan);
          return(
            <g key={t.id} style={{cursor:"pointer"}} onClick={()=>onSelect(t.id===selectedId?null:t.id)}>
              {t.boostActive&&<circle cx={x} cy={y} r={isSel?24:18} fill={plan?.color+"22"} stroke={plan?.color} strokeWidth="1.5" strokeDasharray="3,2"/>}
              {isSel&&<circle cx={x} cy={y} r={24} fill={t.color+"22"}/>}
              <circle cx={x} cy={y} r={isSel?16:12} fill={t.available?t.color:"#334155"} stroke={isSel?"#fff":t.color+"88"} strokeWidth={isSel?2.5:1.5} style={{filter:isSel?`drop-shadow(0 0 8px ${t.color})`:"none",transition:"all 0.2s"}}/>
              <text x={x} y={y+4} textAnchor="middle" fontSize={isSel?11:9} style={{pointerEvents:"none"}}>{t.img}</text>
              {isSel&&<><rect x={x-42} y={y-44} width={84} height={20} rx={5} fill={t.color}/><text x={x} y={y-30} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="Georgia">{t.provider}</text></>}
            </g>
          );
        })}
        {uXY&&<><circle cx={uXY.x} cy={uXY.y} r={9} fill="#3b82f6" stroke="#fff" strokeWidth={2}/><circle cx={uXY.x} cy={uXY.y} r={3} fill="#fff"/><text x={uXY.x+12} y={uXY.y+4} fontSize="10" fill="#60a5fa" fontWeight="800" fontFamily="Georgia">You</text></>}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDLY-STYLE BOOKING MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function BookingModal({ truck, onClose, onConfirm }) {
  const [step, setStep] = useState(0); // 0=date, 1=time, 2=duration, 3=addons, 4=review
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [selHours, setSelHours] = useState(truck.pricing.minimumHours);
  const [selAddons, setSelAddons] = useState(truck.addons.filter(a=>a.included).map(a=>a.id));
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [selInsurance, setSelInsurance] = useState("standard");
  const [confirmed, setConfirmed] = useState(false);

  const STEP_LABELS = ["Date","Time","Duration","Add-ons","Review"];

  // Generate next 30 days
  const today = new Date();
  const calDays = Array.from({length:35},(_,i)=>{
    const d = new Date(today); d.setDate(today.getDate()+i);
    const str = d.toISOString().split("T")[0];
    const dow = getDayOfWeek(str);
    const closed = truck.schedule[dow]==="Closed";
    const blocked = truck.blockedDates.includes(str);
    return { str, label:d.getDate(), month:d.toLocaleString("default",{month:"short"}), dow, closed, blocked, available:!closed&&!blocked };
  });

  const timeSlots = selDate ? getTimeSlots(truck.schedule[getDayOfWeek(selDate)]) : [];

  // Check if weekend for weekend rate
  const isWeekend = selDate && ["fri","sat","sun"].includes(getDayOfWeek(selDate));
  const hourlyRate = isWeekend ? truck.pricing.weekendRate : truck.pricing.hourly;
  const isDay = selHours >= 8;
  const baseRate = isDay ? truck.pricing.daily : hourlyRate * selHours;

  const addonTotal = selAddons.filter(id=>!truck.addons.find(a=>a.id===id)?.included).reduce((sum,id)=>{
    const a = truck.addons.find(a=>a.id===id); return sum+(a?.price||0);
  },0);

  const insObj = MONEY.insurance.find(i=>i.id===selInsurance);
  const insuranceFee = insObj?.price || 0;

  let discount = 0;
  if (couponApplied) {
    if (couponApplied.type==="percent") discount = Math.round(baseRate*(couponApplied.discount/100));
    else discount = couponApplied.discount;
  }

  const subtotal = baseRate + addonTotal;
  const afterDiscount = Math.max(0, subtotal - discount);
  const platformFee = Math.round(afterDiscount * (MONEY.plans.find(p=>p.id===truck.plan)?.bookingFee||MONEY.transactionFee));
  const deposit = truck.deposit.required ? truck.deposit.amount : 0;
  const grandTotal = afterDiscount + insuranceFee + deposit;
  const vendorReceives = afterDiscount - platformFee;

  function applyCoupon() {
    const c = truck.coupons.find(c=>c.code.toUpperCase()===couponCode.toUpperCase()&&c.active);
    if (!c) { setCouponError("Invalid or expired code"); return; }
    setCouponApplied(c); setCouponError(""); showStep(3); // stay
  }

  function showStep(n) { setStep(n); }

  const pm = PAYOUT_METHODS.find(m=>m.id===truck.payoutMethod);

  if (confirmed) return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#1e293b",borderRadius:22,padding:36,maxWidth:420,width:"100%",textAlign:"center",animation:"fadeUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 18px",boxShadow:"0 8px 30px #22c55e30"}}>✅</div>
        <h2 style={{color:"#f1f5f9",fontWeight:900,fontSize:21,margin:"0 0 8px"}}>Booking Confirmed!</h2>
        <p style={{color:"#64748b",fontSize:13,lineHeight:1.7,marginBottom:22}}>{truck.provider} · {selDate} at {selTime}<br/>Duration: {selHours} hrs · {isDay?"Day rate":"Hourly rate"}</p>
        <div style={{background:"#0f172a",borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
          <div style={{color:"#f59e0b",fontWeight:800,fontSize:13,marginBottom:10}}>Payment instructions</div>
          <div style={{color:"#94a3b8",fontSize:12,lineHeight:1.7}}>
            Send <strong style={{color:"#fff"}}>{fmt(vendorReceives)}</strong> to {truck.provider} via {pm?.label||"their preferred method"} before pickup.
            {deposit>0&&<><br/>Deposit <strong style={{color:"#f59e0b"}}>{fmt(deposit)}</strong> held — returned after rental.</>}
          </div>
        </div>
        <button style={{width:"100%",padding:"12px",background:"#334155",color:"#94a3b8",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"auto"}} onClick={onClose}>
      <div style={{background:"#1e293b",borderRadius:22,width:"100%",maxWidth:560,boxShadow:"0 32px 80px #000",animation:"fadeUp 0.3s ease",overflow:"hidden",margin:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1A1A2E,#0F3460)",padding:"18px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,background:truck.color+"22",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{truck.img}</div>
              <div><div style={{color:"#f1f5f9",fontWeight:900,fontSize:15}}>{truck.provider}</div><div style={{color:"#64748b",fontSize:11}}>{truck.size} · 📍 {truck.address}</div></div>
            </div>
            <button style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:22}} onClick={onClose}>×</button>
          </div>
          {/* Step pills */}
          <div style={{display:"flex",gap:4}}>
            {STEP_LABELS.map((label,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",height:3,background:i<=step?truck.color:"#334155",borderRadius:2,transition:"background 0.3s"}}/>
                <span style={{fontSize:9,color:i===step?truck.color:i<step?"#22c55e":"#334155",fontWeight:i===step?800:500}}>{i<step?"✓ ":""}{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"22px",maxHeight:"65vh",overflowY:"auto"}}>

          {/* STEP 0 — Pick Date */}
          {step===0&&<div>
            <h3 style={{color:"#f1f5f9",fontWeight:900,fontSize:17,margin:"0 0 4px"}}>Pick a date</h3>
            <p style={{color:"#64748b",fontSize:12,marginBottom:16}}>Available dates shown in white</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:12}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#475569",fontWeight:700,paddingBottom:4}}>{d}</div>)}
              {/* offset for first day */}
              {Array.from({length:today.getDay()},(_,i)=><div key={"empty-"+i}/>)}
              {calDays.map(day=>(
                <button key={day.str} disabled={!day.available} onClick={()=>{setSelDate(day.str);setSelTime("");setStep(1);}} style={{aspectRatio:"1",border:`1.5px solid ${selDate===day.str?truck.color:day.available?"#334155":"transparent"}`,borderRadius:8,background:selDate===day.str?truck.color+"30":day.available?"#0f172a":"transparent",color:selDate===day.str?truck.color:day.available?"#f1f5f9":"#1e293b",fontWeight:selDate===day.str?900:500,fontSize:12,cursor:day.available?"pointer":"default",fontFamily:"inherit",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                  <span>{day.label}</span>
                  {day.label===1&&<span style={{fontSize:8,color:"inherit",opacity:0.7}}>{day.month}</span>}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:12,fontSize:11,color:"#64748b",flexWrap:"wrap"}}>
              {[["#334155","Available"],["transparent","Closed / Blocked"],[truck.color+"30","Selected"]].map(([bg,label])=><div key={label} style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:12,height:12,background:bg,border:"1px solid #475569",borderRadius:3}}/>{label}</div>)}
            </div>
          </div>}

          {/* STEP 1 — Pick Time */}
          {step===1&&<div>
            <button style={s.backBtn} onClick={()=>setStep(0)}>← Back</button>
            <h3 style={{color:"#f1f5f9",fontWeight:900,fontSize:17,margin:"0 0 4px"}}>Pick a start time</h3>
            <p style={{color:"#64748b",fontSize:12,marginBottom:16}}>{new Date(selDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {isWeekend?"Weekend rate applies":""}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {timeSlots.map(slot=>(
                <button key={slot} onClick={()=>{setSelTime(slot);setStep(2);}} style={{padding:"12px 8px",border:`1.5px solid ${selTime===slot?truck.color:"#334155"}`,borderRadius:10,background:selTime===slot?truck.color+"20":"#0f172a",color:selTime===slot?truck.color:"#94a3b8",fontWeight:selTime===slot?800:500,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                  {slot}
                </button>
              ))}
            </div>
          </div>}

          {/* STEP 2 — Duration */}
          {step===2&&<div>
            <button style={s.backBtn} onClick={()=>setStep(1)}>← Back</button>
            <h3 style={{color:"#f1f5f9",fontWeight:900,fontSize:17,margin:"0 0 4px"}}>How long do you need it?</h3>
            <p style={{color:"#64748b",fontSize:12,marginBottom:16}}>{selDate} starting {selTime}</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {Array.from({length:12-truck.pricing.minimumHours+1},(_,i)=>i+truck.pricing.minimumHours).map(h=>{
                const rate = h>=8 ? truck.pricing.daily : (isWeekend?truck.pricing.weekendRate:truck.pricing.hourly)*h;
                const tag = h>=8?"Day rate":isWeekend?"Weekend":"";
                return(
                  <button key={h} onClick={()=>{setSelHours(h);setStep(3);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",border:`1.5px solid ${selHours===h?truck.color:"#334155"}`,borderRadius:10,background:selHours===h?truck.color+"15":"#0f172a",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{color:selHours===h?truck.color:"#f1f5f9",fontWeight:700,fontSize:14}}>{h} hour{h!==1?"s":""}</span>
                      {tag&&<span style={{background:"#FF6B3520",color:"#FF6B35",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>{tag}</span>}
                    </div>
                    <span style={{color:"#22c55e",fontWeight:900,fontSize:16}}>{fmt(rate)}</span>
                  </button>
                );
              })}
            </div>
            <div style={{background:"#0f172a",borderRadius:10,padding:"10px 13px",fontSize:11,color:"#64748b"}}>
              Min {truck.pricing.minimumHours} hrs · After-hours surcharge: {fmt(truck.pricing.afterHoursSurcharge)}/hr · Free {truck.pricing.freeMiles} mi then {fmt(truck.pricing.mileageFee)}/mi
            </div>
          </div>}

          {/* STEP 3 — Add-ons */}
          {step===3&&<div>
            <button style={s.backBtn} onClick={()=>setStep(2)}>← Back</button>
            <h3 style={{color:"#f1f5f9",fontWeight:900,fontSize:17,margin:"0 0 4px"}}>Add-ons & extras</h3>
            <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Select what you need</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
              {truck.addons.map(addon=>{
                const checked = selAddons.includes(addon.id);
                return(
                  <div key={addon.id} onClick={()=>{if(addon.included)return;setSelAddons(prev=>checked?prev.filter(id=>id!==addon.id):[...prev,addon.id]);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:checked?"#22c55e10":"#0f172a",border:`1.5px solid ${checked?"#22c55e44":"#334155"}`,borderRadius:10,cursor:addon.included?"default":"pointer",transition:"all 0.15s"}}>
                    <div style={{width:20,height:20,borderRadius:5,background:checked?"#22c55e":"#334155",border:`2px solid ${checked?"#22c55e":"#475569"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12}}>{checked?"✓":""}</div>
                    <div style={{flex:1}}>
                      <div style={{color:"#f1f5f9",fontSize:13,fontWeight:600}}>{addon.label}</div>
                      {addon.included&&<div style={{color:"#22c55e",fontSize:10,fontWeight:700}}>Included free</div>}
                    </div>
                    <div style={{color:addon.included?"#22c55e":"#f1f5f9",fontWeight:800,fontSize:14}}>{addon.included?"Free":fmt(addon.price)}</div>
                  </div>
                );
              })}
            </div>

            {/* Insurance upsell */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Rental Insurance</div>
              <div style={{display:"flex",gap:6}}>
                <div onClick={()=>setSelInsurance(null)} style={{flex:1,padding:"9px 6px",background:selInsurance===null?"#1e293b":"#0f172a",border:`1.5px solid ${selInsurance===null?"#64748b":"#334155"}`,borderRadius:10,cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:14,marginBottom:2}}>🚫</div>
                  <div style={{color:"#64748b",fontWeight:700,fontSize:10}}>None</div>
                </div>
                {MONEY.insurance.map(ins=>(
                  <div key={ins.id} onClick={()=>setSelInsurance(ins.id)} style={{flex:1,padding:"9px 6px",background:selInsurance===ins.id?ins.color+"15":"#0f172a",border:`1.5px solid ${selInsurance===ins.id?ins.color:"#334155"}`,borderRadius:10,cursor:"pointer",textAlign:"center",position:"relative"}}>
                    {ins.popular&&<div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",background:"#FF6B35",color:"#fff",fontSize:8,fontWeight:800,padding:"1px 5px",borderRadius:20,whiteSpace:"nowrap"}}>Popular</div>}
                    <div style={{color:ins.color,fontWeight:900,fontSize:13,marginBottom:1}}>{fmt(ins.price)}</div>
                    <div style={{color:"#f1f5f9",fontSize:10,fontWeight:700}}>{ins.label}</div>
                    <div style={{color:"#64748b",fontSize:9}}>{ins.coverage}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#475569",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Promo Code</div>
              {couponApplied ? (
                <div style={{background:"#22c55e15",border:"1px solid #22c55e44",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{color:"#22c55e",fontWeight:800,fontSize:13}}>✓ {couponApplied.code} applied</div><div style={{color:"#64748b",fontSize:11}}>Saving {couponApplied.type==="percent"?`${couponApplied.discount}%`:fmt(couponApplied.discount)}</div></div>
                  <button style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}} onClick={()=>{setCouponApplied(null);setCouponCode("");}}>×</button>
                </div>
              ):(
                <div style={{display:"flex",gap:7}}>
                  <Inp placeholder="Enter promo code" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} style={{flex:1}}/>
                  <button style={{background:"#334155",color:"#94a3b8",border:"none",borderRadius:8,padding:"0 14px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12,whiteSpace:"nowrap"}} onClick={applyCoupon}>Apply</button>
                </div>
              )}
              {couponError&&<div style={{color:"#ef4444",fontSize:11,marginTop:5}}>{couponError}</div>}
            </div>

            <button style={{width:"100%",padding:"12px",background:`linear-gradient(135deg,${truck.color},${truck.color}cc)`,color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={()=>setStep(4)}>
              Review Booking →
            </button>
          </div>}

          {/* STEP 4 — Review */}
          {step===4&&<div>
            <button style={s.backBtn} onClick={()=>setStep(3)}>← Back</button>
            <h3 style={{color:"#f1f5f9",fontWeight:900,fontSize:17,margin:"0 0 16px"}}>Review & Confirm</h3>

            {/* Booking summary */}
            <div style={{background:"#0f172a",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              {[
                ["📅","Date",`${new Date(selDate+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}`],
                ["🕐","Start time",selTime],
                ["⏱️","Duration",`${selHours} hrs (${isDay?"Day rate":isWeekend?"Weekend rate":"Hourly"})`],
                ["🚛","Truck",`${truck.provider} ${truck.size}`],
                ["🗺️","Pickup",truck.address],
              ].map(([icon,k,v])=>(
                <div key={k} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #1e293b",alignItems:"center"}}>
                  <span style={{fontSize:14,width:20}}>{icon}</span>
                  <span style={{color:"#475569",fontSize:11,fontWeight:700,width:80,flexShrink:0}}>{k}</span>
                  <span style={{color:"#94a3b8",fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div style={{background:"#0f172a",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#475569",fontWeight:800,textTransform:"uppercase",marginBottom:10}}>Price Breakdown</div>
              {[
                [isDay?`Day rate`:`${selHours} hrs × ${fmt(hourlyRate)}/hr`, fmt(baseRate), "#f1f5f9"],
                ...selAddons.filter(id=>!truck.addons.find(a=>a.id===id)?.included).map(id=>{const a=truck.addons.find(a=>a.id===id);return[a?.label,fmt(a?.price||0),"#f1f5f9"];}),
                ...(couponApplied?[[`Promo: ${couponApplied.code}`,`−${fmt(discount)}`,"#22c55e"]]:[]),
                ...(insObj?[[`${insObj.label} insurance`,fmt(insuranceFee),"#94a3b8"]]:[]),
                ...(deposit>0?[[`Deposit (refundable)`,fmt(deposit),"#f59e0b"]]:[]),
                [`Platform fee (${fmtPct(MONEY.plans.find(p=>p.id===truck.plan)?.bookingFee||MONEY.transactionFee)})`,`−${fmt(platformFee)}`,"#64748b"],
              ].map(([k,v,color],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1e293b",fontSize:12}}>
                  <span style={{color:"#64748b"}}>{k}</span>
                  <span style={{color,fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",marginTop:4}}>
                <span style={{color:"#f1f5f9",fontWeight:800,fontSize:14}}>Total due</span>
                <span style={{color:"#22c55e",fontWeight:900,fontSize:18}}>{fmt(grandTotal)}</span>
              </div>
              {deposit>0&&<div style={{color:"#f59e0b",fontSize:11,marginTop:4}}>Includes {fmt(deposit)} refundable deposit</div>}
            </div>

            {/* Payment method */}
            {pm&&<div style={{background:pm.color+"15",border:`1px solid ${pm.color}33`,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"center",fontSize:12}}>
              <span style={{fontSize:20}}>{pm.icon}</span>
              <div><div style={{color:"#f1f5f9",fontWeight:700}}>Pay via {pm.label}</div><div style={{color:"#64748b"}}>Send {fmt(vendorReceives)} to {truck.provider} before pickup</div></div>
            </div>}

            <button style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:15}} onClick={()=>{setConfirmed(true);onConfirm&&onConfirm();}}>
              Confirm Booking ✓
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENDOR TRUCK EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function TruckEditor({ truck, onSave, onClose, isNew=false }) {
  const [form, setForm] = useState(truck ? {...truck} : {
    provider:"", size:"14 ft", payload:"", color:"#FF6B35", img:"🚛",
    address:"", lat:30.27, lng:-97.74, available:true, features:"",
    pricing:{ hourly:55, daily:349, weekendRate:65, minimumHours:2, afterHoursSurcharge:15, mileageFee:0.85, freeMiles:50 },
    insurance:{ provider:"", policyNo:"", expiry:"", verified:false },
    deposit:{ required:false, amount:150 },
    addons:[ {id:"dolly",label:"Moving Dolly",price:15}, {id:"pads",label:"Furniture Pads",price:20} ],
    coupons:[],
    schedule:{ mon:"7am–8pm",tue:"7am–8pm",wed:"7am–8pm",thu:"7am–8pm",fri:"7am–9pm",sat:"8am–6pm",sun:"Closed" },
    blockedDates:[], status:"approved", plan:"pro",
  });
  const [tab, setTab] = useState("basics");
  const [newCoupon, setNewCoupon] = useState({code:"",discount:"",type:"percent",maxUses:100});
  const [newAddon, setNewAddon] = useState({label:"",price:""});
  const [newBlock, setNewBlock] = useState("");

  const upd = (key, val) => setForm(f=>({...f, [key]:val}));
  const updP = (key, val) => setForm(f=>({...f, pricing:{...f.pricing,[key]:val}}));
  const updI = (key, val) => setForm(f=>({...f, insurance:{...f.insurance,[key]:val}}));
  const updD = (key, val) => setForm(f=>({...f, deposit:{...f.deposit,[key]:val}}));
  const updS = (day, val) => setForm(f=>({...f, schedule:{...f.schedule,[day]:val}}));

  const TABS = [["basics","🚛","Basics"],["pricing","💰","Pricing"],["insurance","🛡️","Insurance"],["addons","✨","Add-ons"],["coupons","🎟️","Coupons"],["schedule","📅","Schedule"]];
  const TRUCK_EMOJIS = ["🚛","🚚","📦","🏗️","🔑","🚐"];
  const COLORS = ["#FF6B35","#2EC4B6","#7B2FBE","#22c55e","#E63946","#F4A261","#3b82f6","#f59e0b"];
  const HOURS_OPTIONS = ["Closed","6am–6pm","6am–8pm","6am–10pm","7am–7pm","7am–8pm","7am–9pm","8am–5pm","8am–6pm","8am–8pm","9am–5pm","Open 24 hrs"];

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"auto"}} onClick={onClose}>
      <div style={{background:"#0f172a",borderRadius:20,width:"100%",maxWidth:600,boxShadow:"0 32px 80px #000",animation:"fadeUp 0.3s ease",overflow:"hidden",margin:"auto"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1A1A2E,#0F3460)",padding:"18px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,background:form.color+"22",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{form.img}</div>
              <div><div style={{color:"#f1f5f9",fontWeight:900,fontSize:15}}>{isNew?"Add New Truck":form.provider||"Edit Truck"}</div><div style={{color:"#64748b",fontSize:11}}>{isNew?"Fill in the details below":"Update truck settings"}</div></div>
            </div>
            <button style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:22}} onClick={onClose}>×</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {TABS.map(([id,icon,label])=>(
              <button key={id} style={{padding:"5px 10px",border:"none",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",background:tab===id?form.color:"#1e293b",color:tab===id?"#fff":"#64748b"}} onClick={()=>setTab(id)}>{icon} {label}</button>
            ))}
          </div>
        </div>

        <div style={{padding:"20px 22px",maxHeight:"62vh",overflowY:"auto"}}>

          {tab==="basics"&&<div>
            <Lbl>Truck Icon</Lbl>
            <div style={{display:"flex",gap:7,marginBottom:4}}>
              {TRUCK_EMOJIS.map(e=><button key={e} style={{width:38,height:38,borderRadius:9,background:form.img===e?form.color+"30":"#1e293b",border:`2px solid ${form.img===e?form.color:"#334155"}`,fontSize:20,cursor:"pointer"}} onClick={()=>upd("img",e)}>{e}</button>)}
            </div>
            <Lbl>Accent Color</Lbl>
            <div style={{display:"flex",gap:7,marginBottom:4}}>
              {COLORS.map(c=><button key={c} style={{width:28,height:28,borderRadius:"50%",background:c,border:form.color===c?"3px solid #fff":"2px solid transparent",cursor:"pointer"}} onClick={()=>upd("color",c)}/>)}
            </div>
            <Lbl>Listing Name</Lbl>
            <Inp placeholder="HaulPro 16ft" value={form.provider||""} onChange={e=>upd("provider",e.target.value)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Truck Size</Lbl>
                <Select value={form.size} onChange={e=>upd("size",e.target.value)}>
                  {["10 ft","12 ft","14 ft","16 ft","20 ft","26 ft"].map(sz=><option key={sz}>{sz}</option>)}
                </Select>
              </div>
              <div><Lbl>Max Payload</Lbl><Inp placeholder="3,000 lbs" value={form.payload||""} onChange={e=>upd("payload",e.target.value)}/></div>
            </div>
            <Lbl>Location / Address</Lbl>
            <Inp placeholder="123 Main St, Austin, TX" value={form.address||""} onChange={e=>upd("address",e.target.value)}/>
            <Lbl>Features (comma-separated)</Lbl>
            <Inp placeholder="Ramp, GPS, 24/7 roadside" value={Array.isArray(form.features)?form.features.join(", "):form.features||""} onChange={e=>upd("features",e.target.value)}/>
          </div>}

          {tab==="pricing"&&<div>
            <div style={{background:"#1e293b",borderRadius:12,padding:14,marginBottom:14,fontSize:12,color:"#64748b",lineHeight:1.6}}>
              💡 Each pricing tier is shown to customers during booking — they'll automatically see the best rate for their duration.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Hourly Rate ($)","hourly"],["Daily Rate ($, 8+ hrs)","daily"],["Weekend Rate ($/hr)","weekendRate"],["After-Hours Surcharge ($/hr)","afterHoursSurcharge"],["Mileage Fee ($/mi)","mileageFee"],["Free Miles Included","freeMiles"]].map(([label,key])=>(
                <div key={key}><Lbl>{label}</Lbl><Inp type="number" value={form.pricing[key]} onChange={e=>updP(key,Number(e.target.value))}/></div>
              ))}
            </div>
            <Lbl>Minimum Hours</Lbl>
            <Select value={form.pricing.minimumHours} onChange={e=>updP("minimumHours",Number(e.target.value))}>
              {[1,2,3,4,6,8].map(h=><option key={h} value={h}>{h} hour{h!==1?"s":""}</option>)}
            </Select>
            <div style={{background:"#0f172a",borderRadius:10,padding:"12px 14px",marginTop:12,fontSize:12,color:"#64748b"}}>
              <div style={{color:"#f1f5f9",fontWeight:700,marginBottom:6}}>Preview for customer</div>
              {[[`Up to 7 hrs`,`${fmt(form.pricing.hourly)}/hr`,""],["8+ hours",`${fmt(form.pricing.daily)} flat`,"Day rate"],["Fri–Sun",`${fmt(form.pricing.weekendRate)}/hr`,"Weekend"]].map(([k,v,tag])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #1e293b"}}><span>{k}</span><div style={{display:"flex",gap:6,alignItems:"center"}}>{tag&&<span style={{background:"#FF6B3520",color:"#FF6B35",padding:"1px 6px",borderRadius:20,fontSize:10}}>{tag}</span>}<span style={{color:"#f1f5f9",fontWeight:700}}>{v}</span></div></div>
              ))}
            </div>
          </div>}

          {tab==="insurance"&&<div>
            <div style={{background:"#ef444410",border:"1px solid #ef444430",borderRadius:10,padding:"11px 13px",marginBottom:14,fontSize:12,color:"#ef4444",lineHeight:1.6}}>
              ⚠️ Rental insurance is <strong>required</strong> before your truck goes live on the map. Commercial auto policy minimum $500k coverage.
            </div>
            <Lbl>Insurance Provider</Lbl>
            <Inp placeholder="State Farm, Progressive..." value={form.insurance.provider} onChange={e=>updI("provider",e.target.value)}/>
            <Lbl>Policy Number</Lbl>
            <Inp placeholder="POL-000000" value={form.insurance.policyNo} onChange={e=>updI("policyNo",e.target.value)}/>
            <Lbl>Policy Expiry Date</Lbl>
            <Inp type="date" value={form.insurance.expiry} onChange={e=>updI("expiry",e.target.value)}/>

            {/* Upload area */}
            <Lbl>Upload Policy Document</Lbl>
            <label style={{display:"block",cursor:"pointer",marginBottom:14}}>
              <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={()=>updI("verified",true)}/>
              <div style={{border:`2px dashed ${form.insurance.verified?"#22c55e":"#334155"}`,borderRadius:12,padding:"20px",textAlign:"center",background:form.insurance.verified?"#22c55e08":"#1e293b"}}>
                {form.insurance.verified ? <><div style={{color:"#22c55e",fontWeight:800,marginBottom:3}}>✓ Document uploaded</div><div style={{color:"#475569",fontSize:11}}>Click to replace</div></>
                : <><div style={{fontSize:30,marginBottom:6}}>📄</div><div style={{color:"#64748b",fontSize:13}}>Click to upload PDF or image</div></>}
              </div>
            </label>
            {form.insurance.verified&&<div style={{background:"#22c55e10",border:"1px solid #22c55e30",borderRadius:10,padding:"10px 13px",fontSize:12,color:"#22c55e"}}>✅ Insurance on file — truck will go live once admin verifies</div>}
          </div>}

          {tab==="addons"&&<div>
            <p style={{color:"#64748b",fontSize:12,marginBottom:14,lineHeight:1.6}}>Add extras customers can select at booking. Mark as "included" for free items.</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {form.addons.map((addon,i)=>(
                <div key={addon.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:"#1e293b",borderRadius:10}}>
                  <div style={{flex:1}}><div style={{color:"#f1f5f9",fontSize:12,fontWeight:700}}>{addon.label}</div><div style={{color:addon.included?"#22c55e":"#64748b",fontSize:11}}>{addon.included?"Included free":`${fmt(addon.price)}`}</div></div>
                  <button style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:16,padding:4}} onClick={()=>setForm(f=>({...f,addons:f.addons.filter((_,j)=>j!==i)}))}>×</button>
                </div>
              ))}
            </div>
            <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
              <div style={{fontSize:11,color:"#f1f5f9",fontWeight:800,marginBottom:10}}>Add new</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",gap:8,marginBottom:8}}>
                <Inp placeholder="Item name" value={newAddon.label} onChange={e=>setNewAddon(a=>({...a,label:e.target.value}))}/>
                <Inp type="number" placeholder="Price" value={newAddon.price} onChange={e=>setNewAddon(a=>({...a,price:e.target.value}))}/>
                <button style={{background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12}} onClick={()=>{if(!newAddon.label)return;setForm(f=>({...f,addons:[...f.addons,{id:newAddon.label.toLowerCase().replace(/\s/g,"_"),label:newAddon.label,price:Number(newAddon.price)||0,included:Number(newAddon.price)===0}]}));setNewAddon({label:"",price:""});}}>Add</button>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <Lbl>Damage Deposit</Lbl>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <label style={{display:"flex",gap:6,alignItems:"center",cursor:"pointer",fontSize:12,color:"#94a3b8"}}><input type="checkbox" checked={form.deposit.required} onChange={e=>updD("required",e.target.checked)} style={{accentColor:"#FF6B35"}}/>Require deposit</label>
              </div>
              {form.deposit.required&&<Inp type="number" placeholder="150" value={form.deposit.amount} onChange={e=>updD("amount",Number(e.target.value))}/>}
              {form.deposit.required&&<p style={{color:"#475569",fontSize:11,marginTop:4}}>Deposit is held and returned to customer after rental is complete</p>}
            </div>
          </div>}

          {tab==="coupons"&&<div>
            <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Create promo codes customers enter at checkout.</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {form.coupons.map((c,i)=>(
                <div key={c.code} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:"#1e293b",borderRadius:10,flexWrap:"wrap"}}>
                  <div style={{background:"#FF6B3520",color:"#FF6B35",padding:"4px 10px",borderRadius:8,fontWeight:800,fontSize:13,fontFamily:"monospace"}}>{c.code}</div>
                  <div style={{flex:1}}><div style={{color:"#f1f5f9",fontSize:12}}>{c.type==="percent"?`${c.discount}% off`:`${fmt(c.discount)} off`}</div><div style={{color:"#64748b",fontSize:10}}>{c.uses}/{c.maxUses} uses</div></div>
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <div onClick={()=>setForm(f=>({...f,coupons:f.coupons.map((cp,j)=>j===i?{...cp,active:!cp.active}:cp)}))} style={{width:36,height:18,borderRadius:9,background:c.active?"#22c55e":"#334155",cursor:"pointer",position:"relative"}}><div style={{position:"absolute",top:2,left:c.active?19:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/></div>
                    <button style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:15}} onClick={()=>setForm(f=>({...f,coupons:f.coupons.filter((_,j)=>j!==i)}))}>×</button>
                  </div>
                </div>
              ))}
              {form.coupons.length===0&&<div style={{color:"#334155",fontSize:12,textAlign:"center",padding:"20px"}}>No coupons yet</div>}
            </div>
            <div style={{background:"#1e293b",borderRadius:12,padding:14}}>
              <div style={{fontSize:11,color:"#f1f5f9",fontWeight:800,marginBottom:10}}>Create coupon</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 80px",gap:8,marginBottom:8}}>
                <Inp placeholder="CODE" value={newCoupon.code} onChange={e=>setNewCoupon(c=>({...c,code:e.target.value.toUpperCase()}))} style={{fontFamily:"monospace",fontWeight:800}}/>
                <Inp type="number" placeholder="10" value={newCoupon.discount} onChange={e=>setNewCoupon(c=>({...c,discount:e.target.value}))}/>
                <Select value={newCoupon.type} onChange={e=>setNewCoupon(c=>({...c,type:e.target.value}))}>
                  <option value="percent">% off</option>
                  <option value="flat">$ off</option>
                </Select>
                <Inp type="number" placeholder="100" value={newCoupon.maxUses} onChange={e=>setNewCoupon(c=>({...c,maxUses:e.target.value}))}/>
              </div>
              <button style={{width:"100%",padding:"9px",background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}} onClick={()=>{if(!newCoupon.code||!newCoupon.discount)return;setForm(f=>({...f,coupons:[...f.coupons,{...newCoupon,discount:Number(newCoupon.discount),maxUses:Number(newCoupon.maxUses)||100,uses:0,active:true}]}));setNewCoupon({code:"",discount:"",type:"percent",maxUses:100});}}>Create Coupon</button>
            </div>
          </div>}

          {tab==="schedule"&&<div>
            <p style={{color:"#64748b",fontSize:12,marginBottom:14}}>Set hours for each day. Customers can only book within these windows.</p>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {DAYS_OF_WEEK.map(day=>(
                <div key={day} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#1e293b",borderRadius:10}}>
                  <span style={{width:36,color:"#94a3b8",fontSize:13,fontWeight:700}}>{DAY_LABELS[day]}</span>
                  <Select style={{flex:1,padding:"6px 10px",fontSize:12}} value={form.schedule[day]} onChange={e=>updS(day,e.target.value)}>
                    {HOURS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </Select>
                  <div style={{width:10,height:10,borderRadius:"50%",background:form.schedule[day]==="Closed"?"#334155":"#22c55e",flexShrink:0}}/>
                </div>
              ))}
            </div>
            <Lbl>Block specific dates</Lbl>
            <div style={{display:"flex",gap:7,marginBottom:9}}>
              <Inp type="date" value={newBlock} onChange={e=>setNewBlock(e.target.value)} style={{flex:1}}/>
              <button style={{background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,padding:"0 14px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12}} onClick={()=>{if(newBlock&&!form.blockedDates.includes(newBlock)){setForm(f=>({...f,blockedDates:[...f.blockedDates,newBlock]}));setNewBlock("");}}}>Block</button>
            </div>
            {form.blockedDates.map(d=>(
              <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1e293b",borderRadius:7,padding:"6px 10px",marginBottom:5}}>
                <span style={{color:"#f59e0b",fontSize:12}}>📅 {d}</span>
                <button style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}} onClick={()=>setForm(f=>({...f,blockedDates:f.blockedDates.filter(x=>x!==d)}))}>×</button>
              </div>
            ))}
          </div>}
        </div>

        <div style={{padding:"14px 22px",borderTop:"1px solid #1e293b",display:"flex",gap:10,background:"#0f172a"}}>
          <button style={{flex:1,padding:"10px",background:"transparent",border:"1.5px solid #334155",borderRadius:10,color:"#64748b",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}} onClick={onClose}>Cancel</button>
          <button style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${form.color},${form.color}cc)`,color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:14}} onClick={()=>onSave(form)}>
            {isNew?"Add Truck →":"Save Changes ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEO FINDER
// ═══════════════════════════════════════════════════════════════════════════════
function GeoFinder({trucks, onBack}) {
  const [uPos,setUPos]=useState(null); const [locStatus,setLocStatus]=useState("idle");
  const [srch,setSrch]=useState(""); const [sPos,setSPos]=useState(null); const [sLabel,setSLabel]=useState("");
  const [sugg,setSugg]=useState([]); const [radius,setRadius]=useState(10);
  const [sort,setSort]=useState("distance"); const [sizeFilt,setSizeFilt]=useState("All");
  const [availOnly,setAvailOnly]=useState(false); const [selId,setSelId]=useState(null);
  const [view,setView]=useState("split"); const [bookTruck,setBookTruck]=useState(null);

  const ePos=sPos||uPos; const approved=trucks.filter(t=>t.status==="approved");
  function nearMe(){setLocStatus("loading");setTimeout(()=>{const p={lat:30.2672+(Math.random()-.5)*.04,lng:-97.7431+(Math.random()-.5)*.04};setUPos(p);setSPos(p);setSLabel("Your location");setSrch("");setLocStatus("granted");},1000);}
  function doSearch(v){setSrch(v);if(v.length<2){setSugg([]);return;}setSugg(CITIES.filter(c=>c.name.toLowerCase().includes(v.toLowerCase())).slice(0,4));}
  function pickCity(c){setSPos({lat:c.lat,lng:c.lng});setSLabel(c.name);setSrch(c.name);setSugg([]);}

  const withDist=approved.map(t=>({...t,distance:ePos?getDist(ePos.lat,ePos.lng,t.lat,t.lng):null}));
  const filtered=withDist.filter(t=>sizeFilt==="All"||t.size===sizeFilt).filter(t=>!availOnly||t.available).filter(t=>!ePos||radius>=50||(t.distance!==null&&t.distance<=radius)).sort((a,b)=>{
    if(sort==="distance"&&a.distance!==null){if(a.boostActive&&!b.boostActive)return -1;if(!a.boostActive&&b.boostActive)return 1;return a.distance-b.distance;}
    if(a.boostActive&&!b.boostActive)return -1;if(!a.boostActive&&b.boostActive)return 1;
    if(sort==="price")return a.pricing.hourly-b.pricing.hourly;return b.rating-a.rating;
  });
  const selTruck=approved.find(t=>t.id===selId);
  const sizes=["All","10 ft","12 ft","14 ft","16 ft","20 ft"];

  return(
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"'Georgia','Times New Roman',serif",color:"#f1f5f9",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      {bookTruck&&<BookingModal truck={bookTruck} onClose={()=>setBookTruck(null)} onConfirm={()=>{}}/>}
      <header style={{background:"#1a2535",borderBottom:"1px solid #1e293b",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",gap:11,padding:"9px 14px",flexWrap:"wrap"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}} onClick={onBack}><span style={{fontSize:20}}>🚛</span><span style={{fontSize:17,fontWeight:900,color:"#fff"}}>TruckNow</span></button>
          <div style={{flex:1,minWidth:200,maxWidth:420,position:"relative",display:"flex",gap:7}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:7,background:"#0f172a",border:"1.5px solid #334155",borderRadius:10,padding:"7px 11px"}}><span style={{fontSize:14}}>🔍</span><input style={{flex:1,background:"none",border:"none",color:"#f1f5f9",fontSize:13,fontFamily:"inherit",outline:"none"}} placeholder="City or ZIP..." value={srch} onChange={e=>doSearch(e.target.value)}/>{srch&&<button style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:17}} onClick={()=>{setSrch("");setSugg([]);setSPos(null);}}>×</button>}</div>
            {sugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:60,background:"#1e293b",borderRadius:10,border:"1px solid #334155",zIndex:200,marginTop:4,overflow:"hidden"}}>{sugg.map(c=><button key={c.name} style={{width:"100%",padding:"8px 12px",background:"none",border:"none",color:"#cbd5e1",fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:"inherit",borderBottom:"1px solid #0f172a"}} onClick={()=>pickCity(c)}>📍 {c.name}</button>)}</div>}
            <button style={{display:"flex",alignItems:"center",gap:4,background:"#1e293b",border:"1.5px solid #334155",color:"#94a3b8",borderRadius:10,padding:"7px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}} onClick={nearMe} disabled={locStatus==="loading"}>{locStatus==="loading"?<span style={{width:10,height:10,border:"2px solid #334155",borderTopColor:"#FF6B35",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>:"📡"} Near Me</button>
          </div>
          <div style={{display:"flex",background:"#0f172a",borderRadius:8,border:"1px solid #334155",overflow:"hidden"}}>{[["split","⬛"],["map","🗺"],["list","☰"]].map(([v,l])=><button key={v} style={{padding:"6px 10px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",background:view===v?"#FF6B35":"transparent",color:view===v?"#fff":"#94a3b8"}} onClick={()=>setView(v)}>{l}</button>)}</div>
          <button style={{background:"transparent",border:"1.5px solid #334155",color:"#64748b",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"}} onClick={onBack}>← Home</button>
        </div>
        <div style={{borderTop:"1px solid #1e293b",padding:"6px 14px"}}>
          <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
            {ePos&&<div style={{display:"flex",alignItems:"center",gap:4,background:"#0f172a",border:"1px solid #22c55e44",borderRadius:20,padding:"2px 10px"}}><span style={{color:"#22c55e",fontSize:10}}>●</span><span style={{fontSize:11,color:"#cbd5e1"}}>{sLabel}</span></div>}
            {ePos&&<div style={{display:"flex",alignItems:"center",gap:6,background:"#0f172a",borderRadius:8,padding:"3px 10px",border:"1px solid #334155"}}><span style={{fontSize:11,color:"#64748b"}}>Radius:</span><input type="range" min={2} max={50} value={radius} onChange={e=>setRadius(Number(e.target.value))} style={{width:60,accentColor:"#FF6B35"}}/><span style={{fontSize:11,color:"#FF6B35",fontWeight:700,minWidth:30}}>{radius<50?`${radius}mi`:"Any"}</span></div>}
            {sizes.map(sz=><button key={sz} style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:sizeFilt===sz?"#FF6B35":"#1e293b",color:sizeFilt===sz?"#fff":"#64748b",border:`1px solid ${sizeFilt===sz?"#FF6B35":"#334155"}`}} onClick={()=>setSizeFilt(sz)}>{sz}</button>)}
            <select style={{background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",borderRadius:7,padding:"3px 8px",fontSize:11,fontFamily:"inherit"}} value={sort} onChange={e=>setSort(e.target.value)}>{ePos&&<option value="distance">Nearest</option>}<option value="price">Price</option><option value="rating">Rating</option></select>
            <label style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><input type="checkbox" checked={availOnly} onChange={e=>setAvailOnly(e.target.checked)} style={{accentColor:"#FF6B35"}}/><span style={{fontSize:11,color:"#64748b"}}>Available only</span></label>
            <span style={{marginLeft:"auto",fontSize:11,color:"#475569"}}>{filtered.length} trucks</span>
          </div>
        </div>
      </header>
      <div style={{flex:1,display:"flex",overflow:"hidden",maxWidth:1300,margin:"0 auto",width:"100%",padding:"12px 12px 0",flexDirection:view==="list"?"column":"row"}}>
        {(view==="split"||view==="map")&&<div style={{flex:view==="map"?1:"0 0 54%",padding:"0 8px 12px 0",position:"relative"}}>
          <TruckMap trucks={filtered} userPos={ePos} selectedId={selId} onSelect={setSelId} radiusMiles={radius}/>
          {!ePos&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172acc",borderRadius:14,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#1e293b",borderRadius:16,padding:"22px 18px",display:"flex",flexDirection:"column",alignItems:"center",maxWidth:250,textAlign:"center",border:"1px solid #334155"}}>
              <div style={{fontSize:34,marginBottom:9}}>📍</div><h3 style={{color:"#f1f5f9",fontWeight:900,margin:"0 0 6px",fontSize:13}}>Where are you?</h3>
              <button style={{width:"100%",padding:"9px",background:"#3b82f6",color:"#fff",border:"none",borderRadius:9,fontWeight:800,cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:8}} onClick={nearMe}>📡 Use My Location</button>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>{CITIES.slice(0,3).map(c=><button key={c.name} style={{padding:"4px 9px",background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",borderRadius:20,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>pickCity(c)}>{c.name.split(",")[0]}</button>)}</div>
            </div>
          </div>}
          {selTruck&&view==="map"&&<div style={{position:"absolute",bottom:18,left:8,right:8,background:"#1e293b",borderRadius:12,padding:"12px 14px",border:"1px solid #334155"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:38,height:38,background:selTruck.color+"22",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{selTruck.img}</div>
              <div style={{flex:1}}><div style={{color:"#f1f5f9",fontSize:13,fontWeight:800}}>{selTruck.provider}</div><div style={{color:"#64748b",fontSize:11}}>{selTruck.size} · {selTruck.address}</div></div>
              <div style={{textAlign:"right"}}><div style={{color:"#f1f5f9",fontWeight:900,fontSize:15}}>{fmt(selTruck.pricing.hourly)}<span style={{color:"#475569",fontSize:10}}>/hr</span></div><button style={{background:selTruck.available?"#FF6B35":"#334155",color:"#fff",border:"none",borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:800,cursor:selTruck.available?"pointer":"default",marginTop:3,fontFamily:"inherit"}} onClick={()=>selTruck.available&&setBookTruck(selTruck)}>{selTruck.available?"Book":"Unavail."}</button></div>
            </div>
          </div>}
        </div>}
        {(view==="split"||view==="list")&&<div style={{flex:1,overflowY:"auto",paddingBottom:12,display:"flex",flexDirection:"column",gap:8,maxHeight:view==="list"?"none":"calc(100vh - 148px)"}}>
          {filtered.map(truck=>{
            const plan=MONEY.plans.find(p=>p.id===truck.plan);
            return(
              <div key={truck.id} style={{background:"#1e293b",borderRadius:12,padding:"12px 12px 12px 16px",cursor:"pointer",position:"relative",overflow:"hidden",border:`2px solid ${truck.id===selId?truck.color:truck.boostActive?plan?.color+"55":"transparent"}`,opacity:truck.available?1:0.65,transition:"all 0.15s"}} onClick={()=>setSelId(truck.id===selId?null:truck.id)}>
                {truck.boostActive&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${plan?.color},${plan?.color}00)`}}/>}
                <div style={{width:3,height:"100%",background:truck.color,position:"absolute",left:0,top:0}}/>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:42,height:42,background:truck.color+"18",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{truck.img}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:7}}>
                      <div>
                        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontWeight:800,color:"#f1f5f9",fontSize:13}}>{truck.provider}</span>
                          <span style={{background:truck.color+"22",color:truck.color,padding:"2px 5px",borderRadius:20,fontSize:9,fontWeight:700}}>{truck.size}</span>
                          {truck.boostActive&&<span style={{background:plan?.color+"22",color:plan?.color,padding:"2px 5px",borderRadius:20,fontSize:9,fontWeight:800}}>🔥 Featured</span>}
                          {!truck.available&&<span style={{background:"#ef444422",color:"#ef4444",padding:"2px 5px",borderRadius:20,fontSize:9}}>Unavail.</span>}
                        </div>
                        <div style={{color:"#475569",fontSize:11,marginTop:2}}>📍 {truck.address}</div>
                        {truck.distance!==null&&<div style={{display:"inline-flex",alignItems:"center",gap:3,background:truck.distance<3?"#22c55e18":"#0f172a",border:`1px solid ${truck.distance<3?"#22c55e44":"#334155"}`,borderRadius:20,padding:"2px 7px",marginTop:3}}><span style={{fontSize:9,fontWeight:800,color:truck.distance<3?"#22c55e":"#64748b"}}>📏 {truck.distance.toFixed(1)} mi</span></div>}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{color:"#f1f5f9",fontWeight:900,fontSize:15}}>{fmt(truck.pricing.hourly)}<span style={{color:"#475569",fontSize:10}}>/hr</span></div>
                        <div style={{color:"#64748b",fontSize:10}}>{fmt(truck.pricing.daily)} day</div>
                        <div style={{color:"#FBBF24",fontSize:10}}>★ {truck.rating}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {truck.features?.slice(0,2).map(f=><span key={f} style={{background:"#0f172a",color:"#475569",padding:"2px 6px",borderRadius:20,fontSize:9}}>{f}</span>)}
                        {truck.deposit?.required&&<span style={{background:"#f59e0b15",color:"#f59e0b",padding:"2px 6px",borderRadius:20,fontSize:9,fontWeight:700}}>Deposit req.</span>}
                      </div>
                      <button style={{background:truck.available?"#FF6B35":"#1e293b",color:truck.available?"#fff":"#475569",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:truck.available?"pointer":"default",fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();if(truck.available)setBookTruck(truck);}}>{truck.available?"Book →":"Unavail."}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [portal, setPortal] = useState("landing");
  const [adminTab, setAdminTab] = useState("revenue");
  const [vendorTab, setVendorTab] = useState("fleet");
  const [trucks, setTrucks] = useState(SEED_TRUCKS);
  const [toast, setToast] = useState(null);
  const [truckEditor, setTruckEditor] = useState(null); // null | {truck, isNew}
  const [bookingDetail, setBookingDetail] = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  // My vendor's trucks (vendorId === 10)
  const myTrucks = trucks.filter(t=>t.vendorId===10);
  const myPlan = MONEY.plans.find(p=>p.id==="pro");
  const myTotalEarnings = myTrucks.reduce((a,t)=>a+t.earnings,0);
  const myTotalBookings = myTrucks.reduce((a,t)=>a+t.bookingsCount,0);
  const myBookings = SEED_BOOKINGS.filter(b=>myTrucks.some(t=>t.id===b.truckId));

  function saveTruck(form) {
    const features = typeof form.features === "string" ? form.features.split(",").map(f=>f.trim()).filter(Boolean) : form.features;
    const updated = {...form, features, vendorId:10, status:"approved", plan:"pro", earnings:form.earnings||0, bookingsCount:form.bookingsCount||0, rating:form.rating||null, reviews:form.reviews||0};
    if (truckEditor.isNew) {
      setTrucks(prev=>[...prev, {...updated, id:Date.now()}]);
      showToast("✅ New truck added to your fleet!");
    } else {
      setTrucks(prev=>prev.map(t=>t.id===form.id?updated:t));
      showToast("Truck updated!");
    }
    setTruckEditor(null);
  }

  function deleteTruck(id) {
    setTrucks(prev=>prev.filter(t=>t.id!==id));
    showToast("Truck removed","error");
  }

  function toggleAvail(id) {
    setTrucks(prev=>prev.map(t=>t.id===id?{...t,available:!t.available}:t));
    const t=trucks.find(t=>t.id===id);
    showToast(t?.available?"Truck paused":"Truck live","info");
  }

  // Admin revenue calcs
  const allTrucks = trucks;
  const totalSubRevenue = allTrucks.reduce((a,t)=>{const p=MONEY.plans.find(pl=>pl.id===t.plan);return a+(p?.price||0);},0);
  const totalTransFees = SEED_BOOKINGS.reduce((a,b)=>a+b.platformFee,0);

  if (portal==="customer") return <GeoFinder trucks={trucks} onBack={()=>setPortal("landing")}/>;

  // ── Landing ───────────────────────────────────────────────────────────────
  if (portal==="landing") return (
    <div style={s.page}>
      <style>{css}</style>
      {toast&&<Toast {...toast}/>}
      <nav style={s.landingNav}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:26}}>🚛</span><span style={s.logoText}>TruckNow</span></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button style={s.outlineBtn} onClick={()=>setPortal("vendor")}>Vendor Portal</button>
          <button style={s.ghostBtn} onClick={()=>setPortal("admin")}>Admin →</button>
        </div>
      </nav>
      <div style={s.landingHero}>
        <h1 style={s.landingTitle}>The smartest way to rent<br/>a box truck near you.</h1>
        <p style={s.landingSub}>Find trusted local vendors, compare prices, and book in minutes.</p>
        <div style={s.heroCards}>
          {[{icon:"🗺️",title:"Find a Truck",desc:"Map search with real-time availability and instant booking.",cta:"Search now →",light:true,action:()=>setPortal("customer")},{icon:"🚛",title:"Vendor Portal",desc:"Manage your fleet, pricing, coupons, and payouts.",cta:"Go to portal →",light:false,action:()=>setPortal("vendor")},{icon:"📊",title:"Admin Dashboard",desc:"Revenue, subscriptions, boosts, and platform analytics.",cta:"View →",light:false,teal:true,action:()=>setPortal("admin")}].map(c=>(
            <button key={c.title} style={{...s.heroCard,background:c.light?"#fff":c.teal?"#0f172a":"#1A1A2E",border:c.light?"2px solid #e5e7eb":c.teal?"2px solid #2EC4B6":"2px solid #FF6B35"}} onClick={c.action}>
              <div style={{fontSize:36,marginBottom:12}}>{c.icon}</div>
              <h2 style={{...s.heroCardTitle,color:c.light?"#1A1A2E":"#fff"}}>{c.title}</h2>
              <p style={{...s.heroCardDesc,color:c.light?"#666":"#94a3b8"}}>{c.desc}</p>
              <div style={{...s.heroCardCta,color:c.light?"#FF6B35":c.teal?"#2EC4B6":"#FF6B35"}}>{c.cta}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Vendor Portal ─────────────────────────────────────────────────────────
  if (portal==="vendor") return (
    <div style={{...s.page,background:"#0f172a"}}>
      <style>{css}</style>
      {toast&&<Toast {...toast}/>}
      {truckEditor&&<TruckEditor truck={truckEditor.truck} isNew={truckEditor.isNew} onSave={saveTruck} onClose={()=>setTruckEditor(null)}/>}
      <div style={{display:"flex",minHeight:"100vh"}}>
        <aside style={s.sidebar}>
          <button style={{...s.logoBtn,marginBottom:20}} onClick={()=>setPortal("landing")}><span style={{fontSize:20}}>🚛</span><span style={{...s.logoText,fontSize:16}}>TruckNow</span></button>
          <div style={s.sidebarLabel}>Vendor Portal</div>
          {[["🚛","My Fleet","fleet"],["📦","Bookings","bookings"],["💰","Earnings","earnings"],["📋","My Plan","plan"]].map(([icon,label,tab])=>(
            <button key={tab} style={{...s.sidebarItem,background:vendorTab===tab?"#1e293b":"transparent",color:vendorTab===tab?"#fff":"#64748b",borderLeft:vendorTab===tab?"3px solid #2EC4B6":"3px solid transparent"}} onClick={()=>setVendorTab(tab)}>{icon} {label}</button>
          ))}
          <div style={{marginTop:"auto",paddingTop:14,borderTop:"1px solid #1e293b"}}>
            <div style={{color:"#f1f5f9",fontSize:11,fontWeight:700}}>HaulPro</div>
            <div style={{color:myPlan?.color,fontSize:10,fontWeight:800,marginBottom:8}}>{myPlan?.icon} {myPlan?.name} · {myTrucks.length}/{myPlan?.maxTrucks} trucks</div>
            <div style={{height:4,background:"#1e293b",borderRadius:2,marginBottom:8}}><div style={{height:"100%",background:myPlan?.color,borderRadius:2,width:`${(myTrucks.length/myPlan?.maxTrucks)*100}%`}}/></div>
          </div>
        </aside>

        <main style={{flex:1,padding:"22px 18px",overflow:"auto"}}>

          {/* ── Fleet Tab ── */}
          {vendorTab==="fleet"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
              <div><h1 style={s.adminTitle}>My Fleet</h1><p style={s.adminSub}>{myTrucks.length} truck{myTrucks.length!==1?"s":""} · {myPlan?.name} plan allows up to {myPlan?.maxTrucks}</p></div>
              {myTrucks.length < (myPlan?.maxTrucks||1) &&
                <button style={{display:"flex",alignItems:"center",gap:7,background:"#FF6B35",color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}} onClick={()=>setTruckEditor({truck:null,isNew:true})}>+ Add Truck</button>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {myTrucks.map(truck=>{
                const plan=MONEY.plans.find(p=>p.id===truck.plan);
                const truckBookings=SEED_BOOKINGS.filter(b=>b.truckId===truck.id);
                return(
                  <div key={truck.id} style={{background:"#1e293b",borderRadius:14,overflow:"hidden",border:`1px solid ${truck.available?"#334155":"#ef444422"}`}}>
                    {/* Truck header */}
                    <div style={{display:"flex",gap:12,alignItems:"center",padding:"14px 16px",flexWrap:"wrap",borderBottom:"1px solid #0f172a"}}>
                      <div style={{width:52,height:52,background:truck.color+"20",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{truck.img}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                          <span style={{color:"#f1f5f9",fontWeight:900,fontSize:15}}>{truck.provider}</span>
                          <Badge color={truck.available?"approved":"rejected"} dot>{truck.available?"Live":"Paused"}</Badge>
                          {truck.boostActive&&<Badge color="approved" dot>🔥 Boosted</Badge>}
                          {!truck.insurance?.verified&&<Badge color="pending" dot>Insurance pending</Badge>}
                        </div>
                        <div style={{color:"#64748b",fontSize:12}}>{truck.size} · {truck.address} · ★ {truck.rating||"New"}</div>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                        <div style={{textAlign:"center"}}><div style={{color:"#22c55e",fontWeight:900,fontSize:16}}>{fmt(truck.earnings)}</div><div style={{color:"#475569",fontSize:9,fontWeight:700}}>EARNINGS</div></div>
                        <div style={{textAlign:"center"}}><div style={{color:"#2EC4B6",fontWeight:900,fontSize:16}}>{truck.bookingsCount}</div><div style={{color:"#475569",fontSize:9,fontWeight:700}}>BOOKINGS</div></div>
                        <button onClick={()=>toggleAvail(truck.id)} style={{width:44,height:22,borderRadius:11,background:truck.available?"#22c55e":"#334155",border:"none",cursor:"pointer",position:"relative"}}><div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:truck.available?25:3,transition:"left 0.2s"}}/></button>
                        <button style={{background:"#334155",color:"#94a3b8",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setTruckEditor({truck,isNew:false})}>Edit</button>
                        <button style={{background:"#ef444415",color:"#ef4444",border:"1px solid #ef444433",borderRadius:8,padding:"7px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>deleteTruck(truck.id)}>Remove</button>
                      </div>
                    </div>

                    {/* Pricing quick view */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:0,borderBottom:"1px solid #0f172a"}}>
                      {[[fmt(truck.pricing.hourly)+"/hr","Hourly","#FF6B35"],[fmt(truck.pricing.daily)+"/day","Daily","#2EC4B6"],[fmt(truck.pricing.weekendRate)+"/hr","Weekend","#7B2FBE"],[truck.deposit.required?fmt(truck.deposit.amount):"None","Deposit","#f59e0b"]].map(([val,label,color])=>(
                        <div key={label} style={{padding:"10px 14px",borderRight:"1px solid #0f172a"}}>
                          <div style={{color,fontWeight:800,fontSize:14}}>{val}</div>
                          <div style={{color:"#475569",fontSize:10,fontWeight:700}}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Addons & coupons quick view */}
                    <div style={{padding:"10px 16px",display:"flex",gap:14,flexWrap:"wrap"}}>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{color:"#475569",fontSize:10,fontWeight:700}}>ADD-ONS:</span>
                        {truck.addons.slice(0,3).map(a=><span key={a.id} style={{background:"#0f172a",color:"#64748b",padding:"2px 7px",borderRadius:20,fontSize:10}}>{a.label}{a.included?" (free)":` +${fmt(a.price)}`}</span>)}
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{color:"#475569",fontSize:10,fontWeight:700}}>COUPONS:</span>
                        {truck.coupons.filter(c=>c.active).map(c=><span key={c.code} style={{background:"#FF6B3515",color:"#FF6B35",padding:"2px 7px",borderRadius:20,fontSize:10,fontFamily:"monospace",fontWeight:800}}>{c.code}</span>)}
                        {truck.coupons.filter(c=>c.active).length===0&&<span style={{color:"#334155",fontSize:10}}>None active</span>}
                      </div>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <span style={{color:"#475569",fontSize:10,fontWeight:700}}>INSURANCE:</span>
                        {truck.insurance?.verified?<span style={{color:"#22c55e",fontSize:10,fontWeight:700}}>✓ Verified</span>:<span style={{color:"#f59e0b",fontSize:10,fontWeight:700}}>⚠ Pending</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {myTrucks.length < (myPlan?.maxTrucks||1) && (
                <button style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"22px",background:"transparent",border:"2px dashed #334155",borderRadius:14,cursor:"pointer",fontFamily:"inherit",color:"#475569",fontSize:14,fontWeight:700,transition:"all 0.2s"}} onClick={()=>setTruckEditor({truck:null,isNew:true})}>
                  <span style={{fontSize:24}}>+</span> Add another truck to your fleet
                </button>
              )}
            </div>
          </div>}

          {/* ── Bookings Tab ── */}
          {vendorTab==="bookings"&&<div>
            <h1 style={s.adminTitle}>Bookings</h1><p style={{...s.adminSub,marginBottom:14}}>All bookings across your fleet</p>
            <div style={{background:"#1e293b",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 80px 70px 70px 90px 80px",padding:"8px 14px",borderBottom:"1px solid #334155"}}>
                {["Booking","Customer / Truck","Date","Hours","Subtotal","Total","Status"].map(h=><span key={h} style={{fontSize:9,color:"#475569",fontWeight:800,textTransform:"uppercase"}}>{h}</span>)}
              </div>
              {SEED_BOOKINGS.filter(b=>myTrucks.some(t=>t.id===b.truckId)).map((b,i,arr)=>{
                const truck=trucks.find(t=>t.id===b.truckId);
                return(
                  <div key={b.id} style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 80px 70px 70px 90px 80px",padding:"11px 14px",borderBottom:i<arr.length-1?"1px solid #1a2535":"none",alignItems:"center"}}>
                    <div><div style={{color:"#f1f5f9",fontSize:11,fontWeight:700}}>{b.id}</div><div style={{color:"#475569",fontSize:10}}>{b.startTime}</div></div>
                    <div><div style={{color:"#94a3b8",fontSize:12}}>{b.customer}</div><div style={{color:"#475569",fontSize:10}}>{truck?.provider} {truck?.size}</div></div>
                    <span style={{color:"#64748b",fontSize:11}}>{b.date.slice(5)}</span>
                    <span style={{color:"#64748b",fontSize:11}}>{b.hours}h</span>
                    <span style={{color:"#94a3b8",fontSize:11}}>{fmt(b.subtotal)}</span>
                    <span style={{color:"#22c55e",fontWeight:800,fontSize:12}}>{fmt(b.total)}</span>
                    <Badge color={b.status} dot>{b.status}</Badge>
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ── Earnings Tab ── */}
          {vendorTab==="earnings"&&<div>
            <h1 style={s.adminTitle}>Earnings</h1><p style={{...s.adminSub,marginBottom:14}}>Across all trucks</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
              {[[fmt(myTotalEarnings),"Total gross","#22c55e"],[fmt(myTotalEarnings*(1-0.08)),"Net earnings","#2EC4B6"],[String(myTotalBookings),"Total bookings","#FF6B35"],[String(myTrucks.length),"Active trucks","#7B2FBE"]].map(([val,label,color])=>(
                <div key={label} style={{background:"#1e293b",borderRadius:11,padding:"14px",borderTop:`3px solid ${color}`}}><div style={{fontSize:20,fontWeight:900,color:"#f1f5f9"}}>{val}</div><div style={{fontSize:10,color:"#475569",fontWeight:700,marginTop:2}}>{label}</div></div>
              ))}
            </div>
            <div style={{background:"#1e293b",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 90px 80px",padding:"8px 14px",borderBottom:"1px solid #334155"}}>
                {["Truck","Bookings","Rate/hr","Earnings","Net"].map(h=><span key={h} style={{fontSize:9,color:"#475569",fontWeight:800,textTransform:"uppercase"}}>{h}</span>)}
              </div>
              {myTrucks.map((t,i)=>(
                <div key={t.id} style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 90px 80px",padding:"11px 14px",borderBottom:i<myTrucks.length-1?"1px solid #1a2535":"none",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:18}}>{t.img}</span><div><div style={{color:"#f1f5f9",fontSize:12,fontWeight:700}}>{t.provider}</div><div style={{color:"#475569",fontSize:10}}>{t.size}</div></div></div>
                  <span style={{color:"#94a3b8",fontSize:12}}>{t.bookingsCount}</span>
                  <span style={{color:"#94a3b8",fontSize:12}}>{fmt(t.pricing.hourly)}</span>
                  <span style={{color:"#22c55e",fontWeight:800,fontSize:12}}>{fmt(t.earnings)}</span>
                  <span style={{color:"#2EC4B6",fontWeight:700,fontSize:12}}>{fmt(Math.round(t.earnings*0.92))}</span>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 80px 80px 90px 80px",padding:"10px 14px",background:"#0f172a"}}>
                <span style={{color:"#f1f5f9",fontWeight:800}}>Total</span>
                <span style={{color:"#f1f5f9",fontWeight:800}}>{myTotalBookings}</span>
                <span/>
                <span style={{color:"#22c55e",fontWeight:900,fontSize:14}}>{fmt(myTotalEarnings)}</span>
                <span style={{color:"#2EC4B6",fontWeight:900,fontSize:14}}>{fmt(Math.round(myTotalEarnings*0.92))}</span>
              </div>
            </div>
          </div>}

          {/* ── Plan Tab ── */}
          {vendorTab==="plan"&&<div>
            <h1 style={s.adminTitle}>My Plan</h1><p style={{...s.adminSub,marginBottom:18}}>HaulPro · currently on Pro</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
              {MONEY.plans.map(plan=>(
                <div key={plan.id} style={{background:"#1e293b",borderRadius:14,padding:"16px",border:`2px solid ${plan.id==="pro"?plan.color:"#334155"}`,position:"relative"}}>
                  {plan.id==="pro"&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:plan.color,color:"#fff",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:20,whiteSpace:"nowrap"}}>Current Plan</div>}
                  <div style={{fontSize:24,marginBottom:8}}>{plan.icon}</div>
                  <div style={{fontWeight:900,color:"#f1f5f9",fontSize:15}}>{plan.name}</div>
                  <div style={{color:plan.color,fontWeight:900,fontSize:20,margin:"4px 0"}}>{plan.price===0?"Free":`${fmt(plan.price)}/mo`}</div>
                  <div style={{color:"#64748b",fontSize:11,marginBottom:8}}>Booking fee: <strong style={{color:"#f1f5f9"}}>{fmtPct(plan.bookingFee)}</strong></div>
                  <div style={{color:"#64748b",fontSize:11}}>Up to {plan.maxTrucks===-1?"unlimited":plan.maxTrucks} truck{plan.maxTrucks!==1?"s":""}</div>
                </div>
              ))}
            </div>
          </div>}
        </main>
      </div>
    </div>
  );

  // ── Admin ─────────────────────────────────────────────────────────────────
  return (
    <div style={{...s.page,background:"#0f172a"}}>
      <style>{css}</style>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",minHeight:"100vh"}}>
        <aside style={s.sidebar}>
          <button style={{...s.logoBtn,marginBottom:20}} onClick={()=>setPortal("landing")}><span style={{fontSize:20}}>🚛</span><span style={{...s.logoText,fontSize:16}}>TruckNow</span></button>
          <div style={s.sidebarLabel}>Admin Portal</div>
          {[["💰","Revenue","revenue"],["🚛","Trucks","trucks"],["📦","Bookings","bookings"]].map(([icon,label,tab])=>(
            <button key={tab} style={{...s.sidebarItem,background:adminTab===tab?"#1e293b":"transparent",color:adminTab===tab?"#fff":"#64748b",borderLeft:adminTab===tab?"3px solid #FF6B35":"3px solid transparent"}} onClick={()=>setAdminTab(tab)}>{icon} {label}</button>
          ))}
          <div style={{marginTop:"auto",paddingTop:14,borderTop:"1px solid #1e293b"}}>
            <Avatar name="Admin" size={26} bg="linear-gradient(135deg,#FF6B35,#E63946)"/>
          </div>
        </aside>
        <main style={{flex:1,padding:"22px 18px",overflow:"auto"}}>
          {adminTab==="revenue"&&<div>
            <h1 style={s.adminTitle}>Revenue</h1><p style={{...s.adminSub,marginBottom:16}}>Platform income</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
              {[[fmt(totalTransFees),"Booking fees","#FF6B35"],[fmt(totalSubRevenue),"MRR","#7B2FBE"],[String(trucks.length),"Active trucks","#2EC4B6"],[String(SEED_BOOKINGS.length),"Bookings","#22c55e"]].map(([val,label,color])=>(
                <div key={label} style={{background:"#1e293b",borderRadius:12,padding:"14px",borderTop:`3px solid ${color}`}}><div style={{fontSize:20,fontWeight:900,color:"#f1f5f9"}}>{val}</div><div style={{fontSize:10,color:"#475569",fontWeight:700}}>{label}</div></div>
              ))}
            </div>
          </div>}
          {adminTab==="trucks"&&<div>
            <h1 style={s.adminTitle}>All Trucks</h1><p style={{...s.adminSub,marginBottom:14}}>{trucks.length} total across all vendors</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:11}}>
              {trucks.map(truck=>{const plan=MONEY.plans.find(p=>p.id===truck.plan); return(
                <div key={truck.id} style={{background:"#1e293b",borderRadius:12,padding:14,borderTop:`3px solid ${truck.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:24}}>{truck.img}</span>{truck.boostActive&&<Badge color="approved" dot>Boosted</Badge>}</div>
                  <div style={{display:"flex",gap:6,marginBottom:3,flexWrap:"wrap"}}><span style={{fontWeight:800,color:"#f1f5f9",fontSize:13}}>{truck.provider}</span><Badge color={truck.available?"approved":"rejected"} dot>{truck.available?"Live":"Paused"}</Badge></div>
                  <div style={{color:"#64748b",fontSize:11,marginBottom:6}}>{truck.size} · {truck.address}</div>
                  <div style={{color:"#64748b",fontSize:11,marginBottom:6}}>🛡️ Insurance: {truck.insurance?.verified?<span style={{color:"#22c55e",fontWeight:700}}>✓ Verified</span>:<span style={{color:"#f59e0b",fontWeight:700}}>Pending</span>}</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#f1f5f9",fontWeight:800}}>{fmt(truck.pricing.hourly)}/hr</span><Badge color={truck.plan}>{plan?.icon} {plan?.name}</Badge></div>
                </div>
              );})}
            </div>
          </div>}
          {adminTab==="bookings"&&<div>
            <h1 style={s.adminTitle}>All Bookings</h1><p style={{...s.adminSub,marginBottom:14}}>{SEED_BOOKINGS.length} total</p>
            <div style={{background:"#1e293b",borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 80px 90px 80px",padding:"8px 14px",borderBottom:"1px solid #334155"}}>
                {["Booking","Customer","Truck","Hours","Total","Status"].map(h=><span key={h} style={{fontSize:9,color:"#475569",fontWeight:800,textTransform:"uppercase"}}>{h}</span>)}
              </div>
              {SEED_BOOKINGS.map((b,i,arr)=>{const truck=trucks.find(t=>t.id===b.truckId);return(
                <div key={b.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 80px 90px 80px",padding:"11px 14px",borderBottom:i<arr.length-1?"1px solid #1a2535":"none",alignItems:"center"}}>
                  <div><div style={{color:"#f1f5f9",fontSize:11,fontWeight:700}}>{b.id}</div><div style={{color:"#475569",fontSize:10}}>{b.date}</div></div>
                  <span style={{color:"#94a3b8",fontSize:12}}>{b.customer}</span>
                  <span style={{color:"#64748b",fontSize:11}}>{truck?.provider} {truck?.size}</span>
                  <span style={{color:"#64748b",fontSize:11}}>{b.hours}h</span>
                  <span style={{color:"#22c55e",fontWeight:800,fontSize:12}}>{fmt(b.total)}</span>
                  <Badge color={b.status} dot>{b.status}</Badge>
                </div>
              );})}
            </div>
          </div>}
        </main>
      </div>
    </div>
  );
}

const css=`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}@keyframes spin{to{transform:rotate(360deg)}}input:focus,select:focus,textarea:focus{outline:2px solid #FF6B3555!important;border-color:#FF6B35!important}button{transition:opacity 0.15s}button:hover{opacity:0.86}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}`;
const s={page:{minHeight:"100vh",background:"#F8F7F4",fontFamily:"'Georgia','Times New Roman',serif",color:"#1A1A2E"},landingNav:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px",background:"#1A1A2E"},logoText:{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"-0.5px"},logoBtn:{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8},outlineBtn:{background:"transparent",border:"1.5px solid #FF6B35",color:"#FF6B35",borderRadius:20,padding:"6px 13px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},ghostBtn:{background:"transparent",border:"1.5px solid #334155",color:"#94a3b8",borderRadius:20,padding:"6px 13px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},landingHero:{background:"linear-gradient(160deg,#1A1A2E 0%,#0F3460 100%)",padding:"52px 20px 44px",textAlign:"center"},landingTitle:{fontSize:"clamp(22px,4vw,44px)",fontWeight:900,color:"#fff",margin:"0 0 9px",letterSpacing:"-1px",lineHeight:1.15},landingSub:{color:"#94a3b8",fontSize:14,marginBottom:28},heroCards:{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",maxWidth:780,margin:"0 auto 22px"},heroCard:{flex:1,minWidth:190,maxWidth:255,borderRadius:15,padding:"20px 16px",textAlign:"left",cursor:"pointer",fontFamily:"inherit"},heroCardTitle:{fontSize:15,fontWeight:900,margin:"0 0 5px"},heroCardDesc:{fontSize:11,lineHeight:1.5,margin:"0 0 10px"},heroCardCta:{fontSize:11,fontWeight:800},sidebar:{width:190,background:"#0f172a",borderRight:"1px solid #1e293b",padding:"16px 10px",display:"flex",flexDirection:"column",gap:2,minHeight:"100vh",flexShrink:0},sidebarLabel:{fontSize:9,color:"#334155",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5},sidebarItem:{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,textAlign:"left",transition:"all 0.15s"},adminTitle:{fontSize:19,fontWeight:900,color:"#f1f5f9",margin:"0 0 2px"},adminSub:{color:"#475569",fontSize:11,margin:0},backBtn:{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",marginBottom:14,padding:0,display:"block"}};
