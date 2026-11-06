import { Brand } from "@/components/ui";
import { GuardianView } from "@/components/guardian-view";
export const metadata={title:"Ringkasan bimbel",robots:{index:false,follow:false}};
export default function Guardian(){return <><header className="public-header"><Brand/></header><main id="main" className="public-main" style={{maxWidth:960}}><GuardianView/></main></>;}
