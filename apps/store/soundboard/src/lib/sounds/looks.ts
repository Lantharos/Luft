import Bell from '@luft/symbols/icons/bell';
import Bomb from '@luft/symbols/icons/bomb';
import Cat from '@luft/symbols/icons/cat';
import Crown from '@luft/symbols/icons/crown';
import Dog from '@luft/symbols/icons/dog';
import Drum from '@luft/symbols/icons/drum';
import Flame from '@luft/symbols/icons/flame';
import Ghost from '@luft/symbols/icons/ghost';
import Heart from '@luft/symbols/icons/heart';
import Laugh from '@luft/symbols/icons/laugh';
import Megaphone from '@luft/symbols/icons/megaphone';
import Music from '@luft/symbols/icons/music';
import PartyPopper from '@luft/symbols/icons/party-popper';
import Skull from '@luft/symbols/icons/skull';
import Swords from '@luft/symbols/icons/swords';
import Trophy from '@luft/symbols/icons/trophy';
import Volume2 from '@luft/symbols/icons/volume-2';
import Zap from '@luft/symbols/icons/zap';
import type { Component } from 'svelte';

export const ICONS: Record<string, Component> = {
	bell: Bell, bomb: Bomb, cat: Cat, crown: Crown, dog: Dog, drum: Drum, flame: Flame, ghost: Ghost, heart: Heart, laugh: Laugh,
	megaphone: Megaphone, music: Music, party: PartyPopper, skull: Skull, swords: Swords, trophy: Trophy, volume: Volume2, zap: Zap
};

export const COLORS: Record<string, string> = {
	sand: '#b89b6a', clay: '#b4694a', rose: '#b5586f', plum: '#7f5a97', sky: '#4f86a8', sea: '#3f8f88', moss: '#6d8a45', slate: '#6c6f7d'
};
