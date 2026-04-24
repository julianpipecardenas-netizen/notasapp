require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./swagger');

const estudiantesRouter = require('./routes/estudiantes');
const notasRouter       = require('./routes/notas');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger UI en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'NotasApp API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1a237e; }',
}));

// Spec JSON para importar en Postman
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notas-microservicio', version: '1.0.0', docs: '/api-docs' });
});

// Rutas
app.use('/api/estudiantes', estudiantesRouter);
app.use('/api/notas',       notasRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Microservicio corriendo en puerto ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
