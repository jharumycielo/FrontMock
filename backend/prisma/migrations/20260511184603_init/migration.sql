-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'bloqueado', 'pendiente_activacion');

-- CreateEnum
CREATE TYPE "TipoEntidad" AS ENUM ('ministerio', 'municipalidad', 'gobierno_regional', 'unidad_ejecutora', 'organismo_publico', 'empresa_publica', 'otra');

-- CreateEnum
CREATE TYPE "AmbitoAcceso" AS ENUM ('sistema', 'nacional', 'entidad', 'unidad');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('NUEVO', 'ELABORADO', 'VERIFICADO', 'OBSERVADO', 'APROBADO', 'RECHAZADO', 'ELIMINADO');

-- CreateEnum
CREATE TYPE "EstadoEntidad" AS ENUM ('activa', 'suspendida', 'migrada', 'archivada');

-- CreateEnum
CREATE TYPE "EstadoUnidad" AS ENUM ('activa', 'suspendida', 'archivada');

-- CreateEnum
CREATE TYPE "TipoPlanContable" AS ENUM ('gubernamental_unico', 'general_empresarial', 'sistema_financiero');

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(150) NOT NULL,
    "apellidos" VARCHAR(150) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(300) NOT NULL,
    "estado" "EstadoUsuario" NOT NULL,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidad_publica" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "ruc" VARCHAR(20),
    "nombre" VARCHAR(250) NOT NULL,
    "tipo_entidad" "TipoEntidad" NOT NULL,
    "entidad_padre_id" TEXT,
    "estado_entidad" "EstadoEntidad" NOT NULL DEFAULT 'activa',
    "entidad_migracion_id" TEXT,
    "fecha_suspension" TIMESTAMP(3),
    "fecha_migracion" TIMESTAMP(3),
    "fecha_archivado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entidad_publica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidad_organica" (
    "id" TEXT NOT NULL,
    "entidad_publica_id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "tipo_unidad" VARCHAR(50) NOT NULL,
    "estado_unidad" "EstadoUnidad" NOT NULL DEFAULT 'activa',
    "fecha_suspension" TIMESTAMP(3),
    "fecha_archivado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidad_organica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rol_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "usuario_entidad_rol" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "entidad_publica_id" TEXT NOT NULL,
    "unidad_organica_id" TEXT,
    "rol_id" TEXT NOT NULL,
    "ambito" "AmbitoAcceso" NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "usuario_entidad_rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulo" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "ruta" VARCHAR(250),
    "icono" VARCHAR(100),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "modulo_padre_id" TEXT,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulo_permiso" (
    "modulo_id" TEXT NOT NULL,
    "permiso_id" TEXT NOT NULL,

    CONSTRAINT "modulo_permiso_pkey" PRIMARY KEY ("modulo_id","permiso_id")
);

-- CreateTable
CREATE TABLE "usuario_sesion" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "perfil_activo_id" TEXT,
    "refresh_token_hash" VARCHAR(300) NOT NULL,
    "ip" VARCHAR(80),
    "user_agent" TEXT,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocada_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_invitacion" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "entidad_publica_id" TEXT NOT NULL,
    "unidad_organica_id" TEXT,
    "rol_id" TEXT NOT NULL,
    "token_hash" VARCHAR(300) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "aceptada_en" TIMESTAMP(3),
    "usuario_creado_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_invitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_documento" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "modulo" VARCHAR(50) NOT NULL,
    "entidad_destino_id" TEXT NOT NULL,
    "unidad_destino_id" TEXT NOT NULL,
    "rol_destino_id" TEXT NOT NULL,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_documento_accion" (
    "tipo_documento_id" TEXT NOT NULL,
    "tipo_accion" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipo_documento_accion_pkey" PRIMARY KEY ("tipo_documento_id","tipo_accion")
);

-- CreateTable
CREATE TABLE "plan_contable" (
    "id" TEXT NOT NULL,
    "numero_plan_contable" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(250) NOT NULL,
    "fecha" DATE NOT NULL,
    "vigencia_plan_contable" VARCHAR(50) NOT NULL,
    "fecha_inicio_desde" DATE NOT NULL,
    "fecha_fin_hasta" DATE,
    "tipo_plan" "TipoPlanContable" NOT NULL,
    "es_editable" BOOLEAN NOT NULL DEFAULT false,
    "es_vigente" BOOLEAN NOT NULL DEFAULT true,
    "es_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_contable" (
    "id" TEXT NOT NULL,
    "plan_contable_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "codigo_completo" VARCHAR(80) NOT NULL,
    "elemento" VARCHAR(1) NOT NULL,
    "grupo" VARCHAR(2),
    "cuenta" VARCHAR(2),
    "subcuenta_1" VARCHAR(2),
    "subcuenta_2" VARCHAR(2),
    "subcuenta_3" VARCHAR(2),
    "nivel" INTEGER NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "codigo_anterior" VARCHAR(80),
    "es_imputable" BOOLEAN NOT NULL,
    "naturaleza" VARCHAR(50) NOT NULL,
    "tipo_elemento" VARCHAR(50) NOT NULL,
    "es_monetaria" BOOLEAN NOT NULL,
    "aplica_extra_presupuestaria" BOOLEAN NOT NULL DEFAULT false,
    "es_reciproca" BOOLEAN NOT NULL DEFAULT false,
    "ac_activo" VARCHAR(20),
    "pc_pasivo" VARCHAR(20),
    "anc_activo" VARCHAR(20),
    "pnc_pasivo" VARCHAR(20),
    "tiene_dinamica_contable" BOOLEAN NOT NULL DEFAULT false,
    "dinamica_debita" TEXT,
    "dinamica_acredita" TEXT,
    "dinamica_objeto" TEXT,
    "dinamica_saldos" TEXT,
    "es_para_entidad_estado" BOOLEAN NOT NULL DEFAULT false,
    "es_vigente" BOOLEAN NOT NULL DEFAULT true,
    "es_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "cuenta_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambito_institucional" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(250) NOT NULL,
    "es_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ambito_institucional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_contable_ambito" (
    "cuenta_contable_id" TEXT NOT NULL,
    "ambito_institucional_id" TEXT NOT NULL,

    CONSTRAINT "cuenta_contable_ambito_pkey" PRIMARY KEY ("cuenta_contable_id","ambito_institucional_id")
);

-- CreateTable
CREATE TABLE "cuenta_contable_entidad_estado" (
    "cuenta_contable_id" TEXT NOT NULL,
    "entidad_publica_id" TEXT NOT NULL,

    CONSTRAINT "cuenta_contable_entidad_estado_pkey" PRIMARY KEY ("cuenta_contable_id","entidad_publica_id")
);

-- CreateTable
CREATE TABLE "solicitud" (
    "id" TEXT NOT NULL,
    "numero_solicitud" VARCHAR(30),
    "tipo_documento_id" TEXT NOT NULL,
    "tipo_accion" VARCHAR(50) NOT NULL,
    "fecha_requerimiento" TIMESTAMP(3) NOT NULL,
    "organo_linea" VARCHAR(250) NOT NULL,
    "entidad_creadora_id" TEXT NOT NULL,
    "unidad_creadora_id" TEXT,
    "perfil_creador_id" TEXT NOT NULL,
    "entidad_destino_id" TEXT,
    "unidad_destino_id" TEXT,
    "rol_destino_id" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'NUEVO',
    "justificacion" TEXT NOT NULL,
    "proviene_entidad_externa" BOOLEAN NOT NULL DEFAULT false,
    "entidad_externa_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_cuenta_contable" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "plan_contable_id" TEXT NOT NULL,
    "cuenta_contable_origen_id" TEXT,
    "codigo_completo" VARCHAR(80) NOT NULL,
    "elemento" VARCHAR(1) NOT NULL,
    "grupo" VARCHAR(2),
    "cuenta" VARCHAR(2),
    "subcuenta_1" VARCHAR(2),
    "subcuenta_2" VARCHAR(2),
    "subcuenta_3" VARCHAR(2),
    "nivel" INTEGER NOT NULL,
    "nombre" VARCHAR(250) NOT NULL,
    "codigo_anterior" VARCHAR(80),
    "es_imputable" BOOLEAN NOT NULL,
    "naturaleza" VARCHAR(50) NOT NULL,
    "tipo_elemento" VARCHAR(50) NOT NULL,
    "es_monetaria" BOOLEAN NOT NULL,
    "aplica_extra_presupuestaria" BOOLEAN NOT NULL DEFAULT false,
    "es_reciproca" BOOLEAN NOT NULL DEFAULT false,
    "tiene_dinamica_contable" BOOLEAN NOT NULL DEFAULT false,
    "dinamica_debita" TEXT,
    "dinamica_acredita" TEXT,
    "dinamica_objeto" TEXT,
    "dinamica_saldos" TEXT,
    "es_para_entidad_estado" BOOLEAN NOT NULL DEFAULT false,
    "es_vigente" BOOLEAN NOT NULL DEFAULT true,
    "es_visible" BOOLEAN NOT NULL DEFAULT true,
    "secciones_modificadas" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitud_cuenta_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_cuenta_ambito" (
    "solicitud_cuenta_contable_id" TEXT NOT NULL,
    "ambito_institucional_id" TEXT NOT NULL,

    CONSTRAINT "solicitud_cuenta_ambito_pkey" PRIMARY KEY ("solicitud_cuenta_contable_id","ambito_institucional_id")
);

-- CreateTable
CREATE TABLE "solicitud_cuenta_entidad_estado" (
    "solicitud_cuenta_contable_id" TEXT NOT NULL,
    "entidad_publica_id" TEXT NOT NULL,

    CONSTRAINT "solicitud_cuenta_entidad_estado_pkey" PRIMARY KEY ("solicitud_cuenta_contable_id","entidad_publica_id")
);

-- CreateTable
CREATE TABLE "archivo" (
    "id" TEXT NOT NULL,
    "nombre_original" VARCHAR(250) NOT NULL,
    "nombre_storage" VARCHAR(250) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_sustento" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "archivo_id" TEXT NOT NULL,
    "tipo_sustento" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_sustento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_estado_historial" (
    "id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "estado_anterior" "EstadoSolicitud",
    "estado_nuevo" "EstadoSolicitud" NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "perfil_id" TEXT,

    CONSTRAINT "solicitud_estado_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "solicitud_id" TEXT NOT NULL,
    "tipo" VARCHAR(80) NOT NULL,
    "titulo" VARCHAR(250) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "leida_en" TIMESTAMP(3),
    "email_enviado" BOOLEAN NOT NULL DEFAULT false,
    "email_enviado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_evento" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "perfil_id" TEXT,
    "entidad_publica_id" TEXT,
    "unidad_organica_id" TEXT,
    "accion" VARCHAR(120) NOT NULL,
    "tabla_afectada" VARCHAR(120),
    "registro_id" TEXT,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,
    "ip" VARCHAR(80),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_dni_key" ON "usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entidad_publica_codigo_key" ON "entidad_publica"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "unidad_organica_entidad_publica_id_codigo_key" ON "unidad_organica"("entidad_publica_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "rol_codigo_key" ON "rol"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE INDEX "usuario_entidad_rol_usuario_id_idx" ON "usuario_entidad_rol"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "modulo_codigo_key" ON "modulo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_documento_codigo_key" ON "tipo_documento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "plan_contable_numero_plan_contable_key" ON "plan_contable"("numero_plan_contable");

-- CreateIndex
CREATE INDEX "cuenta_contable_codigo_completo_idx" ON "cuenta_contable"("codigo_completo");

-- CreateIndex
CREATE INDEX "cuenta_contable_plan_contable_id_nivel_idx" ON "cuenta_contable"("plan_contable_id", "nivel");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_contable_plan_contable_id_codigo_completo_key" ON "cuenta_contable"("plan_contable_id", "codigo_completo");

-- CreateIndex
CREATE UNIQUE INDEX "ambito_institucional_codigo_key" ON "ambito_institucional"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "solicitud_numero_solicitud_key" ON "solicitud"("numero_solicitud");

-- CreateIndex
CREATE INDEX "solicitud_estado_idx" ON "solicitud"("estado");

-- CreateIndex
CREATE INDEX "solicitud_entidad_destino_id_rol_destino_id_estado_idx" ON "solicitud"("entidad_destino_id", "rol_destino_id", "estado");

-- CreateIndex
CREATE INDEX "solicitud_created_by_idx" ON "solicitud"("created_by");

-- CreateIndex
CREATE INDEX "solicitud_estado_historial_solicitud_id_idx" ON "solicitud_estado_historial"("solicitud_id");

-- CreateIndex
CREATE INDEX "notificacion_usuario_id_leida_idx" ON "notificacion"("usuario_id", "leida");

-- CreateIndex
CREATE INDEX "auditoria_evento_usuario_id_created_at_idx" ON "auditoria_evento"("usuario_id", "created_at");

-- CreateIndex
CREATE INDEX "auditoria_evento_entidad_publica_id_created_at_idx" ON "auditoria_evento"("entidad_publica_id", "created_at");

-- AddForeignKey
ALTER TABLE "entidad_publica" ADD CONSTRAINT "entidad_publica_entidad_padre_id_fkey" FOREIGN KEY ("entidad_padre_id") REFERENCES "entidad_publica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidad_publica" ADD CONSTRAINT "entidad_publica_entidad_migracion_id_fkey" FOREIGN KEY ("entidad_migracion_id") REFERENCES "entidad_publica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_organica" ADD CONSTRAINT "unidad_organica_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_entidad_rol" ADD CONSTRAINT "usuario_entidad_rol_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_entidad_rol" ADD CONSTRAINT "usuario_entidad_rol_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_entidad_rol" ADD CONSTRAINT "usuario_entidad_rol_unidad_organica_id_fkey" FOREIGN KEY ("unidad_organica_id") REFERENCES "unidad_organica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_entidad_rol" ADD CONSTRAINT "usuario_entidad_rol_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulo" ADD CONSTRAINT "modulo_modulo_padre_id_fkey" FOREIGN KEY ("modulo_padre_id") REFERENCES "modulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulo_permiso" ADD CONSTRAINT "modulo_permiso_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulo_permiso" ADD CONSTRAINT "modulo_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sesion" ADD CONSTRAINT "usuario_sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sesion" ADD CONSTRAINT "usuario_sesion_perfil_activo_id_fkey" FOREIGN KEY ("perfil_activo_id") REFERENCES "usuario_entidad_rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_invitacion" ADD CONSTRAINT "usuario_invitacion_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_invitacion" ADD CONSTRAINT "usuario_invitacion_unidad_organica_id_fkey" FOREIGN KEY ("unidad_organica_id") REFERENCES "unidad_organica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_invitacion" ADD CONSTRAINT "usuario_invitacion_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_invitacion" ADD CONSTRAINT "usuario_invitacion_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_documento" ADD CONSTRAINT "tipo_documento_entidad_destino_id_fkey" FOREIGN KEY ("entidad_destino_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_documento" ADD CONSTRAINT "tipo_documento_unidad_destino_id_fkey" FOREIGN KEY ("unidad_destino_id") REFERENCES "unidad_organica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_documento" ADD CONSTRAINT "tipo_documento_rol_destino_id_fkey" FOREIGN KEY ("rol_destino_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_documento_accion" ADD CONSTRAINT "tipo_documento_accion_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_plan_contable_id_fkey" FOREIGN KEY ("plan_contable_id") REFERENCES "plan_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cuenta_contable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable_ambito" ADD CONSTRAINT "cuenta_contable_ambito_cuenta_contable_id_fkey" FOREIGN KEY ("cuenta_contable_id") REFERENCES "cuenta_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable_ambito" ADD CONSTRAINT "cuenta_contable_ambito_ambito_institucional_id_fkey" FOREIGN KEY ("ambito_institucional_id") REFERENCES "ambito_institucional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable_entidad_estado" ADD CONSTRAINT "cuenta_contable_entidad_estado_cuenta_contable_id_fkey" FOREIGN KEY ("cuenta_contable_id") REFERENCES "cuenta_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable_entidad_estado" ADD CONSTRAINT "cuenta_contable_entidad_estado_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_entidad_creadora_id_fkey" FOREIGN KEY ("entidad_creadora_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_unidad_creadora_id_fkey" FOREIGN KEY ("unidad_creadora_id") REFERENCES "unidad_organica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_perfil_creador_id_fkey" FOREIGN KEY ("perfil_creador_id") REFERENCES "usuario_entidad_rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_entidad_destino_id_fkey" FOREIGN KEY ("entidad_destino_id") REFERENCES "entidad_publica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_unidad_destino_id_fkey" FOREIGN KEY ("unidad_destino_id") REFERENCES "unidad_organica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_rol_destino_id_fkey" FOREIGN KEY ("rol_destino_id") REFERENCES "rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_entidad_externa_id_fkey" FOREIGN KEY ("entidad_externa_id") REFERENCES "entidad_publica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_contable" ADD CONSTRAINT "solicitud_cuenta_contable_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_contable" ADD CONSTRAINT "solicitud_cuenta_contable_cuenta_contable_origen_id_fkey" FOREIGN KEY ("cuenta_contable_origen_id") REFERENCES "cuenta_contable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_ambito" ADD CONSTRAINT "solicitud_cuenta_ambito_solicitud_cuenta_contable_id_fkey" FOREIGN KEY ("solicitud_cuenta_contable_id") REFERENCES "solicitud_cuenta_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_ambito" ADD CONSTRAINT "solicitud_cuenta_ambito_ambito_institucional_id_fkey" FOREIGN KEY ("ambito_institucional_id") REFERENCES "ambito_institucional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_entidad_estado" ADD CONSTRAINT "solicitud_cuenta_entidad_estado_solicitud_cuenta_contable__fkey" FOREIGN KEY ("solicitud_cuenta_contable_id") REFERENCES "solicitud_cuenta_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_cuenta_entidad_estado" ADD CONSTRAINT "solicitud_cuenta_entidad_estado_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_sustento" ADD CONSTRAINT "solicitud_sustento_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_sustento" ADD CONSTRAINT "solicitud_sustento_archivo_id_fkey" FOREIGN KEY ("archivo_id") REFERENCES "archivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_estado_historial" ADD CONSTRAINT "solicitud_estado_historial_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_estado_historial" ADD CONSTRAINT "solicitud_estado_historial_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_estado_historial" ADD CONSTRAINT "solicitud_estado_historial_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "usuario_entidad_rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_evento" ADD CONSTRAINT "auditoria_evento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_evento" ADD CONSTRAINT "auditoria_evento_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "usuario_entidad_rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_evento" ADD CONSTRAINT "auditoria_evento_entidad_publica_id_fkey" FOREIGN KEY ("entidad_publica_id") REFERENCES "entidad_publica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_evento" ADD CONSTRAINT "auditoria_evento_unidad_organica_id_fkey" FOREIGN KEY ("unidad_organica_id") REFERENCES "unidad_organica"("id") ON DELETE SET NULL ON UPDATE CASCADE;
