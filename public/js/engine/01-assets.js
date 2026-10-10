"use strict";
// Image files the scene loads (cover art sheet and wood grain).

// Image helper from the original page: lets images from ThreeUI storage be used as WebGL textures.
function __threeuiStorageImage(...args){const image=new Image(...args);const property=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src");Object.defineProperty(image,"src",{configurable:true,get(){return property.get.call(this)},set(value){try{const url=new URL(value,document.baseURI);if(this.crossOrigin===null&&(url.href.startsWith("https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/")||url.origin===new URL(document.baseURI).origin))this.crossOrigin="anonymous"}catch{}property.set.call(this,value)}});return image;}

const COVER_ATLAS_DATA = "assets/cover-art.webp";
const WOOD_TEXTURE_DATA = "assets/wood.webp";

// Seven 2:3 cover artworks arranged left to right in assets/cover-art.webp.
const COVER_CROPS = [
  [0, 0, 512, 768],
  [512, 0, 512, 768],
  [1024, 0, 512, 768],
  [1536, 0, 512, 768],
  [2048, 0, 512, 768],
  [2560, 0, 512, 768],
  [3072, 0, 512, 768]
];
const coverAtlasImage = new __threeuiStorageImage();
coverAtlasImage.decoding = "async";
coverAtlasImage.src = COVER_ATLAS_DATA;
let coverAtlasReady = false;
const woodTextureImage = new __threeuiStorageImage();
woodTextureImage.decoding = "async";
woodTextureImage.src = WOOD_TEXTURE_DATA;
let woodTextureReady = false;
