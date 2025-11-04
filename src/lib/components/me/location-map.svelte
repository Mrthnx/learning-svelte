<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { MapPin, Crosshair, RotateCcw } from '@lucide/svelte';

	export let latitude: number = 0;
	export let longitude: number = 0;
	export let height: string = '400px';
	export let disabled: boolean = false;
	export let showAddress: boolean = true;

	const PRIMARY_COLOR = '#f59e0b';

	const dispatch = createEventDispatcher<{
		locationChange: { latitude: number; longitude: number };
		addressChange: { address: string };
	}>();

	let mapContainer: HTMLDivElement;
	let map: any;
	let marker: any;
	let isMapReady = false;
	let address: string = '';
	let isLoadingAddress: boolean = false;

	async function loadLeaflet() {
		if (typeof window === 'undefined') return;

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);

		const script = document.createElement('script');
		script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

		return new Promise((resolve) => {
			script.onload = resolve;
			document.head.appendChild(script);
		});
	}

	async function fetchAddress(lat: number, lng: number) {
		if (!showAddress) return;

		isLoadingAddress = true;
		address = '';

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
				{
					headers: {
						'User-Agent': 'LocationMapComponent/1.0'
					}
				}
			);

			if (response.ok) {
				const data = await response.json();
				address = data.display_name || 'Address not found';
				dispatch('addressChange', { address });
			} else {
				address = 'Unable to fetch address';
			}
		} catch (error) {
			console.error('Error fetching address:', error);
			address = 'Error fetching address';
		} finally {
			isLoadingAddress = false;
		}
	}

	function createCustomIcon() {
		const L = (window as any).L;
		return L.divIcon({
			html: `
				<div style="
					background: ${PRIMARY_COLOR};
					width: 32px;
					height: 32px;
					border-radius: 50%;
					border: 3px solid white;
					box-shadow: 0 4px 12px rgba(0,0,0,0.4);
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
				">
					<div style="
						width: 0;
						height: 0;
						border-left: 8px solid transparent;
						border-right: 8px solid transparent;
						border-top: 14px solid ${PRIMARY_COLOR};
						position: absolute;
						bottom: -14px;
						left: 50%;
						transform: translateX(-50%);
					"></div>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
						<circle cx="12" cy="10" r="3"></circle>
					</svg>
				</div>
			`,
			className: 'custom-marker',
			iconSize: [32, 46],
			iconAnchor: [16, 46],
			popupAnchor: [0, -46]
		});
	}

	async function initMap() {
		if (!mapContainer || typeof window === 'undefined') return;

		await loadLeaflet();

		const L = (window as any).L;

		map = L.map(mapContainer, {
			center: [latitude || 0, longitude || 0],
			zoom: latitude === 0 && longitude === 0 ? 2 : 13,
			zoomControl: true,
			scrollWheelZoom: true,
			touchZoom: true,
			doubleClickZoom: true,
			boxZoom: true,
			keyboard: true,
			dragging: !disabled
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
			maxZoom: 19
		}).addTo(map);

		if (latitude !== 0 || longitude !== 0) {
			marker = L.marker([latitude, longitude], {
				icon: createCustomIcon(),
				draggable: !disabled
			}).addTo(map);

			if (showAddress) {
				await fetchAddress(latitude, longitude);
			}
		}

		if (!disabled) {
			map.on('click', (e: any) => {
				const { lat, lng } = e.latlng;
				updateLocation(lat, lng);
			});

			if (marker) {
				marker.on('dragend', (e: any) => {
					const { lat, lng } = e.target.getLatLng();
					updateLocation(lat, lng);
				});
			}
		}

		isMapReady = true;
	}

	async function updateLocation(lat: number, lng: number) {
		if (!map || disabled) return;

		const L = (window as any).L;

		latitude = parseFloat(lat.toFixed(6));
		longitude = parseFloat(lng.toFixed(6));

		if (marker) {
			marker.setLatLng([latitude, longitude]);
		} else {
			marker = L.marker([latitude, longitude], {
				icon: createCustomIcon(),
				draggable: !disabled
			}).addTo(map);

			if (!disabled) {
				marker.on('dragend', (e: any) => {
					const { lat, lng } = e.target.getLatLng();
					updateLocation(lat, lng);
				});
			}
		}

		dispatch('locationChange', { latitude, longitude });

		if (showAddress) {
			await fetchAddress(latitude, longitude);
		}
	}

	function getCurrentLocation() {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by this browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				updateLocation(lat, lng);

				if (map) {
					map.setView([lat, lng], 13);
				}
			},
			(error) => {
				console.error('Error getting location:', error);
				alert('Could not get your location');
			}
		);
	}

	function resetLocation() {
		updateLocation(0, 0);
		if (map) {
			map.setView([0, 0], 2);
		}
	}

	function updateMapView() {
		if (!map || !isMapReady) return;

		const L = (window as any).L;

		if (marker) {
			marker.setLatLng([latitude, longitude]);
		} else if (latitude !== 0 || longitude !== 0) {
			marker = L.marker([latitude, longitude], {
				icon: createCustomIcon(),
				draggable: !disabled
			}).addTo(map);

			if (!disabled) {
				marker.on('dragend', (e: any) => {
					const { lat, lng } = e.target.getLatLng();
					updateLocation(lat, lng);
				});
			}
		}

		const currentZoom = map.getZoom();
		map.setView([latitude, longitude], currentZoom);
	}

	$: if (isMapReady && (latitude !== undefined || longitude !== undefined)) {
		updateMapView();
	}

	onMount(() => {
		initMap();
	});
</script>

<div class="p-2 sm:p-4">
	<div class="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-2">
			<MapPin class="h-5 w-5 text-primary" />
			<span class="text-sm font-medium">Select Location</span>
		</div>
		{#if !disabled}
			<div class="flex gap-2">
				<button
					type="button"
					onclick={getCurrentLocation}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md sm:flex-none sm:gap-2 sm:text-sm"
				>
					<Crosshair class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					<span class="hidden sm:inline">My Location</span>
					<span class="sm:hidden">Location</span>
				</button>
				<button
					type="button"
					onclick={resetLocation}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:bg-muted/80 sm:flex-none sm:gap-2 sm:text-sm"
				>
					<RotateCcw class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					Reset
				</button>
			</div>
		{/if}
	</div>

	<div class="relative">
		<div
			bind:this={mapContainer}
			class="w-full overflow-hidden rounded-lg border shadow-md {disabled
				? 'pointer-events-none opacity-75'
				: ''}"
			style="height: min(calc(100vh - 400px), {height}); min-height: 250px;"
		></div>

		{#if !isMapReady}
			<div
				class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm"
			>
				<div class="text-center">
					<div
						class="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
					></div>
					<p class="text-sm font-medium text-muted-foreground">Loading map...</p>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-3 sm:space-y-2 sm:text-sm">
		{#if !disabled}
			<p class="font-medium text-xs sm:text-sm">Click on the map or drag the marker to select a location</p>
		{/if}
		<p class="font-mono text-[10px] sm:text-xs">
			Coordinates: <span class="font-semibold text-foreground"
				>{(+latitude).toFixed(6)}, {(+longitude).toFixed(6)}</span
			>
		</p>
		{#if showAddress}
			<div class="rounded-lg bg-muted/50 p-2 text-[10px] sm:p-3 sm:text-xs">
				{#if isLoadingAddress}
					<div class="flex items-center gap-2">
						<div
							class="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-primary"
						></div>
						<span class="text-muted-foreground">Loading address...</span>
					</div>
				{:else if address}
					<div>
						<p class="mb-1 font-medium text-foreground">Address:</p>
						<p class="break-words text-muted-foreground">{address}</p>
					</div>
				{:else if latitude !== 0 || longitude !== 0}
					<p class="text-muted-foreground">No address available</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.custom-marker) {
		background: transparent !important;
		border: none !important;
	}
</style>
