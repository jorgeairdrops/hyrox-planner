import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DAY_TYPES = {
  strength:  {label:"STRENGTH & GRIND", color:"#F59E0B", icon:"🏋️", rpe:"RPE 7",   zone:"Zona 2-3", desc:"Peso moderado-alto, trabajo sostenido. Duro por carga + volumen acumulado."},
  aerobic:   {label:"AEROBIC BURN",     color:"#3B82F6", icon:"🫁", rpe:"RPE 7",   zone:"Zona 2-3", desc:"Volumen altísimo, casi sin pausa. Ligero pero interminable. Sales empapado."},
  power:     {label:"POWER & SPEED",    color:"#10B981", icon:"⚡", rpe:"RPE 7",   zone:"Zona 3",   desc:"Explosividad, velocidad, competencia entre parejas."},
  threshold: {label:"THRESHOLD",        color:"#EF4444", icon:"🔥", rpe:"RPE 8-9", zone:"Zona 4",   desc:"El día MÁS duro. Intervalos sostenidos con running como ancla."},
  raceprep:  {label:"RACE PREP",        color:"#A855F7", icon:"🎯", rpe:"RPE 8",   zone:"Zona 3-4", desc:"Compromised running. Corres inmediatamente después de cada estación."},
  fullsim:   {label:"FULL SIM",         color:"#EC4899", icon:"🏁", rpe:"RPE 7-9", zone:"Zona 3-4", desc:"Mini-Hyrox, partner WODs, competencia. Registrar tiempos."},
};

const DAYS = [
  {day:"LUN", type:"strength"},
  {day:"MAR", type:"aerobic"},
  {day:"MIÉ", type:"power"},
  {day:"JUE", type:"threshold"},
  {day:"VIE", type:"raceprep"},
  {day:"SÁB", type:"fullsim"},
];

const MONTHS = [
  {name:"GPP / BASE",    color:"#10B981", weeks:"Sem 1-4",   desc:"Base aeróbica + técnica. 70% aeróbico / 30% fuerza."},
  {name:"BUILD",         color:"#F59E0B", weeks:"Sem 5-8",   desc:"Subir cargas + umbral real. 60/40."},
  {name:"RACE SPECIFIC", color:"#EF4444", weeks:"Sem 9-12",  desc:"Race pace + simulaciones. 50/50."},
  {name:"PEAK / TAPER",  color:"#A855F7", weeks:"Sem 13-16", desc:"Intensidad máxima → taper."},
];

const WEEK_LABELS = ["BASE","BUILD","PEAK","DELOAD"];

const WEEK_NOTES = {
  M1S1:{label:"BASE · Sem 1/4",           objetivo:"Establecer técnica y pesos base. El circuito sin presión de intensidad.",         porQue:"La base aeróbica es el predictor #1 de rendimiento (Brandt 2025). Sin técnica sólida, las cargas lesionan.",          queDecirles:"Esta semana no es fácil — es el punto de partida. Registren sus pesos hoy."},
  M1S2:{label:"BUILD · Sem 2/4",          objetivo:"Subir 5-10% el esfuerzo. Consolidar movimientos con más carga.",                  porQue:"La periodización 3:1 requiere progresión semanal. Estímulo mayor sin llegar al pico.",                             queDecirles:"¿Recuerdan los pesos de la Sem 1? Esta semana suban un poco."},
  M1S3:{label:"PEAK · Sem 3/4",           objetivo:"Pico de intensidad del Mes 1. Mayor volumen de las primeras 4 semanas.",          porQue:"Semana 3 = punto más alto del mesociclo. Mayor estímulo para que el deload siguiente sea efectivo.",               queDecirles:"La semana más dura del mes. No se guarden nada — la próxima descansamos."},
  M1S4:{label:"DELOAD · Sem 4/4",         objetivo:"Reducir volumen 40-50%. Mismos ejercicios, misma intensidad, menos rondas.",      porQue:"Bosquet et al.: reducir volumen 41-60% sin alterar intensidad = recuperación y supercompensación óptimas.",         queDecirles:"Se siente más fácil — es exactamente el objetivo. No añadan rondas extra."},
  M2S1:{label:"BASE · Sem 5/16",          objetivo:"Mes 2 con pesos más altos. El threshold empieza a ser serio.",                    porQue:"Ratio cambia de 70/30 a 60/40. El cuerpo ya aprendió movimientos — hora de cargar más.",                          queDecirles:"Si sus pesos no subieron, no están progresando — hablen con el coach."},
  M2S2:{label:"BUILD · Sem 6/16",         objetivo:"+5-10% sobre Sem 5. Distancias más precisas.",                                    porQue:"Precisión en distancias y tiempos prepara el cuerpo para race pace.",                                              queDecirles:"No solo hacerlo — hacerlo en el tiempo correcto. Usen el reloj."},
  M2S3:{label:"PEAK · Sem 7/16",          objetivo:"Pico del Mes 2. Compromised running con fuerza.",                                 porQue:"El viernes Race Prep es el día más específico. La transición ejercicio→carrera es lo que distingue.",              queDecirles:"Esta semana les va a quemar. Es normal — son el pico del mes."},
  M2S4:{label:"DELOAD · Sem 8/16",        objetivo:"Deload del Mes 2. Recuperar para atacar el Mes 3.",                               porQue:"El cuerpo necesita integrar adaptaciones del pico M2 antes del bloque más específico.",                           queDecirles:"Menos rondas, misma intensidad. Noten cuánto mejor se mueven."},
  M3S1:{label:"BASE · Sem 9/16",          objetivo:"Race pace en Threshold y Race Prep. Todo se vuelve específico.",                   porQue:"En Mes 3 la ratio es 50/50. Cada estación con distancias y tiempos de competencia.",                               queDecirles:"Entrenamos como si la carrera fuera en 30 días. Conozcan su race pace."},
  M3S2:{label:"BUILD · Sem 10/16",        objetivo:"Pesos de competencia. Runs de transición 250-300m.",                              porQue:"Entrenar con pesos exactos activa las mismas rutas neuromusculares del día de la carrera.",                        queDecirles:"Estos son los pesos de la carrera. Ténganles respeto pero no miedo."},
  M3S3:{label:"PEAK · Sem 11/16",         objetivo:"Pico del programa entero. 4 rondas, runs 500m, pesos de competencia.",            porQue:"La semana más dura de los 4 meses. Máximo HIT + volumen. Después comienza el taper.",                             queDecirles:"Si la completan, demostraron que están listos. Den todo."},
  M3S4:{label:"DELOAD · Sem 12/16",       objetivo:"Recuperar antes del Mes Final. -40% volumen, conservar intensidad.",              porQue:"Deload crítico — saltarlo lleva a sobreentrenamiento justo antes del taper.",                                      queDecirles:"El plan es recuperar. No añadan work extra. Lleguen frescos al Mes 4."},
  M4S1:{label:"PICO MÁX · Sem 13/16",     objetivo:"Intensidad máxima del programa. Peak final para competidores.",                   porQue:"HIT puede aumentar en últimas semanas pre-competencia (meta-analysis 2024). Volumen controlado.",                  queDecirles:"Última vez que van al máximo. Después bajamos el volumen. Aprovechen."},
  M4S2:{label:"PEAK ALTO · Sem 14/16",    objetivo:"Mantener intensidad alta. -15% volumen para iniciar taper gradual.",              porQue:"Taper óptimo dura 2 semanas. Semana 14 inicia la reducción leve.",                                                queDecirles:"El volumen baja un poco. La intensidad no. Sigan fuertes."},
  M4S3:{label:"TAPER · Sem 15/16",        objetivo:"-30% volumen total. Mantener intensidad. Preparar para el día de la carrera.",    porQue:"Bosquet et al.: -41-60% volumen en últimas 2 semanas maximiza rendimiento.",                                      queDecirles:"Si se siente fácil — bien hecho. El objetivo: llegar al sábado ligeros."},
  M4S4:{label:"DELOAD FINAL · Sem 16/16", objetivo:"Deload completo competidores. No-competidores: Mini-Hyrox de cierre.",            porQue:"El cuerpo necesita 6-8 días de reducción total antes del evento (Consenso Delphi 2023).",                          queDecirles:"Competidores: se mueven, no se matan. No-competidores: cierren con el Mini-Hyrox."},
};

const BENCHMARKS = [
  {month:1, name:"Test de Base",      items:["1km contrarreloj","Max Wall Balls en 3 min","Max cal SkiErg en 3 min","Max Farmer Carry distancia en 2 min"], notes:"Registrar todos los números. Este es el baseline."},
  {month:2, name:"Re-Test Base",      items:["Repetir exactamente el Test de Base","Comparar números vs. Mes 1"], notes:"Debe haber mejora en al menos 2 de 4 tests."},
  {month:3, name:"Mini-Hyrox",        items:["4 est + 4×500m runs FOR TIME:","Run → SkiErg 500m → Run → Sled 50m","Run → WB ×50 → Run → Lunges 50m"], notes:"Tiempo total. La prueba de fuego."},
  {month:4, name:"Final Assessment",  items:["Competidores: Full Hyrox Sim (parque)","No competidores: Repetir Mini-Hyrox","Comparar vs. Mes 3"], notes:"Celebrar el progreso de 4 meses."},
];

// ─── WOD DATA — MES 1 (Semanas 1-4) ─────────────────────────────────────────

const WODS = {
  // ── SEMANA 1 — BASE ──────────────────────────────────────────────────────
  w1: [
    {type:"strength", title:"STRENGTH & GRIND — Base",
     format:"6 est · Parejas · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Movilidad articular → 2 rondas: 10 air squats + 10 push-ups + 200m jog ligero",
     stations:[
       {n:1, name:"Sled Push",       rx:"4×25m @ peso moderado",          sc:"3×15m @ peso ligero"},
       {n:2, name:"DB Bent-over Row", rx:"12 reps c/lado (16kg)",             sc:"12 reps c/lado (10kg)"},
       {n:3, name:"DB Front Squat",  rx:"15 reps (2×20kg)",               sc:"15 reps (2×10kg)"},
       {n:4, name:"SkiErg",          rx:"300m ritmo sostenible",           sc:"200m"},
       {n:5, name:"KB Swings",       rx:"25 reps (20kg)",                  sc:"20 reps (12kg)"},
       {n:6, name:"Farmer Carry",    rx:"75m (2×20kg)",                   sc:"50m (2×12kg)"},
     ],
     cooldown:"5 min: Stretching cadena posterior, cuádriceps, hombros",
     notes:"TÉCNICA primero. Sled: espalda recta, empuje desde el piso. KB: cadera, no espalda. Farmer: hombros abajo, pecho arriba. Registrar pesos hoy — es el baseline.",
    },
    {type:"aerobic", title:"AEROBIC BURN — Base",
     format:"4 est · Tríos · 3 min · 3 rondas · 90 seg desc",
     warmup:"5 min: Jog progresivo 400m → movilidad dinámica cadera y tobillo",
     stations:[
       {n:1, name:"Run",                rx:"400m ritmo conversacional (Zona 2)", sc:"300m o caminata rápida"},
       {n:2, name:"Wall Balls",         rx:"30 reps (6/9kg)",                   sc:"20 reps (4/6kg)"},
       {n:3, name:"SkiErg",             rx:"350m ritmo sostenible",              sc:"250m"},
       {n:4, name:"Burpee Broad Jumps", rx:"30m BBJ",                           sc:"15m step-back broad jumps"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"NUNCA PARAR. Ritmo conversacional pero constante. Si alguien para → escalar peso/distancia. El éxito hoy = movimiento continuo durante 39 minutos.",
    },
    {type:"power", title:"POWER & SPEED — Base",
     format:"6 est · Parejas · 2 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jumping jacks → high knees → 5 broad jumps → 5 box jumps progresivos",
     stations:[
       {n:1, name:"Barbell Deadlift",  rx:"6 reps EXPLOSIVOS (60% 1RM)",      sc:"8 KB deadlift (16-20kg)"},
       {n:2, name:"Rower Sprint",      rx:"200m MAX EFFORT",                   sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",         rx:"10 box jumps (60cm)",               sc:"10 step-ups"},
       {n:4, name:"Sled Push Sprint",  rx:"25m sprint (mod-pesado)",            sc:"15m peso ligero"},
       {n:5, name:"DB Push Press",     rx:"8 reps EXPLOSIVOS (2×12-15kg)",    sc:"8 reps (2×6-8kg)"},
       {n:6, name:"Broad Jumps",       rx:"6 BJ máximos + sprint 40m",        sc:"5 BJ + sprint 20m"},
     ],
     cooldown:"5 min: Stretching isquiotibiales, flexores de cadera, hombros",
     notes:"CADA REP EXPLOSIVA. Peso moderado (50-60% 1RM) a máxima velocidad. Competencia entre parejas — ¿quién termina primero?",
    },
    {type:"threshold", title:"THRESHOLD — Base 🔥",
     format:"5 est · Flex (2s y 3s) · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m progresivo → movilidad → 3 sprints 50m al 70%",
     stations:[
       {n:1, name:"Run (ANCLA)", rx:"400m TEMPO pace (RPE 8)",    sc:"300m ritmo fuerte"},
       {n:2, name:"SkiErg",      rx:"250m (<1:50/500m)",          sc:"180m"},
       {n:3, name:"Sled Push",   rx:"4×25m ritmo race intro",     sc:"3×20m peso ligero"},
       {n:4, name:"Rower",       rx:"300m ritmo agresivo",        sc:"200m"},
       {n:5, name:"Wall Balls",  rx:"20 reps (9/6kg)",            sc:"15 reps (6/4kg)"},
     ],
     cooldown:"8 min: Caminata 200m + stretching profundo + respiración diafragmática",
     notes:"🔥 DÍA MÁS DURO. Zona 4 real. Si pueden hablar cómodamente → van demasiado lentos. Run es la estación ANCLA — marca el ritmo de todo.",
    },
    {type:"raceprep", title:"RACE PREP — Base 🎯",
     format:"4 est · Tríos · 3 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m → drills carrera (A-skip, B-skip) → 2 sprints 30m",
     stations:[
       {n:1, name:"Wall Balls → Run",   rx:"15 WB (6/9kg) → 200m run",       sc:"10 WB (4/6kg) → 150m run"},
       {n:2, name:"Farmer Carry → Run", rx:"50m carry (2×20kg) → 200m run",  sc:"30m (2×12kg) → 150m run"},
       {n:3, name:"SkiErg → Run",       rx:"200m ski → 200m run",            sc:"150m ski → 150m run"},
       {n:4, name:"BBJ → Run",          rx:"25m BBJ → 200m run",             sc:"15m BBJ → 150m run"},
     ],
     cooldown:"8 min: Jog ligero 200m + stretching completo + movilidad cadera",
     notes:"🎯 CLAVE: la transición. Terminas la estación e INMEDIATAMENTE corres — sin pausa mental. El → es el momento que construye el atleta de HYROX.",
    },
    {type:"fullsim", title:"FULL SIM — Partner WOD 🏁",
     format:"Partner WOD · Equipos de 2 · FOR TIME · Alternan trabajo",
     warmup:"5 min: Jog parejas 400m → movilidad → 5 burpees c/u",
     stations:[
       {n:1, name:"Run 800m (juntos)",          rx:"800m juntos",                            sc:"600m"},
       {n:2, name:"Sled Push alternado",         rx:"50m total (25m c/u)",                   sc:"30m total"},
       {n:3, name:"Run 400m + Lunges",           rx:"400m juntos → 40m lunges split",        sc:"300m → 30m lunges"},
       {n:4, name:"Run 400m + WB ×50",          rx:"400m → 50 WB split pareja",             sc:"300m → 30 WB"},
       {n:5, name:"SkiErg 500m + Farmer 100m",  rx:"500m ski split → 100m carry alt",       sc:"300m ski → 60m carry"},
       {n:6, name:"Run 400m + Row 500m + BBJ",  rx:"400m → 500m row split → 50m BBJ split", sc:"300m → 300m → 30m"},
     ],
     cooldown:"10 min: Caminata + stretching + celebración y registro de tiempos",
     notes:"🏁 COMPETENCIA. Registrar tiempo total. Tabla de resultados visible. Música alta, energía competitiva. Parque si hay buen clima.",
    },
  ],

  // ── SEMANA 2 — BUILD (+5-10%) ─────────────────────────────────────────────
  w2: [
    {type:"strength", title:"STRENGTH & GRIND — BUILD",
     format:"6 est · Parejas · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Movilidad articular → 2 rondas: 10 air squats + 10 KB DL + 200m jog",
     stations:[
       {n:1, name:"Sled Push",         rx:"4×25m @ mod (más velocidad que S1)",   sc:"3×20m @ ligero"},
       {n:2, name:"KB Row",            rx:"12 reps c/lado (20kg)",                        sc:"12 reps c/lado (12kg)"},
       {n:3, name:"Barbell Deadlift",  rx:"10 reps técnicos (60/30kg)",             sc:"10 KB DL (2×16kg)"},
       {n:4, name:"Rower",             rx:"300m ritmo sostenible",                  sc:"220m"},
       {n:5, name:"DB Lunges",         rx:"20 reps totales (2×10kg)",              sc:"16 reps bodyweight"},
       {n:6, name:"Farmer Carry",      rx:"80m (2×20kg)",                          sc:"55m (2×12kg)"},
     ],
     cooldown:"5 min: Cadena posterior, cuádriceps, hombros",
     notes:"BUILD +5-10% vs S1. Barbell DL: técnica primero, velocidad después. Rower: mantener ritmo estable las 3 rondas. Farmer: 80m sin detenerse.",
    },
    {type:"aerobic", title:"AEROBIC BURN — BUILD",
     format:"4 est · Tríos · 3 min · 3 rondas · 90 seg desc",
     warmup:"5 min: Jog 400m → movilidad dinámica cadera y tobillo",
     stations:[
       {n:1, name:"Run",        rx:"400m Zona 2 (conversacional)",              sc:"300m o caminata rápida"},
       {n:2, name:"Step-ups",   rx:"40 reps totales (cajón 20cm + 12kg KB c/mano)", sc:"30 reps bodyweight"},
       {n:3, name:"Rower",      rx:"350m ritmo sostenible",                     sc:"250m"},
       {n:4, name:"Air Squats", rx:"50 reps continuos",                         sc:"35 reps (mismo ritmo)"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"NUNCA PARAR. Step-ups: talón completo en el cajón, no puntillas. Air Squats: ritmo constante, no ir al fallo. Rotar estaciones sin tiempo muerto.",
    },
    {type:"power", title:"POWER & SPEED — BUILD",
     format:"6 est · Parejas · 2 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jumping jacks → high knees → 5 broad jumps → 5 box jumps prog.",
     stations:[
       {n:1, name:"KB Swing High Pull",  rx:"10 reps EXPLOSIVOS (20kg)",          sc:"12 reps (12kg)"},
       {n:2, name:"Rower Sprint",        rx:"200m MAX EFFORT",                     sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",           rx:"12 box jumps (60cm)",                 sc:"10 step-ups rápidos"},
       {n:4, name:"Sled Push Sprint",    rx:"25m sprint (mod-pesado)",              sc:"15m peso ligero"},
       {n:5, name:"Barbell Push Press",  rx:"8 reps EXPLOSIVOS (40/20kg)",         sc:"8 DB PP (2×8kg)"},
       {n:6, name:"Broad Jumps",         rx:"6 BJ máximos + sprint 40m",          sc:"5 BJ + sprint 20m"},
     ],
     cooldown:"5 min: Stretching isquiotibiales, flexores de cadera, hombros",
     notes:"BUILD: KB Swing High Pull = extensión completa de cadera + tirón al mentón. Competencia entre parejas. Si la velocidad baja → ir a Scaled.",
    },
    {type:"threshold", title:"THRESHOLD — BUILD 🔥",
     format:"5 est · Flex (2s y 3s) · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m → movilidad → 3 sprints 50m al 75%",
     stations:[
       {n:1, name:"Run (ANCLA)", rx:"400m TEMPO pace (RPE 8)",           sc:"300m ritmo fuerte"},
       {n:2, name:"Rower",       rx:"300m ritmo agresivo (<1:55/500m)",   sc:"200m"},
       {n:3, name:"Sled Push",   rx:"4×25m ritmo race intro",             sc:"3×20m peso ligero"},
       {n:4, name:"SkiErg",      rx:"250m (<1:50/500m)",                  sc:"180m"},
       {n:5, name:"Wall Balls",  rx:"22 reps (9/6kg)",                    sc:"16 reps (6/4kg)"},
     ],
     cooldown:"8 min: Caminata 200m + stretching profundo + respiración diafragmática",
     notes:"🔥 BUILD: +2 WB vs S1. Rower en lugar de SkiErg en posición 2 — rotar para no adaptarse. Zona 4 real en todo momento.",
    },
    {type:"raceprep", title:"RACE PREP — BUILD 🎯",
     format:"4 est · Tríos · 3 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m → drills carrera → 2 sprints 30m",
     stations:[
       {n:1, name:"Sled Push → Run", rx:"25m @ mod → 200m run",         sc:"15m @ ligero → 150m"},
       {n:2, name:"SkiErg → Run",    rx:"200m ski → 200m run",          sc:"150m → 150m"},
       {n:3, name:"Lunges → Run",    rx:"30m lunges → 200m run",        sc:"20m lunges → 150m"},
       {n:4, name:"Rower → Run",     rx:"250m row → 200m run",          sc:"180m → 150m"},
     ],
     cooldown:"8 min: Jog ligero 200m + stretching completo + movilidad cadera",
     notes:"🎯 BUILD: rotación de ejercicios vs S1. La transición INMEDIATA sigue siendo la clave. Lunges: pasos controlados, no carrera.",
    },
    {type:"fullsim", title:"FULL SIM — Mini Individual FOR TIME 🏁",
     format:"Individual · FOR TIME · Secuencia sin pausa · Anotar tiempo",
     warmup:"5 min: Jog 400m → movilidad → 5 WB + 5 burpees activación",
     stations:[
       {n:1, name:"Run 600m",          rx:"Race pace (~3:00/km)",           sc:"500m ritmo fuerte"},
       {n:2, name:"SkiErg 300m",       rx:"Sub 1:30 total",                 sc:"250m"},
       {n:3, name:"Run 400m",          rx:"Race pace",                      sc:"300m"},
       {n:4, name:"Sled Push 25m",     rx:"Peso moderado",                  sc:"Peso ligero"},
       {n:5, name:"Wall Balls ×30",    rx:"30 WB (6/9kg) sin pausa",        sc:"20 WB (4/6kg)"},
       {n:6, name:"Run 400m",          rx:"Race pace",                      sc:"300m"},
       {n:7, name:"Farmer Carry 50m",  rx:"2×20kg",                        sc:"2×12kg"},
     ],
     cooldown:"10 min: Caminata + stretching + ANOTAR TIEMPO TOTAL",
     notes:"🏁 Primer mini-sim del programa. Registrar tiempo total — en S3 intentaremos mejorarlo. Secuencia continua, sin pausas entre estaciones.",
    },
  ],

  // ── SEMANA 3 — PEAK (+10-15%) ─────────────────────────────────────────────
  w3: [
    {type:"strength", title:"STRENGTH & GRIND — PEAK",
     format:"6 est · Parejas · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Movilidad articular → 2 rondas: 10 air squats + 10 KB swings + 200m jog",
     stations:[
       {n:1, name:"Sled Push",       rx:"5×25m @ mod (pico de volumen Mes 1)", sc:"4×20m @ ligero"},
       {n:2, name:"Barbell Row",     rx:"10 reps (50/25kg)",                           sc:"10 KB Row c/lado (16kg)"},
       {n:3, name:"KB Front Squat",  rx:"15 reps (2×16kg)",                     sc:"15 reps (2×10kg)"},
       {n:4, name:"SkiErg",          rx:"300m (<2:00/500m)",                     sc:"220m"},
       {n:5, name:"KB Swings",       rx:"28 reps (20kg)",                        sc:"22 reps (12kg)"},
       {n:6, name:"Farmer Carry",    rx:"90m (2×20kg)",                         sc:"60m (2×12kg)"},
     ],
     cooldown:"5 min: Cadena posterior, cuádriceps, hombros",
     notes:"PEAK mes 1: +1 pass Sled, +3 reps KB, +15m Farmer. La técnica no debe degradarse aunque haya fatiga — si se rompe, escalar.",
    },
    {type:"aerobic", title:"AEROBIC BURN — PEAK",
     format:"4 est · Tríos · 3 min · 3 rondas · 90 seg desc",
     warmup:"5 min: Jog 400m → movilidad dinámica → activación glúteos",
     stations:[
       {n:1, name:"Run",               rx:"400m Zona 2 (nunca parar)",     sc:"300m o caminata rápida"},
       {n:2, name:"Wall Balls",        rx:"35 reps (6/9kg)",                sc:"22 reps (4/6kg)"},
       {n:3, name:"SkiErg",            rx:"375m ritmo sostenible",          sc:"265m"},
       {n:4, name:"Burpee Broad Jumps",rx:"35m BBJ",                       sc:"20m step-back BBJ"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"PEAK aeróbico: +5 WB, +25m Ski, +5m BBJ vs S1. El que para tiene el peso/escala equivocado. Movimiento continuo los 39 minutos.",
    },
    {type:"power", title:"POWER & SPEED — PEAK",
     format:"6 est · Parejas · 2 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jumping jacks → high knees → 6 broad jumps → 6 box jumps prog.",
     stations:[
       {n:1, name:"Barbell Deadlift",  rx:"8 reps EXPLOSIVOS (60% 1RM)",   sc:"10 KB DL (2×16kg)"},
       {n:2, name:"Rower Sprint",      rx:"200m MAX EFFORT",                sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",         rx:"12 box jumps (60cm) RÁPIDOS",   sc:"10 step-ups rápidos"},
       {n:4, name:"Sled Push Sprint",  rx:"25m sprint (mod-pesado)",         sc:"15m peso ligero"},
       {n:5, name:"DB Push Press",     rx:"10 reps EXPLOSIVOS (2×12-15kg)",sc:"10 reps (2×6-8kg)"},
       {n:6, name:"Broad Jumps",       rx:"8 BJ máximos + sprint 50m",     sc:"6 BJ + sprint 30m"},
     ],
     cooldown:"5 min: Stretching activo isquiotibiales, flexores, hombros",
     notes:"PEAK Power: +2 DL, +2 BJ, sprint más largo. Anotar distancias/tiempos — en S4 usaremos los mismos pesos con menos rondas.",
    },
    {type:"threshold", title:"THRESHOLD — PEAK 🔥",
     format:"5 est · Flex (2s y 3s) · 2.5 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m → movilidad → 4 sprints 60m progresivos (60-70-80-85%)",
     stations:[
       {n:1, name:"Run (ANCLA)", rx:"400m TEMPO pace (RPE 8-9)",         sc:"300m ritmo fuerte"},
       {n:2, name:"SkiErg",      rx:"270m (<1:50/500m)",                  sc:"195m"},
       {n:3, name:"Sled Push",   rx:"5×25m ritmo race",                   sc:"4×20m peso ligero"},
       {n:4, name:"Rower",       rx:"320m ritmo agresivo (<1:50/500m)",   sc:"220m"},
       {n:5, name:"Wall Balls",  rx:"25 reps (9/6kg)",                    sc:"18 reps (6/4kg)"},
     ],
     cooldown:"8 min: Caminata 200m + stretching profundo + respiración diafragmática",
     notes:"🔥 PEAK THRESHOLD: día más duro del Mes 1. +20m Ski, +1 Sled, +20m Row, +5 WB vs S1. Sin reservas — la semana que viene es DELOAD.",
    },
    {type:"raceprep", title:"RACE PREP — PEAK 🎯",
     format:"4 est · Tríos · 3 min · 3 rondas · 2 min desc",
     warmup:"5 min: Jog 400m → drills carrera → 3 sprints 30m",
     stations:[
       {n:1, name:"Wall Balls → Run",   rx:"18 WB (6/9kg) → 200m run",       sc:"12 WB → 150m"},
       {n:2, name:"Farmer Carry → Run", rx:"60m (2×20kg) → 200m run",        sc:"40m (2×12kg) → 150m"},
       {n:3, name:"SkiErg → Run",       rx:"220m ski → 200m run",            sc:"160m → 150m"},
       {n:4, name:"BBJ → Run",          rx:"28m BBJ → 200m run",             sc:"18m → 150m"},
     ],
     cooldown:"8 min: Jog ligero 200m + stretching completo cadera y pantorrillas",
     notes:"🎯 PEAK Race Prep: +3 WB, +10m Farmer, +20m Ski vs S1. La fatiga al inicio de cada run ES el entrenamiento. No caminar.",
    },
    {type:"fullsim", title:"FULL SIM — Partner WOD PEAK 🏁",
     format:"Partner WOD · Equipos de 2 · FOR TIME · Alternan trabajo",
     warmup:"5 min: Jog parejas 400m → movilidad → 5 burpees c/u",
     stations:[
       {n:1, name:"Run 800m (juntos)",         rx:"800m race pace",                         sc:"600m"},
       {n:2, name:"Sled Push alternado",        rx:"50m total (25m c/u)",                   sc:"30m total"},
       {n:3, name:"Run 400m + BBJ",             rx:"400m race pace → 30m BBJ split",       sc:"300m → 20m BBJ"},
       {n:4, name:"Run 400m + WB ×50",         rx:"400m → 50 WB split pareja",             sc:"300m → 30 WB"},
       {n:5, name:"SkiErg 500m + Farmer 100m", rx:"500m ski split → 100m carry alt",       sc:"300m → 60m carry"},
       {n:6, name:"Run 400m + Row 500m + BBJ", rx:"400m → 500m row split → 50m BBJ split", sc:"300m → 300m → 30m"},
     ],
     cooldown:"10 min: Caminata + stretching + TABLA DE RESULTADOS + celebración",
     notes:"🏁 PICO DEL MES 1. Registrar tiempo total — comparar con S2. Música alta, energía competitiva. Parque si hay buen clima.",
    },
  ],

  // ── SEMANA 4 — DELOAD (-40% volumen, misma intensidad por rep) ───────────
  w4: [
    {type:"strength", title:"STRENGTH & GRIND — DELOAD",
     format:"6 est · Parejas · 2.5 min · 2 rondas · 2 min desc · DELOAD",
     warmup:"5 min: Movilidad articular suave → 1 ronda: 10 air squats + 10 KB swings ligeros",
     stations:[
       {n:1, name:"Sled Push",       rx:"5×25m @ mod (mismo peso que S3)",   sc:"4×20m @ ligero"},
       {n:2, name:"Barbell Row",     rx:"10 reps (50/25kg)",                         sc:"10 KB Row c/lado (16kg)"},
       {n:3, name:"KB Front Squat",  rx:"15 reps (2×16kg)",                   sc:"15 reps (2×10kg)"},
       {n:4, name:"SkiErg",          rx:"300m (<2:00/500m)",                   sc:"220m"},
       {n:5, name:"KB Swings",       rx:"28 reps (20kg)",                      sc:"22 reps (12kg)"},
       {n:6, name:"Farmer Carry",    rx:"90m (2×20kg)",                       sc:"60m (2×12kg)"},
     ],
     cooldown:"8 min: Stretching largo + respiración diafragmática",
     notes:"DELOAD: mismos ejercicios y pesos que S3 — SOLO 2 RONDAS. NO añadir rondas extra. La semana que viene arranca el Mes 2 con más peso.",
    },
    {type:"aerobic", title:"AEROBIC BURN — DELOAD",
     format:"4 est · Tríos · 3 min · 2 rondas · 90 seg desc · DELOAD",
     warmup:"5 min: Jog 400m suave → movilidad",
     stations:[
       {n:1, name:"Run",               rx:"400m Zona 2 cómodo",              sc:"300m o caminata rápida"},
       {n:2, name:"Wall Balls",        rx:"35 reps (6/9kg)",                  sc:"22 reps (4/6kg)"},
       {n:3, name:"SkiErg",            rx:"375m ritmo sostenible",            sc:"265m"},
       {n:4, name:"Burpee Broad Jumps",rx:"35m BBJ",                         sc:"20m step-back BBJ"},
     ],
     cooldown:"8 min: Caminata + stretching completo",
     notes:"DELOAD: 2 rondas. Misma intensidad por rep que S3. Objetivo: mover el cuerpo sin acumular fatiga. El Mes 2 empieza la próxima semana.",
    },
    {type:"power", title:"POWER & SPEED — DELOAD",
     format:"6 est · Parejas · 2 min · 2 rondas · 2 min desc · DELOAD",
     warmup:"5 min: Jumping jacks → high knees → 5 broad jumps suaves",
     stations:[
       {n:1, name:"Barbell Deadlift",  rx:"8 reps EXPLOSIVOS (60% 1RM)",    sc:"10 KB DL (2×16kg)"},
       {n:2, name:"Rower Sprint",      rx:"200m MAX EFFORT",                 sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",         rx:"12 box jumps (60cm)",             sc:"10 step-ups"},
       {n:4, name:"Sled Push Sprint",  rx:"25m sprint",                      sc:"15m peso ligero"},
       {n:5, name:"DB Push Press",     rx:"10 reps EXPLOSIVOS (2×12-15kg)", sc:"10 reps (2×6-8kg)"},
       {n:6, name:"Broad Jumps",       rx:"8 BJ máximos + sprint 50m",      sc:"6 BJ + sprint 30m"},
     ],
     cooldown:"5 min: Stretching activo general",
     notes:"DELOAD: 2 rondas. Misma velocidad de movimiento que S3. El power no se pierde — solo reducimos el volumen total.",
    },
    {type:"threshold", title:"THRESHOLD — DELOAD 🔥",
     format:"5 est · Flex · 2.5 min · 2 rondas · 2 min desc · DELOAD",
     warmup:"5 min: Jog 400m suave → movilidad → 2 sprints 50m al 70%",
     stations:[
       {n:1, name:"Run (ANCLA)", rx:"400m TEMPO pace (mismo RPE que S3)",  sc:"300m ritmo fuerte"},
       {n:2, name:"SkiErg",      rx:"270m (<1:50/500m)",                    sc:"195m"},
       {n:3, name:"Sled Push",   rx:"5×25m",                               sc:"4×20m"},
       {n:4, name:"Rower",       rx:"320m ritmo agresivo",                  sc:"220m"},
       {n:5, name:"Wall Balls",  rx:"25 reps (9/6kg)",                     sc:"18 reps (6/4kg)"},
     ],
     cooldown:"10 min: Caminata + stretching profundo + respiración",
     notes:"DELOAD THRESHOLD: 2 rondas. El RPE se siente igual que S3 — solo hacemos menos. Bien descansados para el Mes 2.",
    },
    {type:"raceprep", title:"RACE PREP — DELOAD 🎯",
     format:"4 est · Tríos · 3 min · 2 rondas · 2 min desc · DELOAD",
     warmup:"5 min: Jog 400m → drills ligeros → 2 sprints suaves",
     stations:[
       {n:1, name:"Wall Balls → Run",   rx:"18 WB (6/9kg) → 200m run",       sc:"12 WB → 150m"},
       {n:2, name:"Farmer Carry → Run", rx:"60m (2×20kg) → 200m run",        sc:"40m → 150m"},
       {n:3, name:"SkiErg → Run",       rx:"220m ski → 200m run",            sc:"160m → 150m"},
       {n:4, name:"BBJ → Run",          rx:"28m BBJ → 200m run",             sc:"18m → 150m"},
     ],
     cooldown:"8 min: Jog suave + stretching largo",
     notes:"DELOAD: 2 rondas. Mantener la calidad de transición — el hábito se construye aunque sea deload. Sin presión de tiempo.",
    },
    {type:"fullsim", title:"FULL SIM — Cierre Mes 1 / Active Recovery 🏁",
     format:"Individual · Active Recovery · Sin cronómetro",
     warmup:"5 min: Jog suave 400m → movilidad general amplia",
     stations:[
       {n:1, name:"Jog 1km fácil",         rx:"Zona 1-2 conversacional",         sc:"800m caminata/jog"},
       {n:2, name:"Turkish Get-up",         rx:"5 reps c/lado (12-16kg)",         sc:"5 reps c/lado bodyweight"},
       {n:3, name:"Farmer Carry",           rx:"4×50m (2×16kg) c/descanso",       sc:"4×30m (2×10kg)"},
       {n:4, name:"Wall Balls técnicos",    rx:"3×10 reps lentos (foco en forma)", sc:"3×8 reps"},
       {n:5, name:"Stretching dirigido",    rx:"15 min: cadena post + hombros + cadera", sc:"misma duración"},
     ],
     cooldown:"10 min: Respiración 4-7-8 · Celebrar 4 semanas completadas",
     notes:"CIERRE MES 1. Sin competencia, sin reloj. Objetivo: llegar al Mes 2 frescos. Revisar registros de pesos de S1 — comparar con lo que hacen ahora.",
    },
  ],
};

// ─── THEME ────────────────────────────────────────────────────────────────────

const T = (d) => ({
  bg:      d ? "#0D0D0D" : "#FAFAFA",
  surface: d ? "#161616" : "#FFFFFF",
  border:  d ? "#252525" : "#EBEBEB",
  t1:      d ? "#F0EEE9" : "#111111",
  t2:      d ? "#888888" : "#555555",
  t3:      d ? "#555555" : "#999999",
  shadow:  d ? "none"    : "0 1px 4px rgba(0,0,0,0.07)",
  chip:    d ? "#222222" : "#F2F2F2",
});

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function HyroxPlanner() {
  const [dark, setDark]       = useState(() => { try { return localStorage.getItem("hx-dark") === "1"; } catch { return false; } });
  const [view, setView]       = useState("cal");
  const [selM, setSelM]       = useState(0);
  const [selW, setSelW]       = useState(0);
  const [expDay, setExpDay]   = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [showWU, setShowWU]   = useState(false);

  const isTv = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tv") === "true";
  const t  = T(dark);
  const gw = selM * 4 + selW + 1;
  const note = WEEK_NOTES[`M${selM + 1}S${selW + 1}`];

  const toggleDark = () => {
    const n = !dark;
    setDark(n);
    try { localStorage.setItem("hx-dark", n ? "1" : "0"); } catch {}
  };

  const getWod = (m, w, d) => WODS["w" + (m * 4 + w + 1)]?.[d];

  // Auto-detect today WOD (program starts 2026-04-06)
  const PROG_START = new Date("2026-04-06");
  const _today = new Date(); _today.setHours(0,0,0,0);
  const _diff   = Math.floor((_today - PROG_START) / 86400000);
  const _jsDay  = _today.getDay();
  const _DMAP   = {1:0,2:1,3:2,4:3,5:4,6:5};
  const todayD  = _DMAP[_jsDay];
  const todayPW = Math.floor(_diff / 7);
  const todayM  = Math.floor(todayPW / 4);
  const todayWm = todayPW % 4;


  const card = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    boxShadow: t.shadow,
    marginBottom: 8,
    overflow: "hidden",
  };

  // ── TV MODE ────────────────────────────────────────────────────────────────
  if (isTv) {
    const tvWod = (_diff >= 0 && _jsDay !== 0 && todayPW <= 15 && todayD !== undefined)
      ? getWod(todayM, todayWm, todayD) : null;
    const tvDay = todayD !== undefined ? DAYS[todayD] : null;
    const tvDt  = tvDay ? DAY_TYPES[tvDay.type] : null;
    if (!tvWod || !tvDay) return (
      <div style={{background:"#111",color:"#fff",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <div style={{fontSize:30,fontWeight:700}}>{_jsDay === 0 ? "Dia de descanso" : "No hay WOD hoy"}</div>
        <div style={{color:"#555",fontSize:15}}>{_diff < 0 ? "El programa empieza el Lun 6 Abr" : "Proximamente"}</div>
      </div>
    );
    return (
      <div style={{background:"#0A0A0A",color:"#fff",minHeight:"100vh",padding:"32px 48px",fontFamily:"system-ui,sans-serif"}}>
        <div style={{color:tvDt.color,fontSize:12,fontWeight:700,letterSpacing:4,marginBottom:4}}>{tvDt.label} · {tvDay.day} · SEMANA {todayPW+1}</div>
        <div style={{fontSize:30,fontWeight:700,marginBottom:2}}>{tvWod.title}</div>
        <div style={{color:"#555",fontSize:15,marginBottom:28}}>{tvWod.format}</div>
        <div style={{display:"grid",gridTemplateColumns:tvWod.stations.length > 4 ? "1fr 1fr" : "1fr",gap:"14px 60px"}}>
          {tvWod.stations.map(s => (
            <div key={s.n} style={{borderLeft:`4px solid ${tvDt.color}`,paddingLeft:18}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <span style={{color:tvDt.color,fontSize:38,fontWeight:700,lineHeight:1}}>{s.n}</span>
                <span style={{fontSize:22,fontWeight:600}}>{s.name}</span>
              </div>
              <div style={{fontSize:17,marginBottom:3}}><b>RX</b> {s.rx}</div>
              <div style={{fontSize:14,color:"#777"}}><b>SC</b> {s.sc}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:28,borderTop:"1px solid #222",paddingTop:18}}>
          <div style={{color:"#444",fontSize:10,fontWeight:700,letterSpacing:3,marginBottom:4}}>WARM-UP</div>
          <div style={{fontSize:15,color:"#aaa"}}>{tvWod.warmup}</div>
        </div>
      </div>
    );
  }

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div style={{padding:16}}>
      <div style={{...card,padding:"14px 16px",borderLeft:"4px solid #10B981",marginBottom:14}}>
        <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:700,color:t.t1,letterSpacing:1}}>PROGRAMA 4 MESES · 16 SEMANAS</div>
        <div style={{fontSize:12,color:t.t2,marginTop:4,lineHeight:1.6}}>Esquema 3:1 · Grupos de 12 · 4-6 estaciones · Parejas o tríos</div>
        <div style={{display:"flex",gap:4,marginTop:10,flexWrap:"wrap"}}>
          {["2 SkiErg","2 Rower","2 Cintas","Sleds","Wall Balls","Farmer","KB/DB/Barras"].map(e => (
            <span key={e} style={{fontSize:9,color:t.t3,background:t.chip,padding:"2px 7px",borderRadius:4}}>{e}</span>
          ))}
        </div>
      </div>

      <div style={{fontFamily:"Oswald,sans-serif",fontSize:10,color:t.t3,letterSpacing:2,marginBottom:8}}>TIPOS DE ENTRENAMIENTO</div>
      {Object.entries(DAY_TYPES).map(([k,dt]) => (
        <div key={k} style={{...card,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:3,minHeight:36,background:dt.color,borderRadius:2,flexShrink:0,marginTop:2}}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:12,fontWeight:700,color:t.t1,letterSpacing:0.5}}>{dt.label}</span>
              <span style={{fontSize:9,color:t.t3,background:t.chip,padding:"1px 5px",borderRadius:3}}>{dt.rpe}</span>
              <span style={{fontSize:9,color:t.t3,background:t.chip,padding:"1px 5px",borderRadius:3}}>{dt.zone}</span>
            </div>
            <div style={{fontSize:11,color:t.t2,lineHeight:1.5}}>{dt.desc}</div>
          </div>
        </div>
      ))}

      <div style={{fontFamily:"Oswald,sans-serif",fontSize:10,color:t.t3,letterSpacing:2,margin:"14px 0 8px"}}>ESTRUCTURA DEL PROGRAMA</div>
      {MONTHS.map((m,i) => (
        <div key={i} style={{...card,padding:"10px 14px",display:"flex",gap:10}}>
          <div style={{width:3,background:m.color,borderRadius:2,flexShrink:0}}/>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:12,fontWeight:700,color:t.t1}}>M{i+1} · {m.name}</span>
              <span style={{fontSize:9,color:t.t3,background:t.chip,padding:"1px 5px",borderRadius:3}}>{m.weeks}</span>
            </div>
            <div style={{fontSize:11,color:t.t2}}>{m.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCal = () => {
    const hasWods = selM === 0;
    return (
      <div style={{padding:16}}>
        {/* Month tabs */}
        <div style={{display:"flex",gap:5,marginBottom:12}}>
          {MONTHS.map((m,i) => (
            <button key={i} onClick={() => {setSelM(i);setSelW(0);setExpDay(null);setNoteOpen(false);}}
              style={{flex:1,padding:"6px 2px",background:selM===i?`${m.color}18`:"transparent",border:`1px solid ${selM===i?m.color:t.border}`,borderRadius:7,color:selM===i?m.color:t.t3,fontSize:9,fontFamily:"Oswald,sans-serif",cursor:"pointer",textAlign:"center",lineHeight:1.4}}>
              M{i+1}<br/><span style={{fontSize:7}}>{m.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Week tabs */}
        <div style={{display:"flex",gap:4,marginBottom:12}}>
          {WEEK_LABELS.map((l,i) => (
            <button key={i} onClick={() => {setSelW(i);setExpDay(null);setNoteOpen(false);}}
              style={{flex:1,padding:"5px 4px",background:selW===i?t.chip:"transparent",border:`1px solid ${selW===i?t.border:"transparent"}`,borderRadius:6,color:selW===i?t.t1:t.t3,fontSize:10,cursor:"pointer",textAlign:"center",lineHeight:1.4}}>
              S{selM*4+i+1}<br/><span style={{fontSize:8,color:i===3?"#EF4444":t.t3}}>{l}</span>
            </button>
          ))}
        </div>

        {/* Week note */}
        {note && (
          <div style={{...card,padding:0,marginBottom:12}}>
            <button onClick={() => setNoteOpen(o => !o)} style={{width:"100%",padding:"10px 14px",background:"transparent",border:"none",display:"flex",justifyContent:"space-between",alignItems:"flex-start",cursor:"pointer",textAlign:"left"}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Oswald,sans-serif",fontSize:10,fontWeight:700,color:MONTHS[selM].color,letterSpacing:1,marginBottom:2}}>SEMANA {gw} · {note.label}</div>
                <div style={{fontSize:11,color:t.t2,lineHeight:1.4}}>{note.objetivo}</div>
              </div>
              <span style={{color:t.t3,fontSize:12,marginLeft:8,flexShrink:0}}>{noteOpen?"▲":"▼"}</span>
            </button>
            {noteOpen && (
              <div style={{padding:"0 14px 14px"}}>
                <div style={{height:1,background:t.border,marginBottom:10}}/>
                <div style={{fontSize:10,color:t.t3,fontWeight:700,letterSpacing:1,marginBottom:3}}>POR QUÉ</div>
                <div style={{fontSize:11,color:t.t2,lineHeight:1.6,marginBottom:10}}>{note.porQue}</div>
                <div style={{fontSize:10,color:t.t3,fontWeight:700,letterSpacing:1,marginBottom:3}}>QUÉ DECIRLES</div>
                <div style={{fontSize:11,color:t.t1,lineHeight:1.6,fontStyle:"italic",borderLeft:`2px solid ${MONTHS[selM].color}`,paddingLeft:10}}>"{note.queDecirles}"</div>
              </div>
            )}
          </div>
        )}

        {/* No WODs placeholder */}
        {!hasWods ? (
          <div style={{...card,padding:28,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>🚧</div>
            <div style={{fontSize:14,color:t.t2,fontWeight:600,marginBottom:4}}>Próximamente</div>
            <div style={{fontSize:11,color:t.t3}}>Los WODs del {MONTHS[selM].name} estarán disponibles pronto.</div>
          </div>
        ) : (<>
          {/* Grid 2×3 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {DAYS.map((d, di) => {
              const wod     = getWod(selM, selW, di);
              const dt      = DAY_TYPES[d.type];
              const isExp   = expDay === di;
              const isToday = _diff >= 0 && todayM === selM && todayWm === selW && todayD === di;
              return (
                <div key={di} onClick={() => setExpDay(isExp ? null : di)}
                  style={{background:t.surface,borderRadius:10,borderLeft:`3px solid ${dt.color}`,
                          boxShadow:isExp?"none":t.shadow,cursor:"pointer",padding:"10px 12px",
                          border:`1px solid ${isExp?dt.color:t.border}`,outline:"none"}}>
                  <div style={{fontSize:8,color:dt.color,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>{dt.label.split(" ")[0]}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                    <span style={{fontFamily:"Oswald,sans-serif",fontSize:17,fontWeight:700,color:t.t1}}>{d.day}</span>
                    {isToday && <span style={{fontSize:7,background:dt.color,color:"#fff",padding:"1px 5px",borderRadius:3,fontWeight:700}}>HOY</span>}
                  </div>
                  {wod
                    ? <div style={{fontSize:9,color:t.t3,lineHeight:1.4}}>{wod.stations.slice(0,2).map(s=>s.name).join(" · ")}</div>
                    : <div style={{fontSize:9,color:t.t3}}>Próximamente</div>}
                </div>
              );
            })}
          </div>

          {/* Expanded detail below grid */}
          {expDay !== null && (() => {
            const wod = getWod(selM, selW, expDay);
            const d   = DAYS[expDay];
            const dt  = DAY_TYPES[d.type];
            return (
              <div style={card}>
                <div style={{padding:"12px 14px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontFamily:"Oswald,sans-serif",fontSize:8,color:dt.color,letterSpacing:2,marginBottom:2}}>{dt.label}</div>
                    <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:700,color:t.t1}}>{d.day} · SEM {gw}</div>
                    {wod && <div style={{fontSize:10,color:t.t2,marginTop:2}}>{wod.format}</div>}
                  </div>
                  <button onClick={()=>setExpDay(null)} style={{background:"transparent",border:"none",color:t.t3,cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>✕</button>
                </div>
                {wod ? (
                  <div style={{padding:"12px 14px 14px"}}>
                    <div style={{fontSize:9,color:t.t3,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>── WARM-UP ──</div>
                    <div style={{fontSize:11,color:t.t2,marginBottom:12,lineHeight:1.5}}>{wod.warmup}</div>
                    <div style={{fontSize:9,color:t.t3,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>── ESTACIONES ──</div>
                    {wod.stations.map(s => (
                      <div key={s.n} style={{display:"flex",gap:10,marginBottom:9,alignItems:"flex-start"}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:`${dt.color}18`,border:`1px solid ${dt.color}40`,color:dt.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:"Oswald,sans-serif",flexShrink:0}}>{s.n}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:t.t1,marginBottom:2}}>{s.name}</div>
                          <div style={{fontSize:11,color:t.t2}}>RX: {s.rx}</div>
                          <div style={{fontSize:10,color:t.t3}}>SC: {s.sc}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{fontSize:9,color:t.t3,fontWeight:700,letterSpacing:1.5,marginBottom:5,marginTop:4}}>── COOL-DOWN ──</div>
                    <div style={{fontSize:11,color:t.t2,marginBottom:12,lineHeight:1.5}}>{wod.cooldown}</div>
                    <div style={{background:`${dt.color}10`,border:`1px solid ${dt.color}25`,borderRadius:7,padding:"8px 10px"}}>
                      <div style={{fontSize:9,color:dt.color,fontWeight:700,letterSpacing:1,marginBottom:3}}>NOTAS COACH</div>
                      <div style={{fontSize:11,color:t.t1,lineHeight:1.5}}>{wod.notes}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{padding:"20px 14px",textAlign:"center",color:t.t3,fontSize:12}}>WOD próximamente</div>
                )}
              </div>
            );
          })()}
        </>)}
      </div>
    );
  };

  const renderWod = () => {
    if (_diff < 0) return (
      <div style={{padding:40,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>&#128197;</div>
        <div style={{fontSize:15,color:t.t1,fontWeight:600,marginBottom:6}}>El programa empieza el Lun 6 Abr</div>
        <div style={{fontSize:11,color:t.t3}}>Vuelve el lunes para ver el WOD del dia.</div>
      </div>
    );
    if (_jsDay === 0) return (
      <div style={{padding:40,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>&#128564;</div>
        <div style={{fontSize:15,color:t.t1,fontWeight:600,marginBottom:6}}>Dia de descanso</div>
        <div style={{fontSize:11,color:t.t3}}>Hoy es domingo - descansa y preparate para el lunes.</div>
      </div>
    );
    if (todayPW > 15) return (
      <div style={{padding:40,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>&#127942;</div>
        <div style={{fontSize:15,color:t.t1,fontWeight:600,marginBottom:6}}>Programa completado</div>
        <div style={{fontSize:11,color:t.t3}}>16 semanas completadas. Enhorabuena.</div>
      </div>
    );
    const wod = getWod(todayM, todayWm, todayD);
    const day = DAYS[todayD];
    const dt  = DAY_TYPES[day.type];
    if (!wod) return (
      <div style={{padding:40,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🏋️</div>
        <div style={{fontSize:15,color:t.t2,marginBottom:6}}>Proximamente</div>
        <div style={{fontSize:11,color:t.t3}}>Semana {todayPW+1} en desarrollo.</div>
      </div>
    );
    return (
      <div style={{padding:16}}>
        <div style={{...card,padding:"14px 16px",borderLeft:`4px solid ${dt.color}`,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"Oswald,sans-serif",fontSize:10,color:dt.color,letterSpacing:2,marginBottom:2}}>{dt.label}</div>
              <div style={{fontFamily:"Oswald,sans-serif",fontSize:22,fontWeight:700,color:t.t1,letterSpacing:1}}>{day.day} · SEM {todayPW+1}</div>
              <div style={{fontSize:11,color:t.t2,marginTop:4}}>{wod.format}</div>
            </div>
            <span style={{fontSize:28}}>{dt.icon}</span>
          </div>
        </div>

        {wod.stations.map(s => (
          <div key={s.n} style={{...card,padding:"12px 14px",borderLeft:`3px solid ${dt.color}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:20,fontWeight:700,color:dt.color}}>{s.n}</span>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:14,fontWeight:600,color:t.t1}}>{s.name}</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,background:`${dt.color}12`,borderRadius:6,padding:"6px 10px"}}>
                <div style={{fontSize:8,color:dt.color,fontWeight:700,letterSpacing:1,marginBottom:2}}>RX</div>
                <div style={{fontSize:12,color:t.t1,fontWeight:600}}>{s.rx}</div>
              </div>
              <div style={{flex:1,background:t.chip,borderRadius:6,padding:"6px 10px"}}>
                <div style={{fontSize:8,color:t.t3,fontWeight:700,letterSpacing:1,marginBottom:2}}>SCALED</div>
                <div style={{fontSize:11,color:t.t2}}>{s.sc}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={card}>
          <button onClick={() => setShowWU(o => !o)} style={{width:"100%",padding:"10px 14px",background:"transparent",border:"none",display:"flex",justifyContent:"space-between",cursor:"pointer"}}>
            <span style={{fontSize:11,fontWeight:700,color:t.t2,fontFamily:"Oswald,sans-serif",letterSpacing:1}}>WARM-UP</span>
            <span style={{color:t.t3}}>{showWU ? "▲" : "▼"}</span>
          </button>
          {showWU && <div style={{padding:"0 14px 14px",fontSize:11,color:t.t2,lineHeight:1.6}}>{wod.warmup}</div>}
        </div>

        <div style={{textAlign:"center",padding:"8px 0 4px"}}>
          <a href="?tv=true" target="_blank" rel="noreferrer"
            style={{fontSize:11,color:t.t3,textDecoration:"none",border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 16px",display:"inline-block"}}>
            [TV] Ver en pantalla grande
          </a>
        </div>
      </div>
    );
  };

  const renderTests = () => (
    <div style={{padding:16}}>
      <div style={{fontSize:12,color:t.t2,lineHeight:1.6,marginBottom:14}}>Un test al final de cada mes. Registrar todos los números para medir progreso.</div>
      {BENCHMARKS.map((b,i) => {
        const mc = MONTHS[b.month-1].color;
        return (
          <div key={i} style={{...card,padding:"12px 14px",borderLeft:`3px solid ${mc}`}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:10,fontWeight:700,color:mc}}>MES {b.month}</span>
              <span style={{fontFamily:"Oswald,sans-serif",fontSize:14,fontWeight:700,color:t.t1}}>{b.name}</span>
            </div>
            {b.items.map((item,j) => (
              <div key={j} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}>
                <span style={{color:mc,fontSize:11,flexShrink:0}}>→</span>
                <span style={{fontSize:11,color:t.t2}}>{item}</span>
              </div>
            ))}
            <div style={{marginTop:8,padding:"6px 10px",background:t.chip,borderRadius:5,fontSize:10,color:t.t3}}>{b.notes}</div>
          </div>
        );
      })}
    </div>
  );

  const renderInfo = () => (
    <div style={{padding:16}}>
      <div style={{...card,padding:16}}>
        <div style={{fontFamily:"Oswald,sans-serif",fontSize:14,fontWeight:700,color:t.t1,marginBottom:8}}>ACERCA DEL PROGRAMA</div>
        <div style={{fontSize:11,color:t.t2,lineHeight:1.7}}>
          Programa de 16 semanas para clases grupales de HYROX. Periodización 3:1 basada en evidencia.<br/><br/>
          <span style={{color:t.t1,fontWeight:600}}>Equipo:</span> 2 SkiErg, 2 Rower, 2 cintas, trineos, wall balls, farmer carry, KB/DB/barras.<br/><br/>
          <span style={{color:t.t1,fontWeight:600}}>Formato:</span> 4-6 estaciones · 2-3 min c/u · 3-4 rondas · 1 hora total.<br/><br/>
          <span style={{color:t.t1,fontWeight:600}}>TV Mode:</span> Agrega <code>?tv=true</code> a la URL para mostrar el WOD activo en pantalla grande.
        </div>
      </div>
      <div style={{...card,padding:16}}>
        <div style={{fontFamily:"Oswald,sans-serif",fontSize:10,color:t.t3,letterSpacing:1,marginBottom:8}}>REFERENCIAS CIENTÍFICAS</div>
        {[
          "Brandt et al. (2025): Running como predictor #1 en HYROX",
          "Bosquet et al. (2007): Taper óptimo = reducir 41-60% volumen",
          "Consenso Delphi (2023): 6-8 días reducción total pre-evento",
          "Network meta-analysis (2024): HIT puede subir en semanas pre-comp",
        ].map((r,i) => <div key={i} style={{fontSize:10,color:t.t3,marginBottom:4}}>· {r}</div>)}
      </div>
    </div>
  );

  // ── NAV & LAYOUT ───────────────────────────────────────────────────────────
  const NAV = [
    {id:"overview", label:"General", icon:"◎"},
    {id:"cal",      label:"Cal",     icon:"▦"},
    {id:"wod",      label:"HOY",     icon:"⚡"},
    {id:"tests",    label:"Tests",   icon:"◇"},
    {id:"info",     label:"Info",    icon:"i"},
  ];

  const render = () => {
    if (view === "overview") return renderOverview();
    if (view === "cal")      return renderCal();
    if (view === "wod")      return renderWod();
    if (view === "tests")    return renderTests();
    return renderInfo();
  };


  return (
    <div style={{fontFamily:"system-ui,'Inter',sans-serif",background:t.bg,color:t.t1,minHeight:"100vh",maxWidth:480,margin:"0 auto",paddingBottom:72}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap"/>

      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:10,background:t.surface,borderBottom:`1px solid ${t.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:700,color:t.t1,letterSpacing:2}}>HYROX</div>
          <div style={{fontSize:9,color:t.t3,letterSpacing:1}}>COACH JORGE · MES {selM+1} · SEM {gw}</div>
        </div>
        <button onClick={toggleDark} style={{background:t.chip,border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.t2}}>
          {dark ? "☀ Claro" : "☾ Oscuro"}
        </button>
      </div>

      {/* Content */}
      {render()}

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:t.surface,borderTop:`1px solid ${t.border}`,display:"flex",zIndex:10}}>
        {NAV.map(n => {
          const isAct = view === n.id;
          const accentColor = n.id === "wod"
            ? (todayD !== undefined ? DAY_TYPES[DAYS[todayD].type].color : "#EF4444")
            : MONTHS[selM].color;
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{flex:1,padding:"8px 4px 10px",background:isAct?t.chip:"transparent",border:"none",borderTop:`2px solid ${isAct?accentColor:"transparent"}`,color:isAct?t.t1:t.t3,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:13}}>{n.icon}</span>
              <span style={{fontSize:9,fontWeight:isAct?700:400,fontFamily:"Oswald,sans-serif",letterSpacing:0.5}}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
