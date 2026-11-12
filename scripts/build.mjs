import fs from 'node:fs';
import {checkPublicSafety} from './lib/public-safety.mjs';
import '../tests/check.mjs';
import '../tests/search.mjs';
import '../tests/food-api.mjs';
import '../tests/sweetener-order.mjs';
import '../tests/catalog-data.mjs';
checkPublicSafety();
// Cloudflare path rules must start with a path, without a UTF-8 BOM.
for(const name of ['_headers','_redirects']){
  const path=`public/${name}`;
  if(fs.existsSync(path))fs.writeFileSync(path,fs.readFileSync(path,'utf8').replace(/^\uFEFF/,''));
}
fs.mkdirSync('dist',{recursive:true});fs.cpSync('public','dist',{recursive:true});checkPublicSafety('dist');console.log('Cloudflare Pages 파일 준비 완료: dist');
