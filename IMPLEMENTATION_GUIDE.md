# Guía de Implementación - Módulos CRUD

Este documento te guía para completar las implementaciones de los módulos generados automáticamente.

## 📁 Estructura Creada

Se han generado las estructuras básicas para:
- ✅ **Accounts** (Completamente implementado - usar como referencia)
- ✅ **Plants** (Completamente implementado - usar como referencia)
- 🔨 **Areas** (Estructura básica generada)
- 🔨 **Systems** (Estructura básica generada)
- 🔨 **Assets/Mawois** (Estructura básica generada)
- 🔨 **Components** (Estructura básica generada)
- 🔨 **Users** (Estructura básica generada)

## 🎯 Pasos para Completar cada Módulo

### 1. Completar el Formulario (`*-form.svelte`)

**Ubicación**: `src/lib/components/modules/{entity}s/{entity}-form.svelte`

**Pasos**:
1. Copia el contenido de `plant-form.svelte`
2. Reemplaza todas las referencias de `Plant` por la entidad correspondiente (ej: `Area`)
3. Ajusta los campos específicos según el ViewModel en `VIEWMODELS.md`
4. Actualiza el campo `parent` (por ejemplo, Areas necesitan `plant`, Systems necesitan `area`)
5. Actualiza los imports del servicio correspondiente

**Ejemplo para Areas**:
```svelte
import { plantService, type Plant } from '$lib/services/plant.service';
import { areaService, type Area } from '$lib/services/area.service';
```

### 2. Completar la Tabla (`*-table.svelte`)

**Ubicación**: `src/lib/components/modules/{entity}s/{entity}-table.svelte`

**Pasos**:
1. Copia el contenido de `plant-table.svelte`
2. Reemplaza todas las referencias de `Plant` por la entidad correspondiente
3. Ajusta las columnas según los campos de tu entidad
4. Actualiza los tipos de datos

### 3. Completar la Página Principal (`+page.svelte`)

**Ubicación**: `src/routes/database-setup/{entity}s/+page.svelte`

**Pasos**:
1. Copia el contenido de `plants/+page.svelte`
2. Reemplaza:
   - `Plant` → `{Entity}` (ej: `Area`)
   - `plants` → `{entity}s` (ej: `areas`)
   - `plantService` → `{entity}Service`
   - Rutas `/database-setup/plants` → `/database-setup/{entity}s`
3. Ajusta los textos y mensajes

### 4. Completar la Página de Creación (`create/+page.svelte`)

**Ubicación**: `src/routes/database-setup/{entity}s/create/+page.svelte`

**Pasos**:
1. Copia el contenido de `plants/create/+page.svelte`
2. Reemplaza las mismas referencias que en el paso 3
3. Verifica que las rutas de navegación sean correctas

### 5. Crear la Página de Edición (`edit/[id]/+page.svelte`)

**Ubicación**: `src/routes/database-setup/{entity}s/edit/[id]/+page.svelte`

**Crear nueva estructura**:
```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Save, List } from 'lucide-svelte';
	import AlertModal from '$lib/components/me/alert-modal.svelte';
	import { {Entity}Form } from '$lib/components/modules/{entity}s';
	import { {entity}Service, type {Entity} } from '$lib/services/{entity}.service';

	let {entity}: {Entity} | null = $state(null);
	let isLoading = $state(true);
	let showSuccessDialog = $state(false);
	let updated{Entity}Code = $state('');

	const {entity}Id = $derived(Number($page.params.id));

	onMount(async () => {
		await load{Entity}();
	});

	async function load{Entity}() {
		isLoading = true;
		try {
			{entity} = await {entity}Service.getById({entity}Id);
		} catch (error: any) {
			console.error('Error loading {entity}:', error);
			toast.error(error.message || 'Failed to load {entity}');
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(data: {Entity}) {
		await {entity}Service.update({entity}Id, data);
		updated{Entity}Code = data.code || '';
		showSuccessDialog = true;
	}

	function handleSuccessAction(action: string) {
		if (action === 'primary') {
			showSuccessDialog = false;
		} else if (action === 'secondary') {
			goto('/database-setup/{entity}s');
		}
	}

	function handleCancel() {
		goto('/database-setup/{entity}s');
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6">
		<Button variant="ghost" onclick={handleCancel} class="mb-4 gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to {Entities}
		</Button>
		<h1 class="text-3xl font-bold">Edit {Entity}</h1>
		<p class="text-muted-foreground">Update the {entity} information</p>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center p-12">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if {entity}}
		<{Entity}Form {entity} onSubmit={handleSubmit} onCancel={handleCancel} isEdit={true} />
	{/if}
</div>

<AlertModal
	bind:open={showSuccessDialog}
	type="success"
	title="{Entity} Updated Successfully!"
	description={`The {entity} "${updated{Entity}Code}" has been updated successfully.`}
	buttons={[
		{ label: 'Continue Editing', action: 'primary', variant: 'default', icon: Save },
		{ label: 'Go to List', action: 'secondary', variant: 'outline', icon: List }
	]}
	onAction={handleSuccessAction}
/>
```

## 📋 Checklist por Módulo

### Areas
- [ ] Completar `area-form.svelte` (debe mostrar selector de Plant)
- [ ] Completar `area-table.svelte` (incluir columna de Plant)
- [ ] Completar `areas/+page.svelte`
- [ ] Completar `areas/create/+page.svelte`
- [ ] Crear `areas/edit/[id]/+page.svelte`

### Systems
- [ ] Completar `system-form.svelte` (debe mostrar selector de Area)
- [ ] Completar `system-table.svelte` (incluir columna de Area)
- [ ] Completar `systems/+page.svelte`
- [ ] Completar `systems/create/+page.svelte`
- [ ] Crear `systems/edit/[id]/+page.svelte`

### Assets (Mawois)
- [ ] Completar `asset-form.svelte` (debe mostrar selector de System, incluir campo RPM)
- [ ] Completar `asset-table.svelte` (incluir columna de System y RPM)
- [ ] Completar `assets/+page.svelte`
- [ ] Completar `assets/create/+page.svelte`
- [ ] Crear `assets/edit/[id]/+page.svelte`
- [ ] **Nota**: Verificar si el endpoint es `/assets` o `/mawois` en tu backend

### Components
- [ ] Completar `component-form.svelte` (selector de Asset/Mawoi y ComponentType)
- [ ] Completar `component-table.svelte` (columnas de Asset y ComponentType)
- [ ] Completar `components/+page.svelte`
- [ ] Completar `components/create/+page.svelte`
- [ ] Crear `components/edit/[id]/+page.svelte`

### Users
- [ ] Completar `user-form.svelte` (incluir campos específicos de usuario: email, role, etc.)
- [ ] Completar `user-table.svelte` (columnas de usuario: email, role, active, etc.)
- [ ] Completar `users/+page.svelte`
- [ ] Completar `users/create/+page.svelte`
- [ ] Crear `users/edit/[id]/+page.svelte`
- [ ] **Nota**: Los usuarios tienen una estructura diferente, revisar VIEWMODELS.md

## 🔧 Campos Específicos por Entidad

### AccountViewModel (Referencia)
```typescript
{
  id, code, description, nameContactor, telephoneContactor,
  mailContactor, latitude, longitude, image
}
```

### PlantViewModel (Referencia)
```typescript
{
  ...AccountViewModel fields,
  order, account
}
```

### AreaViewModel
```typescript
{
  ...PlantViewModel fields (except account),
  plant  // Reference to Plant
}
```

### SystemViewModel
```typescript
{
  ...AreaViewModel fields (except plant),
  area  // Reference to Area
}
```

### MawoiViewModel (Asset)
```typescript
{
  id, code, description, order, latitude, longitude, image,
  rpm,  // ⚠️ Campo específico
  system  // Reference to System
}
```

### ComponentViewModel
```typescript
{
  id, code, description, order, image,
  mawoi,  // Reference to Mawoi/Asset
  componentType  // Reference to ComponentType
}
```

### UserViewModel
```typescript
{
  id, name, lastName, email, image, active, phone, dni,
  notifyWhatsapp, notifyEmail, language,
  account,  // Reference to Account
  role,  // Reference to Role
  plants  // Array of plants the user has access to
}
```

## 🎨 Tips de Implementación

### 1. Selectors Jerárquicos
Para entidades con jerarquía (Area → Plant → Account), considera cargar los selects en cascada:

```typescript
// En el form component
let accounts: Account[] = $state([]);
let plants: Plant[] = $state([]);

$effect(() => {
  if (selectedAccount) {
    loadPlants(selectedAccount.value);
  }
});
```

### 2. Validaciones
Usa las funciones de validación de `$lib/shared/validators.ts`:
- `isRequired(value)`
- `isValidEmail(email)`
- `isValidPhone(phone)`
- `isValidLatitude(lat)`
- `isValidLongitude(lng)`

### 3. Manejo de Errores
Siempre usa try-catch y muestra mensajes con `toast`:
```typescript
try {
  await service.create(data);
  toast.success('Created successfully');
} catch (error: any) {
  toast.error(error.message || 'Failed to create');
}
```

## 🚀 Orden Sugerido de Implementación

1. **Areas** - Sigue la jerarquía natural
2. **Systems** - Depende de Areas
3. **Assets/Mawois** - Depende de Systems
4. **Components** - Depende de Assets
5. **Users** - Independiente, pero más complejo

## 📖 Referencias

- Archivos de referencia completos:
  - `src/routes/database-setup/accounts/*`
  - `src/routes/database-setup/plants/*`
  - `src/lib/components/modules/accounts/*`
  - `src/lib/components/modules/plants/*`

- Documentación de ViewModels: `VIEWMODELS.md`
- Servicios de ejemplo: `src/lib/services/account.service.ts` y `plant.service.ts`

## ⚠️ Importante

- **NO modifiques** los archivos de `accounts` y `plants` - úsalos solo como referencia
- Asegúrate de que los endpoints del backend coincidan con los servicios
- Para **Assets**, verifica si tu API usa `/assets` o `/mawois`
- Los **Users** tienen una estructura diferente, presta especial atención

## 🆘 Si tienes dudas

1. Revisa primero los archivos de Plants (son más simples que Accounts)
2. Consulta VIEWMODELS.md para la estructura exacta de datos
3. Verifica los endpoints en tu backend
4. Prueba primero con Areas antes de avanzar a entidades más complejas