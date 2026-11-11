import fs from 'node:fs';
import '../tests/check.mjs';
import '../tests/search.mjs';
fs.mkdirSync('dist',{recursive:true});fs.cpSync('public','dist',{recursive:true});console.log('Cloudflare Pages 파일 준비 완료: dist');
