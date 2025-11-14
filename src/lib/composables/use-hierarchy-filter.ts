import { hierarchyStore } from '$lib/store';

export interface HierarchySearchValue {
id: number | null;
description: string;
readonly: boolean;
}

export type HierarchyLevel = 'account' | 'plant' | 'area' | 'system';

export function clearHierarchyLevel(level: HierarchyLevel): HierarchySearchValue {
switch (level) {
case 'account':
hierarchyStore.clearAccount();
hierarchyStore.clearPlant();
hierarchyStore.clearArea();
hierarchyStore.clearSystem();
break;
case 'plant':
hierarchyStore.clearPlant();
hierarchyStore.clearArea();
hierarchyStore.clearSystem();
break;
case 'area':
hierarchyStore.clearArea();
hierarchyStore.clearSystem();
break;
case 'system':
hierarchyStore.clearSystem();
break;
}
return { id: null, description: '', readonly: false };
}

export function updateHierarchyLevel(
level: HierarchyLevel,
item: { id: number; description?: string; name?: string }
): HierarchySearchValue {
const description = item.description || item.name || `${level} ${item.id}`;
const value: HierarchySearchValue = { id: item.id, description, readonly: false };

switch (level) {
case 'account':
hierarchyStore.updateAccount({ id: item.id, description });
hierarchyStore.clearPlant();
hierarchyStore.clearArea();
hierarchyStore.clearSystem();
break;
case 'plant':
hierarchyStore.updatePlant({ id: item.id, description });
hierarchyStore.clearArea();
hierarchyStore.clearSystem();
break;
case 'area':
hierarchyStore.updateArea({ id: item.id, description });
hierarchyStore.clearSystem();
break;
case 'system':
hierarchyStore.updateSystem({ id: item.id, description });
break;
}

return value;
}

export function getClearedChildValues(level: HierarchyLevel): {
plant?: HierarchySearchValue;
area?: HierarchySearchValue;
system?: HierarchySearchValue;
} {
const empty = { id: null, description: '', readonly: false };

switch (level) {
case 'account':
return { plant: empty, area: empty, system: empty };
case 'plant':
return { area: empty, system: empty };
case 'area':
return { system: empty };
default:
return {};
}
}
