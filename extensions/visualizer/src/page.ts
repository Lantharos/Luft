import type { Extension, PageSection } from '@luft/extension-api';

type Granted = 'wallpaper' | 'audio-levels';

export function describePage(visualizer: Extension<Granted>): void {
  const { t } = visualizer;
  visualizer.settingsPage.describe((): PageSection[] => [
    {
      title: t('now'),
      items: [{
        type: 'row',
        title: visualizer.audioLevels.playing ? t('moving') : t('resting'),
        description: visualizer.audioLevels.playing ? undefined : t('resting-detail'),
      }],
    },
    { title: t('look'), items: [{ setting: 'style' }, { setting: 'color' }, { setting: 'intensity' }, { setting: 'reach' }] },
    { title: t('where'), items: [{ setting: 'edges' }, { setting: 'displays' }] },
  ]);
  visualizer.audioLevels.onPlayingChanged(() => visualizer.settingsPage.refresh());
}
