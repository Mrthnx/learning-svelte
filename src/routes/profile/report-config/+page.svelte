<script lang="ts" module>
	import { z } from 'zod/v4';

	export const formSchema = z.object({
		nameCompany: z.string().min(1, 'Company name is required'),
		addressCompany: z.string().min(1, 'Company address is required'),
		imageCompany: z.any().optional()
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Upload, Image as ImageIcon, FileText, Settings, ArrowLeft, Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { authStore } from '$lib/store';

	let { data } = $props();

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		resetForm: false
	});

	const { form: formData, enhance, submitting } = form;

	let logoPreview: string | null = null;
	let logoFileInput: HTMLInputElement;

	onMount(() => {
		if (data.user) {
			form.reset({ 
				data: { 
					nameCompany: data.user.nameCompany || '',
					addressCompany: data.user.addressCompany || '',
					imageCompany: data.user.imageCompany 
				} as any 
			});
			logoPreview = data.user.imageCompany;
		}
	});

	function validateImage(file: File): boolean {
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
			return false;
		}
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error('Image size must be less than 5MB');
			return false;
		}
		return true;
	}

	function handleLogoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			if (!validateImage(file)) {
				target.value = '';
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				logoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
			$formData.imageCompany = file;
			toast.success('Logo ready to be uploaded.');
		}
	}

	function triggerLogoInput() {
		logoFileInput?.click();
	}

	function removeLogo() {
		logoPreview = null;
		$formData.imageCompany = null;
		if (logoFileInput) {
			logoFileInput.value = '';
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const validated = await form.validateForm();
		if (validated.valid) {
			try {
				const userId = data.user?.id;
				if (!userId) {
					toast.error('User not found');
					return;
				}

				let imageCompanyUrl = data.user?.imageCompany;

				// Upload image if a new one was selected
				if ($formData.imageCompany && $formData.imageCompany instanceof File) {
					const formDataImage = new FormData();
					formDataImage.append('file', $formData.imageCompany);
					const res = await api.post('files', formDataImage);
					imageCompanyUrl = res.data.url;
				}

				// Update user with company data using the same profile endpoint
				const updateData = {
					...data.user,
					nameCompany: $formData.nameCompany,
					addressCompany: $formData.addressCompany,
					imageCompany: imageCompanyUrl
				};

				await api.put(`users/${userId}`, updateData);

				// Update auth store
				authStore.login({ ...data.user, ...updateData }, $authStore.token!, $authStore.menu);

				toast.success('Report configuration updated successfully!');
			} catch (error: any) {
				toast.error(error.message || 'Failed to update report configuration');
			}
		}
	}
</script>

<div class="container mx-auto max-w-4xl space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Report Configuration</h1>
		<Button variant="outline" onclick={() => goto('/profile')}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Profile
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Settings class="h-5 w-5" />
				Report Settings
			</Card.Title>
			<Card.Description>
				Configure the appearance and content of your generated reports
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="space-y-6" use:enhance onsubmit={handleSubmit}>
				<!-- Logo Upload Section -->
				<div class="space-y-4">
					<h3 class="flex items-center gap-2 text-lg font-semibold">
						<ImageIcon class="h-5 w-5" />
						Report Logo
					</h3>

					<div class="flex flex-col items-center space-y-4">
						{#if logoPreview}
							<div class="relative">
								<img
									src={logoPreview}
									alt="Logo preview"
									class="max-h-32 max-w-xs rounded-lg border object-contain"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute -right-2 -top-2"
									onclick={removeLogo}
								>
									×
								</Button>
							</div>
						{:else}
							<div
								class="flex h-32 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed"
							>
								<div class="text-center">
									<ImageIcon class="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
									<p class="text-sm text-muted-foreground">No logo uploaded</p>
								</div>
							</div>
						{/if}

						<div class="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onclick={triggerLogoInput}
								class="flex items-center gap-2"
							>
								<Upload class="h-4 w-4" />
								{logoPreview ? 'Change Logo' : 'Upload Logo'}
							</Button>

							{#if logoPreview}
								<Button type="button" variant="outline" onclick={removeLogo}>Remove Logo</Button>
							{/if}
						</div>

						<input
							bind:this={logoFileInput}
							type="file"
							accept="image/*"
							class="hidden"
							onchange={handleLogoChange}
						/>

						<p class="text-center text-sm text-muted-foreground">
							Upload a logo that will appear in your reports. Recommended size: 300x100px or similar
							aspect ratio.
						</p>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-6">
					<!-- Company Name -->
					<Form.Field {form} name="nameCompany">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="flex items-center gap-2">
									<FileText class="h-4 w-4" />
									Company Name
								</Form.Label>
								<Input
									{...props}
									type="text"
									bind:value={$formData.nameCompany}
									placeholder="Enter your company name"
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>
							This name will appear in all generated reports
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Company Address -->
					<Form.Field {form} name="addressCompany">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="flex items-center gap-2">
									<FileText class="h-4 w-4" />
									Company Address
								</Form.Label>
								<Textarea
									{...props}
									bind:value={$formData.addressCompany}
									placeholder="Enter your company address"
									rows={3}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>
							This address will appear in all generated reports
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<!-- Preview Section -->
				<div class="rounded-lg border bg-muted/50 p-6">
					<h3 class="mb-4 font-semibold">Report Preview</h3>
					<div class="space-y-4 rounded-lg border bg-card p-6">
						<!-- Header with logo and company info -->
						<div class="flex items-start gap-4 border-b pb-4">
							{#if logoPreview}
								<img src={logoPreview} alt="Company logo" class="h-16 w-16 object-contain" />
							{:else}
								<div
									class="flex h-16 w-16 items-center justify-center rounded border border-dashed"
								>
									<ImageIcon class="h-6 w-6 text-muted-foreground" />
								</div>
							{/if}
							<div class="flex-1">
								<h2 class="text-xl font-bold">{$formData.nameCompany || 'Company Name'}</h2>
								<p class="text-sm text-muted-foreground">{$formData.addressCompany || 'Company Address'}</p>
							</div>
						</div>

						<!-- Sample content -->
						<div class="py-8 text-center text-muted-foreground">
							<p>--- Report Content ---</p>
							<p class="text-sm">Your report data will appear here</p>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-4">
					<Button type="submit" class="px-8" disabled={$submitting}>
						{#if $submitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							<span>Saving...</span>
						{:else}
							<span>Update Configuration</span>
						{/if}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
