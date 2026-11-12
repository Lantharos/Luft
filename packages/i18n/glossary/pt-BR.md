# Brazilian Portuguese

What is particular to Brazilian Portuguese, on top of [the rules every language shares](common.md). The agreed terms are in [pt-BR.tbx](pt-BR.tbx).

## Address

Address the reader as você, as every Brazilian desktop does: “Você pode alterar isso depois nas Configurações.” Never tu or o senhor. Often no person is needed: “Nenhuma notificação”. Drop seu and sua when the sentence is clear without them. Instructions take the imperative of você: “Pressione Super+Tab para ver todas as janelas.”

Use Brazilian words and spelling: tela, arquivo, baixar, usuário, compartilhar, excluir, salvar, mouse, contato, ação.

## Buttons and labels

- Buttons and menu items take the infinitive: “Salvar”, “Abrir”, “Cancelar”, “Fixar na barra de tarefas”. Some are fixed words: “Concluído”, “Avançar”, “Tentar novamente”, “Desfazer”.
- States are participles that agree: “Chave copiada”, “Rede conectada”.
- Lixeira takes a capital, as on Windows. A label named in a sentence keeps its capital and needs no quotation marks: “ative Não perturbe”.

## Typography

- Quotation marks “…”, with ‘…’ inside them.
- The dash is an em dash with spaces: “ — ”.
- The percent sign takes no space (“57%”); units do (“4,5 W”).
- Keys use the English names printed on ABNT2 keyboards: Ctrl, Alt, Shift, Enter, Esc, Backspace, Delete. Only the space bar is translated: Espaço.
- Write “e-mail” and “online”.

## Names

- Settings, Disks and Install Luft are Configurações, Discos and Instalar o Luft.
- Names are masculine and take the article: “o Luft”, “do Rover”, “o Rover está aberto”. When a name could read as an ordinary word, add the kind of thing: “o app Keys”, “o app Draft”.
- Start stays Start: “o menu Start”.

## Plurals

`one` covers 0 and 1, `other` the rest; `many`, for exact millions, is left out. Zero shows the singular unless English has an exact `[0]`, which you then translate: `[0] Nenhuma notificação`.

```ftl
notifications-count = { $count ->
    [one] { $count } notificação
   *[other] { $count } notificações
}
```

## Words

| English | Brazilian Portuguese | Not | Why |
| --- | --- | --- | --- |
| Settings | Configurações | Ajustes, Preferências | Windows and GNOME; Ajustes is Apple's |
| app | app, o | aplicativo | Shorter; what people, Apple and app stores say |
| board | quadro | board, tela | Plain Portuguese; tela is the screen |
| All windows | Todas as janelas | Visão de tarefas | What Luft calls the task view |
| notification center | central de notificações | centro de notificações | Windows and macOS |
| snap, snap layout | ajustar, layout de ajuste | encaixar | Windows' words |
| tray | bandeja do sistema | área de notificação | Widely known; it holds apps |
| pin, unpin | fixar, desafixar | anexar | Windows' words |
| workspace | espaço de trabalho | área de trabalho | Área de trabalho is the desktop |
| login screen | tela de login | tela de entrada | What people say |
| sign in, sign out | entrar, sair | fazer logon, encerrar sessão | Short; Windows and Google |
| delete | excluir | apagar, deletar | Windows and GNOME |
| search | pesquisar | buscar, procurar | Windows' word |
| Do Not Disturb | Não perturbe | Não incomodar | macOS, Android and GNOME |
| suspend, sleep | suspender | dormir, repouso | GNOME and Windows' power menu |
| Keep awake | Manter ativo | Manter acordado | Plain, no metaphor |
| passkey | chave de acesso | passkey | Apple, Google and Microsoft in Brazil |
| Keyring | Chaveiro | | GNOME and older macOS |
| encryption | criptografia | encriptação | Windows and common use |
| USB stick | pen drive | unidade flash USB | What Brazilians say |
| display | tela | monitor | Covers built-in screens; monitor only for an external one |
| passphrase | frase secreta | frase-senha | GNOME; apart from senha |
| input source | fonte de entrada | origem de entrada | GNOME |
| metered connection | conexão limitada | conexão tarifada | Windows |
| pair (Bluetooth) | parear | emparelhar | Android and everyday use |
| home folder | pasta pessoal | Início | GNOME |
| on-screen keyboard | teclado virtual | teclado na tela | Windows and GNOME |
| keyboard backlight | luz do teclado | luz de fundo do teclado | Fits the Quick settings tile |
| dark style | modo escuro, modo claro | estilo escuro | Matches the Quick settings tile |
