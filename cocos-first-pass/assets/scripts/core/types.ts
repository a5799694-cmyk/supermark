export interface CardInstance {uid:string;cardId:string;upgraded:boolean}
export interface CardDefinition {
 id:string;name:string;cost:number;type:'attack'|'skill';damage?:number;shield?:number;draw?:number;rage?:number;
 clones?:number;exile?:boolean;hits?:number;route?:string;sect?:string;ultimate?:boolean;
 targetMode?:'single'|'all'|'none';rageCost?:number;cloneCost?:number;cloneMin?:number;hpCost?:number;energyGain?:number;
 upgraded?:Record<string,number>;
}
export interface EnemyDefinition {id:string;name:string;hp:number;start?:number;actions:{type:string;value:number;hits?:number}[]}
export interface SectDefinition {id:string;name:string;motto:string;style:string;passive:string;starter:string[];core:string;ultimate:string;synergy:string[]}
export interface EnemyState {id:string;type:string;name:string;hp:number;shield:number;actionIndex:number}
export interface BattleEffects {nextAttackCloneBonus:number;nextAttackBonus:number;nextAttackDiscount:number;shieldRage:boolean;counterRage:boolean}
export interface BattleState {
 sectId:string;attacksPlayed:number;thunderTriggered:boolean;hp:number;maxHp:number;energy:number;shield:number;rage:number;clones:number;
 hand:CardInstance[];draw:CardInstance[];discard:CardInstance[];exile:CardInstance[];enemies:EnemyState[];
 turn:number;seed:number;status:'playing'|'won'|'lost';effects:BattleEffects;log:string[];
}
export interface CardPreview {
 cost:number;canPlay:boolean;reason:string;targetMode:'single'|'all'|'none';
 damage?:number;hits?:number;bonus?:number;shield?:number;hpCost?:number;draw?:number;energyGain?:number;
}
