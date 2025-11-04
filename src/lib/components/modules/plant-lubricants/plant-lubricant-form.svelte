<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import { Save, X, Upload, Trash2, FileSpreadsheet, FileText } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { useUnsavedChanges } from '$lib/composables';
	import FileUpload from '$lib/components/me/file-upload.svelte';
	import { isRequired, validationMessages } from '$lib/shared';
	import { api } from '$lib/services/api';

	interface ExcelRow {
		id?: string;
		date: string;
		details: string;
	}

	interface Plant {
		id?: number | null;
		code?: string;
		description?: string;
	}

	interface PlantLubricant {
		id?: number | null;
		code?: string;
		description?: string;
		text?: string;
		link?: string;
		pdfUrl?: string;
		plant?: Plant;
		excelData?: ExcelRow[];
	}

	interface Props {
		plantLubricant?: PlantLubricant;
		onSubmit: (data: PlantLubricant) => Promise<void> | void;
		onCancel: () => void;
		isEdit?: boolean;
		isLoading?: boolean;
		enableUnsavedWarning?: boolean;
	}

	let {
		plantLubricant,
		onSubmit,
		onCancel,
		isEdit = false,
		isLoading = false,
		enableUnsavedWarning = true
	}: Props = $props();

	let formData = $state<PlantLubricant>({
		id: plantLubricant?.id ?? null,
		code: plantLubricant?.code ?? '',
		description: plantLubricant?.description ?? '',
		text: plantLubricant?.text ?? '',
		link: plantLubricant?.link ?? '',
		pdfUrl: plantLubricant?.pdfUrl ?? '',
		plant: plantLubricant?.plant,
		excelData: plantLubricant?.excelData ?? []
	});

	let originalData = $state<PlantLubricant>(JSON.parse(JSON.stringify(formData)));
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let pdfFile: File | null = $state(null);
	let excelFile: File | null = $state(null);

	let plants: Plant[] = $state([]);
	let selectedPlant = $state<{ value: string; label: string } | undefined>(
		plantLubricant?.plant
			? { value: plantLubricant.plant.id!.toString(), label: plantLubricant.plant.code || '' }
			: undefined
	);

	const isDirty = $derived(
		formData.code !== originalData.code ||
			formData.description !== originalData.description ||
			formData.text !== originalData.text ||
			formData.link !== originalData.link ||
			formData.pdfUrl !== originalData.pdfUrl ||
			formData.plant?.id !== originalData.plant?.id ||
			JSON.stringify(formData.excelData) !== JSON.stringify(originalData.excelData) ||
			pdfFile !== null ||
			excelFile !== null
	);

	if (enableUnsavedWarning) {
		useUnsavedChanges(() => isDirty);
	}

	$effect(() => {
		loadPlants();
		if (isEdit && plantLubricant?.id) {
			loadExcelData();
		}
	});

	async function loadPlants() {
		try {
			const response = await api.getLoader('plants?page=1&size=100');
			plants = response.data.records || [];
		} catch (error) {
			console.error('Error loading plants:', error);
			toast.error('Failed to load plants');
		}
	}

	async function loadExcelData() {
		try {
			const response = await api.get(
				`analysis-data-trib/by-lubricant/${plantLubricant!.id}`
			);

			if (response.data && Array.isArray(response.data)) {
				// Map API response to ExcelRow format
				const loadedData: ExcelRow[] = response.data.map((item: any) => ({
					id: item.id?.toString() || crypto.randomUUID(),
					date: item.surveyDataDate || item.date || new Date().toISOString().split('T')[0],
					details:
						item.sampleId ||
						item.details ||
						item.description ||
						`Sample ${item.id || ''}`
				}));

				formData.excelData = loadedData;
				originalData.excelData = JSON.parse(JSON.stringify(loadedData));
			}
		} catch (error: any) {
			console.error('Error loading Excel data:', error);
			// Don't show error toast if it's just a 404 (no data yet)
			if (error.response?.status !== 404) {
				toast.error('Failed to load Excel data');
			}
		}
	}

	function validateForm(): boolean {
		errors = {};

		if (!selectedPlant?.value) {
			errors.plant = validationMessages.required('Plant');
		}

		if (!isRequired(formData.code)) {
			errors.code = validationMessages.required('ID');
		}

		if (!isRequired(formData.description)) {
			errors.description = validationMessages.required('Description');
		}

		return Object.keys(errors).length === 0;
	}

	function handlePdfFileChange(
		event: CustomEvent<{ file: File | null; preview: string | null; url: string | null }>
	) {
		pdfFile = event.detail.file;
		if (event.detail.url) {
			formData.pdfUrl = event.detail.url;
		}
	}

	function handlePdfFileError(event: CustomEvent<{ message: string }>) {
		toast.error(event.detail.message);
	}

	async function handleExcelUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		// Validate required fields before upload
		if (!selectedPlant?.value) {
			toast.error('Please select a Plant before uploading Excel');
			return;
		}

		if (!formData.id) {
			toast.error('Please save the lubricant before uploading Excel');
			return;
		}

		excelFile = input.files[0];

		try {
			toast.info('Processing Excel file...');

			// Convert file to base64
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const base64 = e.target?.result as string;

					// Prepare request body
					const requestBody = [
						{
							base64: base64,
							lubricantId: formData.id!,
							plantId: parseInt(selectedPlant!.value)
						}
					];

					// Call API endpoint
					const response = await api.post(
						'surveyData/loadLubricantsFromTribologyData',
						requestBody
					);

					// Parse response and update table
					if (response.data) {
						// Assuming the API returns the parsed data
						// Adjust based on actual API response structure
						const newRows: ExcelRow[] = Array.isArray(response.data)
							? response.data.map((item: any) => ({
									id: crypto.randomUUID(),
									date: item.date || new Date().toISOString().split('T')[0],
									details: item.details || item.description || ''
								}))
							: [];

						formData.excelData = [...(formData.excelData || []), ...newRows];
						toast.success('Excel data loaded successfully');
					} else {
						toast.success('Excel uploaded successfully');
					}

					// Clear input
					input.value = '';
				} catch (apiError: any) {
					console.error('Error uploading Excel:', apiError);
					toast.error(apiError.message || 'Failed to upload Excel file');
				}
			};

			reader.onerror = () => {
				toast.error('Failed to read Excel file');
			};

			reader.readAsDataURL(excelFile);
		} catch (error) {
			console.error('Error processing Excel:', error);
			toast.error('Failed to process Excel file');
		}
	}

	function deleteExcelRow(rowId: string) {
		formData.excelData = formData.excelData?.filter((row) => row.id !== rowId) || [];
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Set plant data from selected plant
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
		<Card.CardTitle>{isEdit ? 'Edit Plant Lubricant' : 'Create Plant Lubricant'}</Card.CardTitle>
		<Card.CardDescription>
			{isEdit ? 'Update the plant lubricant association' : 'Associate a lubricant with a plant'}
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Plant Selection -->
			<div class="space-y-2">
				<label for="plant" class="text-sm font-medium">
					Plant <span class="text-destructive">*</span>
				</label>
				<select
					id="plant"
					bind:value={selectedPlant}
					disabled={isSubmitting || isLoading}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {errors.plant
						? 'border-destructive'
						: ''}"
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						const plant = plants.find((p) => p.id?.toString() === target.value);
						if (plant) {
							selectedPlant = { value: plant.id!.toString(), label: plant.code || '' };
						}
					}}
				>
					<option value="">Select a plant</option>
					{#each plants as plant}
						<option value={plant.id?.toString() || ''}>
							{plant.code} - {plant.description}
						</option>
					{/each}
				</select>
				{#if errors.plant}
					<p class="text-sm text-destructive">{errors.plant}</p>
				{/if}
			</div>

			<!-- ID -->
			<div class="space-y-2">
				<label for="code" class="text-sm font-medium">
					ID <span class="text-destructive">*</span>
				</label>
				<Input
					id="code"
					bind:value={formData.code}
					placeholder="Enter lubricant ID"
					disabled={isSubmitting || isLoading}
					class={errors.code ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.code) validateForm();
					}}
				/>
				{#if errors.code}
					<p class="text-sm text-destructive">{errors.code}</p>
				{/if}
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">
					Description <span class="text-destructive">*</span>
				</label>
				<Textarea
					id="description"
					bind:value={formData.description}
					placeholder="Enter description"
					rows={3}
					disabled={isSubmitting || isLoading}
					class={errors.description ? 'border-destructive' : ''}
					oninput={() => {
						if (errors.description) validateForm();
					}}
				/>
				{#if errors.description}
					<p class="text-sm text-destructive">{errors.description}</p>
				{/if}
			</div>

			<!-- Text -->
			<div class="space-y-2">
				<label for="text" class="text-sm font-medium">Text</label>
				<Textarea
					id="text"
					bind:value={formData.text}
					placeholder="Enter additional text information"
					rows={6}
					disabled={isSubmitting || isLoading}
				/>
			</div>

			<!-- Link -->
			<div class="space-y-2">
				<label for="link" class="text-sm font-medium">Link</label>
				<Input
					id="link"
					type="url"
					bind:value={formData.link}
					placeholder="https://example.com"
					disabled={isSubmitting || isLoading}
				/>
			</div>

			<!-- PDF Upload -->
			<div class="space-y-2">
				<FileUpload
					fileType="pdf"
					label="PDF Document"
					maxSize={10}
					existingFileUrl={formData.pdfUrl}
					disabled={isSubmitting || isLoading}
					on:fileChange={handlePdfFileChange}
					on:error={handlePdfFileError}
				/>
			</div>

			<!-- Excel Upload -->
			<div class="space-y-2">
				<label for="excel" class="text-sm font-medium flex items-center gap-2">
					<FileSpreadsheet class="h-4 w-4" />
					Excel Data Upload
				</label>
				<div class="flex gap-2">
					<Input
						id="excel"
						type="file"
						accept=".xlsx,.xls"
						onchange={handleExcelUpload}
						disabled={isSubmitting || isLoading}
						class="cursor-pointer"
					/>
				</div>
				<p class="text-xs text-muted-foreground">
					Upload Excel files to populate the table below
				</p>
			</div>

			<!-- Excel Data Table -->
			{#if formData.excelData && formData.excelData.length > 0}
				<div class="space-y-2">
					<label class="text-sm font-medium">Excel Data</label>
					<div class="rounded-md border">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Date</Table.Head>
									<Table.Head>Details</Table.Head>
									<Table.Head class="w-[100px]">Actions</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each formData.excelData as row}
									<Table.Row>
										<Table.Cell class="font-medium">{row.date}</Table.Cell>
										<Table.Cell>{row.details}</Table.Cell>
										<Table.Cell>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => deleteExcelRow(row.id!)}
												disabled={isSubmitting || isLoading}
											>
												<Trash2 class="h-4 w-4 text-destructive" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</div>
			{/if}
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
