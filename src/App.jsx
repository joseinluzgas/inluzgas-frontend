import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import {
  LayoutDashboard, Users, FileText, Layers, Euro, Plug, Plus, Search,
  AlertTriangle, CheckCircle2, Clock, Send, RotateCcw, X, Zap, Flame,
  ChevronRight, Pencil, Ban, UserCog, Trash2, LogOut, LogIn, RefreshCw, Database,
  Mail, MessageCircle, CalendarClock, ArrowLeftRight, Copy, ChevronLeft,
  Ticket, MessageSquarePlus
} from "lucide-react";

/* ============================================================
 * CONFIGURACIÓN — cambia SERVER_URL por tu URL de Railway
 * cuando subas a producción
 * ============================================================ */
const SERVER_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3001" 
  : "https://inluzgas-server.onrender.com";

/* ============================================================
 * API — todas las llamadas van al servidor Node
 * ============================================================ */
const api = async (method, path, body = null) => {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(SERVER_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error del servidor");
  return data;
};

const GET    = (path)        => api("GET",    path);
const POST   = (path, body)  => api("POST",   path, body);
const PATCH  = (path, body)  => api("PATCH",  path, body);
const DEL    = (path)        => api("DELETE", path);

// CRUD helpers sobre la ruta genérica /db/:tabla
const db = {
  sel:    (t, f = "")       => GET(`/db/${t}${f ? "?filter=" + encodeURIComponent(f) : ""}`),
  ins:    (t, body)          => POST(`/db/${t}`, body),
  upd:    (t, f, body)       => PATCH(`/db/${t}?filter=${encodeURIComponent(f)}`, body),
  del:    (t, f)             => DEL(`/db/${t}?filter=${encodeURIComponent(f)}`),
  upsert: (t, body, on)      => POST(`/db/${t}/upsert?on_conflict=${encodeURIComponent(on)}`, body),
};

/* ============================================================
 * TOKENS / ESTILO
 * ============================================================ */
const C = {
  bg:"#F5F6F3", panel:"#FFFFFF", ink:"#1C2321", mut:"#69736D",
  line:"#E2E6E1", side:"#132019", sideInk:"#C8D2CB",
  luz:"#DFA00A", luzBg:"#FCF3DB", gas:"#2F7FA3", gasBg:"#E2EFF5",
  ok:"#2E7D52", okBg:"#E1F0E7", err:"#C24435", errBg:"#F9E5E1",
  warn:"#A8720A", warnBg:"#FBEFD6", info:"#3B6B8F", infoBg:"#E5EEF4",
  grey:"#6B7570", greyBg:"#EDEFEC",
};
const FONT = "'Archivo', system-ui, sans-serif";
const LOGO="data:image/png;base64,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";

const ESTADOS = {
  // Estados internos del CRM (minúsculas)
  borrador:     { label:"Borrador",       fg:C.grey, bg:C.greyBg },
  enviado:      { label:"Enviado",        fg:C.info, bg:C.infoBg },
  en_tramite:   { label:"En trámite",     fg:"#7c3aed", bg:"#ede9fe" },
  activado:     { label:"Activado",       fg:C.ok,   bg:C.okBg   },
  pdte_renovar: { label:"Pdte. Renovar",  fg:"#b45309",bg:"#fef3c7" },
  pdte_grabar:  { label:"Pdte. Grabar",   fg:"#6d28d9",bg:"#ede9fe" },
  incidencia:   { label:"Incidencia",     fg:C.err,  bg:C.errBg  },
  rechazado:    { label:"Rechazado",      fg:C.err,  bg:C.errBg  },
  baja:         { label:"Baja",           fg:C.warn, bg:C.warnBg },
  cancelado:    { label:"Cancelado",      fg:C.grey, bg:C.greyBg },
  // Estados de iNergia (nomenclatura oficial, tal cual llegan por API/export)
  "Activo":              { label:"Activo",              fg:C.ok,   bg:C.okBg   },
  "Activo FTR":          { label:"Activo FTR",          fg:C.ok,   bg:C.okBg   },
  "En Trámite":          { label:"En Trámite",          fg:C.info, bg:C.infoBg },
  "Nuevo":               { label:"Nuevo",               fg:C.info, bg:C.infoBg },
  "Borrador":            { label:"Borrador",            fg:C.grey, bg:C.greyBg },
  "Pendiente de Firma":  { label:"Pendiente de Firma",  fg:C.warn, bg:C.warnBg },
  "Pendiente CC":        { label:"Pendiente CC",        fg:C.warn, bg:C.warnBg },
  "Incidencia":          { label:"Incidencia",          fg:C.err,  bg:C.errBg  },
  "Incidencia Resuelta": { label:"Incidencia Resuelta", fg:C.ok,   bg:C.okBg   },
  "Rechazado":           { label:"Rechazado",           fg:C.err,  bg:C.errBg  },
  "Cancelado":           { label:"Cancelado",           fg:C.grey, bg:C.greyBg },
  "Baja":                { label:"Baja",                fg:C.warn, bg:C.warnBg },
  "Baja CC":             { label:"Baja CC",             fg:C.warn, bg:C.warnBg },
};
const CONCEPTOS = ["Comisión","Regularización","Penalización","Adelanto","Devolución"];
const ROLES = ["Master","Manager","Jefe de Equipo","Comercial"];
const TIPOS_VIA = ["Alameda","Autovía","Avenida","Bajada","Barrio","Calle","Callejón","Camino","Carretera","Cañada","Colonia","Conjunto","Cuesta","Diseminado","Entrada","Explanada","Glorieta","Gran Vía","Grupo","Jardines","Lugar","Muelle","Paraje","Parque","Pasadizo","Pasaje","Paseo","Plaza","Polígono","Prolongación","Puente","Rambla","Ronda","Rotonda","Rúa","Sector","Senda","Subida","Travesía","Urbanización","Vía","Vereda"];

const can = {
  enviarContrato:    u => u?.rol==="Master",
  activarContrato:   u => ["Master","Manager"].includes(u?.rol),
  consultarEstado:   u => !!u, // todos los roles pueden consultar el estado en iNergia
  editarEnviado:     u => u?.rol==="Master",
  cambiarComercial:  u => ["Master","Manager"].includes(u?.rol),
  gestionarCatalogo: u => u?.rol==="Master",
  gestionarUsuarios: u => u?.rol==="Master",
  crearParaOtros:    u => u?.rol==="Master",
  modificarLiq:      u => u?.rol==="Master",
  revisarLiq:        u => ["Master","Manager"].includes(u?.rol),
  verTodasLiq:       u => ["Master","Manager"].includes(u?.rol),
  verTodosTickets:   u => ["Master","Manager"].includes(u?.rol),
};

/* ============================================================
 * HELPERS
 * ============================================================ */
const hoy = () => new Date().toISOString().slice(0,10);
const fmtF = iso => iso ? new Date(iso+"T00:00:00").toLocaleDateString("es-ES") : "—";
const fmtE = n => (n??0).toLocaleString("es-ES",{style:"currency",currency:"EUR"});
const addM  = m => { const d=new Date(); d.setMonth(d.getMonth()+m); return d.toISOString().slice(0,10); };
// Función genérica de ordenación para tablas (acepta campo y dirección)
const sortBy = (arr,campo,dir,accessor) => [...arr].sort((a,b)=>{
  const va=accessor?accessor(a,campo):a[campo], vb=accessor?accessor(b,campo):b[campo];
  if(va==null&&vb==null)return 0; if(va==null)return 1; if(vb==null)return -1;
  const r=typeof va==="number"?va-vb:String(va).localeCompare(String(vb),"es",{sensitivity:"base"});
  return r*dir;
});
const diasBaja = c => {
  if (c.estado!=="baja"||!c.fecha_baja) return null;
  const lim=new Date(c.fecha_baja+"T00:00:00"); lim.setDate(lim.getDate()+15);
  return Math.ceil((lim-new Date())/86400000);
};

/* ============================================================
 * VALIDACIÓN NIF/CIF
 * ============================================================ */
function validarNIF(nif) {
  const n=nif.toUpperCase().trim();
  if (!/^[0-9XYZ][0-9]{7}[A-Z]$/.test(n)) return false;
  const letras='TRWAGMYFPDXBNJZSQVHLCKE';
  let num=n.slice(0,-1);
  if (num[0]==='X') num='0'+num.slice(1);
  else if (num[0]==='Y') num='1'+num.slice(1);
  else if (num[0]==='Z') num='2'+num.slice(1);
  return letras[parseInt(num)%23]===n.slice(-1);
}
function validarCIF(cif) {
  const c=cif.toUpperCase().trim();
  if (!/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(c)) return false;
  const letras='JABCDEFGHI'; let sumaPares=0,sumaImpares=0;
  for (let i=1;i<8;i++) { const d=parseInt(c[i]); if(i%2===0) sumaPares+=d; else { const x=d*2; sumaImpares+=x>9?x-9:x; } }
  const total=(sumaPares+sumaImpares)%10; const control=total===0?0:10-total; const ultimo=c.slice(-1);
  if ('PQSW'.includes(c[0])) return letras[control]===ultimo;
  if ('ABEH'.includes(c[0])) return String(control)===ultimo;
  return String(control)===ultimo||letras[control]===ultimo;
}
// CUPS español: ES + 16 dígitos + 2 letras de control (+ frontera opcional, ej. 0F)
function validarCUPS(cups) {
  const c=(cups||"").toUpperCase().trim();
  const m=c.match(/^ES(\d{16})([A-Z]{2})(\d[A-Z])?$/);
  if (!m) return false;
  const letras='TRWAGMYFPDXBNJZSQVHLCKE';
  const r=Number(BigInt(m[1])%529n);
  return letras[Math.floor(r/23)]+letras[r%23]===m[2];
}
// ── Comisión por tramos (espejo de la lógica del servidor) ──
const normTarifa=t=>String(t||"").toUpperCase().replace(/[\s.]/g,"").replace("TD",".0TD").replace(".0.0TD",".0TD");
const tramosDeProducto=(prodId,datos)=>(datos.comision_tramos||[]).filter(t=>t.producto_id===prodId);
// Devuelve {comision, origen:'tramo'|'producto'} o null (hay tramos pero falta el consumo)
function calcularComisionCt(ct,datos){
  const pr=datos.productos.find(p=>p.id===ct.producto_id);
  if(!pr) return null;
  const tramos=tramosDeProducto(pr.id,datos);
  if(!tramos.length) return {comision:Number(pr.comision_bruta??0),origen:"producto"};
  if(ct.consumo_anual===null||ct.consumo_anual===undefined||ct.consumo_anual==="") return null;
  const c=Number(ct.consumo_anual), pot=ct.potencia_p1!=null?Number(ct.potencia_p1):null;
  let cand=tramos.filter(t=>c>=Number(t.desde)&&(t.hasta===null||c<Number(t.hasta)));
  const conPot=cand.filter(t=>t.potencia);
  if(conPot.length&&pot!=null){
    const casa=t=>{const s=String(t.potencia).replace("kW","").trim();const lim=parseFloat(s.replace(/[^\d.]/g,""));
      if(isNaN(lim))return true; return /≤|<=/.test(s)?pot<=lim:/</.test(s)?pot<lim:pot>lim;};
    const f=cand.filter(casa); if(f.length)cand=f;
  }
  const tPr=normTarifa(pr.tarifa);
  const el=cand.find(t=>t.tarifa_acceso&&tPr&&normTarifa(t.tarifa_acceso)===tPr)
         ||cand.find(t=>!t.tarifa_acceso)||cand[0]||null;
  return el?{comision:Number(el.comision??0),origen:"tramo"}:null;
}

/* ============================================================
 * UI PRIMITIVOS
 * ============================================================ */
const Badge = ({fg,bg,children}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,fontSize:12,fontWeight:600,color:fg,background:bg}}>{children}</span>
);
const TipoChip = ({tipo}) => tipo==="luz"
  ? <Badge fg={C.luz} bg={C.luzBg}><Zap size={12}/> Luz</Badge>
  : <Badge fg={C.gas} bg={C.gasBg}><Flame size={12}/> Gas</Badge>;
const EstadoChip = ({estado,dias}) => {
  const e=ESTADOS[estado]||{label:estado||"—",fg:C.grey,bg:C.greyBg};
  const esBaja=estado==="baja"||estado==="Baja"||estado==="Baja CC";
  return <Badge fg={e.fg} bg={e.bg}>{e.label}{esBaja&&dias!=null&&dias>=0?" · "+dias+"d":""}</Badge>;
};
const Btn = ({kind="primary",small,disabled,onClick,children,title,style={}}) => {
  const base={fontFamily:FONT,fontWeight:600,borderRadius:8,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,border:"1px solid transparent",display:"inline-flex",alignItems:"center",gap:6,...style};
  const sz=small?{fontSize:12,padding:"4px 10px"}:{fontSize:13,padding:"8px 14px"};
  const kinds={primary:{background:C.ink,color:"#fff"},ghost:{background:"transparent",color:C.ink,borderColor:C.line},danger:{background:"transparent",color:C.err,borderColor:"#EFC9C1"},ok:{background:C.ok,color:"#fff"}};
  return <button title={title} disabled={disabled} onClick={onClick} style={{...base,...sz,...kinds[kind]}}>{children}</button>;
};
// Botón con estado de carga: al pulsar muestra spinner + texto "trabajando" y se deshabilita hasta terminar
const BtnAsync = ({kind="ghost",small=true,onClick,children,cargandoTexto,title,style={}}) => {
  const [cargando,setCargando]=useState(false);
  const manejar=async()=>{
    if(cargando)return;
    setCargando(true);
    try{ await onClick(); } finally{ setCargando(false); }
  };
  return (
    <Btn kind={kind} small={small} disabled={cargando} onClick={manejar} title={title} style={style}>
      {cargando
        ? <><RefreshCw size={small?12:14} style={{animation:"spin 0.8s linear infinite"}}/> {cargandoTexto||"Trabajando…"}</>
        : children}
    </Btn>
  );
};
const Field = ({label,children}) => (
  <label style={{display:"block",marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:C.mut,marginBottom:4}}>{label}</div>
    {children}
  </label>
);
const iSt={width:"100%",fontFamily:FONT,fontSize:13,padding:"8px 10px",border:"1px solid "+C.line,borderRadius:8,background:"#fff",color:C.ink,outline:"none",boxSizing:"border-box"};
const Input  = p => <input  {...p} style={{...iSt,...p.style}}/>;
const Sel    = ({children,...p}) => <select {...p} style={{...iSt,...p.style}}>{children}</select>;
const Card   = ({children,style,onClick}) => <div style={{background:C.panel,border:"1px solid "+C.line,borderRadius:12,...style}} onClick={onClick}>{children}</div>;
const TH     = ({children,right,style}) => <th style={{padding:"8px 12px",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:C.mut,textAlign:right?"right":"center",...style}}>{children}</th>;
const TD     = ({children,right,center,left,style}) => <td style={{padding:"13px 14px",fontSize:13,textAlign:left?"left":right?"right":"center",borderTop:"1px solid "+C.line,verticalAlign:"middle",...style}}>{children}</td>;
// Teléfono con acceso directo a WhatsApp. Normaliza a formato internacional español si hace falta.
const telWa = t => {
  const s=String(t||"").replace(/[^\d+]/g,"");
  if(!s) return "";
  if(s.startsWith("+")) return s.slice(1);
  if(s.startsWith("34")) return s;
  return "34"+s;
};
const TelWhatsapp = ({tel,fontSize=13}) => {
  if(!tel) return <span style={{color:C.mut}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize,whiteSpace:"nowrap"}}>
      {tel}
      <a href={"https://wa.me/"+telWa(tel)} target="_blank" rel="noopener noreferrer" title="Enviar WhatsApp"
         onClick={e=>e.stopPropagation()} style={{display:"inline-flex",color:"#25D366"}}>
        <MessageCircle size={15}/>
      </a>
    </span>
  );
};
const EmailLink = ({email,fontSize=12}) => {
  if(!email) return <span style={{color:C.mut}}>—</span>;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize,whiteSpace:"nowrap"}}>
      {email}
      <a href={"mailto:"+email} title="Enviar email" onClick={e=>e.stopPropagation()}
         style={{display:"inline-flex",color:C.info}}>
        <Mail size={14}/>
      </a>
    </span>
  );
};
const Modal  = ({title,onClose,children,wide}) => (
  <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"rgba(18,26,22,.45)"}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:wide?820:500,background:C.panel,borderRadius:12,overflow:"hidden",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:"1px solid "+C.line}}>
        <div style={{fontWeight:700,fontSize:15}}>{title}</div>
        <button onClick={onClose} style={{color:C.mut,background:"none",border:"none",cursor:"pointer"}}><X size={18}/></button>
      </div>
      <div style={{padding:"16px 20px",overflowY:"auto"}}>{children}</div>
    </div>
  </div>
);
const Spinner = ({text}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60,gap:12}}>
    <div style={{width:32,height:32,border:"3px solid "+C.line,borderTopColor:C.ink,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    {text&&<div style={{fontSize:13,color:C.mut}}>{text}</div>}
    <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
  </div>
);
const Sec = ({label,extra}) => (
  <div style={{fontSize:11,fontWeight:700,color:C.mut,marginTop:16,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid "+C.line,paddingBottom:4,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <span>{label}</span>{extra}
  </div>
);
// Cabecera de tabla ordenable
const THSort = ({children,campo,orden,setOrden,right,style}) => {
  const activo=orden.campo===campo;
  return (
    <th style={{padding:"8px 12px",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:C.mut,textAlign:right?"right":"center",cursor:"pointer",userSelect:"none",...style}}
      onClick={()=>setOrden(o=>o.campo===campo?{campo,dir:-o.dir}:{campo,dir:1})}>
      <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
        {children}
        <span style={{fontSize:9,opacity:activo?1:0.25}}>{activo&&orden.dir===-1?"▼":"▲"}</span>
      </span>
    </th>
  );
};

/* ============================================================
 * CONTEXTO
 * ============================================================ */
const Ctx = createContext(null);

/* ============================================================
 * LOGIN
 * ============================================================ */
function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const d = await POST("/auth/login",{email,password:pass});
      if (!d.ok) throw new Error("Error de autenticación");
      onLogin(d.usuario);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:FONT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap');*{box-sizing:border-box}"}</style>
      <Card style={{width:"100%",maxWidth:380,padding:32}}>
        <div style={{textAlign:"center",marginBottom:28,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <img src={LOGO} alt="Inluzgas" style={{height:64,marginBottom:8,display:"block"}}/>
          <div style={{fontSize:12,color:C.mut,marginTop:4}}>CRM · Asesoría energética</div>
        </div>
        <Field label="Email"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/></Field>
        <Field label="Contraseña"><Input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></Field>
        {err&&<div style={{fontSize:12,color:C.err,marginBottom:12,padding:"8px 10px",background:C.errBg,borderRadius:6}}>{err}</div>}
        <Btn disabled={loading||!email||!pass} onClick={submit} style={{width:"100%",justifyContent:"center"}}>
          <LogIn size={14}/> {loading?"Conectando…":"Entrar"}
        </Btn>
      </Card>
    </div>
  );
}

/* ============================================================
 * ACCIONES CONTRATO
 * ============================================================ */
function AccionesContrato({ct}) {
  const {yo,datos,recargar,setModal}=useContext(Ctx);
  const [consultando,setConsultando]=useState(false);
  const [showEstados,setShowEstados]=useState(false);
  const cm =datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
  const pv =datos.proveedores.find(x=>x.id===cm?.proveedor_id);
  const esApi=pv?.tipo==="api";
  const dias=diasBaja(ct);

  const consultarEstado=async()=>{
    setConsultando(true);
    try{
      const d=await POST("/api/inergia/sync-estado/"+ct.id);
      if(d.ok){
        if(d.cambio) await Promise.all([recargar("contratos"),recargar("eventos")]);
        else { await recargar("contratos"); alert('Sin cambios. Estado en iNergia: "'+(d.estadoTxt||"desconocido")+'"'); }
      } else alert("❌ "+d.error);
    }catch(e){alert("❌ "+e.message);}
    setConsultando(false);
  };

  const cambiar=async (estado,manual=false)=>{
    const upd={estado,estado_at:new Date().toISOString()};
    if(manual) upd.no_sync=true; // Cambio manual → excluir de sincronización API
    if (estado==="enviado")  upd.fecha_envio=hoy();
    if (estado==="activado") {
      const dm=ct.duracion_meses||12;
      upd.fecha_activacion=hoy(); upd.fecha_renovacion=addM(dm); upd.fecha_baja=null;
      if (ct.comision_calculada===null||ct.comision_calculada===undefined){
        const r=calcularComisionCt(ct,datos);
        if(r) upd.comision_calculada=r.comision;
      }
    }
    if (estado==="baja")     upd.fecha_baja=hoy();
    await db.upd("contratos","id=eq."+ct.id,upd);
    await recargar("contratos");
  };

  const cambiarManual=async nuevoEstado=>{
    if(!nuevoEstado||nuevoEstado===ct.estado) return;
    if(!confirm("¿Cambiar estado de «"+(ESTADOS[ct.estado]?.label||ct.estado)+"» a «"+(ESTADOS[nuevoEstado]?.label||nuevoEstado)+"»?\n\nEl contrato se marcará como manual y no se sincronizará con la API.")) return;
    await cambiar(nuevoEstado,true);
    setShowEstados(false);
  };

  const toggleSync=async()=>{
    await db.upd("contratos","id=eq."+ct.id,{no_sync:!ct.no_sync});
    await recargar("contratos");
  };

  return (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end",alignItems:"center"}}>
      {ct.estado==="borrador"&&can.enviarContrato(yo)&&(
        esApi
          ?<Btn small kind="primary" onClick={()=>setModal({t:"enviarInergia",ct})}><Send size={12}/> Enviar a {pv?.nombre}</Btn>
          :<Btn small kind="primary" onClick={()=>cambiar("enviado",true)}><Send size={12}/> Enviar</Btn>
      )}
      {ct.estado==="enviado"&&esApi&&ct.id_inergia&&can.consultarEstado(yo)&&!ct.no_sync&&
        <Btn small kind="ghost" disabled={consultando} onClick={consultarEstado} title={"Consultar estado en "+pv?.nombre}><RefreshCw size={12}/> {consultando?"Consultando…":"Consultar estado"}</Btn>}
      {ct.estado==="enviado"&&can.activarContrato(yo)&&<>
        <Btn small kind="ok"     onClick={()=>cambiar("activado",true)}><CheckCircle2 size={12}/> Activar</Btn>
        <Btn small kind="danger" onClick={()=>cambiar("rechazado",true)}>Rechazar</Btn>
      </>}
      {ct.estado==="enviado"&&can.editarEnviado(yo)&&
        <Btn small kind="ghost" onClick={()=>setModal({t:"editarContrato",ct})}><Pencil size={12}/> Editar</Btn>}
      {["enviado","activado"].includes(ct.estado)&&can.editarEnviado(yo)&&
        <Btn small kind="danger" onClick={()=>cambiar("cancelado",true)}><Ban size={12}/> Cancelar</Btn>}
      {ct.estado==="activado"&&can.activarContrato(yo)&&
        <Btn small kind="ghost" onClick={()=>cambiar("baja",true)}>Registrar baja</Btn>}
      {ct.estado==="baja"&&dias>=0&&can.activarContrato(yo)&&
        <Btn small kind="ok" onClick={()=>cambiar("activado",true)}><RotateCcw size={12}/> Recuperar</Btn>}

      {/* Cambiar estado manualmente */}
      {can.activarContrato(yo)&&(
        <div style={{position:"relative"}}>
          <Btn small kind="ghost" onClick={()=>setShowEstados(!showEstados)} title="Cambiar estado manualmente">
            <Pencil size={11}/> Estado
          </Btn>
          {showEstados&&(
            <div style={{position:"absolute",right:0,top:"100%",zIndex:30,background:"#fff",border:"1px solid "+C.line,borderRadius:8,boxShadow:"0 4px 16px rgba(0,0,0,.12)",padding:4,minWidth:160,marginTop:4}}>
              {Object.entries(ESTADOS).map(([k,v])=>(
                <div key={k} onClick={()=>cambiarManual(k)}
                  style={{padding:"7px 12px",fontSize:12,fontWeight:k===ct.estado?700:400,cursor:k===ct.estado?"default":"pointer",
                    borderRadius:6,color:k===ct.estado?v.fg:C.ink,background:k===ct.estado?v.bg:"transparent",
                    display:"flex",alignItems:"center",gap:6}}
                  onMouseEnter={e=>{if(k!==ct.estado)e.currentTarget.style.background="#f5f5f5"}}
                  onMouseLeave={e=>{if(k!==ct.estado)e.currentTarget.style.background="transparent"}}>
                  {k===ct.estado&&<CheckCircle2 size={11}/>}
                  {v.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toggle no sincronizar */}
      {esApi&&ct.id_inergia&&can.activarContrato(yo)&&(
        <button onClick={toggleSync} title={ct.no_sync?"Actualmente excluido de la sincronización API. Haz clic para reactivar.":"Haz clic para excluir de la sincronización API."}
          style={{fontFamily:FONT,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:4,
            border:"1px solid "+(ct.no_sync?C.warn:C.line),background:ct.no_sync?C.warnBg:"#fff",color:ct.no_sync?"#92400e":C.mut}}>
          {ct.no_sync?<Ban size={11}/>:<RefreshCw size={11}/>}
          {ct.no_sync?"No sync":"Sync"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
 * VISTAS
 * ============================================================ */

function Dashboard() {
  const {yo,datos,recargar,setSel,setVista}=useContext(Ctx);
  const cts=datos.contratos;
  const esActivo=e=>["activado","Activo","Activo FTR","pdte_renovar"].includes(e);
  const esEnviado=e=>["enviado","en_tramite","En Trámite","Nuevo","Pendiente de Firma","Pendiente CC"].includes(e);
  const esBaja=e=>["baja","Baja","Baja CC"].includes(e);
  const activos=cts.filter(c=>esActivo(c.estado));const enviados=cts.filter(c=>esEnviado(c.estado));const bajas=cts.filter(c=>esBaja(c.estado)&&diasBaja(c)>=0);
  const hoyD=new Date();const diasH=c=>Math.ceil((new Date(c.fecha_renovacion+"T00:00:00")-hoyD)/86400000);
  const renov30=activos.filter(c=>c.fecha_renovacion&&diasH(c)<=30&&diasH(c)>0);const renov60=activos.filter(c=>c.fecha_renovacion&&diasH(c)<=60&&diasH(c)>0);const renov90=activos.filter(c=>c.fecha_renovacion&&diasH(c)<=90&&diasH(c)>0);
  const vencidos=activos.filter(c=>c.fecha_renovacion&&new Date(c.fecha_renovacion+"T00:00:00")<hoyD);const vencidos60=vencidos.filter(c=>diasH(c)>=-60);
  const ticketsAbiertos=(datos.tickets||[]).filter(t=>t.estado!=="cerrado");const ticketsAlta=(datos.tickets||[]).filter(t=>t.prioridad==="alta"&&t.estado!=="cerrado");
  const discrep=datos.lineas.filter(ln=>{if(ln.concepto!=="Comisión")return false;const ct=datos.contratos.find(c=>c.id===ln.contrato_id);const pr=datos.productos.find(p=>p.id===ct?.producto_id);return pr&&Math.abs(ln.importe-(pr.comision_bruta??0))>0.005;});
  const porCm={};activos.forEach(c=>{const cm=datos.comercializadoras.find(x=>x.id===c.comercializadora_id);porCm[cm?.nombre||"Otra"]=(porCm[cm?.nombre||"Otra"]||0)+1;});
  const topCm=Object.entries(porCm).sort((a,b)=>b[1]-a[1]).slice(0,10);const maxCm=topCm[0]?.[1]||1;
  const nLuz=activos.filter(c=>c.tipo==="luz").length;const nGas=activos.filter(c=>c.tipo==="gas").length;
  const pctLuz=activos.length?(nLuz/activos.length*100).toFixed(0):0;const pctGas=activos.length?(nGas/activos.length*100).toFixed(0):0;
  const porEstado={};cts.forEach(c=>{const e=ESTADOS[c.estado]||{label:c.estado};porEstado[e.label||c.estado]=(porEstado[e.label||c.estado]||0)+1;});const topEstados=Object.entries(porEstado).sort((a,b)=>b[1]-a[1]);
  const porComercial={};activos.forEach(c=>{const cl=datos.clientes.find(x=>x.id===c.cliente_id);const u=datos.usuarios.find(x=>x.id===cl?.comercial_id);porComercial[u?.nombre||"Sin asignar"]=(porComercial[u?.nombre||"Sin asignar"]||0)+1;});
  const topComercial=Object.entries(porComercial).sort((a,b)=>b[1]-a[1]);const maxComercial=topComercial[0]?.[1]||1;
  const KPI=({n,label,sub,fg,bg,icon:Icon,onClick})=>(<Card style={{padding:0,flex:1,minWidth:155,cursor:onClick?"pointer":"default",overflow:"hidden",borderTop:"3px solid "+fg}} onClick={onClick}><div style={{display:"flex",alignItems:"center",gap:14,padding:"18px 20px"}}><div style={{width:48,height:48,borderRadius:12,background:bg||fg+"14",display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon&&<Icon size={22} style={{color:fg}}/>}</div><div><div style={{fontSize:28,fontWeight:800,color:C.ink,letterSpacing:-1,lineHeight:1}}>{n}</div><div style={{fontSize:12,fontWeight:600,color:C.mut,marginTop:3}}>{label}</div>{sub&&<div style={{fontSize:11,color:fg,fontWeight:600,marginTop:1}}>{sub}</div>}</div></div></Card>);
  const MiniBar=({label,count,max,color})=>(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:130,fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={label}>{label}</div><div style={{flex:1,height:22,background:"#f3f4f6",borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",width:(count/max*100)+"%",background:color||"linear-gradient(90deg,#2563eb,#3b82f6)",borderRadius:6,transition:"width .4s ease"}}/></div><div style={{fontSize:13,fontWeight:700,width:40,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{count}</div></div>);
  return (
    <div>
      <div style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}><div><div style={{fontSize:24,fontWeight:800,letterSpacing:-0.5}}>Hola, {yo.nombre.split(" ")[0]} 👋</div><div style={{fontSize:13,color:C.mut}}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div><div style={{display:"flex",gap:8}}>{vencidos60.length>0&&<Badge fg={C.err} bg={C.errBg}>⚠ {vencidos60.length} renovaciones vencidas</Badge>}{ticketsAlta.length>0&&<Badge fg="#7c3aed" bg="#ede9fe">🔥 {ticketsAlta.length} ticket{ticketsAlta.length>1?"s":""} prioridad alta</Badge>}</div></div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}><KPI n={datos.clientes.length} label="Clientes" fg="#2563eb" icon={Users}/><KPI n={activos.length} label="Contratos activos" sub={nLuz+" luz · "+nGas+" gas"} fg={C.ok} icon={Zap}/><KPI n={enviados.length} label="En trámite" fg={C.info} icon={Send}/><KPI n={cts.length} label="Contratos totales" fg="#6b7280" icon={FileText}/><KPI n={ticketsAbiertos.length} label="Tickets abiertos" fg={ticketsAbiertos.length>0?"#7c3aed":C.ok} icon={Ticket}/></div>
      <Card style={{padding:0,marginBottom:20,overflow:"hidden"}}><div style={{padding:"16px 20px",fontWeight:700,fontSize:15,borderBottom:"1px solid "+C.line,display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa"}}><span>📅 Renovaciones</span><Btn small kind="ghost" onClick={()=>{setSel(null);setVista("renovaciones");}}>Ver todas →</Btn></div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>{[{label:"Vencidas",n:vencidos60.length,color:C.err,sub:"últimos 60d"},{label:"30 días",n:renov30.length,color:C.err,sub:"próximas"},{label:"60 días",n:renov60.length,color:C.warn,sub:"próximas"},{label:"90 días",n:renov90.length,color:C.info,sub:"próximas"}].map((r,i)=>(<div key={i} style={{padding:"20px 24px",textAlign:"center",borderRight:i<3?"1px solid "+C.line:"none"}}><div style={{fontSize:36,fontWeight:800,color:r.color,lineHeight:1}}>{r.n}</div><div style={{fontSize:13,fontWeight:700,color:C.ink,marginTop:6}}>{r.label}</div><div style={{fontSize:11,color:C.mut,marginTop:2}}>{r.sub}</div></div>))}</div></Card>
      <div style={{display:"grid",gap:16,gridTemplateColumns:"2fr 1fr",marginBottom:20}}><Card style={{padding:0}}><div style={{padding:"14px 18px",fontWeight:700,fontSize:14,borderBottom:"1px solid "+C.line,background:"#fafafa"}}>Contratos activos por comercializadora</div><div style={{padding:"16px 18px"}}>{topCm.map(([n,c])=><MiniBar key={n} label={n} count={c} max={maxCm} color="linear-gradient(90deg,#2563eb,#60a5fa)"/>)}{topCm.length===0&&<div style={{fontSize:13,color:C.mut,textAlign:"center",padding:12}}>Sin datos</div>}</div></Card><div style={{display:"flex",flexDirection:"column",gap:16}}><Card style={{padding:"20px",textAlign:"center"}}><div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Tipo de suministro</div><div style={{display:"flex",justifyContent:"center",marginBottom:12}}><div style={{width:72,height:72,borderRadius:"50%",background:"conic-gradient("+C.luz+" 0% "+pctLuz+"%, "+C.gas+" "+pctLuz+"% 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:48,height:48,borderRadius:"50%",background:"#fff"}}/></div></div><div style={{display:"flex",justifyContent:"center",gap:20}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:3,background:C.luz}}/><span style={{fontSize:13,fontWeight:600}}>{nLuz} Luz ({pctLuz}%)</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:3,background:C.gas}}/><span style={{fontSize:13,fontWeight:600}}>{nGas} Gas ({pctGas}%)</span></div></div></Card><Card style={{padding:0,flex:1}}><div style={{padding:"14px 18px",fontWeight:700,fontSize:14,borderBottom:"1px solid "+C.line,background:"#fafafa"}}>Por comercial</div><div style={{padding:"12px 18px"}}>{topComercial.map(([n,c])=><MiniBar key={n} label={n} count={c} max={maxComercial} color="linear-gradient(90deg,#059669,#34d399)"/>)}</div></Card></div></div>
      <div style={{display:"grid",gap:16,gridTemplateColumns:"1fr 1fr 1fr",marginBottom:20}}><Card style={{padding:0}}><div style={{padding:"14px 18px",fontWeight:700,fontSize:14,borderBottom:"1px solid "+C.line,background:"#fafafa"}}>Contratos por estado</div><div style={{padding:"12px 18px",maxHeight:280,overflowY:"auto"}}>{topEstados.map(([label,count])=>{const est=Object.values(ESTADOS).find(e=>e.label===label);return(<div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f5f5f5"}}><Badge fg={est?.fg||C.mut} bg={est?.bg||C.greyBg}>{label}</Badge><span style={{fontSize:14,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{count}</span></div>);})}</div></Card><Card style={{padding:0}}><div style={{padding:"14px 18px",fontWeight:700,fontSize:14,borderBottom:"1px solid "+C.line,display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa"}}><span>Bajas recuperables</span><Badge fg={bajas.length>0?C.warn:C.ok} bg={bajas.length>0?C.warnBg:C.okBg}>{bajas.length}</Badge></div>{bajas.length===0&&<div style={{padding:"24px 18px",fontSize:13,color:C.mut,textAlign:"center"}}>Sin bajas pendientes 👍</div>}<div style={{maxHeight:280,overflowY:"auto"}}>{bajas.slice(0,8).map(c=>{const cl=datos.clientes.find(x=>x.id===c.cliente_id);const cm=datos.comercializadoras.find(x=>x.id===c.comercializadora_id);return(<div key={c.id} style={{padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,borderTop:"1px solid "+C.line}}><div><div style={{fontSize:13,fontWeight:600}}>{cl?.razon_social}</div><div style={{fontSize:11,color:C.mut}}>{cm?.nombre} · baja {fmtF(c.fecha_baja)}</div></div><Badge fg={C.warn} bg={C.warnBg}><Clock size={11}/> {diasBaja(c)}d</Badge></div>);})}</div></Card><Card style={{padding:0}}><div style={{padding:"14px 18px",fontWeight:700,fontSize:14,borderBottom:"1px solid "+C.line,background:"#fafafa"}}>Actividad reciente</div><div style={{maxHeight:280,overflowY:"auto"}}>{datos.eventos.slice(0,12).map(ev=>(<div key={ev.id} style={{padding:"8px 18px",borderTop:"1px solid "+C.line,display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:6,height:6,borderRadius:"50%",background:ev.tipo?.includes("error")?C.err:ev.tipo?.includes("sync")?C.info:C.ok,marginTop:6,flexShrink:0}}/><div><div style={{fontSize:12,fontWeight:600}}>{ev.tipo} <span style={{fontWeight:400,color:C.mut}}>· {ev.origen}</span></div><div style={{fontSize:11,color:C.mut}}>{ev.detalle?.slice(0,80)}</div><div style={{fontSize:10,color:C.mut,fontVariantNumeric:"tabular-nums"}}>{new Date(ev.created_at).toLocaleString("es-ES")}</div></div></div>))}{datos.eventos.length===0&&<div style={{padding:"24px 18px",fontSize:13,color:C.mut,textAlign:"center"}}>Sin eventos.</div>}</div></Card></div>
      {discrep.length>0&&<Card style={{padding:"16px 20px",borderLeft:"4px solid "+C.err,marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10}}><AlertTriangle size={18} style={{color:C.err}}/><div><div style={{fontSize:14,fontWeight:700,color:C.err}}>{discrep.length} discrepancias en liquidaciones</div><div style={{fontSize:12,color:C.mut}}>Líneas con importe diferente al catálogo.</div></div></div></Card>}
    </div>
  );
}
function Clientes() {
  const {yo,datos,setSel,setModal,recargar}=useContext(Ctx);
  const [busq,setBusq]=useState("");
  const [orden,setOrden]=useState({campo:"razon_social",dir:1});
  const [sel,setSelIds]=useState(new Set());
  const [moverA,setMoverA]=useState("");
  const [moviendo,setMoviendo]=useState(false);
  const list=datos.clientes.filter(c=>(c.razon_social+c.cif+(c.nif||"")+(c.telefono||"")+(c.email||"")+(c.localidad||"")).toLowerCase().includes(busq.toLowerCase()));
  const acc=(c,campo)=>{
    if(campo==="comercial") return datos.usuarios.find(u=>u.id===c.comercial_id)?.nombre||"";
    if(campo==="ncts") return datos.contratos.filter(x=>x.cliente_id===c.id).length;
    return c[campo];
  };
  const sorted=sortBy(list,orden.campo,orden.dir,acc);
  const toggleSel=id=>{const n=new Set(sel);if(n.has(id))n.delete(id);else n.add(id);setSelIds(n);};
  const toggleAll=()=>{if(sel.size===sorted.length)setSelIds(new Set());else setSelIds(new Set(sorted.map(c=>c.id)));};
  const moverComercial=async()=>{
    if(!moverA||sel.size===0)return;
    setMoviendo(true);
    for(const cid of sel){await db.upd("clientes","id=eq."+cid,{comercial_id:moverA});}
    await recargar("clientes");setSelIds(new Set());setMoverA("");setMoviendo(false);
  };
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,maxWidth:340}}>
          <Search size={14} style={{position:"absolute",left:10,top:10,color:C.mut}}/>
          <Input placeholder="Buscar por razón social o CIF…" value={busq} onChange={e=>setBusq(e.target.value)} style={{paddingLeft:30}}/>
        </div>
        <Btn onClick={()=>setModal({t:"nuevoCliente"})}><Plus size={14}/> Nuevo cliente</Btn>
        <div style={{flex:1}}/>
        <div style={{fontSize:13,fontWeight:600,color:C.mut}}>{datos.clientes.length} clientes</div>
      </div>
      {sel.size>0&&can.cambiarComercial(yo)&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"10px 14px",background:C.infoBg,borderRadius:8,border:"1px solid "+C.info}}>
          <span style={{fontSize:13,fontWeight:600,color:C.info}}>{sel.size} seleccionado{sel.size>1?"s":""}</span>
          <Sel value={moverA} onChange={e=>setMoverA(e.target.value)} style={{width:200,fontSize:12}}>
            <option value="">Mover a comercial…</option>
            {datos.usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}
          </Sel>
          <Btn small disabled={!moverA||moviendo} onClick={moverComercial}>{moviendo?"Moviendo…":"Mover"}</Btn>
          <Btn small kind="ghost" onClick={()=>setSelIds(new Set())}>Cancelar</Btn>
        </div>
      )}
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            {can.cambiarComercial(yo)&&<TH style={{width:36}}><input type="checkbox" checked={sel.size===sorted.length&&sorted.length>0} onChange={toggleAll}/></TH>}
            <THSort campo="razon_social" orden={orden} setOrden={setOrden}>Razón social / Nombre</THSort>
            <THSort campo="cif" orden={orden} setOrden={setOrden}>NIF/CIF</THSort>
            <TH>Teléfono</TH>
            <THSort campo="email" orden={orden} setOrden={setOrden}>Email</THSort>
            <THSort campo="localidad" orden={orden} setOrden={setOrden}>Población</THSort>
            <THSort campo="comercial" orden={orden} setOrden={setOrden}>Comercial</THSort>
            <THSort campo="ncts" orden={orden} setOrden={setOrden} right style={{width:60}}>Cont.</THSort>
            <TH right style={{width:32}}></TH>
          </tr></thead>
          <tbody>
            {sorted.map(c=>{
              const com=datos.usuarios.find(u=>u.id===c.comercial_id);
              const ncts=datos.contratos.filter(x=>x.cliente_id===c.id).length;
              return (
                <tr key={c.id} style={{cursor:"pointer",background:sel.has(c.id)?C.infoBg:"transparent"}} onClick={()=>setSel({tipo:"cliente",id:c.id})}>
                  {can.cambiarComercial(yo)&&<TD onClick={e=>{e.stopPropagation();toggleSel(c.id);}}><input type="checkbox" checked={sel.has(c.id)} readOnly/></TD>}
                  <TD><span style={{fontWeight:600}}>{c.razon_social}</span><div style={{fontSize:11,color:C.mut}}>{c.tipo_titular==="fisica"?"Persona física":c.tipo_titular==="organismo"?"Org. público":"Empresa"}</div></TD>
                  <TD style={{color:C.mut,fontVariantNumeric:"tabular-nums"}}>{c.cif||c.nif||"—"}</TD>
                  <TD><TelWhatsapp tel={c.telefono}/>{c.telefono2&&<div style={{marginTop:2}}><TelWhatsapp tel={c.telefono2}/></div>}</TD>
                  <TD><EmailLink email={c.email}/></TD>
                  <TD style={{color:C.mut}}>{c.localidad||"—"}</TD>
                  <TD>{com?.nombre}</TD>
                  <TD right>{ncts}</TD>
                  <TD right><ChevronRight size={15} style={{color:C.mut}}/></TD>
                </tr>
              );
            })}
            {sorted.length===0&&<tr><TD colSpan={can.cambiarComercial(yo)?9:8} style={{color:C.mut}}>Sin clientes. Crea el primero con «Nuevo cliente».</TD></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CampoFicha({label,valor}) {
  return (
    <div>
      <div style={{fontSize:11,color:C.mut,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
      <div style={{fontSize:14,fontWeight:500,wordBreak:"break-word"}}>{valor||"—"}</div>
    </div>
  );
}
function ClienteDetalle({id}) {
  const {yo,datos,recargar,setSel,setModal}=useContext(Ctx);
  const c=datos.clientes.find(x=>x.id===id);
  if(!c)return null;
  const cts=datos.contratos.filter(x=>x.cliente_id===id);
  const com=datos.usuarios.find(u=>u.id===c.comercial_id);
  return (
    <div>
      <button style={{fontSize:13,fontWeight:600,color:C.mut,background:"none",border:"none",cursor:"pointer",marginBottom:12}} onClick={()=>setSel(null)}>← Clientes</button>
      <Card style={{padding:0,marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:"18px 20px",borderBottom:"1px solid "+C.line,background:"#fafafa"}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.4}}>{c.razon_social}</div>
            <div style={{fontSize:12,color:C.mut,marginTop:2}}>{c.tipo_titular==="fisica"?"Persona física":c.tipo_titular==="organismo"?"Organismo público":"Empresa"}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:C.mut,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Comercial</div>
            {can.cambiarComercial(yo)
              ?<Sel value={c.comercial_id||""} onChange={async e=>{
                  const nuevoId=e.target.value;
                  if(nuevoId===c.comercial_id)return;
                  const actual=datos.usuarios.find(u=>u.id===c.comercial_id)?.nombre||"sin asignar";
                  const nuevo=datos.usuarios.find(u=>u.id===nuevoId)?.nombre||"";
                  if(!window.confirm(`¿Cambiar el comercial de este cliente de ${actual} a ${nuevo}?\n\nAfecta a las comisiones de sus contratos.`)){
                    e.target.value=c.comercial_id||""; // revertir el select
                    return;
                  }
                  await db.upd("clientes","id=eq."+id,{comercial_id:nuevoId});
                  await recargar("clientes");
                }} style={{width:180}}>
                {datos.usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}
              </Sel>
              :<div style={{fontSize:14,fontWeight:600}}>{com?.nombre}</div>}
          </div>
        </div>
        <div style={{padding:"18px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"16px 24px",marginBottom:16}}>
            <CampoFicha label={c.tipo_titular==="fisica"?"NIF":"CIF"} valor={c.cif||c.nif}/>
            {c.tipo_titular!=="fisica"?<CampoFicha label="Representante" valor={c.representante}/>:<CampoFicha label="Nombre" valor={c.contacto||c.representante}/>}
            {c.tipo_titular!=="fisica"?<CampoFicha label="DNI representante" valor={c.dni_representante}/>:<div/>}
            <CampoFicha label="Teléfono" valor={c.telefono?<TelWhatsapp tel={c.telefono} fontSize={14}/>:null}/>
            <CampoFicha label="Email" valor={c.email?<EmailLink email={c.email} fontSize={14}/>:null}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"16px 24px"}}>
            <CampoFicha label="Dirección" valor={[c.tipo_via,c.direccion,c.numero,c.planta,c.letra].filter(Boolean).join(" ")}/>
            <CampoFicha label="Código postal" valor={c.codpostal}/>
            <CampoFicha label="Localidad" valor={c.localidad}/>
            <CampoFicha label="Provincia" valor={c.provincia}/>
            <CampoFicha label="IBAN" valor={c.iban}/>
          </div>
          {c.observaciones&&<div style={{marginTop:16}}><CampoFicha label="Observaciones" valor={c.observaciones}/></div>}
        </div>
      </Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:13}}>Contratos ({cts.length})</div>
        <Btn small onClick={()=>setModal({t:"nuevoContrato",clienteId:id})}><Plus size={13}/> Alta de contrato</Btn>
      </div>
      <div style={{display:"grid",gap:12}}>
        {cts.map(ct=>{
          const cm=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
          const pr=datos.productos.find(x=>x.id===ct.producto_id);
          return (
            <Card key={ct.id} style={{padding:14,borderLeft:"4px solid "+(ct.tipo==="luz"?C.luz:C.gas),cursor:"pointer"}} onClick={()=>setSel({tipo:"contrato",id:ct.id})}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><TipoChip tipo={ct.tipo}/><EstadoChip estado={ct.estado} dias={diasBaja(ct)}/></div>
                  <div style={{fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{ct.cups}</div>
                  <div style={{fontSize:11,color:C.mut}}>{cm?.nombre} · {pr?.nombre} · {fmtE(pr?.comision_bruta)}</div>
                  <div style={{fontSize:11,color:C.mut}}>Enviado {fmtF(ct.fecha_envio)} · Activado {fmtF(ct.fecha_activacion)} · Renovación {fmtF(ct.fecha_renovacion)}</div>
                </div>
                <div onClick={e=>e.stopPropagation()}><AccionesContrato ct={ct}/></div>
              </div>
            </Card>
          );
        })}
        {cts.length===0&&<Card style={{padding:16,color:C.mut,fontSize:13}}>Sin contratos. Usa «Alta de contrato».</Card>}
      </div>
    </div>
  );
}

/* ============================================================
 * DETALLE DE CONTRATO
 * ============================================================ */
function ContratoDetalle({id, volver}) {
  const {yo,datos,recargar,setSel,setModal}=useContext(Ctx);
  const ct=datos.contratos.find(x=>x.id===id);
  if(!ct)return null;
  const cl=datos.clientes.find(x=>x.id===ct.cliente_id);
  const cm=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
  const pr=datos.productos.find(x=>x.id===ct.producto_id);
  const pv=datos.proveedores.find(x=>x.id===cm?.proveedor_id);
  const com=datos.usuarios.find(u=>u.id===cl?.comercial_id);
  const dias=diasBaja(ct);
  const tieneTramos=tramosDeProducto(ct.producto_id,datos).length>0;
  const foto=ct.comision_calculada;
  const est=calcularComisionCt(ct,datos);
  const esActivo=["activado","Activo","Activo FTR","pdte_renovar"].includes(ct.estado);
  const diasRenov=ct.fecha_renovacion?Math.ceil((new Date(ct.fecha_renovacion+"T00:00:00")-new Date())/86400000):null;
  const esApi=!!ct.id_inergia;
  const [nuevaObs,setNuevaObs]=useState("");
  const [guardandoObs,setGuardandoObs]=useState(false);
  const obsHistorial=ct.observaciones_historial?JSON.parse(ct.observaciones_historial||"[]"):[];
  const addObs=async()=>{
    if(!nuevaObs.trim())return;
    setGuardandoObs(true);
    const entry={texto:nuevaObs.trim(),usuario:yo.nombre,fecha:new Date().toISOString()};
    const hist=[entry,...obsHistorial];
    await db.upd("contratos","id=eq."+id,{observaciones_historial:JSON.stringify(hist),observaciones:nuevaObs.trim()});
    await recargar("contratos");setNuevaObs("");setGuardandoObs(false);
  };

  return (
    <div>
      <button style={{fontSize:13,fontWeight:600,color:C.mut,background:"none",border:"none",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:4}}
        onClick={volver}><ChevronLeft size={15}/> Volver</button>

      {/* Cabecera */}
      <Card style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",padding:"18px 20px",borderBottom:"1px solid "+C.line,background:"#fafafa"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <TipoChip tipo={ct.tipo}/>
              <EstadoChip estado={ct.estado} dias={dias}/>
              {ct.situacion&&<Badge fg={C.mut} bg={C.greyBg}>{ct.situacion}</Badge>}
              {ct.no_sync&&<Badge fg="#92400e" bg={C.warnBg}>⛔ No sincronizar</Badge>}
              {esApi?<Badge fg="#065f46" bg="#d1fae5">API · iNergia</Badge>:<Badge fg={C.mut} bg={C.greyBg}>Manual</Badge>}
            </div>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.4,fontVariantNumeric:"tabular-nums"}}>{ct.cups||"Sin CUPS"}</div>
            <div style={{fontSize:13,color:C.mut,marginTop:2,cursor:"pointer",textDecoration:"underline"}}
              onClick={()=>setSel({tipo:"cliente",id:cl?.id})}>{cl?.razon_social} · {cl?.cif||cl?.nif}</div>
            {ct.updated_at&&<div style={{fontSize:11,color:C.mut,marginTop:4}}>Última modificación: {new Date(ct.updated_at).toLocaleString("es-ES")} · {esApi?"vía API":"manual"}</div>}
          </div>
          <AccionesContrato ct={ct}/>
        </div>

        {/* Grid de datos */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px 24px",padding:"18px 20px"}}>
          <CampoFicha label="Comercializadora" valor={cm?.nombre}/>
          <CampoFicha label="Producto" valor={pr?.nombre}/>
          <CampoFicha label="Tarifa" valor={ct.tarifa||pr?.tarifa}/>
          <CampoFicha label="Proveedor" valor={pv?.nombre}/>
          <CampoFicha label="Comercial" valor={com?.nombre}/>
          <CampoFicha label="ID iNergia" valor={ct.id_inergia||"—"}/>
          <CampoFicha label="Código" valor={ct.codigo||ct.referencia||"—"}/>
          <CampoFicha label="Tipo solicitud" valor={ct.tiposol||"—"}/>
        </div>
      </Card>

      {/* Fechas + Comisión */}
      <div style={{display:"grid",gap:16,gridTemplateColumns:"1fr 1fr",marginBottom:16}}>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Fechas</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px"}}>
            <CampoFicha label="Registro" valor={fmtF(ct.fecha_registro)}/>
            <CampoFicha label="Envío" valor={fmtF(ct.fecha_envio)}/>
            <CampoFicha label="Activación" valor={fmtF(ct.fecha_activacion)}/>
            <CampoFicha label="Renovación" valor={
              ct.fecha_renovacion
                ? <span style={{color:diasRenov!=null&&diasRenov<=90?(diasRenov<=30?C.err:C.warn):C.ink,fontWeight:600}}>
                    {fmtF(ct.fecha_renovacion)}{diasRenov!=null&&diasRenov<=90&&<span style={{fontSize:11,fontWeight:400}}> ({diasRenov} días)</span>}
                  </span>
                : "—"
            }/>
            {ct.fecha_baja&&<CampoFicha label="Baja" valor={fmtF(ct.fecha_baja)}/>}
          </div>
        </Card>
        <Card style={{padding:"18px 20px"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Comisión y consumo</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px"}}>
            <CampoFicha label="Comisión congelada" valor={
              foto!=null
                ? <span style={{fontWeight:700,fontSize:16}}>{fmtE(foto)}</span>
                : esActivo&&tieneTramos
                  ? <span style={{color:"#b45309",fontWeight:600}}>Pendiente</span>
                  : est ? <span style={{color:C.mut}}>≈ {fmtE(est.comision)} <span style={{fontSize:11}}>(estimación)</span></span>
                  : "—"
            }/>
            <CampoFicha label="Consumo anual" valor={ct.consumo_anual!=null?ct.consumo_anual+" kWh/año":"—"}/>
            <CampoFicha label="Potencia P1" valor={ct.potencia_p1?ct.potencia_p1+" kW":"—"}/>
            <CampoFicha label="Duración" valor={(ct.duracion_meses||12)+" meses"}/>
            <CampoFicha label="Permanencia" valor={ct.permanencia||"—"}/>
          </div>
        </Card>
      </div>

      {/* Potencias detalladas (solo luz) */}
      {ct.tipo==="luz"&&(ct.potencia_p2||ct.potencia_p3)&&(
        <Card style={{padding:"18px 20px",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Potencias contratadas (kW)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
            {["P1","P2","P3","P4","P5","P6"].map((p,i)=><CampoFicha key={p} label={p} valor={ct["potencia_p"+(i+1)]||"—"}/>)}
          </div>
        </Card>
      )}

      {/* Datos adicionales */}
      <Card style={{padding:"18px 20px",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Datos adicionales</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px 24px"}}>
          <CampoFicha label="IBAN" valor={ct.iban}/>
          <CampoFicha label="Renovación auto" valor={ct.renovacion_auto}/>
          <CampoFicha label="Autoconsumo" valor={ct.autoconsumo||"NO"}/>
          <CampoFicha label="CNAE" valor={ct.cnae}/>
          <CampoFicha label="Canal" valor={ct.canal}/>
          <CampoFicha label="Servicios" valor={ct.servicios}/>
          {ct.observaciones&&<CampoFicha label="Observaciones" valor={ct.observaciones}/>}
          {ct.motivo_rechazo&&<CampoFicha label="Motivo de rechazo" valor={<span style={{color:C.err}}>{ct.motivo_rechazo}</span>}/>}
          {ct.estado_proveedor&&<CampoFicha label="Estado en proveedor" valor={ct.estado_proveedor}/>}
          {ct.ultima_consulta_estado&&<CampoFicha label="Última consulta estado" valor={new Date(ct.ultima_consulta_estado).toLocaleString("es-ES")}/>}
          {ct.estado_original&&<CampoFicha label="Estado original (Excel)" valor={ct.estado_original}/>}
        </div>
      </Card>

      {/* Dirección CUPS si existe */}
      {/* Dirección del punto de suministro — siempre visible */}
      <Card style={{padding:"18px 20px",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Dirección del punto de suministro</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px 24px"}}>
          <CampoFicha label="Dirección" valor={[ct.tipo_via_cups,ct.calle_cups,ct.numero_cups,ct.planta_cups,ct.puerta_cups].filter(Boolean).join(" ")||ct.direccion_cups||"—"}/>
          <CampoFicha label="Código postal" valor={ct.codpostal_cups||"—"}/>
          <CampoFicha label="Localidad" valor={ct.localidad_cups||"—"}/>
          <CampoFicha label="Provincia" valor={ct.provincia_cups||"—"}/>
        </div>
      </Card>

      {/* Observaciones (historial) */}
      <Card style={{padding:"18px 20px",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Observaciones</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <Input placeholder="Añadir observación…" value={nuevaObs} onChange={e=>setNuevaObs(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addObs()} style={{flex:1}}/>
          <Btn small disabled={guardandoObs||!nuevaObs.trim()} onClick={addObs}><Plus size={12}/> Añadir</Btn>
        </div>
        {obsHistorial.length>0?(
          <div style={{borderLeft:"2px solid "+C.line,marginLeft:8,paddingLeft:16}}>
            {obsHistorial.map((o,i)=>(
              <div key={i} style={{marginBottom:12,position:"relative"}}>
                <div style={{position:"absolute",left:-22,top:4,width:10,height:10,borderRadius:"50%",background:i===0?C.info:C.line,border:"2px solid "+C.panel}}/>
                <div style={{fontSize:11,color:C.mut,marginBottom:2,fontVariantNumeric:"tabular-nums"}}>
                  {new Date(o.fecha).toLocaleString("es-ES")}
                  {o.usuario&&<span style={{fontWeight:600,marginLeft:6}}>{o.usuario}</span>}
                </div>
                <div style={{fontSize:13}}>{o.texto}</div>
              </div>
            ))}
          </div>
        ):(ct.observaciones?<div style={{fontSize:13,color:C.mut}}>{ct.observaciones}</div>
          :<div style={{fontSize:12,color:C.mut}}>Sin observaciones.</div>)
        }
      </Card>

      {/* Renovación */}
      {esActivo&&(
        <Card style={{padding:"18px 20px",marginBottom:16,borderLeft:"4px solid "+C.warn}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Renovación</div>
          <div style={{fontSize:13,color:C.mut,marginBottom:14}}>
            {diasRenov!=null
              ? diasRenov<=0
                ? "Este contrato ya venció su fecha de renovación."
                : "Faltan "+diasRenov+" días para la fecha de renovación ("+fmtF(ct.fecha_renovacion)+")."
              : "Sin fecha de renovación registrada."}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn small kind="ok" onClick={()=>setModal({t:"renovar",ct,modo:"misma"})}>
              <RotateCcw size={13}/> Renovar (misma comercializadora)
            </Btn>
            <Btn small kind="ghost" onClick={()=>setModal({t:"renovar",ct,modo:"cambio"})}>
              <ArrowLeftRight size={13}/> Renovar con cambio
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// Exporta los contratos a un archivo CSV (se abre en Excel) para cruzar con el Excel manual
function exportarContratosExcel(listaFiltrada, datos){
  // exportamos TODOS los contratos, no solo los filtrados visibles
  const cts=datos.contratos;
  const cab=["CUPS","Cliente","CIF/NIF","Comercializadora","Producto","Tarifa","Tipo","Estado","Situacion","id_inergia","Potencia P1","Consumo kWh","Fecha activacion","Fecha renovacion","Comercial","IBAN"];
  const esc=v=>{const s=String(v==null?"":v);return /[";\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const filas=cts.map(ct=>{
    const cl=datos.clientes.find(x=>x.id===ct.cliente_id);
    const cm=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
    const pr=datos.productos.find(x=>x.id===ct.producto_id);
    const com=datos.usuarios.find(u=>u.id===cl?.comercial_id);
    return [ct.cups,cl?.razon_social,cl?.cif||cl?.nif,cm?.nombre,pr?.nombre,ct.tarifa,ct.tipo,
      ct.estado,ct.situacion,ct.id_inergia,ct.potencia_p1,ct.consumo_anual,
      ct.fecha_activacion,ct.fecha_renovacion,com?.nombre,ct.iban].map(esc).join(";");
  });
  const csv="\uFEFF"+cab.join(";")+"\n"+filas.join("\n"); // BOM para que Excel respete acentos
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="contratos_inluzgas_"+new Date().toISOString().slice(0,10)+".csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function Contratos() {
  const {datos,setModal,setSel}=useContext(Ctx);
  const [busq,setBusq]=useState("");
  const [fEstado,setFEstado]=useState("");
  const [orden,setOrden]=useState({campo:"estado_at",dir:-1});
  const list=datos.contratos.filter(c=>{
    const cl=datos.clientes.find(x=>x.id===c.cliente_id);
    const ok=!busq||(cl?.razon_social+c.cups).toLowerCase().includes(busq.toLowerCase());
    return ok&&(!fEstado||c.estado===fEstado);
  });
  const acc=(c,campo)=>{
    if(campo==="cliente") return datos.clientes.find(x=>x.id===c.cliente_id)?.razon_social||"";
    if(campo==="comercializadora") return datos.comercializadoras.find(x=>x.id===c.comercializadora_id)?.nombre||"";
    if(campo==="producto") return datos.productos.find(x=>x.id===c.producto_id)?.nombre||"";
    if(campo==="comercial"){const cl=datos.clientes.find(x=>x.id===c.cliente_id);return datos.usuarios.find(u=>u.id===cl?.comercial_id)?.nombre||"";}
    if(campo==="estado_at") return c.estado_at||c.created_at||"";
    return c[campo];
  };
  const sorted=sortBy(list,orden.campo,orden.dir,acc);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <Search size={14} style={{position:"absolute",left:10,top:10,color:C.mut}}/>
          <Input placeholder="Buscar cliente o CUPS…" value={busq} onChange={e=>setBusq(e.target.value)} style={{paddingLeft:30}}/>
        </div>
        <Sel value={fEstado} onChange={e=>setFEstado(e.target.value)} style={{width:200}}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </Sel>
        <Btn kind="ghost" onClick={()=>exportarContratosExcel(list,datos)}><Database size={14}/> Exportar a Excel</Btn>
        <Btn onClick={()=>setModal({t:"nuevoContrato"})}><Plus size={14}/> Alta de contrato</Btn>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:12,color:C.mut}}>{sorted.length} contratos{sorted.length>200?" · mostrando 200":""}</div>
        <div style={{fontSize:13,fontWeight:600,color:C.mut}}>{datos.contratos.length} contratos totales</div>
      </div>
      <div style={{overflowX:"auto",border:"1px solid "+C.line,borderRadius:10,background:C.panel}}>
        <table style={{width:"100%",minWidth:1400,borderCollapse:"collapse",whiteSpace:"nowrap"}}>
          <thead><tr style={{background:"#fafafa"}}>
            <THSort campo="cliente" orden={orden} setOrden={setOrden}>Cliente</THSort>
            <THSort campo="cups" orden={orden} setOrden={setOrden}>CUPS</THSort>
            <THSort campo="tipo" orden={orden} setOrden={setOrden}>Tipo</THSort>
            <THSort campo="comercializadora" orden={orden} setOrden={setOrden}>Comercializadora</THSort>
            <THSort campo="producto" orden={orden} setOrden={setOrden}>Producto</THSort>
            <THSort campo="estado" orden={orden} setOrden={setOrden}>Estado</THSort>
            <THSort campo="situacion" orden={orden} setOrden={setOrden}>Situación</THSort>
            <THSort campo="comercial" orden={orden} setOrden={setOrden}>Comercial</THSort>
            <TH>Comisión</TH>
            <THSort campo="fecha_renovacion" orden={orden} setOrden={setOrden}>Renovación</THSort>
            <THSort campo="estado_at" orden={orden} setOrden={setOrden}>Última sync</THSort>
            <TH>Acciones</TH>
          </tr></thead>
          <tbody>
            {sorted.slice(0,200).map(ct=>{
              const cl=datos.clientes.find(x=>x.id===ct.cliente_id);
              const cm=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
              const pr=datos.productos.find(x=>x.id===ct.producto_id);
              const com=datos.usuarios.find(u=>u.id===cl?.comercial_id);
              const tieneTramos=tramosDeProducto(ct.producto_id,datos).length>0;
              const foto=ct.comision_calculada;
              const est=calcularComisionCt(ct,datos);
              return (
                <tr key={ct.id} style={{cursor:"pointer"}} onClick={()=>setSel({tipo:"contrato",id:ct.id})}>
                  <TD center style={{fontWeight:600,maxWidth:220,whiteSpace:"normal"}}>{cl?.razon_social||"—"}</TD>
                  <TD center style={{fontVariantNumeric:"tabular-nums",fontSize:12}}>{ct.cups}</TD>
                  <TD center><TipoChip tipo={ct.tipo}/></TD>
                  <TD center>{cm?.nombre}</TD>
                  <TD center style={{maxWidth:200,whiteSpace:"normal",fontSize:12}}>{pr?.nombre}</TD>
                  <TD center><EstadoChip estado={ct.estado} dias={diasBaja(ct)}/></TD>
                  <TD center style={{fontSize:12,color:C.mut}}>{ct.situacion||"—"}</TD>
                  <TD center style={{fontSize:12,color:C.mut}}>{com?.nombre}</TD>
                  <TD center>
                    {foto!==null&&foto!==undefined
                      ?<span style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtE(foto)}</span>
                      :(["activado","Activo","Activo FTR"].includes(ct.estado)&&tieneTramos)
                        ?<span style={{fontSize:11,fontWeight:600,color:"#b45309"}}>Pendiente</span>
                        :est?<span style={{fontSize:12,color:C.mut,fontVariantNumeric:"tabular-nums"}} title="Estimación; se fija al activar">≈ {fmtE(est.comision)}</span>
                        :<span style={{fontSize:12,color:C.mut}}>—</span>}
                    {ct.consumo_anual!=null&&<div style={{fontSize:10,color:C.mut}}>{ct.consumo_anual} kWh/año</div>}
                  </TD>
                  <TD center style={{color:C.mut,fontSize:12}}>{fmtF(ct.fecha_renovacion)||"—"}</TD>
                  <TD center style={{color:C.mut,fontSize:11,fontVariantNumeric:"tabular-nums"}}>{ct.estado_at?new Date(ct.estado_at).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}</TD>
                  <TD center onClick={e=>e.stopPropagation()}><AccionesContrato ct={ct}/></TD>
                </tr>
              );
            })}
            {sorted.length===0&&<tr><TD colSpan={12} style={{color:C.mut,textAlign:"center",padding:20}}>Sin contratos en este filtro.</TD></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CeldaIdInergia({prod,recargar}) {
  const [editando,setEditando]=useState(false);
  const [val,setVal]=useState(prod.id_inergia||"");
  const [guard,setGuard]=useState(false);

  if (!editando) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
      <span style={{fontSize:12,fontVariantNumeric:"tabular-nums",color:prod.id_inergia?C.ink:C.mut}}>{prod.id_inergia||"—"}</span>
      <Btn small kind="ghost" onClick={()=>{setVal(prod.id_inergia||"");setEditando(true);}}>Edit</Btn>
    </div>
  );

  const guardar=async()=>{
    const v=val.trim();
    if (v===(prod.id_inergia||"")) { setEditando(false); return; }
    if (!window.confirm("¿Estás seguro de que quieres cambiar el ID de iNergia de este producto?")) return;
    setGuard(true);
    await db.upd("productos","id=eq."+prod.id,{id_inergia:v||null});
    await recargar("productos");
    setGuard(false);
    setEditando(false);
  };

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
      <Input autoFocus value={val} onChange={e=>setVal(e.target.value)} style={{width:90,fontSize:12}}
        onKeyDown={e=>{if(e.key==="Enter")guardar();if(e.key==="Escape")setEditando(false);}}/>
      <Btn small kind="ok" disabled={guard} onClick={guardar}>{guard?"…":"OK"}</Btn>
      <Btn small kind="ghost" onClick={()=>setEditando(false)}>✕</Btn>
    </div>
  );
}

function Catalogo() {
  const {yo,datos,recargar,setModal}=useContext(Ctx);
  const [selCm,setSelCm]=useState(null);                       // filtro por botón de comercializadora
  const [filt,setFilt]=useState({cm:"",prod:"",tarifa:"",tipo:""});  // filtros por columna
  const [orden,setOrden]=useState({campo:"prod",dir:1});       // ordenación alfabética

  const nombreCm=id=>datos.comercializadoras.find(x=>x.id===id)?.nombre||"";
  const cambiarOrden=campo=>setOrden(o=>o.campo===campo?{campo,dir:-o.dir}:{campo,dir:1});
  const Flecha=({campo})=>orden.campo===campo?<span style={{fontSize:10}}> {orden.dir===1?"▲":"▼"}</span>:<span style={{fontSize:10,opacity:.25}}> ▲</span>;

  const lista=datos.productos
    .map(p=>({...p,_cm:nombreCm(p.comercializadora_id),_tarifa:p.tarifa||"",_ncts:datos.contratos.filter(c=>c.producto_id===p.id).length}))
    .filter(p=>
      (!selCm||p.comercializadora_id===selCm)
      &&(!filt.cm    ||p._cm.toLowerCase().includes(filt.cm.toLowerCase()))
      &&(!filt.prod  ||(p.nombre||"").toLowerCase().includes(filt.prod.toLowerCase()))
      &&(!filt.tarifa||p._tarifa.toLowerCase().includes(filt.tarifa.toLowerCase()))
      &&(!filt.tipo  ||p.tipo===filt.tipo)
    )
    .sort((a,b)=>{
      if(orden.campo==="ncts") return (a._ncts-b._ncts)*orden.dir;
      const va=orden.campo==="cm"?a._cm:orden.campo==="tarifa"?a._tarifa:(a.nombre||"");
      const vb=orden.campo==="cm"?b._cm:orden.campo==="tarifa"?b._tarifa:(b.nombre||"");
      return va.localeCompare(vb,"es",{sensitivity:"base"})*orden.dir;
    });

  const thBtn={cursor:"pointer",userSelect:"none"};
  const inFiltro={...iSt,fontSize:12,padding:"5px 8px",marginTop:4};

  return (
    <div>
      {/* ── Comercializadoras: botones de filtro ─────────────────────── */}
      <Card style={{marginBottom:16}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+C.line}}>
          <div style={{fontWeight:700,fontSize:13}}>Comercializadoras ({datos.comercializadoras.filter(cm=>datos.productos.some(p=>p.comercializadora_id===cm.id)).length})</div>
          {can.gestionarCatalogo(yo)&&<Btn small kind="ghost" onClick={()=>setModal({t:"nuevaComer"})}><Plus size={13}/> Añadir</Btn>}
        </div>
        <div style={{padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:8}}>
          <button onClick={()=>setSelCm(null)} style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:20,cursor:"pointer",border:"1px solid "+(selCm===null?C.side:C.line),background:selCm===null?C.side:"#fff",color:selCm===null?"#fff":C.ink}}>
            Todas · {datos.productos.length}
          </button>
          {[...datos.comercializadoras]
            .filter(cm=>datos.productos.some(p=>p.comercializadora_id===cm.id))  // ocultar sin productos
            .sort((a,b)=>a.nombre.localeCompare(b.nombre,"es")).map(cm=>{
            const pv=datos.proveedores.find(p=>p.id===cm.proveedor_id);
            const activa=selCm===cm.id;
            return (
              <button key={cm.id} onClick={()=>setSelCm(activa?null:cm.id)} title={pv?.nombre?"Proveedor: "+pv.nombre:""}
                style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:20,cursor:"pointer",border:"1px solid "+(activa?C.side:C.line),background:activa?C.side:"#fff",color:activa?"#fff":C.ink}}>
                {cm.nombre}
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Productos: tabla filtrable y ordenable ───────────────────── */}
      <Card>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+C.line}}>
          <div style={{fontWeight:700,fontSize:13}}>Productos ({lista.length}{selCm?" · "+nombreCm(selCm):""})</div>
          {can.gestionarCatalogo(yo)&&<Btn small kind="ghost" onClick={()=>setModal({t:"nuevoProducto"})}><Plus size={13}/> Añadir</Btn>}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr>
              {[
                {key:"cm",    label:"Comercializadora", orden:"cm",     filtro:"texto"},
                {key:"prod",  label:"Producto",         orden:"prod",   filtro:"texto"},
                {key:"tarifa",label:"Tarifa de acceso", orden:"tarifa", filtro:"texto"},
                {key:"tipo",  label:"Tipo",             orden:null,     filtro:"select", minW:120},
                {key:"ncts",  label:"Contratos",        orden:"ncts",   filtro:null,     minW:90},
                {key:"com",   label:"Comisión",         orden:null,     filtro:null},
                ...(can.gestionarCatalogo(yo)?[{key:"idi",label:"ID iNergia",orden:null,filtro:null,minW:110}]:[]),
              ].map(col=>(
                <TH key={col.key} style={col.minW?{minWidth:col.minW}:{}}>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {/* Banda 1: título — misma altura en todas las columnas */}
                    <div style={{height:32,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",lineHeight:1.25}}>
                      {col.orden
                        ?<span style={thBtn} onClick={()=>cambiarOrden(col.orden)}>{col.label}<Flecha campo={col.orden}/></span>
                        :<span>{col.label}</span>}
                    </div>
                    {/* Banda 2: filtro — misma altura en todas las columnas */}
                    <div style={{height:31,display:"flex",alignItems:"center"}}>
                      {col.filtro==="texto"&&<Input placeholder="Filtrar…" value={filt[col.key]} onChange={e=>setFilt({...filt,[col.key]:e.target.value})} style={{...inFiltro,marginTop:0,width:"100%",boxSizing:"border-box"}}/>}
                      {col.filtro==="select"&&
                        <select value={filt.tipo} onChange={e=>setFilt({...filt,tipo:e.target.value})} style={{...iSt,fontSize:12,padding:"5px 6px",fontFamily:FONT,cursor:"pointer",width:"100%",boxSizing:"border-box"}}>
                          <option value="">Todos</option>
                          <option value="luz">Luz</option>
                          <option value="gas">Gas</option>
                        </select>}
                    </div>
                  </div>
                </TH>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(p=>{
              const pv=datos.proveedores.find(x=>x.id===datos.comercializadoras.find(c=>c.id===p.comercializadora_id)?.proveedor_id);
              return (
                <tr key={p.id} style={{verticalAlign:"middle"}}>
                  <TD style={{fontWeight:600}}>{p._cm}<div style={{fontSize:11,color:C.mut,fontWeight:400}}>{pv?.nombre}</div></TD>
                  <TD>{p.nombre}</TD>
                  <TD center>{p._tarifa||"—"}</TD>
                  <TD center><TipoChip tipo={p.tipo}/></TD>
                  <TD center style={{fontVariantNumeric:"tabular-nums",fontWeight:p._ncts>0?700:400,color:p._ncts>0?C.ink:C.mut}}>{p._ncts}</TD>
                  <TD right style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>
                    {(()=>{const trs=tramosDeProducto(p.id,datos);const n=trs.length;
                      if(n>0){
                        const sinRellenar=trs.every(t=>Number(t.comision||0)===0);
                        return <button onClick={()=>can.gestionarCatalogo(yo)&&setModal({t:"tramos",prodId:p.id})}
                          style={{fontFamily:FONT,fontSize:12,fontWeight:600,border:"none",background:"none",cursor:can.gestionarCatalogo(yo)?"pointer":"default",
                            color:sinRellenar?"#b45309":"#2563eb",textDecoration:can.gestionarCatalogo(yo)?"underline":"none"}}
                          title={n+" tramos"+(sinRellenar?" · sin rellenar (0 €)":"")}>
                          {sinRellenar?"Tramos a 0 €":"Según tramo"}</button>;
                      }
                      return can.gestionarCatalogo(yo)
                        ?<button onClick={()=>setModal({t:"tramos",prodId:p.id})} style={{fontFamily:FONT,fontSize:13,fontWeight:700,border:"none",background:"none",cursor:"pointer",color:C.ink}} title="Definir tramos">{fmtE(p.comision_bruta)}</button>
                        :fmtE(p.comision_bruta);})()}
                  </TD>
                  {can.gestionarCatalogo(yo)&&<TD right>
                    {pv?.tipo==="api"
                      ?<CeldaIdInergia prod={p} recargar={recargar}/>
                      :<span style={{fontSize:12,color:C.mut}}>—</span>}
                  </TD>}
                </tr>
              );
            })}
            {lista.length===0&&<tr><TD colSpan={can.gestionarCatalogo(yo)?7:6} style={{color:C.mut}}>Sin productos con estos filtros.</TD></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Liquidaciones() {
  const {yo,datos,setSel,setModal}=useContext(Ctx);
  const [orden,setOrden]=useState({campo:"fecha",dir:-1});
  const acc=(l,campo)=>{
    if(campo==="proveedor") return datos.proveedores.find(p=>p.id===l.proveedor_id)?.nombre||"";
    if(campo==="lineas") return datos.lineas.filter(ln=>ln.liquidacion_id===l.id).length;
    if(campo==="total") return datos.lineas.filter(ln=>ln.liquidacion_id===l.id).reduce((a,ln)=>a+ln.importe,0);
    return l[campo];
  };
  const sorted=sortBy(datos.liquidaciones,orden.campo,orden.dir,acc);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:13,color:C.mut}}>Liquidaciones de proveedores y reparto a la red comercial.</div>
        {can.modificarLiq(yo)&&<Btn onClick={()=>setModal({t:"nuevaLiq"})}><Plus size={14}/> Nueva liquidación</Btn>}
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <THSort campo="proveedor" orden={orden} setOrden={setOrden}>Proveedor</THSort>
            <THSort campo="periodo" orden={orden} setOrden={setOrden}>Periodo</THSort>
            <THSort campo="fecha" orden={orden} setOrden={setOrden}>Fecha</THSort>
            <THSort campo="lineas" orden={orden} setOrden={setOrden} right>Líneas</THSort>
            <THSort campo="total" orden={orden} setOrden={setOrden} right>Total</THSort>
            <TH>Verificación</TH>
            <THSort campo="estado" orden={orden} setOrden={setOrden}>Estado</THSort>
            <TH right></TH>
          </tr></thead>
          <tbody>
            {sorted.map(l=>{
              const pv=datos.proveedores.find(p=>p.id===l.proveedor_id);
              const lins=datos.lineas.filter(ln=>ln.liquidacion_id===l.id);
              const total=lins.reduce((a,ln)=>a+ln.importe,0);
              const disc=lins.filter(ln=>{
                if(ln.concepto!=="Comisión")return false;
                const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
                const pr=datos.productos.find(p=>p.id===ct?.producto_id);
                return pr&&Math.abs(ln.importe-(pr.comision_bruta??0))>0.005;
              }).length;
              return (
                <tr key={l.id} style={{cursor:"pointer"}} onClick={()=>setSel({tipo:"liq",id:l.id})}>
                  <TD><span style={{fontWeight:600}}>{pv?.nombre}</span></TD>
                  <TD>{l.periodo}</TD>
                  <TD style={{color:C.mut}}>{fmtF(l.fecha)}</TD>
                  <TD right>{lins.length}</TD>
                  <TD right style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtE(total)}</TD>
                  <TD>{disc?<Badge fg={C.err} bg={C.errBg}><AlertTriangle size={12}/> {disc} discrepancia{disc>1?"s":""}</Badge>:<Badge fg={C.ok} bg={C.okBg}><CheckCircle2 size={12}/> Cuadra</Badge>}</TD>
                  <TD>{l.estado==="revisada"?<Badge fg={C.ok} bg={C.okBg}>Revisada</Badge>:<Badge fg={C.warn} bg={C.warnBg}>Pendiente</Badge>}</TD>
                  <TD right><ChevronRight size={15} style={{color:C.mut}}/></TD>
                </tr>
              );
            })}
            {sorted.length===0&&<tr><TD colSpan={8} style={{color:C.mut}}>Sin liquidaciones.</TD></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function LiqDetalle({id}) {
  const {yo,datos,recargar,setSel,setModal}=useContext(Ctx);
  const l=datos.liquidaciones.find(x=>x.id===id);
  if(!l)return null;
  const pv=datos.proveedores.find(p=>p.id===l.proveedor_id);
  const lins=datos.lineas.filter(ln=>ln.liquidacion_id===id);
  const total=lins.reduce((a,ln)=>a+ln.importe,0);
  const pctDe=(uId,cmId)=>{const u=datos.usuarios.find(x=>x.id===uId);const c=datos.comisiones.find(x=>x.usuario_id===uId&&x.comercializadora_id===cmId);return c?.porcentaje??u?.pct_default??0;};
  const verif=ln=>{
    const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
    if(!ct||ln.concepto!=="Comisión")return{estado:"neutro",prevista:null,dif:0,ct:null};
    // Prevista: la comisión-foto del contrato si existe; si no, el tramo vigente; si no, comision_bruta
    let prev=ct.comision_calculada;
    if(prev===null||prev===undefined){const r=calcularComisionCt(ct,datos);prev=r?r.comision:(datos.productos.find(p=>p.id===ct.producto_id)?.comision_bruta??0);}
    const dif=+(ln.importe-prev).toFixed(2);
    return{estado:Math.abs(dif)<0.005?"ok":"discrepancia",prevista:prev,dif,ct};
  };
  // Guarda el importe recibido como comisión del tramo vigente del contrato (para futuras liquidaciones)
  const guardarEnTramo=async(ln)=>{
    const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
    if(!ct)return;
    const trs=tramosDeProducto(ct.producto_id,datos);
    if(!trs.length){alert("Este producto no tiene tramos. Ábrelos desde el catálogo para definirlos.");return;}
    const c=Number(ct.consumo_anual);
    if(isNaN(c)){alert("El contrato no tiene consumo anual, no puedo saber a qué tramo asignarlo.");return;}
    const tr=trs.find(t=>c>=Number(t.desde)&&(t.hasta===null||c<Number(t.hasta)));
    if(!tr){alert("No hay un tramo que cubra "+c+" kWh/año.");return;}
    if(!window.confirm(`Guardar ${fmtE(ln.importe)} como comisión del tramo ${tr.desde}–${tr.hasta??"∞"} kWh de este producto? Afectará a los contratos que se activen a partir de ahora.`))return;
    await POST("/api/tramos",{id:tr.id,producto_id:ct.producto_id,desde:tr.desde,hasta:tr.hasta,potencia:tr.potencia,tarifa_acceso:tr.tarifa_acceso,comision:ln.importe});
    await recargar("comision_tramos");
  };
  const reparto={};
  lins.forEach(ln=>{
    const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
    const cl=datos.clientes.find(c=>c.id===ct?.cliente_id);
    const u=datos.usuarios.find(x=>x.id===cl?.comercial_id);
    if(!u)return;
    const pct=ln.pct_override??pctDe(u.id,ct.comercializadora_id);
    const imp=+(ln.importe*pct/100).toFixed(2);
    (reparto[u.id]=reparto[u.id]||{u,lins:[],total:0}).lins.push({...ln,pct,imp});
    reparto[u.id].total+=imp;
  });
  return (
    <div>
      <button style={{fontSize:13,fontWeight:600,color:C.mut,background:"none",border:"none",cursor:"pointer",marginBottom:12}} onClick={()=>setSel(null)}>← Liquidaciones</button>
      <Card style={{padding:18,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:18,fontWeight:800}}>{pv?.nombre} · {l.periodo}</div>
            <div style={{fontSize:13,color:C.mut}}>Recibida el {fmtF(l.fecha)} · Total {fmtE(total)}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {can.modificarLiq(yo)&&<Btn kind="ghost" onClick={()=>setModal({t:"nuevaLinea",liqId:id})}><Plus size={14}/> Añadir línea</Btn>}
            {can.revisarLiq(yo)&&l.estado!=="revisada"&&<Btn kind="ok" onClick={async()=>{await db.upd("liquidaciones","id=eq."+id,{estado:"revisada"});await recargar("liquidaciones");}}><CheckCircle2 size={14}/> Marcar revisada</Btn>}
          </div>
        </div>
      </Card>
      <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Verificación</div>
      <Card style={{marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH>Contrato / Cliente</TH><TH>Concepto</TH><TH right>Prevista</TH><TH right>Recibida</TH><TH right>Diferencia</TH><TH>Resultado</TH>{can.modificarLiq(yo)&&<TH right></TH>}</tr></thead>
          <tbody>
            {lins.map(ln=>{
              const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
              const cl=datos.clientes.find(c=>c.id===ct?.cliente_id);
              const v=verif(ln);
              return (
                <tr key={ln.id}>
                  <TD><span style={{fontWeight:600}}>{cl?.razon_social}</span><div style={{fontSize:11,color:C.mut}}>{ct?.cups}</div></TD>
                  <TD>{ln.concepto}</TD>
                  <TD right style={{color:C.mut,fontVariantNumeric:"tabular-nums"}}>{v.prevista!=null?fmtE(v.prevista):"—"}</TD>
                  <TD right style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtE(ln.importe)}</TD>
                  <TD right style={{color:v.dif<0?C.err:v.dif>0?C.ok:C.mut,fontVariantNumeric:"tabular-nums"}}>{v.prevista!=null?fmtE(v.dif):"—"}</TD>
                  <TD>{v.estado==="ok"?<Badge fg={C.ok} bg={C.okBg}><CheckCircle2 size={12}/> Correcto</Badge>:v.estado==="discrepancia"?<Badge fg={C.err} bg={C.errBg}><AlertTriangle size={12}/> Revisar</Badge>:<Badge fg={C.grey} bg={C.greyBg}>Ajuste</Badge>}</TD>
                  {can.modificarLiq(yo)&&<TD right>
                    <div style={{display:"flex",gap:6,justifyContent:"flex-end",alignItems:"center"}}>
                      {v.estado==="discrepancia"&&v.ct&&<Btn small kind="ghost" onClick={()=>guardarEnTramo(ln)} title="Guardar el importe recibido como comisión del tramo (para futuras liquidaciones)">Guardar en tramo</Btn>}
                      <button onClick={async()=>{await db.del("lineas_liquidacion","id=eq."+ln.id);await recargar("lineas");}} style={{background:"none",border:"none",cursor:"pointer"}}><Trash2 size={14} style={{color:C.err}}/></button>
                    </div>
                  </TD>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Reparto a la red comercial</div>
      <div style={{display:"grid",gap:12}}>
        {Object.values(reparto).map(r=>(
          <Card key={r.u.id}>
            <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+C.line}}>
              <div style={{fontWeight:600,fontSize:13}}>{r.u.nombre} <span style={{fontSize:11,fontWeight:400,color:C.mut}}>({r.u.rol})</span></div>
              <div style={{fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmtE(r.total)}</div>
            </div>
            {r.lins.map(ln=>{
              const ct=datos.contratos.find(c=>c.id===ln.contrato_id);
              const cl=datos.clientes.find(c=>c.id===ct?.cliente_id);
              return (
                <div key={ln.id} style={{padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13,borderTop:"1px solid "+C.line}}>
                  <div style={{color:C.mut}}>{cl?.razon_social} · {ln.concepto}</div>
                  <div style={{fontVariantNumeric:"tabular-nums"}}>{fmtE(ln.importe)} × {ln.pct}% = <b>{fmtE(ln.imp)}</b></div>
                </div>
              );
            })}
          </Card>
        ))}
        {Object.keys(reparto).length===0&&<Card style={{padding:16,color:C.mut,fontSize:13}}>Sin líneas.</Card>}
      </div>
    </div>
  );
}

function VistaUsuarios() {
  const {yo,datos,recargar,setModal}=useContext(Ctx);
  const pctDe=(u,cmId)=>{const c=datos.comisiones.find(x=>x.usuario_id===u.id&&x.comercializadora_id===cmId);return c?.porcentaje??u.pct_default??0;};
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:13,color:C.mut}}>Jerarquía y porcentajes de comisión.</div>
        {can.gestionarUsuarios(yo)&&<Btn onClick={()=>setModal({t:"nuevoUsuario"})}><Plus size={14}/> Nuevo usuario</Btn>}
      </div>
      <div style={{overflowX:"auto"}}>
        <Card>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <TH>Usuario</TH><TH>Rol</TH><TH>Superior</TH>
              {datos.proveedores.filter(p=>p.tipo==="api").map(pv=><TH key={pv.id} right>ID {pv.nombre}</TH>)}
              <TH right>% defecto</TH>
              {datos.comercializadoras.map(cm=><TH key={cm.id} right>% {cm.nombre}</TH>)}
            </tr></thead>
            <tbody>
              {datos.usuarios.map(u=>{
                const sup=datos.usuarios.find(x=>x.id===u.superior_id);
                return (
                  <tr key={u.id}>
                    <TD><span style={{fontWeight:600}}>{u.nombre}</span><div style={{fontSize:11,color:C.mut}}>{u.email}</div></TD>
                    <TD><Badge fg={u.rol==="Master"?C.ink:C.info} bg={u.rol==="Master"?C.greyBg:C.infoBg}>{u.rol}</Badge></TD>
                    <TD style={{color:C.mut}}>{sup?.nombre||"—"}</TD>
                    {datos.proveedores.filter(p=>p.tipo==="api").map(pv=>{
                      const cid=datos.crm_ids.find(x=>x.usuario_id===u.id&&x.proveedor_id===pv.id);
                      return (
                        <TD key={pv.id} right>
                          {can.gestionarUsuarios(yo)
                            ?<Input placeholder="crm_id" defaultValue={cid?.crm_id||""} style={{width:75,textAlign:"right"}} onBlur={async e=>{await db.upsert("crm_ids_proveedor",{usuario_id:u.id,proveedor_id:pv.id,crm_id:e.target.value.trim()},"usuario_id,proveedor_id");await recargar("crm_ids");}}/>
                            :(cid?.crm_id||"—")}
                        </TD>
                      );
                    })}
                    <TD right>{can.gestionarUsuarios(yo)?<Input type="number" defaultValue={u.pct_default} style={{width:65,textAlign:"right"}} onBlur={async e=>{await db.upd("usuarios","id=eq."+u.id,{pct_default:parseFloat(e.target.value)||0});await recargar("usuarios");}}/>:u.pct_default+"%"}</TD>
                    {datos.comercializadoras.map(cm=>(
                      <TD key={cm.id} right>
                        {can.gestionarUsuarios(yo)
                          ?<Input type="number" placeholder={String(pctDe(u,cm.id))} defaultValue={datos.comisiones.find(x=>x.usuario_id===u.id&&x.comercializadora_id===cm.id)?.porcentaje||""} style={{width:65,textAlign:"right"}} onBlur={async e=>{if(e.target.value===""){await db.del("comisiones_usuario","usuario_id=eq."+u.id+"&comercializadora_id=eq."+cm.id);}else{await db.upsert("comisiones_usuario",{usuario_id:u.id,comercializadora_id:cm.id,porcentaje:parseFloat(e.target.value)},"usuario_id,comercializadora_id");}await recargar("comisiones");}}/>
                          :pctDe(u,cm.id)+"%"}
                      </TD>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function ImportarContratos() {
  const {recargar}=useContext(Ctx);
  const [estado,setEstado]=useState(null);
  const [progreso,setProgreso]=useState({actual:0,total:0});
  const inputRef=useRef();

  const procesar=async e=>{
    const file=e.target.files[0]; if(!file)return;
    setEstado("leyendo"); setProgreso({actual:0,total:0});
    try {
      const {read,utils}=await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
      const buf=await file.arrayBuffer();
      const wb=read(buf); const ws=wb.Sheets[wb.SheetNames[0]];
      const raw=utils.sheet_to_json(ws,{header:1,defval:""});
      const cab=raw[1]||[];
      const idx=n=>cab.findIndex(c=>String(c).toLowerCase()===n.toLowerCase());
      const iCups=idx("Cups"),iCliente=idx("Cliente"),iCif=idx("Cif"),
            iComer=idx("Comercializadora"),iCanal=idx("Canal"),iCodigo=idx("Codigo"),
            iReg=idx("Reg"),iEstado=idx("Estado"),iPag=idx("Pag"),
            iComercial=idx("Comercial"),iAlta=idx("Alta"),iVto=idx("Vto"),
            iTarifa=idx("Tarifa"),iPerm=idx("Perm"),iRen=idx("Ren"),
            iProducto=idx("Producto"),iServicios=idx("Servicios"),
            iPotencia=idx("Potencia"),iConsumo=idx("Consumo"),
            iTelefono=idx("Telefono"),iEmail=idx("Email"),
            iIban=idx("Iban"),iFechaEstado=idx("FechaEstado");
      const filas=raw.slice(2).filter(r=>r[iCups]&&String(r[iCups]).startsWith("ES")).map(r=>({
        cups:r[iCups],cliente:r[iCliente],cif:r[iCif],comercializadora:r[iComer],
        canal:r[iCanal],codigo:r[iCodigo],reg:r[iReg],estado:r[iEstado],pag:r[iPag],
        comercial:r[iComercial],alta:r[iAlta],vto:r[iVto],tarifa:r[iTarifa],
        perm:r[iPerm],ren:r[iRen],producto:r[iProducto],servicios:r[iServicios],
        potencia:r[iPotencia],consumo:r[iConsumo],telefono:r[iTelefono],email:r[iEmail],
        iban:r[iIban],fechaEstado:r[iFechaEstado],
      }));
      if(!filas.length){setEstado({ok:false,msg:"Sin contratos en el archivo"});return;}
      const LOTE=50; const total=filas.length;
      let creados=0,actualizados=0,errores=[];
      setEstado("importando"); setProgreso({actual:0,total});
      for(let i=0;i<total;i+=LOTE){
        const lote=filas.slice(i,i+LOTE);
        const d=await POST("/api/importar/contratos-inergia",{filas:lote});
        if(d.ok){creados+=d.creados||0;actualizados+=d.actualizados||0;errores=errores.concat(d.errores||[]);}
        setProgreso({actual:Math.min(i+LOTE,total),total});
      }
      setEstado({ok:true,creados,actualizados,errores});
      await recargar("clientes"); await recargar("contratos"); await recargar("eventos");
    } catch(err){setEstado({ok:false,msg:err.message});}
    e.target.value="";
  };

  const pct=progreso.total?Math.round(progreso.actual/progreso.total*100):0;
  return (
    <div>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={procesar}/>
      <div style={{fontSize:13,color:C.mut,marginBottom:12}}>Exporta los contratos desde iNergia y súbelos aquí. El sistema detecta clientes nuevos y actualiza los existentes por CUPS.</div>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <Btn kind="ghost" onClick={()=>inputRef.current.click()} disabled={estado==="leyendo"||estado==="importando"}>
          <Plus size={14}/> {estado==="leyendo"?"Leyendo Excel…":estado==="importando"?"Importando…":"Subir Excel de iNergia"}
        </Btn>
        {estado&&typeof estado==="object"&&estado?.ok&&(
          <div style={{fontSize:12,color:C.ok,padding:"6px 10px",background:C.okBg,borderRadius:6}}>
            ✅ Creados: {estado.creados} · Actualizados: {estado.actualizados}{estado.errores?.length?" · ⚠ "+estado.errores.length+" errores":""}
          </div>
        )}
        {estado&&typeof estado==="object"&&estado&&!estado?.ok&&(
          <div style={{fontSize:12,color:C.err,padding:"6px 10px",background:C.errBg,borderRadius:6}}>❌ {estado.msg||"Error"}</div>
        )}
      </div>
      {(estado==="importando"||estado==="leyendo")&&(
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,color:C.mut}}>{estado==="leyendo"?"Leyendo Excel…":"Importando contratos…"}</span>
            <span style={{fontSize:13,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{progreso.actual} / {progreso.total||"…"}{progreso.total?" ("+pct+"%)":""}</span>
          </div>
          <div style={{height:8,background:C.line,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,background:"linear-gradient(90deg,"+C.ok+","+C.gas+")",width:progreso.total?pct+"%":"100%",transition:"width 0.3s",animation:progreso.total?"none":"pulse 1.5s ease-in-out infinite"}}/>
          </div>
          <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}"}</style>
        </div>
      )}
      {estado?.errores?.length>0&&(
        <div style={{marginTop:8,fontSize:11,color:C.warn}}>
          {estado.errores.slice(0,5).map((e,i)=><div key={i}>· {e}</div>)}
          {estado.errores.length>5&&<div>… y {estado.errores.length-5} más</div>}
        </div>
      )}
    </div>
  );
}

function Integraciones() {
  const {yo,datos,recargar}=useContext(Ctx);
  // Última sincronización de cada tipo por proveedor (de la tabla de eventos)
  const ultimaSync=(nombrePv,tipo)=>{
    const ev=datos.eventos
      .filter(e=>e.tipo===tipo && (e.origen||"").startsWith(nombrePv))
      .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
    if(!ev) return null;
    return new Date(ev.created_at).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  };
  const Ultima=({pv,tipo})=>{
    const f=ultimaSync(pv,tipo);
    return <div style={{fontSize:10,color:C.mut,marginTop:3,minHeight:13}}>{f?"Última: "+f:"—"}</div>;
  };
  const simular=async()=>{
    const ct=datos.contratos.find(c=>{
      const pv=datos.proveedores.find(p=>p.id===datos.comercializadoras.find(cm=>cm.id===c.comercializadora_id)?.proveedor_id);
      return c.estado==="enviado"&&pv?.nombre==="Gana Energía";
    });
    if(ct){await db.upd("contratos","id=eq."+ct.id,{estado:"activado",fecha_activacion:hoy(),fecha_renovacion:addM(12)});await recargar("contratos");}
    await db.ins("eventos",{origen:"Gana Energía (webhook)",tipo:ct?"contrato.activado":"ping",ref:ct?.id||"—",detalle:ct?"Activación simulada CUPS "+ct.cups:"Evento de prueba"});
    await recargar("eventos");
  };
  return (
    <div style={{display:"grid",gap:16,gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))"}}>
      <Card style={{padding:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Plug size={16} style={{color:C.ok}}/><span style={{fontWeight:700}}>Gana Energía</span><Badge fg={C.ok} bg={C.okBg}>Webhook</Badge></div>
        <div style={{fontSize:13,color:C.mut,marginBottom:12}}>El proveedor envía cambios de estado a esta URL.</div>
        <Field label="URL del webhook"><Input readOnly value="https://inluzgas-server.onrender.com/api/webhooks/gana-energia"/></Field>
        <Btn kind="ghost" onClick={simular}>Simular evento entrante</Btn>
      </Card>
      {datos.proveedores.filter(pv=>pv.tipo==="api"&&pv.tiene_token).map(pv=>(
        <Card key={pv.id} style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Plug size={16} style={{color:C.gas}}/><span style={{fontWeight:700}}>{pv.nombre}</span><Badge fg={C.info} bg={C.infoBg}>iNergia · API</Badge></div>
          <div style={{fontSize:13,color:C.mut,marginBottom:12}}>{pv.nombre==="SALUTARIS"?"Solo Endesa.":"Varias comercializadoras."} Token en Supabase.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <BtnAsync style={{width:"100%",justifyContent:"center"}} cargandoTexto="Catálogo…" onClick={async()=>{
                try{const d=await POST("/api/inergia/"+pv.nombre+"/sincronizar-catalogo",{});
                if(d.ok){alert("✅ "+d.comercializadoras+" comercializadoras y "+d.productos+" productos importados");await recargar("comercializadoras");await recargar("productos");await recargar("eventos");}
                else alert("❌ "+d.error);}catch(e){alert("❌ "+e.message);}
              }}>Sincronizar catálogo</BtnAsync>
              <Ultima pv={pv.nombre} tipo="sync.catalogo"/>
            </div>
            <div>
              <BtnAsync style={{width:"100%",justifyContent:"center"}} cargandoTexto="Contratos…" onClick={async()=>{
                if(!window.confirm("Traer todos los contratos vigentes de "+pv.nombre+" desde iNergia? Creará los nuevos y actualizará los existentes.\n\nPuede tardar un rato si hay muchas comercializadoras."))return;
                try{const d=await POST("/api/inergia/"+pv.nombre+"/sincronizar-contratos",{});
                if(d.ok){alert("✅ Cartera: "+d.total+" contratos\n· "+d.creados+" contratos creados\n· "+d.actualizados+" actualizados\n· "+d.clientes_creados+" clientes nuevos creados\n· "+d.saltados_novigente+" no vigentes (baja/cancelado)"+(d.erroresCli?.length?"\n\n⚠️ "+d.erroresCli.length+" clientes con error:\n"+d.erroresCli.slice(0,5).map(e=>e.cif+": "+e.motivo).join("\n"):""));await recargar("contratos");await recargar("clientes");await recargar("eventos");}
                else alert("❌ "+d.error);}catch(e){alert("❌ "+e.message);}
              }}>Sincronizar contratos</BtnAsync>
              <Ultima pv={pv.nombre} tipo="sync.contratos"/>
            </div>
            <div>
              <BtnAsync style={{width:"100%",justifyContent:"center"}} cargandoTexto="Estados…" onClick={async()=>{
                try{const d=await POST("/api/inergia/"+pv.nombre+"/sync-estados",{});
                if(d.ok){alert("✅ "+d.revisados+" contratos revisados · "+d.cambios+" cambios ("+d.activados+" activados, "+d.rechazados+" rechazados)"+(d.errores?.length?" · "+d.errores.length+" errores":""));await recargar("contratos");await recargar("eventos");}
                else alert("❌ "+d.error);}catch(e){alert("❌ "+e.message);}
              }}>Sincronizar estados</BtnAsync>
              <Ultima pv={pv.nombre} tipo="sync.estados"/>
            </div>
            <div>
              <BtnAsync style={{width:"100%",justifyContent:"center"}} cargandoTexto="Liquidaciones…" onClick={async()=>{await db.ins("eventos",{origen:pv.nombre+" · iNergia",tipo:"sync.liquidaciones",ref:"—",detalle:"GET query=liquidaciones"});await recargar("eventos");}}>Consultar liquidaciones</BtnAsync>
              <Ultima pv={pv.nombre} tipo="sync.liquidaciones"/>
            </div>
          </div>
        </Card>
      ))}
      <Card style={{gridColumn:"1 / -1",padding:18}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Importar contratos desde Excel de iNergia</div>
        <ImportarContratos/>
      </Card>
      <Card style={{gridColumn:"1 / -1"}}>
        <div style={{padding:"12px 16px",fontWeight:700,fontSize:13,borderBottom:"1px solid "+C.line}}>Registro de eventos</div>
        {datos.eventos.map(ev=>(
          <div key={ev.id} style={{padding:"10px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,fontSize:13,borderTop:"1px solid "+C.line}}>
            <div><span style={{fontWeight:600}}>{ev.tipo}</span><span style={{color:C.mut}}> · {ev.origen}</span><div style={{fontSize:11,color:C.mut}}>{ev.detalle}</div></div>
            <div style={{fontSize:11,color:C.mut,whiteSpace:"nowrap"}}>{new Date(ev.created_at).toLocaleString("es-ES")}</div>
          </div>
        ))}
        {datos.eventos.length===0&&<div style={{padding:16,fontSize:13,color:C.mut}}>Sin eventos.</div>}
      </Card>
    </div>
  );
}

/* ============================================================
 * TICKETS
 * ============================================================ */
const TICKET_ESTADOS={abierto:{label:"Abierto",fg:"#1e40af",bg:"#dbeafe"},en_curso:{label:"En curso",fg:"#92400e",bg:"#fef3c7"},cerrado:{label:"Cerrado",fg:"#065f46",bg:"#d1fae5"}};
const TICKET_PRIORIDAD={alta:{label:"Alta",fg:"#991b1b",bg:"#fee2e2"},media:{label:"Media",fg:"#92400e",bg:"#fef3c7"},baja:{label:"Baja",fg:"#1e40af",bg:"#dbeafe"}};
const CANALES_DEFAULT=["Alfer","Salutaris","People","Processus","Gana","Repsol"];

// Selector de canal reutilizable con botón "+"
function CanalSel({value,onChange,datos,recargar}) {
  const canales=(datos.canales||[]).map(c=>c.nombre);
  const todos=[...new Set([...CANALES_DEFAULT,...canales])].sort();
  const addCanal=async()=>{
    const nombre=prompt("Nombre del nuevo canal:");
    if(!nombre||!nombre.trim())return;
    const existe=todos.some(c=>c.toLowerCase()===nombre.trim().toLowerCase());
    if(existe){alert("Ese canal ya existe.");return;}
    await db.ins("canales",[{nombre:nombre.trim()}]);
    await recargar("canales");
  };
  return (
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <Sel value={value} onChange={onChange} style={{flex:1}}>
        <option value="">— Seleccionar canal —</option>
        {todos.map(c=><option key={c} value={c}>{c}</option>)}
      </Sel>
      <button onClick={addCanal} title="Añadir canal" style={{fontFamily:FONT,fontSize:16,fontWeight:700,width:32,height:32,borderRadius:8,border:"1px solid "+C.line,background:"#fff",cursor:"pointer",color:C.ink,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    </div>
  );
}

function Tickets() {
  const {yo,datos,setSel,setModal}=useContext(Ctx);
  const [busq,setBusq]=useState("");
  const [fEstado,setFEstado]=useState("");
  const [fPrioridad,setFPrioridad]=useState("");
  const [fComercial,setFComercial]=useState("");
  const [orden,setOrden]=useState({campo:"created_at",dir:-1});

  // Comerciales solo ven sus propios tickets; Master/Manager ven todos
  const todosTickets=datos.tickets||[];
  const misTickets=can.verTodosTickets(yo)?todosTickets:todosTickets.filter(t=>t.creado_por===yo.id);

  const tks=misTickets.filter(t=>{
    if(fEstado&&t.estado!==fEstado) return false;
    if(fPrioridad&&t.prioridad!==fPrioridad) return false;
    if(fComercial&&t.creado_por!==fComercial) return false;
    if(!busq) return true;
    const cl=datos.clientes.find(x=>x.id===t.cliente_id);
    return ((cl?.razon_social||t.cliente_texto||"")+(t.asunto||"")+(t.cups_texto||"")).toLowerCase().includes(busq.toLowerCase());
  });
  const acc=(t,campo)=>{
    if(campo==="cliente") return datos.clientes.find(x=>x.id===t.cliente_id)?.razon_social||t.cliente_texto||"";
    if(campo==="cups"){const ct=datos.contratos.find(x=>x.id===t.contrato_id);return ct?.cups||t.cups_texto||"";}
    if(campo==="creador") return datos.usuarios.find(u=>u.id===t.creado_por)?.nombre||"";
    if(campo==="prioridad"){const ord={alta:1,media:2,baja:3};return ord[t.prioridad]||9;}
    return t[campo];
  };
  const sorted=sortBy(tks,orden.campo,orden.dir,acc);
  const notasCuenta=(tid)=>(datos.ticket_notas||[]).filter(n=>n.ticket_id===tid).length;

  // Comerciales que tienen tickets (para el filtro)
  const comercialesConTickets=[...new Set(todosTickets.map(t=>t.creado_por).filter(Boolean))];

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
          <Search size={14} style={{position:"absolute",left:10,top:10,color:C.mut}}/>
          <Input placeholder="Buscar cliente, CUPS o asunto…" value={busq} onChange={e=>setBusq(e.target.value)} style={{paddingLeft:30}}/>
        </div>
        <Sel value={fEstado} onChange={e=>setFEstado(e.target.value)} style={{width:160}}>
          <option value="">Todos los estados</option>
          {Object.entries(TICKET_ESTADOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </Sel>
        <Sel value={fPrioridad} onChange={e=>setFPrioridad(e.target.value)} style={{width:160}}>
          <option value="">Todas las prioridades</option>
          {Object.entries(TICKET_PRIORIDAD).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </Sel>
        {can.verTodosTickets(yo)&&(
          <Sel value={fComercial} onChange={e=>setFComercial(e.target.value)} style={{width:180}}>
            <option value="">Todos los comerciales</option>
            {comercialesConTickets.map(uid=>{
              const u=datos.usuarios.find(x=>x.id===uid);
              return <option key={uid} value={uid}>{u?.nombre||"—"}</option>;
            })}
          </Sel>
        )}
        <Btn onClick={()=>setModal({t:"nuevoTicket"})}><Plus size={14}/> Nuevo ticket</Btn>
      </div>
      <div style={{fontSize:12,color:C.mut,marginBottom:10}}>{sorted.length} ticket{sorted.length!==1?"s":""}</div>
      <div style={{overflowX:"auto",border:"1px solid "+C.line,borderRadius:10,background:C.panel}}>
        <table style={{width:"100%",minWidth:1000,borderCollapse:"collapse",whiteSpace:"nowrap"}}>
          <thead><tr style={{background:"#fafafa"}}>
            <THSort campo="created_at" orden={orden} setOrden={setOrden}>Fecha</THSort>
            <THSort campo="prioridad" orden={orden} setOrden={setOrden}>Prioridad</THSort>
            <THSort campo="cliente" orden={orden} setOrden={setOrden}>Cliente</THSort>
            <THSort campo="cups" orden={orden} setOrden={setOrden}>CUPS</THSort>
            <THSort campo="asunto" orden={orden} setOrden={setOrden}>Asunto</THSort>
            <THSort campo="estado" orden={orden} setOrden={setOrden}>Estado</THSort>
            <THSort campo="creador" orden={orden} setOrden={setOrden}>Creado por</THSort>
            <TH>Notas</TH>
          </tr></thead>
          <tbody>
            {sorted.map(t=>{
              const cl=datos.clientes.find(x=>x.id===t.cliente_id);
              const ct=datos.contratos.find(x=>x.id===t.contrato_id);
              const est=TICKET_ESTADOS[t.estado]||TICKET_ESTADOS.abierto;
              const pri=TICKET_PRIORIDAD[t.prioridad]||TICKET_PRIORIDAD.media;
              const creador=datos.usuarios.find(u=>u.id===t.creado_por);
              const nn=notasCuenta(t.id);
              return (
                <tr key={t.id} style={{cursor:"pointer"}} onClick={()=>setSel({tipo:"ticket",id:t.id})}>
                  <TD style={{fontSize:12,color:C.mut,fontVariantNumeric:"tabular-nums"}}>{new Date(t.created_at).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</TD>
                  <TD><Badge fg={pri.fg} bg={pri.bg}>{pri.label}</Badge></TD>
                  <TD style={{fontWeight:600,maxWidth:240,whiteSpace:"normal"}}>{cl?.razon_social||t.cliente_texto||"—"}</TD>
                  <TD style={{fontSize:12,fontVariantNumeric:"tabular-nums"}}>{ct?.cups||t.cups_texto||"—"}</TD>
                  <TD style={{maxWidth:300,whiteSpace:"normal"}}>{t.asunto}</TD>
                  <TD><Badge fg={est.fg} bg={est.bg}>{est.label}</Badge></TD>
                  <TD style={{fontSize:12,color:C.mut}}>{creador?.nombre||"—"}</TD>
                  <TD style={{fontSize:12,color:C.mut}}>{nn>0?nn+" nota"+(nn>1?"s":""):"—"}</TD>
                </tr>
              );
            })}
            {sorted.length===0&&<tr><TD colSpan={8} style={{color:C.mut,textAlign:"center",padding:20}}>Sin tickets. Crea el primero con «Nuevo ticket».</TD></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TicketDetalle({id,volver}) {
  const {yo,datos,recargar,setModal,setSel}=useContext(Ctx);
  const t=(datos.tickets||[]).find(x=>x.id===id);
  if(!t) return null;
  const cl=datos.clientes.find(x=>x.id===t.cliente_id);
  const ct=datos.contratos.find(x=>x.id===t.contrato_id);
  const notas=(datos.ticket_notas||[]).filter(n=>n.ticket_id===id);
  const est=TICKET_ESTADOS[t.estado]||TICKET_ESTADOS.abierto;
  const pri=TICKET_PRIORIDAD[t.prioridad]||TICKET_PRIORIDAD.media;
  const creador=datos.usuarios.find(u=>u.id===t.creado_por);
  const [nuevaNota,setNuevaNota]=useState("");
  const [editAsunto,setEditAsunto]=useState(false);
  const [editObs,setEditObs]=useState(false);
  const [asuntoTmp,setAsuntoTmp]=useState(t.asunto);
  const [obsTmp,setObsTmp]=useState(t.observaciones||"");
  const [guardando,setGuardando]=useState(false);

  const cambiarPrioridad=async(p)=>{
    await db.upd("tickets","id=eq."+id,{prioridad:p,updated_at:new Date().toISOString()});
    await db.ins("ticket_notas",{ticket_id:id,texto:"Prioridad cambiada a «"+(TICKET_PRIORIDAD[p]?.label||p)+"»",usuario:yo.nombre});
    await recargar("tickets");await recargar("ticket_notas");
  };

  const cambiarEstado=async(nuevoEst)=>{
    await db.upd("tickets","id=eq."+id,{estado:nuevoEst,updated_at:new Date().toISOString()});
    await db.ins("ticket_notas",{ticket_id:id,texto:"Estado cambiado a «"+(TICKET_ESTADOS[nuevoEst]?.label||nuevoEst)+"»",usuario:yo.nombre});
    await recargar("tickets");await recargar("ticket_notas");
  };

  const guardarAsunto=async()=>{
    await db.upd("tickets","id=eq."+id,{asunto:asuntoTmp,updated_at:new Date().toISOString()});
    await db.ins("ticket_notas",{ticket_id:id,texto:"Asunto modificado",usuario:yo.nombre});
    await recargar("tickets");await recargar("ticket_notas");setEditAsunto(false);
  };

  const guardarObs=async()=>{
    await db.upd("tickets","id=eq."+id,{observaciones:obsTmp,updated_at:new Date().toISOString()});
    await db.ins("ticket_notas",{ticket_id:id,texto:"Observaciones modificadas",usuario:yo.nombre});
    await recargar("tickets");await recargar("ticket_notas");setEditObs(false);
  };

  const addNota=async()=>{
    if(!nuevaNota.trim()) return;
    setGuardando(true);
    await db.ins("ticket_notas",{ticket_id:id,texto:nuevaNota.trim(),usuario:yo.nombre});
    await db.upd("tickets","id=eq."+id,{updated_at:new Date().toISOString()});
    await recargar("tickets");await recargar("ticket_notas");
    setNuevaNota("");setGuardando(false);
  };

  const eliminarTicket=async()=>{
    if(!confirm("¿Eliminar este ticket y todas sus notas?")) return;
    await db.del("ticket_notas","ticket_id=eq."+id);
    await db.del("tickets","id=eq."+id);
    await recargar("tickets");await recargar("ticket_notas");
    volver();
  };

  return (
    <div>
      <button style={{fontSize:13,fontWeight:600,color:C.mut,background:"none",border:"none",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:4}}
        onClick={volver}><ChevronLeft size={15}/> Volver a tickets</button>

      {/* Cabecera */}
      <Card style={{marginBottom:16,overflow:"hidden"}}>
        <div style={{padding:"18px 20px",borderBottom:"1px solid "+C.line,background:"#fafafa",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Ticket size={18} style={{color:C.ink}}/>
              <Badge fg={est.fg} bg={est.bg}>{est.label}</Badge>
              <Badge fg={pri.fg} bg={pri.bg}>{pri.label}</Badge>
              <span style={{fontSize:11,color:C.mut}}>Creado por <b>{creador?.nombre||"—"}</b> · {new Date(t.created_at).toLocaleString("es-ES")}</span>
              {t.updated_at&&t.updated_at!==t.created_at&&<span style={{fontSize:11,color:C.mut}}>· Mod. {new Date(t.updated_at).toLocaleString("es-ES")}</span>}
            </div>
            {editAsunto
              ?<div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Input value={asuntoTmp} onChange={e=>setAsuntoTmp(e.target.value)} style={{fontSize:16,fontWeight:700,flex:1,minWidth:300}}/>
                <Btn small onClick={guardarAsunto}>Guardar</Btn>
                <Btn small kind="ghost" onClick={()=>{setEditAsunto(false);setAsuntoTmp(t.asunto);}}>Cancelar</Btn>
              </div>
              :<div style={{fontSize:18,fontWeight:800,letterSpacing:-0.3,cursor:"pointer",display:"flex",alignItems:"center",gap:6}} onClick={()=>setEditAsunto(true)}>
                {t.asunto} <Pencil size={13} style={{color:C.mut}}/>
              </div>
            }
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,color:C.mut,textTransform:"uppercase",marginRight:2}}>Estado:</span>
            {Object.entries(TICKET_ESTADOS).map(([k,v])=>(
              <Btn key={k} small kind={t.estado===k?"primary":"ghost"} onClick={()=>t.estado!==k&&cambiarEstado(k)}>{v.label}</Btn>
            ))}
            <span style={{width:1,height:20,background:C.line,margin:"0 4px"}}/>
            <span style={{fontSize:10,fontWeight:700,color:C.mut,textTransform:"uppercase",marginRight:2}}>Prioridad:</span>
            {Object.entries(TICKET_PRIORIDAD).map(([k,v])=>(
              <Btn key={k} small kind={t.prioridad===k?"primary":"ghost"} onClick={()=>t.prioridad!==k&&cambiarPrioridad(k)}>{v.label}</Btn>
            ))}
            <span style={{width:1,height:20,background:C.line,margin:"0 4px"}}/>
            <Btn small kind="danger" onClick={eliminarTicket}><Trash2 size={12}/></Btn>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px 24px",padding:"18px 20px"}}>
          <CampoFicha label="Cliente" valor={
            cl ? <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setSel({tipo:"cliente",id:cl.id})}>{cl.razon_social}</span>
              : <span style={{fontStyle:"italic"}}>{t.cliente_texto||"—"} <Badge fg={C.warn} bg={C.warnBg}>Nuevo</Badge></span>
          }/>
          <CampoFicha label="CUPS" valor={
            ct ? <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setSel({tipo:"contrato",id:ct.id})}>{ct.cups}</span>
              : <span style={{fontStyle:"italic"}}>{t.cups_texto||"—"} {t.cups_texto&&<Badge fg={C.warn} bg={C.warnBg}>Nuevo</Badge>}</span>
          }/>
        </div>
      </Card>

      {/* Observaciones */}
      <Card style={{padding:0,marginBottom:16,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",background:"#f3f4f6",borderBottom:"1px solid "+C.line,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:16}}>Observaciones</div>
          {!editObs&&<Btn small kind="ghost" onClick={()=>{setObsTmp(t.observaciones||"");setEditObs(true);}}><Pencil size={11}/> Editar</Btn>}
        </div>
        <div style={{padding:"18px 20px"}}>
          {editObs
            ?<div>
              <textarea value={obsTmp} onChange={e=>setObsTmp(e.target.value)} rows={4}
                style={{fontFamily:FONT,fontSize:15,width:"100%",padding:12,borderRadius:8,border:"1px solid "+C.line,resize:"vertical"}}/>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Btn small onClick={guardarObs}>Guardar</Btn>
                <Btn small kind="ghost" onClick={()=>setEditObs(false)}>Cancelar</Btn>
              </div>
            </div>
            :<div style={{fontSize:15,lineHeight:1.6,color:t.observaciones?C.ink:C.mut,whiteSpace:"pre-wrap"}}>{t.observaciones||"Sin observaciones."}</div>
          }
        </div>
      </Card>

      {/* Registro de actividad */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",background:"#f3f4f6",borderBottom:"1px solid "+C.line}}>
          <div style={{fontWeight:700,fontSize:16}}>Registro de actividad</div>
        </div>
        <div style={{padding:"18px 20px"}}>
          {/* Añadir nota */}
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <Input placeholder="Añadir una nota…" value={nuevaNota} onChange={e=>setNuevaNota(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addNota()} style={{flex:1,fontSize:14,padding:"10px 14px"}}/>
            <Btn disabled={guardando||!nuevaNota.trim()} onClick={addNota}><MessageSquarePlus size={14}/> Añadir</Btn>
          </div>

          {/* Timeline */}
          {notas.length===0&&<div style={{fontSize:13,color:C.mut,padding:"8px 0"}}>Sin actividad registrada.</div>}
          {[...notas].reverse().map((n,i)=>(
            <div key={n.id} style={{padding:"14px 18px",marginBottom:8,borderRadius:10,background:i===0?"#eef2ff":"#f9fafb",border:"1px solid "+(i===0?"#c7d2fe":C.line)}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:i===0?15:14,fontWeight:700,color:i===0?C.info:C.mut}}>{n.usuario||"Sistema"}</span>
                <span style={{fontSize:i===0?14:13,color:C.mut,fontVariantNumeric:"tabular-nums"}}>
                  {new Date(n.created_at).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
              <div style={{fontSize:i===0?15:14,fontWeight:i===0?600:400,color:C.ink}}>{n.texto}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
 * RENOVACIONES
 * ============================================================ */
function Renovaciones() {
  const {yo,datos,recargar,setSel,setModal}=useContext(Ctx);
  const [filtro,setFiltro]=useState("default"); // "default" = futuros + vencidos hasta 60d
  const [busq,setBusq]=useState("");
  const [fCm,setFCm]=useState("");
  const [fComercial,setFComercial]=useState("");
  const [fDesde,setFDesde]=useState("");
  const [fHasta,setFHasta]=useState("");
  const [orden,setOrden]=useState({campo:"fecha_renovacion",dir:1});

  const hoy=new Date();
  const hoyStr=hoy.toISOString().slice(0,10);
  const activos=datos.contratos.filter(c=>["activado","Activo","Activo FTR","pdte_renovar"].includes(c.estado)&&c.fecha_renovacion);

  // Helpers
  const diasHasta=c=>Math.ceil((new Date(c.fecha_renovacion+"T00:00:00")-hoy)/86400000);
  const futuros=activos.filter(c=>c.fecha_renovacion>=hoyStr);
  const vencidos=activos.filter(c=>c.fecha_renovacion<hoyStr);
  const futuroEnDias=d=>futuros.filter(c=>diasHasta(c)<=d);
  const vencidoEnDias=d=>vencidos.filter(c=>diasHasta(c)>=-d); // vencido hace máximo d días

  // Tabs izquierda: próximos a vencer
  const tabsFuturo=[
    {id:"f30",label:"30 días",n:futuroEnDias(30).length,color:C.err},
    {id:"f60",label:"60 días",n:futuroEnDias(60).length,color:C.warn},
    {id:"f90",label:"90 días",n:futuroEnDias(90).length,color:C.info},
  ];
  // Tabs derecha: ya vencidos
  const tabsVencido=[
    {id:"v30",label:"30 días",n:vencidoEnDias(30).length,color:C.err},
    {id:"v60",label:"60 días",n:vencidoEnDias(60).length,color:C.warn},
    {id:"v90",label:"90 días",n:vencidoEnDias(90).length,color:C.info},
    {id:"vant",label:"Anteriores",n:vencidos.length,color:"#7c3aed"},
  ];

  // Resolver filtro → lista base
  let base;
  if(fDesde||fHasta){
    base=activos.filter(c=>{
      if(fDesde&&c.fecha_renovacion<fDesde) return false;
      if(fHasta&&c.fecha_renovacion>fHasta) return false;
      return true;
    });
  } else if(filtro==="f30") base=futuroEnDias(30);
  else if(filtro==="f60") base=futuroEnDias(60);
  else if(filtro==="f90") base=futuroEnDias(90);
  else if(filtro==="v30") base=vencidoEnDias(30);
  else if(filtro==="v60") base=vencidoEnDias(60);
  else if(filtro==="v90") base=vencidoEnDias(90);
  else if(filtro==="vant") base=vencidos;
  else if(filtro==="todos") base=activos;
  else {
    // Default: todos los futuros + vencidos hasta 60 días
    base=[...futuros,...vencidoEnDias(60)];
  }

  const lista=base.filter(c=>{
    if(fCm&&c.comercializadora_id!==fCm) return false;
    if(fComercial){const cl=datos.clientes.find(x=>x.id===c.cliente_id);if(cl?.comercial_id!==fComercial) return false;}
    if(!busq) return true;
    const cl=datos.clientes.find(x=>x.id===c.cliente_id);
    return (cl?.razon_social+c.cups).toLowerCase().includes(busq.toLowerCase());
  });

  const acc=(c,campo)=>{
    if(campo==="cliente") return datos.clientes.find(x=>x.id===c.cliente_id)?.razon_social||"";
    if(campo==="cif"){const cl=datos.clientes.find(x=>x.id===c.cliente_id);return cl?.cif||cl?.nif||"";}
    if(campo==="comercializadora") return datos.comercializadoras.find(x=>x.id===c.comercializadora_id)?.nombre||"";
    if(campo==="producto") return datos.productos.find(x=>x.id===c.producto_id)?.nombre||"";
    if(campo==="comercial"){const cl=datos.clientes.find(x=>x.id===c.cliente_id);return datos.usuarios.find(u=>u.id===cl?.comercial_id)?.nombre||"";}
    if(campo==="diasR") return diasHasta(c);
    return c[campo];
  };
  const sorted=sortBy(lista,orden.campo,orden.dir,acc);

  const comercializadorasConRenov=[...new Set(activos.map(c=>c.comercializadora_id))];
  const comercialesConRenov=[...new Set(activos.map(c=>{const cl=datos.clientes.find(x=>x.id===c.cliente_id);return cl?.comercial_id;}).filter(Boolean))];

  const TabBtn=({t})=>{
    const act=filtro===t.id&&!fDesde&&!fHasta;
    return (
      <button onClick={()=>{setFiltro(t.id);setFDesde("");setFHasta("");}}
        style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:20,cursor:"pointer",
          border:"1px solid "+(act?t.color:C.line),background:act?t.color:"#fff",color:act?"#fff":C.ink,
          display:"flex",alignItems:"center",gap:5}}>
        {t.label}
        <span style={{fontSize:10,fontWeight:700,background:act?"rgba(255,255,255,.25)":t.color+"18",
          color:act?"#fff":t.color,borderRadius:10,padding:"1px 6px"}}>{t.n}</span>
      </button>
    );
  };

  return (
    <div>
      {/* Filtros por días: izquierda futuros, derecha vencidos */}
      <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap",alignItems:"flex-start"}}>
        {/* Futuros */}
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C.mut,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Días hasta renovación</div>
          <div style={{display:"flex",gap:6}}>{tabsFuturo.map(t=><TabBtn key={t.id} t={t}/>)}</div>
        </div>
        {/* Separador */}
        <div style={{width:1,height:48,background:C.line,alignSelf:"center"}}/>
        {/* Vencidos */}
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C.mut,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Vencidos hace</div>
          <div style={{display:"flex",gap:6}}>{tabsVencido.map(t=><TabBtn key={t.id} t={t}/>)}</div>
        </div>
        {/* Separador */}
        <div style={{width:1,height:48,background:C.line,alignSelf:"center"}}/>
        {/* Todos + Default */}
        <div style={{display:"flex",gap:6,alignSelf:"flex-end"}}>
          <button onClick={()=>{setFiltro("default");setFDesde("");setFHasta("");}}
            style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:20,cursor:"pointer",
              border:"1px solid "+(filtro==="default"&&!fDesde&&!fHasta?C.ink:C.line),
              background:filtro==="default"&&!fDesde&&!fHasta?C.ink:"#fff",
              color:filtro==="default"&&!fDesde&&!fHasta?"#fff":C.ink}}>
            Vista general
          </button>
          <button onClick={()=>{setFiltro("todos");setFDesde("");setFHasta("");}}
            style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:20,cursor:"pointer",
              border:"1px solid "+(filtro==="todos"&&!fDesde&&!fHasta?C.grey:C.line),
              background:filtro==="todos"&&!fDesde&&!fHasta?C.grey:"#fff",
              color:filtro==="todos"&&!fDesde&&!fHasta?"#fff":C.ink}}>
            Todos <span style={{fontSize:10,opacity:.7}}>{activos.length}</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180,maxWidth:300}}>
          <Search size={14} style={{position:"absolute",left:10,top:10,color:C.mut}}/>
          <Input placeholder="Buscar cliente o CUPS…" value={busq} onChange={e=>setBusq(e.target.value)} style={{paddingLeft:30}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:11,fontWeight:600,color:C.mut}}>Desde</span>
          <Input type="date" value={fDesde} onChange={e=>setFDesde(e.target.value)} style={{width:140,fontSize:12}}/>
          <span style={{fontSize:11,fontWeight:600,color:C.mut}}>Hasta</span>
          <Input type="date" value={fHasta} onChange={e=>setFHasta(e.target.value)} style={{width:140,fontSize:12}}/>
          {(fDesde||fHasta)&&<Btn small kind="ghost" onClick={()=>{setFDesde("");setFHasta("");}}>✕</Btn>}
        </div>
        <Sel value={fCm} onChange={e=>setFCm(e.target.value)} style={{width:200}}>
          <option value="">Todas las comercializadoras</option>
          {comercializadorasConRenov.map(id=>{
            const cm=datos.comercializadoras.find(x=>x.id===id);
            return <option key={id} value={id}>{cm?.nombre}</option>;
          })}
        </Sel>
        <Sel value={fComercial} onChange={e=>setFComercial(e.target.value)} style={{width:180}}>
          <option value="">Todos los comerciales</option>
          {comercialesConRenov.map(id=>{
            const u=datos.usuarios.find(x=>x.id===id);
            return <option key={id} value={id}>{u?.nombre}</option>;
          })}
        </Sel>
        <div style={{fontSize:12,color:C.mut}}>{sorted.length} contratos</div>
      </div>

      {/* Tabla */}
      <div style={{overflowX:"auto",border:"1px solid "+C.line,borderRadius:10,background:C.panel}}>
        <table style={{width:"100%",minWidth:1100,borderCollapse:"collapse",whiteSpace:"nowrap"}}>
          <thead><tr style={{background:"#fafafa"}}>
            <THSort campo="cliente" orden={orden} setOrden={setOrden}>Cliente</THSort>
            <THSort campo="cif" orden={orden} setOrden={setOrden}>CIF/NIF</THSort>
            <THSort campo="cups" orden={orden} setOrden={setOrden}>CUPS</THSort>
            <THSort campo="tipo" orden={orden} setOrden={setOrden}>Tipo</THSort>
            <THSort campo="comercializadora" orden={orden} setOrden={setOrden}>Comercializadora</THSort>
            <THSort campo="producto" orden={orden} setOrden={setOrden}>Producto</THSort>
            <THSort campo="fecha_activacion" orden={orden} setOrden={setOrden}>Activación</THSort>
            <THSort campo="fecha_renovacion" orden={orden} setOrden={setOrden}>Renovación</THSort>
            <THSort campo="diasR" orden={orden} setOrden={setOrden}>Días</THSort>
            <THSort campo="comercial" orden={orden} setOrden={setOrden}>Comercial</THSort>
            <TH>Acciones</TH>
          </tr></thead>
          <tbody>
            {sorted.map(ct=>{
              const cl=datos.clientes.find(x=>x.id===ct.cliente_id);
              const cm=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
              const pr=datos.productos.find(x=>x.id===ct.producto_id);
              const com=datos.usuarios.find(u=>u.id===cl?.comercial_id);
              const diasR=diasHasta(ct);
              const colorDias=diasR<0?C.err:diasR<=30?C.err:diasR<=60?C.warn:C.info;
              return (
                <tr key={ct.id} style={{cursor:"pointer"}} onClick={()=>setSel({tipo:"contrato",id:ct.id})}>
                  <TD style={{fontWeight:600,maxWidth:220,whiteSpace:"normal"}}>{cl?.razon_social||"—"}</TD>
                  <TD style={{fontSize:12,color:C.mut,fontVariantNumeric:"tabular-nums"}}>{cl?.cif||cl?.nif||"—"}</TD>
                  <TD style={{fontSize:12,fontVariantNumeric:"tabular-nums"}}>{ct.cups}</TD>
                  <TD><TipoChip tipo={ct.tipo}/></TD>
                  <TD>{cm?.nombre}</TD>
                  <TD style={{fontSize:12,maxWidth:180,whiteSpace:"normal"}}>{pr?.nombre}</TD>
                  <TD style={{fontSize:12,color:C.mut}}>{fmtF(ct.fecha_activacion)}</TD>
                  <TD style={{fontSize:12,fontWeight:600}}>{fmtF(ct.fecha_renovacion)}</TD>
                  <TD><Badge fg={colorDias} bg={colorDias+"18"}>{diasR<0?"Vencido "+Math.abs(diasR)+"d":diasR+"d"}</Badge></TD>
                  <TD style={{fontSize:12,color:C.mut}}>{com?.nombre}</TD>
                  <TD>
                    <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                      <Btn small kind="ok" onClick={()=>setModal({t:"renovar",ct,modo:"cambio"})} title="Cambio de comercializadora">
                        <ArrowLeftRight size={12}/> Cambio comercializadora
                      </Btn>
                      <Btn small kind="ghost" onClick={()=>setModal({t:"renovar",ct,modo:"misma"})} title="Renovar misma comercializadora" style={{fontSize:11}}>
                        <RotateCcw size={11}/> Renovar
                      </Btn>
                    </div>
                  </TD>
                </tr>
              );
            })}
            {sorted.length===0&&<tr><TD colSpan={11} style={{color:C.mut,textAlign:"center",padding:20}}>Sin contratos próximos a renovar en este filtro.</TD></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
 * MODALES
 * ============================================================ */
function ModalNuevoCliente() {
  const {yo,datos,recargar,setModal}=useContext(Ctx);
  const [f,setF]=useState({tipo_titular:"empresa",cif:"",razon_social:"",contacto:"",ape1:"",ape2:"",representante:"",dni_representante:"",telefono:"",telefono2:"",email:"",tipo_via:"Calle",direccion:"",numero:"",planta:"",letra:"",aclarador:"",codpostal:"",provincia:"",localidad:"",observaciones:"",comercial_id:yo?.id||""});
  const [errDoc,setErrDoc]=useState("");
  const [munis,setMunis]=useState([]);
  const [cargandoCP,setCargandoCP]=useState(false);
  const esFisica=f.tipo_titular==="fisica";
  const labelDoc=esFisica?"NIF":"CIF";

  const validarDoc=val=>{
    const v=val.toUpperCase().trim(); if(!v){setErrDoc("");return;}
    if(esFisica){
      if(!/^[0-9XYZ]/.test(v)){setErrDoc("Un NIF debe empezar por número o X/Y/Z");return;}
      if(v.length>=9&&!validarNIF(v)){setErrDoc("NIF no válido — revisa el dígito de control");return;}
    }else{
      if(!/^[ABCDEFGHJNPQRSUVW]/i.test(v)){setErrDoc("Un CIF debe empezar por letra (A-W)");return;}
      if(v.length>=9&&!validarCIF(v)){setErrDoc("CIF no válido — revisa el dígito de control");return;}
    }
    setErrDoc("");
  };

  const buscarCP=async cp=>{
    if(cp.length!==5)return; setCargandoCP(true);
    try{const r=await fetch("https://api.zippopotam.us/es/"+cp);if(!r.ok){setCargandoCP(false);return;}
    const d=await r.json(); const prov=d.places?.[0]?.state||""; const ms=(d.places||[]).map(p=>p["place name"]);
    setF(prev=>({...prev,provincia:prov,localidad:ms[0]||""})); setMunis(ms);
    }catch{}setCargandoCP(false);
  };

  const guardar=async()=>{
    if(errDoc)return;
    await db.ins("clientes",{...f,creado_por:yo.id});
    await recargar("clientes"); setModal(null);
  };

  return (
    <Modal title="Nuevo cliente" onClose={()=>setModal(null)} wide>
      <Sec label="Tipo de titular"/>
      <Field label="Tipo de titular">
        <Sel value={f.tipo_titular} onChange={e=>{setF({...f,tipo_titular:e.target.value,cif:""});setErrDoc("");}}>
          <option value="empresa">Empresa / Sociedad</option>
          <option value="fisica">Persona física (autónomo)</option>
          <option value="organismo">Organismo público</option>
        </Sel>
      </Field>
      <Sec label="Datos del titular"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label={labelDoc}>
          <Input value={f.cif} onChange={e=>{setF({...f,cif:e.target.value.toUpperCase()});validarDoc(e.target.value);}} style={errDoc?{borderColor:C.err}:{}}/>
          {errDoc&&<div style={{fontSize:11,color:C.err,marginTop:3}}>{errDoc}</div>}
        </Field>
        <Field label={esFisica?"Nombre":"Razón social"}><Input value={f.razon_social} onChange={e=>setF({...f,razon_social:e.target.value})}/></Field>
        {esFisica&&<><Field label="Primer apellido"><Input value={f.ape1} onChange={e=>setF({...f,ape1:e.target.value})}/></Field><Field label="Segundo apellido"><Input value={f.ape2} onChange={e=>setF({...f,ape2:e.target.value})}/></Field></>}
        {!esFisica&&<><Field label="Nombre del representante"><Input value={f.representante} onChange={e=>setF({...f,representante:e.target.value})}/></Field><Field label="DNI del representante"><Input value={f.dni_representante} onChange={e=>setF({...f,dni_representante:e.target.value.toUpperCase()})}/></Field></>}
        <Field label="Persona de contacto"><Input value={f.contacto} onChange={e=>setF({...f,contacto:e.target.value})}/></Field>
        <Field label="Teléfono"><Input value={f.telefono} onChange={e=>setF({...f,telefono:e.target.value})}/></Field>
        <Field label="Móvil"><Input value={f.telefono2} onChange={e=>setF({...f,telefono2:e.target.value})}/></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></Field>
      </div>
      <Sec label="Dirección del titular"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:12}}>
        <Field label="Tipo de vía"><Sel value={f.tipo_via} onChange={e=>setF({...f,tipo_via:e.target.value})}>{TIPOS_VIA.map(t=><option key={t}>{t}</option>)}</Sel></Field>
        <Field label="Nombre de la vía"><Input value={f.direccion} onChange={e=>setF({...f,direccion:e.target.value})}/></Field>
        <Field label="Número"><Input value={f.numero} onChange={e=>setF({...f,numero:e.target.value})}/></Field>
        <Field label="Planta"><Input value={f.planta} onChange={e=>setF({...f,planta:e.target.value})}/></Field>
        <Field label="Letra / Puerta"><Input value={f.letra} onChange={e=>setF({...f,letra:e.target.value})}/></Field>
        <Field label="Aclarador"><Input value={f.aclarador} onChange={e=>setF({...f,aclarador:e.target.value})}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Field label="Código postal"><Input value={f.codpostal} maxLength={5} onChange={e=>{const v=e.target.value.replace(/\D/g,"");setF({...f,codpostal:v,provincia:"",localidad:""});setMunis([]);}} onBlur={e=>buscarCP(e.target.value)}/>{cargandoCP&&<div style={{fontSize:11,color:C.mut,marginTop:3}}>Buscando…</div>}</Field>
        <Field label="Provincia"><Input value={f.provincia} readOnly style={{background:C.greyBg}}/></Field>
        <Field label="Municipio">{munis.length>1?<Sel value={f.localidad} onChange={e=>setF({...f,localidad:e.target.value})}>{munis.map(m=><option key={m}>{m}</option>)}</Sel>:<Input value={f.localidad} onChange={e=>setF({...f,localidad:e.target.value})}/>}</Field>
      </div>
      <Sec label="Otros"/>
      <Field label="Observaciones"><Input value={f.observaciones} onChange={e=>setF({...f,observaciones:e.target.value})}/></Field>
      <Field label="Comercial asignado">
        <Sel value={f.comercial_id} disabled={!can.crearParaOtros(yo)} onChange={e=>setF({...f,comercial_id:e.target.value})}>
          {(can.crearParaOtros(yo)?datos.usuarios:[yo]).map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}
        </Sel>
      </Field>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Btn disabled={!f.razon_social||!f.cif||!!errDoc} onClick={guardar}>Crear cliente</Btn>
        {errDoc&&<span style={{fontSize:11,color:C.err}}>{errDoc}</span>}
      </div>
    </Modal>
  );
}

function ModalNuevoContrato() {
  const {yo,datos,recargar,setModal,modal}=useContext(Ctx);
  const clientesV=datos.clientes.filter(c=>can.verTodasLiq(yo)||c.comercial_id===yo?.id);
  const [tipo,setTipo]=useState("luz");
  const [f,setF]=useState({
    cliente_id:modal.clienteId||clientesV[0]?.id||"",
    comercializadora_luz:"",producto_luz:"",cups_luz:"",tiposol_luz:"C1",
    potencia_p1:"",potencia_p2:"",potencia_p3:"",potencia_p4:"",potencia_p5:"",potencia_p6:"",
    comercializadora_gas:"",producto_gas:"",cups_gas:"",tiposol_gas:"C1",
    permanencia:"NO",renovacion_auto:"NO",cambio_tit:"NO",cambio_pot:"NO",
    facturae:1,iban:"",observaciones:"",cnae:"",autoconsumo:"NO",servicios:"",canal:"",
    duracion_meses:12,
    tipo_via_cups:"Calle",direccion_cups:"",numero_cups:"",planta_cups:"",letra_cups:"",aclarador_cups:"",
    codpostal_cups:"",provincia_cups:"",localidad_cups:"",
  });
  const [munisCups,setMunisCups]=useState([]);
  const [cargandoCP,setCargandoCP]=useState(false);

  const cl=datos.clientes.find(c=>c.id===f.cliente_id);
  const cmLuz=datos.comercializadoras.filter(cm=>datos.productos.some(p=>p.comercializadora_id===cm.id&&p.tipo==="luz"));
  const cmGas=datos.comercializadoras.filter(cm=>datos.productos.some(p=>p.comercializadora_id===cm.id&&p.tipo==="gas"));
  const prodsLuz=datos.productos.filter(p=>p.comercializadora_id===f.comercializadora_luz&&p.tipo==="luz");
  const prodsGas=datos.productos.filter(p=>p.comercializadora_id===f.comercializadora_gas&&p.tipo==="gas");
  const prIdLuz=prodsLuz.some(p=>p.id===f.producto_luz)?f.producto_luz:prodsLuz[0]?.id||"";
  const prIdGas=prodsGas.some(p=>p.id===f.producto_gas)?f.producto_gas:prodsGas[0]?.id||"";
  const prLuz=datos.productos.find(p=>p.id===prIdLuz);
  const prGas=datos.productos.find(p=>p.id===prIdGas);
  const esLuz=tipo==="luz"||tipo==="dual";
  const esGas=tipo==="gas"||tipo==="dual";

  const buscarCPCups=async cp=>{
    if(cp.length!==5)return; setCargandoCP(true);
    try{const r=await fetch("https://api.zippopotam.us/es/"+cp);if(!r.ok){setCargandoCP(false);return;}
    const d=await r.json();setF(prev=>({...prev,provincia_cups:d.places?.[0]?.state||"",localidad_cups:d.places?.[0]?.["place name"]||""}));
    setMunisCups((d.places||[]).map(p=>p["place name"]));}catch{}setCargandoCP(false);
  };

  const copiarTitular=()=>{
    if(!cl)return;
    setF(prev=>({...prev,tipo_via_cups:cl.tipo_via||"Calle",direccion_cups:cl.direccion||"",numero_cups:cl.numero||"",planta_cups:cl.planta||"",letra_cups:cl.letra||"",aclarador_cups:cl.aclarador||"",codpostal_cups:cl.codpostal||"",provincia_cups:cl.provincia||"",localidad_cups:cl.localidad||""}));
    if(cl.codpostal?.length===5)buscarCPCups(cl.codpostal);
  };

  const guardar=async()=>{
    const base={cliente_id:f.cliente_id,estado:"borrador",id_inergia:null,duracion_meses:f.duracion_meses,permanencia:f.permanencia,renovacion_auto:f.renovacion_auto,cambio_tit:f.cambio_tit,cambio_pot:f.cambio_pot,facturae:f.facturae,iban:f.iban,observaciones:f.observaciones,cnae:f.cnae,autoconsumo:f.autoconsumo,servicios:f.servicios,canal:f.canal,calle_cups:f.direccion_cups,numero_cups:f.numero_cups,planta_cups:f.planta_cups,puerta_cups:f.letra_cups,aclarador_cups:f.aclarador_cups,codpostal_cups:f.codpostal_cups,provincia_cups:f.provincia_cups,localidad_cups:f.localidad_cups};
    if(esLuz)await db.ins("contratos",{...base,tipo:"luz",cups:f.cups_luz,comercializadora_id:f.comercializadora_luz,producto_id:prIdLuz,tiposol:f.tiposol_luz,potencia_p1:parseFloat(f.potencia_p1)||0,potencia_p2:parseFloat(f.potencia_p2)||0,potencia_p3:parseFloat(f.potencia_p3)||0,potencia_p4:parseFloat(f.potencia_p4)||0,potencia_p5:parseFloat(f.potencia_p5)||0,potencia_p6:parseFloat(f.potencia_p6)||0});
    if(esGas)await db.ins("contratos",{...base,tipo:"gas",cups:f.cups_gas,comercializadora_id:f.comercializadora_gas,producto_id:prIdGas,tiposol:f.tiposol_gas});
    await recargar("contratos"); setModal(null);
  };

  return (
    <Modal title="Alta de contrato" onClose={()=>setModal(null)} wide>
      <Sec label="Tipo de suministro"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Suministro"><Sel value={tipo} onChange={e=>setTipo(e.target.value)}><option value="luz">⚡ Luz</option><option value="gas">🔥 Gas</option><option value="dual">⚡🔥 Dual (Luz + Gas)</option></Sel></Field>
        <Field label="Cliente"><Sel value={f.cliente_id} onChange={e=>setF({...f,cliente_id:e.target.value})} disabled={!!modal.clienteId}>{clientesV.map(c=><option key={c.id} value={c.id}>{c.razon_social}</option>)}</Sel></Field>
      </div>
      {cl&&<div style={{fontSize:12,color:C.ink,marginBottom:8,padding:"6px 10px",background:C.infoBg,borderRadius:6,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}><span style={{color:C.mut}}>{cl.cif||cl.nif}</span><TelWhatsapp tel={cl.telefono} fontSize={12}/><EmailLink email={cl.email} fontSize={12}/></div>}

      {esLuz&&<>
        <Sec label="⚡ Contrato de luz"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="CUPS Luz"><Input placeholder="ES0021…" value={f.cups_luz} onChange={e=>setF({...f,cups_luz:e.target.value.toUpperCase().replace(/\s/g,"")})} style={f.cups_luz&&!validarCUPS(f.cups_luz)?{borderColor:C.err}:{}}/>{f.cups_luz&&!validarCUPS(f.cups_luz)&&<div style={{fontSize:11,color:C.err,marginTop:2}}>CUPS no válido (dígitos de control)</div>}</Field>
          <Field label="Tipo solicitud"><Sel value={f.tiposol_luz} onChange={e=>setF({...f,tiposol_luz:e.target.value})}><option value="C1">C1 · Cambio comercializadora</option><option value="A">A · Alta nueva</option></Sel></Field>
          <Field label="Comercializadora Luz"><Sel value={f.comercializadora_luz} onChange={e=>setF({...f,comercializadora_luz:e.target.value,producto_luz:""})}><option value="">Selecciona…</option>{cmLuz.map(cm=><option key={cm.id} value={cm.id}>{cm.nombre}</option>)}</Sel></Field>
          <Field label="Producto Luz"><Sel value={prIdLuz} onChange={e=>setF({...f,producto_luz:e.target.value})}><option value="">Selecciona…</option>{prodsLuz.map(p=><option key={p.id} value={p.id}>{p.nombre} · {p.tarifa}</option>)}</Sel></Field>
        </div>
        {prLuz&&<div style={{fontSize:11,color:C.mut,marginBottom:8,padding:"6px 10px",background:C.greyBg,borderRadius:6}}>{prLuz.tipo_precio} · {prLuz.sector} · Tarifa {prLuz.tarifa}</div>}
        <div style={{fontSize:11,fontWeight:600,color:C.mut,marginBottom:6}}>POTENCIAS (kW)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:12}}>
          {["P1","P2","P3","P4","P5","P6"].map((p,i)=><Field key={p} label={p}><Input type="number" step="0.001" placeholder="0" value={f["potencia_p"+(i+1)]} onChange={e=>setF({...f,["potencia_p"+(i+1)]:e.target.value})}/></Field>)}
        </div>
      </>}

      {esGas&&<>
        <Sec label="🔥 Contrato de gas"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="CUPS Gas"><Input placeholder="ES0221…" value={f.cups_gas} onChange={e=>setF({...f,cups_gas:e.target.value.toUpperCase().replace(/\s/g,"")})} style={f.cups_gas&&!validarCUPS(f.cups_gas)?{borderColor:C.err}:{}}/>{f.cups_gas&&!validarCUPS(f.cups_gas)&&<div style={{fontSize:11,color:C.err,marginTop:2}}>CUPS no válido (dígitos de control)</div>}</Field>
          <Field label="Tipo solicitud"><Sel value={f.tiposol_gas} onChange={e=>setF({...f,tiposol_gas:e.target.value})}><option value="C1">C1 · Cambio comercializadora</option><option value="A">A · Alta nueva</option></Sel></Field>
          <Field label="Comercializadora Gas"><Sel value={f.comercializadora_gas} onChange={e=>setF({...f,comercializadora_gas:e.target.value,producto_gas:""})}><option value="">Selecciona…</option>{cmGas.map(cm=><option key={cm.id} value={cm.id}>{cm.nombre}</option>)}</Sel></Field>
          <Field label="Producto Gas"><Sel value={prIdGas} onChange={e=>setF({...f,producto_gas:e.target.value})}><option value="">Selecciona…</option>{prodsGas.map(p=><option key={p.id} value={p.id}>{p.nombre} · {p.tarifa}</option>)}</Sel></Field>
        </div>
        {prGas&&<div style={{fontSize:11,color:C.mut,marginBottom:8,padding:"6px 10px",background:C.greyBg,borderRadius:6}}>{prGas.tipo_precio} · {prGas.sector} · Tarifa {prGas.tarifa}</div>}
      </>}

      <Sec label="Condiciones del contrato"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <Field label="Duración (meses)"><Input type="number" value={f.duracion_meses} onChange={e=>setF({...f,duracion_meses:parseInt(e.target.value)||12})}/></Field>
        <Field label="Permanencia"><Sel value={f.permanencia} onChange={e=>setF({...f,permanencia:e.target.value})}><option>NO</option><option>SI</option></Sel></Field>
        <Field label="Renovación auto"><Sel value={f.renovacion_auto} onChange={e=>setF({...f,renovacion_auto:e.target.value})}><option>NO</option><option>SI</option></Sel></Field>
        <Field label="Cambio titular"><Sel value={f.cambio_tit} onChange={e=>setF({...f,cambio_tit:e.target.value})}><option>NO</option><option>SI</option></Sel></Field>
        <Field label="Cambio potencia"><Sel value={f.cambio_pot} onChange={e=>setF({...f,cambio_pot:e.target.value})}><option>NO</option><option>SI</option></Sel></Field>
        <Field label="Autoconsumo"><Sel value={f.autoconsumo} onChange={e=>setF({...f,autoconsumo:e.target.value})}><option>NO</option><option>SI</option></Sel></Field>
        <Field label="Factura electrónica"><Sel value={String(f.facturae)} onChange={e=>setF({...f,facturae:parseInt(e.target.value)})}><option value="1">Sí</option><option value="0">No</option></Sel></Field>
        <Field label="CNAE"><Input placeholder="4711" value={f.cnae} onChange={e=>setF({...f,cnae:e.target.value})}/></Field>
        <Field label="Canal"><CanalSel value={f.canal} onChange={e=>setF({...f,canal:e.target.value})} datos={datos} recargar={recargar}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="IBAN"><Input placeholder="ES00…" value={f.iban} onChange={e=>setF({...f,iban:e.target.value})}/></Field>
        <Field label="Servicios"><Input value={f.servicios} onChange={e=>setF({...f,servicios:e.target.value})}/></Field>
      </div>

      <Sec label="Dirección del punto de suministro" extra={<Btn kind="ghost" small onClick={copiarTitular} disabled={!cl}>Copiar del titular</Btn>}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:12}}>
        <Field label="Tipo de vía"><Sel value={f.tipo_via_cups} onChange={e=>setF({...f,tipo_via_cups:e.target.value})}>{TIPOS_VIA.map(t=><option key={t}>{t}</option>)}</Sel></Field>
        <Field label="Nombre de la vía"><Input value={f.direccion_cups} onChange={e=>setF({...f,direccion_cups:e.target.value})}/></Field>
        <Field label="Número"><Input value={f.numero_cups} onChange={e=>setF({...f,numero_cups:e.target.value})}/></Field>
        <Field label="Planta"><Input value={f.planta_cups} onChange={e=>setF({...f,planta_cups:e.target.value})}/></Field>
        <Field label="Letra / Puerta"><Input value={f.letra_cups} onChange={e=>setF({...f,letra_cups:e.target.value})}/></Field>
        <Field label="Aclarador"><Input value={f.aclarador_cups} onChange={e=>setF({...f,aclarador_cups:e.target.value})}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Field label="Código postal"><Input value={f.codpostal_cups} maxLength={5} onChange={e=>{const v=e.target.value.replace(/\D/g,"");setF({...f,codpostal_cups:v,provincia_cups:"",localidad_cups:""});setMunisCups([]);}} onBlur={e=>buscarCPCups(e.target.value)}/>{cargandoCP&&<div style={{fontSize:11,color:C.mut}}>Buscando…</div>}</Field>
        <Field label="Provincia"><Input value={f.provincia_cups} readOnly style={{background:C.greyBg}}/></Field>
        <Field label="Municipio">{munisCups.length>1?<Sel value={f.localidad_cups} onChange={e=>setF({...f,localidad_cups:e.target.value})}>{munisCups.map(m=><option key={m}>{m}</option>)}</Sel>:<Input value={f.localidad_cups} onChange={e=>setF({...f,localidad_cups:e.target.value})}/>}</Field>
      </div>
      <Field label="Observaciones"><Input value={f.observaciones} onChange={e=>setF({...f,observaciones:e.target.value})}/></Field>
      <Btn disabled={
        ((!esLuz||!f.cups_luz||!prIdLuz)&&(!esGas||!f.cups_gas||!prIdGas))
        ||(esLuz&&f.cups_luz&&!validarCUPS(f.cups_luz))
        ||(esGas&&f.cups_gas&&!validarCUPS(f.cups_gas))
      } onClick={guardar}>
        Crear contrato{tipo==="dual"?" (Luz + Gas)":""}
      </Btn>
    </Modal>
  );
}

function ModalEditarContrato() {
  const {datos,recargar,setModal,modal}=useContext(Ctx);
  const ct=modal.ct;
  const [f,setF]=useState({cups:ct.cups,comercializadora_id:ct.comercializadora_id,producto_id:ct.producto_id});
  const prods=datos.productos.filter(p=>p.comercializadora_id===f.comercializadora_id);
  const prId=prods.some(p=>p.id===f.producto_id)?f.producto_id:prods[0]?.id||"";
  return (
    <Modal title="Editar contrato" onClose={()=>setModal(null)}>
      <Field label="CUPS"><Input value={f.cups} onChange={e=>setF({...f,cups:e.target.value.toUpperCase().replace(/\s/g,"")})} style={f.cups&&!validarCUPS(f.cups)?{borderColor:C.err}:{}}/>{f.cups&&!validarCUPS(f.cups)&&<div style={{fontSize:11,color:C.err,marginTop:2}}>CUPS no válido (dígitos de control)</div>}</Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Comercializadora"><Sel value={f.comercializadora_id} onChange={e=>setF({...f,comercializadora_id:e.target.value,producto_id:""})}>{datos.comercializadoras.map(cm=><option key={cm.id} value={cm.id}>{cm.nombre}</option>)}</Sel></Field>
        <Field label="Producto"><Sel value={prId} onChange={e=>setF({...f,producto_id:e.target.value})}>{prods.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</Sel></Field>
      </div>
      <Btn disabled={!f.cups||!validarCUPS(f.cups)} onClick={async()=>{const pr=datos.productos.find(p=>p.id===prId);await db.upd("contratos","id=eq."+ct.id,{cups:f.cups,comercializadora_id:f.comercializadora_id,producto_id:prId,tipo:pr.tipo});await recargar("contratos");setModal(null);}}>Guardar</Btn>
    </Modal>
  );
}

function ModalEnviarInergia() {
  const {datos,recargar,setModal,modal}=useContext(Ctx);
  const [enviando,setEnviando]=useState(false);
  const [resultado,setResultado]=useState(null);
  const ct=datos.contratos.find(x=>x.id===modal.ct.id);
  const cl=datos.clientes.find(x=>x.id===ct?.cliente_id);
  const com=datos.usuarios.find(x=>x.id===cl?.comercial_id);
  const pr=datos.productos.find(x=>x.id===ct?.producto_id);
  const cm=datos.comercializadoras.find(x=>x.id===ct?.comercializadora_id);
  const pv=datos.proveedores.find(x=>x.id===cm?.proveedor_id);
  const cid=datos.crm_ids.find(x=>x.usuario_id===com?.id&&x.proveedor_id===pv?.id);
  const payload={suministro:ct?.tipo==="gas"?"GAS":"LUZ",cups:ct?.cups||"",dni:cl?.cif||"",crm_id:cid?.crm_id||"",nombre:cl?.razon_social||"",ape1:cl?.ape1||"",ape2:cl?.ape2||"",calle:cl?.tipo_via?cl.tipo_via+" "+cl.direccion:cl?.direccion||"",numero:cl?.numero||"",codpostal:cl?.codpostal||"",localidad:cl?.localidad||"",representante:cl?.representante||cl?.contacto||"",cif_representante:cl?.dni_representante||"",telefono:cl?.telefono||"",email:cl?.email||"",iban:ct?.iban||"",cambio_tit:ct?.cambio_tit||"NO",cambio_pot:ct?.cambio_pot||"NO",permanencia:ct?.permanencia||"NO",facturae:ct?.facturae??1,autoconsumo:ct?.autoconsumo||"NO",servicios:ct?.servicios||"",canal:ct?.canal||"",cnae:ct?.cnae||"",tarifa:pr?.tarifa||"",potencia_contratada:ct?.potencia_p1||0,potencia_contratada_p2:ct?.potencia_p2||0,potencia_contratada_p3:ct?.potencia_p3||0,potencia_contratada_p4:ct?.potencia_p4||0,potencia_contratada_p5:ct?.potencia_p5||0,potencia_contratada_p6:ct?.potencia_p6||0,id_producto:pr?.id_inergia||pr?.id_inergia_int||0,tiposol:ct?.tiposol||"C1",observaciones:ct?.observaciones||"Alta desde CRM INLUZGAS",calle_cups:ct?.tipo_via_cups?ct.tipo_via_cups+" "+ct.direccion_cups:ct?.direccion_cups||"",numero_cups:ct?.numero_cups||"",codpostal_cups:ct?.codpostal_cups||"",localidad_cups:ct?.localidad_cups||"",_contrato_id:ct?.id};
  const faltan=[["cups","CUPS"],["dni","CIF del titular"],["nombre","Razón social"],["crm_id","ID del comercial en "+pv?.nombre],["tarifa","Tarifa"],["id_producto","ID producto en iNergia"]].filter(([k])=>!payload[k]||payload[k]===0).map(([,l])=>l);
  const enviar=async()=>{
    setEnviando(true);setResultado(null);
    try{const d=await POST("/api/inergia/"+pv.nombre+"/newctr",payload);
    if(d.ok){setResultado({ok:true,msg:"✅ Enviado. ID iNergia: "+d.idInergia});await recargar("contratos");await recargar("eventos");}
    else setResultado({ok:false,msg:"❌ "+d.error});}
    catch(e){setResultado({ok:false,msg:"❌ "+e.message});}
    setEnviando(false);
  };
  return (
    <Modal title={"Enviar a "+pv?.nombre+" (iNergia)"} onClose={()=>setModal(null)} wide>
      <div style={{fontSize:13,color:C.mut,marginBottom:12}}>POST https://inergia.app/api/newctr · el token lo inyecta el servidor automáticamente.</div>
      {faltan.length>0&&<div style={{background:C.warnBg,color:C.warn,borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}><b>Faltan datos:</b> {faltan.join(" · ")}</div>}
      <pre style={{background:"#0F1A14",color:"#C8E6D3",borderRadius:8,padding:12,fontSize:11,lineHeight:1.5,overflow:"auto",maxHeight:240,marginBottom:12}}>{JSON.stringify({...payload,clave:"[token en servidor]"},null,2)}</pre>
      {resultado&&<div style={{background:resultado.ok?C.okBg:C.errBg,color:resultado.ok?C.ok:C.err,borderRadius:8,padding:"8px 12px",fontSize:13,marginBottom:12}}>{resultado.msg}</div>}
      <div style={{display:"flex",gap:8}}>
        {!resultado?.ok&&<Btn disabled={faltan.length>0||enviando} onClick={enviar}><Send size={14}/> {enviando?"Enviando…":"Enviar a iNergia"}</Btn>}
        <Btn kind="ghost" onClick={()=>setModal(null)}>{resultado?.ok?"Cerrar":"Cancelar"}</Btn>
      </div>
    </Modal>
  );
}

function ModalNuevaLiq() {
  const {datos,recargar,setModal,setSel}=useContext(Ctx);
  const [f,setF]=useState({proveedor_id:datos.proveedores[0]?.id||"",periodo:""});
  return (
    <Modal title="Nueva liquidación" onClose={()=>setModal(null)}>
      <Field label="Proveedor"><Sel value={f.proveedor_id} onChange={e=>setF({...f,proveedor_id:e.target.value})}>{datos.proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</Sel></Field>
      <Field label="Periodo"><Input placeholder="Ej. Julio 2026" value={f.periodo} onChange={e=>setF({...f,periodo:e.target.value})}/></Field>
      <Btn disabled={!f.periodo} onClick={async()=>{const d=await db.ins("liquidaciones",{...f,fecha:hoy(),estado:"pendiente"});await recargar("liquidaciones");setModal(null);if(d?.data?.[0]?.id)setSel({tipo:"liq",id:d.data[0].id});}}>Crear liquidación</Btn>
    </Modal>
  );
}

function ModalNuevaLinea() {
  const {datos,recargar,setModal,modal}=useContext(Ctx);
  const liq=datos.liquidaciones.find(x=>x.id===modal.liqId);
  const cts=datos.contratos.filter(c=>{const pv=datos.proveedores.find(p=>p.id===datos.comercializadoras.find(cm=>cm.id===c.comercializadora_id)?.proveedor_id);return pv?.id===liq?.proveedor_id&&["activado","baja"].includes(c.estado);});
  const [f,setF]=useState({contrato_id:cts[0]?.id||"",concepto:"Comisión",importe:"",pct_override:""});
  const prev=datos.productos.find(p=>p.id===datos.contratos.find(c=>c.id===f.contrato_id)?.producto_id)?.comision_bruta;
  return (
    <Modal title="Añadir línea" onClose={()=>setModal(null)}>
      <Field label="Contrato"><Sel value={f.contrato_id} onChange={e=>setF({...f,contrato_id:e.target.value})}>{cts.map(c=>{const cl=datos.clientes.find(x=>x.id===c.cliente_id);return<option key={c.id} value={c.id}>{cl?.razon_social} · {c.cups}</option>;})}</Sel></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Concepto"><Sel value={f.concepto} onChange={e=>setF({...f,concepto:e.target.value})}>{CONCEPTOS.map(c=><option key={c}>{c}</option>)}</Sel></Field>
        <Field label={prev!=null&&f.concepto==="Comisión"?"Importe (prev. "+fmtE(prev)+")":"Importe"}><Input type="number" step="0.01" value={f.importe} onChange={e=>setF({...f,importe:e.target.value})}/></Field>
      </div>
      <Field label="% manual (opcional)"><Input type="number" value={f.pct_override} onChange={e=>setF({...f,pct_override:e.target.value})}/></Field>
      <Btn disabled={!f.contrato_id||f.importe===""} onClick={async()=>{await db.ins("lineas_liquidacion",{liquidacion_id:modal.liqId,contrato_id:f.contrato_id,concepto:f.concepto,importe:parseFloat(f.importe),pct_override:f.pct_override?parseFloat(f.pct_override):null});await recargar("lineas");setModal(null);}}>Añadir línea</Btn>
    </Modal>
  );
}

function ModalNuevoUsuario() {
  const {datos,recargar,setModal}=useContext(Ctx);
  const [f,setF]=useState({nombre:"",email:"",rol:"Comercial",superior_id:datos.usuarios[0]?.id||"",pct_default:85});
  return (
    <Modal title="Nuevo usuario" onClose={()=>setModal(null)}>
      <Field label="Nombre"><Input value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/></Field>
      <Field label="Email"><Input value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Rol"><Sel value={f.rol} onChange={e=>setF({...f,rol:e.target.value})}>{ROLES.filter(r=>r!=="Master").map(r=><option key={r}>{r}</option>)}</Sel></Field>
        <Field label="Superior"><Sel value={f.superior_id} onChange={e=>setF({...f,superior_id:e.target.value})}>{datos.usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}</Sel></Field>
      </div>
      <Field label="% comisión por defecto"><Input type="number" value={f.pct_default} onChange={e=>setF({...f,pct_default:parseFloat(e.target.value)||85})}/></Field>
      <Btn disabled={!f.nombre} onClick={async()=>{await db.ins("usuarios",f);await recargar("usuarios");setModal(null);}}>Crear usuario</Btn>
    </Modal>
  );
}

function ModalNuevaComer() {
  const {datos,recargar,setModal}=useContext(Ctx);
  const [f,setF]=useState({nombre:"",proveedor_id:datos.proveedores[0]?.id||""});
  return (
    <Modal title="Nueva comercializadora" onClose={()=>setModal(null)}>
      <Field label="Nombre"><Input value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/></Field>
      <Field label="Proveedor"><Sel value={f.proveedor_id} onChange={e=>setF({...f,proveedor_id:e.target.value})}>{datos.proveedores.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</Sel></Field>
      <Btn disabled={!f.nombre} onClick={async()=>{await db.ins("comercializadoras",f);await recargar("comercializadoras");setModal(null);}}>Crear</Btn>
    </Modal>
  );
}

function ModalNuevoProducto() {
  const {datos,recargar,setModal}=useContext(Ctx);
  const [f,setF]=useState({nombre:"",comercializadora_id:datos.comercializadoras[0]?.id||"",tipo:"luz",tarifa:"",comision_bruta:"",id_inergia:""});
  return (
    <Modal title="Nuevo producto" onClose={()=>setModal(null)}>
      <Field label="Nombre"><Input value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Comercializadora"><Sel value={f.comercializadora_id} onChange={e=>setF({...f,comercializadora_id:e.target.value})}>{datos.comercializadoras.map(cm=><option key={cm.id} value={cm.id}>{cm.nombre}</option>)}</Sel></Field>
        <Field label="Suministro"><Sel value={f.tipo} onChange={e=>setF({...f,tipo:e.target.value})}><option value="luz">Luz</option><option value="gas">Gas</option></Sel></Field>
        <Field label="Tarifa"><Input placeholder="2.0TD, RL.1…" value={f.tarifa} onChange={e=>setF({...f,tarifa:e.target.value})}/></Field>
        <Field label="Comisión bruta (€)"><Input type="number" step="0.01" value={f.comision_bruta} onChange={e=>setF({...f,comision_bruta:e.target.value})}/></Field>
      </div>
      <Btn disabled={!f.nombre||!f.comision_bruta} onClick={async()=>{await db.ins("productos",{...f,comision_bruta:parseFloat(f.comision_bruta)||0});await recargar("productos");setModal(null);}}>Crear producto</Btn>
    </Modal>
  );
}

/* ============================================================
 * NAV + APP
 * ============================================================ */
const NAV=[
  {id:"dashboard",    label:"Panel",        icon:LayoutDashboard},
  {id:"clientes",     label:"Clientes",      icon:Users},
  {id:"contratos",    label:"Contratos",     icon:FileText},
  {id:"renovaciones", label:"Renovaciones",  icon:CalendarClock},
  {id:"tickets",      label:"Tickets",       icon:Ticket},
  {id:"catalogo",     label:"Catálogo",      icon:Layers},
  {id:"liquidaciones",label:"Liquidaciones", icon:Euro},
  {id:"usuarios",     label:"Usuarios",      icon:UserCog},
  {id:"integraciones",label:"Integraciones", icon:Plug},
];
const TITULOS={dashboard:"Panel de control",clientes:"Clientes",contratos:"Contratos",renovaciones:"Renovaciones",tickets:"Tickets",catalogo:"Catálogo",liquidaciones:"Liquidaciones",usuarios:"Red comercial",integraciones:"Integraciones"};
const VISTAS={dashboard:Dashboard,clientes:Clientes,contratos:Contratos,renovaciones:Renovaciones,tickets:Tickets,catalogo:Catalogo,liquidaciones:Liquidaciones,usuarios:VistaUsuarios,integraciones:Integraciones};
function ModalTramos() {
  const {datos,recargar,modal,setModal}=useContext(Ctx);
  const prod=datos.productos.find(p=>p.id===modal.prodId);
  const cmNombre=datos.comercializadoras.find(c=>c.id===prod?.comercializadora_id)?.nombre||"";
  const [guardando,setGuardando]=useState(false);
  const tramos=[...tramosDeProducto(modal.prodId,datos)].sort((a,b)=>Number(a.desde)-Number(b.desde));

  const guardarTramo=async(t)=>{
    setGuardando(true);
    await POST("/api/tramos",{...t,producto_id:prod.id});
    await recargar("comision_tramos"); setGuardando(false);
  };
  const borrarTramo=async(id)=>{
    if(!window.confirm("¿Borrar este tramo?"))return;
    setGuardando(true);
    await DEL("/api/tramos/"+id);
    await recargar("comision_tramos"); setGuardando(false);
  };
  return (
    <Modal title={"Tramos de comisión · "+prod.nombre} onClose={()=>setModal(null)} wide>
      <div style={{fontSize:12,color:C.mut,marginBottom:12}}>
        {cmNombre} · {prod.tarifa||"sin tarifa"} · consumo en kWh/año. La comisión se congela al <b>activar</b> el contrato con el valor vigente del tramo; rellenar un tramo después solo afecta a contratos activados a partir de ese momento.
      </div>
      {tramos.length===0
        ? <div style={{padding:"20px",textAlign:"center",color:C.mut}}>
            Este producto no tiene tramos. Usa <b>Añadir tramo</b> para crearlos.
          </div>
        : <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <TH style={{minWidth:0}}>Desde</TH><TH>Hasta</TH><TH>Potencia</TH><TH right>Comisión €</TH><TH></TH>
            </tr></thead>
            <tbody>
              {tramos.map(t=><FilaTramo key={t.id} t={t} onSave={guardarTramo} onDelete={borrarTramo} disabled={guardando}/>)}
            </tbody>
          </table>}
      <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid "+C.line,paddingTop:14}}>
        <div style={{display:"flex",gap:8}}>
          <Btn small kind="ghost" onClick={()=>guardarTramo({desde:0,hasta:"",potencia:"",comision:0,tarifa_acceso:prod.tarifa})} disabled={guardando}><Plus size={12}/> Añadir tramo</Btn>
        </div>
        <Btn onClick={()=>setModal(null)} disabled={guardando}>Aceptar</Btn>
      </div>
    </Modal>
  );
}
function FilaTramo({t,onSave,onDelete,disabled}) {
  const [com,setCom]=useState(t.comision??0);
  const [desde,setDesde]=useState(t.desde??0);
  const [hasta,setHasta]=useState(t.hasta??"");
  const [pot,setPot]=useState(t.potencia||"");
  const dirty=String(com)!==String(t.comision??0)||String(desde)!==String(t.desde??0)||String(hasta)!==String(t.hasta??"")||String(pot)!==String(t.potencia||"");
  return (
    <tr>
      <TD><Input value={desde} onChange={e=>setDesde(e.target.value)} style={{width:70,fontSize:12}}/></TD>
      <TD><Input value={hasta} placeholder="∞" onChange={e=>setHasta(e.target.value)} style={{width:70,fontSize:12}}/></TD>
      <TD><Input value={pot} placeholder="—" onChange={e=>setPot(e.target.value)} style={{width:80,fontSize:12}} title="Ej. ≤10kW / >10kW (solo Audax)"/></TD>
      <TD right><Input value={com} onChange={e=>setCom(e.target.value)} style={{width:90,fontSize:12,textAlign:"right",fontWeight:700}}/></TD>
      <TD right>
        <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
          {dirty&&<Btn small kind="ok" disabled={disabled} onClick={()=>onSave({id:t.id,desde,hasta,potencia:pot,comision:com,tarifa_acceso:t.tarifa_acceso})}>OK</Btn>}
          <Btn small kind="ghost" disabled={disabled} onClick={()=>onDelete(t.id)}>✕</Btn>
        </div>
      </TD>
    </tr>
  );
}

function ModalRenovar() {
  const {yo,datos,recargar,setModal,modal}=useContext(Ctx);
  const ct=modal.ct;
  const modo=modal.modo; // "misma" o "cambio"
  const cl=datos.clientes.find(x=>x.id===ct.cliente_id);
  const cmActual=datos.comercializadoras.find(x=>x.id===ct.comercializadora_id);
  const prActual=datos.productos.find(x=>x.id===ct.producto_id);

  const [meses,setMeses]=useState(12);
  const [f,setF]=useState({
    comercializadora_id:ct.comercializadora_id,
    producto_id:ct.producto_id||"",
    observaciones:"",
    canal:ct.canal||"",
  });
  const [guardando,setGuardando]=useState(false);

  const esCambio=modo==="cambio";
  const prods=datos.productos.filter(p=>p.comercializadora_id===f.comercializadora_id&&p.tipo===ct.tipo);
  const prId=prods.some(p=>p.id===f.producto_id)?f.producto_id:prods[0]?.id||"";

  const renovar=async()=>{
    setGuardando(true);
    try {
      if(esCambio){
        // Poner el contrato actual en baja y crear uno nuevo con la nueva comercializadora
        await db.upd("contratos","id=eq."+ct.id,{estado:"baja",fecha_baja:hoy(),observaciones:(ct.observaciones?ct.observaciones+" · ":"")+"Renovado con cambio a "+datos.comercializadoras.find(x=>x.id===f.comercializadora_id)?.nombre});
        const nuevaFechaRen=new Date();
        nuevaFechaRen.setMonth(nuevaFechaRen.getMonth()+meses);
        await db.ins("contratos",{
          cliente_id:ct.cliente_id, cups:ct.cups, tipo:ct.tipo,
          comercializadora_id:f.comercializadora_id, producto_id:prId,
          estado:"borrador", tarifa:datos.productos.find(p=>p.id===prId)?.tarifa||ct.tarifa,
          duracion_meses:meses,
          permanencia:ct.permanencia, renovacion_auto:ct.renovacion_auto,
          iban:ct.iban, potencia_p1:ct.potencia_p1, potencia_p2:ct.potencia_p2,
          potencia_p3:ct.potencia_p3, potencia_p4:ct.potencia_p4,
          potencia_p5:ct.potencia_p5, potencia_p6:ct.potencia_p6,
          consumo_anual:ct.consumo_anual, tiposol:"C1",
          tipo_via_cups:ct.tipo_via_cups, calle_cups:ct.calle_cups||ct.direccion_cups,
          numero_cups:ct.numero_cups, planta_cups:ct.planta_cups,
          puerta_cups:ct.puerta_cups||ct.letra_cups, aclarador_cups:ct.aclarador_cups,
          codpostal_cups:ct.codpostal_cups, provincia_cups:ct.provincia_cups,
          localidad_cups:ct.localidad_cups,
          observaciones:f.observaciones||"Renovación con cambio desde "+cmActual?.nombre,
          canal:f.canal||ct.canal||"",
        });
        await db.ins("eventos",{origen:"CRM",tipo:"contrato.renovacion_cambio",ref:ct.id,
          detalle:"CUPS "+ct.cups+" · de "+cmActual?.nombre+" a "+datos.comercializadoras.find(x=>x.id===f.comercializadora_id)?.nombre});
      } else {
        // Renovación en la misma comercializadora: extender fecha
        const nuevaFechaRen=new Date();
        nuevaFechaRen.setMonth(nuevaFechaRen.getMonth()+meses);
        const upd={
          fecha_renovacion:nuevaFechaRen.toISOString().slice(0,10),
          ...(prId!==ct.producto_id?{producto_id:prId}:{}),
          ...(f.canal&&f.canal!==ct.canal?{canal:f.canal}:{}),
        };
        if(f.observaciones) upd.observaciones=(ct.observaciones?ct.observaciones+" · ":"")+f.observaciones;
        await db.upd("contratos","id=eq."+ct.id,upd);
        await db.ins("eventos",{origen:"CRM",tipo:"contrato.renovacion",ref:ct.id,
          detalle:"CUPS "+ct.cups+" · renovado "+meses+" meses"+(prId!==ct.producto_id?" · cambio producto":"")});
      }
      await recargar("contratos"); await recargar("eventos");
      setModal(null);
    } catch(e){ alert("❌ "+e.message); }
    setGuardando(false);
  };

  return (
    <Modal title={esCambio?"Renovar con cambio de comercializadora":"Renovar contrato"} onClose={()=>setModal(null)} wide>
      {/* Info del contrato actual */}
      <Card style={{padding:"14px 18px",marginBottom:16,background:"#fafafa"}}>
        <div style={{fontSize:11,fontWeight:600,color:C.mut,textTransform:"uppercase",marginBottom:6}}>Contrato actual</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"8px 20px"}}>
          <CampoFicha label="Cliente" valor={cl?.razon_social}/>
          <CampoFicha label="CUPS" valor={ct.cups}/>
          <CampoFicha label="Comercializadora" valor={cmActual?.nombre}/>
          <CampoFicha label="Producto" valor={prActual?.nombre}/>
          <CampoFicha label="Activación" valor={fmtF(ct.fecha_activacion)}/>
          <CampoFicha label="Renovación" valor={fmtF(ct.fecha_renovacion)}/>
        </div>
      </Card>

      {esCambio&&<>
        <Sec label="Nueva comercializadora y producto"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Comercializadora">
            <Sel value={f.comercializadora_id} onChange={e=>setF({...f,comercializadora_id:e.target.value,producto_id:""})}>
              {datos.comercializadoras.filter(cm=>datos.productos.some(p=>p.comercializadora_id===cm.id&&p.tipo===ct.tipo)).map(cm=>
                <option key={cm.id} value={cm.id}>{cm.nombre}{cm.id===ct.comercializadora_id?" (actual)":""}</option>
              )}
            </Sel>
          </Field>
          <Field label="Producto">
            <Sel value={prId} onChange={e=>setF({...f,producto_id:e.target.value})}>
              {prods.map(p=><option key={p.id} value={p.id}>{p.nombre}{p.tarifa?" · "+p.tarifa:""}</option>)}
            </Sel>
          </Field>
        </div>
        <div style={{fontSize:12,color:C.warn,padding:"8px 12px",background:C.warnBg,borderRadius:8,marginBottom:12}}>
          Al renovar con cambio, el contrato actual pasará a <b>baja</b> y se creará uno nuevo en estado <b>borrador</b> con el mismo CUPS.
        </div>
      </>}

      {!esCambio&&<>
        <Sec label="Nuevo producto (opcional)"/>
        <Field label="Producto">
          <Sel value={prId} onChange={e=>setF({...f,producto_id:e.target.value})}>
            {prods.map(p=><option key={p.id} value={p.id}>{p.nombre}{p.tarifa?" · "+p.tarifa:""}{p.id===ct.producto_id?" (actual)":""}</option>)}
          </Sel>
        </Field>
      </>}

      <Sec label="Duración de la renovación"/>
      <Field label="Meses">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Input type="number" value={meses} onChange={e=>setMeses(parseInt(e.target.value)||12)} style={{width:80,textAlign:"center",fontWeight:700,fontSize:15}}/>
          <span style={{fontSize:12,color:C.mut}}>meses (predeterminado: 12)</span>
        </div>
      </Field>

      <Field label="Canal"><CanalSel value={f.canal||""} onChange={e=>setF({...f,canal:e.target.value})} datos={datos} recargar={recargar}/></Field>
      <Field label="Observaciones"><Input value={f.observaciones} onChange={e=>setF({...f,observaciones:e.target.value})} placeholder="Motivo de la renovación, notas…"/></Field>

      <div style={{display:"flex",gap:8,marginTop:8}}>
        <Btn disabled={guardando||(esCambio&&!prId)} onClick={renovar}>
          {guardando?"Procesando…":esCambio?"Renovar con cambio":"Renovar contrato"}
        </Btn>
        <Btn kind="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

function ModalNuevoTicket() {
  const {yo,datos,recargar,setModal,setSel}=useContext(Ctx);
  const [f,setF]=useState({cliente_id:"",cliente_texto:"",contrato_id:"",cups_texto:"",asunto:"",observaciones:"",prioridad:"media",esClienteNuevo:false,esCupsNuevo:false});
  const [busqCli,setBusqCli]=useState("");
  const [guardando,setGuardando]=useState(false);

  const clientesFiltrados=datos.clientes.filter(c=>
    !busqCli||((c.razon_social||"")+(c.cif||"")+(c.nif||"")).toLowerCase().includes(busqCli.toLowerCase())
  ).slice(0,50);

  const contratos_del_cliente=f.cliente_id?datos.contratos.filter(c=>c.cliente_id===f.cliente_id):[];

  const guardar=async()=>{
    if(!f.asunto.trim()){alert("El asunto es obligatorio");return;}
    if(!f.cliente_id&&!f.cliente_texto.trim()){alert("Selecciona un cliente o indica el nombre del nuevo");return;}
    setGuardando(true);
    try{
      const payload={
        asunto:f.asunto.trim(),
        observaciones:f.observaciones.trim()||null,
        estado:"abierto",
        prioridad:f.prioridad,
        creado_por:yo.id,
        ...(f.esClienteNuevo?{cliente_texto:f.cliente_texto.trim()}:{cliente_id:f.cliente_id}),
        ...(f.esCupsNuevo?{cups_texto:f.cups_texto.trim()}:f.contrato_id?{contrato_id:f.contrato_id}:{}),
      };
      const res=await db.ins("tickets",payload);
      const tid=res?.data?.[0]?.id;
      if(tid){
        await db.ins("ticket_notas",{ticket_id:tid,texto:"Ticket creado",usuario:yo.nombre});
      }
      await recargar("tickets");await recargar("ticket_notas");
      setModal(null);
      if(tid) setSel({tipo:"ticket",id:tid});
    }catch(e){alert("❌ "+e.message);}
    setGuardando(false);
  };

  return (
    <Modal title="Nuevo ticket" onClose={()=>setModal(null)} wide>
      <Sec label="Cliente"/>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
          <input type="checkbox" checked={f.esClienteNuevo} onChange={e=>setF({...f,esClienteNuevo:e.target.checked,cliente_id:"",contrato_id:""})}/>
          Cliente nuevo (no existe en el CRM)
        </label>
      </div>
      {f.esClienteNuevo
        ?<Field label="Nombre del cliente"><Input placeholder="Nombre o razón social del nuevo cliente…" value={f.cliente_texto} onChange={e=>setF({...f,cliente_texto:e.target.value})}/></Field>
        :<Field label="Buscar cliente existente">
          <Input placeholder="Filtrar por nombre o CIF…" value={busqCli} onChange={e=>setBusqCli(e.target.value)} style={{marginBottom:6}}/>
          <Sel value={f.cliente_id} onChange={e=>setF({...f,cliente_id:e.target.value,contrato_id:""})} style={{width:"100%"}}>
            <option value="">— Seleccionar cliente —</option>
            {clientesFiltrados.map(c=><option key={c.id} value={c.id}>{c.razon_social} · {c.cif||c.nif||"sin doc."}</option>)}
          </Sel>
        </Field>
      }

      <Sec label="CUPS / Contrato"/>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
          <input type="checkbox" checked={f.esCupsNuevo} onChange={e=>setF({...f,esCupsNuevo:e.target.checked,contrato_id:""})}/>
          CUPS nuevo (no existe en el CRM)
        </label>
      </div>
      {f.esCupsNuevo
        ?<Field label="CUPS"><Input placeholder="Escribe el CUPS manualmente…" value={f.cups_texto} onChange={e=>setF({...f,cups_texto:e.target.value})}/></Field>
        :!f.esClienteNuevo&&f.cliente_id
          ?<Field label="Contrato / CUPS">
            <Sel value={f.contrato_id} onChange={e=>setF({...f,contrato_id:e.target.value})} style={{width:"100%"}}>
              <option value="">— Seleccionar CUPS (opcional) —</option>
              {contratos_del_cliente.map(c=>{
                const cm=datos.comercializadoras.find(x=>x.id===c.comercializadora_id);
                return <option key={c.id} value={c.id}>{c.cups} · {cm?.nombre} · {c.estado}</option>;
              })}
            </Sel>
          </Field>
          :<div style={{fontSize:12,color:C.mut,padding:"4px 0",marginBottom:8}}>Selecciona un cliente para ver sus CUPS, o marca "CUPS nuevo".</div>
      }

      <Sec label="Detalles del ticket"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12}}>
        <Field label="Asunto *"><Input placeholder="Asunto del ticket…" value={f.asunto} onChange={e=>setF({...f,asunto:e.target.value})}/></Field>
        <Field label="Prioridad">
          <div style={{display:"flex",gap:6}}>
            {Object.entries(TICKET_PRIORIDAD).map(([k,v])=>(
              <button key={k} onClick={()=>setF({...f,prioridad:k})}
                style={{fontFamily:FONT,fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,cursor:"pointer",
                  border:"1px solid "+(f.prioridad===k?v.fg:C.line),background:f.prioridad===k?v.bg:"#fff",color:f.prioridad===k?v.fg:C.ink}}>
                {v.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Field label="Observaciones"><textarea value={f.observaciones} onChange={e=>setF({...f,observaciones:e.target.value})} rows={4} placeholder="Detalles, contexto, notas…"
        style={{fontFamily:FONT,fontSize:13,width:"100%",padding:10,borderRadius:8,border:"1px solid "+C.line,resize:"vertical"}}/></Field>

      <div style={{display:"flex",gap:8,marginTop:8}}>
        <Btn disabled={guardando} onClick={guardar}>{guardando?"Creando…":"Crear ticket"}</Btn>
        <Btn kind="ghost" onClick={()=>setModal(null)}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

const MODALES={nuevoCliente:ModalNuevoCliente,nuevoContrato:ModalNuevoContrato,editarContrato:ModalEditarContrato,enviarInergia:ModalEnviarInergia,nuevaLiq:ModalNuevaLiq,nuevaLinea:ModalNuevaLinea,nuevoUsuario:ModalNuevoUsuario,nuevaComer:ModalNuevaComer,nuevoProducto:ModalNuevoProducto,tramos:ModalTramos,renovar:ModalRenovar,nuevoTicket:ModalNuevoTicket};

export default function App() {
  const [yo,       setYo]      = useState(null);
  const [datos,    setDatos]   = useState(null);
  const [vista,    setVista]   = useState("dashboard");
  const [sel,      setSel]     = useState(null);
  const [modal,    setModal]   = useState(null);
  const [cargando, setCargando]= useState(false);
  const [error,    setError]   = useState(null);

  const cargar = async () => {
    setCargando(true); setError(null);
    try {
      const d = await GET("/datos");
      if (!d.ok) throw new Error(d.error);
      setDatos(d);
    } catch(e) { setError(e.message); }
    finally { setCargando(false); }
  };

  const recargar = async (tabla) => {
    try {
      const d = await GET("/datos");
      if (d.ok) setDatos(d);
    } catch(e) { console.error("recargar:", e.message); }
  };

  const handleLogin = async (usuario) => {
    setYo(usuario);
    await cargar();
  };

  const logout = () => { setYo(null); setDatos(null); };

  if (!yo) return <Login onLogin={handleLogin}/>;

  if (cargando||!datos) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:FONT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap');*{box-sizing:border-box}"}</style>
      <Spinner text="Cargando datos desde Supabase…"/>
    </div>
  );

  if (error) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,background:C.bg,fontFamily:FONT}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap');*{box-sizing:border-box}"}</style>
      <Database size={32} style={{color:C.err}}/>
      <div style={{color:C.err,fontWeight:700}}>Error al cargar datos</div>
      <div style={{color:C.mut,fontSize:13,maxWidth:400,textAlign:"center"}}>{error}</div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={cargar}><RefreshCw size={14}/> Reintentar</Btn>
        <Btn kind="ghost" onClick={logout}><LogOut size={14}/> Cerrar sesión</Btn>
      </div>
    </div>
  );

  const VistaActiva=sel?.tipo==="ticket"?()=><TicketDetalle id={sel.id} volver={()=>setSel(null)}/>:sel?.tipo==="contrato"?()=><ContratoDetalle id={sel.id} volver={()=>setSel(null)}/>:sel?.tipo==="cliente"?()=><ClienteDetalle id={sel.id}/>:sel?.tipo==="liq"?()=><LiqDetalle id={sel.id}/>:VISTAS[vista];
  const ModalActivo=modal?MODALES[modal.t]:null;
  const ctx={yo,datos,recargar,setSel,setModal,modal};

  return (
    <Ctx.Provider value={ctx}>
      <div style={{fontFamily:FONT,color:C.ink,background:C.bg,minHeight:"100vh",width:"100vw",display:"flex"}}>
        <style>{"@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&display=swap');@keyframes spin{to{transform:rotate(360deg)}}html,body,#root{margin:0;padding:0;width:100%;min-height:100vh}*{box-sizing:border-box} table tr:hover td{background:#FAFBF9} input:focus,select:focus{border-color:#1C2321!important;outline:none}"}</style>
        <aside style={{width:210,background:C.side,color:C.sideInk,flexShrink:0,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <div style={{padding:"20px 16px 16px"}}>
            <img src={LOGO} alt="Inluzgas" style={{height:44,filter:"brightness(10)",marginBottom:2}}/>
            <div style={{fontSize:11,color:"#7E8C84",marginTop:2}}>CRM · Asesoría energética</div>
          </div>
          <nav style={{flex:1,padding:"0 8px"}}>
            {NAV.map(n=>{
              const act=vista===n.id&&!sel;
              return <button key={n.id} onClick={()=>{setVista(n.id);setSel(null);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,marginBottom:2,fontSize:13,fontWeight:600,border:"none",cursor:"pointer",background:act?"rgba(255,255,255,.09)":"transparent",color:act?"#fff":C.sideInk}}><n.icon size={15}/> {n.label}</button>;
            })}
          </nav>
          <div style={{padding:"12px 12px 16px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#C8D2CB",marginBottom:2}}>{yo.nombre}</div>
            <div style={{fontSize:11,color:"#7E8C84",marginBottom:10}}>{yo.rol}</div>
            <Btn kind="ghost" small onClick={logout} style={{color:C.sideInk,borderColor:"rgba(255,255,255,.15)",width:"100%",justifyContent:"center"}}>
              <LogOut size={13}/> Cerrar sesión
            </Btn>
          </div>
        </aside>
        <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
          <header style={{padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+C.line,background:C.panel}}>
            <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.4}}>{sel?(sel.tipo==="ticket"?"Ticket":sel.tipo==="contrato"?"Detalle de contrato":sel.tipo==="cliente"?"Ficha de cliente":"Detalle de liquidación"):TITULOS[vista]}</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:11,fontWeight:600,color:C.mut}}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
              <Btn kind="ghost" small onClick={cargar} title="Recargar datos"><RefreshCw size={13}/></Btn>
            </div>
          </header>
          <div style={{padding:24,flex:1,overflowY:"auto"}}>{VistaActiva&&<VistaActiva/>}</div>
        </main>
        {ModalActivo&&<ModalActivo/>}
      </div>
    </Ctx.Provider>
  );
}
