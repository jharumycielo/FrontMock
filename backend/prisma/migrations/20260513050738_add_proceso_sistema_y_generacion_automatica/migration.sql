-- CreateEnum
CREATE TYPE "CategoriaProcesoSistema" AS ENUM ('catalogo', 'clasificador', 'proceso');

-- CreateEnum
CREATE TYPE "EstadoContabilizacion" AS ENUM ('no_aplica', 'pendiente', 'en_proceso', 'contabilizado', 'error');

-- AlterTable
ALTER TABLE "solicitud" ADD COLUMN     "cat_id" VARCHAR(80),
ADD COLUMN     "es_generada_automaticamente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado_contabilizacion" "EstadoContabilizacion" NOT NULL DEFAULT 'no_aplica',
ADD COLUMN     "fecha_contabilizacion" TIMESTAMP(3),
ADD COLUMN     "solicitud_origen_id" TEXT;

-- AlterTable
ALTER TABLE "tipo_documento" ADD COLUMN     "proceso_id" TEXT;

-- CreateTable
CREATE TABLE "proceso_sistema" (
    "id" TEXT NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "categoria" "CategoriaProcesoSistema" NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "proceso_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regla_generacion_automatica" (
    "id" TEXT NOT NULL,
    "tipo_documento_origen_id" TEXT NOT NULL,
    "estado_disparo" "EstadoSolicitud" NOT NULL,
    "tipo_documento_destino_id" TEXT NOT NULL,
    "estado_inicial_destino" "EstadoSolicitud" NOT NULL,
    "modulo_origen" VARCHAR(50) NOT NULL,
    "modulo_destino" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "regla_generacion_automatica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proceso_sistema_codigo_key" ON "proceso_sistema"("codigo");

-- CreateIndex
CREATE INDEX "proceso_sistema_modulo_categoria_idx" ON "proceso_sistema"("modulo", "categoria");

-- AddForeignKey
ALTER TABLE "tipo_documento" ADD CONSTRAINT "tipo_documento_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "proceso_sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regla_generacion_automatica" ADD CONSTRAINT "regla_generacion_automatica_tipo_documento_origen_id_fkey" FOREIGN KEY ("tipo_documento_origen_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regla_generacion_automatica" ADD CONSTRAINT "regla_generacion_automatica_tipo_documento_destino_id_fkey" FOREIGN KEY ("tipo_documento_destino_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_solicitud_origen_id_fkey" FOREIGN KEY ("solicitud_origen_id") REFERENCES "solicitud"("id") ON DELETE SET NULL ON UPDATE CASCADE;
