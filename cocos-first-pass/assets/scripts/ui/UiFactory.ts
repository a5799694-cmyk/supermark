import {Node,UITransform,Graphics,Color,Label,Button,ScrollView,MaskComponent,Layers,HorizontalTextAlignment,VerticalTextAlignment} from 'cc';

export interface Rect {x:number;y:number;width:number;height:number}
export const palette={background:new Color(9,22,26),panel:new Color(24,43,47),selected:new Color(54,76,64),border:new Color(142,127,84),text:new Color(235,226,201),muted:new Color(172,189,184),disabled:new Color(37,43,44)};
export function node(parent:Node,name:string,r:Rect):Node {
 const n=new Node(name);n.layer=Layers.Enum.UI_2D;n.setParent(parent);
 n.addComponent(UITransform).setContentSize(r.width,r.height);n.setPosition(r.x,r.y,0);return n;
}
export function box(parent:Node,name:string,r:Rect,color=palette.panel):Node {
 const n=node(parent,name,r),g=n.addComponent(Graphics);g.fillColor=color;g.strokeColor=palette.border;g.lineWidth=1;
 g.roundRect(-r.width/2,-r.height/2,r.width,r.height,10);g.fill();g.stroke();return n;
}
export function label(parent:Node,name:string,text:string,r:Rect,size=16,color=palette.text):Node {
 const n=node(parent,name,r),l=n.addComponent(Label);l.string=text;l.fontSize=size;l.lineHeight=size+6;l.fontFamily='Microsoft YaHei';
 l.color=color;l.horizontalAlign=HorizontalTextAlignment.CENTER;l.verticalAlign=VerticalTextAlignment.CENTER;l.enableWrapText=true;l.overflow=Label.Overflow.SHRINK;return n;
}
export function button(parent:Node,name:string,text:string,r:Rect,onClick:()=>void,enabled=true,selected=false,size=16):Node {
 const n=box(parent,name,r,!enabled?palette.disabled:selected?palette.selected:palette.panel),b=n.addComponent(Button);
 b.transition=Button.Transition.NONE;b.interactable=enabled;b.target=n;
 label(n,'Text',text,{x:0,y:0,width:r.width-18,height:r.height-12},size,enabled?palette.text:palette.muted);
 n.on(Button.EventType.CLICK,()=>{if(b.interactable)onClick();});return n;
}
export function clear(parent:Node){for(const child of [...parent.children]){child.removeFromParent();child.destroy();}}
export function scroll(parent:Node,name:string,r:Rect,contentWidth:number,contentHeight:number,horizontal:boolean):Node {
 const host=node(parent,name,r),viewNode=node(host,'view',{x:0,y:0,width:r.width,height:r.height});
 viewNode.addComponent(MaskComponent).type=MaskComponent.Type.GRAPHICS_RECT;
 const content=node(viewNode,'content',{x:-r.width/2,y:r.height/2,width:Math.max(r.width,contentWidth),height:Math.max(r.height,contentHeight)});
 content.getComponent(UITransform).setAnchorPoint(0,1);
 const sv=host.addComponent(ScrollView);sv.content=content;sv.horizontal=horizontal;sv.vertical=!horizontal;sv.inertia=true;sv.elastic=false;sv.cancelInnerEvents=true;
 return content;
}
