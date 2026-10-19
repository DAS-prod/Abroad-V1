"use client";
import {Suspense,useEffect,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {supabase} from '@/lib/supabase';
function AuthCallbackContent(){const router=useRouter(),params=useSearchParams();const [error,setError]=useState('');useEffect(()=>{let active=true;(async()=>{try{const code=params.get('code');if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;}const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw error||new Error('Could not complete sign in');const next=params.get('next')||'/checkout';if(active)router.replace(next.startsWith('/')&&!next.startsWith('//')?next:'/checkout');}catch(e){if(active)setError(e instanceof Error?e.message:'Sign in failed')}})();return()=>{active=false}},[params,router]);return <main className="subPage"><section className="section shell"><h1>{error?'Sign in error':'Completing sign in…'}</h1>{error&&<p>{error} <a href="/account">Try again</a></p>}</section></main>}


export default function AuthCallback(){
  return (
    <Suspense fallback={<main className="subPage"><section className="section shell"><p>Loading…</p></section></main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
