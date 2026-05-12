-- Paso 1: Agregar columna como nullable primero
ALTER TABLE "entidad_publica" ADD COLUMN "codigo_numerico" INTEGER;

-- Paso 2: Asignar valor 1 al MEF (único registro existente)
UPDATE "entidad_publica" SET "codigo_numerico" = 1 WHERE "codigo" = 'MEF';

-- Paso 3: Hacer la columna NOT NULL ahora que todos los registros tienen valor
ALTER TABLE "entidad_publica" ALTER COLUMN "codigo_numerico" SET NOT NULL;

-- Paso 4: Crear índice único
CREATE UNIQUE INDEX "entidad_publica_codigo_numerico_key" ON "entidad_publica"("codigo_numerico");
