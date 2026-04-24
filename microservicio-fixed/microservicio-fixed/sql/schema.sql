-- ============================================================
-- VOLCADO SQL COMPLETO — NotasApp
-- Base de datos: PostgreSQL (Supabase)
-- ============================================================

DROP TABLE IF EXISTS notas CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- TABLA: estudiantes
CREATE TABLE estudiantes (
  cedula     VARCHAR(20)   NOT NULL,
  nombre     VARCHAR(100)  NOT NULL,
  correo     VARCHAR(100),
  celular    VARCHAR(20),
  materia    VARCHAR(100),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_estudiantes PRIMARY KEY (cedula)
);

COMMENT ON TABLE  estudiantes            IS 'Información personal y académica de los estudiantes';
COMMENT ON COLUMN estudiantes.cedula     IS 'Número de documento de identidad (PK)';
COMMENT ON COLUMN estudiantes.nombre     IS 'Nombre completo del estudiante';
COMMENT ON COLUMN estudiantes.correo     IS 'Correo electrónico';
COMMENT ON COLUMN estudiantes.celular    IS 'Número de teléfono móvil';
COMMENT ON COLUMN estudiantes.materia    IS 'Asignatura en la que está inscrito';

-- TABLA: notas
CREATE TABLE notas (
  id         SERIAL        NOT NULL,
  cedula     VARCHAR(20)   NOT NULL,
  nota1      NUMERIC(5,2)  NOT NULL DEFAULT 0,
  nota2      NUMERIC(5,2)  NOT NULL DEFAULT 0,
  nota3      NUMERIC(5,2)  NOT NULL DEFAULT 0,
  nota4      NUMERIC(5,2)  NOT NULL DEFAULT 0,
  definitiva NUMERIC(5,2)  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_notas        PRIMARY KEY (id),
  CONSTRAINT uq_notas_cedula UNIQUE (cedula),
  CONSTRAINT fk_notas_estud  FOREIGN KEY (cedula)
      REFERENCES estudiantes (cedula) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_nota1       CHECK (nota1 BETWEEN 0 AND 5),
  CONSTRAINT chk_nota2       CHECK (nota2 BETWEEN 0 AND 5),
  CONSTRAINT chk_nota3       CHECK (nota3 BETWEEN 0 AND 5),
  CONSTRAINT chk_nota4       CHECK (nota4 BETWEEN 0 AND 5),
  CONSTRAINT chk_definitiva  CHECK (definitiva BETWEEN 0 AND 5)
);

COMMENT ON TABLE  notas            IS 'Calificaciones de los estudiantes';
COMMENT ON COLUMN notas.nota1      IS 'Primera calificación parcial (0.00 - 5.00)';
COMMENT ON COLUMN notas.nota2      IS 'Segunda calificación parcial (0.00 - 5.00)';
COMMENT ON COLUMN notas.nota3      IS 'Tercera calificación parcial (0.00 - 5.00)';
COMMENT ON COLUMN notas.nota4      IS 'Cuarta calificación parcial (0.00 - 5.00)';
COMMENT ON COLUMN notas.definitiva IS 'Promedio de las cuatro notas';

-- ÍNDICES
CREATE INDEX idx_notas_cedula ON notas (cedula);

-- TRIGGER updated_at
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

-- DATOS DE PRUEBA
INSERT INTO estudiantes (cedula, nombre, correo, celular, materia) VALUES
  ('1001', 'Ana García',   'ana.garcia@email.com',   '3001111111', 'Matemáticas'),
  ('1002', 'Luis Pérez',   'luis.perez@email.com',   '3002222222', 'Física'),
  ('1003', 'María López',  'maria.lopez@email.com',  '3003333333', 'Química'),
  ('1004', 'Carlos Ruiz',  'carlos.ruiz@email.com',  '3004444444', 'Programación'),
  ('1005', 'Laura Torres', 'laura.torres@email.com', '3005555555', 'Bases de Datos');

INSERT INTO notas (cedula, nota1, nota2, nota3, nota4, definitiva) VALUES
  ('1001', 4.5, 3.8, 4.2, 4.0, 4.13),
  ('1002', 3.0, 3.5, 4.0, 3.8, 3.58),
  ('1003', 4.8, 4.9, 5.0, 4.7, 4.85),
  ('1004', 3.5, 4.0, 3.8, 4.2, 3.88),
  ('1005', 4.0, 4.5, 4.3, 4.1, 4.23);
