"use client";

import { createContext, useContext, useRef } from "react"
import Heylock from "heylock";

const Context = createContext();

export default function HeylockProvider({ children, agentKey }){
    //#region Validate properties
    if(!agentKey){
        throw new Error("HeylockProvider requires an agentKey prop");
    }
    //#endregion
   
    //#region Agent initialization
    let agentRef = null;

    try{
        agentRef = useRef(new Heylock(agentKey, { suppressWarnings: true }));
    } catch(error){ 
        console.error("Failed to initialize Heylock agent:", error);
        throw new Error("HeylockProvider failed to initialize the agent.");
    }
    //#endregion

    return <Context.Provider value={agentRef.current} >
        { children }
    </Context.Provider>
}

//#region Hooks
export function useAgent(){
    const agent = useContext(Context);

    if(typeof agent === 'undefined'){
        throw new Error("useAgent must be used within a HeylockProvider");
    }

    return agent;
}
//#endregion