# 🎮 Mostra Nossa Escola, Nossas Criações - PEI Lurdita

> Desafio Arcade interativo de Matemática (1º ao 5º Ano) desenvolvido para a Mostra Cultural da **PEI Profª Maria de Lourdes Gentille Stéfano (Lurdita)**.

---

## 🌟 Sobre o Projeto

Aplicação web responsiva no estilo Arcade/Fliperama retro, projetada para ser usada em tablets durante a mostra escolar ou projetada no telão/parede da escola.

### 🕹️ Funcionalidades Principais

- **Modo 1 Jogador (Solo):**
  - Desafio contra o relógio com questões de Matemática do 1º ao 5º ano.
  - Sistema de pontuação arcade com multiplicadores de combo.
  - Registro de High Score.

- **Modo 2 Jogadores (Duelo / Versus com Código de 4 Dígitos):**
  - **Criar Duelo:** O primeiro aluno gera uma sala exclusiva com um código curto de 4 dígitos (letras e números, ex: `K7P2`).
  - **Entrar em Duelo:** O segundo aluno digita o código de 4 dígitos no seu tablet e conecta instantaneamente à sala.
  - Partida em tempo real e sincronizada entre dois tablets na arena da escola.
  - Sincronização via Firebase Firestore (com fallback local via BroadcastChannel).
  - Anúncio de vencedor e pódio da escola campeã.

- **🏆 Hall da Fama / Painel de Projeção:**
  - Painel de classificação ao vivo otimizado para projeção em telão (com modo Tela Cheia).
  - Tabela do Ranking Individual e Tabela dos Duelos.
  - **Área do Professor:** Botão protegido por senha (`prof123`) para zerar as tabelas antes ou após as rodadas da mostra.

- **Efeitos Sonoros Arcade:**
  - Sintetizador 8-bit chiptune nativo utilizando a Web Audio API (sem dependências externas).
  - Chuva de confetes comemorativa em Canvas nativo.

---

## 🚀 Como Executar

Por ser uma aplicação web pura (HTML5, Vanilla CSS e Vanilla JavaScript):

1. Basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
2. Não requer instalação de pacotes ou servidores complexos.

---

## 🏫 Instituição

- **Escola:** PEI Profª Maria de Lourdes Gentille Stéfano (Lurdita)
- **Ano/Série:** 1º ao 5º Ano do Ensino Fundamental
- **Disciplinas:** Matemática
