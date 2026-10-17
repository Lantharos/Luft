export interface Question {
	question: string;
	answer: string;
}

export const faq: Question[] = [
	{
		question: 'Does it cost anything?',
		answer: 'No. Luft is free and open source, and so are its apps.'
	},
	{
		question: 'Will it run on my computer?',
		answer:
			'If it is a 64-bit PC with UEFI from the last ten years or so, very likely. Luft needs at least 32 GB of space. A TPM is optional and lets an encrypted disk unlock by itself. Computers with NVIDIA graphics get an edition with NVIDIA’s own driver.'
	},
	{
		question: 'Can I keep Windows?',
		answer:
			'Yes. Luft can live next to Windows and you choose which one starts. Meet Luft makes room with Windows’ own tools, so it works with BitLocker on, and it can take everything back out if you change your mind.'
	},
	{
		question: 'Can I try it before installing?',
		answer:
			'Yes. Meet Luft restarts into Luft once, without installing anything, and the next restart is back in Windows or your Linux. A USB stick works the same way.'
	},
	{
		question: 'What about my apps?',
		answer:
			'Schelf installs apps from Flathub and AppImages, and keeps them up to date. Helium comes as the browser and can be swapped for any other. Command-line tools go into a Toolbox container that Schelf manages too.'
	},
	{
		question: 'How do updates work?',
		answer:
			'The whole system updates at once, in the background, and switches over at the next restart. If something isn’t right, the version before is one choice away when the computer starts.'
	},
	{
		question: 'Is it ready?',
		answer:
			'Luft is in testing. Nightly builds come out whenever something changes, and the first release, Alizé, follows once it’s stable. Computers installed from a nightly build keep getting nightly updates.'
	}
];
