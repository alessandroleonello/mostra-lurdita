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
    snapshot.forEach(doc => list.push(doc.data()));
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });
    renderSoloRankingTable(list);
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
    unsubscribeRoom: null
  }
};

/* --------------------------------------------------------------------------
   6. CONTROLE DE NAVEGAÇÃO ENTRE TELAS E RESET DE FORMULÁRIO
   -------------------------------------------------------------------------- */
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    gameState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Limpa todos os campos de digitação do formulário de entrada para que novos
 * jogos e novos alunos sempre comecem com campos vazios (sem valores cacheados).
 */
function resetRegisterForm(resetPlayerState = false) {
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
  if (duelCodeInput) duelCodeInput.value = '';

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
        <span style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
          Avançando para a próxima em <strong id="countdown-num">3</strong>s...
        </span>
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
        <span style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
          Avançando para a próxima em <strong id="countdown-num">3</strong>s...
        </span>
      `;
    }
  }

  updateArcadeHUD();

  // Inicia animação da barra de 3 segundos
  if (barWrap && barFill) {
    barWrap.style.display = 'block';
    barFill.style.animation = 'none';
    barFill.offsetHeight; // reflow para reiniciar animação
    barFill.style.animation = 'countdownShrink 3s linear forwards';
  }

  // Contagem regressiva de 3 segundos no texto
  let secondsRemaining = 3;
  if (gameState.quiz.countdownInterval) {
    clearInterval(gameState.quiz.countdownInterval);
  }

  gameState.quiz.countdownInterval = setInterval(() => {
    secondsRemaining--;
    const currentCountdownEl = document.getElementById('countdown-num');
    if (currentCountdownEl) {
      currentCountdownEl.textContent = secondsRemaining > 0 ? secondsRemaining : '1';
    }
    if (secondsRemaining <= 0) {
      clearInterval(gameState.quiz.countdownInterval);
      gameState.quiz.countdownInterval = null;
    }
  }, 1000);

  // Avança automaticamente após 3 segundos
  if (gameState.quiz.autoAdvanceTimer) {
    clearTimeout(gameState.quiz.autoAdvanceTimer);
  }

  gameState.quiz.autoAdvanceTimer = setTimeout(() => {
    if (gameState.quiz.countdownInterval) {
      clearInterval(gameState.quiz.countdownInterval);
      gameState.quiz.countdownInterval = null;
    }
    if (barWrap) barWrap.style.display = 'none';

    if (gameState.quiz.currentIndex + 1 < gameState.quiz.questions.length) {
      gameState.quiz.currentIndex++;
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }, 3000);
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
      await db.collection("ranking_solo").add(entry);
    } else {
      // LocalStorage fallback
      const currentList = getLocalSoloRankings();
      currentList.push(entry);
      localStorage.setItem('lurdita_ranking_solo', JSON.stringify(currentList));
      if (broadcastChannel) broadcastChannel.postMessage({ type: 'RANKING_UPDATE' });
    }
  } catch (err) {
    console.error("Erro ao salvar ranking solo:", err);
    const currentList = getLocalSoloRankings();
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
      return Array.isArray(parsed) ? parsed : [];
    }
    return [
      { name: "Lucas Rocha", school: "PEI Lurdita", score: 6, total: 6, timeSeconds: 68, timestamp: new Date().toISOString() },
      { name: "Beatriz Lima", school: "EE Prof. José Roberto Furlaneto", score: 5, total: 6, timeSeconds: 74, timestamp: new Date().toISOString() },
      { name: "Pedro Henrique", school: "PEI Lurdita", score: 5, total: 6, timeSeconds: 88, timestamp: new Date().toISOString() }
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
      snap.forEach(doc => list.push(doc.data()));
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

// Zera todas as tabelas de classificação (Solo e Duelos)
async function resetAllRankings() {
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
    showToastNotice("Tabelas de classificação zeradas com sucesso!", "🗑️");
  } catch (err) {
    console.error("Erro ao zerar tabelas:", err);
    alert("Ocorreu um erro ao zerar as tabelas. Tente novamente.");
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span>🗑️</span> Confirmar e Zerar';
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

// Entra no Lobby de Duelo (Ação: 'create' ou 'join')
async function enterDuelLobby(action, enteredCode) {
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

  document.getElementById('lobby-ready-actions').style.display = 'none';

  if (action === 'create') {
    document.getElementById('lobby-heading').textContent = "SALA CRIADA! PROCURANDO OPONENTE...";
    document.getElementById('lobby-subheading').textContent = `Código gerado: [ ${code} ]. Aguardando o Player 2 conectar...`;
    document.getElementById('lobby-code-helper').textContent = "📢 Passe este código de 4 dígitos para o outro aluno digitar no tablet dele!";
    document.getElementById('lobby-p1-name').textContent = pName;
    document.getElementById('lobby-p1-school').textContent = `${pSchool}${pGrade ? ' • ' + pGrade : ''}`;
    document.getElementById('lobby-p2-name').textContent = "Aguardando entrada...";
    document.getElementById('lobby-p2-school').textContent = "-";
    document.getElementById('card-lobby-p2').classList.remove('ready');
  } else {
    document.getElementById('lobby-heading').textContent = "Conectando ao Duelo...";
    document.getElementById('lobby-subheading').textContent = `Buscando sala [ ${code} ]...`;
    document.getElementById('lobby-code-helper').textContent = "Validando código com a arena...";
  }

  showScreen('screen-lobby');
  sounds.click();

  if (isFirebaseConnected && db) {
    const success = await joinFirestoreLobby(pName, pSchool, pGrade, pId, action, code);
    if (!success) {
      showScreen('screen-register');
    }
  } else {
    const success = joinLocalLobby(pName, pSchool, pGrade, pId, action, code);
    if (!success) {
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

    try {
      await roomDocRef.set({
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
      });
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
      await roomDocRef.update({
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
      });
    } catch (err) {
      console.error("Erro ao entrar na sala Firestore:", err);
      alert("Erro ao conectar à sala online. Verifique sua conexão.");
      return false;
    }
  }

  // Escuta alterações em tempo real via snapshot
  if (gameState.duel.unsubscribeRoom) gameState.duel.unsubscribeRoom();
  gameState.duel.unsubscribeRoom = roomDocRef.onSnapshot(docSnapshot => {
    if (!docSnapshot.exists) return;
    const data = docSnapshot.data();
    onRoomStateUpdate(data);
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

// Trata qualquer atualização da sala de duelo recebida
function onRoomStateUpdate(data) {
  if (!data) return;

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

  // Status da sala
  if (data.status === 'waiting') {
    document.getElementById('lobby-heading').textContent = "Procurando Oponente...";
    document.getElementById('lobby-subheading').textContent = `Código [ ${roomCode} ] gerado! Aguardando o Player 2 conectar...`;
    document.getElementById('lobby-code-helper').textContent = "📢 Passe este código de 4 dígitos para o seu oponente digitar no tablet dele!";
    document.getElementById('lobby-ready-actions').style.display = 'none';
  } else if (data.status === 'ready') {
    sounds.bell();
    document.getElementById('lobby-heading').textContent = "Oponente Conectado! 🎉";
    document.getElementById('lobby-subheading').textContent = `${p1.name} vs ${p2 ? p2.name : 'Oponente'}! Tudo pronto para iniciar!`;
    document.getElementById('lobby-code-helper').textContent = "✅ Ambos os estudantes estão na sala! Clique no botão abaixo para iniciar!";
    document.getElementById('lobby-ready-actions').style.display = 'block';
  } else if (data.status === 'playing') {
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
  prepareQuestions(roomData.questions);
  
  // Oponente
  const isP1 = gameState.duel.isPlayer1;
  const opp = isP1 ? roomData.player2 : roomData.player1;
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
  const duelTbody = document.getElementById('ranking-duel-tbody');

  if (soloTbody && !soloTbody.children.length) {
    soloTbody.innerHTML = '<tr><td colspan="4" class="empty-state">Carregando classificação individual...</td></tr>';
  }
  if (duelTbody && !duelTbody.children.length) {
    duelTbody.innerHTML = '<tr><td colspan="4" class="empty-state">Carregando duelos ao vivo...</td></tr>';
  }

  // Busca e renderiza ambos os rankings simultaneamente
  const [soloList, duelList] = await Promise.all([
    fetchSoloRankings(),
    fetchDuelRankings()
  ]);

  renderSoloRankingTable(soloList);
  renderDuelRankingTable(duelList);
}

function renderSoloRankingTable(list) {
  const soloTbody = document.getElementById('ranking-solo-tbody');
  if (!soloTbody) return;

  if (!list || list.length === 0) {
    soloTbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum resultado registrado ainda. Seja o primeiro a jogar!</td></tr>';
    return;
  }

  soloTbody.innerHTML = list.map((item, idx) => {
    let badge = '';
    if (idx === 0) badge = '<span class="rank-pos rank-badge-1">🥇 1º</span>';
    else if (idx === 1) badge = '<span class="rank-pos rank-badge-2">🥈 2º</span>';
    else if (idx === 2) badge = '<span class="rank-pos rank-badge-3">🥉 3º</span>';
    else badge = `<span class="rank-pos">${idx + 1}º</span>`;

    const gradeText = item.grade ? ` • ${escapeHtml(item.grade)}` : '';

    return `
      <tr>
        <td style="text-align: center;">${badge}</td>
        <td>
          <div class="player-cell">
            <span class="player-name">${escapeHtml(item.name)}</span>
            <span class="player-school-tag">🏫 ${escapeHtml(item.school)}${gradeText}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <span style="font-weight:700; color:var(--primary-navy);">${item.score}/${item.total || QUESTIONS_PER_GAME}</span>
          ${item.arcadeScore ? `<div style="font-size:0.75rem; color:#b45309; font-family:var(--font-pixel); margin-top:2px;">${item.arcadeScore.toLocaleString('pt-BR')} PTS</div>` : ''}
        </td>
        <td style="text-align: center; font-weight: 600;">${formatTime(item.timeSeconds)}</td>
      </tr>
    `;
  }).join('');
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

function toggleFullscreenProjection() {
  sounds.click();
  const isFs = document.body.classList.toggle('fullscreen-projection');
  const fsIcon = document.getElementById('fullscreen-icon');
  const fsText = document.getElementById('fullscreen-text');

  if (isFs) {
    if (fsIcon) fsIcon.textContent = '✕';
    if (fsText) fsText.textContent = 'Sair da Tela Cheia';
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } else {
    if (fsIcon) fsIcon.textContent = '⛶';
    if (fsText) fsText.textContent = 'Tela Cheia';
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
  if (globalText) globalText.textContent = isFullscreen ? 'SAIR TELA CHEIA' : 'TELA CHEIA';
  if (globalBtn) globalBtn.title = isFullscreen ? 'Sair da Tela Cheia' : 'Ativar Tela Cheia';

  const fsIcon = document.getElementById('fullscreen-icon');
  const fsText = document.getElementById('fullscreen-text');
  if (fsIcon) fsIcon.textContent = isFullscreen ? '✕' : '⛶';
  if (fsText) fsText.textContent = isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia';
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
  document.getElementById('btn-duel-view-rankings').addEventListener('click', loadRankingsUI);

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

  // Tecla Escape para fechar modal ou F para alternar tela cheia a qualquer momento
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal-reset-rankings');
      if (modal && modal.style.display !== 'none') {
        closeResetRankingsModal();
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

  // Escolha do Modo Duelo -> Abre tela intermediária com opções "Criar" ou "Entrar"
  document.getElementById('card-mode-duel').addEventListener('click', () => {
    sounds.select();
    gameState.mode = 'duel';
    showScreen('screen-duel-mode');
  });

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

  // Opção: ENTRAR EM UM DUELO (Player 2 / Challenger)
  const cardDuelJoin = document.getElementById('card-duel-join');
  if (cardDuelJoin) {
    cardDuelJoin.addEventListener('click', () => {
      sounds.select();
      resetRegisterForm(true);
      gameState.mode = 'duel';
      gameState.duelSubMode = 'join';
      document.getElementById('register-badge-mode').innerHTML = '<span>🎯</span> ENTRAR EM UM DUELO (PLAYER 2)';
      document.getElementById('register-title').textContent = 'ENTRAR EM UM DUELO';
      const regDesc = document.getElementById('register-desc');
      if (regDesc) regDesc.textContent = 'Digite o código de 4 dígitos fornecido pelo seu colega e preencha seus dados!';
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
      showScreen('screen-duel-mode');
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
      duelJoinCode = (document.getElementById('input-duel-code').value || '').trim().toUpperCase();
      if (!duelJoinCode || duelJoinCode.length !== 4) {
        alert("Por favor, digite o código de 4 dígitos do duelo (ex: K7P2).");
        document.getElementById('input-duel-code').focus();
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

  // Botão Sair do Lobby
  document.getElementById('btn-leave-lobby').addEventListener('click', async () => {
    sounds.click();
    resetRegisterForm(true);
    if (gameState.duel.unsubscribeRoom) {
      gameState.duel.unsubscribeRoom();
      gameState.duel.unsubscribeRoom = null;
    }

    // Se for o host (Player 1) saindo enquanto espera, podemos remover a sala
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

  // Botão Iniciar Duelo no Lobby
  document.getElementById('btn-start-duel').addEventListener('click', async () => {
    sounds.fanfare();
    if (isFirebaseConnected && db && gameState.duel.roomRef) {
      await gameState.duel.roomRef.update({ status: 'playing' });
    } else {
      const key = 'lurdita_room_' + gameState.duel.roomCode;
      let localRoom = JSON.parse(localStorage.getItem(key) || '{}');
      localRoom.status = 'playing';
      localStorage.setItem(key, JSON.stringify(localRoom));
      broadcastLocalRoom(localRoom);
      onRoomStateUpdate(localRoom);
    }
  });

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
  document.getElementById('btn-duel-play-again').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-duel-mode');
  });
  document.getElementById('btn-duel-home').addEventListener('click', () => {
    sounds.click();
    resetRegisterForm(true);
    showScreen('screen-home');
  });
});
