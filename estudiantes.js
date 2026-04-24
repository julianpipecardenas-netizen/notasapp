// src/routes/estudiantes.js
const express = require('express');
const router  = express.Router();
const pool    = require('./db');

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /api/estudiantes/{cedula}:
 *   get:
 *     summary: Consultar estudiante por cédula
 *     description: Retorna los datos del estudiante junto con sus notas registradas.
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de cédula del estudiante
 *         example: "1001234567"
 *     responses:
 *       200:
 *         description: Estudiante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstudianteConNotas'
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

/**
 * @swagger
 * /api/estudiantes:
 *   post:
 *     summary: Registrar o actualizar un estudiante
 *     description: Crea un nuevo estudiante. Si la cédula ya existe, actualiza sus datos.
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estudiante'
 *           example:
 *             cedula: "1001234567"
 *             nombre: "Ana García"
 *             correo: "ana@email.com"
 *             celular: "3001234567"
 *             materia: "Matemáticas"
 *     responses:
 *       201:
 *         description: Estudiante registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       400:
 *         description: Datos inválidos (cédula o nombre faltantes)
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

module.exports = router;
