import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../process-menu-tree/process-menu-tree.component';

const ADMIN_MENU_TREE: ProcessMenuNode[] = [
  {
    id: 'administracion',
    label: 'Administracion',
    expanded: true,
    children: [
      {
        id: 'usuarios-accesos',
        label: 'Usuarios y accesos',
        expanded: true,
        children: [
          {
            id: 'gestion-usuarios',
            label: 'Gestion de usuarios',
            createRoute: '/admin/usuarios'
          }
        ]
      },
      {
        id: 'organizacion',
        label: 'Organizacion',
        expanded: true,
        children: [
          {
            id: 'entidades-publicas',
            label: 'Entidades publicas',
            createRoute: '/admin/entidades'
          },
          {
            id: 'unidades-organicas',
            label: 'Unidades organicas',
            createRoute: '/admin/unidades'
          }
        ]
      },
      {
        id: 'control-monitoreo',
        label: 'Control y monitoreo',
        expanded: true,
        children: [
          {
            id: 'auditoria-sistema',
            label: 'Auditoria del sistema',
            createRoute: '/admin/auditoria'
          }
        ]
      }
    ]
  }
];

@Component({
  selector: 'siaf-admin-menu',
  standalone: true,
  imports: [ProcessMenuTreeComponent],
  template: `
    <siaf-process-menu-tree
      title="Ajustes"
      subtitle="Seleccionar configuracion"
      placeholder="Buscar configuracion"
      searchLabel="Buscar configuracion"
      [nodes]="nodes"
      (nodeSelected)="onNodeSelected($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMenuComponent {
  private readonly router = inject(Router);

  @Output() closed = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<ProcessMenuNode>();

  readonly nodes = ADMIN_MENU_TREE;

  onNodeSelected(node: ProcessMenuNode): void {
    if (!node.createRoute) return;
    this.itemSelected.emit(node);
    void this.router.navigateByUrl(node.createRoute);
  }
}
