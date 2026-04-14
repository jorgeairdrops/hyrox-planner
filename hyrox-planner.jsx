import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DAY_TYPES = {
  upper:    {label:"UPPER BODY",       color:"#F59E0B", icon:"💪", rpe:"RPE 7-8", zone:"Zona 3",   desc:"SkiErg como máquina ancla. Push press + Barbell Row + carries + burpees."},
  lower:    {label:"LOWER BODY",       color:"#8B5CF6", icon:"🦵", rpe:"RPE 7-8", zone:"Zona 3",   desc:"1 sled (push O pull, nunca ambos). Run + sentadillas + lunges."},
  aerobic:  {label:"AEROBIC CAPACITY", color:"#3B82F6", icon:"🫁", rpe:"RPE 6-7", zone:"Zona 2-3", desc:"Rower + run + movimientos ligeros de alto volumen. Nunca parar."},
  threshold:{label:"THRESHOLD",        color:"#EF4444", icon:"🔥", rpe:"RPE 8-9", zone:"Zona 4",   desc:"Run como ancla + máquinas HYROX. El día MÁS duro."},
  power:    {label:"POWER & SPEED",    color:"#10B981", icon:"⚡", rpe:"RPE 8",   zone:"Zona 3-4", desc:"DB/KB Clean, box jumps, burpees, sled sprint. Cada rep EXPLOSIVA."},
  fullbody: {label:"FULL BODY",        color:"#EC4899", icon:"🏁", rpe:"RPE 8-9", zone:"Zona 3-4", desc:"Sábado. Upper + lower + máquinas. La clase más dura de la semana."},
};

const DAYS = [
  {day:"LUN"}, {day:"MAR"}, {day:"MIÉ"},
  {day:"JUE"}, {day:"VIE"}, {day:"SÁB"},
];

const WEEK_TYPES = [
  ["upper","lower","aerobic","threshold","power","fullbody"],  // w1 BASE
  ["lower","aerobic","threshold","power","fullbody","upper"],  // w2 BUILD
  ["aerobic","threshold","power","fullbody","upper","lower"],  // w3 PEAK
  ["threshold","power","fullbody","upper","lower","aerobic"],  // w4 DELOAD
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
// Rotación semanal: W1=upper/lower/aerobic/threshold/power/fullbody
//                   W2=lower/aerobic/threshold/power/fullbody/upper
//                   W3=aerobic/threshold/power/fullbody/upper/lower
//                   W4=threshold/power/fullbody/upper/lower/aerobic (DELOAD 2 rondas)

const WODS = {
  // ── SEMANA 1 — BASE ──────────────────────────────────────────────────────
  w1: [
    // LUN — UPPER BODY
    {type:"upper", title:"UPPER BODY — Base",
     format:"7 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad hombros → 2 rondas: 10 push-ups + 10 ring rows + 200m jog",
     stations:[
       {n:1, name:"SkiErg",        time:"110s", rx:"350m ritmo sostenible",          sc:"250m"},
       {n:2, name:"DB Push Press",  time:"70s",  rx:"10 reps EXPLOSIVOS (2×12kg)",    sc:"8 reps (2×7kg)"},
       {n:3, name:"Barbell Row",    time:"130s", rx:"12 reps (50/30kg)",              sc:"12 KB Row c/lado (16kg)"},
       {n:4, name:"Farmer Carry",   time:"140s", rx:"70m (2×20kg)",                  sc:"50m (2×12kg)"},
       {n:5, name:"Burpees",        time:"70s",  rx:"15 burpees",                    sc:"12 burpees o step-back"},
       {n:6, name:"KB Swings",      time:"120s", rx:"25 reps (20kg)",                sc:"20 reps (12kg)"},
       {n:7, name:"Sled Push",      time:"120s", rx:"20m peso moderado",             sc:"15m peso ligero"},
     ],
     cooldown:"5 min: Stretching hombros, dorsal, flexores de cadera, tríceps",
     notes:"UPPER — empuje y tirón. SkiErg: espalda recta, tirón desde caderas. Push Press: extensión completa de codos. Farmer: hombros abajo. 1 sled: solo push hoy. Math: 760s × 3 + 180s = 41 min.",
    },
    // MAR — LOWER BODY
    {type:"lower", title:"LOWER BODY — Base",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad caderas → 2 rondas: 10 air squats + 10 glute bridges + 200m jog",
     stations:[
       {n:1, name:"Run",             time:"110s", rx:"300m Zona 2 (conversacional)",  sc:"250m o caminata rápida"},
       {n:2, name:"Sled Push",       time:"120s", rx:"25m peso moderado",             sc:"15m peso ligero"},
       {n:3, name:"DB Goblet Squat", time:"100s", rx:"20 reps (24kg)",                sc:"20 reps (16kg)"},
       {n:4, name:"Lunges",          time:"110s", rx:"30m con DB (2×8kg)",            sc:"30m bodyweight"},
       {n:5, name:"Box Jumps",       time:"70s",  rx:"12 box jumps (50cm)",           sc:"12 step-ups rápidos"},
       {n:6, name:"KB Swings",       time:"100s", rx:"25 reps (20kg)",                sc:"20 reps (12kg)"},
       {n:7, name:"Run",             time:"75s",  rx:"200m ritmo moderado",           sc:"150m"},
       {n:8, name:"DB Rev Lunges",   time:"80s",  rx:"16 reps totales (2×10kg)",      sc:"16 reps bodyweight"},
     ],
     cooldown:"5 min: Stretching cuádriceps, isquiotibiales, caderas, pantorrillas",
     notes:"LOWER — solo SLED PUSH (1 trineo). Run como cardio activo entre piernas. Goblet squat: talón en suelo, pecho arriba. Math: 765s × 3 + 180s = 41 min.",
    },
    // MIÉ — AEROBIC
    {type:"aerobic", title:"AEROBIC CAPACITY — Base",
     format:"8 est · Tríos · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog progresivo 400m → movilidad dinámica → 10 WB técnicos",
     stations:[
       {n:1, name:"Run",        time:"140s", rx:"400m Zona 2 (conversacional)",  sc:"300m o caminata rápida"},
       {n:2, name:"Rower",      time:"110s", rx:"300m ritmo sostenible",          sc:"220m"},
       {n:3, name:"Wall Balls", time:"100s", rx:"30 reps (6/9kg)",                sc:"20 reps (4/6kg)"},
       {n:4, name:"SkiErg",     time:"90s",  rx:"250m ritmo sostenible",          sc:"180m"},
       {n:5, name:"Burpees",    time:"70s",  rx:"15 burpees continuos",           sc:"12 burpees o step-back"},
       {n:6, name:"Run",        time:"110s", rx:"300m Zona 2 (nunca parar)",      sc:"250m"},
       {n:7, name:"Wall Balls", time:"90s",  rx:"25 reps (6/9kg)",                sc:"18 reps (4/6kg)"},
       {n:8, name:"KB Swings",  time:"90s",  rx:"25 reps (16kg)",                 sc:"20 reps (12kg)"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"AEROBIC — NUNCA PARAR. Ritmo conversacional constante. Si alguien para → escalar peso. Rower y SkiErg: técnica sobre velocidad. Math: 800s × 3 + 180s = 42.5 min.",
    },
    // JUE — THRESHOLD
    {type:"threshold", title:"THRESHOLD — Base 🔥",
     format:"7 est · Flex (2s y 3s) · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog 400m progresivo → movilidad → 3 sprints 50m al 70%",
     stations:[
       {n:1, name:"Run (ANCLA)",  time:"130s", rx:"400m TEMPO pace (RPE 8)",       sc:"300m ritmo fuerte"},
       {n:2, name:"SkiErg",       time:"100s", rx:"270m (<1:50/500m)",             sc:"190m"},
       {n:3, name:"Sled Push",    time:"150s", rx:"4×25m ritmo race intro",        sc:"3×20m peso ligero"},
       {n:4, name:"Rower",        time:"110s", rx:"300m ritmo agresivo",           sc:"210m"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"20 reps (9/6kg)",               sc:"15 reps (6/4kg)"},
       {n:6, name:"Run",          time:"105s", rx:"300m TEMPO (mantener RPE 8)",   sc:"250m"},
       {n:7, name:"Farmer Carry", time:"120s", rx:"60m (2×20kg)",                  sc:"40m (2×12kg)"},
     ],
     cooldown:"8 min: Caminata 200m + stretching profundo + respiración diafragmática",
     notes:"THRESHOLD — Zona 4 real. Si pueden hablar cómodamente van demasiado lentos. Run ANCLA marca el ritmo de todo. Math: 805s × 3 + 180s = 43 min.",
    },
    // VIE — POWER (4 rondas)
    {type:"power", title:"POWER & SPEED — Base ⚡",
     format:"8 est · Parejas · tiempos variables · 4 rondas · 90s desc · ~44 min",
     warmup:"5 min: Jumping jacks → high knees → 5 burpees → 5 box jumps progresivos",
     stations:[
       {n:1, name:"DB Clean",          time:"70s", rx:"8 reps EXPLOSIVOS (2×20kg)",  sc:"8 KB Clean (16kg)"},
       {n:2, name:"Rower Sprint",       time:"75s", rx:"200m MAX EFFORT",             sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",          time:"65s", rx:"12 box jumps (50cm)",         sc:"12 step-ups rápidos"},
       {n:4, name:"Sled Push Sprint",   time:"90s", rx:"25m SPRINT peso moderado",    sc:"15m peso ligero"},
       {n:5, name:"Burpees",            time:"75s", rx:"15 burpees MÁXIMO RITMO",     sc:"12 burpees"},
       {n:6, name:"DB Push Press",      time:"65s", rx:"10 reps EXPLOSIVOS (2×12kg)", sc:"8 reps (2×7kg)"},
       {n:7, name:"SkiErg Sprint",      time:"90s", rx:"250m sprint (<1:45/500m)",    sc:"180m"},
       {n:8, name:"KB Swing High Pull", time:"65s", rx:"12 reps EXPLOSIVOS (20kg)",   sc:"12 reps (12kg)"},
     ],
     cooldown:"5 min: Stretching isquiotibiales, flexores de cadera, hombros",
     notes:"POWER — 4 RONDAS. DB Clean: extensión completa de cadera + recepción bajo. Competencia entre parejas. Si la velocidad baja → peso correcto. Math: 595s × 4 + 270s = 44 min.",
    },
    // SÁB — FULL BODY
    {type:"fullbody", title:"FULL BODY — Base 🏁",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~42 min",
     warmup:"5 min: Jog 400m → movilidad → 5 DB Clean + 5 WB + 5 burpees activación",
     stations:[
       {n:1, name:"Run",          time:"110s", rx:"300m ritmo moderado",           sc:"250m"},
       {n:2, name:"SkiErg",       time:"110s", rx:"300m ritmo sostenible",         sc:"220m"},
       {n:3, name:"Sled Push",    time:"120s", rx:"25m peso moderado",             sc:"15m peso ligero"},
       {n:4, name:"DB Clean",     time:"70s",  rx:"8 reps EXPLOSIVOS (2×20kg)",    sc:"8 KB Clean (16kg)"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"25 reps (6/9kg)",               sc:"18 reps (4/6kg)"},
       {n:6, name:"Farmer Carry", time:"120s", rx:"60m (2×20kg)",                  sc:"40m (2×12kg)"},
       {n:7, name:"Box Jumps",    time:"65s",  rx:"12 box jumps (50cm)",           sc:"12 step-ups"},
       {n:8, name:"Rower",        time:"95s",  rx:"250m ritmo agresivo",           sc:"180m"},
     ],
     cooldown:"8 min: Caminata 200m + stretching completo + celebrar la semana",
     notes:"FULL BODY — la clase más dura. Upper + lower + máquinas. 1 sled: push únicamente. Math: 780s × 3 + 180s = 42 min.",
    },
  ],

  // ── SEMANA 2 — BUILD (+5-10%) ─────────────────────────────────────────────
  w2: [
    // LUN — LOWER BODY BUILD
    {type:"lower", title:"LOWER BODY — BUILD",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad caderas → 2 rondas: 12 air squats + 10 glute bridges + 200m jog",
     stations:[
       {n:1, name:"Run",             time:"110s", rx:"350m Zona 2",                   sc:"280m o caminata rápida"},
       {n:2, name:"Sled Push",       time:"120s", rx:"4×20m peso moderado",           sc:"3×15m peso ligero"},
       {n:3, name:"DB Goblet Squat", time:"100s", rx:"22 reps (24kg)",                sc:"22 reps (16kg)"},
       {n:4, name:"Lunges",          time:"110s", rx:"40m con DB (2×10kg)",           sc:"40m bodyweight"},
       {n:5, name:"Box Jumps",       time:"70s",  rx:"14 box jumps (50cm)",           sc:"14 step-ups rápidos"},
       {n:6, name:"KB Swings",       time:"100s", rx:"28 reps (20kg)",                sc:"22 reps (12kg)"},
       {n:7, name:"Run",             time:"75s",  rx:"200m ritmo moderado",           sc:"150m"},
       {n:8, name:"DB Rev Lunges",   time:"80s",  rx:"18 reps totales (2×10kg)",      sc:"16 reps bodyweight"},
     ],
     cooldown:"5 min: Stretching cuádriceps, isquiotibiales, caderas, pantorrillas",
     notes:"LOWER BUILD — +2 reps squat/lunges/jumps vs BASE. 1 sled: solo push. Distancias de run deben ser más rápidas que Sem 1. Math: 765s × 3 + 180s = 41 min.",
    },
    // MAR — AEROBIC BUILD
    {type:"aerobic", title:"AEROBIC CAPACITY — BUILD",
     format:"8 est · Tríos · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog 400m → movilidad dinámica → 12 WB técnicos",
     stations:[
       {n:1, name:"Run",       time:"140s", rx:"400m Zona 2",                     sc:"300m o caminata rápida"},
       {n:2, name:"Rower",     time:"110s", rx:"320m ritmo sostenible",            sc:"240m"},
       {n:3, name:"Wall Balls",time:"100s", rx:"32 reps (6/9kg)",                  sc:"22 reps (4/6kg)"},
       {n:4, name:"SkiErg",    time:"90s",  rx:"270m ritmo sostenible",            sc:"190m"},
       {n:5, name:"Burpees",   time:"70s",  rx:"17 burpees continuos",             sc:"14 burpees o step-back"},
       {n:6, name:"Run",       time:"110s", rx:"300m Zona 2",                      sc:"250m"},
       {n:7, name:"Step-ups",  time:"90s",  rx:"40 reps alt. (cajón 20cm + KB 12kg)", sc:"30 reps bodyweight"},
       {n:8, name:"KB Swings", time:"90s",  rx:"28 reps (16kg)",                   sc:"22 reps (12kg)"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"AEROBIC BUILD — +2 WB, +20m Ski/Rower vs BASE. Step-ups en est. 7 para variedad. Nunca parar. Math: 800s × 3 + 180s = 42.5 min.",
    },
    // MIÉ — THRESHOLD BUILD
    {type:"threshold", title:"THRESHOLD — BUILD 🔥",
     format:"7 est · Flex (2s y 3s) · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog 400m → movilidad → 3 sprints 50m al 75%",
     stations:[
       {n:1, name:"Run (ANCLA)",  time:"130s", rx:"400m TEMPO pace (RPE 8)",       sc:"300m ritmo fuerte"},
       {n:2, name:"Rower",        time:"100s", rx:"290m ritmo agresivo",            sc:"200m"},
       {n:3, name:"Sled Push",    time:"150s", rx:"4×25m ritmo race",              sc:"3×20m peso ligero"},
       {n:4, name:"SkiErg",       time:"110s", rx:"290m (<1:50/500m)",             sc:"200m"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"22 reps (9/6kg)",               sc:"16 reps (6/4kg)"},
       {n:6, name:"Run",          time:"105s", rx:"300m TEMPO",                    sc:"250m"},
       {n:7, name:"Farmer Carry", time:"120s", rx:"65m (2×20kg)",                  sc:"45m (2×12kg)"},
     ],
     cooldown:"8 min: Caminata + stretching profundo + respiración diafragmática",
     notes:"THRESHOLD BUILD — +2 WB, +5m Farmer vs BASE. Rower en posición 2 (rotación vs S1). Zona 4 real. Math: 805s × 3 + 180s = 43 min.",
    },
    // JUE — POWER BUILD (4 rondas)
    {type:"power", title:"POWER & SPEED — BUILD ⚡",
     format:"8 est · Parejas · tiempos variables · 4 rondas · 90s desc · ~44 min",
     warmup:"5 min: Jumping jacks → high knees → 6 burpees → 6 box jumps progresivos",
     stations:[
       {n:1, name:"DB Clean",          time:"70s", rx:"9 reps EXPLOSIVOS (2×20kg)",  sc:"9 KB Clean (16kg)"},
       {n:2, name:"Rower Sprint",       time:"75s", rx:"200m MAX EFFORT",             sc:"150m esfuerzo alto"},
       {n:3, name:"Box Jumps",          time:"65s", rx:"14 box jumps (50cm)",         sc:"14 step-ups rápidos"},
       {n:4, name:"Sled Push Sprint",   time:"90s", rx:"25m SPRINT",                  sc:"15m peso ligero"},
       {n:5, name:"Burpees",            time:"75s", rx:"17 burpees MÁXIMO RITMO",     sc:"13 burpees"},
       {n:6, name:"DB Push Press",      time:"65s", rx:"12 reps EXPLOSIVOS (2×12kg)", sc:"10 reps (2×7kg)"},
       {n:7, name:"SkiErg Sprint",      time:"90s", rx:"270m sprint",                 sc:"190m"},
       {n:8, name:"KB Swing High Pull", time:"65s", rx:"14 reps (20kg)",              sc:"14 reps (12kg)"},
     ],
     cooldown:"5 min: Stretching isquiotibiales, flexores, hombros",
     notes:"POWER BUILD — +1-2 reps en todo vs BASE. 4 RONDAS. Velocidad de ejecución es el objetivo. Math: 595s × 4 + 270s = 44 min.",
    },
    // VIE — FULL BODY BUILD
    {type:"fullbody", title:"FULL BODY — BUILD 🏁",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~42 min",
     warmup:"5 min: Jog 400m → movilidad → 6 DB Clean + 6 WB + 6 burpees activación",
     stations:[
       {n:1, name:"Run",          time:"110s", rx:"350m ritmo moderado",           sc:"280m"},
       {n:2, name:"SkiErg",       time:"110s", rx:"320m ritmo sostenible",         sc:"240m"},
       {n:3, name:"Sled Push",    time:"120s", rx:"25m peso moderado",             sc:"15m peso ligero"},
       {n:4, name:"DB Clean",     time:"70s",  rx:"9 reps EXPLOSIVOS (2×20kg)",    sc:"9 KB Clean (16kg)"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"27 reps (6/9kg)",               sc:"20 reps (4/6kg)"},
       {n:6, name:"Farmer Carry", time:"120s", rx:"65m (2×20kg)",                  sc:"45m (2×12kg)"},
       {n:7, name:"Box Jumps",    time:"65s",  rx:"14 box jumps (50cm)",           sc:"14 step-ups"},
       {n:8, name:"Rower",        time:"95s",  rx:"270m ritmo agresivo",           sc:"190m"},
     ],
     cooldown:"8 min: Caminata 200m + stretching completo",
     notes:"FULL BODY BUILD — +reps y distancia vs BASE. Upper + lower + máquinas. 1 sled: push únicamente. Math: 780s × 3 + 180s = 42 min.",
    },
    // SÁB — UPPER BODY BUILD
    {type:"upper", title:"UPPER BODY — BUILD",
     format:"7 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad hombros → 2 rondas: 12 push-ups + 12 ring rows + 200m jog",
     stations:[
       {n:1, name:"SkiErg",       time:"110s", rx:"370m ritmo sostenible",         sc:"260m"},
       {n:2, name:"DB Push Press", time:"70s",  rx:"11 reps EXPLOSIVOS (2×12kg)",   sc:"9 reps (2×7kg)"},
       {n:3, name:"Barbell Row",   time:"130s", rx:"12 reps (55/30kg)",             sc:"12 KB Row c/lado (16kg)"},
       {n:4, name:"Farmer Carry",  time:"140s", rx:"75m (2×20kg)",                 sc:"55m (2×12kg)"},
       {n:5, name:"Burpees",       time:"70s",  rx:"17 burpees",                   sc:"14 burpees o step-back"},
       {n:6, name:"KB Swings",     time:"120s", rx:"27 reps (20kg)",               sc:"22 reps (12kg)"},
       {n:7, name:"Sled Push",     time:"120s", rx:"20m peso moderado",            sc:"15m peso ligero"},
     ],
     cooldown:"5 min: Stretching hombros, dorsal, tríceps",
     notes:"UPPER BUILD — +20m Ski, +1-2 reps todo vs BASE. 1 sled: push únicamente. Math: 760s × 3 + 180s = 41 min.",
    },
  ],

  // ── SEMANA 3 — PEAK (+10-15%) ─────────────────────────────────────────────
  w3: [
    // LUN — AEROBIC PEAK
    {type:"aerobic", title:"AEROBIC CAPACITY — PEAK",
     format:"8 est · Tríos · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog 400m → movilidad dinámica → 15 WB técnicos",
     stations:[
       {n:1, name:"Run",       time:"140s", rx:"450m Zona 2",                    sc:"350m o caminata rápida"},
       {n:2, name:"Rower",     time:"110s", rx:"350m ritmo sostenible",           sc:"260m"},
       {n:3, name:"Wall Balls",time:"100s", rx:"35 reps (6/9kg)",                 sc:"25 reps (4/6kg)"},
       {n:4, name:"SkiErg",    time:"90s",  rx:"300m ritmo sostenible",           sc:"210m"},
       {n:5, name:"Burpees",   time:"70s",  rx:"20 burpees continuos",            sc:"15 burpees o step-back"},
       {n:6, name:"Run",       time:"110s", rx:"350m Zona 2",                     sc:"280m"},
       {n:7, name:"Step-ups",  time:"90s",  rx:"45 reps alt. (cajón + KB 14kg)",  sc:"35 reps bodyweight"},
       {n:8, name:"KB Swings", time:"90s",  rx:"30 reps (20kg)",                  sc:"25 reps (16kg)"},
     ],
     cooldown:"5 min: Caminata 200m + stretching pantorrillas y caderas",
     notes:"AEROBIC PEAK — pico del Mes 1. +50m Run, +30m Rower, +5 WB vs BUILD. Sin parar. La próxima semana es DELOAD. Math: 800s × 3 + 180s = 42.5 min.",
    },
    // MAR — THRESHOLD PEAK
    {type:"threshold", title:"THRESHOLD — PEAK 🔥",
     format:"7 est · Flex (2s y 3s) · tiempos variables · 3 rondas · 90s desc · ~43 min",
     warmup:"5 min: Jog 400m → movilidad → 4 sprints 60m prog. (60-70-80-85%)",
     stations:[
       {n:1, name:"Run (ANCLA)",  time:"130s", rx:"400m TEMPO (RPE 8-9)",           sc:"300m ritmo fuerte"},
       {n:2, name:"Rower",        time:"100s", rx:"320m ritmo agresivo",            sc:"220m"},
       {n:3, name:"Sled Push",    time:"150s", rx:"5×25m ritmo race",              sc:"4×20m peso ligero"},
       {n:4, name:"SkiErg",       time:"110s", rx:"300m (<1:50/500m)",             sc:"210m"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"25 reps (9/6kg)",               sc:"18 reps (6/4kg)"},
       {n:6, name:"Run",          time:"105s", rx:"300m TEMPO",                    sc:"250m"},
       {n:7, name:"Farmer Carry", time:"120s", rx:"70m (2×20kg)",                  sc:"50m (2×12kg)"},
     ],
     cooldown:"8 min: Caminata + stretching profundo + respiración diafragmática",
     notes:"THRESHOLD PEAK — día más duro del mes. +1 Sled, +3 WB, +5m Farmer vs BUILD. Sin reservas — la próxima es DELOAD. Math: 805s × 3 + 180s = 43 min.",
    },
    // MIÉ — POWER PEAK (4 rondas)
    {type:"power", title:"POWER & SPEED — PEAK ⚡",
     format:"8 est · Parejas · tiempos variables · 4 rondas · 90s desc · ~44 min",
     warmup:"5 min: Jumping jacks → high knees → 8 burpees → 8 box jumps progresivos",
     stations:[
       {n:1, name:"DB Clean",          time:"70s", rx:"10 reps EXPLOSIVOS (2×22kg)", sc:"10 KB Clean (16kg)"},
       {n:2, name:"Rower Sprint",       time:"75s", rx:"220m MAX EFFORT",             sc:"160m esfuerzo alto"},
       {n:3, name:"Box Jumps",          time:"65s", rx:"15 box jumps (60cm)",         sc:"15 step-ups rápidos"},
       {n:4, name:"Sled Push Sprint",   time:"90s", rx:"30m SPRINT",                  sc:"20m peso ligero"},
       {n:5, name:"Burpees",            time:"75s", rx:"20 burpees MÁXIMO RITMO",     sc:"15 burpees"},
       {n:6, name:"DB Push Press",      time:"65s", rx:"12 reps EXPLOSIVOS (2×14kg)", sc:"10 reps (2×8kg)"},
       {n:7, name:"SkiErg Sprint",      time:"90s", rx:"300m sprint",                 sc:"210m"},
       {n:8, name:"KB Swing High Pull", time:"65s", rx:"15 reps (24kg)",              sc:"15 reps (16kg)"},
     ],
     cooldown:"5 min: Stretching activo isquiotibiales, flexores, hombros",
     notes:"POWER PEAK — pico del programa. +1-2 reps, +5-10m Sled, pesos suben. 4 RONDAS. Anotar pesos — DELOAD usa los mismos. Math: 595s × 4 + 270s = 44 min.",
    },
    // JUE — FULL BODY PEAK
    {type:"fullbody", title:"FULL BODY — PEAK 🏁",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~42 min",
     warmup:"5 min: Jog 400m → movilidad → 8 DB Clean + 8 WB + 8 burpees activación",
     stations:[
       {n:1, name:"Run",          time:"110s", rx:"350m ritmo moderado",           sc:"280m"},
       {n:2, name:"SkiErg",       time:"110s", rx:"340m ritmo sostenible",         sc:"250m"},
       {n:3, name:"Sled Push",    time:"120s", rx:"30m peso moderado",             sc:"20m peso ligero"},
       {n:4, name:"DB Clean",     time:"70s",  rx:"10 reps EXPLOSIVOS (2×22kg)",   sc:"10 KB Clean (16kg)"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"30 reps (6/9kg)",               sc:"22 reps (4/6kg)"},
       {n:6, name:"Farmer Carry", time:"120s", rx:"70m (2×24kg)",                  sc:"50m (2×16kg)"},
       {n:7, name:"Box Jumps",    time:"65s",  rx:"15 box jumps (60cm)",           sc:"15 step-ups"},
       {n:8, name:"Rower",        time:"95s",  rx:"280m ritmo agresivo",           sc:"200m"},
     ],
     cooldown:"8 min: Caminata + stretching completo + celebración pico",
     notes:"FULL BODY PEAK — la clase más dura del Mes 1. Todo sube vs BUILD. 1 sled: push únicamente. Anotar pesos — DELOAD usa los mismos. Math: 780s × 3 + 180s = 42 min.",
    },
    // VIE — UPPER BODY PEAK
    {type:"upper", title:"UPPER BODY — PEAK",
     format:"7 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad hombros → 2 rondas: 15 push-ups + 12 ring rows + 200m jog",
     stations:[
       {n:1, name:"SkiErg",       time:"110s", rx:"400m ritmo sostenible",         sc:"280m"},
       {n:2, name:"DB Push Press", time:"70s",  rx:"12 reps EXPLOSIVOS (2×14kg)",   sc:"10 reps (2×8kg)"},
       {n:3, name:"Barbell Row",   time:"130s", rx:"12 reps (55/35kg)",             sc:"12 KB Row c/lado (20kg)"},
       {n:4, name:"Farmer Carry",  time:"140s", rx:"80m (2×22kg)",                 sc:"55m (2×14kg)"},
       {n:5, name:"Burpees",       time:"70s",  rx:"20 burpees",                   sc:"15 burpees o step-back"},
       {n:6, name:"KB Swings",     time:"120s", rx:"30 reps (24kg)",               sc:"25 reps (16kg)"},
       {n:7, name:"Sled Push",     time:"120s", rx:"25m peso moderado",            sc:"15m peso ligero"},
     ],
     cooldown:"5 min: Stretching hombros, dorsal, tríceps, bíceps",
     notes:"UPPER PEAK — +30m Ski, +50m Farmer, pesos suben. 1 sled: push únicamente. Sin reservas — DELOAD la próxima. Math: 760s × 3 + 180s = 41 min.",
    },
    // SÁB — LOWER BODY PEAK
    {type:"lower", title:"LOWER BODY — PEAK",
     format:"8 est · Parejas · tiempos variables · 3 rondas · 90s desc · ~41 min",
     warmup:"5 min: Movilidad caderas → 2 rondas: 15 air squats + 12 glute bridges + 200m jog",
     stations:[
       {n:1, name:"Run",             time:"110s", rx:"350m Zona 2",                  sc:"280m o caminata rápida"},
       {n:2, name:"Sled Push",       time:"120s", rx:"5×20m peso moderado",          sc:"4×15m peso ligero"},
       {n:3, name:"DB Goblet Squat", time:"100s", rx:"25 reps (28kg)",               sc:"22 reps (20kg)"},
       {n:4, name:"Lunges",          time:"110s", rx:"40m con DB (2×12kg)",          sc:"40m bodyweight"},
       {n:5, name:"Box Jumps",       time:"70s",  rx:"15 box jumps (50cm)",          sc:"15 step-ups rápidos"},
       {n:6, name:"KB Swings",       time:"100s", rx:"30 reps (24kg)",               sc:"24 reps (16kg)"},
       {n:7, name:"Run",             time:"75s",  rx:"200m ritmo fuerte",            sc:"150m"},
       {n:8, name:"DB Rev Lunges",   time:"80s",  rx:"20 reps totales (2×12kg)",     sc:"18 reps bodyweight"},
     ],
     cooldown:"8 min: Stretching profundo cuádriceps, isquiotibiales, caderas",
     notes:"LOWER PEAK — todo sube vs BUILD. 1 sled: solo push. Goblet squat: talón en suelo, profundidad completa. Math: 765s × 3 + 180s = 41 min.",
    },
  ],

  // ── SEMANA 4 — DELOAD (mismos ejercicios que PEAK, 2 rondas) ─────────────
  w4: [
    // LUN — THRESHOLD DELOAD (= W3 MAR, 2 rondas)
    {type:"threshold", title:"THRESHOLD — DELOAD 🔥",
     format:"7 est · Flex · tiempos variables · 2 rondas · 90s desc · DELOAD · ~28 min",
     warmup:"5 min: Jog 400m suave → movilidad → 2 sprints 50m al 70%",
     stations:[
       {n:1, name:"Run (ANCLA)",  time:"130s", rx:"400m (mismo RPE que PEAK)",      sc:"300m ritmo fuerte"},
       {n:2, name:"Rower",        time:"100s", rx:"320m ritmo agresivo",            sc:"220m"},
       {n:3, name:"Sled Push",    time:"150s", rx:"5×25m",                         sc:"4×20m"},
       {n:4, name:"SkiErg",       time:"110s", rx:"300m",                          sc:"210m"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"25 reps (9/6kg)",               sc:"18 reps (6/4kg)"},
       {n:6, name:"Run",          time:"105s", rx:"300m TEMPO",                    sc:"250m"},
       {n:7, name:"Farmer Carry", time:"120s", rx:"70m (2×20kg)",                  sc:"50m (2×12kg)"},
     ],
     cooldown:"10 min: Caminata + stretching profundo + respiración",
     notes:"DELOAD — mismos pesos que PEAK, SOLO 2 RONDAS. No añadir rondas. El cuerpo integra adaptaciones. Math: 805s × 2 + 90s = 27.6 min.",
    },
    // MAR — POWER DELOAD (= W3 MIÉ, 2 rondas)
    {type:"power", title:"POWER & SPEED — DELOAD ⚡",
     format:"8 est · Parejas · tiempos variables · 2 rondas · 90s desc · DELOAD · ~22 min",
     warmup:"5 min: Jumping jacks → high knees → 5 burpees suaves → 5 box jumps",
     stations:[
       {n:1, name:"DB Clean",          time:"70s", rx:"10 reps (2×22kg) mismo peso PEAK", sc:"10 KB Clean (16kg)"},
       {n:2, name:"Rower Sprint",       time:"75s", rx:"220m MAX EFFORT",                   sc:"160m esfuerzo alto"},
       {n:3, name:"Box Jumps",          time:"65s", rx:"15 box jumps (60cm)",               sc:"15 step-ups"},
       {n:4, name:"Sled Push Sprint",   time:"90s", rx:"30m SPRINT",                        sc:"20m peso ligero"},
       {n:5, name:"Burpees",            time:"75s", rx:"20 burpees",                        sc:"15 burpees"},
       {n:6, name:"DB Push Press",      time:"65s", rx:"12 reps (2×14kg)",                  sc:"10 reps (2×8kg)"},
       {n:7, name:"SkiErg Sprint",      time:"90s", rx:"300m sprint",                       sc:"210m"},
       {n:8, name:"KB Swing High Pull", time:"65s", rx:"15 reps (24kg)",                    sc:"15 reps (16kg)"},
     ],
     cooldown:"8 min: Stretching activo + respiración",
     notes:"DELOAD POWER — 2 RONDAS. Misma velocidad y peso que PEAK. El power no se pierde con 1 semana de deload. Math: 595s × 2 + 90s = 23 min.",
    },
    // MIÉ — FULL BODY DELOAD (= W3 JUE, 2 rondas)
    {type:"fullbody", title:"FULL BODY — DELOAD 🏁",
     format:"8 est · Parejas · tiempos variables · 2 rondas · 90s desc · DELOAD · ~28 min",
     warmup:"5 min: Jog 400m suave → movilidad → 5 DB Clean + 5 WB",
     stations:[
       {n:1, name:"Run",          time:"110s", rx:"350m ritmo moderado",           sc:"280m"},
       {n:2, name:"SkiErg",       time:"110s", rx:"340m",                          sc:"250m"},
       {n:3, name:"Sled Push",    time:"120s", rx:"30m peso moderado",             sc:"20m peso ligero"},
       {n:4, name:"DB Clean",     time:"70s",  rx:"10 reps (2×22kg)",              sc:"10 KB Clean (16kg)"},
       {n:5, name:"Wall Balls",   time:"90s",  rx:"30 reps (6/9kg)",               sc:"22 reps (4/6kg)"},
       {n:6, name:"Farmer Carry", time:"120s", rx:"70m (2×24kg)",                  sc:"50m (2×16kg)"},
       {n:7, name:"Box Jumps",    time:"65s",  rx:"15 box jumps (60cm)",           sc:"15 step-ups"},
       {n:8, name:"Rower",        time:"95s",  rx:"280m ritmo agresivo",           sc:"200m"},
     ],
     cooldown:"10 min: Caminata + stretching completo + cierre Mes 1",
     notes:"DELOAD FULL BODY — 2 RONDAS. Mismos pesos que PEAK. Revisar registros de Sem 1 — noten el progreso. Math: 780s × 2 + 90s = 27 min.",
    },
    // JUE — UPPER BODY DELOAD (= W3 VIE, 2 rondas)
    {type:"upper", title:"UPPER BODY — DELOAD",
     format:"7 est · Parejas · tiempos variables · 2 rondas · 90s desc · DELOAD · ~27 min",
     warmup:"5 min: Movilidad hombros suave → 1 ronda: 10 push-ups + 10 ring rows",
     stations:[
       {n:1, name:"SkiErg",       time:"110s", rx:"400m",                          sc:"280m"},
       {n:2, name:"DB Push Press", time:"70s",  rx:"12 reps (2×14kg)",              sc:"10 reps (2×8kg)"},
       {n:3, name:"Barbell Row",   time:"130s", rx:"12 reps (55/35kg)",             sc:"12 KB Row c/lado (20kg)"},
       {n:4, name:"Farmer Carry",  time:"140s", rx:"80m (2×22kg)",                 sc:"55m (2×14kg)"},
       {n:5, name:"Burpees",       time:"70s",  rx:"20 burpees",                   sc:"15 burpees"},
       {n:6, name:"KB Swings",     time:"120s", rx:"30 reps (24kg)",               sc:"25 reps (16kg)"},
       {n:7, name:"Sled Push",     time:"120s", rx:"25m peso moderado",            sc:"15m peso ligero"},
     ],
     cooldown:"8 min: Stretching largo hombros, dorsal, tríceps",
     notes:"DELOAD UPPER — 2 RONDAS. Mismos pesos que PEAK. Técnica perfecta en cada rep. Math: 760s × 2 + 90s = 26 min.",
    },
    // VIE — LOWER BODY DELOAD (= W3 SÁB, 2 rondas)
    {type:"lower", title:"LOWER BODY — DELOAD",
     format:"8 est · Parejas · tiempos variables · 2 rondas · 90s desc · DELOAD · ~27 min",
     warmup:"5 min: Movilidad caderas suave → 1 ronda: 10 air squats + 10 glute bridges",
     stations:[
       {n:1, name:"Run",             time:"110s", rx:"350m Zona 2 cómodo",            sc:"280m"},
       {n:2, name:"Sled Push",       time:"120s", rx:"5×20m",                        sc:"4×15m"},
       {n:3, name:"DB Goblet Squat", time:"100s", rx:"25 reps (28kg)",               sc:"22 reps (20kg)"},
       {n:4, name:"Lunges",          time:"110s", rx:"40m con DB (2×12kg)",          sc:"40m bodyweight"},
       {n:5, name:"Box Jumps",       time:"70s",  rx:"15 box jumps (50cm)",          sc:"15 step-ups"},
       {n:6, name:"KB Swings",       time:"100s", rx:"30 reps (24kg)",               sc:"24 reps (16kg)"},
       {n:7, name:"Run",             time:"75s",  rx:"200m",                         sc:"150m"},
       {n:8, name:"DB Rev Lunges",   time:"80s",  rx:"20 reps (2×12kg)",             sc:"18 reps bodyweight"},
     ],
     cooldown:"8 min: Stretching largo cuádriceps, isquiotibiales, caderas",
     notes:"DELOAD LOWER — 2 RONDAS. Mismos pesos que PEAK. Llegar al Mes 2 frescos y sin fatiga acumulada. Math: 765s × 2 + 90s = 25.5 min.",
    },
    // SÁB — AEROBIC DELOAD (= W3 LUN, 2 rondas)
    {type:"aerobic", title:"AEROBIC CAPACITY — DELOAD",
     format:"8 est · Tríos · tiempos variables · 2 rondas · 90s desc · DELOAD · ~29 min",
     warmup:"5 min: Jog 400m suave → movilidad → 10 WB técnicos",
     stations:[
       {n:1, name:"Run",       time:"140s", rx:"450m Zona 2 cómodo",              sc:"350m o caminata rápida"},
       {n:2, name:"Rower",     time:"110s", rx:"350m",                            sc:"260m"},
       {n:3, name:"Wall Balls",time:"100s", rx:"35 reps (6/9kg)",                 sc:"25 reps (4/6kg)"},
       {n:4, name:"SkiErg",    time:"90s",  rx:"300m",                            sc:"210m"},
       {n:5, name:"Burpees",   time:"70s",  rx:"20 burpees suaves",               sc:"15 burpees"},
       {n:6, name:"Run",       time:"110s", rx:"350m Zona 2",                     sc:"280m"},
       {n:7, name:"Step-ups",  time:"90s",  rx:"45 reps (cajón + KB 14kg)",       sc:"35 reps bodyweight"},
       {n:8, name:"KB Swings", time:"90s",  rx:"30 reps (20kg)",                  sc:"25 reps (16kg)"},
     ],
     cooldown:"10 min: Caminata 400m + stretching completo + celebrar 4 semanas",
     notes:"DELOAD AEROBIC — 2 RONDAS. Cierre del Mes 1. Ritmo conversacional, sin presión. Revisar registros de S1. El Mes 2 empieza la próxima semana. Math: 800s × 2 + 90s = 27.7 min.",
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
  const [tvMode, setTvMode]   = useState(false);

  const isTv = tvMode || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tv") === "true");
  const t  = T(dark);
  const gw = selM * 4 + selW + 1;
  const note = WEEK_NOTES[`M${selM + 1}S${selW + 1}`];

  const toggleDark = () => {
    const n = !dark;
    setDark(n);
    try { localStorage.setItem("hx-dark", n ? "1" : "0"); } catch {}
  };

  const getWod     = (m, w, d) => WODS["w" + (m * 4 + w + 1)]?.[d];
  const getWodType = (m, w, d) => getWod(m, w, d)?.type ?? WEEK_TYPES[w % 4]?.[d] ?? "upper";

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
    const tvDt  = tvWod ? DAY_TYPES[tvWod.type] : null;
    const exitBtn = (
      <button onClick={() => setTvMode(false)}
        style={{position:"fixed",top:16,right:16,background:"#222",border:"1px solid #444",borderRadius:8,color:"#aaa",fontSize:13,padding:"6px 14px",cursor:"pointer",zIndex:100}}>
        ✕ Salir
      </button>
    );
    if (!tvWod || !tvDay) return (
      <div style={{background:"#111",color:"#fff",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        {exitBtn}
        <div style={{fontSize:30,fontWeight:700}}>{_jsDay === 0 ? "Dia de descanso" : "No hay WOD hoy"}</div>
        <div style={{color:"#555",fontSize:15}}>{_diff < 0 ? "El programa empieza el Lun 6 Abr" : "Proximamente"}</div>
      </div>
    );
    return (
      <div style={{background:"#0A0A0A",color:"#fff",minHeight:"100vh",padding:"32px 48px",fontFamily:"system-ui,sans-serif"}}>
        {exitBtn}
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
              const dt      = DAY_TYPES[getWodType(selM, selW, di)];
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
            const dt  = DAY_TYPES[getWodType(selM, selW, expDay)];
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
    const dt  = DAY_TYPES[getWodType(todayM, todayWm, todayD)];
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
        <div style={{display:"flex",gap:6}}>
          <button onClick={() => setTvMode(true)}
            style={{background:t.chip,border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.t2}}>
            TV
          </button>
          <button onClick={toggleDark} style={{background:t.chip,border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.t2}}>
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </div>

      {/* Content */}
      {render()}

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:t.surface,borderTop:`1px solid ${t.border}`,display:"flex",zIndex:10}}>
        {NAV.map(n => {
          const isAct = view === n.id;
          const accentColor = n.id === "wod"
            ? (todayD !== undefined ? DAY_TYPES[getWodType(todayM, todayWm, todayD)]?.color ?? "#EF4444" : "#EF4444")
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
