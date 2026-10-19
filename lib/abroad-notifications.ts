import 'server-only';
import {service} from './abroad-order';
export async function notifyAbroadOrder(orderId:string,notificationType:'abroad_order_paid'|'abroad_whatsapp_order'):Promise<boolean>{
 try {
 const db=service();
 const {error}=await db.from('abroad_notification_logs').upsert({order_id:orderId,notification_type:notificationType,title:`${notificationType==='abroad_order_paid'?'Abroad order paid':'Abroad WhatsApp order'} · ${orderId}`},{onConflict:'order_id,notification_type',ignoreDuplicates:true});
 if(error)throw new Error(error.message);
 const url=process.env.ADMIN_PUSH_WEBHOOK_URL?.trim(),secret=process.env.ADMIN_PUSH_WEBHOOK_SECRET?.trim();
 if(!url || !secret){console.warn('Abroad notification queued; configure admin push environment variables.');return false;}
 const response=await fetch(url,{method:'POST',cache:'no-store',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json','x-gb-push-secret':secret},body:JSON.stringify({orderId,notificationType})});
 if(!response.ok){console.error('Abroad push not delivered',response.status);return false;}
 return true;
 }catch(e){console.error('Abroad push failed; checkout remains valid',e);return false;}
}
