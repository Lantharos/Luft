import Bell from '@lucide/svelte/icons/bell';
import Bomb from '@lucide/svelte/icons/bomb';
import Cat from '@lucide/svelte/icons/cat';
import Crown from '@lucide/svelte/icons/crown';
import Dog from '@lucide/svelte/icons/dog';
import Drum from '@lucide/svelte/icons/drum';
import Flame from '@lucide/svelte/icons/flame';
import Ghost from '@lucide/svelte/icons/ghost';
import Heart from '@lucide/svelte/icons/heart';
import Laugh from '@lucide/svelte/icons/laugh';
import Megaphone from '@lucide/svelte/icons/megaphone';
import Music from '@lucide/svelte/icons/music';
import PartyPopper from '@lucide/svelte/icons/party-popper';
import Skull from '@lucide/svelte/icons/skull';
import Swords from '@lucide/svelte/icons/swords';
import Trophy from '@lucide/svelte/icons/trophy';
import Volume2 from '@lucide/svelte/icons/volume-2';
import Zap from '@lucide/svelte/icons/zap';
import type { Component } from 'svelte';

export const ICONS: Record<string, Component> = {
	bell: Bell, bomb: Bomb, cat: Cat, crown: Crown, dog: Dog, drum: Drum, flame: Flame, ghost: Ghost, heart: Heart, laugh: Laugh,
	megaphone: Megaphone, music: Music, party: PartyPopper, skull: Skull, swords: Swords, trophy: Trophy, volume: Volume2, zap: Zap
};

export const COLORS: Record<string, string> = {
	sand: '#b89b6a', clay: '#b4694a', rose: '#b5586f', plum: '#7f5a97', sky: '#4f86a8', sea: '#3f8f88', moss: '#6d8a45', slate: '#6c6f7d'
};
