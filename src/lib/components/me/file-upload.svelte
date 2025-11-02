<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Image as ImageIcon, FileText, X, Upload } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	type FileType = 'image' | 'pdf' | 'any';

	interface Props {
		fileType?: FileType;
		maxSize?: number; // in MB
		label?: string;
		description?: string;
		required?: boolean;
		disabled?: boolean;
		existingFileUrl?: string;
		class?: string;
	}

	let {
		fileType = 'image',
		maxSize = 5,
		label = 'Upload File',
		description,
		required = false,
		disabled = false,
		existingFileUrl = '',
		class: className = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		fileChange: { file: File | null; preview: string | null };
		error: { message: string };
	}>();

	let selectedFile: FileList | undefined = $state(undefined);
	let preview: string | null = $state(existingFileUrl || null);
	let fileName: string = $state('');
	let isDragging = $state(false);

	// Configuración según tipo de archivo
	const fileConfig = $derived.by(() => {
		switch (fileType) {
			case 'image':
				return {
					accept: 'image/*',
					icon: ImageIcon,
					formats: 'PNG, JPG, WEBP, GIF',
					description: description || `Upload an image (${maxSize}MB max)`
				};
			case 'pdf':
				return {
					accept: 'application/pdf',
					icon: FileText,
					formats: 'PDF',
					description: description || `Upload a PDF file (${maxSize}MB max)`
				};
			case 'any':
				return {
					accept: '*/*',
					icon: Upload,
					formats: 'Any file type',
					description: description || `Upload a file (${maxSize}MB max)`
				};
			default:
				return {
					accept: '*/*',
					icon: Upload,
					formats: 'Any file type',
					description: description || `Upload a file (${maxSize}MB max)`
				};
		}
	});

	function validateFile(file: File): boolean {
		// Validar tipo de archivo
		if (fileType === 'image' && !file.type.startsWith('image/')) {
			dispatch('error', { message: 'Please select a valid image file' });
			return false;
		}

		if (fileType === 'pdf' && file.type !== 'application/pdf') {
			dispatch('error', { message: 'Please select a valid PDF file' });
			return false;
		}

		// Validar tamaño
		const maxSizeBytes = maxSize * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			dispatch('error', { message: `File size must be less than ${maxSize}MB` });
			return false;
		}

		return true;
	}

	function createPreview(file: File) {
		if (fileType === 'image') {
			const reader = new FileReader();
			reader.onload = (e) => {
				preview = e.target?.result as string;
				dispatch('fileChange', { file, preview: preview });
			};
			reader.readAsDataURL(file);
		} else if (fileType === 'pdf') {
			preview = 'pdf';
			dispatch('fileChange', { file, preview: null });
		} else {
			preview = 'file';
			dispatch('fileChange', { file, preview: null });
		}
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			if (!validateFile(file)) {
				selectedFile = undefined;
				preview = null;
				fileName = '';
				return;
			}

			fileName = file.name;
			createPreview(file);
		} else {
			preview = null;
			fileName = '';
			dispatch('fileChange', { file: null, preview: null });
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (!disabled) {
			isDragging = true;
		}
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		if (disabled) return;

		const file = event.dataTransfer?.files[0];
		if (file) {
			if (!validateFile(file)) return;

			fileName = file.name;
			createPreview(file);

			// Crear un FileList simulado para el input
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			selectedFile = dataTransfer.files;
		}
	}

	function removeFile() {
		selectedFile = undefined;
		preview = null;
		fileName = '';
		dispatch('fileChange', { file: null, preview: null });
	}

	// Cargar preview existente al montar
	$effect(() => {
		if (existingFileUrl && !preview) {
			preview = existingFileUrl;
		}
	});
</script>

<div class="space-y-2 {className}">
	{#if label}
		<label for="file-upload-input" class="text-sm font-medium">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</label>
	{/if}

	<div class="space-y-3">
		<!-- Preview Area -->
		{#if preview && preview !== 'pdf' && preview !== 'file'}
			<!-- Image Preview with fixed height and aspect ratio -->
			<div class="relative">
				<div
					class="flex h-[300px] items-center justify-center overflow-hidden rounded-lg border bg-muted"
				>
					<img src={preview} alt="Preview" class="h-full w-auto max-w-full object-contain" />
				</div>
				{#if !disabled}
					<Button
						type="button"
						variant="destructive"
						size="sm"
						class="absolute top-2 right-2 gap-1 shadow-lg"
						onclick={removeFile}
					>
						<X class="h-3 w-3" />
						Remove
					</Button>
				{/if}
			</div>
		{:else if preview === 'pdf'}
			<!-- PDF Preview -->
			<div
				class="flex items-center justify-between rounded-lg border bg-muted p-4"
				class:opacity-50={disabled}
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
						<FileText class="h-8 w-8 text-red-600 dark:text-red-400" />
					</div>
					<div>
						<p class="font-medium">{fileName || 'PDF Document'}</p>
						{#if selectedFile?.[0]}
							<p class="text-xs text-muted-foreground">
								{(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
							</p>
						{/if}
					</div>
				</div>
				{#if !disabled}
					<Button type="button" variant="ghost" size="sm" class="gap-1" onclick={removeFile}>
						<X class="h-4 w-4" />
						Remove
					</Button>
				{/if}
			</div>
		{:else if preview === 'file'}
			<!-- Generic File Preview -->
			<div
				class="flex items-center justify-between rounded-lg border bg-muted p-4"
				class:opacity-50={disabled}
			>
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-3">
						<Upload class="h-8 w-8 text-primary" />
					</div>
					<div>
						<p class="font-medium">{fileName || 'File'}</p>
						{#if selectedFile?.[0]}
							<p class="text-xs text-muted-foreground">
								{(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
							</p>
						{/if}
					</div>
				</div>
				{#if !disabled}
					<Button type="button" variant="ghost" size="sm" class="gap-1" onclick={removeFile}>
						<X class="h-4 w-4" />
						Remove
					</Button>
				{/if}
			</div>
		{:else}
			<!-- Drop Zone -->
			<div
				class="flex min-h-[200px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors"
				class:border-primary={isDragging}
				class:bg-primary={isDragging}
				class:bg-opacity-5={isDragging}
				class:border-muted-foreground={!isDragging}
				class:opacity-50={disabled}
				class:cursor-not-allowed={disabled}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				role="button"
				tabindex={disabled ? -1 : 0}
				onclick={() => {
					if (!disabled) document.getElementById('file-upload-input')?.click();
				}}
				onkeydown={(e) => {
					if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
						e.preventDefault();
						document.getElementById('file-upload-input')?.click();
					}
				}}
			>
				<div class="p-6 text-center">
					{#if fileType === 'image'}
						<ImageIcon class="mx-auto h-12 w-12 text-muted-foreground" />
					{:else if fileType === 'pdf'}
						<FileText class="mx-auto h-12 w-12 text-muted-foreground" />
					{:else}
						<Upload class="mx-auto h-12 w-12 text-muted-foreground" />
					{/if}
					<p class="mt-3 text-sm font-medium">
						{isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
					</p>
					<p class="mt-1 text-xs text-muted-foreground">{fileConfig.formats}</p>
				</div>
			</div>
		{/if}

		<!-- Hidden File Input -->
		<Input
			id="file-upload-input"
			type="file"
			accept={fileConfig.accept}
			bind:files={selectedFile}
			onchange={handleFileChange}
			{disabled}
			{required}
			class="hidden"
		/>

		<!-- Description Text -->
		{#if fileConfig.description}
			<p class="text-xs text-muted-foreground">
				{fileConfig.description}
			</p>
		{/if}
	</div>
</div>
