# European Portuguese

What is particular to European Portuguese, on top of [the rules every language shares](common.md). The agreed terms are in [pt.tbx](pt.tbx).

## Address

Prefer sentences without a person: «As atualizações são instaladas no próximo reinício», «Sem notificações». When the reader has to be addressed, use the third person singular without a pronoun, as Windows, macOS, GNOME and KDE do in Portugal: «Pode alterar isto mais tarde nas Definições.» Never você, tu or o senhor. Instructions take the formal imperative: «Prima Super+Tab para ver todas as janelas.», «Introduza a palavra-passe.»

Use European words and grammar only: ecrã, ficheiro, utilizador, partilhar, transferir, guardar, eliminar, rato, palavra-passe, câmara, «a carregar» rather than «carregando». Pronouns go where Portugal puts them: «Não foi possível ligá-lo».

## Buttons and labels

- Buttons and menu items take the infinitive: «Guardar», «Abrir», «Cancelar», «Afixar na barra de tarefas». A few are nouns or participles by convention: «Pausa», «Concluído», «Seguinte».
- Status words agree with what they describe: «Chave guardada», «Ficheiro guardado».
- Months and days are lowercase. A label named in a sentence keeps its capital and needs no quotation marks: «ative Não incomodar».

## Typography

- Quotation marks «…», with “…” inside them.
- The dash is an em dash with spaces, used sparingly.
- The percent sign takes no space, as Windows writes it («57%»); units do («4,5 W»).
- Keys mostly use the English names printed on Portuguese keyboards: Ctrl, Alt, Shift, Enter, Esc, Delete. The unlabelled ones are «Espaço» and «Retrocesso».

## Names

- Settings, Disks and Install Luft are Definições, Discos and Instalar o Luft, with the plural article in sentences: «nas Definições».
- Names take the article and are masculine: «o Luft», «no Rover», «o Rover está aberto». When the article sounds odd: «na aplicação Tern».
- Start stays Start: «o menu Start».

## Plurals

`one` is 1, `other` the rest; `many`, for exact millions, is left out. Luft uses the generic `pt` plural rules, which put 0 in `one`, but in Portugal zero takes the plural. So every count that can be 0 needs an exact `[0]` written for Portugal, with the plural or «Nenhum…»/«Sem…»:

```ftl
files-selected = { $count ->
    [0] Nenhum ficheiro selecionado
    [one] { $count } ficheiro selecionado
   *[other] { $count } ficheiros selecionados
}
```

## Words

| English | Portuguese | Not | Why |
| --- | --- | --- | --- |
| Settings | Definições | Configurações | Windows, macOS and GNOME in Portugal; Configurações is Brazilian |
| app | aplicação | app, aplicativo | Windows and GNOME; aplicativo is Brazilian |
| board | quadro | tabuleiro, tela | The plain word; tela is a Brazilian screen |
| All windows | Todas as janelas | Vista de tarefas | What Luft calls the task view |
| snap, snap layout | ajustar, esquema de ajuste | encaixar | Windows' words |
| tray | bandeja do sistema | área de notificação | KDE's word; it holds apps |
| pin, unpin | afixar, desafixar | fixar, prender | Windows' words |
| desktop | ambiente de trabalho | área de trabalho | Windows' word; área de trabalho is a workspace, as in GNOME |
| wallpaper | imagem de fundo | papel de parede | Windows' word; papel de parede is Brazilian |
| sign in, sign out | iniciar sessão, terminar sessão | entrar, fazer login | Windows and GNOME |
| shut down | encerrar | desligar | Windows' power menu |
| turn on, turn off | ativar, desativar | ligar, desligar | Windows' switches; ligar and desligar stay for devices, radios and the screen |
| delete | eliminar | apagar, excluir | Windows; excluir is Brazilian |
| undo | anular | desfazer | Windows and macOS in Portugal |
| trash | Lixo | Reciclagem | GNOME and macOS |
| encryption | encriptação | criptografia | Windows' word; criptografia is Brazilian |
| startup | arranque | inicialização | The European word |
| Keyring | Porta-chaves | Chaveiro | GNOME and macOS; chaveiro is Brazilian |
| clipboard | área de transferência | prancheta | Windows and GNOME |
| screenshot | captura de ecrã | captura de tela | European vocabulary |
| touchpad | painel tátil | touchpad | Windows' word |
| Fonts | Tipos de letra | Fontes | Windows' word; fonte is ambiguous |
| USB stick | pen USB | pendrive | What people in Portugal say |
| About | Acerca de | Sobre | Windows and macOS |
| dark style, light style | modo escuro, modo claro | estilo escuro | The Quick settings tile's name |
| input source | fonte de introdução | origem de entrada | GNOME's word |
| passphrase | frase de acesso | palavra-passe | Apart from the account password |
| driver | controlador | driver | Windows' word |
| metered connection | ligação tarifada | ligação limitada | Windows' word |
| browser | browser | navegador | What people in Portugal say |
| digits | algarismos | dígitos | The plain word for PINs and codes |
