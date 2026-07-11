"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";


export function SmoothScroll({
children
}:{
children:ReactNode
}){


useEffect(()=>{

const lenis = new Lenis({
duration:1.2,
smoothWheel:true,
});


function raf(time:number){

lenis.raf(time);

requestAnimationFrame(raf);

}


requestAnimationFrame(raf);


return ()=>{

lenis.destroy();

};


},[]);



return <>{children}</>;

}