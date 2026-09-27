// Rebuild with sharp and opentype.js installed: node scripts/build-og-cards.cjs
// Font files are the same Google Fonts families and 700 weights used on the sites.
const sharp=require('sharp'),opentype=require('opentype.js'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,p);
const embedded=p=>'data:image/'+(p.endsWith('.png')?'png':'jpeg')+';base64,'+fs.readFileSync(asset(p)).toString('base64');
async function lettering(text,family,file,size,color,spacing=0){
 const bytes=fs.readFileSync(asset('scripts/og-fonts/'+file));
 const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 if(font.names.windows.fontFamily.en!==family)throw Error('Wrong font family');
 const outline=new opentype.Path();let x=0,previous=null;
 for(const character of text){const glyph=font.charToGlyph(character);if(previous)x+=font.getKerningValue(previous,glyph)*size/font.unitsPerEm;outline.extend(glyph.getPath(x,0,size));x+=glyph.advanceWidth*size/font.unitsPerEm+spacing/1024;previous=glyph;}
 const box=outline.getBoundingBox();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(box.x2-box.x1)+2}" height="${Math.ceil(box.y2-box.y1)+2}" viewBox="${box.x1-1} ${box.y1-1} ${Math.ceil(box.x2-box.x1)+2} ${Math.ceil(box.y2-box.y1)+2}"><path fill="${color}" d="${outline.toPathData(3)}"/></svg>`;
 return sharp(Buffer.from(svg)).png().toBuffer();
}
(async()=>{
 const portfolio=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f4f0e7"/><g transform="translate(758 80) rotate(5 170 235)"><rect x="4" y="7" width="342" height="470" fill="#292a28" opacity=".08"/><rect width="342" height="470" fill="#fffdf7"/><image href="${embedded('dist/megan-quigley.png')}" x="17" y="18" width="308" height="382" preserveAspectRatio="xMidYMid slice"/><rect x="114" y="-12" width="118" height="33" fill="#d3b47b" opacity=".52" transform="rotate(-12 173 5)"/></g></svg>`);
 const layers=[];
 for(const [text,top]of [['Megan',205],['Quigley',325]])layers.push({input:await lettering(text,'Space Mono','SpaceMono-Bold.ttf',103,'#292a28'),left:65,top});
 await sharp(portfolio).composite(layers).png().toFile(asset('dist/assets/portfolio-og-minimal.png'));
 const wic=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f8f6f0"/><image href="${embedded('dist/case-studies/wic/art/home-hero.jpg')}" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/></svg>`);
 const wicLayers=[];
 for(const [text,top]of [['The work',169],['of getting',265],['help',361]])wicLayers.push({input:await lettering(text,'Manrope','Manrope-Bold.ttf',82,'#293833',-4900),left:125,top});
 await sharp(wic).composite(wicLayers).png().toFile(asset('dist/assets/wic-og-minimal.png'));
 console.log('Rendered 1200×630 cards using Space Mono Bold and Manrope Bold font files.');
})();
