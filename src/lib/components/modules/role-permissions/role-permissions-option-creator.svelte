<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { api } from '$lib/services/api';
	import { toast } from 'svelte-sonner';
	import { Loader2, Plus, Trash2 } from 'lucide-svelte';

	interface OptionNode {
		id: number;
		name: string;
		label?: string;
		uri?: string;
		order: number;
		children?: OptionNode[];
	}

	interface Props {
		optionsTree: OptionNode[];
		onCreated?: () => Promise<void> | void;
	}

	type OptionStatus = 'idle' | 'saving' | 'success' | 'error';

	interface NewOption {
		tempId: number;
		name: string;
		label: string;
		icon: string;
		uri: string;
		order: string;
		parentOptionId: string;
		status: OptionStatus;
		message?: string;
	}

	let { optionsTree = [], onCreated }: Props = $props();

	let tempIdCounter = 0;

	function createEmptyOption(): NewOption {
		return {
			tempId: ++tempIdCounter,
			name: '',
			label: '',
			icon: '',
			uri: '',
			order: '',
			parentOptionId: '',
			status: 'idle',
			message: undefined
		};
	}

	let newOptions = $state<NewOption[]>([createEmptyOption()]);
	let isSubmitting = $state(false);

	function flattenOptions(
		options: OptionNode[],
		depth = 0
	): { id: number; label: string; depth: number }[] {
		const flat: { id: number; label: string; depth: number }[] = [];
		for (const option of options) {
			flat.push({
				id: option.id,
				label: option.label || option.name,
				depth
			});
			if (option.children?.length) {
				flat.push(...flattenOptions(option.children, depth + 1));
			}
		}
		return flat;
	}

	const parentChoices = $derived(flattenOptions(optionsTree));

	function addOptionRow() {
		newOptions = [...newOptions, createEmptyOption()];
	}

	function removeOptionRow(tempId: number) {
		if (newOptions.length === 1) {
			newOptions = [createEmptyOption()];
			return;
		}
		newOptions = newOptions.filter((option) => option.tempId !== tempId);
	}

	function resetForm() {
		newOptions = [createEmptyOption()];
	}

	function setOptionStatus(tempId: number, status: OptionStatus, message?: string) {
		newOptions = newOptions.map((option) =>
			option.tempId === tempId ? { ...option, status, message } : option
		);
	}

	type OptionPayload = {
		id: number;
		name: string;
		label: string;
		icon: string;
		uri: string;
		order: number;
		parentOption: number | null;
	};

	function validateOption(option: NewOption): {
		valid: boolean;
		message?: string;
		payload?: OptionPayload;
	} {
		const name = option.name.trim();
		if (!name) {
			return { valid: false, message: 'Name is required.' };
		}

		const label = option.label.trim() || name;

		const icon = option.icon.trim();
		if (!icon) {
			return { valid: false, message: 'Icon is required.' };
		}

		let uri = option.uri.trim();
		if (!uri) {
			return { valid: false, message: 'URI is required.' };
		}
		if (!uri.startsWith('/')) {
			uri = `/${uri}`;
		}

		const orderValue = Number.parseInt(option.order, 10);
		if (Number.isNaN(orderValue) || orderValue < 0) {
			return { valid: false, message: 'Order must be a positive number.' };
		}

		let parentOption: number | null = null;
		if (option.parentOptionId) {
			const parsedParent = Number.parseInt(option.parentOptionId, 10);
			if (Number.isNaN(parsedParent)) {
				return { valid: false, message: 'Invalid parent option selected.' };
			}
			parentOption = parsedParent;
		}

		return {
			valid: true,
			payload: {
				id: 0,
				name,
				label,
				icon,
				uri,
				order: orderValue,
				parentOption
			}
		};
	}

	async function createOptions() {
		if (isSubmitting) return;

		const optionsToCreate: { option: NewOption; payload: OptionPayload }[] = [];

		for (const option of newOptions) {
			const { valid, message, payload } = validateOption(option);
			if (!valid || !payload) {
				setOptionStatus(option.tempId, 'error', message);
				continue;
			}
			setOptionStatus(option.tempId, 'idle');
			optionsToCreate.push({ option, payload });
		}

		if (optionsToCreate.length === 0) {
			toast.error('Complete the required fields before creating options.');
			return;
		}

		isSubmitting = true;
		const createdIds = new Set<number>();
		let encounteredError = false;

		for (const { option, payload } of optionsToCreate) {
			setOptionStatus(option.tempId, 'saving', 'Creating option...');
			try {
				await api.post('menu-management/options', payload);
				setOptionStatus(option.tempId, 'success', 'Option created successfully.');
				createdIds.add(option.tempId);
			} catch (error: any) {
				encounteredError = true;
				setOptionStatus(
					option.tempId,
					'error',
					error?.message || 'Failed to create option. Please try again.'
				);
			}
		}

		isSubmitting = false;

		if (createdIds.size > 0) {
			toast.success(
				createdIds.size === 1
					? 'Option created successfully.'
					: `${createdIds.size} options created successfully.`
			);
			newOptions = newOptions.filter((option) => !createdIds.has(option.tempId));
			if (newOptions.length === 0) {
				newOptions = [createEmptyOption()];
			}
			if (onCreated) {
				await onCreated();
			}
		}

		if (encounteredError) {
			toast.error('Some options could not be created. Please review the highlighted rows.');
		}
	}

	function getIndent(depth: number) {
		if (depth <= 0) return '';
		return `${'-'.repeat(depth * 2)} `;
	}
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<div>
			<Card.Title>Create Menu Options</Card.Title>
			<Card.Description>
				Define one or more options and send them to the menu-management API. Only creation is
				allowed from this panel.
			</Card.Description>
		</div>
		<Button
			type="button"
			variant="secondary"
			class="gap-2"
			onclick={addOptionRow}
			disabled={isSubmitting}
		>
			<Plus class="h-4 w-4" />
			Add option form
		</Button>
	</Card.Header>

	<Card.Content class="space-y-4">
		{#each newOptions as option, index (option.tempId)}
			<div class="space-y-4 rounded-lg border p-4">
				<div class="flex items-center justify-between">
					<div class="text-sm font-semibold">Option #{index + 1}</div>
					<div class="flex items-center gap-2">
						{#if option.status === 'success'}
							<Badge variant="secondary" class="bg-green-500/20 text-green-400">Created</Badge>
						{:else if option.status === 'saving'}
							<Badge variant="outline" class="gap-1">
								<Loader2 class="h-3.5 w-3.5 animate-spin" />
								Saving
							</Badge>
						{:else if option.status === 'error'}
							<Badge variant="outline" class="border-destructive/60 text-destructive">Error</Badge>
						{/if}
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onclick={() => removeOptionRow(option.tempId)}
							disabled={option.status === 'saving'}
							class="h-8 w-8 text-muted-foreground hover:text-destructive"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<label class="text-sm font-medium">
							Name <span class="text-destructive">*</span>
						</label>
						<Input
							placeholder="Analytics"
							bind:value={option.name}
							disabled={option.status === 'saving'}
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium">
							Label <span class="text-destructive">*</span>
						</label>
						<Input
							placeholder="What users will see"
							bind:value={option.label}
							disabled={option.status === 'saving'}
						/>
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<label class="text-sm font-medium">
							Icon <span class="text-destructive">*</span>
						</label>
						<Input
							placeholder="chart-line"
							bind:value={option.icon}
							disabled={option.status === 'saving'}
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium">
							URI <span class="text-destructive">*</span>
						</label>
						<Input
							placeholder="/analytics"
							bind:value={option.uri}
							disabled={option.status === 'saving'}
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium">
							Order <span class="text-destructive">*</span>
						</label>
						<Input
							type="number"
							min="0"
							placeholder="1"
							bind:value={option.order}
							disabled={option.status === 'saving'}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label class="text-sm font-medium">Parent option (optional)</label>
					<select
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={option.parentOptionId}
						disabled={option.status === 'saving'}
					>
						<option value="">No parent (root item)</option>
						{#each parentChoices as parent (parent.id)}
							<option value={parent.id}>
								{getIndent(parent.depth)}{parent.label}
							</option>
						{/each}
					</select>
				</div>

				{#if option.message}
					<p
						class={`text-sm ${option.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
					>
						{option.message}
					</p>
				{/if}
			</div>
		{/each}
	</Card.Content>

	<Card.Footer class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<p class="text-sm text-muted-foreground">
			Fill in the table above to queue as many options as necessary before sending them.
		</p>
		<div class="flex gap-2">
			<Button type="button" variant="outline" onclick={resetForm} disabled={isSubmitting}>
				Clear
			</Button>
			<Button type="button" class="gap-2" onclick={createOptions} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="h-4 w-4 animate-spin" />
					Sending...
				{:else}
					<Plus class="h-4 w-4" />
					Create options
				{/if}
			</Button>
		</div>
	</Card.Footer>
</Card.Root>
