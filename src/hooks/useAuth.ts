import { useState, useEffect, useCallback } from 'react';
import { api, getToken } from '@/lib/api';
export interface AluuUser { id: string; email: string; created_at?: string; }
export function useAuth() {
 const [user,setUser]=useState<AluuUser|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;const sync=()=>{if(!getToken()){setUser(null);setLoading(false);return;}api<{user:AluuUser}>('/auth/me').then(r=>{if(active)setUser(r.user);}).catch(()=>{localStorage.removeItem('aluuai_token');if(active)setUser(null);}).finally(()=>{if(active)setLoading(false);});};window.addEventListener('aluuai-auth-changed',sync);sync();return()=>{active=false;window.removeEventListener('aluuai-auth-changed',sync);};},[]);
 const signUp=useCallback(async(email:string,password:string)=>{try{await api('/auth/signup',{method:'POST',body:JSON.stringify({email,password})});return {error:null};}catch(error){return {error:error instanceof Error?error:new Error('Sign up failed')};}},[]);
 const signIn=useCallback(async(email:string,password:string)=>{try{const result=await api<{token:string;user:AluuUser}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('aluuai_token',result.token);setUser(result.user);window.dispatchEvent(new Event('aluuai-auth-changed'));return {error:null};}catch(error){return {error:error instanceof Error?error:new Error('Sign in failed')};}},[]);
 const signOut=useCallback(async()=>{localStorage.removeItem('aluuai_token');setUser(null);window.dispatchEvent(new Event('aluuai-auth-changed'));return {error:null};},[]);
 return {user,session:getToken()?{access_token:getToken()}:null,loading,signUp,signIn,signOut,isAuthenticated:!!user};
}
