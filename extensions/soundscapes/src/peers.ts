import type { Soundscapes } from './soundscapes.js';

/** Lets other extensions, such as a focus timer, start and stop the mix: `play` answers whether it was already playing. */
export function answerPeers({ extension, player }: Soundscapes): void {
  extension.peers.handle('play', () => {
    const wasPlaying = player.playing;
    player.play();
    return { wasPlaying };
  });
  extension.peers.handle('pause', () => player.pause());
}
