-- ============================================================
-- SCHEMA para Supabase
-- Ejecuta este SQL en: Supabase → SQL Editor → New Query
-- ============================================================

-- Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  cedula   VARCHAR(20)  PRIMARY KEY,
  nombre   VARCHAR(100) NOT NULL,
  correo   VARCHAR(100),
  celular  VARCHAR(20),
  materia  VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Notas
CREATE TABLE IF NOT EXISTS notas (
  id         SERIAL       PRIMARY KEY,
  cedula     VARCHAR(20)  UNIQUE NOT NULL REFERENCES estudiantes(cedula) ON DELETE CASCADE,
  nota1      NUMERIC(5,2) DEFAULT 0,
  nota2      NUMERIC(5,2) DEFAULT 0,
  nota3      NUMERIC(5,2) DEFAULT 0,
  nota4      NUMERIC(5,2) DEFAULT 0,
  definitiva NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notas_cedula ON notas(cedula);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estudiantes_updated
  BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_notas_updated
  BEFORE UPDATE ON notas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Datos de prueba ─────────────────────────────────────────
INSERT INTO estudiantes (cedula, nombre, correo, celular, materia)
VALUES
  ('1001', 'Ana García',    'ana@email.com',   '3001234567', 'Matemáticas'),
  ('1002', 'Luis Pérez',    'luis@email.com',  '3009876543', 'Física'),
  ('1003', 'María López',   'maria@email.com', '3005551234', 'Química')
ON CONFLICT DO NOTHING;

INSERT INTO notas (cedula, nota1, nota2, nota3, nota4, definitiva)
VALUES
  ('1001', 4.5, 3.8, 4.2, 4.0, 4.13),
  ('1002', 3.0, 3.5, 4.0, 3.8, 3.58),
  ('1003', 4.8, 4.9, 5.0, 4.7, 4.85)
ON CONFLICT DO NOTHING;
