const ESTADO_EQUIVALENCIAS = {
  activo: "activado",
  activado: "activado",
  "activo ftr": "activado",
  comisionado: "activado",
  alta: "activado",
  baja: "baja",
  "baja cc": "baja",
  cancelado: "cancelado",
  cancelada: "cancelado",
  rechazado: "rechazado",
  rechazada: "rechazado",
  ko: "rechazado",
  incidencia: "incidencia",
  "incidencia resuelta": "en_tramite",
  "en tramite": "en_tramite",
  tramite: "en_tramite",
  "pendiente cc": "en_tramite",
  "pdt cc": "en_tramite",
  "pdte cc": "en_tramite",
  "pendiente de firma": "en_tramite",
  "pendiente firma": "en_tramite",
  "pdt firma": "en_tramite",
  "pdte firma": "en_tramite",
  nuevo: "en_tramite",
  borrador: "borrador",
  enviado: "enviado",
  "pdte renovar": "pdte_renovar",
  pdte_renovar: "pdte_renovar",
  "pdte grabar": "pdte_grabar",
  pdte_grabar: "pdte_grabar",
  "grabar a futuro": "pdte_grabar",
};

export const normalizarTextoFiltro = valor => String(valor ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase()
  .replace(/[._-]+/g, " ")
  .replace(/\s+/g, " ");

export const normalizarEstadoContrato = estado => {
  const valor = normalizarTextoFiltro(estado);
  return ESTADO_EQUIVALENCIAS[valor] || valor.replace(/\s+/g, "_") || "borrador";
};

export const normalizarSituacionContrato = situacion =>
  normalizarTextoFiltro(situacion) || "__empty__";

export const fechaRegistroContrato = contrato => {
  const valor = contrato?.fecha_registro || contrato?.created_at || "";
  const fecha = String(valor).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : "";
};

export const coincideBusquedaContrato = (busqueda, valores) => {
  const terminos = normalizarTextoFiltro(busqueda).split(" ").filter(Boolean);
  if (!terminos.length) return true;
  const texto = normalizarTextoFiltro(valores.filter(Boolean).join(" "));
  return terminos.every(termino => texto.includes(termino));
};

export const cumpleFiltrosContrato = (contrato, filtros, detalle) => {
  const estados = filtros.estados || [];
  const situaciones = filtros.situaciones || [];
  const comerciales = filtros.comerciales || (filtros.comercial ? [filtros.comercial] : []);
  const estado = normalizarEstadoContrato(contrato.estado);
  const situacion = normalizarSituacionContrato(contrato.situacion);
  const fecha = fechaRegistroContrato(contrato);
  const carteraId = detalle.carteraId || "";

  if (!filtros.ignorarEstado && estados.length && !estados.includes(estado)) return false;
  if (!filtros.ignorarSituacion && situaciones.length && !situaciones.includes(situacion)) return false;
  if (!filtros.ignorarComercial && comerciales.length && !comerciales.includes(carteraId || "__pending__")) return false;
  if (filtros.fechaDesde && (!fecha || fecha < filtros.fechaDesde)) return false;
  if (filtros.fechaHasta && (!fecha || fecha > filtros.fechaHasta)) return false;

  return coincideBusquedaContrato(filtros.busqueda, [
    detalle.cliente,
    detalle.documento,
    contrato.cups,
    detalle.comercializadora,
    detalle.producto,
    detalle.comercial,
    contrato.comercial_import,
    contrato.situacion,
    detalle.estadoLabel,
    contrato.id_inergia,
  ]);
};
