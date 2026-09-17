/* =========================================================
   OCD STUDENT REWARD CORE v4.0.0
   UNIFIED ASSET / MINH HONG LEDGER BRIDGE
   ---------------------------------------------------------
   Mục tiêu:
   - Giữ tương thích toàn bộ API Core v3.6.0.
   - Core là nguồn duy nhất trả về tài sản cuối cùng.
   - Tích hợp MinhHongGiaoDich vào số dư Linh Thạch + vật phẩm.
   - Minh Hồng chỉ ghi giao dịch; Core tính kết quả cuối cùng.
   - Có refresh + event để trang con cập nhật theo Core.
   - Có registry đầu chờ cho Quest/Event/Exam/module tương lai.
 
   LƯU Ý KIẾN TRÚC:
   Bản này tự nạp nền Core v3.6.0 chính thức nếu chưa có,
   sau đó nâng cấp tại chỗ thành StudentRewardSystem v4.0.0.
   Các trang con vẫn dùng window.StudentRewardSystem như trước.
========================================================= */
(function(){
"use strict";
 
const V4_VERSION="4.0.0";
const LEGACY_URL="https://cdn.jsdelivr.net/gh/vnthudao-source/ocd4-assets@core-v3.6.0/student-reward-core.js";
 
const MH_CONFIG={
    policySheetName:"MinhHongThuMua",
    transactionSheetName:"MinhHongGiaoDich",
    confirmValue:"Tôi xác nhận bán vật phẩm này.",
    formResponseUrl:"https://docs.google.com/forms/d/e/1FAIpQLSdKYU3t5LgVKKY326Arq4TkqeUOe53HR6l8ZzM0-Z50YwvgsQ/formResponse",
    formEntries:{
        sellId:"entry.563661764",
        code:"entry.540081212",
        giftName:"entry.256766747",
        quantity:"entry.697793477",
        price:"entry.1111443255",
        gemType:"entry.1616135319",
        confirm:"entry.256416718"
    },
    cacheTtl:15000,
    pollDelay:1800,
    pollAttempts:8
};
 
let upgradePromise=null;
let mhCache=null;
let mhCacheTime=0;
const sourceRegistry=new Map();
 
function clean(v){ return String(v===undefined||v===null?"":v).trim(); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function positiveInt(v,RS){ return Math.max(0,Math.floor(RS.parseNumber(v))); }
function positiveNumber(v,RS){ return Math.max(0,Number(RS.parseNumber(v)||0)); }
 
function emit(name,detail){
    try{ window.dispatchEvent(new CustomEvent(name,{detail:detail||{}})); }catch(e){}
}
 
function loadLegacyCore(){
    if(window.StudentRewardSystem && window.StudentRewardSystem.version){
        return Promise.resolve(window.StudentRewardSystem);
    }
    return new Promise(function(resolve,reject){
        const existing=document.querySelector('script[data-ocd-core-v36-loader="1"]');
        if(existing){
            let count=0;
            const timer=setInterval(function(){
                count++;
                if(window.StudentRewardSystem && window.StudentRewardSystem.version){ clearInterval(timer); resolve(window.StudentRewardSystem); }
                else if(count>240){ clearInterval(timer); reject(new Error("Không tải được Reward Core v3.6.0.")); }
            },50);
            return;
        }
        const s=document.createElement("script");
        s.src=LEGACY_URL;
        s.async=false;
        s.dataset.ocdCoreV36Loader="1";
        s.onload=function(){
            if(window.StudentRewardSystem && window.StudentRewardSystem.version) resolve(window.StudentRewardSystem);
            else reject(new Error("Reward Core v3.6.0 đã tải nhưng không khởi tạo."));
        };
        s.onerror=function(){ reject(new Error("Không tải được file nền Reward Core v3.6.0.")); };
        (document.head||document.documentElement).appendChild(s);
    });
}
 
function detectPolicyColumns(rows,RS){
    if(!rows||!rows.length) return {};
    const h=rows[0].map(RS.normalizeText);
    const col=(a,f)=>{ const x=RS.findColumn(h,a); return x>=0?x:f; };
    return {
        giftName:col(["tên vật phẩm","ten vat pham"],0),
        price:col(["giá thu mua","gia thu mua"],1),
        gemType:col(["loại linh thạch","loai linh thach"],2),
        status:col(["trạng thái","trang thai","status"],3),
        dailyLimit:col(["giới hạn/ngày","gioi han/ngay","giới hạn ngày","gioi han ngay"],4)
    };
}
 
function detectSaleColumns(rows,RS){
    if(!rows||!rows.length) return {};
    const h=rows[0].map(RS.normalizeText);
    const col=(a,f)=>{ const x=RS.findColumn(h,a); return x>=0?x:f; };
    return {
        timestamp:col(["dấu thời gian","dau thoi gian","timestamp"],0),
        sellId:col(["sell_id","sell id","mã giao dịch","ma giao dich"],1),
        code:col(["mã học viên","ma hoc vien"],2),
        giftName:col(["tên vật phẩm","ten vat pham"],3),
        quantity:col(["số lượng","so luong"],4),
        price:col(["giá thu mua","gia thu mua"],5),
        gemType:col(["loại linh thạch","loai linh thach"],6),
        confirm:col(["xác nhận","xac nhan"],7),
        status:RS.findColumn(h,["trạng thái","trang thai","status"])
    };
}
 
function isPolicyActive(v,RS){ return RS.normalizeText(v)==="active"; }
function isSaleEffective(row,c,RS){
    const confirm=clean(row[c.confirm]);
    if(confirm!==MH_CONFIG.confirmValue) return false;
    if(c.status>=0){
        const s=RS.normalizeText(row[c.status]);
        if(["huy","da huy","hủy","đã hủy","thu hoi","da thu hoi","het hieu luc","khong hieu luc"].includes(s)) return false;
        if(s && s!=="deal" && s!=="active" && s!=="hoan tat" && s!=="completed") return false;
    }
    return true;
}
 
function mapPolicies(rows,RS){
    const out=[]; if(!rows||rows.length<2) return out;
    const c=detectPolicyColumns(rows,RS);
    for(let i=1;i<rows.length;i++){
        const r=rows[i];
        const name=clean(r[c.giftName]);
        const gemType=RS.normalizeGemType(r[c.gemType]);
        const price=positiveNumber(r[c.price],RS);
        if(!name||!gemType||price<=0||!isPolicyActive(r[c.status],RS)) continue;
        out.push({giftName:name,normalizedGiftName:RS.normalizeText(name),price,gemType,dailyLimit:positiveInt(r[c.dailyLimit],RS)});
    }
    return out;
}
 
function mapSales(rows,RS){
    const out=[]; if(!rows||rows.length<2) return out;
    const c=detectSaleColumns(rows,RS); const seen=new Set();
    for(let i=1;i<rows.length;i++){
        const r=rows[i]; if(!isSaleEffective(r,c,RS)) continue;
        const sellId=clean(r[c.sellId]);
        const code=RS.normalizeCode(r[c.code]);
        const giftName=clean(r[c.giftName]);
        const quantity=positiveInt(r[c.quantity],RS);
        const price=positiveNumber(r[c.price],RS);
        const gemType=RS.normalizeGemType(r[c.gemType]);
        if(!sellId||seen.has(sellId)||!code||!giftName||quantity<=0||price<=0||!gemType) continue;
        seen.add(sellId);
        out.push({
            transactionType:"minh-hong-sell", transactionId:"MH-"+sellId, sellId,
            timestamp:clean(r[c.timestamp]), code, giftName,
            normalizedGiftName:RS.normalizeText(giftName), quantity,
            unitPrice:price, rewardGemType:gemType,
            rewardGemAmount:quantity*price, rowIndex:i
        });
    }
    out.sort((a,b)=>{
        const da=RS.parseVietnameseDate(a.timestamp), db=RS.parseVietnameseDate(b.timestamp);
        const ta=da?da.getTime():0, tb=db?db.getTime():0;
        return ta-tb || a.rowIndex-b.rowIndex;
    });
    return out;
}
 
async function loadMinhHongData(force,RS){
    if(!force && mhCache && Date.now()-mhCacheTime<MH_CONFIG.cacheTtl) return mhCache;
    const results=await Promise.all([
        RS.fetchRows(RS.sheetNameCsvUrl(MH_CONFIG.policySheetName)),
        RS.fetchRows(RS.sheetNameCsvUrl(MH_CONFIG.transactionSheetName))
    ]);
    const policies=mapPolicies(results[0],RS);
    const sales=mapSales(results[1],RS);
    const salesByCode=new Map();
    sales.forEach(s=>{ if(!salesByCode.has(s.code)) salesByCode.set(s.code,[]); salesByCode.get(s.code).push(s); });
    mhCache={policies,sales,salesByCode,policyRows:results[0],saleRows:results[1]};
    mhCacheTime=Date.now();
    return mhCache;
}
 
function cloneItems(items){ return (items||[]).map(x=>Object.assign({},x)); }
function itemQty(item){ return Math.max(1,Math.floor(Number(item&&item.quantity||1))); }
 
function applySalesToItems(items,sales,RS){
    const lots=cloneItems(items);
    const rejected=[]; const applied=[];
    function available(name){
        const key=RS.normalizeText(name); let n=0;
        lots.forEach(x=>{ if(RS.normalizeText(x.giftName||x.name)===key) n+=Math.max(0,Number(x.quantity===undefined?1:x.quantity)); });
        return n;
    }
    (sales||[]).forEach(s=>{
        let need=s.quantity;
        if(available(s.giftName)<need){ rejected.push(Object.assign({reason:"INSUFFICIENT_ITEM"},s)); return; }
        for(let i=0;i<lots.length && need>0;i++){
            const lot=lots[i];
            if(RS.normalizeText(lot.giftName||lot.name)!==s.normalizedGiftName) continue;
            const q=Math.max(0,Number(lot.quantity===undefined?1:lot.quantity));
            const take=Math.min(q,need);
            lot.quantity=q-take; need-=take;
        }
        applied.push(s);
    });
    return {items:lots.filter(x=>Number(x.quantity===undefined?1:x.quantity)>0),applied,rejected};
}
 
function applySalesToGems(gems,applied,RS){
    let result=Object.assign({},gems||{});
    (applied||[]).forEach(s=>{ result=RS.addGemReward(result,s.rewardGemType,s.rewardGemAmount); });
    return result;
}
 
function buildOffers(profile,data,RS){
    const code=RS.normalizeCode(profile&&profile.code||profile&&profile.studentCode||"");
    const items=profile&&profile.ownedItems||[];
    const now=new Date();
    const todayKey=new Intl.DateTimeFormat("en-CA",{timeZone:RS.CONFIG.timeZone||"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
    return data.policies.map(p=>{
        const owned=RS.getOwnedItemQuantity(items,p.giftName);
        let soldToday=0;
        (data.salesByCode.get(code)||[]).forEach(s=>{
            if(s.normalizedGiftName!==p.normalizedGiftName) return;
            const d=RS.parseVietnameseDate(s.timestamp); if(!d) return;
            const k=new Intl.DateTimeFormat("en-CA",{timeZone:RS.CONFIG.timeZone||"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
            if(k===todayKey) soldToday+=s.quantity;
        });
        const remaining=p.dailyLimit>0?Math.max(0,p.dailyLimit-soldToday):owned;
        const maxQuantity=Math.max(0,Math.min(owned,remaining));
        return Object.assign({},p,{ownedQuantity:owned,soldToday,remainingToday:remaining,maxQuantity,available:maxQuantity>0});
    }).filter(x=>x.ownedQuantity>0);
}
 
function createSellId(code,RS){
    const c=RS.normalizeCode(code)||"UNKNOWN";
    let rnd="";
    try{ if(window.crypto&&window.crypto.getRandomValues){ const a=new Uint32Array(2); window.crypto.getRandomValues(a); rnd=a[0].toString(36)+a[1].toString(36); } }catch(e){}
    if(!rnd) rnd=Date.now().toString(36)+Math.random().toString(36).slice(2,10);
    const day=new Intl.DateTimeFormat("en-CA",{timeZone:RS.CONFIG.timeZone||"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()).replace(/-/g,"");
    return ("MH-"+day+"-"+c+"-"+rnd).replace(/[^a-zA-Z0-9._:-]/g,"").slice(0,120);
}
 
function submitForm(payload){
    return new Promise(function(resolve){
        const iframe=document.createElement("iframe");
        iframe.name="mhSellFrame_"+Date.now(); iframe.style.display="none";
        const form=document.createElement("form");
        form.method="POST"; form.action=MH_CONFIG.formResponseUrl; form.target=iframe.name; form.style.display="none";
        Object.keys(payload).forEach(k=>{ const input=document.createElement("input"); input.type="hidden"; input.name=k; input.value=payload[k]; form.appendChild(input); });
        document.body.appendChild(iframe); document.body.appendChild(form); form.submit();
        setTimeout(()=>{ try{form.remove();iframe.remove();}catch(e){} resolve(true); },700);
    });
}
 
function registerAssetSource(name,adapter){
    const key=clean(name); if(!key||typeof adapter!=="function") throw new Error("Asset source không hợp lệ.");
    sourceRegistry.set(key,adapter); return true;
}
function unregisterAssetSource(name){ return sourceRegistry.delete(clean(name)); }
function getRegisteredAssetSources(){ return Array.from(sourceRegistry.keys()); }
 
async function installV4(RS){
    if(RS.__OCD_UNIFIED_ASSET_V4__) return RS;
    Object.defineProperty(RS,"__OCD_UNIFIED_ASSET_V4__",{value:true,configurable:false});
 
    const legacy={
        version:RS.version,
        loadSharedRewardData:RS.loadSharedRewardData.bind(RS),
        getStudentRewardProfile:RS.getStudentRewardProfile.bind(RS),
        processTransactions:RS.processTransactions.bind(RS),
        mergeOwnedItems:RS.mergeOwnedItems.bind(RS)
    };
 
    RS.CONFIG.minhHongBuybackSheetName=MH_CONFIG.policySheetName;
    RS.CONFIG.minhHongTransactionSheetName=MH_CONFIG.transactionSheetName;
    RS.CONFIG.minhHongConfirmValue=MH_CONFIG.confirmValue;
    RS.CONFIG.minhHongFormResponseUrl=MH_CONFIG.formResponseUrl;
    RS.CONFIG.minhHongFormEntries=Object.assign({},MH_CONFIG.formEntries);
 
    RS.loadMinhHongData=function(force){ return loadMinhHongData(Boolean(force),RS); };
 
    RS.loadSharedRewardData=async function(force){
        const results=await Promise.all([legacy.loadSharedRewardData(force),loadMinhHongData(Boolean(force),RS)]);
        const shared=results[0], mh=results[1];
        shared.minhHongPolicies=mh.policies;
        shared.minhHongSales=mh.sales;
        shared.minhHongSalesByCode=mh.salesByCode;
        return shared;
    };
 
    RS.getStudentRewardProfile=async function(code,submissionCsvText,force){
        const results=await Promise.all([
            legacy.getStudentRewardProfile(code,submissionCsvText),
            loadMinhHongData(Boolean(force),RS)
        ]);
        const profile=results[0], mh=results[1];
        const studentCode=RS.normalizeCode(code);
        const sales=mh.salesByCode.get(studentCode)||[];
        const itemResult=applySalesToItems(profile.ownedItems||[],sales,RS);
        const gems=applySalesToGems(profile.gems||profile.balance||{},itemResult.applied,RS);
        profile.code=profile.code||studentCode;
        profile.gems=gems;
        profile.balance=gems;
        profile.ownedItems=itemResult.items;
        profile.redeemedItems=itemResult.items;
        profile.minhHong={
            sales:itemResult.applied.slice(),
            rejectedSales:itemResult.rejected.slice(),
            offers:[]
        };
        profile.minhHong.offers=buildOffers(profile,mh,RS);
        profile.assets={
            gems:profile.gems,
            items:profile.ownedItems,
            transactions:itemResult.applied.slice(),
            rejectedTransactions:itemResult.rejected.slice()
        };
        return profile;
    };
 
    RS.refreshStudentRewardProfile=async function(code,submissionCsvText){
        mhCache=null; mhCacheTime=0;
        const profile=await RS.getStudentRewardProfile(code,submissionCsvText,true);
        emit("ocdRewardProfileChanged",{code:RS.normalizeCode(code),profile,version:V4_VERSION});
        return profile;
    };
 
    RS.getMinhHongOffers=async function(code,submissionCsvText,force){
        const p=await RS.getStudentRewardProfile(code,submissionCsvText,force);
        return p.minhHong?p.minhHong.offers:[];
    };
 
    RS.createMinhHongSaleRequest=async function(code,giftName,quantity,submissionCsvText){
        const profile=await RS.getStudentRewardProfile(code,submissionCsvText,true);
        const q=positiveInt(quantity,RS); if(q<=0) throw new Error("Số lượng bán không hợp lệ.");
        const offer=(profile.minhHong.offers||[]).find(x=>x.normalizedGiftName===RS.normalizeText(giftName));
        if(!offer||!offer.available) throw new Error("Vật phẩm này hiện không nằm trong danh sách Minh Hồng thu mua.");
        if(q>offer.maxQuantity) throw new Error("Số lượng vượt quá số đang sở hữu hoặc giới hạn thu mua hôm nay.");
        return {
            sellId:createSellId(code,RS), code:RS.normalizeCode(code), giftName:offer.giftName,
            quantity:q, unitPrice:offer.price, gemType:offer.gemType,
            rewardAmount:q*offer.price, confirm:MH_CONFIG.confirmValue
        };
    };
 
    RS.submitMinhHongSaleRequest=async function(request){
        const e=MH_CONFIG.formEntries;
        const payload={};
        payload[e.sellId]=request.sellId; payload[e.code]=request.code; payload[e.giftName]=request.giftName;
        payload[e.quantity]=String(request.quantity); payload[e.price]=String(request.unitPrice);
        payload[e.gemType]=RS.GEM_TYPES[request.gemType]?RS.GEM_TYPES[request.gemType].displayName:request.gemType;
        payload[e.confirm]=MH_CONFIG.confirmValue;
        await submitForm(payload); return request;
    };
 
    RS.waitForMinhHongSale=async function(sellId,attempts){
        const max=Math.max(1,Number(attempts||MH_CONFIG.pollAttempts));
        for(let i=0;i<max;i++){
            if(i>0) await sleep(MH_CONFIG.pollDelay);
            mhCache=null; mhCacheTime=0;
            const data=await loadMinhHongData(true,RS);
            const found=data.sales.find(x=>x.sellId===sellId);
            if(found) return found;
        }
        return null;
    };
 
    RS.sellItemToMinhHong=async function(code,giftName,quantity,submissionCsvText){
        const request=await RS.createMinhHongSaleRequest(code,giftName,quantity,submissionCsvText);
        await RS.submitMinhHongSaleRequest(request);
        const sale=await RS.waitForMinhHongSale(request.sellId);
        if(!sale) throw new Error("Đã gửi yêu cầu bán nhưng chưa thấy SELL_ID trong MinhHongGiaoDich. Tài sản chưa được xác nhận thay đổi.");
        const profile=await RS.refreshStudentRewardProfile(code,submissionCsvText);
        return {request,sale,profile};
    };
 
    RS.registerAssetSource=registerAssetSource;
    RS.unregisterAssetSource=unregisterAssetSource;
    RS.getRegisteredAssetSources=getRegisteredAssetSources;
    RS.createAssetTransaction=function(input){
        const tx=Object.assign({},input||{});
        tx.transactionId=clean(tx.transactionId); tx.transactionType=clean(tx.transactionType||"external");
        tx.code=RS.normalizeCode(tx.code); tx.effects=Array.isArray(tx.effects)?tx.effects.map(x=>Object.assign({},x)):[];
        if(!tx.transactionId) throw new Error("transactionId là bắt buộc.");
        return tx;
    };
 
    RS.version=V4_VERSION;
    RS.legacyVersion=legacy.version;
    RS.MinhHongBuyback={
        version:"2.0.0-core", config:MH_CONFIG,
        loadData:RS.loadMinhHongData,
        getOffers:RS.getMinhHongOffers,
        createSaleRequest:RS.createMinhHongSaleRequest,
        submitSaleRequest:RS.submitMinhHongSaleRequest,
        waitForSale:RS.waitForMinhHongSale,
        sell:RS.sellItemToMinhHong
    };
 
    emit("studentRewardCoreReady",{version:V4_VERSION,legacyVersion:legacy.version,unifiedAssets:true});
    emit("ocdRewardCoreUpgraded",{version:V4_VERSION});
    console.log("[StudentRewardSystem] Core v"+V4_VERSION+" ready. Legacy nền: "+legacy.version);
    return RS;
}
 
function start(){
    if(upgradePromise) return upgradePromise;
    upgradePromise=loadLegacyCore().then(installV4).catch(function(error){
        console.error("[StudentRewardSystem v4]",error); throw error;
    });
    window.StudentRewardSystemReady=upgradePromise;
    return upgradePromise;
}
 
start();
})();
