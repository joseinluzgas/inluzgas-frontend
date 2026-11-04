import test from "node:test";
import assert from "node:assert/strict";
import {
  coincideBusquedaContrato,
  cumpleFiltrosContrato,
  fechaRegistroContrato,
  normalizarEstadoContrato,
  normalizarSituacionContrato,
} from "../src/contractFilters.js";

const casilda = { estado: "en_tramite", situacion: "PDT FIRMA", cups: "ES0021000002218614RP", id_inergia: 123, fecha_registro: "2026-11-03" };
const detalle = {
  cliente: "CASILDA GARCÍA OBREGÓN",
  documento: "13017192C",
  comercializadora: "Ejemplo Energía",
  producto: "Plan Fijo",
  comercial: "Laura Román",
  carteraId: "laura",
  estadoLabel: "En Trámite",
};

test("normaliza las variantes de los estados", () => {
  assert.equal(normalizarEstadoContrato("En Trámite"), "en_tramite");
  assert.equal(normalizarEstadoContrato("PDT. FIRMA"), "en_tramite");
  assert.equal(normalizarEstadoContrato("Activo FTR"), "activado");
  assert.equal(normalizarEstadoContrato("PDTE. RENOVAR"), "pdte_renovar");
});

test("agrupa situaciones sin depender de mayúsculas, acentos o espacios", () => {
  assert.equal(normalizarSituacionContrato("  PDT   FIRMA "), "pdt firma");
  assert.equal(normalizarSituacionContrato("Pdt. Firma"), "pdt firma");
  assert.equal(normalizarSituacionContrato(""), "__empty__");
});

test("encuentra contratos por términos y sin depender de acentos", () => {
  assert.equal(coincideBusquedaContrato("casilda obregon", [detalle.cliente]), true);
  assert.equal(coincideBusquedaContrato("casilda 13017192c", [detalle.cliente, detalle.documento]), true);
  assert.equal(coincideBusquedaContrato("casilda inexistente", [detalle.cliente]), false);
});

test("CASILDA aparece al combinar búsqueda, estado y situación", () => {
  const filtros = { busqueda: "CASILDA", estados: ["en_tramite"], situaciones: ["pdt firma"], comercial: "" };
  assert.equal(cumpleFiltrosContrato(casilda, filtros, detalle), true);
});

test("todos los filtros excluyen únicamente cuando corresponde", () => {
  assert.equal(cumpleFiltrosContrato(casilda, { busqueda: "", estados: ["activado"], situaciones: [], comercial: "" }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { busqueda: "", estados: [], situaciones: ["incidencia"], comercial: "" }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { busqueda: "", estados: [], situaciones: [], comercial: "paco" }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { busqueda: "", estados: [], situaciones: [], comercial: "__pending__" }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { busqueda: "", estados: [], situaciones: [], comercial: "laura" }, detalle), true);
});

test("la multiselección de comerciales acepta cualquiera de los elegidos", () => {
  assert.equal(cumpleFiltrosContrato(casilda, { comerciales: ["paco", "laura"] }, detalle), true);
  assert.equal(cumpleFiltrosContrato(casilda, { comerciales: ["paco", "fernando"] }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { comerciales: [] }, detalle), true);
  assert.equal(cumpleFiltrosContrato(casilda, { comerciales: ["__pending__"] }, { ...detalle, carteraId: "" }), true);
});

test("filtra por fecha de registro con límites incluidos", () => {
  assert.equal(fechaRegistroContrato(casilda), "2026-11-03");
  assert.equal(cumpleFiltrosContrato(casilda, { fechaDesde: "2026-11-03", fechaHasta: "2026-11-03" }, detalle), true);
  assert.equal(cumpleFiltrosContrato(casilda, { fechaDesde: "2026-11-04" }, detalle), false);
  assert.equal(cumpleFiltrosContrato(casilda, { fechaHasta: "2026-11-02" }, detalle), false);
  assert.equal(fechaRegistroContrato({ created_at: "2026-10-14T08:30:00Z" }), "2026-10-14");
});
