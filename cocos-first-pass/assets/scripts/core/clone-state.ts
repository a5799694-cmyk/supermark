/** Rule states contain only JSON-compatible records, arrays and scalar values. */
export function cloneState<T>(value:T):T {return JSON.parse(JSON.stringify(value));}
