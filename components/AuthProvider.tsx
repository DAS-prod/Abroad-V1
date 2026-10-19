"use client";
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
import type {User} from "@supabase/supabase-js";

type AuthState={user:User|null; loading:boolean; showLogin:(next?:string)=>void; closeLogin:()=>void; requireLogin:(next?:string)=>Promise<boolean>};
const AuthContext=createContext<AuthState|null>(null);
export function useAbroadAuth(){const value=useContext(AuthContext);if(!value)throw new Error("AuthProvider missing");return value;}
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[open,setOpen]=useState(false),[next,setNext]=useState('/checkout');
 const router=useRouter();
 useEffect(()=>{let mounted=true;supabase.auth.getUser().then(({data})=>{if(mounted){setUser(data.user);setLoading(false);}}).catch(()=>{if(mounted)setLoading(false)});
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null);setLoading(false);if(session?.user)setOpen(false)});
 return ()=>{mounted=false;subscription.unsubscribe()};},[]);
 const showLogin=useCallback((path='/checkout')=>{setNext(path.startsWith('/')&&!path.startsWith('//')?path:'/checkout');setOpen(true)},[]);
 const closeLogin=useCallback(()=>setOpen(false),[]);
 const requireLogin=useCallback(async(path='/checkout')=>{const {data}=await supabase.auth.getUser();if(data.user)return true;showLogin(path);return false},[showLogin]);
 return <AuthContext.Provider value={{user,loading,showLogin,closeLogin,requireLogin}}>{children}{open&&<LoginDialog next={next} onClose={closeLogin} onSuccess={()=>{closeLogin();router.push(next)}}/>}</AuthContext.Provider>;
}
export function LoginDialog({next='/checkout',onClose,onSuccess}:{next?:string;onClose:()=>void;onSuccess?:()=>void}){
 const [mode,setMode]=useState<'login'|'signup'|'reset'>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[onClose]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
 if(mode==='reset'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/account`});if(error)throw error;setMessage('Password reset link sent to your email.');return;}
 if(mode==='signup'){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;if(!data.session){setMessage('Account created. Please confirm your email, then sign in.');return;}}
 else {const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}
 onSuccess?.();
 }catch(e){setMessage(e instanceof Error?e.message:'Unable to sign in')}finally{setBusy(false)}}
 async function google(){setBusy(true);setMessage('');const safeNext=next.startsWith('/')&&!next.startsWith('//')?next:'/checkout';const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`}});if(error){setMessage(error.message);setBusy(false)}}
 return <div className="abroadAuthBackdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="abroadAuthDialog" role="dialog" aria-modal="true" aria-labelledby="abroad-auth-title"><button type="button" className="abroadAuthClose" aria-label="Close login" onClick={onClose}>×</button><span className="eyebrow">GODAVARI BASKET ABROAD</span><h2 id="abroad-auth-title">{mode==='login'?'Welcome back':mode==='signup'?'Create your account':'Reset password'}</h2><p>Sign in securely to continue your order.</p>{mode!=='reset'&&<button className="abroadGoogleButton" type="button" disabled={busy} onClick={google}>Continue with Google</button>}{mode!=='reset'&&<div className="abroadAuthOr">or use your email</div>}<form onSubmit={submit}>{mode==='signup'&&<input required placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>}<input required type="email" autoComplete="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>{mode!=='reset'&&<input required minLength={6} type="password" autoComplete={mode==='signup'?'new-password':'current-password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>}<button className="goldButton abroadAuthSubmit" disabled={busy} type="submit">{busy?'Please wait…':mode==='login'?'Sign in':mode==='signup'?'Create account':'Send reset link'}</button></form>{message&&<p role="status" className="abroadAuthMessage">{message}</p>}<div className="abroadAuthLinks">{mode!=='login'&&<button onClick={()=>{setMode('login');setMessage('')}}>Sign in</button>}{mode==='login'&&<><button onClick={()=>{setMode('signup');setMessage('')}}>Create account</button><button onClick={()=>{setMode('reset');setMessage('')}}>Forgot password?</button></>}</div></section></div>
}
