import fs from 'node:fs';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
const pdf=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync('docs/kca-2024.pdf')),useSystemFonts:true}).promise;
for(let n=1;n<=pdf.numPages;n++){let p=await pdf.getPage(n);let t=await p.getTextContent();console.log('\nPAGE',n,t.items.map(x=>x.str).join(' '));let v=p.getViewport({scale:1.5});let c=createCanvas(v.width,v.height);await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;fs.writeFileSync(`docs/kca-page-${n}.png`,c.toBuffer('image/png'));}
