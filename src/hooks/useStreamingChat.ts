import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Attachment } from '@/types/database';
export function useStreamingChat() {
 const [isLoading,setIsLoading]=useState(false);const [error,setError]=useState<string|null>(null);const [streamingContent,setStreamingContent]=useState('');
 const sendMessage=useCallback(async(message:string,conversationHistory:{role:string;content:string}[],onStream?:(chunk:string)=>void,attachments?:Attachment[],documentContent?:string):Promise<string|null>=>{setIsLoading(true);setError(null);setStreamingContent('');try{const prompt=documentContent?`${message}

Document content:
${documentContent}`:message;const data=await api<{reply:string}>('/chat',{method:'POST',body:JSON.stringify({message:prompt,conversationHistory:conversationHistory.slice(-20).map(m=>({role:m.role,content:m.content.slice(0,3500)})),attachments:attachments?.map(a=>({file_url:a.file_url,file_type:a.file_type,file_name:a.file_name}))})});const reply=data.reply||'';if(onStream&&reply){let accumulated='';for(const word of reply.split(' ')){accumulated+=(accumulated?' ':'')+word;setStreamingContent(accumulated);onStream(accumulated);await new Promise(r=>setTimeout(r,18));}}setStreamingContent('');return reply;}catch(err){const msg=err instanceof Error?err.message:'Unexpected error';setError(msg);return null;}finally{setIsLoading(false);}},[]);
 return {sendMessage,isLoading,error,clearError:()=>setError(null),streamingContent};
}
