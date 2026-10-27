# Brazilian Portuguese style guide

How Luft speaks Brazilian Portuguese. The [glossary](../../packages/i18n/glossary/pt-BR.tbx) has the agreed terms; Weblate shows them next to every string. European Portuguese is a separate translation with its own words; don't borrow from it.

## Address and tone

- Address the reader as **você**, as Windows, macOS, GNOME and KDE all do in Brazilian Portuguese: “Você pode alterar isso depois nas Configurações.” Never “tu”, never “o senhor”.
- Often no person is needed at all: “As atualizações serão instaladas na próxima reinicialização”, “Nenhuma notificação” for “You have no notifications”. Drop “seu” and “sua” when the sentence is clear without them.
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no “por favor” at the start of every hint, no marketing words.
- Say what happens, not how it works inside.
- Brazilian vocabulary and spelling: tela, arquivo, baixar, usuário, compartilhar, excluir, salvar, mouse, registro, contato, ação, ótimo.

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as every Brazilian desktop does: “Salvar”, “Abrir”, “Cancelar”, “Reiniciar”, “Fixar na barra de tarefas”.
- Some buttons are fixed words: “Concluído”, “Avançar”, “Tentar novamente”, “Desfazer”.
- Switches and settings are nouns or short phrases: “Luz noturna”, “Mostrar segundos”.
- Headings and page names are nouns: “Notificações”, “Privacidade”.
- Instructions in running text use the imperative of você: “Pressione Super+Tab para ver todas as janelas.” “Clique”, “Escolha”, “Toque”, “Coloque”.
- States are past participles agreeing with what they describe: “Chave copiada”, “Bluetooth desativado”, “Rede conectada”.
- Keep labels short. Portuguese runs about a quarter longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. “Configurações rápidas”, not “Configurações Rápidas”. Luft's parts are ordinary nouns in running text: “a barra de tarefas”, “a tela de bloqueio”, “o quadro”. A label referred to in a sentence keeps its capital letter and needs no quotation marks: “ative Não perturbe”. Lixeira is written with a capital, as on Windows.

## Typography

- Quotation marks: “…”, and ‘…’ inside them.
- Apostrophe: ’, rarely needed.
- Ellipsis: one character, “…”, with no space before it: “Carregando…”.
- Dash: the em dash with spaces, “ — ”.
- No space before punctuation. The percent sign follows the number with no space: “57%”. Units take a space: “4,5 W”.
- Key names follow Brazilian ABNT2 keyboards, which print the English names: Ctrl, Alt, Shift, Enter, Esc, Tab, Backspace, Delete, Home, End, Page Up, Page Down. Only the space bar is translated, as “Espaço”.
- Write “e-mail” and “online”.

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Configurações, Discos, Instalar o Luft.
- Names are masculine and take the article like any noun: “o Luft”, “do Rover”, “no Tern”, “o Rover está aberto”. When a name could be read as an ordinary word, add the kind of thing: “o app Keys”, “o app Draft”.
- Start stays Start; in running text say “o menu Start”.

## Plurals

Brazilian Portuguese uses `one` for 0 and 1, and `other` for everything else. The `many` category only covers exact multiples of a million, where Portuguese says “1 milhão de arquivos”; Luft's counts don't get there, so leave it out. Always keep `{ $count }` in every variant and `*[other]` as the default:

```ftl
notifications-count = { $count ->
    [one] { $count } notificação
   *[other] { $count } notificações
}
```

Because 0 falls under `one`, “0 notificação” is what a count of zero shows unless English has an exact `[0]` variant. When it does, keep it and translate it: `[0] Nenhuma notificação`.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it: “Última verificação: { $date }”.

## Decisions

| English | Brazilian Portuguese | Instead of | Why |
| --- | --- | --- | --- |
| you | você, or no person | tu, o senhor | Every Brazilian desktop |
| Settings | Configurações | Ajustes, Preferências | Windows and GNOME; Ajustes is Apple's |
| app | app, o | aplicativo | Shorter, what people say and what Apple and app stores use |
| board | quadro | board, tela | Plain Portuguese; “tela” is the screen |
| All windows | Todas as janelas | Visão de tarefas | That's what Luft calls the task view |
| notification center | central de notificações | centro de notificações | Windows and macOS |
| snap, snap layout | ajustar, layout de ajuste | encaixar | Windows' words |
| tray | bandeja do sistema | área de notificação | Widely known; it holds apps, not notifications |
| pin, unpin | fixar, desafixar | anexar | Windows' words |
| workspace | espaço de trabalho | área de trabalho | Área de trabalho is the desktop |
| login screen | tela de login | tela de entrada | What people say; matches “Login na rede” |
| sign in, sign out | entrar, sair | fazer logon, encerrar sessão | Short buttons, Windows and Google |
| delete | excluir | apagar, deletar | Windows and GNOME |
| search | pesquisar | buscar, procurar | Windows' word |
| Do Not Disturb | Não perturbe | Não incomodar | macOS, Android and GNOME |
| suspend, sleep | suspender | dormir, repouso | GNOME and Windows' power menu |
| Keep awake | Manter ativo | Manter acordado | Plain, no metaphor |
| passkey | chave de acesso | passkey, chave-mestra | Apple, Google and Microsoft in Brazil |
| Keyring | Chaveiro | Chaveiro de chaves | GNOME and older macOS |
| encryption | criptografia | encriptação, cifragem | Windows and common use in Brazil |
| USB stick | pen drive | unidade flash USB | What Brazilians say |
| display | tela | monitor, vídeo | Covers built-in screens too; monitor only for an external one |
| Wi-Fi | Wi-Fi | rede sem fio | What Brazilians say; “sem fio” only in descriptions |
| passphrase | frase secreta | senha longa, frase-senha | GNOME; keeps it apart from senha |
| input source | fonte de entrada | origem de entrada | GNOME |
| metered connection | conexão limitada | conexão tarifada | Windows |
| pair (Bluetooth) | parear | emparelhar | Android and everyday use |
| home folder | pasta pessoal | Início, home | GNOME |
| on-screen keyboard | teclado virtual | teclado na tela | Windows and GNOME |
| sticky, slow, bounce keys | Teclas de aderência, Teclas lentas, Teclas de repercussão | | Windows and GNOME |
| keyboard backlight | luz do teclado | luz de fundo do teclado | Short enough for the quick settings tile |
| dark style | modo escuro, modo claro | estilo escuro | Matches the quick settings tile |
