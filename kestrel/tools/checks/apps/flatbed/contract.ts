import type {Block} from '../lib/paper.js';

const title = (text: string): Block => ({text, size: 24, bold: true, after: 26, align: 'center'});
const article = (text: string): Block => ({text, size: 15, bold: true, after: 6});
const body = (text: string): Block => ({text, size: 14.5, after: 16});

export const CONTRACT: Block[][] = [
  [
    title('Kontratë qiraje'),
    body('Lidhur më 3 nëntor 2026 në Prishtinë, ndërmjet:'),
    body('Qiradhënësit: Arben Krasniqi, Rr. Agim Ramadani 14, Prishtinë\nQiramarrëses: Mara Lindqvist, Rr. Nëna Terezë 22, Prishtinë'),
    article('Neni 1. Objekti i kontratës'),
    body('Qiradhënësi i jep me qira qiramarrëses banesën në katin e dytë të ndërtesës në Rr. Agim Ramadani 14, me sipërfaqe 68 m², me dy dhoma, kuzhinë, banjë dhe ballkon. Banesa jepet e mobiluar, sipas listës në shtojcën e kësaj kontrate.'),
    article('Neni 2. Kohëzgjatja'),
    body('Kontrata lidhet për një vit, nga 1 dhjetori 2026 deri më 30 nëntor 2027. Ajo mund të vazhdohet me marrëveshje të dyanshme, me shkrim, së paku 30 ditë para përfundimit.'),
    article('Neni 3. Qiraja'),
    body('Qiraja mujore është 350 € dhe paguhet deri më datën 5 të çdo muaji në llogarinë bankare të qiradhënësit. Për çdo pagesë qiradhënësi lëshon fletëpagesë.'),
    article('Neni 4. Depozita'),
    body('Në ditën e nënshkrimit qiramarrësja paguan një depozitë prej 350 €. Depozita i kthehet brenda 15 ditëve pas përfundimit të kontratës, nëse banesa lihet në gjendje të rregullt.'),
  ],
  [
    article('Neni 5. Shpenzimet'),
    body('Rryma, uji, ngrohja, mbeturinat dhe interneti paguhen nga qiramarrësja sipas faturave mujore. Shpenzimet e përbashkëta të ndërtesës i paguan qiradhënësi.'),
    article('Neni 6. Mirëmbajtja'),
    body('Qiramarrësja e mban banesën me kujdes dhe i paguan riparimet e vogla që vijnë nga përdorimi i përditshëm. Defektet më të mëdha, si në instalimet e ujit, të rrymës ose të ngrohjes, qiradhënësi i rregullon brenda 14 ditëve nga njoftimi.'),
    article('Neni 7. Ndryshimet në banesë'),
    body('Pa pëlqimin me shkrim të qiradhënësit, qiramarrësja nuk bën ndryshime në banesë dhe nuk e jep atë me qira një personi të tretë.'),
    article('Neni 8. Hyrja në banesë'),
    body('Qiradhënësi hyn në banesë vetëm me njoftim paraprak prej së paku 24 orësh, përveç në raste urgjente.'),
    article('Neni 9. Ndërprerja'),
    body('Secila palë mund ta ndërpresë kontratën me njoftim me shkrim 30 ditë më parë. Nëse qiraja nuk paguhet për dy muaj radhazi, qiradhënësi mund ta ndërpresë kontratën menjëherë.'),
  ],
  [
    article('Neni 10. Dorëzimi i banesës'),
    body('Në përfundim të kontratës, qiramarrësja ia dorëzon qiradhënësit banesën, çelësat dhe inventarin, në gjendjen në të cilën i ka marrë, duke llogaritur konsumin e zakonshëm.'),
    article('Neni 11. Dispozitat përfundimtare'),
    body('Për çështjet që nuk rregullohen me këtë kontratë zbatohen dispozitat e ligjit në fuqi. Për çdo mosmarrëveshje palët së pari përpiqen ta zgjidhin me marrëveshje, e pastaj është kompetente gjykata në Prishtinë.'),
    body('Kontrata është hartuar në dy kopje të njëjta, nga një për secilën palë.'),
    {text: 'Prishtinë, 3 nëntor 2026', size: 14.5, after: 80},
    {text: '______________________                    ______________________\nQiradhënësi                                                 Qiramarrësja', size: 14.5},
  ],
];
