// src/components/Layout.jsx — v3.3
// Adicionado badge de retiradas físicas pendentes no header.

import { useState } from "react";
import Icon, { icons } from "./Icon";
import { cargoLabel } from "../utils/helpers";

export const NAV = [
  { id: "dashboard",  label: "Dashboard",    icon: "dashboard"  },
  { id: "estoque",    label: "Estoque",       icon: "estoque"    },
  { id: "lotes",      label: "Lotes",         icon: "lotes"      },
  { id: "entradas",   label: "Entradas",      icon: "entradas"   },
  { id: "saidas",     label: "Saídas",        icon: "saidas"     },
  { id: "produtos",   label: "Produtos",      icon: "produtos"   },
  { id: "pedidos",    label: "Pedidos",       icon: "pedidos"    },
  { id: "financeiro", label: "Financeiro",    icon: "financeiro" },
  { id: "graficos",   label: "Gráficos",      icon: "barChart"   },
  { id: "alertas",    label: "Alertas",       icon: "alertas"    },
  { id: "config",     label: "Configurações", icon: "config"     },
];

export default function Layout({ children, active, setActive, user, onLogout, alertCount, retiradasPendentes = 0, t = {} }) {
  const [sideOpen, setSideOpen] = useState(true);

  const accent       = t.accent       || "#C9A84C";
  const accentDim    = t.accentDim    || "#C9A84C15";
  const accentBorder = t.accentBorder || "#C9A84C30";
  const accentGrad   = t.accentGrad   || "linear-gradient(135deg,#C9A84C,#9A7A2E)";
  const bgBody       = t.bgBody       || "#080808";
  const bgSidebar    = t.bgSidebar    || "#0A0A0A";
  const bgElevated   = t.bgElevated   || "#141414";
  const border       = t.border       || "#1E1E1E";

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:bgBody, fontFamily:"'DM Sans',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width:sideOpen?228:56, minWidth:sideOpen?228:56, background:bgSidebar, borderRight:`1px solid ${accentBorder}`, transition:"width 300ms cubic-bezier(0.4,0,0.2,1),min-width 300ms cubic-bezier(0.4,0,0.2,1)", display:"flex", flexDirection:"column", height:"100%", overflow:"hidden", position:"relative", zIndex:20, flexShrink:0 }}>
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${accent}55,transparent)`, flexShrink:0 }}/>

        {/* Logo */}
        <div style={{ height:56, display:"flex", alignItems:"center", padding:sideOpen?"0 14px":"0", justifyContent:sideOpen?"flex-start":"center", borderBottom:`1px solid ${accentBorder}`, flexShrink:0, overflow:"hidden", gap:10, transition:"padding 300ms cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ width:32, height:32, background:accentGrad, borderRadius:9, boxShadow:`0 0 0 1px ${accentBorder},0 4px 14px ${accentDim}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:t.accentText||"#080808" }}>B</span>
          </div>
          <div style={{ overflow:"hidden", whiteSpace:"nowrap", opacity:sideOpen?1:0, maxWidth:sideOpen?160:0, transition:"opacity 200ms ease,max-width 300ms cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-0.03em", color:"#E8E4DC", lineHeight:1 }}>Bart<span style={{ color:accent }}>ô</span></div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8.5, letterSpacing:"0.14em", color:"#3A3A3A", textTransform:"uppercase", marginTop:3 }}>Gestão de Estoque</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"8px 6px" }}>
          {NAV.map(({ id, label, icon }) => (
            <NavItem key={id} id={id} label={label} icon={icon}
              isActive={active===id}
              isAlerta={id==="alertas" && (alertCount > 0 || retiradasPendentes > 0)}
              alertCount={alertCount}
              retiradasPendentes={retiradasPendentes}
              sideOpen={sideOpen}
              onClick={()=>setActive(id)}
              accent={accent} accentDim={accentDim} accentBorder={accentBorder} bgElevated={bgElevated}
            />
          ))}
        </nav>

        {/* Logout */}
        <div style={{ borderTop:`1px solid ${accentBorder}`, padding:"6px 6px", flexShrink:0 }}>
          <LogoutBtn sideOpen={sideOpen} onLogout={onLogout} bgElevated={bgElevated} />
        </div>
      </aside>

      {/* Área principal */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <header style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px", height:52, background:bgSidebar, borderBottom:`1px solid ${border}`, position:"relative", flexShrink:0 }}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${accent}18,transparent)`, pointerEvents:"none" }}/>

          <button onClick={()=>setSideOpen(s=>!s)} style={{ width:32,height:32,borderRadius:7,border:`1px solid ${border}`,background:bgElevated,color:"#444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"color 0.15s,border-color 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=accent;e.currentTarget.style.borderColor=accentBorder;}}
            onMouseLeave={e=>{e.currentTarget.style.color="#444";e.currentTarget.style.borderColor=border;}}
          ><Icon d={icons.menu} size={15}/></button>

          <div style={{ flex:1 }}/>

          {/* Badge retiradas físicas — vermelho, pulsante, impossível de ignorar */}
          {retiradasPendentes > 0 && (
            <button onClick={()=>setActive("alertas")} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 11px", borderRadius:7, border:"1px solid #EF444440", background:"#EF444415", color:"#EF4444", cursor:"pointer", transition:"background 0.15s,border-color 0.15s", animation:"barto-pulse-red 2s infinite" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#EF444425";e.currentTarget.style.borderColor="#EF444460";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#EF444415";e.currentTarget.style.borderColor="#EF444440";}}
            >
              <Icon d={icons.alertas} size={13}/>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700 }}>{retiradasPendentes}</span>
              <span style={{ fontSize:11, color:"#EF444499" }}>retirada{retiradasPendentes!==1?"s":""} pendente{retiradasPendentes!==1?"s":""}</span>
            </button>
          )}

          {/* Badge alertas normais */}
          {alertCount > 0 && (
            <button onClick={()=>setActive("alertas")} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 11px", borderRadius:7, border:"1px solid #F9731628", background:"#F9731610", color:"#F97316", cursor:"pointer", transition:"background 0.15s,border-color 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#F9731620";e.currentTarget.style.borderColor="#F9731640";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#F9731610";e.currentTarget.style.borderColor="#F9731628";}}
            >
              <Icon d={icons.alertas} size={13}/>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600 }}>{alertCount}</span>
              <span style={{ fontSize:12, color:"#F97316AA" }}>alertas</span>
            </button>
          )}

          <div style={{ width:1,height:22,background:border }}/>

          {/* Perfil */}
          <div style={{ display:"flex",alignItems:"center",gap:9,padding:"5px 10px",borderRadius:8,border:"1px solid transparent",cursor:"pointer",transition:"background 0.15s,border-color 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background=bgElevated;e.currentTarget.style.borderColor=border;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}
          >
            <div style={{ width:28,height:28,borderRadius:7,background:accentGrad,fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600,color:t.accentText||"#080808",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 0 0 1px ${accentBorder}` }}>
              {user.nome.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:12.5,fontWeight:500,color:"#C8C4BC",lineHeight:1.2,whiteSpace:"nowrap" }}>{user.nome}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#3A3A3A",letterSpacing:"0.05em",marginTop:1 }}>{cargoLabel(user.cargo)}</div>
            </div>
          </div>
        </header>

        <main key={active} className="anim-fade-in" style={{ flex:1,overflowY:"auto",background:bgBody,padding:"22px 24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ id, label, icon, isActive, isAlerta, alertCount, retiradasPendentes, sideOpen, onClick, accent, accentDim, accentBorder, bgElevated }) {
  const [hover, setHover] = useState(false);
  const totalBadge = (alertCount || 0) + (retiradasPendentes || 0);
  const temRetirada = retiradasPendentes > 0;

  return (
    <button onClick={onClick} title={!sideOpen?label:undefined}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",gap:sideOpen?10:0,height:36,marginBottom:2,padding:0,paddingLeft:sideOpen?11:0,paddingRight:sideOpen?10:0,borderRadius:8,border:`1px solid ${isActive?accentBorder:hover?"#1E1E1E":"transparent"}`,background:isActive?accentDim:hover?bgElevated:"transparent",cursor:"pointer",color:isActive?accent:hover?"#888":"#4A4A4A",position:"relative",overflow:"visible",justifyContent:sideOpen?"flex-start":"center",transition:"background 0.15s,border-color 0.15s,color 0.15s" }}
    >
      {isActive&&<span style={{ position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:`linear-gradient(180deg,${accent},${accent}80)`,borderRadius:"0 3px 3px 0",zIndex:10 }}/>}
      <span style={{ display:"flex",alignItems:"center",justifyContent:"center",width:18,height:18,flexShrink:0,marginLeft:!sideOpen&&isActive?3:0,transition:"margin-left 0.2s" }}>
        <Icon d={icons[icon]} size={16}/>
      </span>
      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:isActive?500:400,whiteSpace:"nowrap",overflow:"hidden",flex:1,textAlign:"left",opacity:sideOpen?1:0,maxWidth:sideOpen?160:0,transition:"opacity 180ms ease,max-width 300ms cubic-bezier(0.4,0,0.2,1)" }}>
        {label}
      </span>
      {/* Badge — vermelho se tem retirada pendente, laranja se só alertas */}
      {isAlerta&&(
        <span style={{ display:"flex",alignItems:"center",justifyContent:"center",background:temRetirada?"#EF4444":"#F97316",borderRadius:5,fontFamily:"'DM Mono',monospace",fontWeight:600,color:"#fff",flexShrink:0,animation:temRetirada?"barto-pulse-red 2s infinite":"none",...(sideOpen?{width:18,height:18,fontSize:10}:{width:14,height:14,fontSize:8,position:"absolute",top:4,right:4,zIndex:11}) }}>
          {totalBadge>9?"9+":totalBadge}
        </span>
      )}
    </button>
  );
}

function LogoutBtn({ sideOpen, onLogout, bgElevated }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onLogout} title={!sideOpen?"Sair":undefined}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:sideOpen?"flex-start":"center",gap:sideOpen?10:0,height:36,paddingLeft:sideOpen?11:0,paddingRight:sideOpen?10:0,borderRadius:8,border:`1px solid ${hover?"#ef444418":"transparent"}`,background:hover?"#ef444410":"transparent",color:hover?"#ef4444":"#383838",cursor:"pointer",overflow:"hidden",transition:"background 0.15s,color 0.15s,border-color 0.15s" }}
    >
      <span style={{ display:"flex",alignItems:"center",justifyContent:"center",width:18,height:18,flexShrink:0 }}><Icon d={icons.logout} size={16}/></span>
      <span style={{ fontSize:13,whiteSpace:"nowrap",overflow:"hidden",opacity:sideOpen?1:0,maxWidth:sideOpen?120:0,transition:"opacity 180ms ease,max-width 300ms cubic-bezier(0.4,0,0.2,1)" }}>Sair</span>
    </button>
  );
}