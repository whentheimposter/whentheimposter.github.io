var PixelRendr;(function(PixelRendr_1){"use strict";var Render=(function(){function Render(source,filter){this.source=source;this.filter=filter;this.sprites={};this.containers=[];}
return Render;})();PixelRendr_1.Render=Render;var SpriteMultiple=(function(){function SpriteMultiple(sprites,render){var sources=render.source[2];this.sprites=sprites;this.direction=render.source[1];if(this.direction==="vertical"||this.direction==="corners"){this.topheight=sources.topheight|0;this.bottomheight=sources.bottomheight|0;}
if(this.direction==="horizontal"||this.direction==="corners"){this.rightwidth=sources.rightwidth|0;this.leftwidth=sources.leftwidth|0;}
this.middleStretch=sources.middleStretch||false;}
return SpriteMultiple;})();PixelRendr_1.SpriteMultiple=SpriteMultiple;var PixelRendr=(function(){function PixelRendr(settings){if(!settings){throw new Error("No settings given to PixelRendr.");}
if(!settings.paletteDefault){throw new Error("No paletteDefault given to PixelRendr.");}
this.paletteDefault=settings.paletteDefault;this.digitsizeDefault=this.getDigitSizeFromArray(this.paletteDefault);this.digitsplit=new RegExp(".{1,"+this.digitsizeDefault+"}","g");this.library={"raws":settings.library||{}};this.filters=settings.filters||{};this.scale=settings.scale||1;this.flipVert=settings.flipVert||"flip-vert";this.flipHoriz=settings.flipHoriz||"flip-horiz";this.spriteWidth=settings.spriteWidth||"spriteWidth";this.spriteHeight=settings.spriteHeight||"spriteHeight";this.Uint8ClampedArray=(settings.Uint8ClampedArray||window.Uint8ClampedArray||window.Uint8Array);this.ProcessorBase=new ChangeLinr.ChangeLinr({"transforms":{"spriteUnravel":this.spriteUnravel.bind(this),"spriteApplyFilter":this.spriteApplyFilter.bind(this),"spriteExpand":this.spriteExpand.bind(this),"spriteGetArray":this.spriteGetArray.bind(this)},"pipeline":["spriteUnravel","spriteApplyFilter","spriteExpand","spriteGetArray"]});this.ProcessorDims=new ChangeLinr.ChangeLinr({"transforms":{"spriteRepeatRows":this.spriteRepeatRows.bind(this),"spriteFlipDimensions":this.spriteFlipDimensions.bind(this)},"pipeline":["spriteRepeatRows","spriteFlipDimensions"]});this.ProcessorEncode=new ChangeLinr.ChangeLinr({"transforms":{"imageGetData":this.imageGetData.bind(this),"imageGetPixels":this.imageGetPixels.bind(this),"imageMapPalette":this.imageMapPalette.bind(this),"imageCombinePixels":this.imageCombinePixels.bind(this)},"pipeline":["imageGetData","imageGetPixels","imageMapPalette","imageCombinePixels"],"doUseCache":false});this.library.sprites=this.libraryParse(this.library.raws);this.BaseFiler=new StringFilr.StringFilr({"library":this.library.sprites,"normal":"normal"});this.commandGenerators={"multiple":this.generateSpriteCommandMultipleFromRender.bind(this),"same":this.generateSpriteCommandSameFromRender.bind(this),"filter":this.generateSpriteCommandFilterFromRender.bind(this)};}
PixelRendr.prototype.getBaseLibrary=function(){return this.BaseFiler.getLibrary();};PixelRendr.prototype.getBaseFiler=function(){return this.BaseFiler;};PixelRendr.prototype.getProcessorBase=function(){return this.ProcessorBase;};PixelRendr.prototype.getProcessorDims=function(){return this.ProcessorDims;};PixelRendr.prototype.getProcessorEncode=function(){return this.ProcessorEncode;};PixelRendr.prototype.getSpriteBase=function(key){return this.BaseFiler.get(key);};PixelRendr.prototype.decode=function(key,attributes){var render=this.BaseFiler.get(key),sprite;if(!render){throw new Error("No sprite found for "+key+".");}
if(!render.sprites.hasOwnProperty(key)){this.generateRenderSprite(render,key,attributes);}
sprite=render.sprites[key];if(!sprite||(sprite.constructor===this.Uint8ClampedArray&&sprite.length===0)){throw new Error("Could not generate sprite for "+key+".");}
return sprite;};PixelRendr.prototype.encode=function(image,callback,source){var result=this.ProcessorEncode.process(image);if(callback){callback(result,image,source);}
return result;};PixelRendr.prototype.encodeUri=function(uri,callback){var image=document.createElement("img");image.onload=this.encode.bind(this,image,callback);image.src=uri;};PixelRendr.prototype.generatePaletteFromRawData=function(data,forceZeroColor,giveArrays){if(forceZeroColor===void 0){forceZeroColor=false;}
if(giveArrays===void 0){giveArrays=false;}
var tree={},colorsGeneral=[],colorsGrayscale=[],output,i;for(i=0;i<data.length;i+=4){if(data[i+3]===0){forceZeroColor=true;continue;}
if(tree[data[i]]&&tree[data[i]][data[i+1]]&&tree[data[i]][data[i+1]][data[i+2]]&&tree[data[i]][data[i+1]][data[i+2]][data[i+3]]){continue;}
if(!tree[data[i]]){tree[data[i]]={};}
if(!tree[data[i]][data[i+1]]){tree[data[i]][data[i+1]]={};}
if(!tree[data[i]][data[i+1]][data[i+2]]){tree[data[i]][data[i+1]][data[i+2]]={};}
if(!tree[data[i]][data[i+1]][data[i+2]][data[i+3]]){tree[data[i]][data[i+1]][data[i+2]][data[i+3]]=true;if(data[i]===data[i+1]&&data[i+1]===data[i+2]){colorsGrayscale.push(data.subarray(i,i+4));}
else{colorsGeneral.push(data.subarray(i,i+4));}}}
colorsGrayscale.sort(function(a,b){return a[0]-b[0];});colorsGeneral.sort(function(a,b){for(i=0;i<4;i+=1){if(a[i]!==b[i]){return b[i]-a[i];}}});if(forceZeroColor){output=[new this.Uint8ClampedArray([0,0,0,0])].concat(colorsGrayscale).concat(colorsGeneral);}
else{output=colorsGrayscale.concat(colorsGeneral);}
if(!giveArrays){return output;}
for(i=0;i<output.length;i+=1){output[i]=Array.prototype.slice.call(output[i]);}
return output;};PixelRendr.prototype.memcpyU8=function(source,destination,readloc,writeloc,writelength){if(readloc===void 0){readloc=0;}
if(writeloc===void 0){writeloc=0;}
if(writelength===void 0){writelength=Math.max(0,Math.min(source.length,destination.length));}
var lwritelength=writelength+0,lwriteloc=writeloc+0,lreadloc=readloc+0;while(lwritelength--){destination[lwriteloc++]=source[lreadloc++];}};PixelRendr.prototype.libraryParse=function(reference){var setNew={},source,i;for(i in reference){if(!reference.hasOwnProperty(i)){continue;}
source=reference[i];switch(source.constructor){case String:setNew[i]=new Render(source);break;case Array:setNew[i]=new Render(source,source[1]);break;default:setNew[i]=this.libraryParse(source);break;}
if(setNew[i].constructor===Render){setNew[i].containers.push({"container":setNew,"key":i});}}
return setNew;};PixelRendr.prototype.generateRenderSprite=function(render,key,attributes){var sprite;if(render.source.constructor===String){sprite=this.generateSpriteSingleFromRender(render,key,attributes);}
else{sprite=this.commandGenerators[render.source[0]](render,key,attributes);}
render.sprites[key]=sprite;};PixelRendr.prototype.generateSpriteSingleFromRender=function(render,key,attributes){var base=this.ProcessorBase.process(render.source,key,render.filter),sprite=this.ProcessorDims.process(base,key,attributes);return sprite;};PixelRendr.prototype.generateSpriteCommandMultipleFromRender=function(render,key,attributes){var sources=render.source[2],sprites={},sprite,path,output=new SpriteMultiple(sprites,render),i;for(i in sources){if(sources.hasOwnProperty(i)){path=key+" "+i;sprite=this.ProcessorBase.process(sources[i],path,render.filter);sprites[i]=this.ProcessorDims.process(sprite,path,attributes);}}
return output;};PixelRendr.prototype.generateSpriteCommandSameFromRender=function(render,key,attributes){var replacement=this.followPath(this.library.sprites,render.source[1],0);this.replaceRenderInContainers(render,replacement);this.BaseFiler.clearCached(key);return this.decode(key,attributes);};PixelRendr.prototype.generateSpriteCommandFilterFromRender=function(render,key,attributes){var filter=this.filters[render.source[2]],found=this.followPath(this.library.sprites,render.source[1],0),filtered;if(!filter){console.warn("Invalid filter provided: "+render.source[2]);}
if(found.constructor===Render){filtered=new Render(found.source,{"filter":filter});this.generateRenderSprite(filtered,key,attributes);}
else{filtered=this.generateRendersFromFilter(found,filter);}
this.replaceRenderInContainers(render,filtered);if(filtered.constructor===Render){return filtered.sprites[key];}
else{this.BaseFiler.clearCached(key);return this.decode(key,attributes);}};PixelRendr.prototype.generateRendersFromFilter=function(directory,filter){var output={},child,i;for(i in directory){if(!directory.hasOwnProperty(i)){continue;}
child=directory[i];if(child.constructor===Render){output[i]=new Render(child.source,{"filter":filter});}
else{output[i]=this.generateRendersFromFilter(child,filter);}}
return output;};PixelRendr.prototype.replaceRenderInContainers=function(render,replacement){var listing,i;for(i=0;i<render.containers.length;i+=1){listing=render.containers[i];listing.container[listing.key]=replacement;if(replacement.constructor===Render){replacement.containers.push(listing);}}};PixelRendr.prototype.spriteUnravel=function(colors){var paletteref=this.getPaletteReferenceStarting(this.paletteDefault),digitsize=this.digitsizeDefault,clength=colors.length,current,rep,nixloc,output="",loc=0;while(loc<clength){switch(colors[loc]){case "x":nixloc=colors.indexOf(",",++loc);current=this.makeDigit(paletteref[colors.slice(loc,loc+=digitsize)],this.digitsizeDefault);rep=Number(colors.slice(loc,nixloc));while(rep--){output+=current;}
loc=nixloc+1;break;case "p":if(colors[++loc]==="["){nixloc=colors.indexOf("]");paletteref=this.getPaletteReference(colors.slice(loc+1,nixloc).split(","));loc=nixloc+1;digitsize=this.getDigitSizeFromObject(paletteref);}
else{paletteref=this.getPaletteReference(this.paletteDefault);digitsize=this.digitsizeDefault;}
break;default:output+=this.makeDigit(paletteref[colors.slice(loc,loc+=digitsize)],this.digitsizeDefault);break;}}
return output;};PixelRendr.prototype.spriteExpand=function(colors){var output="",clength=colors.length,i=0,j,current;while(i<clength){current=colors.slice(i,i+=this.digitsizeDefault);for(j=0;j<this.scale;++j){output+=current;}}
return output;};PixelRendr.prototype.spriteApplyFilter=function(colors,key,attributes){if(!attributes||!attributes.filter){return colors;}
var filter=attributes.filter,filterName=filter[0];if(!filterName){return colors;}
switch(filterName){case "palette":var split=colors.match(this.digitsplit),i;for(i in filter[1]){if(filter[1].hasOwnProperty(i)){this.arrayReplace(split,i,filter[1][i]);}}
return split.join("");default:console.warn("Unknown filter: '"+filterName+"'.");}
return colors;};PixelRendr.prototype.spriteGetArray=function(colors){var clength=colors.length,numcolors=clength/this.digitsizeDefault,split=colors.match(this.digitsplit),olength=numcolors*4,output=new this.Uint8ClampedArray(olength),reference,i,j,k;for(i=0,j=0;i<numcolors;++i){reference=this.paletteDefault[Number(split[i])];for(k=0;k<4;++k){output[j+k]=reference[k];}
j+=4;}
return output;};PixelRendr.prototype.spriteRepeatRows=function(sprite,key,attributes){var parsed=new this.Uint8ClampedArray(sprite.length*this.scale),rowsize=attributes[this.spriteWidth]*4,height=attributes[this.spriteHeight]/this.scale,readloc=0,writeloc=0,i,j;for(i=0;i<height;++i){for(j=0;j<this.scale;++j){this.memcpyU8(sprite,parsed,readloc,writeloc,rowsize);writeloc+=rowsize;}
readloc+=rowsize;}
return parsed;};PixelRendr.prototype.spriteFlipDimensions=function(sprite,key,attributes){if(key.indexOf(this.flipHoriz)!==-1){if(key.indexOf(this.flipVert)!==-1){return this.flipSpriteArrayBoth(sprite);}
else{return this.flipSpriteArrayHoriz(sprite,attributes);}}
else if(key.indexOf(this.flipVert)!==-1){return this.flipSpriteArrayVert(sprite,attributes);}
return sprite;};PixelRendr.prototype.flipSpriteArrayHoriz=function(sprite,attributes){var length=sprite.length+0,width=attributes[this.spriteWidth]+0,newsprite=new this.Uint8ClampedArray(length),rowsize=width*4,newloc,oldloc,i,j,k;for(i=0;i<length;i+=rowsize){newloc=i;oldloc=i+rowsize-4;for(j=0;j<rowsize;j+=4){for(k=0;k<4;++k){newsprite[newloc+k]=sprite[oldloc+k];}
newloc+=4;oldloc-=4;}}
return newsprite;};PixelRendr.prototype.flipSpriteArrayVert=function(sprite,attributes){var length=sprite.length,width=attributes[this.spriteWidth]+0,newsprite=new this.Uint8ClampedArray(length),rowsize=width*4,newloc=0,oldloc=length-rowsize,i,j;while(newloc<length){for(i=0;i<rowsize;i+=4){for(j=0;j<4;++j){newsprite[newloc+i+j]=sprite[oldloc+i+j];}}
newloc+=rowsize;oldloc-=rowsize;}
return newsprite;};PixelRendr.prototype.flipSpriteArrayBoth=function(sprite){var length=sprite.length,newsprite=new this.Uint8ClampedArray(length),oldloc=sprite.length-4,newloc=0,i;while(newloc<length){for(i=0;i<4;++i){newsprite[newloc+i]=sprite[oldloc+i];}
newloc+=4;oldloc-=4;}
return newsprite;};PixelRendr.prototype.imageGetData=function(image){var canvas=document.createElement("canvas"),context=canvas.getContext("2d");canvas.width=image.width;canvas.height=image.height;context.drawImage(image,0,0);return context.getImageData(0,0,image.width,image.height).data;};PixelRendr.prototype.imageGetPixels=function(data){var pixels=new Array(data.length/4),occurences={},pixel,i,j;for(i=0,j=0;i<data.length;i+=4,j+=1){pixel=this.getClosestInPalette(this.paletteDefault,data.subarray(i,i+4));pixels[j]=pixel;if(occurences.hasOwnProperty(pixel)){occurences[pixel]+=1;}
else{occurences[pixel]=1;}}
return[pixels,occurences];};PixelRendr.prototype.imageMapPalette=function(information){var pixels=information[0],occurences=information[1],palette=Object.keys(occurences),digitsize=this.getDigitSizeFromArray(palette),paletteIndices=this.getValueIndices(palette),numbers=pixels.map(this.getKeyValue.bind(this,paletteIndices));return[palette,numbers,digitsize];};PixelRendr.prototype.imageCombinePixels=function(information){var palette=information[0],numbers=information[1],digitsize=information[2],threshold=Math.max(3,Math.round(4/digitsize)),output,current,digit,i=0,j;output="p["+palette.map(this.makeSizedDigit.bind(this,digitsize)).join(",")+"]";while(i<numbers.length){j=i+1;current=numbers[i];digit=this.makeDigit(current,digitsize);while(current===numbers[j]){j+=1;}
if(j-i>threshold){output+="x"+digit+String(j-i)+",";i=j;}
else{do{output+=digit;i+=1;}while(i<j);}}
return output;};PixelRendr.prototype.getDigitSizeFromArray=function(palette){var digitsize=0,i;for(i=palette.length;i>=1;i/=10){digitsize+=1;}
return digitsize;};PixelRendr.prototype.getDigitSizeFromObject=function(palette){var digitsize=0,i;for(i=Object.keys(palette).length;i>=1;i/=10){digitsize+=1;}
return digitsize;};PixelRendr.prototype.getPaletteReference=function(palette){var output={},digitsize=this.getDigitSizeFromArray(palette),i;for(i=0;i<palette.length;i+=1){output[this.makeDigit(i,digitsize)]=this.makeDigit(palette[i],digitsize);}
return output;};PixelRendr.prototype.getPaletteReferenceStarting=function(palette){var output={},i;for(i=0;i<palette.length;i+=1){output[this.makeDigit(i,this.digitsizeDefault)]=this.makeDigit(i,this.digitsizeDefault);}
return output;};PixelRendr.prototype.getClosestInPalette=function(palette,rgba){var bestDifference=Infinity,difference,bestIndex,i;for(i=palette.length-1;i>=0;i-=1){difference=this.arrayDifference(palette[i],rgba);if(difference<bestDifference){bestDifference=difference;bestIndex=i;}}
return bestIndex;};PixelRendr.prototype.stringOf=function(str,times){if(times===void 0){times=1;}
return(times===0)?"":new Array(1+(times||1)).join(str);};PixelRendr.prototype.makeDigit=function(num,size,prefix){if(prefix===void 0){prefix="0";}
return this.stringOf(prefix,Math.max(0,size-String(num).length))+num;};PixelRendr.prototype.makeSizedDigit=function(size,num){return this.makeDigit(num,size,"0");};PixelRendr.prototype.arrayReplace=function(array,removed,inserted){for(var i=array.length-1;i>=0;i-=1){if(array[i]===removed){array[i]=inserted;}}
return array;};PixelRendr.prototype.arrayDifference=function(a,b){var sum=0,i;for(i=a.length-1;i>=0;i-=1){sum+=Math.abs(a[i]-b[i])|0;}
return sum;};PixelRendr.prototype.getValueIndices=function(array){var output={},i;for(i=0;i<array.length;i+=1){output[array[i]]=i;}
return output;};PixelRendr.prototype.getKeyValue=function(object,key){return object[key];};PixelRendr.prototype.followPath=function(obj,path,num){if(num<path.length&&obj.hasOwnProperty(path[num])){return this.followPath(obj[path[num]],path,num+1);}
return obj;};return PixelRendr;})();PixelRendr_1.PixelRendr=PixelRendr;})(PixelRendr||(PixelRendr={}));