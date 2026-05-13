import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────
  const roles = [
    { codigo: 'ADMIN_SISTEMA', nombre: 'Administrador del Sistema', descripcion: 'OGTI - acceso total al sistema' },
    { codigo: 'ADMIN_ENTIDAD', nombre: 'Administrador de Entidad', descripcion: 'Gestiona usuarios y accesos de su entidad' },
    { codigo: 'ADMIN_UNIDAD', nombre: 'Administrador de Unidad', descripcion: 'Gestiona usuarios de su unidad' },
    { codigo: 'CREADOR', nombre: 'Creador', descripcion: 'Crea y elabora solicitudes' },
    { codigo: 'REVISOR', nombre: 'Revisor', descripcion: 'Verifica solicitudes antes de aprobar' },
    { codigo: 'APROBADOR', nombre: 'Aprobador', descripcion: 'Aprueba, observa o rechaza solicitudes' },
    { codigo: 'CONSULTA', nombre: 'Consulta', descripcion: 'Solo lectura' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { codigo: rol.codigo },
      update: {},
      create: rol,
    });
  }
  console.log(`✅ ${roles.length} roles creados`);

  // ─────────────────────────────────────────────
  // PERMISOS
  // ─────────────────────────────────────────────
  const permisos = [
    // Usuarios
    { codigo: 'user.create', descripcion: 'Crear usuarios' },
    { codigo: 'user.read', descripcion: 'Ver usuarios' },
    { codigo: 'user.update', descripcion: 'Editar usuarios' },
    { codigo: 'user.disable', descripcion: 'Desactivar/bloquear usuarios' },
    // Roles
    { codigo: 'role.assign', descripcion: 'Asignar roles a usuarios' },
    // Entidades
    { codigo: 'entity.create', descripcion: 'Crear entidades públicas' },
    { codigo: 'entity.update', descripcion: 'Editar entidades públicas' },
    { codigo: 'entity.manage', descripcion: 'Suspender, migrar y archivar entidades' },
    // Unidades
    { codigo: 'unit.create', descripcion: 'Crear unidades orgánicas' },
    { codigo: 'unit.update', descripcion: 'Editar unidades orgánicas' },
    // Módulos
    { codigo: 'module.read', descripcion: 'Ver módulos del sistema' },
    { codigo: 'module.assign', descripcion: 'Asignar módulos a roles' },
    // Documentos (solicitudes)
    { codigo: 'document.create', descripcion: 'Crear solicitudes' },
    { codigo: 'document.read', descripcion: 'Ver solicitudes' },
    { codigo: 'document.edit', descripcion: 'Editar solicitudes' },
    { codigo: 'document.verify', descripcion: 'Verificar solicitudes (CREADOR envía)' },
    { codigo: 'document.approve', descripcion: 'Aprobar solicitudes' },
    { codigo: 'document.observe', descripcion: 'Observar solicitudes' },
    { codigo: 'document.reject', descripcion: 'Rechazar solicitudes' },
    { codigo: 'document.delete', descripcion: 'Eliminar solicitudes propias' },
    // Cuentas contables
    { codigo: 'chart_account.read', descripcion: 'Ver cuentas contables' },
    { codigo: 'chart_account.create', descripcion: 'Proponer nuevas cuentas' },
    { codigo: 'chart_account.edit', descripcion: 'Modificar cuentas contables' },
    { codigo: 'chart_account.approve', descripcion: 'Aprobar cuentas contables' },
    // Auditoría
    { codigo: 'audit.read', descripcion: 'Ver auditoría' },
    { codigo: 'audit.export', descripcion: 'Exportar auditoría' },
    // Catálogo tipo documento
    { codigo: 'doc_type.manage', descripcion: 'Administrar tipos de documento (OGTI)' },
  ];

  for (const permiso of permisos) {
    await prisma.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: {},
      create: permiso,
    });
  }
  console.log(`✅ ${permisos.length} permisos creados`);

  // ─────────────────────────────────────────────
  // ROL → PERMISOS
  // ─────────────────────────────────────────────
  const rolPermisos: Record<string, string[]> = {
    ADMIN_SISTEMA: permisos.map(p => p.codigo), // todos los permisos
    ADMIN_ENTIDAD: [
      'user.create', 'user.read', 'user.update', 'user.disable',
      'role.assign',
      'unit.create', 'unit.update',
      'document.read',
      'chart_account.read',
      'audit.read',
    ],
    ADMIN_UNIDAD: [
      'user.read', 'user.update',
      'role.assign',
      'document.read',
      'chart_account.read',
    ],
    CREADOR: [
      'document.create', 'document.read', 'document.edit',
      'document.verify', 'document.delete',
      'chart_account.read', 'chart_account.create', 'chart_account.edit',
    ],
    REVISOR: [
      'document.read', 'document.verify',
      'chart_account.read',
    ],
    APROBADOR: [
      'document.read', 'document.approve',
      'document.observe', 'document.reject',
      'chart_account.read', 'chart_account.approve',
    ],
    CONSULTA: [
      'document.read',
      'chart_account.read',
    ],
  };

  for (const [rolCodigo, permisoCodigos] of Object.entries(rolPermisos)) {
    const rol = await prisma.rol.findUnique({ where: { codigo: rolCodigo } });
    for (const permisoCodigo of permisoCodigos) {
      const permiso = await prisma.permiso.findUnique({ where: { codigo: permisoCodigo } });
      if (rol && permiso) {
        await prisma.rolPermiso.upsert({
          where: { rolId_permisoId: { rolId: rol.id, permisoId: permiso.id } },
          update: {},
          create: { rolId: rol.id, permisoId: permiso.id },
        });
      }
    }
  }
  console.log('✅ Rol-Permisos asignados');

  // ─────────────────────────────────────────────
  // MÓDULOS UI
  // ─────────────────────────────────────────────
  const modulos = [
    { codigo: 'dashboard', nombre: 'Dashboard', ruta: '/dashboard', icono: 'home', orden: 1 },
    { codigo: 'documentos', nombre: 'Documentos', ruta: '/documentos', icono: 'file-text', orden: 2 },
    { codigo: 'registros', nombre: 'Registros', ruta: '/registros', icono: 'book-open', orden: 3 },
    { codigo: 'plan-contable', nombre: 'Plan Contable', ruta: '/plan-contable', icono: 'list', orden: 4 },
    { codigo: 'usuarios', nombre: 'Usuarios', ruta: '/usuarios', icono: 'users', orden: 5 },
    { codigo: 'entidades', nombre: 'Entidades', ruta: '/entidades', icono: 'building', orden: 6 },
    { codigo: 'auditoria', nombre: 'Auditoría', ruta: '/auditoria', icono: 'shield', orden: 7 },
    { codigo: 'configuracion', nombre: 'Configuración', ruta: '/configuracion', icono: 'settings', orden: 8 },
  ];

  for (const modulo of modulos) {
    await prisma.modulo.upsert({
      where: { codigo: modulo.codigo },
      update: {},
      create: modulo,
    });
  }
  console.log(`✅ ${modulos.length} módulos creados`);

  // ─────────────────────────────────────────────
  // ÁMBITOS INSTITUCIONALES
  // ─────────────────────────────────────────────
  const ambitos = [
    { codigo: 'EPE', descripcion: 'Empresa Pública del Estado' },
    { codigo: 'EPL', descripcion: 'Empresa Pública Local' },
    { codigo: 'EPJ', descripcion: 'Empresa Pública Judicial' },
    { codigo: 'OCA', descripcion: 'Organismo Constitucionalmente Autónomo' },
    { codigo: 'GR', descripcion: 'Gobierno Regional' },
    { codigo: 'GL', descripcion: 'Gobierno Local' },
    { codigo: 'ETE', descripcion: 'Entidad de Tratamiento Empresarial' },
    { codigo: 'EPP', descripcion: 'Empresa Pública Provincial' },
    { codigo: 'EPD', descripcion: 'Empresa Pública Distrital' },
    { codigo: 'FF', descripcion: 'Fuerzas del Fuero' },
    { codigo: 'OR', descripcion: 'Organismo Regulador' },
    { codigo: 'OS', descripcion: 'Organismo Supervisor' },
  ];

  for (const ambito of ambitos) {
    await prisma.ambitoInstitucional.upsert({
      where: { codigo: ambito.codigo },
      update: {},
      create: ambito,
    });
  }
  console.log(`✅ ${ambitos.length} ámbitos institucionales creados`);

  // ─────────────────────────────────────────────
  // ENTIDAD BASE — MEF / OGTI
  // ─────────────────────────────────────────────
  const mef = await prisma.entidadPublica.upsert({
    where: { codigo: 'MEF' },
    update: {},
    create: {
      codigoNumerico: 1,
      codigo: 'MEF',
      ruc: '20131369477',
      nombre: 'Ministerio de Economía y Finanzas',
      tipoEntidad: 'ministerio',
      estadoEntidad: 'activa',
    },
  });

  const dgcp = await prisma.unidadOrganica.upsert({
    where: { entidadPublicaId_codigo: { entidadPublicaId: mef.id, codigo: 'DGCP' } },
    update: {},
    create: {
      entidadPublicaId: mef.id,
      codigo: 'DGCP',
      nombre: 'Dirección General de Contabilidad Pública',
      tipoUnidad: 'direccion_general',
      estadoUnidad: 'activa',
    },
  });

  const ogti = await prisma.unidadOrganica.upsert({
    where: { entidadPublicaId_codigo: { entidadPublicaId: mef.id, codigo: 'OGTI' } },
    update: {},
    create: {
      entidadPublicaId: mef.id,
      codigo: 'OGTI',
      nombre: 'Oficina General de Tecnologías de la Información',
      tipoUnidad: 'oficina_general',
      estadoUnidad: 'activa',
    },
  });

  console.log('✅ Entidad MEF + unidades DGCP y OGTI creadas');

  // ─────────────────────────────────────────────
  // USUARIO ADMIN_SISTEMA (OGTI)
  // ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin2025*', 10);
  const rolAdminSistema = await prisma.rol.findUnique({ where: { codigo: 'ADMIN_SISTEMA' } });

  const adminSistema = await prisma.usuario.upsert({
    where: { dni: '00000001' },
    update: {},
    create: {
      dni: '00000001',
      nombres: 'Administrador',
      apellidos: 'Sistema OGTI',
      email: 'admin@mef.gob.pe',
      passwordHash,
      estado: 'activo',
      debeCambiarPassword: true,
    },
  });

  await prisma.usuarioEntidadRol.upsert({
    where: {
      id: (await prisma.usuarioEntidadRol.findFirst({
        where: { usuarioId: adminSistema.id, rolId: rolAdminSistema!.id },
      }))?.id ?? 'new',
    },
    update: {},
    create: {
      usuarioId: adminSistema.id,
      entidadPublicaId: mef.id,
      unidadOrganicaId: ogti.id,
      rolId: rolAdminSistema!.id,
      ambito: 'sistema',
      esPrincipal: true,
      esActivo: true,
      fechaInicio: new Date(),
    },
  });

  console.log('✅ Usuario ADMIN_SISTEMA creado');
  console.log('   DNI: 00000001');
  console.log('   Password: Admin2025*');
  console.log('   ⚠️  Debe cambiar el password en el primer login');

  // ─────────────────────────────────────────────
  // PROCESOS DEL SISTEMA — módulo contabilidad
  // ─────────────────────────────────────────────
  const procesosContabilidad = [
    {
      codigo: 'plan-cuentas-contables',
      modulo: 'contabilidad',
      categoria: 'clasificador' as const,
      nombre: 'Plan de Cuentas Contables',
      orden: 1,
    },
    {
      codigo: 'eventos-contables',
      modulo: 'contabilidad',
      categoria: 'catalogo' as const,
      nombre: 'Eventos Contables',
      orden: 2,
    },
    {
      codigo: 'registro-asiento-ajuste',
      modulo: 'contabilidad',
      categoria: 'proceso' as const,
      nombre: 'Proceso de Registro de Asiento de Ajuste',
      orden: 3,
    },
  ];

  for (const proc of procesosContabilidad) {
    await prisma.procesoSistema.upsert({
      where: { codigo: proc.codigo },
      update: {},
      create: proc,
    });
  }

  console.log(`✅ ${procesosContabilidad.length} procesos del sistema creados`);

  // ─────────────────────────────────────────────
  // TIPOS DE DOCUMENTO BASE (módulo contabilidad)
  // ─────────────────────────────────────────────
  const rolAprobador = await prisma.rol.findUnique({ where: { codigo: 'APROBADOR' } });
  const procesoPlanCuentas = await prisma.procesoSistema.findUnique({
    where: { codigo: 'plan-cuentas-contables' },
  });
  const procesoAsientoAjuste = await prisma.procesoSistema.findUnique({
    where: { codigo: 'registro-asiento-ajuste' },
  });

  const tiposDocumento = [
    {
      codigo: 'SCC',
      nombre: 'Solicitud de Cuentas Contables',
      modulo: 'contabilidad',
      procesoId: procesoPlanCuentas!.id,
      acciones: ['creacion', 'modificacion'],
    },
    {
      codigo: 'SCMPC',
      nombre: 'Solicitud de Carga Masiva de Plan de Cuentas Contables',
      modulo: 'contabilidad',
      procesoId: procesoPlanCuentas!.id,
      acciones: ['creacion'],
    },
    {
      codigo: 'SRAA',
      nombre: 'Solicitud de Registro de Asiento de Ajuste',
      modulo: 'contabilidad',
      procesoId: procesoAsientoAjuste!.id,
      acciones: ['creacion', 'reversion'],
    },
  ];

  for (const td of tiposDocumento) {
    const existing = await prisma.tipoDocumento.findUnique({ where: { codigo: td.codigo } });
    if (!existing) {
      const created = await prisma.tipoDocumento.create({
        data: {
          codigo: td.codigo,
          nombre: td.nombre,
          modulo: td.modulo,
          procesoId: td.procesoId,
          entidadDestinoId: mef.id,
          unidadDestinoId: dgcp.id,
          rolDestinoId: rolAprobador!.id,
          esActivo: true,
        },
      });
      for (const accion of td.acciones) {
        await prisma.tipoDocumentoAccion.create({
          data: { tipoDocumentoId: created.id, tipoAccion: accion },
        });
      }
    } else {
      // Actualizar procesoId si ya existe
      await prisma.tipoDocumento.update({
        where: { codigo: td.codigo },
        data: { procesoId: td.procesoId },
      });
    }
  }

  console.log(`✅ ${tiposDocumento.length} tipos de documento creados/actualizados`);
  console.log('\n🎉 Seed completado exitosamente');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
