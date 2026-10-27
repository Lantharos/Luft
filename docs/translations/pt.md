# European Portuguese style guide

How Luft speaks Portuguese as written in Portugal, with the spelling of the 1990 agreement. The [glossary](../../packages/i18n/glossary/pt.tbx) has the agreed terms; Weblate shows them next to every string. Brazilian Portuguese is a separate translation (`pt-BR`); never mix the two.

## Address and tone

- Prefer sentences without a person at all: «As atualizações são instaladas no próximo reinício», «Sem notificações».
- When the reader has to be addressed, use the **third person singular without a pronoun**, as Windows, macOS, GNOME and KDE do in Portugal: «Pode alterar isto mais tarde nas Definições.» Never write «você» or «tu», and never «o senhor».
- Instructions in running text use the formal imperative (present subjunctive): «Prima Super+Tab para ver todas as janelas.», «Introduza a palavra-passe.», «Selecione uma rede.»
- Luft is friendly but calm. Short, plain sentences, no exclamation marks, no filler such as «Por favor» in every hint, no marketing words.
- Say what happens, not how it works inside.
- European vocabulary and grammar only: ecrã, ficheiro, utilizador, partilhar, transferir, guardar, eliminar, rato, palavra-passe, câmara, «a carregar» rather than «carregando». Pronouns follow European placement: «Levante o dedo e volte a colocá-lo», «Não foi possível ligá-lo».

## Buttons, menus and labels

- Buttons and menu items use the **infinitive**, as in Windows and macOS: «Guardar», «Abrir», «Cancelar», «Reiniciar», «Afixar na barra de tarefas».
- A few common buttons are nouns or participles by convention: «Pausa», «Concluído», «Seguinte».
- Switches and settings are nouns or short phrases: «Luz noturna», «Mostrar segundos».
- Headings and page names are nouns: «Notificações», «Privacidade».
- Status words agree with what they describe: «Chave guardada» but «Ficheiro guardado». When a short status stands alone, make it agree with the thing the screen is about.
- Keep labels short. Portuguese runs longer than English; if a button clips, look for a shorter word before abbreviating.

## Capitalization

Sentence case everywhere: only the first word and names take a capital letter. «Definições rápidas», not «Definições Rápidas». Following the 1990 agreement, months and days of the week are lowercase. In running text, Luft's parts are ordinary nouns: «a barra de tarefas», «o ecrã de bloqueio». A label referred to in a sentence keeps its capital letter and needs no quotation marks: «ative Não incomodar».

## Typography

- Quotation marks: «…», and “…” inside them.
- Apostrophe: ’, rarely needed.
- Ellipsis: one character, «…», with no space before it.
- Dash: the em dash with spaces, « — », used sparingly.
- No space before ? ! : ; or %. Write «57%», as Windows does. Units take a space: «4,5 W», «120 GB».
- Key names stay as printed on Portuguese keyboards, which mostly use the English names: Ctrl, Alt, Shift, Enter, Esc, Tab, Delete, Home, End. The unlabeled keys take their Portuguese names: «Espaço», «Retrocesso».

## Names

- Luft, Kestrel and the names of the apps stay as they are: Rover, Magpie, Mailman, Draft, Tern, Schelf, Barometer, Keys, Meet Luft, Helium.
- Settings, Disks and Install Luft are descriptions, so they are translated: Definições, Discos, Instalar o Luft. In a sentence the first two take the plural article: «nas Definições», «Abrir os Discos».
- Names take the definite article, as usual in Portugal, and are masculine: «o Luft», «no Rover», «do Kestrel», «o Rover está aberto». When the article would sound odd, put the kind of thing first: «na aplicação Tern».
- Start stays Start; say «o menu Start» when it needs a noun.

## Plurals

CLDR gives Portuguese three categories:

- `one`: 1 (and fractions below 2).
- `many`: exact multiples of a million (1 000 000, 2 000 000 …), which take «de»: «1 000 000 de ficheiros». Optional, since Luft rarely counts that high; leave it out unless the sentence needs it.
- `other`: everything else.

Luft's translation uses the generic `pt` rules, which put **0 into `one`**, as Brazilian Portuguese does. In Portugal, zero takes the plural. So every count selector where 0 can occur needs an exact `[0]` variant written for Portugal: the plural, or «Nenhum…»/«Sem…» when that reads better. Without it, 0 would show the singular. Always keep `{ $count }` in the other variants and keep `*[other]` as the default:

```ftl
files-selected = { $count ->
    [0] Nenhum ficheiro selecionado
    [one] { $count } ficheiro selecionado
   *[other] { $count } ficheiros selecionados
}
windows-open = { $count ->
    [0] { $count } janelas abertas
    [one] { $count } janela aberta
   *[other] { $count } janelas abertas
}
```

When English already has an exact `[0]` variant, keep it and translate it: `[0] Sem notificações`. Skip `[0]` only where the count can't be 0.

## Dates, numbers and units

Never write a date, time or number format into a translation. They come from the region chosen in Settings and are filled into the placeables. If a message has `{ $date }` or `{ $size }`, leave it as it is and build the sentence around it, so that its gender and article don't matter: «Última verificação: { $date }».

## Decisions

| English | Portuguese | Instead of | Why |
| --- | --- | --- | --- |
| you | third person, no pronoun | você, tu | Windows, macOS, GNOME and KDE in Portugal |
| Settings | Definições | Configurações, Preferências | Windows, macOS and GNOME in Portugal; Configurações is Brazilian |
| app | aplicação | app, aplicativo | Windows and GNOME; aplicativo is Brazilian |
| board | quadro | tabuleiro, tela | Plain word for a board; tela is a Brazilian screen |
| All windows | Todas as janelas | Vista de tarefas | That's what Luft calls the task view |
| snap, snap layout | ajustar, esquema de ajuste | encaixar, prender | Windows' words |
| tray | bandeja do sistema | área de notificação | KDE's word; it holds apps, not notifications |
| pin, unpin | afixar, desafixar | fixar, prender | Windows' words |
| desktop | ambiente de trabalho | área de trabalho | Windows' word; área de trabalho is a workspace, as in GNOME |
| wallpaper | imagem de fundo | papel de parede | Windows' word; papel de parede is Brazilian usage |
| sign in, sign out | iniciar sessão, terminar sessão | entrar, sair, fazer login | Windows and GNOME |
| shut down | encerrar | desligar | Windows' power menu; desligar is for devices and radios |
| turn on, turn off | ativar, desativar | ligar, desligar | Windows' switches; ligar and desligar stay for devices, radios and the screen |
| delete | eliminar | apagar, excluir | Windows; excluir is Brazilian |
| undo | anular | desfazer | Windows and macOS in Portugal |
| trash | Lixo | Reciclagem | GNOME and macOS; reads naturally in a sentence |
| encryption | encriptação | criptografia, cifragem | Windows' word; criptografia is Brazilian |
| startup | arranque | inicialização, boot | European word |
| passkey | chave de acesso | passkey, chave-passe | Windows and Google |
| Keyring | Porta-chaves | Chaveiro | GNOME and macOS; chaveiro is Brazilian |
| clipboard | área de transferência | prancheta | Windows and GNOME |
| screenshot | captura de ecrã | captura de tela | European vocabulary |
| mouse | rato | mouse | European vocabulary |
| touchpad | painel tátil | touchpad | Windows' word |
| Fonts | Tipos de letra | Fontes | Windows' word; fonte is ambiguous |
| USB stick | pen USB | pendrive | What people in Portugal say |
| About | Acerca de | Sobre | Windows and macOS |
| dark style, light style | modo escuro, modo claro | estilo escuro | The Quick settings tile's name |
| input source | fonte de introdução | origem de entrada | GNOME's word; método de introdução stays for input methods |
| passphrase | frase de acesso | frase-passe, palavra-passe | Keeps the disk passphrase apart from the account password |
| driver | controlador | driver | Windows' word |
| metered connection | ligação tarifada | ligação limitada | Windows' word |
| browser | browser | navegador | Windows; what people in Portugal say |
| digits | algarismos | dígitos | Plain European word for PINs and codes |
| internet | internet, lowercase | Internet | A common noun in running text |
