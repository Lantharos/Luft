## Starting up

default-subject = Белешке
default-notebook = Белешке са часа
start-failed-title = Heft не може да отвори ваше свеске
start-failed-body = { $error }

## Toolbar

toolbar-label = Алати
toolbar-undo = Опозови
toolbar-redo = Понови
toolbar-eraser = Гумица
toolbar-add-page = Додај страну после ове
toolbar-zoom = Увеличање
toolbar-pen = { $name }
toolbar-pen-options = Промени ово перо

## Pens

pen-fountain = Налив-перо
pen-ballpoint = Хемијска
pen-highlighter = Маркер
pen-kind = Врста пера
pen-thickness = Дебљина
pen-color = Боја
pen-add = Сачувај као ново перо
pen-remove = Уклони ово перо
pen-color-black = Црна
pen-color-gray = Сива
pen-color-blue = Плава
pen-color-sky = Небескоплава
pen-color-red = Црвена
pen-color-orange = Наранџаста
pen-color-green = Зелена
pen-color-purple = Љубичаста
pen-color-yellow = Жута
pen-color-lime = Светлозелена
pen-color-pink = Розе
pen-color-cyan = Светлоплава
pen-color-other = Ваша боја

## Eraser

eraser-mode = Шта брише
eraser-strokes = Целе потезе
eraser-area = Само оно што додирне
eraser-size = Величина
eraser-small = Мала
eraser-medium = Средња
eraser-large = Велика

## Zoom

zoom-fit-width = По ширини
zoom-fit-page = Цела страна
zoom-actual = Стварна величина
zoom-in = Увеличај
zoom-out = Умањи
zoom-percent = { $percent } %

## Dialogs

dialog-cancel = Откажи
dialog-save = Сачувај
dialog-done = Готово

## Tabs

tabs-label = Отворене свеске
tabs-home = Сви предмети
tabs-close = Затвори { $name }

## Home

home-recent = Недавно писано
home-new-subject = Нови предмет
home-archive = Архива
home-trash = Отпад
home-pages = { $count ->
    [one] { $count } страна
    [few] { $count } стране
   *[other] { $count } страна
}
subject-options = Још за { $name }
subject-edit = Преименуј или промени боју
subject-archive = Архивирај
subject-unarchive = Врати из архиве
subject-trash = Премести у отпад
subject-trash-title = Да ли да се { $name } премести у отпад?
subject-trash-body = Његове свеске иду са њим. Из отпада може да се врати у року од 30 дана.
subject-new-page = Нова страна
subject-new-notebook = Нова свеска
subject-new-title = Нови предмет
subject-new-body = Сваки предмет добија једну свеску за почетак. Уџбеник или још свезака можете да додате кад год желите.
subject-edit-title = Предмет
subject-name = Назив
subject-name-example = Математика
subject-color = Боја
subject-create = Додај предмет
archive-title = Архива
archive-body = Предмети са којима сте завршили, на пример прошлогодишњи, склоњени у страну.
archive-restore = Врати
trash-title = Отпад
trash-body = Предмети и свеске остају овде 30 дана, а затим се бришу.
trash-empty = Отпад је празан
trash-restore = Врати
trash-delete = Обриши сада

## Notebooks

notebook-menu = Опције свеске
notebook-open = Отвори
notebook-trash = Премести у отпад
notebook-rename = Преименуј
notebook-rename-title = Преименовање свеске
notebook-paper = Папир
notebook-deleted-pages = Обрисане стране
notebook-name = Назив
notebook-name-example = Белешке са часа
notebook-new-title = Нова свеска у предмету { $subject }
notebook-create = Направи
page-of = Страна { $page } од { $pages }
deleted-pages-title = Обрисане стране
deleted-pages-body = Стране обрисане из ове свеске. Враћена страна се појављује тамо где је била.
deleted-pages-restore = Врати

## Paper

paper-title = Папир
paper-body = За сваку страну ове свеске која нема свој папир.
paper-template = Предложак
paper-blank = Празан
paper-lined = На линије
paper-grid = На квадратиће
paper-dotted = На тачкице
paper-cornell = Корнел
paper-staff = Нотни
paper-size = Величина
paper-letter = Letter
paper-infinite = Бескрајан
paper-color = Боја папира
paper-white = Бела
paper-cream = Крем
paper-dark = Тамна
paper-spacing = Размак
paper-millimetres = { $value } mm
paper-landscape = Положено

## Text and pictures

toolbar-type = Куцање
toolbar-picture = Додај слику
picture-choose-title = Додавање слике
picture-choose-filter = Слике
text-to-notes = Додај у белешке
format-heading = Наслов
format-bold = Подебљано
format-list = Листа
format-numbered = Нумерисана листа

## Search and the command palette

palette-placeholder = Пронађите предмет, свеску, одељак или речи
palette-empty = Нема поклапања
palette-subject = Предмет, почни нову страну
palette-new-page = Нова страна у овом предмету
palette-new-page-keys = Ctrl N
palette-export-pdf = Сачувај као PDF
palette-export-png = Сачувај ову страну као слику
palette-hit = { $subject } · { $notebook } · страна { $page }

## Exporting

notebook-export = Сачувај као PDF или слику
export-title = Чување копије
export-format = Формат
export-pdf = PDF
export-png = Слика
export-range = Шта се чува
export-this-page = Ова страна
export-this-section = Овај одељак
export-whole-notebook = Цела свеска
export-paper = Са линијама папира
export-save = Сачувај
export-pdf-filter = PDF документи
export-png-filter = PNG слике
export-page-name = { $notebook }, страна { $page }

## Settings

settings-title = Подешавања
settings-pressure = Притисак
settings-pressure-body = Повуците криву нагоре да лак додир пише дебље, или надоле да треба јаче притиснути.
settings-smoothing = Изглађивање
settings-smoothing-value = { $percent } %
settings-smoothing-body = Уједначава несигурне линије. Јаче изглађивање мало заостаје за пером.
settings-buttons = Дугмад на перу
settings-buttons-body = Шта бочна дугмад раде подешава се за све апликације у Луфтовим подешавањима пера. Дугме подешено да брише и овде брише, гумицом коју сте изабрали.
settings-buttons-open = Подешавања пера
settings-prediction = Цртај мало испред пера
settings-prediction-body = Погађа куда перо иде у наредних неколико милисекунди, па мастило стиже и брзо писање.
settings-finger-pans = Померање једним прстом
settings-finger-pans-body = Са два прста се увек помера и увеличава.
settings-touch-draws = Цртање прстом
settings-touch-draws-body = Кад је искључено, рука ослоњена на екран никад не оставља траг.

## Focus

focus-enter = Пиши преко целог екрана
focus-leave = Изађи из целог екрана

## Lasso

toolbar-lasso = Ласо
selection-label = Изабрано мастило
selection-actions = Шта урадити са изабраним мастилом
selection-copy = Копирај
selection-cut = Исеци
selection-duplicate = Удвостручи
selection-delete = Обриши

## Books

subject-add-book = Додај уџбеник
book-choose-title = Додавање уџбеника
book-choose-filter = PDF документи
notebook-insert-pdf = Додај стране из PDF-а
toolbar-text = Избор текста
text-actions = Изабрани текст
text-highlight = Маркирај
text-copy = Копирај
notebook-split = Отвори другу свеску поред ове
notebook-unsplit = Затвори ону поред
beside-title = Отварање поред
beside-body = Обе остају отворене једна поред друге, свака на својој страни, и следећи пут се враћају заједно.
import-title = { $count ->
    [one] У који предмет да се дода { $name }?
    [few] У који предмет да се додају { $count } уџбеника?
   *[other] У који предмет да се дода { $count } уџбеника?
}
import-body = Сваки постаје књига у којој можете да пишете и маркирате. Сам PDF остаје какав јесте.

## Page rail

rail-view = Приказ
rail-pages = Стране
rail-contents = Садржај
rail-label = Стране
rail-show = Прикажи стране
rail-hide = Сакриј стране
rail-page = Страна { $number }
rail-page-options = Још за страну { $number }
rail-add-before = Додај страну испред
rail-add-after = Додај страну после
rail-duplicate = Удвостручи
rail-section = Почни одељак овде
rail-delete = Обриши страну
section-new-title = Нови одељак
section-rename-title = Одељак
section-name = Назив одељка
section-create = Додај одељак

settings-toolbar = Алатке
settings-toolbar-top = Горе
settings-toolbar-side = Са стране
settings-toolbar-tablet = Кад се рачунар преклопи у таблет, алатке прелазе са стране и постају веће.
settings-toolbar-tablet-now = Рачунар је преклопљен у таблет, па су алатке са стране.
settings-pages = Стране
settings-pages-continuous = Једна за другом
settings-pages-single = Једна по једна
settings-pages-body = Једну по једну окрећете тако што наставите да померате преко краја стране или притиснете Page Down.

settings-handwriting = Претрага рукописа
settings-handwriting-body = Хефт чита оно што пишете руком на овом рачунару, ништа не излази с њега, па га претрага налази као откуцан текст. Чита у позадини док не пишете и чека док је батерија слаба. Зна српски, немачки, енглески и албански латиницом.
settings-handwriting-download = Преузми ({ $size })
settings-handwriting-downloading = Преузима се, { $percent } %
settings-handwriting-remove = Уклони
settings-handwriting-reading = { $pages ->
    [one] Чита се { $pages } страна
    [few] Читају се { $pages } стране
   *[other] Чита се { $pages } страна
}
settings-handwriting-done = Све написано може да се претражи.
settings-handwriting-waiting = Чека паузу у писању.
settings-handwriting-battery = Чека да се рачунар пуни или да батерија буде пунија.
settings-handwriting-missing = Ова верзија Луфта још не уме да чита рукопис.
settings-handwriting-failed = Преузимање није успело: { $error }

## Ruler

toolbar-ruler = Лењир
ruler-label = Лењир
ruler-angle = { $degrees }°

## Pages one at a time

page-previous = Претходна страна
page-next = Следећа страна

## Pictures

picture-choose = Изабери слике
picture-photo = Сликај
picture-crop = Исеци
crop-title = Исеци
crop-reset = Прикажи целу
crop-done = Исеци
camera-title = Сликај
camera-opening = Камера се отвара…
camera-refused = Хефт не сме да користи камеру. Можете то да дозволите у Подешавањима, под Приватност.
camera-failed = Камера се није отворила: { $error }
camera-take = Сликај
