import {CARDS} from './cards.js?v=20261017-art1';
import {CHARACTER_FRAMES} from './character-frames.js?v=20261017-art1';
export {CHARACTER_FRAMES};
const names={sword:'斩仙堂剑修',thunder:'惊雷府雷修',clone:'百身门分身修',boss:'审批官'};
export function characterArt(id,pose='idle'){
 const art=CHARACTER_FRAMES[id];if(!art)return '';
 const index={idle:0,cast:1,attack:2}[pose]??0,frame=art.frames[index]||art.frames[0],clipId=`art-${id}-${pose}`;
 return `<svg class="character-sprite pose-${pose}" data-pose="${pose}" viewBox="${frame.box.join(' ')}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${names[id]}" focusable="false">${frame.clip?`<defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><polygon points="${frame.clip}"/></clipPath></defs>`:''}<image ${frame.clip?`clip-path="url(#${clipId})"`:''} href="assets/characters/${id}.webp" width="${art.size[0]}" height="${art.size[1]}"/></svg>`;
}
export function poseForAction(action){return action.type==='PLAY_CARD'?(CARDS[action.cardId]?.type==='attack'?'attack':'cast'):'idle';}
export function createPosePlayer({setPose,render,schedule=setTimeout,cancel=clearTimeout}){
 let timer=null;
 const reset=()=>{if(timer!==null)cancel(timer);timer=null;setPose('idle');};
 return {reset,play(pose){reset();setPose(pose);if(pose!=='idle')timer=schedule(()=>{timer=null;setPose('idle');render();},600);}};
}
