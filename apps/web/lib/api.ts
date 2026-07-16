import { demoCases } from './data';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export async function getCases() { try { const r=await fetch(`${API}/cases`,{cache:'no-store'}); if(!r.ok) throw new Error(); return await r.json(); } catch { return demoCases; } }
export async function login(payload:{email:string;password:string;role:string}) { const r=await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) return { accessToken:'demo-token', user:{name:payload.email.split('@')[0],email:payload.email,role:payload.role,firm:'Hamilton & Pierce LLP'} }; return r.json(); }
