import { StepArt,type StepKind } from "./illustrations";

// Potongan halaman depan yang dipakai bersama oleh halaman orang tua (/) dan halaman guru (/untuk-guru).

export function Steps({items}:{items:{kind:StepKind;title:string;body:string}[]}){
  return <div className="steps">{items.map((item,index)=><article key={item.title} className="card step"><StepArt kind={item.kind}/><div className="step-head"><span className="step-num" aria-hidden="true">{index+1}</span><h3>{item.title}</h3></div><p className="muted" style={{fontSize:".95rem"}}>{item.body}</p></article>)}</div>;
}

// Tanya jawab memakai elemen <details> bawaan browser: bisa dibuka dengan keyboard dan tanpa skrip.
export function Faq({items}:{items:{q:string;a:string}[]}){
  return <div className="faq">{items.map(item=><details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>;
}

export function TrustStrip({items}:{items:{icon:React.ComponentType<{size?:number;"aria-hidden"?:boolean|"true"}>;text:string}[]}){
  return <ul className="trust" style={{listStyle:"none",padding:0,margin:0}}>{items.map(item=><li key={item.text} className="trust-item"><span className="stat-icon" style={{flex:"0 0 38px"}}><item.icon size={19} aria-hidden="true"/></span>{item.text}</li>)}</ul>;
}
