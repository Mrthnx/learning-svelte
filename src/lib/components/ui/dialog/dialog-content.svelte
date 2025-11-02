<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	type $$Props = DialogPrimitive.ContentProps;

	let { class: className, children, ...restProps }: $$Props = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay
		class="fixed inset-0 z-[9998] bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
	/>
	<DialogPrimitive.Content
		class={cn(
			'fixed top-[50%] left-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<DialogPrimitive.Close
			class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
