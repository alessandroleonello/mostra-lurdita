/* ==========================================================================
   MOSTRA NOSSA ESCOLA, NOSSAS CRIAÇÕES - PEI LURDITA
   Lógica da Aplicação, Desafio de Matemática (1º ao 5º Ano) e Firebase Firestore
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURAÇÃO DO FIREBASE FIRESTORE
   --------------------------------------------------------------------------
   Substitua os dados abaixo com as credenciais do seu projeto Firebase Console.
   Passo a passo rápido:
   1. Acesse https://console.firebase.google.com/
   2. Crie um projeto (ex: mostra-lurdita)
   3. No menu lateral, ative o "Firestore Database" (Modo Teste)
   4. Vá em Configurações do Projeto > Seus Aplicativos > Web (</>) e copie as credenciais abaixo:
   -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBSpNx4KedSw7NZqIXxrxF9W9KQEgN7HJw",
  authDomain: "jogolurdita.firebaseapp.com",
  projectId: "jogolurdita",
  storageBucket: "jogolurdita.firebasestorage.app",
  messagingSenderId: "1050902817631",
  appId: "1:1050902817631:web:850cc2a1eff862d9eda4ea"
};

// Variáveis globais do Firestore
let db = null;
let isFirebaseConnected = false;
let broadcastChannel = null;

// Inicialização segura do Firebase com detecção de credenciais
function initFirebase() {
  const isDefaultConfig = !firebaseConfig.apiKey || 
                          firebaseConfig.apiKey.includes("SUA_API_KEY") || 
                          firebaseConfig.projectId.includes("mostra-pei-lurdita");

  try {
    if (typeof firebase !== 'undefined' && !isDefaultConfig) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      isFirebaseConnected = true;
      console.log("🔥 Firebase Firestore conectado com sucesso!");
      // Inicia escuta em tempo real dos rankings para projeção na parede
      setupRealtimeRankingListeners();
    } else {
      setupLocalFallback();
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível conectar ao Firestore remoto. Usando motor local/offline sincronizado.", error);
    setupLocalFallback();
  }
}

function setupLocalFallback() {
  isFirebaseConnected = false;
  console.log("ℹ️ Usando modo sincronizado local / offline.");

  // Canal de comunicação entre abas/janelas para testar Duelo no mesmo computador
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('lurdita_duelos_channel');
    broadcastChannel.onmessage = handleBroadcastMessage;
  }
}

// Escuta em tempo real para o Painel de Projeção na Parede
function setupRealtimeRankingListeners() {
  if (!db) return;

  // 1. Escuta Solo
  db.collection("ranking_solo").onSnapshot((snapshot) => {
    const list = [];
    snapshot.forEach(doc => {
      const item = doc.data() || {};
      item.docId = doc.id;
      list.push(item);
    });
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });
    renderSoloRankingTable(list);
    renderRecentRankingTable(list);
  }, err => console.warn("Erro no listener ranking_solo:", err));

  // 2. Escuta Duelos
  db.collection("ranking_duelos").onSnapshot((snapshot) => {
    const list = [];
    snapshot.forEach(doc => list.push(doc.data()));
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    renderDuelRankingTable(list);
  }, err => console.warn("Erro no listener ranking_duelos:", err));
}

/* --------------------------------------------------------------------------
   2. BANCO DE QUESTÕES (CÁLCULO MENTAL RÁPIDO - ADEQUADO PARA MOSTRA ESCOLAR)
   - Perguntas ultrarrápidas, diretas e simples (1 linha)
   - Ideais para alto fluxo de alunos: resposta rápida em 2 a 5 segundos
   - Apenas números inteiros (sem decimais/vírgulas)
   -------------------------------------------------------------------------- */
const QUESTIONS_BANK = [
  // ==================== OPERAÇÕES BÁSICAS E CÁLCULO RÁPIDO ====================
  {
    id: 101,
    category: "Matemática Rápida",
    question: "Quanto é 5 + 4?",
    options: ["8", "9", "10", "11"],
    correct: 1 // 9
  },
  {
    id: 102,
    category: "Matemática Rápida",
    question: "Quanto é 10 - 3?",
    options: ["6", "7", "8", "9"],
    correct: 1 // 7
  },
  {
    id: 103,
    category: "Matemática Rápida",
    question: "Quanto é 6 + 6?",
    options: ["10", "11", "12", "14"],
    correct: 2 // 12
  },
  {
    id: 104,
    category: "Matemática Rápida",
    question: "Qual número vem logo DEPOIS do 19?",
    options: ["18", "20", "21", "29"],
    correct: 1 // 20
  },
  {
    id: 105,
    category: "Matemática Rápida",
    question: "Quanto é 8 - 4?",
    options: ["2", "3", "4", "5"],
    correct: 2 // 4
  },
  {
    id: 106,
    category: "Matemática Rápida",
    question: "Quanto é 7 + 3?",
    options: ["9", "10", "11", "12"],
    correct: 1 // 10
  },
  {
    id: 107,
    category: "Matemática Rápida",
    question: "Quantas patas têm 2 cachorros juntos?",
    options: ["6 patas", "8 patas", "10 patas", "12 patas"],
    correct: 1 // 8
  },
  {
    id: 108,
    category: "Matemática Rápida",
    question: "Quanto é 15 - 5?",
    options: ["5", "10", "12", "15"],
    correct: 1 // 10
  },
  {
    id: 109,
    category: "Matemática Rápida",
    question: "Quanto é 2 + 8?",
    options: ["9", "10", "11", "12"],
    correct: 1 // 10
  },
  {
    id: 110,
    category: "Matemática Rápida",
    question: "Quanto é 9 - 5?",
    options: ["3", "4", "5", "6"],
    correct: 1 // 4
  },

  // ==================== TABUADAS E DOBRO / METADE ====================
  {
    id: 201,
    category: "Matemática Rápida",
    question: "Qual é o DOBRO de 5?",
    options: ["8", "10", "12", "15"],
    correct: 1 // 10
  },
  {
    id: 202,
    category: "Matemática Rápida",
    question: "Quanto é 20 + 30?",
    options: ["40", "50", "60", "70"],
    correct: 1 // 50
  },
  {
    id: 203,
    category: "Matemática Rápida",
    question: "Quanto é 2 x 7?",
    options: ["12", "14", "16", "18"],
    correct: 1 // 14
  },
  {
    id: 204,
    category: "Matemática Rápida",
    question: "Qual destes números é PAR?",
    options: ["7", "9", "12", "15"],
    correct: 2 // 12
  },
  {
    id: 205,
    category: "Matemática Rápida",
    question: "Quantos dias tem uma semana inteira?",
    options: ["5 dias", "6 dias", "7 dias", "8 dias"],
    correct: 2 // 7
  },
  {
    id: 206,
    category: "Matemática Rápida",
    question: "Quanto é 30 - 10?",
    options: ["15", "20", "25", "30"],
    correct: 1 // 20
  },
  {
    id: 207,
    category: "Matemática Rápida",
    question: "Qual número completa a sequência: 2, 4, 6, ___?",
    options: ["7", "8", "9", "10"],
    correct: 1 // 8
  },
  {
    id: 208,
    category: "Matemática Rápida",
    question: "Quanto é 9 + 8?",
    options: ["15", "16", "17", "18"],
    correct: 2 // 17
  },
  {
    id: 209,
    category: "Matemática Rápida",
    question: "Qual é o DOBRO de 8?",
    options: ["14", "15", "16", "18"],
    correct: 2 // 16
  },
  {
    id: 210,
    category: "Matemática Rápida",
    question: "Quanto é a METADE de 12?",
    options: ["5", "6", "7", "8"],
    correct: 1 // 6
  },

  // ==================== MULTIPLICAÇÕES E FORMAS GEOMÉTRICAS ====================
  {
    id: 301,
    category: "Matemática Rápida",
    question: "Quanto é 3 x 4?",
    options: ["10", "11", "12", "14"],
    correct: 2 // 12
  },
  {
    id: 302,
    category: "Matemática Rápida",
    question: "Quantos lados tem um triângulo?",
    options: ["2 lados", "3 lados", "4 lados", "5 lados"],
    correct: 1 // 3
  },
  {
    id: 303,
    category: "Matemática Rápida",
    question: "Quanto é a METADE de 20?",
    options: ["5", "10", "12", "15"],
    correct: 1 // 10
  },
  {
    id: 304,
    category: "Matemática Rápida",
    question: "Quanto é 5 x 5?",
    options: ["20", "25", "30", "35"],
    correct: 1 // 25
  },
  {
    id: 305,
    category: "Matemática Rápida",
    question: "Quanto é 18 dividido por 2?",
    options: ["7", "8", "9", "10"],
    correct: 2 // 9
  },
  {
    id: 306,
    category: "Matemática Rápida",
    question: "Quantos minutos tem 1 hora inteira?",
    options: ["30 minutos", "50 minutos", "60 minutos", "100 minutos"],
    correct: 2 // 60
  },
  {
    id: 307,
    category: "Matemática Rápida",
    question: "Quanto é 50 + 50?",
    options: ["80", "90", "100", "110"],
    correct: 2 // 100
  },
  {
    id: 308,
    category: "Matemática Rápida",
    question: "Quanto é 4 x 6?",
    options: ["20", "22", "24", "26"],
    correct: 2 // 24
  },
  {
    id: 309,
    category: "Matemática Rápida",
    question: "Quanto é 15 dividido por 3?",
    options: ["4", "5", "6", "7"],
    correct: 1 // 5
  },
  {
    id: 310,
    category: "Matemática Rápida",
    question: "Quantos lados tem um quadrado?",
    options: ["3 lados", "4 lados", "5 lados", "6 lados"],
    correct: 1 // 4
  },

  // ==================== CÁLCULOS MENTAIS DIRETOS ====================
  {
    id: 401,
    category: "Matemática Rápida",
    question: "Quanto é 100 - 40?",
    options: ["50", "60", "70", "80"],
    correct: 1 // 60
  },
  {
    id: 402,
    category: "Matemática Rápida",
    question: "Quanto é 6 x 6?",
    options: ["30", "32", "36", "40"],
    correct: 2 // 36
  },
  {
    id: 403,
    category: "Matemática Rápida",
    question: "Quanto é 20 dividido por 4?",
    options: ["4", "5", "6", "7"],
    correct: 1 // 5
  },
  {
    id: 404,
    category: "Matemática Rápida",
    question: "Qual é o DOBRO de 25?",
    options: ["40", "45", "50", "55"],
    correct: 2 // 50
  },
  {
    id: 405,
    category: "Matemática Rápida",
    question: "Qual número completa a sequência: 5, 10, 15, ___?",
    options: ["18", "20", "22", "25"],
    correct: 1 // 20
  },
  {
    id: 406,
    category: "Matemática Rápida",
    question: "Quanto é 7 x 3?",
    options: ["18", "20", "21", "24"],
    correct: 2 // 21
  },
  {
    id: 407,
    category: "Matemática Rápida",
    question: "Quanto é 80 + 20?",
    options: ["90", "100", "110", "120"],
    correct: 1 // 100
  },
  {
    id: 408,
    category: "Matemática Rápida",
    question: "Quanto é 8 x 5?",
    options: ["35", "40", "45", "50"],
    correct: 1 // 40
  },
  {
    id: 409,
    category: "Matemática Rápida",
    question: "Quanto é a METADE de 50?",
    options: ["20", "25", "30", "35"],
    correct: 1 // 25
  },
  {
    id: 410,
    category: "Matemática Rápida",
    question: "Quanto é 10 x 10?",
    options: ["90", "100", "110", "1000"],
    correct: 1 // 100
  }
];

// Partidas de 10 perguntas dinâmicas e rápidas de Matemática
const QUESTIONS_PER_GAME = 10;

/* --------------------------------------------------------------------------
   3. SINTETIZADOR DE EFEITOS SONOROS ARCADE 8-BIT / CHIPTUNE (WEB AUDIO API)
   Funciona 100% nativo no navegador e tablets sem arquivos externos
   -------------------------------------------------------------------------- */
class SoundEffects {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Som clássico de inserção de moeda de fliperama (Insert Coin / Mario Coin)
  coin() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.setValueAtTime(0.14, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.14, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  // Clique de botão tátil do fliperama
  click() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Seleção de alternativa com 'blip' 8-bit
  select() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Acerto: Arpeggio alegre 8-bit (Power-Up!)
  correct() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.16);
      });
    } catch (e) {}
  }

  // Combo Streak Laser Chiptune
  combo() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [659.25, 880.00, 1174.66, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.13, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.19);
      });
    } catch (e) {}
  }

  // Erro: 8-bit retro bonk
  wrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [240, 180, 130].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.1, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.13);
      });
    } catch (e) {}
  }

  // Fanfarra Arcade 8-bit (Stage Clear / Victory)
  fanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const notes = [
        { f: 523.25, t: 0.00, d: 0.12 },
        { f: 659.25, t: 0.13, d: 0.12 },
        { f: 783.99, t: 0.26, d: 0.12 },
        { f: 1046.50, t: 0.39, d: 0.40 },
        { f: 880.00, t: 0.70, d: 0.14 },
        { f: 1046.50, t: 0.85, d: 0.60 }
      ];
      const now = ctx.currentTime;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.15, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      });
    } catch (e) {}
  }
}

const sounds = new SoundEffects();

/* --------------------------------------------------------------------------
   4. EFEITO DE CONFETES NATIVO (CANVAS)
   -------------------------------------------------------------------------- */
function launchConfetti(durationSeconds = 3) {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiColors = ['#ffc107', '#00d2ff', '#10b981', '#ef4444', '#ff5722', '#ffffff'];
  const confettiPieces = [];
  const count = 130;

  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 9 + 5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: Math.random() * 4 + 2.5,
      speedX: Math.random() * 3 - 1.5,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 10 - 5
    });
  }

  let startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = (Date.now() - startTime) / 1000;

    confettiPieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < durationSeconds) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById("confetti-canvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

/* --------------------------------------------------------------------------
   5. ESTADO DA SESSÃO DO JOGO ARCADE
   -------------------------------------------------------------------------- */
const gameState = {
  currentScreen: 'screen-home',
  mode: 'solo', // 'solo' ou 'duel'
  duelSubMode: 'create', // 'create' ou 'join'
  player: {
    name: '',
    school: '',
    grade: '',
    id: 'user_' + Math.random().toString(36).substring(2, 9)
  },
  quiz: {
    questions: [],
    currentIndex: 0,
    selectedOption: null,
    score: 0,
    arcadeScore: 0,
    comboStreak: 0,
    startTime: 0,
    questionStartTime: 0,
    endTime: 0,
    timerInterval: null,
    totalSeconds: 0
  },
  duel: {
    roomCode: '',
    roomRef: null,
    isPlayer1: false,
    player1Data: null,
    player2Data: null,
    status: 'idle', // 'waiting', 'ready', 'playing', 'finished'
    unsubscribeRoom: null,
    pollInterval: null,
    countdownInterval: null,
    roomsListInterval: null,
    unsubscribeRoomsList: null,
    isStarting: false,
    currentRoomData: null
  }
};

/* --------------------------------------------------------------------------
   6. CONTROLE DE NAVEGAÇÃO ENTRE TELAS E RESET DE FORMULÁRIO
   -------------------------------------------------------------------------- */
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  if (screenId !== 'screen-duel-rooms') {
    stopRoomsListPolling();
  }
  if (screenId !== 'screen-lobby') {
    stopLobbyPolling();
  }

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    gameState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function stopRoomsListPolling() {
  if (gameState.duel.roomsListInterval) {
    clearInterval(gameState.duel.roomsListInterval);
    gameState.duel.roomsListInterval = null;
  }
  if (gameState.duel.unsubscribeRoomsList) {
    try {
      gameState.duel.unsubscribeRoomsList();
    } catch (e) {}
    gameState.duel.unsubscribeRoomsList = null;
  }
}

function stopLobbyPolling() {
  if (gameState.duel.pollInterval) {
    clearInterval(gameState.duel.pollInterval);
    gameState.duel.pollInterval = null;
  }
  if (gameState.duel.countdownInterval) {
    clearInterval(gameState.duel.countdownInterval);
    gameState.duel.countdownInterval = null;
  }
}

/**
 * Limpa todos os campos de digitação do formulário de entrada para que novos
 * jogos e novos alunos sempre comecem com campos vazios (sem valores cacheados).
 */
function resetRegisterForm(resetPlayerState = false) {
  stopLobbyPolling();
  const form = document.getElementById('form-player-register');
  if (form) {
    try {
      form.reset();
    } catch (e) {}
  }

  const nameInput = document.getElementById('input-player-name');
  if (nameInput) nameInput.value = '';

  const schoolSelect = document.getElementById('select-player-school');
  if (schoolSelect) schoolSelect.selectedIndex = 0;

  const customSchoolInput = document.getElementById('input-custom-school');
  if (customSchoolInput) customSchoolInput.value = '';

  const customSchoolGroup = document.getElementById('group-custom-school');
  if (customSchoolGroup) customSchoolGroup.style.display = 'none';

  const gradeSelect = document.getElementById('select-player-grade');
  if (gradeSelect) {
    gradeSelect.selectedIndex = 0;
    gradeSelect.required = true;
  }

  const gradeGroup = document.getElementById('group-player-grade');
  if (gradeGroup) gradeGroup.style.display = 'block';

  const duelCodeInput = document.getElementById('input-duel-code');
  if (duelCodeInput) {
    duelCodeInput.value = '';
    duelCodeInput.required = false;
  }

  if (resetPlayerState) {
    gameState.player.name = '';
    gameState.player.school = '';
    gameState.player.grade = '';
  }
}

/* --------------------------------------------------------------------------
   7. FORMATAÇÃO E CRONÔMETRO
   -------------------------------------------------------------------------- */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
  stopTimer();
  gameState.quiz.startTime = Date.now();
  gameState.quiz.totalSeconds = 0;
  const display = document.getElementById('quiz-timer-display');
  display.textContent = '00:00';

  gameState.quiz.timerInterval = setInterval(() => {
    gameState.quiz.totalSeconds = Math.floor((Date.now() - gameState.quiz.startTime) / 1000);
    display.textContent = formatTime(gameState.quiz.totalSeconds);
  }, 1000);
}

function stopTimer() {
  if (gameState.quiz.timerInterval) {
    clearInterval(gameState.quiz.timerInterval);
    gameState.quiz.timerInterval = null;
  }
  gameState.quiz.endTime = Date.now();
}

/* --------------------------------------------------------------------------
   8. SORTEIO E PREPARAÇÃO DAS PERGUNTAS (EXCLUSIVAMENTE MATEMÁTICA)
   -------------------------------------------------------------------------- */
function prepareQuestions(questionIds = null) {
  let selected = [];
  if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
    // Sincronizar com perguntas pré-definidas da sala de duelo
    selected = questionIds.map(id => QUESTIONS_BANK.find(q => q.id === id)).filter(Boolean);
  } else {
    // Sorteio de 10 perguntas rápidas de Matemática (fluxo dinâmico para a mostra)
    const mathPool = QUESTIONS_BANK.filter(q => q.category && q.category.includes('Matemática'));
    const shuffledMath = [...mathPool].sort(() => 0.5 - Math.random());
    selected = shuffledMath.slice(0, QUESTIONS_PER_GAME);
  }

  gameState.quiz.questions = selected;
  gameState.quiz.currentIndex = 0;
  gameState.quiz.selectedOption = null;
  gameState.quiz.score = 0;
  gameState.quiz.arcadeScore = 0;
  gameState.quiz.comboStreak = 0;
  updateArcadeHUD();
  return selected.map(q => q.id);
}

function updateArcadeHUD() {
  const scoreEl = document.getElementById('arcade-score-display');
  if (scoreEl) {
    scoreEl.textContent = String(gameState.quiz.arcadeScore).padStart(6, '0');
  }
  const comboEl = document.getElementById('arcade-combo-display');
  if (comboEl) {
    const streak = gameState.quiz.comboStreak;
    comboEl.textContent = streak > 1 ? `x${streak} 🔥` : 'x1';
  }
}

function triggerArcadePopup(text) {
  const popup = document.getElementById('arcade-floating-popup');
  if (!popup) return;
  popup.textContent = text;
  popup.classList.remove('show-popup');
  void popup.offsetWidth; // Força reflow
  popup.classList.add('show-popup');
}

/* --------------------------------------------------------------------------
   9. RENDERIZAÇÃO DA QUESTÃO ATUAL NA ARENA DO QUIZ
   -------------------------------------------------------------------------- */
function renderCurrentQuestion() {
  const qIndex = gameState.quiz.currentIndex;
  const currentQ = gameState.quiz.questions[qIndex];
  if (!currentQ) return;

  // Limpa quaisquer timers de avanço automático anteriores
  if (gameState.quiz.autoAdvanceTimer) {
    clearTimeout(gameState.quiz.autoAdvanceTimer);
    gameState.quiz.autoAdvanceTimer = null;
  }
  if (gameState.quiz.countdownInterval) {
    clearInterval(gameState.quiz.countdownInterval);
    gameState.quiz.countdownInterval = null;
  }

  gameState.quiz.isAnswered = false;
  gameState.quiz.selectedOption = null;
  gameState.quiz.questionStartTime = Date.now();

  // Esconde barra de contagem de avanço
  const barWrap = document.getElementById('quiz-auto-advance-bar-wrap');
  if (barWrap) barWrap.style.display = 'none';

  // Atualiza indicadores Arcade
  const counterEl = document.getElementById('quiz-question-counter');
  if (counterEl) counterEl.textContent = `${qIndex + 1}/${gameState.quiz.questions.length}`;

  const progressPct = ((qIndex) / gameState.quiz.questions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPct}%`;

  document.getElementById('question-category').textContent = currentQ.category;
  document.getElementById('question-text').textContent = currentQ.question;

  const hint = document.getElementById('quiz-feedback-hint');
  if (hint) {
    hint.innerHTML = '<span>🕹️ Toque em uma alternativa para responder!</span>';
    hint.style.color = "var(--text-muted)";
  }

  const nextBtn = document.getElementById('btn-next-question');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.style.display = 'none'; // Não precisa do botão manual
  }

  // Gera opções como botões táteis arcade
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];

  currentQ.options.forEach((optText, optIndex) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('type', 'button');
    btn.innerHTML = `
      <span class="option-letter">${letters[optIndex]}</span>
      <span class="option-text">${optText}</span>
    `;

    btn.addEventListener('click', () => {
      selectOption(optIndex, btn);
    });

    optionsContainer.appendChild(btn);
  });

  updateArcadeHUD();
}

function selectOption(optIndex, buttonEl) {
  // Se já respondeu esta questão, ignora novos cliques durante o intervalo
  if (gameState.quiz.isAnswered) return;
  gameState.quiz.isAnswered = true;
  gameState.quiz.selectedOption = optIndex;

  const qIndex = gameState.quiz.currentIndex;
  const currentQ = gameState.quiz.questions[qIndex];
  const allBtns = document.querySelectorAll('.option-btn');
  const letters = ['A', 'B', 'C', 'D'];

  // Trava imediatamente todos os botões para não permitir troca de alternativa
  allBtns.forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  const isCorrect = optIndex === currentQ.correct;
  const timeTaken = (Date.now() - (gameState.quiz.questionStartTime || Date.now())) / 1000;

  buttonEl.classList.add('selected');

  const hint = document.getElementById('quiz-feedback-hint');
  const barWrap = document.getElementById('quiz-auto-advance-bar-wrap');
  const barFill = document.getElementById('quiz-auto-advance-fill');

  if (isCorrect) {
    gameState.quiz.score++;
    gameState.quiz.comboStreak++;
    const streak = gameState.quiz.comboStreak;
    const basePts = 1000;
    const comboBonus = streak > 1 ? (streak - 1) * 500 : 0;
    const speedBonus = timeTaken <= 5 ? 300 : (timeTaken <= 10 ? 150 : 0);
    const gained = basePts + comboBonus + speedBonus;
    gameState.quiz.arcadeScore += gained;

    buttonEl.classList.add('correct');

    if (streak > 1) {
      sounds.combo();
      triggerArcadePopup(`+${gained} PTS! COMBO x${streak}! 🔥`);
    } else {
      sounds.correct();
      triggerArcadePopup(`+${gained} PTS! EXCELENTE! ⭐`);
    }

    if (hint) {
      hint.innerHTML = `
        <span style="color: #059669; font-weight: 700; font-size: 0.88rem;">✅ RESPOSTA CORRETA! (+${gained} PTS)</span>
      `;
    }
  } else {
    gameState.quiz.comboStreak = 0;
    sounds.wrong();
    triggerArcadePopup("ERROU! ❌ COMBO RESETADO");

    buttonEl.classList.add('wrong');
    // Destaca a alternativa correta em verde para que o aluno aprenda
    if (allBtns[currentQ.correct]) {
      allBtns[currentQ.correct].classList.add('correct');
    }

    const correctLetter = letters[currentQ.correct] || '';
    const correctText = currentQ.options[currentQ.correct] || '';

    if (hint) {
      hint.innerHTML = `
        <span style="color: #dc2626; font-weight: 700; font-size: 0.88rem;">❌ RESPOSTA INCORRETA!</span>
        <span style="display: block; font-size: 0.82rem; color: var(--primary-navy); margin-top: 2px;">
          A resposta certa era: <strong>(${correctLetter}) ${escapeHtml(correctText)}</strong>
        </span>
      `;
    }
  }

  updateArcadeHUD();

  // Remove qualquer barra de contagem ou intervalo anterior
  if (barWrap) barWrap.style.display = 'none';
  if (gameState.quiz.countdownInterval) {
    clearInterval(gameState.quiz.countdownInterval);
    gameState.quiz.countdownInterval = null;
  }

  // Avança imediatamente para a próxima questão (sem delay de espera)
  if (gameState.quiz.autoAdvanceTimer) {
    clearTimeout(gameState.quiz.autoAdvanceTimer);
  }

  // Micro-transição de 250ms para registro visual do clique e áudio sem delay incômodo
  gameState.quiz.autoAdvanceTimer = setTimeout(() => {
    if (gameState.quiz.currentIndex + 1 < gameState.quiz.questions.length) {
      gameState.quiz.currentIndex++;
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }, 250);
}

function handleNextQuestion() {
  // Pula a espera dos 3 segundos imediatamente se chamado
  if (gameState.quiz.autoAdvanceTimer) {
    clearTimeout(gameState.quiz.autoAdvanceTimer);
    gameState.quiz.autoAdvanceTimer = null;
  }
  if (gameState.quiz.countdownInterval) {
    clearInterval(gameState.quiz.countdownInterval);
    gameState.quiz.countdownInterval = null;
  }

  const barWrap = document.getElementById('quiz-auto-advance-bar-wrap');
  if (barWrap) barWrap.style.display = 'none';

  if (gameState.quiz.currentIndex + 1 < gameState.quiz.questions.length) {
    gameState.quiz.currentIndex++;
    renderCurrentQuestion();
  } else {
    finishQuiz();
  }
}

/* --------------------------------------------------------------------------
   10. FINALIZAÇÃO DO QUIZ (SOLO OU DUELO)
   -------------------------------------------------------------------------- */
async function finishQuiz() {
  stopTimer();
  sounds.fanfare();
  launchConfetti(4);

  const totalTimeSeconds = gameState.quiz.totalSeconds;
  const score = gameState.quiz.score;
  const totalQuestions = gameState.quiz.questions.length;
  const arcadePts = gameState.quiz.arcadeScore;

  if (gameState.mode === 'solo') {
    // Modo 1 Jogador Arcade
    document.getElementById('stat-solo-score').textContent = `${score}/${totalQuestions}`;
    const ptsEl = document.getElementById('stat-solo-pts');
    if (ptsEl) ptsEl.textContent = `${arcadePts.toLocaleString('pt-BR')} PTS`;
    document.getElementById('stat-solo-time').textContent = formatTime(totalTimeSeconds);
    document.getElementById('result-solo-player-info').textContent = `${gameState.player.name} (${gameState.player.school}${gameState.player.grade ? ' • ' + gameState.player.grade : ''})`;

    // Troféu dinâmico conforme desempenho
    const trophy = document.getElementById('result-solo-trophy');
    const title = document.getElementById('result-solo-title');
    if (score === totalQuestions) {
      trophy.textContent = "🌟";
      title.textContent = "PERFECT CLEAR! NOTA 10!";
    } else if (score >= totalQuestions * 0.7) {
      trophy.textContent = "🥇";
      title.textContent = "HIGH SCORE! EXCELENTE!";
    } else {
      trophy.textContent = "🎉";
      title.textContent = "STAGE CLEAR! MUITO BEM!";
    }

    // Salvar no Ranking Solo com pontuação Arcade
    const rankPos = await saveSoloScore({
      name: gameState.player.name,
      school: gameState.player.school,
      grade: gameState.player.grade || '',
      score: score,
      arcadeScore: arcadePts,
      total: totalQuestions,
      timeSeconds: totalTimeSeconds,
      timestamp: new Date().toISOString()
    });

    document.getElementById('stat-solo-rank').textContent = rankPos ? `#${rankPos}` : 'Registrado';
    showScreen('screen-result-solo');

  } else {
    // Modo 2 Jogadores (Duelo)
    showScreen('screen-result-duel');
    document.getElementById('duel-waiting-opponent').style.display = 'block';
    document.getElementById('duel-final-result').style.display = 'none';

    await submitDuelPlayerFinished({
      playerId: gameState.player.id,
      name: gameState.player.name,
      school: gameState.player.school,
      score: score,
      arcadeScore: arcadePts,
      timeSeconds: totalTimeSeconds
    });
  }
}

/* --------------------------------------------------------------------------
   11. BANCO DE DADOS & RANKINGS (FIRESTORE + FALLBACK ROBUSTO)
   -------------------------------------------------------------------------- */

// Salva pontuação solo
async function saveSoloScore(entry) {
  try {
    if (isFirebaseConnected && db) {
      const docRef = await db.collection("ranking_solo").add(entry);
      entry.docId = docRef.id;
    } else {
      // LocalStorage fallback
      const currentList = getLocalSoloRankings();
      entry.docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      currentList.push(entry);
      localStorage.setItem('lurdita_ranking_solo', JSON.stringify(currentList));
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
    }
  } catch (err) {
    console.error("Erro ao salvar ranking solo:", err);
    const currentList = getLocalSoloRankings();
    entry.docId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    currentList.push(entry);
    localStorage.setItem('lurdita_ranking_solo', JSON.stringify(currentList));
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
  }

  // Calcula posição no ranking
  const allScores = await fetchSoloRankings();
  const index = allScores.findIndex(s => s.name === entry.name && s.score === entry.score && s.timeSeconds === entry.timeSeconds);
  return index !== -1 ? index + 1 : 1;
}

function getLocalSoloRankings() {
  try {
    const raw = localStorage.getItem('lurdita_ranking_solo');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item, idx) => {
          if (!item.docId) item.docId = 'local_' + (item.timestamp || idx) + '_' + idx;
        });
        return parsed;
      }
      return [];
    }
    return [
      { docId: "local_def_1", name: "Lucas Rocha", school: "PEI Lurdita", score: 6, total: 6, timeSeconds: 68, timestamp: new Date().toISOString() },
      { docId: "local_def_2", name: "Beatriz Lima", school: "EE Prof. José Roberto Furlaneto", score: 5, total: 6, timeSeconds: 74, timestamp: new Date().toISOString() },
      { docId: "local_def_3", name: "Pedro Henrique", school: "PEI Lurdita", score: 5, total: 6, timeSeconds: 88, timestamp: new Date().toISOString() }
    ];
  } catch (e) {
    return [];
  }
}

async function fetchSoloRankings() {
  let list = [];
  if (isFirebaseConnected && db) {
    try {
      const snap = await db.collection("ranking_solo").get();
      snap.forEach(doc => {
        const item = doc.data() || {};
        item.docId = doc.id;
        list.push(item);
      });
    } catch (e) {
      console.warn("Erro ao buscar do Firestore solo, usando local:", e);
      list = getLocalSoloRankings();
    }
  } else {
    list = getLocalSoloRankings();
  }

  // Ordena: maior score primeiro; em caso de empate, menor tempo
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  return list;
}

// Salva resultado do Duelo no histórico
async function saveDuelResult(duelData) {
  try {
    if (isFirebaseConnected && db) {
      await db.collection("ranking_duelos").add(duelData);
    } else {
      const duels = getLocalDuelRankings();
      duels.unshift(duelData);
      localStorage.setItem('lurdita_ranking_duelos', JSON.stringify(duels));
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
    }
  } catch (e) {
    const duels = getLocalDuelRankings();
    duels.unshift(duelData);
    localStorage.setItem('lurdita_ranking_duelos', JSON.stringify(duels));
    if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
  }
}

function getLocalDuelRankings() {
  try {
    const raw = localStorage.getItem('lurdita_ranking_duelos');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [
      {
        timestamp: new Date().toISOString(),
        winnerName: "Gabriel Ferreira",
        winnerSchool: "PEI Lurdita",
        winnerScore: 9,
        p1Name: "Gabriel Ferreira",
        p1School: "PEI Lurdita",
        p1Score: 9,
        p1Time: 65,
        p2Name: "Mateus Silva",
        p2School: "EE Dr. Pércio Gomes Gonzales",
        p2Score: 7,
        p2Time: 82
      }
    ];
  } catch (e) {
    return [];
  }
}

// Obtém histórico de rankings arquivados do LocalStorage
function getLocalRankingsHistory() {
  try {
    const raw = localStorage.getItem('lurdita_historico_rankings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn("Erro ao ler lurdita_historico_rankings do LocalStorage:", e);
  }
  return [];
}

// Busca histórico completo de rankings (Firestore e LocalStorage)
async function fetchRankingsHistory() {
  let list = [];
  if (isFirebaseConnected && db) {
    try {
      const snap = await db.collection("historico_rankings").orderBy("timestamp", "desc").get();
      snap.forEach(doc => {
        const item = doc.data() || {};
        item.docId = doc.id;
        list.push(item);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn("Aviso ao buscar historico_rankings no Firestore:", e);
    }
  }
  return getLocalRankingsHistory();
}

// Zera todas as tabelas de classificação (Solo e Duelos), arquivando antes uma cópia no Histórico
async function resetAllRankings() {
  // 0. Captura snapshot completo dos rankings atuais para arquivar no Histórico antes de zerar
  try {
    const currentScores = await fetchSoloRankings();
    if (currentScores && currentScores.length > 0) {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' às ' + now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const champion = currentScores[0];
      const championText = champion
        ? `${champion.name} (${champion.school || 'PEI Lurdita'}) — ${champion.score}/10 (${champion.arcadeScore || 0} pts)`
        : 'Sem registros';

      const archiveRecord = {
        id: 'hist_' + Date.now(),
        timestamp: now.toISOString(),
        dateFormatted: dateFormatted,
        totalParticipants: currentScores.length,
        champion: championText,
        rankings: currentScores
      };

      // 0.1 Salva snapshot no Firestore se conectado
      if (isFirebaseConnected && db) {
        try {
          await db.collection("historico_rankings").add(archiveRecord);
        } catch (errSnap) {
          console.warn("Aviso ao salvar snapshot no Firestore:", errSnap);
        }
      }

      // 0.2 Salva snapshot no LocalStorage
      try {
        const historyList = getLocalRankingsHistory();
        historyList.unshift(archiveRecord);
        localStorage.setItem('lurdita_historico_rankings', JSON.stringify(historyList));
      } catch (errLocal) {
        console.error("Erro ao salvar snapshot no LocalStorage:", errLocal);
      }
    }
  } catch (errArchive) {
    console.error("Erro ao arquivar ranking antes de zerar:", errArchive);
  }

  // 1. Limpa o LocalStorage (persistindo array vazio)
  try {
    localStorage.setItem('lurdita_ranking_solo', JSON.stringify([]));
    localStorage.setItem('lurdita_ranking_duelos', JSON.stringify([]));
  } catch (e) {
    console.error("Erro ao resetar ranking no LocalStorage:", e);
  }

  // 2. Se Firebase Firestore estiver ativo, deleta todos os documentos das coleções
  if (isFirebaseConnected && db) {
    try {
      const soloSnap = await db.collection("ranking_solo").get();
      const soloPromises = [];
      soloSnap.forEach(doc => soloPromises.push(doc.ref.delete()));
      await Promise.all(soloPromises);
    } catch (e) {
      console.warn("Aviso ao limpar ranking_solo no Firestore:", e);
    }

    try {
      const duelSnap = await db.collection("ranking_duelos").get();
      const duelPromises = [];
      duelSnap.forEach(doc => duelPromises.push(doc.ref.delete()));
      await Promise.all(duelPromises);
    } catch (e) {
      console.warn("Aviso ao limpar ranking_duelos no Firestore:", e);
    }
  }

  // 3. Notifica abas sincronizadas via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
    } catch (e) {}
  }

  // 4. Renderiza imediatamente as tabelas vazias na interface
  renderSoloRankingTable([]);
  renderRecentRankingTable([]);
  renderDuelRankingTable([]);
}

// Exibe notificação toast estilo fliperama
let toastNoticeTimeout = null;
function showToastNotice(message, icon = '✅') {
  const toast = document.getElementById('arcade-toast-notice');
  const iconEl = document.getElementById('toast-notice-icon');
  const textEl = document.getElementById('toast-notice-text');
  if (!toast) return;

  if (iconEl) iconEl.textContent = icon;
  if (textEl) textEl.textContent = message;

  toast.classList.add('show');
  if (toastNoticeTimeout) clearTimeout(toastNoticeTimeout);
  toastNoticeTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Funções do Modal de Senha do Professor
function openResetRankingsModal() {
  sounds.click();
  const modal = document.getElementById('modal-reset-rankings');
  const input = document.getElementById('input-reset-password');
  const errorMsg = document.getElementById('reset-password-error');
  const confirmBtn = document.getElementById('btn-confirm-reset');

  if (!modal || !input) return;

  input.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<span>🗑️</span> Confirmar e Zerar';
  }

  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 100);
}

function closeResetRankingsModal() {
  sounds.click();
  const modal = document.getElementById('modal-reset-rankings');
  const input = document.getElementById('input-reset-password');
  const errorMsg = document.getElementById('reset-password-error');

  if (modal) modal.style.display = 'none';
  if (input) input.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
}

async function handleConfirmReset(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('input-reset-password');
  const errorMsg = document.getElementById('reset-password-error');
  const confirmBtn = document.getElementById('btn-confirm-reset');

  if (!input) return;

  const enteredPassword = input.value.trim();

  // Validação da senha solicitada: prof123
  if (enteredPassword !== 'prof123') {
    sounds.wrong();
    if (errorMsg) {
      errorMsg.style.display = 'flex';
      errorMsg.classList.remove('shake');
      void errorMsg.offsetWidth; // reiniciar animação de shake
      errorMsg.classList.add('shake');
    }
    input.focus();
    input.select();
    return;
  }

  // Senha correta: executa o reset das tabelas
  try {
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span>⏳</span> Zerando tabelas...';
    }

    await resetAllRankings();

    sounds.coin();
    closeResetRankingsModal();
    showToastNotice("Tabelas zeradas! Cópia salva no Histórico de Rankings.", "📜");
  } catch (err) {
    console.error("Erro ao zerar tabelas:", err);
    alert("Ocorreu um erro ao zerar as tabelas. Tente novamente.");
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span>🗑️</span> Confirmar e Zerar';
    }
  }
}

// Funções do Modal de Histórico de Rankings Arquivados
async function openRankingsHistoryModal() {
  sounds.click();
  const modal = document.getElementById('modal-rankings-history');
  const container = document.getElementById('rankings-history-content');
  if (!modal || !container) return;

  modal.style.display = 'flex';
  container.innerHTML = `
    <div style="text-align: center; padding: 28px 16px; color: var(--text-muted); font-size: 0.95rem;">
      <span style="display: block; font-size: 2rem; margin-bottom: 8px;">⏳</span>
      Carregando histórico de rankings arquivados...
    </div>
  `;

  try {
    const historyList = await fetchRankingsHistory();
    renderRankingsHistoryList(historyList);
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
    container.innerHTML = `
      <div class="history-empty-state">
        <span style="font-size: 2rem;">⚠️</span>
        <p>Não foi possível carregar o histórico de rankings arquivados.</p>
      </div>
    `;
  }
}

function closeRankingsHistoryModal() {
  sounds.click();
  const modal = document.getElementById('modal-rankings-history');
  if (modal) modal.style.display = 'none';
}

function renderRankingsHistoryList(historyList) {
  const container = document.getElementById('rankings-history-content');
  if (!container) return;

  if (!historyList || historyList.length === 0) {
    container.innerHTML = `
      <div class="history-empty-state" style="text-align: center; padding: 32px 20px; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1;">
        <span style="font-size: 2.4rem; display: block; margin-bottom: 12px;">📜</span>
        <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--primary-navy); margin-bottom: 6px;">
          Nenhum histórico arquivado ainda
        </h4>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto; line-height: 1.5;">
          Toda vez que o professor clicar em <strong>"Zerar Tabelas"</strong>, uma cópia completa de segurança com todos os estudantes e pontuações da rodada será arquivada aqui automaticamente para consulta!
        </p>
      </div>
    `;
    return;
  }

  let html = `<div class="history-cards-container" style="display: flex; flex-direction: column; gap: 14px;">`;

  historyList.forEach((entry, idx) => {
    const roundNumber = historyList.length - idx;
    const rankings = entry.rankings || [];
    const dateFormatted = entry.dateFormatted || (entry.timestamp ? new Date(entry.timestamp).toLocaleString('pt-BR') : 'Data não informada');
    const totalParticipants = entry.totalParticipants || rankings.length;
    const champion = entry.champion || (rankings[0] ? `${rankings[0].name} (${rankings[0].score}/10)` : 'Nenhum');
    const roundId = entry.id || `round_${idx}`;

    html += `
      <div class="history-round-card">
        <div class="history-round-header">
          <div>
            <div class="history-round-badge">RODADA ARQUIVADA #${roundNumber}</div>
            <h4 class="history-round-title">🗓️ ${escapeHtml(dateFormatted)}</h4>
          </div>
          <div class="history-header-meta">
            <span class="history-pill-students">👥 ${totalParticipants} estudantes</span>
          </div>
        </div>

        <div class="history-champion-box">
          <span class="history-champ-icon">🥇</span>
          <div style="flex: 1;">
            <strong style="color: #b45309; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.6px; display: block;">Campeão(ã) da Rodada:</strong>
            <span style="font-size: 0.95rem; font-weight: 700; color: var(--primary-navy);">${escapeHtml(champion)}</span>
          </div>
        </div>

        <div class="history-actions-row">
          <button type="button" class="btn-history-toggle" onclick="toggleHistoryRoundDetails('${roundId}')">
            <span id="hist-toggle-icon-${roundId}">👁️</span>
            <span id="hist-toggle-text-${roundId}">Ver Classificação Completa (${rankings.length})</span>
          </button>
        </div>

        <div id="hist-details-${roundId}" class="history-details-table-wrap" style="display: none;">
          <div class="table-responsive" style="max-height: 260px; overflow-y: auto;">
            <table class="ranking-table projection-table history-table">
              <thead>
                <tr>
                  <th style="width: 50px; text-align: center;">Pos.</th>
                  <th>Estudante</th>
                  <th style="text-align: center; width: 125px;">Acertos / Pts</th>
                  <th style="text-align: center; width: 85px;">Tempo</th>
                </tr>
              </thead>
              <tbody>
                ${rankings.map((p, pIdx) => {
                  const pos = pIdx + 1;
                  const posClass = pos === 1 ? 'rank-1' : pos === 2 ? 'rank-2' : pos === 3 ? 'rank-3' : 'rank-other';
                  const medal = pos === 1 ? '🥇 ' : pos === 2 ? '🥈 ' : pos === 3 ? '🥉 ' : '';
                  const timeFormatted = formatTime(p.timeSeconds || 0);
                  const gradeInfo = p.grade ? `<span class="badge-grade" style="font-size: 0.72rem; padding: 2px 6px;">${escapeHtml(p.grade)}</span>` : '';
                  return `
                    <tr>
                      <td style="text-align: center;"><span class="rank-badge ${posClass}">${pos}º</span></td>
                      <td>
                        <div class="player-cell">
                          <span class="player-name">${medal}${escapeHtml(p.name)}</span>
                          <div class="player-school">
                            <span>${escapeHtml(p.school || 'PEI Lurdita')}</span>
                            ${gradeInfo}
                          </div>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <strong style="color: var(--primary-navy);">${p.score}/10</strong>
                        <span style="display: block; font-size: 0.76rem; color: var(--text-muted); font-family: var(--font-pixel);">${p.arcadeScore || 0} PTS</span>
                      </td>
                      <td style="text-align: center; font-family: var(--font-pixel); font-size: 0.82rem; color: var(--text-muted);">${timeFormatted}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Expande ou recolhe a tabela detalhada de uma rodada arquivada
function toggleHistoryRoundDetails(id) {
  sounds.click();
  const detailsEl = document.getElementById(`hist-details-${id}`);
  const iconEl = document.getElementById(`hist-toggle-icon-${id}`);
  const textEl = document.getElementById(`hist-toggle-text-${id}`);
  if (!detailsEl) return;

  const isHidden = detailsEl.style.display === 'none';
  if (isHidden) {
    detailsEl.style.display = 'block';
    if (iconEl) iconEl.textContent = '▲';
    if (textEl) textEl.textContent = 'Ocultar Classificação';
  } else {
    detailsEl.style.display = 'none';
    if (iconEl) iconEl.textContent = '👁️';
    if (textEl) textEl.textContent = 'Ver Classificação Completa';
  }
}

// Funções do Modal de Exclusão Individual de Resultados
let pendingDeleteTarget = null;

function openDeleteSingleModal(target) {
  pendingDeleteTarget = target;
  sounds.click();
  const modal = document.getElementById('modal-delete-single');
  const nameEl = document.getElementById('delete-target-player-name');
  const input = document.getElementById('input-delete-single-password');
  const errorMsg = document.getElementById('delete-single-password-error');
  const confirmBtn = document.getElementById('btn-confirm-delete-single');

  if (nameEl) nameEl.textContent = target.name || 'Estudante';
  if (input) input.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<span>🗑️</span> Confirmar Exclusão';
  }

  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      if (input) input.focus();
    }, 100);
  }
}

function closeDeleteSingleModal() {
  sounds.click();
  const modal = document.getElementById('modal-delete-single');
  const input = document.getElementById('input-delete-single-password');
  const errorMsg = document.getElementById('delete-single-password-error');

  if (modal) modal.style.display = 'none';
  if (input) input.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
  pendingDeleteTarget = null;
}

async function handleConfirmDeleteSingle(e) {
  if (e) e.preventDefault();
  if (!pendingDeleteTarget) return;

  const input = document.getElementById('input-delete-single-password');
  const errorMsg = document.getElementById('delete-single-password-error');
  const confirmBtn = document.getElementById('btn-confirm-delete-single');

  if (!input) return;
  const enteredPassword = input.value.trim();

  // Senha do Professor: prof123
  if (enteredPassword !== 'prof123') {
    sounds.wrong();
    if (errorMsg) {
      errorMsg.style.display = 'flex';
      errorMsg.classList.remove('shake');
      void errorMsg.offsetWidth;
      errorMsg.classList.add('shake');
    }
    input.focus();
    input.select();
    return;
  }

  try {
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span>⏳</span> Excluindo...';
    }

    const { docId, name, score, timeSeconds, timestamp } = pendingDeleteTarget;

    // 1. Exclui do Firestore se conectado
    if (isFirebaseConnected && db && docId && !docId.startsWith('local_')) {
      try {
        await db.collection("ranking_solo").doc(docId).delete();
      } catch (err) {
        console.warn("Aviso ao remover documento no Firestore:", err);
      }
    }

    // 2. Exclui do localStorage
    try {
      const localList = getLocalSoloRankings();
      const updatedList = localList.filter(item => {
        if (docId && item.docId && item.docId === docId) return false;
        if (item.name === name && item.score === score && item.timeSeconds === timeSeconds) {
          if (timestamp && item.timestamp && item.timestamp === timestamp) return false;
          return false;
        }
        return true;
      });
      localStorage.setItem('lurdita_ranking_solo', JSON.stringify(updatedList));
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
    } catch (err) {
      console.warn("Erro ao atualizar localStorage após exclusão:", err);
    }

    sounds.coin();
    closeDeleteSingleModal();
    showToastNotice(`Resultado de ${name} excluído com sucesso!`, "🗑️");

    // Recarrega os rankings imediatamente
    const soloList = await fetchSoloRankings();
    renderSoloRankingTable(soloList);
    renderRecentRankingTable(soloList);
  } catch (err) {
    console.error("Erro ao excluir registro individual:", err);
    alert("Ocorreu um erro ao excluir o registro. Tente novamente.");
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span>🗑️</span> Confirmar Exclusão';
    }
  }
}

async function fetchDuelRankings() {
  let list = [];
  if (isFirebaseConnected && db) {
    try {
      const snap = await db.collection("ranking_duelos").get();
      snap.forEach(doc => list.push(doc.data()));
    } catch (e) {
      list = getLocalDuelRankings();
    }
  } else {
    list = getLocalDuelRankings();
  }

  // Ordena mais recentes primeiro
  list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return list;
}

/* --------------------------------------------------------------------------
   12. SINCRONIZAÇÃO EM TEMPO REAL DO MODO 2 JOGADORES (DUELO COM CÓDIGO DE 4 DÍGITOS)
   -------------------------------------------------------------------------- */

// Gera código alfanumérico compacto de 4 dígitos (ex: K7P2)
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 caracteres nítidos (sem 0/O, 1/I)
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Garante que o código de 4 dígitos não colida com outra sala ativa
async function generateUniqueRoomCode() {
  for (let i = 0; i < 6; i++) {
    const code = generateRoomCode();
    if (isFirebaseConnected && db) {
      try {
        const snap = await db.collection("salas_duelo").doc(code).get();
        if (!snap.exists) return code;
        const data = snap.data();
        if (Date.now() - (data.updatedAt || 0) > 900000) return code;
      } catch (e) {
        return code;
      }
    } else {
      const local = localStorage.getItem('lurdita_room_' + code);
      if (!local) return code;
    }
  }
  return generateRoomCode();
}

// Exibe a tela com a Lista de Salas de Duelo Disponíveis
function showAvailableRoomsScreen() {
  sounds.select();
  gameState.mode = 'duel';
  gameState.duelSubMode = 'join';
  gameState.duel.roomCode = ''; // Limpa código anterior ao retornar à listagem de salas

  showScreen('screen-duel-rooms');
  loadAvailableDuelRooms();

  // Inicia atualização contínua da lista a cada 2 segundos enquanto nesta tela
  stopRoomsListPolling();
  gameState.duel.roomsListInterval = setInterval(() => {
    if (gameState.currentScreen === 'screen-duel-rooms') {
      loadAvailableDuelRooms();
    } else {
      stopRoomsListPolling();
    }
  }, 2000);

  // Escuta em tempo real no Firestore se conectado
  if (isFirebaseConnected && db) {
    try {
      if (gameState.duel.unsubscribeRoomsList) gameState.duel.unsubscribeRoomsList();
      gameState.duel.unsubscribeRoomsList = db.collection("salas_duelo")
        .where("status", "==", "waiting")
        .onSnapshot(() => {
          if (gameState.currentScreen === 'screen-duel-rooms') {
            loadAvailableDuelRooms();
          }
        }, err => console.warn("Aviso no listener de salas disponíveis:", err));
    } catch (e) {}
  }
}

// Carrega a lista de salas de duelo abertas (Firestore + Armazenamento Local)
async function loadAvailableDuelRooms(showFeedbackToast = false) {
  const container = document.getElementById('duel-rooms-container');
  const countEl = document.getElementById('duel-rooms-count');
  if (!container) return;

  if (showFeedbackToast) {
    showToastNotice("Atualizando salas abertas...", "🔍");
  }

  const roomsMap = new Map();
  const now = Date.now();

  // 1. Busca no Firestore se conectado
  if (isFirebaseConnected && db) {
    try {
      const snap = await db.collection("salas_duelo")
        .where("status", "==", "waiting")
        .get();

      snap.forEach(doc => {
        const data = doc.data();
        if (data && data.player1 && !data.player2 && (now - (data.updatedAt || now) < 900000)) {
          const roomCode = (data.roomCode || doc.id || '').toUpperCase().trim();
          data.roomCode = roomCode;
          roomsMap.set(roomCode, data);
        }
      });
    } catch (e) {
      console.warn("Erro ao buscar salas no Firestore:", e);
    }
  }

  // 2. Busca também no localStorage (contingência offline / mesma máquina)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lurdita_room_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data && data.status === 'waiting' && data.player1 && !data.player2 && (now - (data.updatedAt || now) < 900000)) {
              const code = (data.roomCode || key.replace('lurdita_room_', '') || '').toUpperCase().trim();
              if (code && !roomsMap.has(code)) {
                data.roomCode = code;
                roomsMap.set(code, data);
              }
            }
          }
        } catch (err) {}
      }
    }
  } catch (e) {}

  const availableRooms = Array.from(roomsMap.values());
  // Ordena pelas mais recentes criadas
  availableRooms.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (countEl) {
    if (availableRooms.length === 0) {
      countEl.textContent = "0 salas abertas";
    } else {
      countEl.textContent = `${availableRooms.length} ${availableRooms.length === 1 ? 'sala aberta' : 'salas abertas'}`;
    }
  }

  if (availableRooms.length === 0) {
    container.innerHTML = `
      <div class="duel-empty-rooms">
        <div class="empty-icon" style="font-size: 2.8rem; margin-bottom: 8px; animation: waitingSpin 3s infinite ease-in-out;">⏳</div>
        <h4 style="color: var(--primary-navy); font-size: 1.2rem; margin-bottom: 6px;">Nenhuma sala aberta no momento</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 440px; margin: 0 auto 16px;">
          Peça para o outro aluno tocar em <strong>"Criar Novo Duelo"</strong> no tablet dele. Assim que a sala for criada, o nome dele aparecerá aqui nesta lista automaticamente!
        </p>
        <button type="button" id="btn-empty-retry" class="btn-secondary arcade-btn-secondary" style="padding: 9px 18px;">
          <span>🔄</span> Procurar Salas Novamente
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('btn-empty-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => loadAvailableDuelRooms(true));
    }
    return;
  }

  // Renderiza os cards das salas encontradas com o nome do Aluno 1 em destaque
  container.innerHTML = availableRooms.map(room => {
    const p1 = room.player1 || {};
    const p1Name = escapeHtml(p1.name || 'Jogador 1');
    const p1School = escapeHtml(p1.school || '-');
    const p1Grade = p1.grade ? ` • ${escapeHtml(p1.grade)}` : '';
    const roomCode = escapeHtml((room.roomCode || '').toUpperCase().trim());

    return `
      <div class="duel-room-card arcade-fighter-card" data-code="${roomCode}" data-host="${p1Name}" role="button" tabindex="0">
        <div class="room-card-info">
          <div class="room-host-badge">👑 JOGADOR 1 (CRIADOR DA SALA)</div>
          <div class="room-host-name">${p1Name}</div>
          <div class="room-host-meta">🏫 ${p1School}${p1Grade}</div>
          <div class="room-code-tag">🔑 SALA #${roomCode}</div>
        </div>
        <button type="button" class="btn-join-room-card arcade-push-btn pulse-arcade" data-code="${roomCode}" data-host="${p1Name}">
          <span>⚔️</span> DESAFIAR (ENTRAR)
        </button>
      </div>
    `;
  }).join('');

  // Ativa os cliques em todo o card ou no botão interno
  container.querySelectorAll('.duel-room-card').forEach(card => {
    const selectCard = (e) => {
      e.preventDefault();
      const code = card.getAttribute('data-code');
      const host = card.getAttribute('data-host') || 'Colega';
      handleSelectDuelRoom(code, host);
    };

    card.addEventListener('click', selectCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        selectCard(e);
      }
    });
  });
}

// Seleciona uma sala clicada na lista de salas abertas
function handleSelectDuelRoom(roomCode, hostName) {
  sounds.select();
  stopRoomsListPolling();

  const cleanCode = (roomCode || '').toString().trim().toUpperCase();
  gameState.mode = 'duel';
  gameState.duelSubMode = 'join';
  gameState.duel.roomCode = cleanCode;

  // Preenche o campo de código do duelo (mantendo-o oculto para não ter que digitar)
  const duelInput = document.getElementById('input-duel-code');
  if (duelInput) {
    duelInput.value = cleanCode;
    duelInput.required = false;
  }
  const groupDuelCode = document.getElementById('group-duel-code');
  if (groupDuelCode) {
    groupDuelCode.style.display = 'none';
  }

  // Se o aluno já tiver seu nome e escola informados nesta sessão, entra imediatamente no lobby
  if (gameState.player.name && gameState.player.school) {
    enterDuelLobby('join', cleanCode);
    return;
  }

  // Caso ainda não tenha inserido o nome, abre tela de cadastro com destaque de quem está desafiando
  document.getElementById('register-badge-mode').innerHTML = `<span>🎯</span> DESAFIANDO: ${escapeHtml(hostName).toUpperCase()} (SALA #${cleanCode})`;
  document.getElementById('register-title').textContent = 'INSIRA SEU NICKNAME';
  const regDesc = document.getElementById('register-desc');
  if (regDesc) {
    regDesc.textContent = `Digite seu nome e escolha sua escola para entrar na arena contra ${hostName}!`;
  }
  document.getElementById('btn-register-action-text').textContent = `ENTRAR NO DUELO COM ${hostName.toUpperCase()} ⚔️`;

  showScreen('screen-register');
  handleSchoolSelectChange();

  setTimeout(() => {
    const nameInput = document.getElementById('input-player-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

// Entra no Lobby de Duelo (Ação: 'create' ou 'join')
async function enterDuelLobby(action, enteredCode) {
  stopLobbyPolling();
  gameState.duel.isStarting = false;

  const pName = gameState.player.name;
  const pSchool = gameState.player.school;
  const pGrade = gameState.player.grade;
  const pId = gameState.player.id;

  if (action === 'create') {
    gameState.duel.isPlayer1 = true;
    const roomCode = await generateUniqueRoomCode();
    gameState.duel.roomCode = roomCode;
  } else {
    gameState.duel.isPlayer1 = false;
    gameState.duel.roomCode = (enteredCode || '').trim().toUpperCase();
  }

  const code = gameState.duel.roomCode;
  
  // Atualiza elementos visuais do Lobby com o código de 4 dígitos
  const codeDisplayEl = document.getElementById('lobby-code-display');
  if (codeDisplayEl) codeDisplayEl.textContent = code;

  // Garante estado visual inicial
  const waitingBox = document.getElementById('lobby-waiting-actions');
  const readyBox = document.getElementById('lobby-ready-actions');
  if (waitingBox) waitingBox.style.display = 'flex';
  if (readyBox) readyBox.style.display = 'none';

  const startBtn = document.getElementById('btn-start-duel');
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.innerHTML = '<span>🔥</span> READY... FIGHT! (INICIAR DUELO AGORA)';
  }

  if (action === 'create') {
    document.getElementById('lobby-heading').textContent = "SALA CRIADA! PROCURANDO OPONENTE...";
    document.getElementById('lobby-subheading').textContent = `Código gerado: [ ${code} ]. Aguardando o Player 2 conectar...`;
    document.getElementById('lobby-code-helper').textContent = "📢 Passe este código de 4 dígitos para o outro aluno digitar no tablet dele!";
    const waitingMsg = document.getElementById('lobby-waiting-msg');
    if (waitingMsg) waitingMsg.textContent = "Aguardando o 2º aluno entrar com o código de 4 dígitos...";
    document.getElementById('lobby-p1-name').textContent = pName;
    document.getElementById('lobby-p1-school').textContent = `${pSchool}${pGrade ? ' • ' + pGrade : ''}`;
    document.getElementById('lobby-p2-name').textContent = "Aguardando entrada...";
    document.getElementById('lobby-p2-school').textContent = "-";
    document.getElementById('card-lobby-p2').classList.remove('ready');
  } else {
    document.getElementById('lobby-heading').textContent = "Conectando ao Duelo...";
    document.getElementById('lobby-subheading').textContent = `Buscando sala [ ${code} ]...`;
    document.getElementById('lobby-code-helper').textContent = "Validando código com a arena...";
    const waitingMsg = document.getElementById('lobby-waiting-msg');
    if (waitingMsg) waitingMsg.textContent = "Conectando à sala e sincronizando oponentes...";
    document.getElementById('lobby-p2-name').textContent = pName;
    document.getElementById('lobby-p2-school').textContent = `${pSchool}${pGrade ? ' • ' + pGrade : ''}`;
    document.getElementById('card-lobby-p2').classList.add('ready');
  }

  showScreen('screen-lobby');
  sounds.click();

  // Inicia polling ativo a cada 1s para garantir sincronização entre os dois dispositivos
  startLobbyPolling(code);

  if (isFirebaseConnected && db) {
    const success = await joinFirestoreLobby(pName, pSchool, pGrade, pId, action, code);
    if (!success) {
      stopLobbyPolling();
      showScreen('screen-register');
    }
  } else {
    const success = joinLocalLobby(pName, pSchool, pGrade, pId, action, code);
    if (!success) {
      stopLobbyPolling();
      showScreen('screen-register');
    }
  }
}

// Sala via Firestore em Tempo Real
async function joinFirestoreLobby(name, school, grade, id, action, code) {
  const roomDocRef = db.collection("salas_duelo").doc(code);
  gameState.duel.roomRef = roomDocRef;
  const now = Date.now();

  if (action === 'create') {
    gameState.duel.isPlayer1 = true;
    const questions = prepareQuestions(); // Sorteia as perguntas para a partida
    const initialRoom = {
      roomCode: code,
      status: 'waiting',
      createdAt: now,
      updatedAt: now,
      questions: questions,
      player1: {
        id: id,
        name: name,
        school: school,
        grade: grade || '',
        score: null,
        timeSeconds: null,
        finished: false
      },
      player2: null
    };

    try {
      await roomDocRef.set(initialRoom);
      localStorage.setItem('lurdita_room_' + code, JSON.stringify(initialRoom));
      broadcastLocalRoom(initialRoom);
      onRoomStateUpdate(initialRoom);
    } catch (err) {
      console.error("Erro ao criar sala no Firestore:", err);
      alert("Erro ao criar sala online. Usando modo de rede local.");
      return joinLocalLobby(name, school, grade, id, action, code);
    }
  } else {
    // ENTRAR EM SALA EXISTENTE (PLAYER 2)
    try {
      const snap = await roomDocRef.get();
      if (!snap.exists) {
        alert(`❌ Sala com código "${code}" não foi encontrada!\nVerifique se o código de 4 dígitos foi digitado corretamente.`);
        return false;
      }

      const roomData = snap.data();
      if (roomData.status !== 'waiting' || roomData.player2) {
        alert(`⚠️ A sala "${code}" já começou ou já possui 2 participantes.`);
        return false;
      }

      if (now - (roomData.updatedAt || now) > 900000) {
        alert(`⚠️ A sala "${code}" expirou. Peça ao Player 1 para criar uma nova.`);
        return false;
      }

      gameState.duel.isPlayer1 = false;
      const updatedData = {
        ...roomData,
        status: 'ready',
        updatedAt: now,
        player2: {
          id: id,
          name: name,
          school: school,
          grade: grade || '',
          score: null,
          timeSeconds: null,
          finished: false
        }
      };

      await roomDocRef.update({
        status: 'ready',
        updatedAt: now,
        player2: updatedData.player2
      });

      // Atualiza IMEDIATAMENTE a tela do Player 2 sem atraso
      localStorage.setItem('lurdita_room_' + code, JSON.stringify(updatedData));
      broadcastLocalRoom(updatedData);
      onRoomStateUpdate(updatedData);

    } catch (err) {
      console.error("Erro ao entrar na sala Firestore:", err);
      alert("Erro ao conectar à sala online. Verifique sua conexão.");
      return false;
    }
  }

  // Escuta alterações em tempo real via snapshot com callback de erro
  if (gameState.duel.unsubscribeRoom) gameState.duel.unsubscribeRoom();
  gameState.duel.unsubscribeRoom = roomDocRef.onSnapshot(docSnapshot => {
    if (!docSnapshot.exists) return;
    const data = docSnapshot.data();
    onRoomStateUpdate(data);
  }, error => {
    console.warn("⚠️ Aviso no snapshot Firestore do duelo:", error);
  });

  return true;
}

// Fallback de Sala Local / BroadcastChannel para tablets ou testes no mesmo navegador
function joinLocalLobby(name, school, grade, id, action, code) {
  const key = 'lurdita_room_' + code;
  const now = Date.now();

  if (action === 'create') {
    gameState.duel.isPlayer1 = true;
    const questions = prepareQuestions();
    const localRoom = {
      roomCode: code,
      status: 'waiting',
      createdAt: now,
      updatedAt: now,
      questions: questions,
      player1: { id, name, school, grade: grade || '', score: null, timeSeconds: null, finished: false },
      player2: null
    };
    localStorage.setItem(key, JSON.stringify(localRoom));
    broadcastLocalRoom(localRoom);
    onRoomStateUpdate(localRoom);
    return true;
  } else {
    let localRoom = null;
    try {
      const raw = localStorage.getItem(key);
      localRoom = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    if (!localRoom) {
      alert(`❌ Sala local com código "${code}" não foi encontrada!\nVerifique se o primeiro aluno já criou a sala.`);
      return false;
    }

    if (localRoom.status !== 'waiting' || localRoom.player2) {
      alert(`⚠️ A sala "${code}" já começou ou já possui 2 participantes.`);
      return false;
    }

    gameState.duel.isPlayer1 = false;
    localRoom.status = 'ready';
    localRoom.updatedAt = now;
    localRoom.player2 = { id, name, school, grade: grade || '', score: null, timeSeconds: null, finished: false };
    localStorage.setItem(key, JSON.stringify(localRoom));
    broadcastLocalRoom(localRoom);
    onRoomStateUpdate(localRoom);
    return true;
  }
}

function broadcastLocalRoom(roomData) {
  if (broadcastChannel && roomData && roomData.roomCode) {
    broadcastChannel.postMessage({ type: 'ROOM_UPDATE', roomCode: roomData.roomCode, data: roomData });
  }
}

function handleBroadcastMessage(event) {
  if (event.data && event.data.type === 'ROOM_UPDATE') {
    if (gameState.duel.roomCode && event.data.roomCode === gameState.duel.roomCode) {
      onRoomStateUpdate(event.data.data);
    }
  } else if (event.data && event.data.type === 'RANKING_UPDATE') {
    if (gameState.currentScreen === 'screen-rankings') {
      loadRankingsUI();
    }
  }
}

// Polling ativo a cada 1 segundo no Lobby para máxima confiabilidade
function startLobbyPolling(code) {
  stopLobbyPolling();
  gameState.duel.pollInterval = setInterval(async () => {
    if (gameState.currentScreen !== 'screen-lobby') {
      stopLobbyPolling();
      return;
    }

    if (isFirebaseConnected && db) {
      try {
        const snap = await db.collection("salas_duelo").doc(code).get();
        if (snap.exists) {
          onRoomStateUpdate(snap.data());
        }
      } catch (e) {
        try {
          const raw = localStorage.getItem('lurdita_room_' + code);
          if (raw) onRoomStateUpdate(JSON.parse(raw));
        } catch (err) {}
      }
    } else {
      try {
        const raw = localStorage.getItem('lurdita_room_' + code);
        if (raw) onRoomStateUpdate(JSON.parse(raw));
      } catch (err) {}
    }
  }, 1000);
}

// Contagem regressiva automática quando os dois jogadores estão prontos no lobby
function startDuelAutoCountdown() {
  if (gameState.duel.countdownInterval) return; // Já está rodando

  let secondsLeft = 4;
  const countdownTextEl = document.getElementById('lobby-countdown-text');
  if (countdownTextEl) {
    countdownTextEl.textContent = `⚡ OPONENTES PRONTOS! INICIANDO EM ${secondsLeft}s... (OU CLIQUE ABAIXO)`;
  }

  gameState.duel.countdownInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft > 0) {
      if (countdownTextEl) {
        countdownTextEl.textContent = `⚡ OPONENTES PRONTOS! INICIANDO EM ${secondsLeft}s... (OU CLIQUE ABAIXO)`;
      }
    } else {
      if (countdownTextEl) {
        countdownTextEl.textContent = `🔥 READY... FIGHT!`;
      }
      clearInterval(gameState.duel.countdownInterval);
      gameState.duel.countdownInterval = null;
      triggerStartDuel();
    }
  }, 1000);
}

// Disparo seguro e sincronizado do início do Duelo
async function triggerStartDuel() {
  if (gameState.duel.isStarting) return;
  gameState.duel.isStarting = true;

  stopLobbyPolling();

  const startBtn = document.getElementById('btn-start-duel');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.innerHTML = '<span>🚀</span> INICIANDO ARENA...';
  }

  sounds.fanfare();

  const code = gameState.duel.roomCode;
  const currentData = gameState.duel.currentRoomData || {};
  const updatedData = { ...currentData, status: 'playing' };

  if (isFirebaseConnected && db && gameState.duel.roomRef) {
    try {
      await gameState.duel.roomRef.update({ status: 'playing' });
    } catch (e) {
      console.warn("Aviso ao atualizar status playing no Firestore:", e);
    }
  }

  const key = 'lurdita_room_' + code;
  try {
    let localRoom = JSON.parse(localStorage.getItem(key) || '{}');
    localRoom.status = 'playing';
    localStorage.setItem(key, JSON.stringify(localRoom));
    broadcastLocalRoom(localRoom);
  } catch (e) {}

  // Inicia diretamente na tela do quiz do jogador que disparou
  startDuelQuiz(updatedData);
  gameState.duel.isStarting = false;
}

// Trata qualquer atualização da sala de duelo recebida
function onRoomStateUpdate(data) {
  if (!data) return;
  gameState.duel.currentRoomData = data;

  const roomCode = data.roomCode || gameState.duel.roomCode;
  const p1 = data.player1;
  const p2 = data.player2;

  // Atualiza visual do código da sala no Lobby e no HUD
  const codeEl = document.getElementById('lobby-code-display');
  if (codeEl && roomCode) {
    codeEl.textContent = roomCode;
  }
  const quizRoomTag = document.getElementById('quiz-room-code-tag');
  if (quizRoomTag && roomCode) {
    quizRoomTag.textContent = roomCode;
  }

  // Atualiza visual dos Jogadores no Lobby
  if (p1) {
    document.getElementById('lobby-p1-name').textContent = p1.name;
    document.getElementById('lobby-p1-school').textContent = `${p1.school}${p1.grade ? ' • ' + p1.grade : ''}`;
  }
  if (p2) {
    document.getElementById('lobby-p2-name').textContent = p2.name;
    document.getElementById('lobby-p2-school').textContent = `${p2.school}${p2.grade ? ' • ' + p2.grade : ''}`;
    document.getElementById('card-lobby-p2').classList.add('ready');
  } else {
    document.getElementById('lobby-p2-name').textContent = "Aguardando entrada...";
    document.getElementById('lobby-p2-school').textContent = "-";
    document.getElementById('card-lobby-p2').classList.remove('ready');
  }

  const waitingBox = document.getElementById('lobby-waiting-actions');
  const readyBox = document.getElementById('lobby-ready-actions');

  // Status da sala
  if (data.status === 'waiting') {
    document.getElementById('lobby-heading').textContent = "Procurando Oponente...";
    document.getElementById('lobby-subheading').textContent = `Código [ ${roomCode} ] gerado! Aguardando o Player 2 conectar...`;
    document.getElementById('lobby-code-helper').textContent = "📢 Passe este código de 4 dígitos para o seu oponente digitar no tablet dele!";
    if (waitingBox) waitingBox.style.display = 'flex';
    if (readyBox) readyBox.style.display = 'none';
  } else if (data.status === 'ready') {
    sounds.bell();
    document.getElementById('lobby-heading').textContent = "Oponente Conectado! 🎉";
    document.getElementById('lobby-subheading').textContent = `${p1 ? p1.name : 'Player 1'} vs ${p2 ? p2.name : 'Player 2'}! Tudo pronto para o duelo!`;
    document.getElementById('lobby-code-helper').textContent = "✅ Ambos os estudantes estão na arena! O duelo vai começar!";
    
    if (waitingBox) waitingBox.style.display = 'none';
    if (readyBox) readyBox.style.display = 'block';

    const startBtn = document.getElementById('btn-start-duel');
    if (startBtn && !gameState.duel.isStarting) {
      startBtn.disabled = false;
      startBtn.innerHTML = '<span>🔥</span> READY... FIGHT! (INICIAR DUELO AGORA)';
    }

    startDuelAutoCountdown();
  } else if (data.status === 'playing') {
    stopLobbyPolling();
    if (gameState.currentScreen !== 'screen-quiz') {
      startDuelQuiz(data);
    }
  } else if (data.status === 'finished') {
    showDuelFinalResult(data);
  }

  // Se estivermos na tela de aguardar oponente no resultado
  if (gameState.currentScreen === 'screen-result-duel') {
    if (p1 && p2 && p1.finished && p2.finished) {
      showDuelFinalResult(data);
    }
  }
}

// Inicia o Quiz do Duelo
function startDuelQuiz(roomData) {
  stopLobbyPolling();
  prepareQuestions(roomData ? roomData.questions : null);
  
  // Oponente
  const isP1 = gameState.duel.isPlayer1;
  const opp = isP1 ? (roomData ? roomData.player2 : null) : (roomData ? roomData.player1 : null);
  const oppName = opp ? opp.name : 'Oponente';

  document.getElementById('quiz-opponent-name').textContent = oppName;
  const quizRoomTag = document.getElementById('quiz-room-code-tag');
  if (quizRoomTag) {
    quizRoomTag.textContent = gameState.duel.roomCode || '----';
  }
  document.getElementById('quiz-duel-indicator').style.display = 'block';

  showScreen('screen-quiz');
  renderCurrentQuestion();
  startTimer();
}

// Envio de finalização do jogador no duelo
async function submitDuelPlayerFinished(playerStats) {
  const isP1 = gameState.duel.isPlayer1;
  const code = gameState.duel.roomCode;

  if (isFirebaseConnected && db && gameState.duel.roomRef) {
    const updateField = isP1 ? 'player1' : 'player2';
    await gameState.duel.roomRef.update({
      [`${updateField}.score`]: playerStats.score,
      [`${updateField}.timeSeconds`]: playerStats.timeSeconds,
      [`${updateField}.finished`]: true
    });

    const snap = await gameState.duel.roomRef.get();
    const data = snap.data();
    if (data.player1 && data.player1.finished && data.player2 && data.player2.finished) {
      await gameState.duel.roomRef.update({ status: 'finished' });
    }
  } else {
    // Fallback Local
    const key = 'lurdita_room_' + code;
    let localRoom = JSON.parse(localStorage.getItem(key) || '{}');
    if (isP1 && localRoom.player1) {
      localRoom.player1.score = playerStats.score;
      localRoom.player1.timeSeconds = playerStats.timeSeconds;
      localRoom.player1.finished = true;
    } else if (!isP1 && localRoom.player2) {
      localRoom.player2.score = playerStats.score;
      localRoom.player2.timeSeconds = playerStats.timeSeconds;
      localRoom.player2.finished = true;
    }

    if (localRoom.player1 && localRoom.player2 && localRoom.player1.finished && localRoom.player2.finished) {
      localRoom.status = 'finished';
    }

    localStorage.setItem(key, JSON.stringify(localRoom));
    broadcastLocalRoom(localRoom);
    onRoomStateUpdate(localRoom);
  }
}

// Exibe o vencedor do duelo nas duas telas
function showDuelFinalResult(roomData) {
  document.getElementById('duel-waiting-opponent').style.display = 'none';
  document.getElementById('duel-final-result').style.display = 'block';
  sounds.fanfare();
  launchConfetti(5);

  const p1 = roomData.player1;
  const p2 = roomData.player2;

  document.getElementById('duel-res-p1-name').textContent = p1.name;
  document.getElementById('duel-res-p1-school').textContent = `${p1.school}${p1.grade ? ' • ' + p1.grade : ''}`;
  document.getElementById('duel-res-p1-stats').textContent = `Acertos: ${p1.score}/${QUESTIONS_PER_GAME} • Tempo: ${formatTime(p1.timeSeconds)}`;

  document.getElementById('duel-res-p2-name').textContent = p2.name;
  document.getElementById('duel-res-p2-school').textContent = `${p2.school}${p2.grade ? ' • ' + p2.grade : ''}`;
  document.getElementById('duel-res-p2-stats').textContent = `Acertos: ${p2.score}/${QUESTIONS_PER_GAME} • Tempo: ${formatTime(p2.timeSeconds)}`;

  const cardP1 = document.getElementById('duel-card-p1');
  const cardP2 = document.getElementById('duel-card-p2');
  const crownP1 = document.getElementById('p1-crown');
  const crownP2 = document.getElementById('p2-crown');

  cardP1.classList.remove('winner');
  cardP2.classList.remove('winner');
  crownP1.style.display = 'none';
  crownP2.style.display = 'none';

  let winner = null;
  let isTie = false;

  if (p1.score > p2.score) {
    winner = p1;
  } else if (p2.score > p1.score) {
    winner = p2;
  } else {
    // Empate no score -> critério de desempate por menor tempo
    if (p1.timeSeconds < p2.timeSeconds) {
      winner = p1;
    } else if (p2.timeSeconds < p1.timeSeconds) {
      winner = p2;
    } else {
      isTie = true;
    }
  }

  const titleEl = document.getElementById('duel-winner-title');
  const subEl = document.getElementById('duel-winner-subtitle');

  if (isTie) {
    titleEl.textContent = "Incrível Empate Técnico! 🤝";
    subEl.textContent = `Ambos os estudantes tiveram ${p1.score} acertos no mesmo tempo! Parabéns às duas escolas!`;
    cardP1.classList.add('winner');
    cardP2.classList.add('winner');
  } else {
    titleEl.textContent = `Vitória de ${winner.name}! 🏆`;
    subEl.textContent = `Representando com orgulho a escola: ${winner.school}${winner.grade ? ' (' + winner.grade + ')' : ''}!`;

    if (winner === p1) {
      cardP1.classList.add('winner');
      crownP1.style.display = 'block';
    } else {
      cardP2.classList.add('winner');
      crownP2.style.display = 'block';
    }

    // Salvar no histórico de duelos apenas pelo jogador 1 para não duplicar
    if (gameState.duel.isPlayer1) {
      saveDuelResult({
        timestamp: new Date().toISOString(),
        winnerName: winner.name,
        winnerSchool: winner.school,
        winnerGrade: winner.grade || '',
        winnerScore: winner.score,
        p1Name: p1.name,
        p1School: p1.school,
        p1Grade: p1.grade || '',
        p1Score: p1.score,
        p1Time: p1.timeSeconds,
        p2Name: p2.name,
        p2School: p2.school,
        p2Grade: p2.grade || '',
        p2Score: p2.score,
        p2Time: p2.timeSeconds
      });
    }
  }
}

/* --------------------------------------------------------------------------
   13. TELA DE RANKINGS & RENDERIZAÇÃO DAS TABELAS (PROJEÇÃO NA PAREDE)
   -------------------------------------------------------------------------- */
async function loadRankingsUI() {
  sounds.click();
  showScreen('screen-rankings');

  // Renderiza imediatamente estado de carregamento se estiver vazio
  const soloTbody = document.getElementById('ranking-solo-tbody');
  const recentTbody = document.getElementById('ranking-recent-tbody');
  const duelTbody = document.getElementById('ranking-duel-tbody');

  if (soloTbody && !soloTbody.children.length) {
    soloTbody.innerHTML = '<tr><td colspan="5" class="empty-state">Carregando classificação geral...</td></tr>';
  }
  if (recentTbody && !recentTbody.children.length) {
    recentTbody.innerHTML = '<tr><td colspan="5" class="empty-state">Carregando partidas recentes...</td></tr>';
  }
  if (duelTbody && !duelTbody.children.length) {
    duelTbody.innerHTML = '<tr><td colspan="4" class="empty-state">Carregando duelos ao vivo...</td></tr>';
  }

  // Busca e renderiza os rankings
  const soloList = await fetchSoloRankings();
  renderSoloRankingTable(soloList);
  renderRecentRankingTable(soloList);

  if (duelTbody) {
    const duelList = await fetchDuelRankings();
    renderDuelRankingTable(duelList);
  }
}

function renderSoloRankingTable(list) {
  const soloTbody = document.getElementById('ranking-solo-tbody');
  if (!soloTbody) return;

  if (!list || list.length === 0) {
    soloTbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum resultado registrado ainda. Seja o primeiro a jogar!</td></tr>';
    return;
  }

  soloTbody.innerHTML = list.map((item, idx) => {
    let badge = '';
    if (idx === 0) badge = '<span class="rank-pos rank-badge-1">🥇 1º</span>';
    else if (idx === 1) badge = '<span class="rank-pos rank-badge-2">🥈 2º</span>';
    else if (idx === 2) badge = '<span class="rank-pos rank-badge-3">🥉 3º</span>';
    else badge = `<span class="rank-pos">${idx + 1}º</span>`;

    const gradeText = item.grade ? ` • ${escapeHtml(item.grade)}` : '';
    const safeDocId = escapeHtml(item.docId || '');
    const safeName = escapeHtml(item.name || '');

    return `
      <tr>
        <td style="text-align: center;">${badge}</td>
        <td>
          <div class="player-cell">
            <span class="player-name">${safeName}</span>
            <span class="player-school-tag">🏫 ${escapeHtml(item.school)}${gradeText}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:var(--primary-navy);">${item.score}/${item.total || QUESTIONS_PER_GAME}</span>
          ${item.arcadeScore ? `<div style="font-size:0.75rem; color:#b45309; font-family:var(--font-pixel); margin-top:2px;">${item.arcadeScore.toLocaleString('pt-BR')} PTS</div>` : ''}
        </td>
        <td style="text-align: center; font-weight: 600;">${formatTime(item.timeSeconds)}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-delete-row" data-id="${safeDocId}" data-name="${safeName}" data-score="${item.score}" data-time="${item.timeSeconds}" data-timestamp="${item.timestamp || ''}" title="Excluir este resultado (requer senha do professor)">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Ativa os botões de exclusão individual
  soloTbody.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const score = Number(btn.getAttribute('data-score'));
      const timeSeconds = Number(btn.getAttribute('data-time'));
      const timestamp = btn.getAttribute('data-timestamp') || '';
      openDeleteSingleModal({ docId, name, score, timeSeconds, timestamp });
    });
  });
}

function renderRecentRankingTable(soloList) {
  const recentTbody = document.getElementById('ranking-recent-tbody');
  if (!recentTbody) return;

  if (!soloList || soloList.length === 0) {
    recentTbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma partida finalizada ainda. Seja o primeiro a jogar!</td></tr>';
    return;
  }

  // Mapeia a posição exata de cada partida no Ranking Geral (1º, 2º, 3º, etc.)
  const rankMap = new Map();
  soloList.forEach((item, index) => {
    const key = item.docId || `${item.name}_${item.score}_${item.timeSeconds}_${item.timestamp || ''}`;
    rankMap.set(key, index + 1);
  });

  // Ordena cópia por data decrescente (mais recentes primeiro)
  const recentList = [...soloList];
  recentList.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  recentTbody.innerHTML = recentList.map(item => {
    const key = item.docId || `${item.name}_${item.score}_${item.timeSeconds}_${item.timestamp || ''}`;
    const pos = rankMap.get(key) || '-';

    let posBadge = '';
    if (pos === 1) posBadge = '<span class="rank-pos rank-badge-1">🥇 1º</span>';
    else if (pos === 2) posBadge = '<span class="rank-pos rank-badge-2">🥈 2º</span>';
    else if (pos === 3) posBadge = '<span class="rank-pos rank-badge-3">🥉 3º</span>';
    else posBadge = `<span class="rank-pos" style="background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; font-weight:700;">#${pos}º</span>`;

    const gradeText = item.grade ? ` • ${escapeHtml(item.grade)}` : '';
    const safeDocId = escapeHtml(item.docId || '');
    const safeName = escapeHtml(item.name || '');
    const timeFormatted = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';

    return `
      <tr>
        <td style="text-align: center;">${posBadge}</td>
        <td>
          <div class="player-cell">
            <span class="player-name">${safeName}</span>
            <span class="player-school-tag">🏫 ${escapeHtml(item.school)}${gradeText}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:var(--primary-navy);">${item.score}/${item.total || QUESTIONS_PER_GAME}</span>
          ${item.arcadeScore ? `<div style="font-size:0.75rem; color:#b45309; font-family:var(--font-pixel); margin-top:2px;">${item.arcadeScore.toLocaleString('pt-BR')} PTS</div>` : ''}
        </td>
        <td style="text-align: center;">
          <span style="font-size:0.9rem; font-weight:600; color:var(--text-dark);">${timeFormatted}</span>
          <div style="font-size:0.75rem; color:var(--text-muted);">${formatTime(item.timeSeconds)}</div>
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-delete-row" data-id="${safeDocId}" data-name="${safeName}" data-score="${item.score}" data-time="${item.timeSeconds}" data-timestamp="${item.timestamp || ''}" title="Excluir este resultado (requer senha do professor)">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Ativa os botões de exclusão na tabela de partidas recentes
  recentTbody.querySelectorAll('.btn-delete-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const docId = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const score = Number(btn.getAttribute('data-score'));
      const timeSeconds = Number(btn.getAttribute('data-time'));
      const timestamp = btn.getAttribute('data-timestamp') || '';
      openDeleteSingleModal({ docId, name, score, timeSeconds, timestamp });
    });
  });
}

function renderDuelRankingTable(list) {
  const duelTbody = document.getElementById('ranking-duel-tbody');
  if (!duelTbody) return;

  if (!list || list.length === 0) {
    duelTbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum duelo realizado ainda. Desafie um colega no modo 2 Jogadores!</td></tr>';
    return;
  }

  duelTbody.innerHTML = list.map(item => {
    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
    const winnerGradeText = item.winnerGrade ? ` • ${escapeHtml(item.winnerGrade)}` : '';
    return `
      <tr>
        <td>
          <div class="player-cell">
            <span class="player-name">🏆 ${escapeHtml(item.winnerName)}</span>
            <span class="player-school-tag">🏫 ${escapeHtml(item.winnerSchool)}${winnerGradeText}</span>
          </div>
        </td>
        <td style="font-size:0.88rem; font-weight: 500;">
          ${escapeHtml(item.p1Name)} <span style="color:var(--text-muted); font-size:0.8rem;">vs</span> ${escapeHtml(item.p2Name)}
        </td>
        <td style="text-align: center; font-weight: 700; color:var(--primary-navy); font-size: 1.05rem;">${item.p1Score} x ${item.p2Score}</td>
        <td style="text-align: center; font-size:0.85rem; color:var(--text-muted);">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   WAKE LOCK & ANTI-SLEEP (MANTÉM O TABLET SEMPRE ACESO DURANTE A EXPOSIÇÃO)
   -------------------------------------------------------------------------- */
let wakeLockSentinel = null;
let isWakeLockEnabled = true; // Ativo por padrão para a exposição
let wakeLockFallbackVideo = null;

// Tenta obter o bloqueio de suspensão nativo da tela (Screen Wake Lock API)
async function requestWakeLock(silent = false) {
  if (!isWakeLockEnabled) return false;

  // 1. Tenta API Nativa navigator.wakeLock
  if ('wakeLock' in navigator) {
    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) {
        updateWakeLockUIState(true);
        return true;
      }
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      updateWakeLockUIState(true);

      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        updateWakeLockUIState(false);
        // Se ainda deveria estar ativo e a página está visível, tenta reativar
        if (isWakeLockEnabled && document.visibilityState === 'visible') {
          setTimeout(() => requestWakeLock(true), 800);
        }
      });

      if (!silent) {
        console.log("💡 Screen Wake Lock ativo com sucesso!");
      }
      return true;
    } catch (err) {
      console.warn("Screen Wake Lock API falhou ou foi rejeitada:", err);
    }
  }

  // 2. Fallback: Vídeo em loop silencioso invisível (funciona em tablets mais antigos sem wakeLock)
  enableWakeLockVideoFallback();
  updateWakeLockUIState(true);
  return true;
}

// Libera o bloqueio de suspensão
async function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (e) {}
    wakeLockSentinel = null;
  }
  disableWakeLockVideoFallback();
  updateWakeLockUIState(false);
}

// Alterna manualmente o estado de Tela Sempre Acesa
async function toggleWakeLock() {
  sounds.click();
  isWakeLockEnabled = !isWakeLockEnabled;

  if (isWakeLockEnabled) {
    await requestWakeLock();
    showToastNotice("Modo Tela Acesa ativado! O tablet não irá desligar a tela.", "💡");
  } else {
    await releaseWakeLock();
    showToastNotice("Modo Tela Acesa desativado. O tablet seguirá o tempo padrão.", "💤");
  }
}

// Fallback de vídeo em loop imperceptível para manter a tela acordada
function enableWakeLockVideoFallback() {
  if (wakeLockFallbackVideo) {
    wakeLockFallbackVideo.play().catch(() => {});
    return;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.fillRect(0, 0, 1, 1);

    if (canvas.captureStream) {
      const stream = canvas.captureStream(10);
      wakeLockFallbackVideo = document.createElement('video');
      wakeLockFallbackVideo.setAttribute('playsinline', '');
      wakeLockFallbackVideo.setAttribute('muted', '');
      wakeLockFallbackVideo.setAttribute('loop', '');
      wakeLockFallbackVideo.muted = true;
      wakeLockFallbackVideo.autoplay = true;
      wakeLockFallbackVideo.srcObject = stream;
      wakeLockFallbackVideo.style.cssText = 'position:fixed;width:1px;height:1px;top:0;left:0;opacity:0.001;pointer-events:none;z-index:-999;';
      document.body.appendChild(wakeLockFallbackVideo);
      wakeLockFallbackVideo.play().catch(() => {});
    }
  } catch (e) {
    console.warn("Vídeo fallback Wake Lock:", e);
  }
}

function disableWakeLockVideoFallback() {
  if (wakeLockFallbackVideo) {
    try {
      wakeLockFallbackVideo.pause();
      wakeLockFallbackVideo.remove();
    } catch (e) {}
    wakeLockFallbackVideo = null;
  }
}

// Atualiza o visual dos botões no cabeçalho e na projeção
function updateWakeLockUIState(isActive) {
  const btn = document.getElementById('btn-wakelock-toggle');
  const text = document.getElementById('wakelock-text');
  const projBtn = document.getElementById('btn-wakelock-projection');

  if (btn) {
    if (isActive) {
      btn.classList.add('active');
      btn.title = "Tela Sempre Acesa ATIVA (O tablet não irá apagar)";
      if (text) text.textContent = "ACESA";
    } else {
      btn.classList.remove('active');
      btn.title = "Tela Sempre Acesa DESATIVADA (Clique para ativar)";
      if (text) text.textContent = "APAGAR";
    }
  }

  if (projBtn) {
    if (isActive) {
      projBtn.classList.add('active');
    } else {
      projBtn.classList.remove('active');
    }
  }
}

function toggleFullscreenProjection() {
  sounds.click();
  const isFs = document.body.classList.toggle('fullscreen-projection');
  const fsIcon = document.getElementById('fullscreen-icon');
  const fsText = document.getElementById('fullscreen-text');

  if (isFs) {
    if (fsIcon) fsIcon.textContent = '✕';
    if (fsText) fsText.textContent = '';
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    // Trava tela acesa ao entrar na projeção
    isWakeLockEnabled = true;
    requestWakeLock();
    showToastNotice("Projeção em Tela Cheia ativada! Tela travada acesa.", "📽️");
  } else {
    if (fsIcon) fsIcon.textContent = '⛶';
    if (fsText) fsText.textContent = '';
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

/**
 * Ativa ou desativa a Tela Cheia nativa do navegador a qualquer momento, em qualquer tela.
 */
function toggleGlobalFullscreen() {
  sounds.click();
  const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  if (!isCurrentlyFullscreen) {
    const docEl = document.documentElement;
    const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (requestFs) {
      requestFs.call(docEl).catch(err => console.warn("Fullscreen request error:", err));
    }
    // Ao entrar em tela cheia, garante que a tela do tablet fique sempre acesa
    isWakeLockEnabled = true;
    requestWakeLock();
    showToastNotice("Tela Cheia ativada! Tablet travado aceso para a exposição.", "🖥️");
  } else {
    const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exitFs) {
      exitFs.call(document).catch(err => console.warn("Exit fullscreen error:", err));
    }
  }
}

function updateFullscreenButtonsState() {
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  if (!isFullscreen) {
    document.body.classList.remove('fullscreen-projection');
  }

  const globalIcon = document.getElementById('global-fullscreen-icon');
  const globalText = document.getElementById('global-fullscreen-text');
  const globalBtn = document.getElementById('btn-global-fullscreen');

  if (globalIcon) globalIcon.textContent = isFullscreen ? '✕' : '⛶';
  if (globalText) globalText.textContent = isFullscreen ? '' : '';
  if (globalBtn) globalBtn.title = isFullscreen ? '' : '';

  const fsIcon = document.getElementById('fullscreen-icon');
  const fsText = document.getElementById('fullscreen-text');
  if (fsIcon) fsIcon.textContent = isFullscreen ? '✕' : '⛶';
  if (fsText) fsText.textContent = isFullscreen ? '' : '';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

/* --------------------------------------------------------------------------
   14. EVENT LISTENERS E INICIALIZAÇÃO
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa conexão Firebase
  initFirebase();

  // Limpa campos na carga inicial para evitar dados cacheados pelo navegador
  resetRegisterForm(true);

  // Header / Brand
  document.getElementById('btn-brand-home').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-home');
  });

  // Som Toggle
  const btnSound = document.getElementById('btn-sound-toggle');
  btnSound.addEventListener('click', () => {
    const isNowEnabled = sounds.toggle();
    document.getElementById('sound-icon').textContent = isNowEnabled ? '🔊' : '🔇';
    btnSound.setAttribute('aria-pressed', !isNowEnabled);
  });

  // Botão Tela Sempre Acesa (Wake Lock) no Cabeçalho
  const btnWakeLock = document.getElementById('btn-wakelock-toggle');
  if (btnWakeLock) {
    btnWakeLock.addEventListener('click', toggleWakeLock);
  }

  // Botão Tela Sempre Acesa na Projeção dos Rankings
  const btnWakeLockProj = document.getElementById('btn-wakelock-projection');
  if (btnWakeLockProj) {
    btnWakeLockProj.addEventListener('click', toggleWakeLock);
  }

  // Ativa automaticamente o Wake Lock na primeira interação do usuário (toque ou clique)
  const userActivityKeepAwake = () => {
    if (isWakeLockEnabled && (!wakeLockSentinel || wakeLockSentinel.released)) {
      requestWakeLock(true);
    }
  };
  document.addEventListener('touchstart', userActivityKeepAwake, { passive: true });
  document.addEventListener('click', userActivityKeepAwake, { passive: true });
  document.addEventListener('pointerdown', userActivityKeepAwake, { passive: true });

  // Reativa o Wake Lock sempre que a janela ou aba volta a ficar visível
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isWakeLockEnabled) {
      requestWakeLock(true);
    }
  });

  // Tenta ativar Wake Lock imediatamente na inicialização
  setTimeout(() => requestWakeLock(true), 500);

  // Botão Tela Cheia Global no Cabeçalho (disponível a qualquer momento)
  const btnGlobalFullscreen = document.getElementById('btn-global-fullscreen');
  if (btnGlobalFullscreen) {
    btnGlobalFullscreen.addEventListener('click', () => {
      if (gameState.currentScreen === 'screen-rankings') {
        toggleFullscreenProjection();
      } else {
        toggleGlobalFullscreen();
      }
    });
  }

  // Sincronização dos botões com eventos do navegador
  document.addEventListener('fullscreenchange', updateFullscreenButtonsState);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButtonsState);
  document.addEventListener('mozfullscreenchange', updateFullscreenButtonsState);
  document.addEventListener('MSFullscreenChange', updateFullscreenButtonsState);

  // Botões de Rankings
  document.getElementById('btn-open-ranking').addEventListener('click', loadRankingsUI);
  document.getElementById('btn-home-ranking').addEventListener('click', loadRankingsUI);
  document.getElementById('btn-solo-view-rankings').addEventListener('click', loadRankingsUI);
  const btnDuelRank = document.getElementById('btn-duel-view-rankings');
  if (btnDuelRank) btnDuelRank.addEventListener('click', loadRankingsUI);

  document.getElementById('btn-ranking-back').addEventListener('click', () => {
    sounds.click();
    if (document.body.classList.contains('fullscreen-projection')) {
      toggleFullscreenProjection();
    }
    resetRegisterForm(true);
    showScreen('screen-home');
  });

  // Botão Tela Cheia para o Projetor na Parede
  const btnFullscreen = document.getElementById('btn-fullscreen-toggle');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreenProjection);
  }

  // Botão Zerar Tabelas com Senha (Área do Professor)
  const btnResetRankings = document.getElementById('btn-reset-rankings');
  if (btnResetRankings) {
    btnResetRankings.addEventListener('click', openResetRankingsModal);
  }

  const btnModalClose = document.getElementById('btn-modal-close');
  if (btnModalClose) {
    btnModalClose.addEventListener('click', closeResetRankingsModal);
  }

  const btnCancelReset = document.getElementById('btn-cancel-reset');
  if (btnCancelReset) {
    btnCancelReset.addEventListener('click', closeResetRankingsModal);
  }

  // Fechar modal ao clicar fora da janela (no backdrop)
  const modalReset = document.getElementById('modal-reset-rankings');
  if (modalReset) {
    modalReset.addEventListener('click', (e) => {
      if (e.target === modalReset) {
        closeResetRankingsModal();
      }
    });
  }

  // Envio do formulário com validação da senha 'prof123'
  const formReset = document.getElementById('form-reset-rankings');
  if (formReset) {
    formReset.addEventListener('submit', handleConfirmReset);
  }

  // Modal de Exclusão Individual de Resultado (Área do Professor)
  const modalDelete = document.getElementById('modal-delete-single');
  if (modalDelete) {
    modalDelete.addEventListener('click', (e) => {
      if (e.target === modalDelete) {
        closeDeleteSingleModal();
      }
    });
  }

  const btnModalDeleteClose = document.getElementById('btn-modal-delete-close');
  if (btnModalDeleteClose) {
    btnModalDeleteClose.addEventListener('click', closeDeleteSingleModal);
  }

  const btnCancelDeleteSingle = document.getElementById('btn-cancel-delete-single');
  if (btnCancelDeleteSingle) {
    btnCancelDeleteSingle.addEventListener('click', closeDeleteSingleModal);
  }

  const formDeleteSingle = document.getElementById('form-delete-single');
  if (formDeleteSingle) {
    formDeleteSingle.addEventListener('submit', handleConfirmDeleteSingle);
  }

  // Botão e Eventos do Modal de Histórico de Rankings
  const btnViewHistory = document.getElementById('btn-view-history');
  if (btnViewHistory) {
    btnViewHistory.addEventListener('click', openRankingsHistoryModal);
  }

  const btnModalHistoryClose = document.getElementById('btn-modal-history-close');
  if (btnModalHistoryClose) {
    btnModalHistoryClose.addEventListener('click', closeRankingsHistoryModal);
  }

  const btnCloseHistory = document.getElementById('btn-close-history');
  if (btnCloseHistory) {
    btnCloseHistory.addEventListener('click', closeRankingsHistoryModal);
  }

  const modalHistory = document.getElementById('modal-rankings-history');
  if (modalHistory) {
    modalHistory.addEventListener('click', (e) => {
      if (e.target === modalHistory) {
        closeRankingsHistoryModal();
      }
    });
  }

  // Tecla Escape para fechar modal ou F para alternar tela cheia a qualquer momento
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modalHist = document.getElementById('modal-rankings-history');
      if (modalHist && modalHist.style.display !== 'none') {
        closeRankingsHistoryModal();
        return;
      }
      const modal = document.getElementById('modal-reset-rankings');
      if (modal && modal.style.display !== 'none') {
        closeResetRankingsModal();
        return;
      }
      const modalDel = document.getElementById('modal-delete-single');
      if (modalDel && modalDel.style.display !== 'none') {
        closeDeleteSingleModal();
        return;
      }
    }

    if (e.key === 'f' || e.key === 'F') {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag !== 'INPUT' && activeTag !== 'SELECT') {
        if (gameState.currentScreen === 'screen-rankings') {
          toggleFullscreenProjection();
        } else {
          toggleGlobalFullscreen();
        }
      }
    }
  });

  // Botão Jogar da Home (Som de Moeda/Press Start Arcade)
  document.getElementById('btn-start-game').addEventListener('click', () => {
    sounds.coin();
    resetRegisterForm(true);
    showScreen('screen-mode');
  });

  // Voltar da escolha de modo
  document.getElementById('btn-back-to-home').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-home');
  });

  // Escolha do Modo Solo
  document.getElementById('card-mode-solo').addEventListener('click', () => {
    sounds.select();
    resetRegisterForm(true);
    gameState.mode = 'solo';
    document.getElementById('register-badge-mode').innerHTML = '<span>⭐</span> 1 PLAYER (SOLO)';
    document.getElementById('register-title').textContent = 'INSIRA SEU NICKNAME';
    const regDesc = document.getElementById('register-desc');
    if (regDesc) regDesc.textContent = 'Digite seu nome e escolha sua escola para entrar na disputa!';
    document.getElementById('btn-register-action-text').textContent = 'START MISSION';
    document.getElementById('group-duel-code').style.display = 'none';
    document.getElementById('input-duel-code').required = false;
    showScreen('screen-register');
    handleSchoolSelectChange();
    setTimeout(() => {
      const nameInput = document.getElementById('input-player-name');
      if (nameInput) nameInput.focus();
    }, 100);
  });

  // Escolha do Modo Duelo (Guardado para caso seja reativado no futuro)
  const cardModeDuel = document.getElementById('card-mode-duel');
  if (cardModeDuel) {
    cardModeDuel.addEventListener('click', () => {
      sounds.select();
      gameState.mode = 'duel';
      showScreen('screen-duel-mode');
    });
  }

  // Voltar da tela de opções de Duelo para Escolha de Modo
  const btnBackFromDuel = document.getElementById('btn-back-from-duel-mode');
  if (btnBackFromDuel) {
    btnBackFromDuel.addEventListener('click', () => {
      sounds.click();
      resetRegisterForm(true);
      showScreen('screen-mode');
    });
  }

  // Opção: CRIAR UM NOVO DUELO (Player 1 / Host)
  const cardDuelCreate = document.getElementById('card-duel-create');
  if (cardDuelCreate) {
    cardDuelCreate.addEventListener('click', () => {
      sounds.select();
      resetRegisterForm(true);
      gameState.mode = 'duel';
      gameState.duelSubMode = 'create';
      document.getElementById('register-badge-mode').innerHTML = '<span>👑</span> CRIAR NOVO DUELO (PLAYER 1)';
      document.getElementById('register-title').textContent = 'CRIAR NOVO DUELO';
      const regDesc = document.getElementById('register-desc');
      if (regDesc) regDesc.textContent = 'Digite seus dados. Um código de 4 dígitos será gerado para o outro aluno!';
      document.getElementById('btn-register-action-text').textContent = 'GERAR CÓDIGO E CRIAR SALA';
      document.getElementById('group-duel-code').style.display = 'none';
      document.getElementById('input-duel-code').required = false;
      showScreen('screen-register');
      handleSchoolSelectChange();
      setTimeout(() => {
        const nameInput = document.getElementById('input-player-name');
        if (nameInput) nameInput.focus();
      }, 100);
    });
  }

  // Opção: ENTRAR EM UM DUELO (Player 2 / Challenger) -> Abre tela de Salas Disponíveis
  const cardDuelJoin = document.getElementById('card-duel-join');
  if (cardDuelJoin) {
    cardDuelJoin.addEventListener('click', () => {
      showAvailableRoomsScreen();
    });
  }

  // Botão Atualizar Salas Disponíveis
  const btnRefreshRooms = document.getElementById('btn-refresh-rooms');
  if (btnRefreshRooms) {
    btnRefreshRooms.addEventListener('click', () => {
      sounds.click();
      loadAvailableDuelRooms(true);
    });
  }

  // Botão Voltar da tela de Salas
  const btnBackFromDuelRooms = document.getElementById('btn-back-from-duel-rooms');
  if (btnBackFromDuelRooms) {
    btnBackFromDuelRooms.addEventListener('click', () => {
      sounds.click();
      stopRoomsListPolling();
      showScreen('screen-duel-mode');
    });
  }

  // Botão Alternar para Digitação Manual de Código de 4 Dígitos
  const btnToggleManualCode = document.getElementById('btn-toggle-manual-code');
  if (btnToggleManualCode) {
    btnToggleManualCode.addEventListener('click', () => {
      sounds.click();
      stopRoomsListPolling();
      resetRegisterForm(true);
      gameState.mode = 'duel';
      gameState.duelSubMode = 'join';
      document.getElementById('register-badge-mode').innerHTML = '<span>🎯</span> ENTRAR COM CÓDIGO (PLAYER 2)';
      document.getElementById('register-title').textContent = 'ENTRAR COM CÓDIGO';
      const regDesc = document.getElementById('register-desc');
      if (regDesc) regDesc.textContent = 'Digite o código de 4 dígitos da sala aberta e seus dados!';
      document.getElementById('btn-register-action-text').textContent = 'ENTRAR NA ARENA ⚔️';
      document.getElementById('group-duel-code').style.display = 'block';
      const duelInput = document.getElementById('input-duel-code');
      duelInput.required = true;
      duelInput.value = '';
      showScreen('screen-register');
      handleSchoolSelectChange();
      setTimeout(() => duelInput.focus(), 120);
    });
  }

  // Formatação automática do input do código de 4 dígitos (Uppercase e sem caracteres estranhos)
  const inputDuelCode = document.getElementById('input-duel-code');
  if (inputDuelCode) {
    inputDuelCode.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    });
  }

  // Voltar do Registro
  document.getElementById('btn-back-to-mode').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    if (gameState.mode === 'duel') {
      if (gameState.duelSubMode === 'join') {
        showAvailableRoomsScreen();
      } else {
        showScreen('screen-duel-mode');
      }
    } else {
      showScreen('screen-mode');
    }
  });

  // Seleção de Escola ("Outra Escola" exibe campo de texto; "Não Sou Aluno" oculta campo de série)
  const schoolSelect = document.getElementById('select-player-school');
  const customSchoolGroup = document.getElementById('group-custom-school');
  const customSchoolInput = document.getElementById('input-custom-school');
  const gradeSelect = document.getElementById('select-player-grade');
  const gradeGroup = document.getElementById('group-player-grade');

  function handleSchoolSelectChange() {
    const val = schoolSelect ? schoolSelect.value : '';

    // Se escolheu 'Outra Escola', abre input para digitar o nome
    if (val === 'Outra Escola') {
      customSchoolGroup.style.display = 'block';
      customSchoolInput.required = true;
      setTimeout(() => customSchoolInput.focus(), 60);
    } else {
      customSchoolGroup.style.display = 'none';
      customSchoolInput.required = false;
      customSchoolInput.value = '';
    }

    // Se escolheu 'Não Sou Aluno', oculta e dispensa o campo de Ano/Série
    if (val === 'Não Sou Aluno') {
      if (gradeGroup) gradeGroup.style.display = 'none';
      if (gradeSelect) {
        gradeSelect.required = false;
        gradeSelect.value = '';
      }
    } else {
      if (gradeGroup) gradeGroup.style.display = 'block';
      if (gradeSelect) {
        gradeSelect.required = true;
      }
    }
  }

  schoolSelect.addEventListener('change', handleSchoolSelectChange);
  schoolSelect.addEventListener('input', handleSchoolSelectChange);

  // Envio do formulário de Cadastro
  document.getElementById('form-player-register').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('input-player-name');
    let name = nameInput.value.trim();
    if (!name) {
      alert("Por favor, digite seu nome ou apelido.");
      nameInput.focus();
      return;
    }

    let school = schoolSelect.value;
    if (!school) {
      alert("Por favor, selecione sua escola.");
      schoolSelect.focus();
      return;
    }

    if (school === 'Outra Escola') {
      const customVal = customSchoolInput.value.trim();
      if (!customVal) {
        alert("Por favor, digite o nome da sua escola.");
        customSchoolInput.focus();
        return;
      }
      school = customVal;
    }

    let grade = '';
    if (school !== 'Não Sou Aluno') {
      grade = gradeSelect ? gradeSelect.value : '';
      if (!grade) {
        alert("Por favor, selecione seu ano/série.");
        if (gradeSelect) gradeSelect.focus();
        return;
      }
    }

    let duelJoinCode = '';
    if (gameState.mode === 'duel' && gameState.duelSubMode === 'join') {
      const codeFromState = (gameState.duel && gameState.duel.roomCode) ? gameState.duel.roomCode.trim().toUpperCase() : '';
      const codeFromInput = (document.getElementById('input-duel-code') ? document.getElementById('input-duel-code').value : '').trim().toUpperCase();
      
      duelJoinCode = codeFromState || codeFromInput;

      // Mantém estado e input sincronizados
      if (duelJoinCode) {
        gameState.duel.roomCode = duelJoinCode;
        const codeInput = document.getElementById('input-duel-code');
        if (codeInput) {
          codeInput.value = duelJoinCode;
          codeInput.required = false;
        }
      }

      if (!duelJoinCode || duelJoinCode.length !== 4) {
        alert("Por favor, selecione uma sala aberta na lista ou digite o código de 4 dígitos do duelo (ex: K7P2).");
        const groupDuelCode = document.getElementById('group-duel-code');
        if (groupDuelCode) groupDuelCode.style.display = 'block';
        const codeInput = document.getElementById('input-duel-code');
        if (codeInput) {
          codeInput.required = true;
          codeInput.focus();
        }
        return;
      }
    }

    gameState.player.name = name;
    gameState.player.school = school;
    gameState.player.grade = grade;
    sounds.coin();

    // Limpa imediatamente os campos do formulário para que nunca fiquem gravados com o último digitado
    resetRegisterForm(false);

    if (gameState.mode === 'solo') {
      // Começa jogo solo imediatamente
      prepareQuestions();
      document.getElementById('quiz-duel-indicator').style.display = 'none';
      showScreen('screen-quiz');
      renderCurrentQuestion();
      startTimer();
    } else {
      // Modo Duelo
      if (gameState.duelSubMode === 'create') {
        enterDuelLobby('create');
      } else {
        enterDuelLobby('join', duelJoinCode);
      }
    }
  });

  // Botão Sair do Lobby (Guarda para reativação)
  const btnLeaveLobby = document.getElementById('btn-leave-lobby');
  if (btnLeaveLobby) {
    btnLeaveLobby.addEventListener('click', async () => {
      sounds.click();
      stopLobbyPolling();
      resetRegisterForm(true);
      if (gameState.duel.unsubscribeRoom) {
        gameState.duel.unsubscribeRoom();
        gameState.duel.unsubscribeRoom = null;
      }

      if (gameState.duel.isPlayer1 && gameState.duel.roomCode) {
        if (isFirebaseConnected && db && gameState.duel.roomRef) {
          try {
            await gameState.duel.roomRef.delete();
          } catch (e) {
            console.warn("Aviso ao remover sala no Firestore:", e);
          }
        }
        localStorage.removeItem('lurdita_room_' + gameState.duel.roomCode);
      }

      showScreen('screen-duel-mode');
    });
  }

  // Botão Iniciar Duelo no Lobby (Guarda para reativação)
  const btnStartDuel = document.getElementById('btn-start-duel');
  if (btnStartDuel) {
    btnStartDuel.addEventListener('click', () => {
      triggerStartDuel();
    });
  }

  // Botão Próxima Pergunta
  document.getElementById('btn-next-question').addEventListener('click', handleNextQuestion);

  // Jogar Novamente / Voltar ao Início
  document.getElementById('btn-solo-play-again').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-mode');
  });
  document.getElementById('btn-solo-home').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-home');
  });

  const btnDuelPlayAgain = document.getElementById('btn-duel-play-again');
  if (btnDuelPlayAgain) {
    btnDuelPlayAgain.addEventListener('click', () => {
      sounds.click();
      resetRegisterForm(true);
      showScreen('screen-duel-mode');
    });
  }

  const btnDuelHome = document.getElementById('btn-duel-home');
  if (btnDuelHome) {
    btnDuelHome.addEventListener('click', () => {
      sounds.click();
      resetRegisterForm(true);
      showScreen('screen-home');
    });
  }
});
