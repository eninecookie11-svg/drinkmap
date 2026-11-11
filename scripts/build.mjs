import fs from 'node:fs';
import {checkPublicSafety} from './lib/public-safety.mjs';
import '../tests/check.mjs';
import '../tests/search.mjs';
import '../tests/food-api.mjs';
import '../tests/sweetener-order.mjs';
import '../tests/catalog-data.mjs';
checkPublicSafety();
fs.mkdirSync('dist',{recursive:true});fs.cpSync('public','dist',{recursive:true});checkPublicSafety('dist');console.log('Cloudflare Pages 파일 준비 완료: dist');
