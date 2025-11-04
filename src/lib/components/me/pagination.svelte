<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		totalRecords: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		isLoading?: boolean;
	}

	let {
		currentPage,
		totalPages,
		totalRecords,
		pageSize,
		onPageChange,
		isLoading = false
	}: Props = $props();

	const startRecord = $derived((currentPage - 1) * pageSize + 1);
	const endRecord = $derived(Math.min(currentPage * pageSize, totalRecords));

	function getVisiblePages(): number[] {
		const pages: number[] = [];
		const maxVisible = 5;
		const halfVisible = Math.floor(maxVisible / 2);

		let start = Math.max(1, currentPage - halfVisible);
		let end = Math.min(totalPages, start + maxVisible - 1);

		// Adjust start if we're near the end
		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	}

	const visiblePages = $derived(getVisiblePages());
	const showFirstPage = $derived(visiblePages[0] > 1);
	const showLastPage = $derived(visiblePages[visiblePages.length - 1] < totalPages);
</script>

{#if totalPages > 1}
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<!-- Record count - Hidden on mobile, shown on desktop -->
		<p class="hidden text-sm text-muted-foreground sm:block">
			Showing {startRecord} to {endRecord} of {totalRecords} results
		</p>
		
		<!-- Mobile: Compact version -->
		<p class="text-center text-xs text-muted-foreground sm:hidden">
			Page {currentPage} of {totalPages}
		</p>

		<div class="flex items-center justify-center gap-1 sm:gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1 || isLoading}
				class="gap-1"
			>
				<ChevronLeft class="h-4 w-4" />
				<span class="hidden sm:inline">Previous</span>
			</Button>

			<!-- Page numbers - hidden on mobile, shown on tablet/desktop -->
			<div class="hidden items-center gap-1 sm:flex">
				{#if showFirstPage}
					<Button variant="outline" size="sm" onclick={() => onPageChange(1)} disabled={isLoading}>
						1
					</Button>
					{#if visiblePages[0] > 2}
						<span class="px-1 text-muted-foreground sm:px-2">...</span>
					{/if}
				{/if}

				{#each visiblePages as page (page)}
					<Button
						variant={page === currentPage ? 'default' : 'outline'}
						size="sm"
						onclick={() => onPageChange(page)}
						disabled={isLoading}
						class="min-w-[2.5rem]"
					>
						{page}
					</Button>
				{/each}

				{#if showLastPage}
					{#if visiblePages[visiblePages.length - 1] < totalPages - 1}
						<span class="px-1 text-muted-foreground sm:px-2">...</span>
					{/if}
					<Button
						variant="outline"
						size="sm"
						onclick={() => onPageChange(totalPages)}
						disabled={isLoading}
						class="min-w-[2.5rem]"
					>
						{totalPages}
					</Button>
				{/if}
			</div>

			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || isLoading}
				class="gap-1"
			>
				<span class="hidden sm:inline">Next</span>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
{/if}
