import { goto } from '$app/navigation';
import { hierarchyStore } from '$lib/store/hierarchy.store';
import type { Account, Plant, Area, System, Asset, Component } from '$lib/types';

/**
 * Navigation helper for hierarchical navigation with automatic hierarchy store update
 */
export class HierarchyNavigation {
	/**
	 * Navigate from Account to Plants page
	 */
	static goToPlants(account: Account) {
		hierarchyStore.updateAccount({
			id: account.id!,
			description: account.description || account.code || `Account ${account.id}`
		});
		goto('/database-setup/plants');
	}

	/**
	 * Navigate from Plant to Areas page
	 */
	static goToAreas(plant: Plant) {
		// Update plant in hierarchy (this will preserve account and clear area/system)
		hierarchyStore.updatePlant({
			id: plant.id!,
			description: plant.description || plant.code || `Plant ${plant.id}`
		});
		goto('/database-setup/areas');
	}

	/**
	 * Navigate from Area to Systems page
	 */
	static goToSystems(area: Area) {
		// Update area in hierarchy (this will preserve account/plant and clear system)
		hierarchyStore.updateArea({
			id: area.id!,
			description: area.description || area.code || `Area ${area.id}`
		});
		goto('/database-setup/systems');
	}

	/**
	 * Navigate from System to Assets page
	 */
	static goToAssets(system: System) {
		// Update system in hierarchy (this will preserve account/plant/area)
		hierarchyStore.updateSystem({
			id: system.id!,
			description: system.description || system.code || `System ${system.id}`
		});
		goto('/database-setup/assets');
	}

	/**
	 * Navigate from Asset to Components page
	 */
	static goToComponents(asset: Asset) {
		// For asset, we don't update hierarchy store since asset is not part of it
		// But we can set up the hierarchy context based on the asset's relationships
		if (asset.system) {
			hierarchyStore.updateSystem({
				id: asset.system.id!,
				description: asset.system.description || asset.system.code || `System ${asset.system.id}`
			});
		}
		goto('/database-setup/components');
	}

	/**
	 * Handle component details navigation (placeholder for future implementation)
	 */
	static goToComponentDetails(component: Component) {
		// For now, just log - can be extended for component details page
		console.log('Navigate to component details:', component);
		// Could navigate to a component details/analysis page in the future
		// goto(`/database-setup/components/${component.id}/details`);
	}
}
