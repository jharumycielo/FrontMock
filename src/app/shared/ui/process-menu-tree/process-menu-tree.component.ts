import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface ProcessMenuNode {
  id: string;
  label: string;
  selected?: boolean;
  expanded?: boolean;
  createRoute?: string;
  documentOptions?: string[];
  actionTypeOptions?: string[];
  children?: ProcessMenuNode[];
}

export const DEFAULT_PROCESS_TREE: ProcessMenuNode[] = [
  {
    id: 'gestion-contabilidad',
    label: 'Gesti\u00f3n contabilidad',
    expanded: true,
    selected: true,
    children: [
      {
        id: 'catalogos-clasificadores',
        label: 'Cat\u00e1logos y clasificadores',
        children: [
          {
            id: 'catalogos',
            label: 'Cat\u00e1logos',
            children: [
              {
                id: 'catalogo-tipo-asiento-ajuste',
                label: 'Cat\u00e1logo de tipo de asiento de ajuste',
                children: [
                  { id: 'consulta-catalogo-tipo-asiento-ajuste', label: 'Cat\u00e1logo de tipo de asiento de ajuste' },
                  {
                    id: 'consultas-reportes-catalogo-tipo-asiento-ajuste',
                    label: 'Consultas y reportes',
                    children: [
                      { id: 'reporte-catalogo-tipo-asiento-ajuste', label: 'Cat\u00e1logo de tipo de asiento de ajuste' }
                    ]
                  }
                ]
              },
              { id: 'catalogo-eventos', label: 'Cat\u00e1logo de eventos' },
              { id: 'catalogo-eventos-contables', label: 'Cat\u00e1logo de eventos contables' }
            ]
          },
          {
            id: 'clasificadores',
            label: 'Clasificadores',
            children: [
              { id: 'plan-cuentas-contables', label: 'Plan de cuentas contables' }
            ]
          }
        ]
      },
      {
        id: 'integracion-siaf-rp-sp',
        label: 'Integraci\u00f3n SIAF RP - SIAF SP',
        children: [
          { id: 'configuracion-integracion-operaciones-rp-sp', label: 'Configuraci\u00f3n de integraci\u00f3n de operaciones rp / sp' },
          { id: 'proceso-ejecucion-job-integracion', label: 'Proceso de ejecuci\u00f3n de job (manual y autom\u00e1tico)' },
          {
            id: 'consultas-reportes-integracion',
            label: 'Consultas y reportes',
            children: [
              { id: 'reporte-proceso-ejecucion-job-integracion', label: 'Proceso de ejecuci\u00f3n de job (manual y autom\u00e1tico)' }
            ]
          }
        ]
      },
      {
        id: 'contabilizacion-automatica',
        label: 'Contabilizaci\u00f3n autom\u00e1tica',
        children: [
          {
            id: 'proceso-pedidos-contabilizacion',
            label: 'Proceso de pedidos de contabilizaci\u00f3n',
            children: [
              { id: 'consulta-pedidos-contabilizacion', label: 'Consulta de pedidos de contabilizaci\u00f3n' },
              { id: 'reprocesamiento-registros-error', label: 'Reprocesamiento de registros con error' }
            ]
          }
        ]
      },
      {
        id: 'apertura-contable',
        label: 'Apertura contable',
        children: [
          { id: 'apertura-ejercicio', label: 'Apertura de ejercicio contable' },
          { id: 'apertura-saldos', label: 'Registro de saldos iniciales' },
          { id: 'apertura-consultas', label: 'Consultas y reportes de apertura contable' }
        ]
      },
      {
        id: 'asientos-ajustes',
        label: 'Asientos de ajustes',
        children: [
          {
            id: 'registro-asiento-ajuste',
            label: 'Proceso de registro de asiento de ajuste',
            selected: true,
            createRoute: '/procesos/registro-asiento-ajuste/solicitud',
            documentOptions: ['Solicitud de registro de asiento de ajuste'],
            actionTypeOptions: ['Creación', 'Reversión']
          },
          { id: 'consulta-reporte-asiento-ajuste', label: 'Consultas y reportes de proceso de registro de asiento de ajuste' }
        ]
      }
    ]
  }
];

export function findProcessPathById(id: string, nodes: readonly ProcessMenuNode[] = DEFAULT_PROCESS_TREE): ProcessMenuNode[] {
  for (const node of nodes) {
    if (node.id === id) {
      return [node];
    }

    const childPath = findProcessPathById(id, node.children || []);

    if (childPath.length > 0) {
      return [node, ...childPath];
    }
  }

  return [];
}

@Component({
  selector: 'siaf-process-menu-tree',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <aside
      class="flex h-[calc(100vh-56px)] w-screen flex-col bg-[var(--sys-color-bg-surfaces-surface,#fff)] text-text shadow-[0_1px_3px_rgba(0,0,0,0.20),0_2px_1px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.14)] lg:max-w-[370px]"
      aria-label="Menu de procesos"
    >
      <header class="sticky top-0 z-[2] flex min-h-14 w-full items-center bg-[var(--sys-color-bg-surfaces-surface,#fff)] p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-none tracking-[0.02px] text-[var(--sys-color-text-neutral-high,#202020)]">
          {{ title }}
        </h2>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto bg-[var(--sys-color-bg-surfaces-surface-highest,#fff)] px-siaf-md pt-siaf-xs">
        <label class="flex h-10 w-full items-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled,rgba(32,32,32,0.4))] bg-surface px-siaf-md py-siaf-xs">
          <span class="sr-only">{{ searchLabel }}</span>
          <input
            class="h-6 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-normal leading-normal tracking-[0.0249px] text-text outline-none placeholder:text-[var(--sys-color-text-neutral-low,#6f6f71)]"
            type="search"
            [attr.placeholder]="placeholder"
            [value]="query"
            (input)="onSearch($event)"
          />
        </label>

        <section class="flex w-full flex-col gap-siaf-md overflow-hidden pt-siaf-lg">
          <h3 class="m-0 px-siaf-md text-sm font-bold leading-normal text-[var(--sys-color-text-neutral-medium,#29292a)]">
            {{ subtitle }}
          </h3>

          <div class="flex w-full flex-col gap-1">
            <ng-container *ngTemplateOutlet="treeTemplate; context: { $implicit: filteredNodes, level: 0 }" />
          </div>
        </section>
      </div>
    </aside>

    <ng-template #treeTemplate let-items let-level="level">
      @for (node of items; track node.id) {
        <div class="w-full" [class.pl-[27px]]="level > 0">
          <div class="w-full" [class.border-l]="level > 0" [style.border-color]="level > 0 ? 'rgba(32,32,32,0.24)' : null" [class.pl-3]="level > 0">
            <button
              class="group flex w-full items-center rounded-siaf-sm text-left transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-[0.995]"
              type="button"
              [class.min-h-12]="level === 0"
              [class.min-h-8]="level > 0"
              [class.bg-[rgba(1,72,153,0.08)]]="isNodeHighlighted(node, level)"
              [class.hover:bg-[rgba(32,32,32,0.06)]]="!isNodeHighlighted(node, level)"
              [class.active:bg-[rgba(32,32,32,0.12)]]="!isNodeHighlighted(node, level)"
              [class.px-siaf-md]="true"
              [class.py-siaf-sm]="level === 0"
              [class.py-siaf-xxs]="level > 0"
              [attr.aria-expanded]="hasChildren(node) ? isExpanded(node) : null"
              (click)="activate(node)"
            >
              @if (hasChildren(node)) {
                <siaf-icon
                  class="mr-siaf-md shrink-0 text-[var(--sys-color-text-neutral-activated,#014899)] transition-transform duration-150"
                  name="arrow_drop_down"
                  [size]="level === 0 ? 24 : 20"
                  [class.-rotate-90]="!isExpanded(node)"
                />
              }

              <span
                class="min-w-0 flex-1 text-sm leading-normal"
                [class.font-bold]="level === 0"
                [class.font-normal]="level > 0"
                [class.tracking-[-0.02px]]="level === 0"
                [class.tracking-[0.0249px]]="level > 0"
                [class.text-[var(--sys-color-text-neutral-activated,#014899)]]="isNodeHighlighted(node, level)"
                [class.text-[var(--sys-color-text-neutral-medium,#29292a)]]="!isNodeHighlighted(node, level)"
              >
                {{ node.label }}
              </span>
            </button>

            @if (hasChildren(node) && isExpanded(node)) {
              <ng-container *ngTemplateOutlet="treeTemplate; context: { $implicit: node.children || [], level: level + 1 }" />
            }
          </div>
        </div>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessMenuTreeComponent implements OnChanges, OnInit {
  @Input() title = 'Procesos';
  @Input() subtitle = 'Seleccionar proceso o procedimiento';
  @Input() placeholder = 'Buscar proceso o procedimiento';
  @Input() searchLabel = 'Buscar proceso o procedimiento';
  @Input() nodes: ProcessMenuNode[] = DEFAULT_PROCESS_TREE;

  @Output() nodeSelected = new EventEmitter<ProcessMenuNode>();

  query = '';
  selectedId = '';
  private readonly expandedIds = new Set<string>();
  private readonly parentById = new Map<string, string>();
  private readonly activeAncestorIds = new Set<string>();

  ngOnInit(): void {
    this.initializeState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.initializeState();
    }
  }

  get filteredNodes(): ProcessMenuNode[] {
    const search = this.normalize(this.query);

    if (!search) {
      return this.nodes;
    }

    return this.filterNodes(this.nodes, search);
  }

  activate(node: ProcessMenuNode): void {
    this.selectedId = node.id;
    this.updateActivePath(node.id);

    if (this.hasChildren(node)) {
      this.toggle(node);
    }

    this.nodeSelected.emit(node);
  }

  hasChildren(node: ProcessMenuNode): boolean {
    return Boolean(node.children?.length);
  }

  isExpanded(node: ProcessMenuNode): boolean {
    return Boolean(this.query) || this.expandedIds.has(node.id);
  }

  isNodeHighlighted(node: ProcessMenuNode, level: number): boolean {
    return this.selectedId === node.id || (level === 0 && this.activeAncestorIds.has(node.id));
  }

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  private toggle(node: ProcessMenuNode): void {
    if (this.expandedIds.has(node.id)) {
      this.expandedIds.delete(node.id);
      return;
    }

    this.expandedIds.add(node.id);
  }

  private initializeState(): void {
    this.expandedIds.clear();
    this.parentById.clear();
    this.activeAncestorIds.clear();
    this.selectedId = '';
    this.collectState(this.nodes);

    if (this.selectedId) {
      this.updateActivePath(this.selectedId);
    }
  }

  private collectState(nodes: ProcessMenuNode[], parentId = ''): void {
    for (const node of nodes) {
      if (parentId) {
        this.parentById.set(node.id, parentId);
      }

      if (node.expanded && !parentId) {
        this.expandedIds.add(node.id);
      }

      if (node.selected) {
        this.selectedId = node.id;
      }

      if (node.children?.length) {
        this.collectState(node.children, node.id);
      }
    }
  }

  private updateActivePath(nodeId: string): void {
    this.activeAncestorIds.clear();

    let parentId = this.parentById.get(nodeId);
    while (parentId) {
      this.activeAncestorIds.add(parentId);
      parentId = this.parentById.get(parentId);
    }
  }

  private filterNodes(nodes: ProcessMenuNode[], search: string): ProcessMenuNode[] {
    const result: ProcessMenuNode[] = [];

    for (const node of nodes) {
      const children = node.children ? this.filterNodes(node.children, search) : [];
      const matches = this.normalize(node.label).includes(search);

      if (!matches && children.length === 0) {
        continue;
      }

      result.push({
        ...node,
        expanded: true,
        children: children.length > 0 ? children : node.children
      });
    }

    return result;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
