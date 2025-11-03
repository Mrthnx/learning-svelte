#!/bin/bash

echo "🚀 Generando todos los módulos completos..."

# Función para crear componentes basándose en plants
create_module() {
    local entity=$1
    local Entity=$2
    local Entities=$3
    local parent_service=$4
    local parent_entity=$5
    local Parent=$6
    local extra_fields=$7
    
    echo "Creando módulo: $Entity..."
    
    # Crear directorio
    mkdir -p "src/lib/components/modules/${entity}s"
    mkdir -p "src/routes/database-setup/${entity}s/create"
    mkdir -p "src/routes/database-setup/${entity}s/edit/[id]"
    
    # Table component - copiar de plants y reemplazar
    sed "s/Plant/$Entity/g; s/plant/$entity/g; s/Plants/$Entities/g; s/plants/${entity}s/g" \
        src/lib/components/modules/plants/plant-table.svelte \
        > "src/lib/components/modules/${entity}s/${entity}-table.svelte"
    
    # Form component - más complejo, necesita ajustes
    sed "s/Plant/$Entity/g; s/plant/$entity/g; s/Plants/$Entities/g; s/plants/${entity}s/g; s/account/$parent_entity/g; s/Account/$Parent/g; s/accountService/${parent_service}Service/g" \
        src/lib/components/modules/plants/plant-form.svelte \
        > "src/lib/components/modules/${entity}s/${entity}-form.svelte"
    
    # Index file
    cat > "src/lib/components/modules/${entity}s/index.ts" <<EOF
export { default as ${Entity}Form } from './${entity}-form.svelte';
export { default as ${Entity}Table } from './${entity}-table.svelte';
EOF
    
    # Main page
    sed "s/Plant/$Entity/g; s/plant/$entity/g; s/Plants/$Entities/g; s/plants/${entity}s/g" \
        src/routes/database-setup/plants/+page.svelte \
        > "src/routes/database-setup/${entity}s/+page.svelte"
    
    # Create page
    sed "s/Plant/$Entity/g; s/plant/$entity/g; s/Plants/$Entities/g; s/plants/${entity}s/g" \
        src/routes/database-setup/plants/create/+page.svelte \
        > "src/routes/database-setup/${entity}s/create/+page.svelte"
    
    # Edit page (crear desde template)
    cat > "src/routes/database-setup/${entity}s/edit/[id]/+page.svelte" <<'EDITEOF'
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { ENTITY_CAPForm } from '$lib/components/modules/ENTITY_PLURALs';
	import { ENTITY_LOWERService, type ENTITY_CAP } from '$lib/services/ENTITY_LOWER.service';

	let ENTITY_LOWER: ENTITY_CAP | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updatedENTITY_CAPCode = $state('');

	const ENTITY_LOWERId = $derived(Number($page.params.id));

	onMount(async () => {
		await loadENTITY_CAP();
	});

	async function loadENTITY_CAP() {
		isLoading = true;
		try {
			ENTITY_LOWER = await ENTITY_LOWERService.getById(ENTITY_LOWERId);
		} catch (error: any) {
			console.error('Error loading ENTITY_LOWER:', error);
			toast.error(error.message || 'Failed to load ENTITY_LOWER');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: ENTITY_CAP) {
		await ENTITY_LOWERService.update(ENTITY_LOWERId, data);
		updatedENTITY_CAPCode = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/ENTITY_PLURALs');
		}
	}

	function handleCancel() {
		goto('/database-setup/ENTITY_PLURALs');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to ENTITY_PLURALS_TITLE
		</Button>
		<h1 class="text-3xl font-bold">Edit ENTITY_CAP</h1>
		<p class="text-muted-foreground">Update the ENTITY_LOWER information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if ENTITY_LOWER}
		<ENTITY_CAPForm ENTITY_LOWER={ENTITY_LOWER} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="ENTITY_CAP Updated Successfully!"
	description={`The ENTITY_LOWER "${updatedENTITY_CAPCode}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
EDITEOF
    
    # Reemplazar placeholders en edit page
    sed -i "s/ENTITY_CAP/$Entity/g; s/ENTITY_LOWER/$entity/g; s/ENTITY_PLURALS_TITLE/$Entities/g; s/ENTITY_PLURALs/${entity}s/g" \
        "src/routes/database-setup/${entity}s/edit/[id]/+page.svelte"
    
    echo "✅ $Entity completado"
}

# Crear todos los módulos
create_module "area" "Area" "Areas" "plant" "plant" "Plant" ""
create_module "system" "System" "Systems" "area" "area" "Area" ""
create_module "asset" "Asset" "Assets" "system" "system" "System" "rpm"
create_module "component" "Component" "Components" "asset" "mawoi" "Asset" ""
create_module "user" "User" "Users" "account" "account" "Account" ""

echo ""
echo "🎉 ¡Todos los módulos han sido generados!"
echo ""
echo "📝 Notas importantes:"
echo "1. Asset form necesita ajuste manual para campo RPM"
echo "2. Component form necesita selector de ComponentType"
echo "3. User form necesita campos especiales (email, role, active, etc)"
echo ""
echo "✅ Servicios corregidos con paginado correcto (pageSize)"
echo "✅ Todos los componentes generados desde plants"
echo "✅ Todas las páginas (list, create, edit) creadas"