// src/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notas App — API REST',
      version: '1.0.0',
      description:
        'Microservicio para la gestión de estudiantes y notas académicas. ' +
        'Permite registrar estudiantes, consultar información y gestionar calificaciones.',
      contact: {
        name: 'Soporte',
        email: 'soporte@notasapp.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Servidor activo',
      },
    ],
    components: {
      schemas: {
        Estudiante: {
          type: 'object',
          required: ['cedula', 'nombre'],
          properties: {
            cedula: {
              type: 'string',
              example: '1001234567',
              description: 'Número de cédula único del estudiante',
            },
            nombre: {
              type: 'string',
              example: 'Ana García',
              description: 'Nombre completo del estudiante',
            },
            correo: {
              type: 'string',
              format: 'email',
              example: 'ana@email.com',
            },
            celular: {
              type: 'string',
              example: '3001234567',
            },
            materia: {
              type: 'string',
              example: 'Matemáticas',
            },
          },
        },
        EstudianteConNotas: {
          allOf: [
            { $ref: '#/components/schemas/Estudiante' },
            {
              type: 'object',
              properties: {
                nota1:      { type: 'number', format: 'float', example: 4.5 },
                nota2:      { type: 'number', format: 'float', example: 3.8 },
                nota3:      { type: 'number', format: 'float', example: 4.2 },
                nota4:      { type: 'number', format: 'float', example: 4.0 },
                definitiva: { type: 'number', format: 'float', example: 4.13 },
              },
            },
          ],
        },
        Notas: {
          type: 'object',
          required: ['cedula'],
          properties: {
            cedula:     { type: 'string', example: '1001234567' },
            nota1:      { type: 'number', format: 'float', example: 4.5 },
            nota2:      { type: 'number', format: 'float', example: 3.8 },
            nota3:      { type: 'number', format: 'float', example: 4.2 },
            nota4:      { type: 'number', format: 'float', example: 4.0 },
            definitiva: { type: 'number', format: 'float', example: 4.13 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Estudiante no encontrado' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
