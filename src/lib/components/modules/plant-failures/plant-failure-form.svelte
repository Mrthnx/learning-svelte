<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import { plantService, type Plant } from '$lib/services/plant.service';
	import { isRequired, validationMessages } from '$lib/shared';

	interface PlantFailure {
		id?: number | null;
		code?: string;
		description?: string;
		plant?: Plant;
	}

	interface Props {
		plantFailure?: PlantFailure;
		onSubmit: (data: PlantFailure) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		plantFailure,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<PlantFailure>({
		id: plantFailure?.id ?? null,
		code: plantFailure?.code ?? '',
		description: plantFailure?.description ?? '',
		plant: plantFailure?.plant
	});

	let originalData = $state<PlantFailure>(JSON.parse(JSON.stringify(formData)));
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let plants: Plant[] = $state([]);
	let selectedPlant = $state<{ value: string; label: string } | undefined>(
		plantFailure?.plant
			? { value: plantFailure.plant.id!.toString(), label: plantFailure.plant.code || '' }
			: undefined
	);

	const isDirty = $derived(
		formData.plant?.id !== originalData.plant?.id ||
			formData.code !== originalData.code ||
			formData.description !== originalData.description
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	$effect(() => {
		loadPlants();
	});

	async function loadPlants() {
		try {
			const response = await plantService.getAll({ pageSize: 100 });
			plants = response.rows;
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
		}
	}

	function validateForm(): boolean {
		errors = {};

		if (!selectedPlant?.value) {
			errors.plant = validationMessages.required('Plant');
		}

		if (!isRequired(formData.code)) {
			errors.failureModeCode = validationMessages.required('ID');
		}

		if (!isRequired(formData.description)) {
			errors.failureModeDescription = validationMessages.required('Description');
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const selectedPlantData = plants.find((p) => p.id?.toString() === selectedPlant?.value);
		if (selectedPlantData) {
			formData.plant = {
				id: selectedPlantData.id!,
				code: selectedPlantData.code,
				description: selectedPlantData.description
			};
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			originalData = JSON.parse(JSON.stringify(formData));
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>{isEdit ? 'Edit Plant Failure' : 'Create Plant Failure'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit
				? 'Update the plant failure mode association'
				: 'Associate a failure mode with a plant'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Plant Selection -->
			<div class="space-y-2">
				<label for="plant" class="text-sm font-medium">
					Plant <span class="text-destructive">*</span>
				</label>
				<Select.Root bind:selected={selectedPlant}>
					<Select.Trigger
						class={errors.plant ? 'border-destructive' : ''}
						disabled={isSubmitting || isLoading}
					>
						<Select.Value placeholder="Select a plant" />
					</Select.Trigger>
					<Select.Content>
						{#each plants as plant}
							<Select.Item value={plant.id?.toString() || ''}>
								{plant.code} - {plant.description}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.plant}
					<p class="text-sm text-destructive">{errors.plant}</p>
				{/if}
			</div>

			<!-- ID (Failure Mode Code) -->
			<div class="space-y-2">
				<label for="failureModeCode" class="text-sm font-medium">
					ID <span class="text-destructive">*</span>
				</label>
				<Input
					id="failureModeCode"
					bind:value={formData.code}
					placeholder="Enter failure mode ID"
					disabled={isSubmitting || isLoading}
					class={errors.failureModeCode ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.failureModeCode) validateForm();
					}}
				/>
				{#if errors.failureModeCode}
					<p class="text-sm text-destructive">{errors.failureModeCode}</p>
				{/if}
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<label for="failureModeDescription" class="text-sm font-medium">
					Description <span class="text-destructive">*</span>
				</label>
				<Textarea
					id="failureModeDescription"
					bind:value={formData.description}
					placeholder="Enter failure mode description"
					rows={4}
					disabled={isSubmitting || isLoading}
					class={errors.failureModeDescription ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.failureModeDescription) validateForm();
					}}
				/>
				{#if errors.failureModeDescription}
					<p class="text-sm text-destructive">{errors.failureModeDescription}</p>
				{/if}
			</div>
		</form>
	</Card.CardContent>
	<Card.CardFooter class="flex justify-end gap-2">
		<Button variant="outline" onclick={onCancel} disabled={isSubmitting || isLoading} class="gap-2">
			<X class="h-4 w-4" />
			Cancel
		</Button>
		<Button onclick={handleSubmit} disabled={isSubmitting || isLoading} class="gap-2">
			{#if isSubmitting || isLoading}
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				></div>
				{isEdit ? 'Saving...' : 'Creating...'}
			{:else}
				<Save class="h-4 w-4" />
				{isEdit ? 'Save Changes' : 'Create Association'}
			{/if}
		</Button>
	</Card.CardFooter>
</Card.Card>
