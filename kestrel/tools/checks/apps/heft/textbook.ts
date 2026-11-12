import type {Block} from '../lib/paper.js';

const heading = (text: string): Block => ({text, size: 19, bold: true, after: 16});
const subheading = (text: string): Block => ({text, size: 12.5, bold: true, after: 6});
const body = (text: string): Block => ({text, size: 10.5, after: 9});

export const HIGHLIGHTED = 3;

export const CHAPTER: Block[][] = [
  [
    heading('3. Shtypshkronja e Gutenbergut'),
    body('Rreth vitit 1450, Johannes Gutenberg ndërtoi në Majnc një shtyp me shkronja metalike të lëvizshme. Çdo shkronjë derdhej veçmas në një kallëp dhe mund të përdorej shumë herë, ndaj faqet radhiteshin shpejt dhe me pak gabime.'),
    body('Para kësaj, librat kopjoheshin me dorë, kryesisht në manastire. Një kopjues i vetëm punonte me muaj për një libër të vetëm, prandaj librat ishin të rrallë dhe aq të shtrenjtë sa vetëm kisha, oborret dhe pak familje të pasura mund t’i blinin.'),
    body('Bibla e Gutenbergut, e shtypur rreth vitit 1455, ishte libri i parë i madh i shtypur në Evropë. Nga ajo u bënë rreth 180 kopje, një pjesë në pergamenë e pjesa tjetër në letër.'),
    subheading('Përhapja e shtypshkronjës'),
    body('Mjeshtrit që mësuan zanatin në Majnc hapën shtypshkronja në qytete të tjera. Brenda pesëdhjetë vjetësh, shtypshkronja u përhap në më shumë se 250 qytete të Evropës, nga Venediku e Parisi deri në Krakov. Deri në vitin 1500 ishin shtypur mbi tetë milionë libra.'),
    body('Libri u bë më i lirë dhe më shumë njerëz mësuan të lexonin. Idetë e Rilindjes qarkullonin më shpejt se kurrë më parë, dhe dijetarët në vende të ndryshme mund të lexonin të njëjtin tekst, pa gabimet që sillte kopjimi me dorë.'),
    body('Shtypshkronja ndikoi edhe në gjuhët. Gjithnjë e më shumë libra botoheshin në gjuhët që flitnin njerëzit, e jo vetëm në latinisht, dhe kjo i ndihmoi gjuhët e shkruara të merrnin trajtë të njëjtë.'),
  ],
  [
    subheading('Libri i parë shqip'),
    body('Libri i parë i shtypur në gjuhën shqipe është «Meshari» i Gjon Buzukut, i botuar në vitin 1555. Ai përmban përkthimin e lutjeve dhe të pjesëve të meshës, dhe sot ruhet vetëm një kopje e tij, në Bibliotekën e Vatikanit.'),
    body('Gjuha e Mesharit tregon se shqipja ishte shkruar edhe më herët, sepse drejtshkrimi i tij është i qëndrueshëm dhe i menduar mirë.'),
    subheading('Pyetje'),
    body('1. Pse ishin librat të rrallë dhe të shtrenjtë para shtypshkronjës?\n2. Çfarë e bënte shtypin e Gutenbergut më të shpejtë se kopjimin me dorë?\n3. Si ndikoi shtypshkronja në përhapjen e ideve të Rilindjes?\n4. Pse është i rëndësishëm Meshari për historinë e gjuhës shqipe?'),
  ],
];
