/*
  Warnings:

  - The values [pendiente,contabilizado,error] on the enum `EstadoContabilizacion` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fecha_contabilizacion` on the `solicitud` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoContabilizacion_new" AS ENUM ('no_aplica', 'registrado', 'en_proceso', 'procesado', 'fallido');
ALTER TABLE "solicitud" ALTER COLUMN "estado_contabilizacion" DROP DEFAULT;
ALTER TABLE "solicitud" ALTER COLUMN "estado_contabilizacion" TYPE "EstadoContabilizacion_new" USING ("estado_contabilizacion"::text::"EstadoContabilizacion_new");
ALTER TYPE "EstadoContabilizacion" RENAME TO "EstadoContabilizacion_old";
ALTER TYPE "EstadoContabilizacion_new" RENAME TO "EstadoContabilizacion";
DROP TYPE "EstadoContabilizacion_old";
ALTER TABLE "solicitud" ALTER COLUMN "estado_contabilizacion" SET DEFAULT 'no_aplica';
COMMIT;

-- AlterTable
ALTER TABLE "solicitud" DROP COLUMN "fecha_contabilizacion",
ADD COLUMN     "fecha_en_proceso" TIMESTAMP(3),
ADD COLUMN     "fecha_proceso" TIMESTAMP(3),
ADD COLUMN     "fecha_registro_cont" TIMESTAMP(3),
ADD COLUMN     "numero_asiento_contable" VARCHAR(50);
