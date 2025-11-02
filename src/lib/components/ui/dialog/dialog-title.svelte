<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = DialogPrimitive.TitleProps;

	let { class: className, children, ...restProps }: $$Props = $props();
</script>

<DialogPrimitive.Title
	class={cn('text-lg leading-none font-semibold tracking-tight', className)}
	{...restProps}
>
	{@render children?.()}
</DialogPrimitive.Title>
