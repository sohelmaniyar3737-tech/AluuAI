import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Chat, Message } from '@/types/database';
import { useAuth } from './useAuth';
const DRAFT_KEY='aluuai_draft_message';
export function useChats(){
 const {user}=useAuth();const [chats,setChats]=useState<Chat[]>([]);const [activeChat,setActiveChat]=useState<Chat|null>(null);const [messages,setMessages]=useState<Message[]>([]);const [loading,setLoading]=useState(true);const [searchQuery,setSearchQuery]=useState('');const [isNewChatMode,setIsNewChatMode]=useState(true);const [draftMessage,setDraftMessage]=useState('');
 useEffect(()=>{const saved=localStorage.getItem(DRAFT_KEY);if(saved)setDraftMessage(saved);},[]);useEffect(()=>{if(draftMessage)localStorage.setItem(DRAFT_KEY,draftMessage);else localStorage.removeItem(DRAFT_KEY);},[draftMessage]);
 const refreshChats=useCallback(async()=>{if(!user){setChats([]);setLoading(false);return;}setLoading(true);try{setChats(await api<Chat[]>('/chats'));}catch(e){console.error('Unable to load chats',e);}finally{setLoading(false);}},[user]);
 useEffect(()=>{refreshChats();},[refreshChats]);
 useEffect(()=>{if(!activeChat||!user){if(isNewChatMode)setMessages([]);return;}let active=true;api<Message[]>(`/chats/${activeChat.id}/messages`).then(d=>{if(active)setMessages(d);}).catch(e=>console.error('Unable to load messages',e));return()=>{active=false;};},[activeChat,user,isNewChatMode]);
 const filteredChats=chats.filter(c=>c.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a,b)=>Number(b.is_pinned)-Number(a.is_pinned)||new Date(b.updated_at).getTime()-new Date(a.updated_at).getTime());
 const startNewChat=useCallback(()=>{setActiveChat(null);setMessages([]);setIsNewChatMode(true);},[]);
 const createChat=useCallback(async():Promise<Chat|null>=>{if(!user)return null;try{const c=await api<Chat>('/chats',{method:'POST',body:JSON.stringify({title:'New Chat'})});setChats(p=>[c,...p]);setActiveChat(c);setMessages([]);setIsNewChatMode(false);setDraftMessage('');localStorage.removeItem(DRAFT_KEY);return c;}catch(e){console.error(e);return null;}},[user]);
 const renameChat=useCallback(async(id:string,title:string)=>{try{const c=await api<Chat>(`/chats/${id}`,{method:'PATCH',body:JSON.stringify({title})});setChats(p=>p.map(x=>x.id===id?c:x));setActiveChat(p=>p?.id===id?c:p);}catch(e){console.error(e);}},[]);
 const deleteChat=useCallback(async(id:string)=>{try{await api(`/chats/${id}`,{method:'DELETE'});setChats(p=>p.filter(c=>c.id!==id));if(activeChat?.id===id){setActiveChat(null);setMessages([]);setIsNewChatMode(true);}}catch(e){console.error(e);}},[activeChat]);
 const clearChat=useCallback(async(id:string)=>{try{await api(`/chats/${id}/messages`,{method:'DELETE'});if(activeChat?.id===id)setMessages([]);}catch(e){console.error(e);}},[activeChat]);
 const togglePinChat=useCallback(async(id:string)=>{const c=chats.find(x=>x.id===id);if(!c)return;try{const updated=await api<Chat>(`/chats/${id}`,{method:'PATCH',body:JSON.stringify({is_pinned:!c.is_pinned})});setChats(p=>p.map(x=>x.id===id?updated:x));setActiveChat(p=>p?.id===id?updated:p);}catch(e){console.error(e);}},[chats]);
 const clearAllChats=useCallback(async()=>{if(!user)return;try{await api('/chats',{method:'DELETE'});setChats([]);setActiveChat(null);setMessages([]);setIsNewChatMode(true);}catch(e){console.error(e);}},[user]);
 const addMessage=useCallback(async(chatId:string,role:'user'|'assistant',content:string):Promise<Message|null>=>{if(!user)return null;try{const m=await api<Message>(`/chats/${chatId}/messages`,{method:'POST',body:JSON.stringify({role,content})});setMessages(p=>[...p,m]);if(role==='user'){const chat=chats.find(c=>c.id===chatId);if(chat?.title==='New Chat'){const title=content.slice(0,30)+(content.length>30?'...':'');await renameChat(chatId,title);}await refreshChats();}return m;}catch(e){console.error(e);return null;}},[user,chats,renameChat,refreshChats]);
 const updateMessage=useCallback((id:string,content:string)=>setMessages(p=>p.map(m=>m.id===id?{...m,content}:m)),[]);const selectChat=useCallback((c:Chat)=>{setActiveChat(c);setIsNewChatMode(false);},[]);
 return {chats:filteredChats,activeChat,messages,loading,searchQuery,setSearchQuery,isNewChatMode,draftMessage,setDraftMessage,startNewChat,createChat,renameChat,deleteChat,clearChat,togglePinChat,clearAllChats,addMessage,updateMessage,selectChat};
}
