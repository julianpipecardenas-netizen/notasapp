// src/routes/notas.js
const express = require('express');
const router  = express.Router();
const pool    = require('./db');

/**
 * @swagger
 * tags:
 *   name: Notas
 *   description: Gestión de calificaciones
 */

/**
 * @swagger
 * /api/notas/{cedula}:
 *   get:
 *     summary: Consultar notas de un estudiante
 *     description: Retorna las cuatro notas y la definitiva del estudiante indicado.
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema:
 *           type: string
 *         description: Cédula del estudiante
 *         example: "1001234567"
 *     responses:
 *       200:
 *         description: Notas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notas'
 *       404:
 *         description: Estudiante no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
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

/**
 * @swagger
 * /api/notas:
 *   post:
 *     summary: Guardar o actualizar notas de un estudiante
 *     description: >
 *       Registra las cuatro notas del estudiante y calcula automáticamente
 *       la definitiva como el promedio de las cuatro notas.
 *       Si ya existen notas para esa cédula, las actualiza.
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cedula]
 *             properties:
 *               cedula: { type: string, example: "1001234567" }
 *               nota1:  { type: number, format: float, example: 4.5 }
 *               nota2:  { type: number, format: float, example: 3.8 }
 *               nota3:  { type: number, format: float, example: 4.2 }
 *               nota4:  { type: number, format: float, example: 4.0 }
 *     responses:
 *       201:
 *         description: Notas guardadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notas'
 *       400:
 *         description: Cédula no proporcionada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Estudiante no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    const { cedula, nota1, nota2, nota3, nota4 } = req.body;
    if (!cedula) {
      return res.status(400).json({ message: 'Cédula es obligatoria' });
    }
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
      [cedula, nota1 || 0, nota2 || 0, nota3 || 0, nota4 || 0,
       Math.round(definitiva * 100) / 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar notas' });
  }
});

module.exports = router;
