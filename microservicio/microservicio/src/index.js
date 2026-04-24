// src/index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notas-microservicio', version: '1.0.0' });
});

// ════════════════════════════════════════════════════════════
//  ESTUDIANTES
// ════════════════════════════════════════════════════════════

// GET /api/estudiantes/:cedula  — Consultar estudiante + sus notas
app.get('/api/estudiantes/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const result = await pool.query(
      `SELECT e.cedula, e.nombre, e.correo, e.celular, e.materia,
              n.nota1, n.nota2, n.nota3, n.nota4, n.definitiva
       FROM estudiantes e
       LEFT JOIN notas n ON e.cedula = n.cedula
       WHERE e.cedula = $1`,
      [cedula]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/estudiantes  — Registrar nuevo estudiante
app.post('/api/estudiantes', async (req, res) => {
  try {
    const { cedula, nombre, correo, celular, materia } = req.body;
    if (!cedula || !nombre) {
      return res.status(400).json({ message: 'Cédula y nombre son obligatorios' });
    }
    const result = await pool.query(
      `INSERT INTO estudiantes (cedula, nombre, correo, celular, materia)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cedula) DO UPDATE
         SET nombre=$2, correo=$3, celular=$4, materia=$5
       RETURNING *`,
      [cedula, nombre, correo, celular, materia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar estudiante' });
  }
});

// ════════════════════════════════════════════════════════════
//  NOTAS
// ════════════════════════════════════════════════════════════

// GET /api/notas/:cedula  — Consultar notas de un estudiante
app.get('/api/notas/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    // Traemos también el nombre del estudiante
    const result = await pool.query(
      `SELECT e.nombre, n.cedula, n.nota1, n.nota2, n.nota3, n.nota4, n.definitiva
       FROM estudiantes e
       LEFT JOIN notas n ON e.cedula = n.cedula
       WHERE e.cedula = $1`,
      [cedula]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al consultar notas' });
  }
});

// POST /api/notas  — Guardar / actualizar notas
app.post('/api/notas', async (req, res) => {
  try {
    const { cedula, nota1, nota2, nota3, nota4 } = req.body;
    if (!cedula) {
      return res.status(400).json({ message: 'Cédula es obligatoria' });
    }

    // Verificar que el estudiante exista
    const est = await pool.query(
      'SELECT cedula FROM estudiantes WHERE cedula = $1', [cedula]
    );
    if (est.rows.length === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const definitiva = ((nota1 || 0) + (nota2 || 0) + (nota3 || 0) + (nota4 || 0)) / 4;

    const result = await pool.query(
      `INSERT INTO notas (cedula, nota1, nota2, nota3, nota4, definitiva)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (cedula) DO UPDATE
         SET nota1=$2, nota2=$3, nota3=$4, nota4=$5, definitiva=$6
       RETURNING *`,
      [cedula, nota1, nota2, nota3, nota4, Math.round(definitiva * 100) / 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar notas' });
  }
});

// ─── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Microservicio corriendo en puerto ${PORT}`);
});
