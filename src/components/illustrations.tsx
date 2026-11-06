import { MapPin,Check } from "lucide-react";

// Ilustrasi dekoratif halaman depan. Dibuat sendiri (SVG + HTML/CSS) dengan palet aplikasi, bukan gambar dari luar.
// Semuanya aria-hidden: isinya hanya hiasan, percakapan di ponsel hanyalah contoh rekaan.

const sparkle=(x:number,y:number,r=11)=>`M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z`;

// Ponsel berisi percakapan WhatsApp rekaan di kiri; kartu kecil (wilayah, tarif, status) di kanan; tumpukan buku sebagai hiasan.
export function HeroArt(){
  return <div className="hero-art" aria-hidden="true">
    <svg className="hero-art-bg" viewBox="0 0 460 460" focusable="false">
      <circle cx="230" cy="240" r="205" fill="#fed7aa" opacity=".55"/>
      <circle cx="410" cy="66" r="36" fill="#fde68a" opacity=".85"/>
      <circle cx="38" cy="420" r="28" fill="#fdba74" opacity=".6"/>
      <path d={sparkle(436,230)} fill="#f59e0b"/><path d={sparkle(300,26,9)} fill="#c2410c" opacity=".6"/><path d={sparkle(22,60,8)} fill="#f59e0b" opacity=".8"/>
      <g>{/* tumpukan buku */}
        <rect x="318" y="404" width="118" height="30" rx="6" fill="#c2410c"/><rect x="328" y="414" width="96" height="4" rx="2" fill="#fed7aa"/>
        <rect x="330" y="376" width="100" height="28" rx="6" fill="#15803d"/><rect x="340" y="386" width="78" height="4" rx="2" fill="#dcfce7"/>
        <rect x="340" y="350" width="84" height="26" rx="6" fill="#f59e0b"/><rect x="350" y="360" width="60" height="4" rx="2" fill="#fef3c7"/>
      </g>
    </svg>
    <div className="phone">
      <div className="phone-bar"><span className="phone-av">B</span><span><b>Bu Maya</b><small>Guru les</small></span></div>
      <div className="phone-chat">
        <div className="bub in">Halo Bu, masih ada tempat untuk calistung anak kelas 1?</div>
        <div className="bub out">Halo! Masih ada ya. Rumahnya di mana?</div>
        <div className="bub in">Di Bekasi Selatan, Bu.</div>
        <div className="bub out">Pas sekali, saya bisa datang ke sana. Kita atur jadwalnya ya.</div>
      </div>
      <div className="phone-input"><span/><i/></div>
    </div>
    <div className="chip" style={{left:"62%",top:"9%"}}><MapPin size={15} color="#c2410c"/>Bekasi Selatan</div>
    <div className="chip" style={{left:"62%",top:"33%"}}><b style={{color:"#9a3412"}}>Rp 60.000</b><span className="muted" style={{fontWeight:600}}>/ pertemuan</span></div>
    <div className="chip" style={{left:"62%",top:"55%",background:"#dcfce7",color:"#14532d"}}><Check size={15}/>Menerima murid baru</div>
  </div>;
}

// Tiga gambar kecil untuk langkah "Cara kerjanya": mengisi profil, dicek tim, dihubungi orang tua.
export function StepArt({step}:{step:1|2|3}){
  return <div className="step-art" aria-hidden="true"><svg viewBox="0 0 200 120" focusable="false">
    {step===1&&<>
      <rect x="40" y="12" width="120" height="96" rx="12" fill="#fff" stroke="#e0cdb9"/>
      <circle cx="66" cy="38" r="12" fill="#fdba74"/><rect x="86" y="30" width="58" height="7" rx="3.5" fill="#44403c"/><rect x="86" y="43" width="38" height="5" rx="2.5" fill="#d6c9bb"/>
      <rect x="52" y="64" width="32" height="14" rx="7" fill="#ffedd5"/><rect x="90" y="64" width="32" height="14" rx="7" fill="#dbeafe"/>
      <rect x="52" y="88" width="56" height="10" rx="5" fill="#c2410c"/>
      <g transform="translate(152 84) rotate(38)"><rect x="-5" y="-30" width="10" height="38" rx="2" fill="#fbbf24"/><rect x="-5" y="-37" width="10" height="8" rx="2" fill="#f472b6"/><polygon points="-5,8 5,8 0,18" fill="#fde7c7"/><polygon points="-2,14 2,14 0,18" fill="#292524"/></g>
    </>}
    {step===2&&<>
      <rect x="40" y="12" width="104" height="96" rx="12" fill="#fff" stroke="#e0cdb9"/>
      <rect x="54" y="30" width="60" height="7" rx="3.5" fill="#44403c"/><rect x="54" y="46" width="76" height="5" rx="2.5" fill="#d6c9bb"/><rect x="54" y="58" width="68" height="5" rx="2.5" fill="#d6c9bb"/><rect x="54" y="70" width="48" height="5" rx="2.5" fill="#d6c9bb"/>
      <circle cx="138" cy="82" r="28" fill="#15803d"/><circle cx="138" cy="82" r="28" fill="none" stroke="#dcfce7" strokeWidth="3" opacity=".6"/>
      <path d="M125 82 L135 92 L152 71" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>}
    {step===3&&<>
      <rect x="58" y="8" width="58" height="104" rx="12" fill="#fff" stroke="#292524" strokeWidth="4"/><rect x="76" y="15" width="22" height="3" rx="1.5" fill="#d6c9bb"/>
      <rect x="66" y="28" width="32" height="14" rx="7" fill="#f5f0ea"/><rect x="78" y="48" width="30" height="14" rx="7" fill="#15803d"/><rect x="66" y="68" width="24" height="14" rx="7" fill="#f5f0ea"/><rect x="78" y="88" width="30" height="14" rx="7" fill="#15803d"/>
      <rect x="112" y="22" width="68" height="36" rx="12" fill="#15803d"/><polygon points="122,58 134,58 120,72" fill="#15803d"/>
      <rect x="122" y="32" width="48" height="5" rx="2.5" fill="#fff"/><rect x="122" y="43" width="32" height="5" rx="2.5" fill="#fff" opacity=".8"/>
      <path d={sparkle(168,92,9)} fill="#f59e0b"/><path d={sparkle(30,30,7)} fill="#c2410c" opacity=".6"/>
    </>}
  </svg></div>;
}
