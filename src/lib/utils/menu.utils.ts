import type { MenuItem, SubMenuItem } from '$lib/types';

/**
 * Transforms menu items by generating URIs based on parent label
 */
export function transformMenuItems(menuItems: MenuItem[]): MenuItem[] {
	return menuItems.map((item) => ({
		...item,
		menus: item.menus?.map((subMenu) => ({
			...subMenu,
			uri: buildMenuUri(item.label, subMenu.uri)
		}))
	}));
}

/**
 * Builds a menu URI from parent label and sub-menu URI
 */
function buildMenuUri(parentLabel: string, subMenuUri: string): string {
	const normalizedParent = normalizeLabel(parentLabel);
	return `${normalizedParent}/${subMenuUri}`;
}

/**
 * Normalizes label to URL-safe format
 */
function normalizeLabel(label: string): string {
	return label.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Extracts all sub-menu items from menu structure
 */
export function extractSubMenus(menuItems: MenuItem[]): SubMenuItem[] {
	return menuItems.flatMap((item) => item.menus || []);
}
