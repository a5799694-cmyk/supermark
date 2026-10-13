export const ENEMIES = Object.freeze({
  dummy: { id:'dummy', name:'考勤仙吏', hp:16, actions:[{type:'attack',value:5},{type:'shield',value:6},{type:'attack',value:7}] },
  'dummy-shield': { id:'dummy-shield', name:'考勤仙吏', hp:16, start:1, actions:[{type:'attack',value:5},{type:'shield',value:6},{type:'attack',value:7}] },
  boss: { id:'boss', name:'画饼天尊', hp:46, actions:[{type:'attack',value:6},{type:'shield',value:8},{type:'attack',value:12},{type:'multi',value:4,hits:2}] }
});
