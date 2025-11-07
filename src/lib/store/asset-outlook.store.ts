import { writable, get } from 'svelte/store';
import type { AssetFilter } from '$lib/services/get-assets';
import { getAssets } from '$lib/services/get-assets';
import { getComponentsWithSummary } from '$lib/services/component-summary';

export interface AlarmData {
  id: number;
  code: string;
  color: 'GREEN' | 'YELLOW' | 'RED';
}

export interface ComponentData {
  id: number;
  code: string;
  name: string;
  description: string;
  componentType?: { id: number; code: string };
  vibdate?: string | null;
  vibalarm?: AlarmData | null;
  tribdate?: string | null;
  tribalarm?: AlarmData | null;
  mcedate?: string | null;
  mcealarm?: AlarmData | null;
  irrotdate?: string | null;
  irrotalarm?: AlarmData | null;
  irelecdate?: string | null;
  irelecalarm?: AlarmData | null;
  irstrucdate?: string | null;
  irstrucalarm?: AlarmData | null;
  uerotdate?: string | null;
  uerotalarm?: AlarmData | null;
  ueelecdate?: string | null;
  ueelecalarm?: AlarmData | null;
  ueleakdate?: string | null;
  ueleakalarm?: AlarmData | null;
  algndate?: string | null;
  algnalarm?: AlarmData | null;
  baldate?: string | null;
  balalarm?: AlarmData | null;
  existSummary?: boolean;
  // Flags para summary por tecnología
  vib?: number | null;
  trib?: number | null;
  mce?: number | null;
  irrot?: number | null;
  irelec?: number | null;
  irstruc?: number | null;
  uerot?: number | null;
  ueelec?: number | null;
  ueleak?: number | null;
  bal?: number | null;
  algn?: number | null;
}

export interface AssetRow {
  id: number;
  code: string;
  description: string;
  components: ComponentData[];
}

export interface AssetOutlookState {
  items: AssetRow[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: AssetFilter;
  search: string;
}

const createStore = () => {
  const { subscribe, set, update } = writable<AssetOutlookState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 100,
    loading: false,
    error: null,
    filters: {},
    search: ''
  });

  return {
    subscribe,
    setPage: (page: number) => update((s) => ({ ...s, page })),
    setPageSize: (pageSize: number) => update((s) => ({ ...s, pageSize })),
    setSearch: (search: string) => update((s) => ({ ...s, search })),
    setFilters: (filters: AssetFilter) => update((s) => ({ ...s, filters })),
    resetError: () => update((s) => ({ ...s, error: null })),

    async load() {
      update((s) => ({ ...s, loading: true, error: null }));
      try {
        const state = get({ subscribe });
        const data = await getAssets(state.page, state.pageSize, state.filters);
        
        // Map response to table rows
        const rows: AssetRow[] = (data.records || []).map((asset: any) => ({
          id: asset.id,
          code: asset.code,
          description: asset.description,
            components: (asset.components || []).map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            description: c.description,
            componentType: c.componentType,
            vibdate: c.vibdate,
            vibalarm: c.vibalarm || null,
            tribdate: c.tribdate,
            tribalarm: c.tribalarm || null,
            mcedate: c.mcedate,
            mcealarm: c.mcealarm || null,
            irrotdate: c.irrotdate,
            irrotalarm: c.irrotalarm || null,
            irelecdate: c.irelecdate,
            irelecalarm: c.irelecalarm || null,
            irstrucdate: c.irstrucdate,
            irstrucalarm: c.irstrucalarm || null,
            uerotdate: c.uerotdate,
            uerotalarm: c.uerotalarm || null,
            ueelecdate: c.ueelecdate,
            ueelecalarm: c.ueelecalarm || null,
            ueleakdate: c.ueleakdate,
            ueleakalarm: c.ueleakalarm || null,
            algndate: c.algndate,
            algnalarm: c.algnalarm || null,
            baldate: c.baldate,
            balalarm: c.balalarm || null,
            existSummary: false // Se actualizará después
          }))
        }));

        // Obtener todos los IDs de componentes
        const allComponentIds = rows.flatMap(asset => 
          asset.components.map(component => component.id)
        );

        // Si hay componentes, obtener información de summary
        if (allComponentIds.length > 0) {
          try {
            const summaryResponse = await getComponentsWithSummary(allComponentIds);
            
            // Crear mapa de componentes con summary por ID
            const summaryMap = new Map();
            if (summaryResponse.data && Array.isArray(summaryResponse.data)) {
              summaryResponse.data.forEach((comp: any) => {
                summaryMap.set(comp.id, comp);
              });
            }
            
            // Actualizar las propiedades de summary
            rows.forEach(asset => {
              asset.components.forEach(component => {
                const summaryData = summaryMap.get(component.id);
                if (summaryData) {
                  component.existSummary = summaryData.existSummary || false;
                  component.vib = summaryData.vib;
                  component.trib = summaryData.trib;
                  component.mce = summaryData.mce;
                  component.irrot = summaryData.irrot;
                  component.irelec = summaryData.irelec;
                  component.irstruc = summaryData.irstruc;
                  component.uerot = summaryData.uerot;
                  component.ueelec = summaryData.ueelec;
                  component.ueleak = summaryData.ueleak;
                  component.bal = summaryData.bal;
                  component.algn = summaryData.algn;
                } else {
                  component.existSummary = false;
                }
              });
            });
          } catch (summaryError) {
            console.warn('Error loading component summaries:', summaryError);
            // Continúa sin la información de summary si falla
          }
        }

        update((s) => ({
          ...s,
          items: rows,
          total: data.total ?? rows.length,
          loading: false
        }));
      } catch (e: any) {
        update((s) => ({ ...s, loading: false, error: e?.message ?? 'Error loading assets' }));
      }
    }
  };
};

export const assetOutlookStore = createStore();
