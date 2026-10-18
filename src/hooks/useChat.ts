import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Message } from '@/types/chat';
export function useChat() {
 const [isLoading,setIsLoading]=useState(false);const [error,setError]=useState<string|null>(null);
 const sendMessage=useCallback(async(message:string,conversationHistory:Message[]):Promise<string|null>=>{setIsLoading(true);setError(null);try{const data=await api<{reply:string}>('/chat',{method:'POST',body:JSON.stringify({message,conversationHistory:conversationHistory.map(m=>({role:m.role,content:m.content}))})});return data.reply||null;}catch(err){const msg=err instanceof Error?err.message:'Unexpected error';setError(msg);return null;}finally{setIsLoading(false);}},[]);
 return {sendMessage,isLoading,error,clearError:()=>setError(null)};
}
