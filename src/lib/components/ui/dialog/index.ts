import { Dialog as DialogPrimitive } from 'bits-ui';

import Content from './dialog-content.svelte';
import Description from './dialog-description.svelte';
import Footer from './dialog-footer.svelte';
import Header from './dialog-header.svelte';
import Title from './dialog-title.svelte';
import Root from './dialog.svelte';

const Trigger = DialogPrimitive.Trigger;
const Portal = DialogPrimitive.Portal;
const Close = DialogPrimitive.Close;

export {
	Root,
	Content,
	Description,
	Footer,
	Header,
	Title,
	Trigger,
	Portal,
	Close,
	Root as Dialog,
	Content as DialogContent,
	Description as DialogDescription,
	Footer as DialogFooter,
	Header as DialogHeader,
	Title as DialogTitle,
	Trigger as DialogTrigger,
	Portal as DialogPortal,
	Close as DialogClose
};
