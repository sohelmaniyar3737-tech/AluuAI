import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const app = express();
app.set('trust proxy', 1);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map(s => s.trim()), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !JWT_SECRET) return res.status(401).json({ error: 'Please sign in again.' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Session expired. Please sign in again.' }); }
}
function asyncRoute(fn) { return (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next); }
function ownsChat(userId, chatId) { return pool.query('SELECT id FROM chats WHERE id=$1 AND user_id=$2',[chatId,userId]); }

app.get('/api/health', asyncRoute(async (_req,res) => { await pool.query('SELECT 1'); res.json({ ok:true, service:'AluuAI API' }); }));
app.post('/api/auth/signup', asyncRoute(async (req,res) => {
 const email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||'');
 if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({error:'Enter a valid email address.'});
 if (password.length < 8) return res.status(400).json({error:'Password must be at least 8 characters.'});
 const hash=await bcrypt.hash(password,12);
 try { const r=await pool.query('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email,created_at',[email,hash]); res.status(201).json({message:'Account created. You can now sign in.',user:r.rows[0]}); }
 catch(e) { if(e.code==='23505') return res.status(409).json({error:'This email is already registered.'}); throw e; }
}));
app.post('/api/auth/login', asyncRoute(async (req,res) => {
 const email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||'');
 const r=await pool.query('SELECT id,email,password_hash FROM users WHERE email=$1',[email]);
 if(!r.rowCount || !(await bcrypt.compare(password,r.rows[0].password_hash))) return res.status(401).json({error:'Invalid email or password.'});
 if(!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
 const user={id:r.rows[0].id,email:r.rows[0].email};
 res.json({token:jwt.sign(user,JWT_SECRET,{expiresIn:'7d'}),user});
}));
app.get('/api/auth/me',auth,asyncRoute(async(req,res)=>{ const r=await pool.query('SELECT id,email,created_at FROM users WHERE id=$1',[req.user.id]); if(!r.rowCount)return res.status(401).json({error:'Account not found'}); res.json({user:r.rows[0]}); }));
app.get('/api/chats',auth,asyncRoute(async(req,res)=>{const r=await pool.query('SELECT * FROM chats WHERE user_id=$1 ORDER BY is_pinned DESC,updated_at DESC',[req.user.id]);res.json(r.rows);}));
app.post('/api/chats',auth,asyncRoute(async(req,res)=>{const r=await pool.query('INSERT INTO chats(user_id,title) VALUES($1,$2) RETURNING *',[req.user.id, String(req.body.title||'New Chat').slice(0,120)]);res.status(201).json(r.rows[0]);}));
app.patch('/api/chats/:id',auth,asyncRoute(async(req,res)=>{const allowed={}; if(typeof req.body.title==='string')allowed.title=req.body.title.slice(0,120);if(typeof req.body.is_pinned==='boolean')allowed.is_pinned=req.body.is_pinned;const keys=Object.keys(allowed);if(!keys.length)return res.status(400).json({error:'No supported changes supplied.'});const vals=[req.params.id,req.user.id,...keys.map(k=>allowed[k])];const sets=keys.map((k,i)=>`${k}=$${i+3}`).join(',');const r=await pool.query(`UPDATE chats SET ${sets},updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *`,vals);if(!r.rowCount)return res.status(404).json({error:'Chat not found'});res.json(r.rows[0]);}));
app.delete('/api/chats',auth,asyncRoute(async(req,res)=>{await pool.query('DELETE FROM chats WHERE user_id=$1',[req.user.id]);res.json({ok:true});}));
app.delete('/api/chats/:id',auth,asyncRoute(async(req,res)=>{const r=await pool.query('DELETE FROM chats WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({error:'Chat not found'});res.json({ok:true});}));
app.get('/api/chats/:id/messages',auth,asyncRoute(async(req,res)=>{if(!(await ownsChat(req.user.id,req.params.id)).rowCount)return res.status(404).json({error:'Chat not found'});const r=await pool.query('SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC',[req.params.id]);res.json(r.rows);}));
app.post('/api/chats/:id/messages',auth,asyncRoute(async(req,res)=>{if(!(await ownsChat(req.user.id,req.params.id)).rowCount)return res.status(404).json({error:'Chat not found'});const role=req.body.role,content=String(req.body.content||'');if(!['user','assistant'].includes(role)||!content.trim())return res.status(400).json({error:'A valid message is required.'});const r=await pool.query('INSERT INTO messages(chat_id,user_id,role,content) VALUES($1,$2,$3,$4) RETURNING *',[req.params.id,req.user.id,role,content.slice(0,50000)]);await pool.query('UPDATE chats SET updated_at=NOW(),title=CASE WHEN title=\'New Chat\' AND $3=\'user\' THEN LEFT($4,30) ELSE title END WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id,role,content]);res.status(201).json(r.rows[0]);}));
app.delete('/api/chats/:id/messages',auth,asyncRoute(async(req,res)=>{if(!(await ownsChat(req.user.id,req.params.id)).rowCount)return res.status(404).json({error:'Chat not found'});await pool.query('DELETE FROM messages WHERE chat_id=$1',[req.params.id]);res.json({ok:true});}));
app.post('/api/chat',auth,asyncRoute(async(req,res)=>{
 const message=String(req.body.message||'').trim();if(!message)return res.status(400).json({error:'Message is required.'});if(message.length>4000)return res.status(400).json({error:'Message is too long.'});
 const key=process.env.AI_API_KEY, endpoint=process.env.AI_BASE_URL||'https://api.openai.com/v1/chat/completions', model=process.env.AI_MODEL||'gpt-4o-mini';
 if(!key)return res.status(503).json({error:'AI service is not configured yet. Add AI_API_KEY in the backend environment variables.'});
 const history=Array.isArray(req.body.conversationHistory)?req.body.conversationHistory.slice(-20):[];
 const attachments=Array.isArray(req.body.attachments)?req.body.attachments.slice(0,5):[];
 const imageParts=attachments.filter(a=>a && a.file_type==='image' && typeof a.file_url==='string' && /^https?:\/\//i.test(a.file_url)).map(a=>({type:'image_url',image_url:{url:a.file_url}}));
 const userContent=imageParts.length?[{type:'text',text:message},...imageParts]:message;
 const messages=[{role:'system',content:'You are AluuAI, a friendly, helpful AI assistant. Be clear, useful, and concise. Match the user language, including Hindi or Hinglish when appropriate.'},...history.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,3500)})),{role:'user',content:userContent}];
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model,messages,temperature:0.7})});
 const data=await response.json().catch(()=>({}));if(!response.ok)return res.status(502).json({error:data.error?.message||'AI provider request failed. Check the AI key and model settings.'});
 const reply=data.choices?.[0]?.message?.content;if(typeof reply!=='string')return res.status(502).json({error:'AI provider returned an unexpected response.'});res.json({reply});
}));
const storage=multer({storage:multer.diskStorage({destination:(_req,_file,cb)=>cb(null,uploadsDir),filename:(_req,file,cb)=>cb(null,`${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).slice(0,10)}`)}),limits:{fileSize:10*1024*1024},fileFilter:(_req,file,cb)=>{const ok=['image/jpeg','image/png','image/webp','application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);cb(ok?null:new Error('Unsupported file type.'),ok);}});
app.post('/api/uploads',auth,storage.single('file'),asyncRoute(async(req,res)=>{if(!req.file)return res.status(400).json({error:'Select a file to upload.'});const chatId=String(req.body.chatId||'');if(chatId&&!(await ownsChat(req.user.id,chatId)).rowCount){fs.unlinkSync(req.file.path);return res.status(404).json({error:'Chat not found'});}const fileType=req.file.mimetype.startsWith('image/')?'image':'document';const fileUrl=`${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`;const r=await pool.query('INSERT INTO attachments(user_id,chat_id,file_url,file_type,file_name,file_size) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.user.id,chatId||null,fileUrl,fileType,req.file.originalname,req.file.size]);res.status(201).json(r.rows[0]);}));
app.get('/api/chats/:id/attachments',auth,asyncRoute(async(req,res)=>{if(!(await ownsChat(req.user.id,req.params.id)).rowCount)return res.status(404).json({error:'Chat not found'});const r=await pool.query('SELECT * FROM attachments WHERE chat_id=$1 AND user_id=$2 ORDER BY created_at',[req.params.id,req.user.id]);res.json(r.rows);}));
app.patch('/api/attachments/:id/message',auth,asyncRoute(async(req,res)=>{const r=await pool.query('UPDATE attachments SET message_id=$1 WHERE id=$2 AND user_id=$3 RETURNING *',[req.body.messageId,req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({error:'Attachment not found'});res.json(r.rows[0]);}));
app.get('/api/preferences',auth,asyncRoute(async(req,res)=>{const r=await pool.query('SELECT theme,language FROM user_preferences WHERE user_id=$1',[req.user.id]);res.json(r.rows[0]||{theme:'light',language:'en'});}));
app.put('/api/preferences',auth,asyncRoute(async(req,res)=>{const theme=['light','dark'].includes(req.body.theme)?req.body.theme:'light',language=['en','hi'].includes(req.body.language)?req.body.language:'en';const r=await pool.query('INSERT INTO user_preferences(user_id,theme,language) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET theme=EXCLUDED.theme,language=EXCLUDED.language,updated_at=NOW() RETURNING theme,language',[req.user.id,theme,language]);res.json(r.rows[0]);}));
app.get('/api/feedback',auth,asyncRoute(async(req,res)=>{const r=await pool.query('SELECT message_id,type FROM feedback WHERE user_id=$1',[req.user.id]);res.json(r.rows);}));
app.put('/api/feedback/:messageId',auth,asyncRoute(async(req,res)=>{const type=req.body.type;if(!['like','dislike'].includes(type))return res.status(400).json({error:'Invalid feedback type'});const existing=await pool.query('SELECT id,type FROM feedback WHERE user_id=$1 AND message_id=$2',[req.user.id,req.params.messageId]);if(existing.rowCount&&existing.rows[0].type===type){await pool.query('DELETE FROM feedback WHERE id=$1',[existing.rows[0].id]);return res.json({removed:true});}const r=await pool.query('INSERT INTO feedback(user_id,message_id,type) VALUES($1,$2,$3) ON CONFLICT(message_id,user_id) DO UPDATE SET type=EXCLUDED.type RETURNING message_id,type',[req.user.id,req.params.messageId,type]);res.json(r.rows[0]);}));
app.use((err,_req,res,_next)=>{console.error(err);if(err instanceof multer.MulterError)return res.status(400).json({error:err.message});res.status(500).json({error:err.message||'Unexpected server error.'});});
app.listen(PORT,'0.0.0.0',()=>console.log(`AluuAI API listening on ${PORT}`));
