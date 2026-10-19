"use strict";
const restrito = document.querySelector("#restrito");
const negado = document.querySelector("#negado");
const mensagem = document.querySelector("#mensagem");
// Base64URL -> bytes -> UTF-8: preserva nomes com acentos.
function decodificarParte(parte) {
  if (!/^[A-Za-z0-9_-]+$/.test(parte) || parte.length % 4 === 1) {
    throw new Error("O token contém uma parte Base64URL inválida.");
  }
  const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("Não foi possível decodificar o token: Base64URL, UTF-8 ou JSON inválido.");
  }
}
function negarAcesso(texto) {
  restrito.hidden = true;
  negado.hidden = false;
  document.querySelector("#erro-acesso").textContent = texto;
}
function formatarData(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "Não informado";
  const data = new Date(valor * 1000);
  return Number.isNaN(data.getTime()) ? "Data inválida" : data.toLocaleString("pt-BR") + " (horário local)";
}
function carregarArea() {
  restrito.hidden = true;
  negado.hidden = true;
  try {
    const token = localStorage.getItem("token");
    if (!token || !token.trim()) throw new Error("Nenhum token encontrado. Faça login para continuar.");
    const partes = token.split(".");
    if (partes.length !== 3 || partes.some(p => !/^[A-Za-z0-9_-]+$/.test(p) || p.length % 4 === 1)) {
      throw new Error("Token malformado. São necessárias três partes Base64URL não vazias.");
    }
    const header = decodificarParte(partes[0]);
    const payload = decodificarParte(partes[1]);
    if (!header || typeof header !== "object" || Array.isArray(header) || !payload || typeof payload !== "object" || Array.isArray(payload) || typeof payload.name !== "string" || !payload.name.trim()) {
      throw new Error("Token inválido: Header/Payload devem ser objetos e o nome deve estar preenchido.");
    }
    // Somente simulação: não verifica assinatura e não bloqueia expiração.
    document.querySelector("#nome").textContent = payload.name;
    document.querySelector("#usuario-id").textContent = String(payload.id ?? "Não informado");
    document.querySelector("#perfil").textContent = String(payload.role ?? "Não informado");
    document.querySelector("#validade").textContent = typeof payload.exp !== "number" ? "Não informada" : Date.now() >= payload.exp * 1000 ? "Expirado" : "Prazo não vencido";
    document.querySelector("#header-json").textContent = JSON.stringify(header, null, 2);
    document.querySelector("#payload-json").textContent = JSON.stringify(payload, null, 2);
    document.querySelector("#emitido").textContent = formatarData(payload.iat);
    document.querySelector("#expira").textContent = formatarData(payload.exp);
    const visual = document.querySelector("#token-visual");
    visual.replaceChildren();
    partes.forEach((parte, indice) => {
      const span = document.createElement("span");
      span.className = `parte-${indice}`;
      span.textContent = parte;
      visual.append(span);
      if (indice < 2) visual.append(document.createTextNode("."));
    });
    restrito.hidden = false;
  } catch (erro) {
    negarAcesso(erro instanceof DOMException ? "Não foi possível acessar o armazenamento do navegador." : erro.message);
  }
}
document.querySelector("#sair").addEventListener("click", () => {
  try {
    localStorage.removeItem("token");
    restrito.hidden = true;
    location.replace("index.html?logout=1");
  } catch {
    mensagem.textContent = "Não foi possível remover o token. Verifique as permissões do navegador.";
  }
});
document.querySelector("#copiar").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) { carregarArea(); return; }
    await navigator.clipboard.writeText(token);
    mensagem.textContent = "Token copiado.";
  } catch {
    mensagem.textContent = "Cópia automática indisponível. Selecione o token acima e copie manualmente.";
  }
});
// Reavalia ao voltar pelo histórico e após alterações em outra aba.
window.addEventListener("pageshow", carregarArea);
window.addEventListener("storage", evento => {
  if (evento.key === "token" || evento.key === null) carregarArea();
});
carregarArea();
