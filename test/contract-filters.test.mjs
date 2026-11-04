import test from "node:test";
import assert from "node:assert/strict";
import {
  coincideBusquedaContrato,
  cumpleFiltrosContrato,
  normalizarEstadoContrato,
  normalizarSituacionContrato,
} from "../src/contractFilters.js";

const casilda = { estado: "en_tramite", situacion: "PDT FIRMA", cups: "ES0021000002218614RP", id_inergia: 123 };
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
