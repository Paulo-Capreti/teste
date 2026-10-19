"use strict";
// Token original da atividade. Não é gerado nem assinado pelo Front-End.
const TOKEN_DEMONSTRATIVO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJuYW1lIjoiRW5nLiBDb21wdXRhXHUwMGU3XHUwMGUzbyIsInJvbGUiOiJKV1QiLCJpYXQiOjE3NTk5ODEzMTcsImV4cCI6MTc1OTk4NDkxN30.b1KfcSFInRwYnvRA0Ae5jYuL59KZmCsufPgISNGq0X0";
const formulario = document.querySelector("#login-form");
const email = document.querySelector("#email");
const senha = document.querySelector("#senha");
const mensagem = document.querySelector("#mensagem");
if (new URLSearchParams(location.search).get("logout") === "1") {
  mensagem.textContent = "Logout realizado. O token foi removido.";
}
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  let valido = true;
  // O enunciado exige presença dos campos, sem conferir credenciais reais.
  for (const campo of [email, senha]) {
    const vazio = campo.value.trim() === "";
    campo.setAttribute("aria-invalid", String(vazio));
    document.querySelector(`#${campo.id}-erro`).textContent = vazio ? "Preencha este campo." : "";
    if (vazio) valido = false;
  }
  if (!valido) {
    mensagem.textContent = "Login não realizado. Preencha os campos indicados.";
    (email.value.trim() ? senha : email).focus();
    return;
  }
  try {
    localStorage.setItem("token", TOKEN_DEMONSTRATIVO);
    senha.value = "";
    location.assign("area.html");
  } catch {
    mensagem.textContent = "Não foi possível salvar o token. Permita o armazenamento local neste navegador.";
  }
});
