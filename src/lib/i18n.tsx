import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { enUS, es, fr, pt, type Locale } from "date-fns/locale";

export const LANGS = [
  { id: "fr", label: "Français", flag: "FR" },
  { id: "en", label: "English", flag: "EN" },
  { id: "sw", label: "Kiswahili", flag: "SW" },
  { id: "es", label: "Español", flag: "ES" },
  { id: "pt", label: "Português", flag: "PT" },
  { id: "ln", label: "Lingála", flag: "LN" },
] as const;
export type Lang = (typeof LANGS)[number]["id"];

export const DATE_LOCALES: Record<Lang, Locale> = { fr, en: enUS, sw: enUS, es, pt, ln: fr };

// French text → [en, sw, es, pt, ln]
const D: Record<string, [string, string, string, string, string]> = {
  "Menu": ["Menu", "Menyu", "Menú", "Menu", "Menyu"],
  "Ouvrir le menu": ["Open menu", "Fungua menyu", "Abrir menú", "Abrir menu", "Fungola menyu"],
  "Conversation WhatsApp": ["WhatsApp conversation", "Mazungumzo ya WhatsApp", "Conversación por WhatsApp", "Conversa no WhatsApp", "Lisolo na WhatsApp"],
  "Conversation indisponible": ["Conversation unavailable", "Mazungumzo hayapatikani", "Conversación no disponible", "Conversa indisponível", "Lisolo ezali te"],
  "Contact indisponible, réessayez.": ["Contact unavailable, please retry.", "Mawasiliano hayapatikani, jaribu tena.", "Contacto no disponible, inténtalo de nuevo.", "Contacto indisponível, tente novamente.", "Ekoki kosimba te, meka lisusu."],
  "Chargement…": ["Loading…", "Inapakia…", "Cargando…", "A carregar…", "Ezali koya…"],
  "Accueil": ["Home", "Nyumbani", "Inicio", "Início", "Ebandeli"],
  "Catalogue": ["Catalogue", "Katalogi", "Catálogo", "Catálogo", "Katalógi"],
  "Langue": ["Language", "Lugha", "Idioma", "Idioma", "Monoko"],
  "Votre intermédiaire unique pour l'immobilier, les séjours, les événements, le logement étudiant, l'informatique, la mode et les équipements.": [
    "Your single intermediary for real estate, stays, events, student housing, computers, fashion and equipment.",
    "Mpatanishi wako pekee kwa mali isiyohamishika, malazi, matukio, makazi ya wanafunzi, kompyuta, mitindo na vifaa.",
    "Tu intermediario único para inmuebles, estancias, eventos, vivienda estudiantil, informática, moda y equipos.",
    "O seu intermediário único para imóveis, estadias, eventos, alojamento estudantil, informática, moda e equipamentos.",
    "Moyokanisi na yo se moko mpo na bandako, bafandeli, bafɛti, bandako ya bayekoli, ordinatɛrɛ, mode mpe bisaleli.",
  ],
  "Toutes les demandes sont traitées directement par l'équipe Inkinet.": [
    "All requests are handled directly by the Inkinet team.",
    "Maombi yote yanashughulikiwa moja kwa moja na timu ya Inkinet.",
    "Todas las solicitudes son gestionadas directamente por el equipo Inkinet.",
    "Todos os pedidos são tratados diretamente pela equipa Inkinet.",
    "Masɛngi nyonso esalemaka mbala moko na ekipi ya Inkinet.",
  ],
  "Disponible": ["Available", "Inapatikana", "Disponible", "Disponível", "Ezali"],
  "En réserve": ["On hold", "Imehifadhiwa", "Reservado", "Reservado", "Ebombami"],
  "Rupture de stock": ["Out of stock", "Imeisha", "Agotado", "Esgotado", "Esili"],
  "Vendu / Occupé": ["Sold / Occupied", "Imeuzwa / Imechukuliwa", "Vendido / Ocupado", "Vendido / Ocupado", "Eteki / Ezwami"],
  "Neuf": ["New", "Mpya", "Nuevo", "Novo", "Ya sika"],
  "Occasion": ["Used", "Iliyotumika", "Usado", "Usado", "Ya kosalela"],
  "Neuf & Occasion": ["New & Used", "Mpya & Iliyotumika", "Nuevo y Usado", "Novo e Usado", "Ya sika & Ya kosalela"],
  "Prix sur demande": ["Price on request", "Bei kwa ombi", "Precio a consultar", "Preço sob consulta", "Ntalo na kosɛnga"],
  // categories
  "Immobilier & Terrains": ["Real Estate & Land", "Nyumba & Viwanja", "Inmuebles y Terrenos", "Imóveis e Terrenos", "Bandako & Mabele"],
  "Immobilier": ["Real estate", "Nyumba", "Inmuebles", "Imóveis", "Bandako"],
  "À vendre": ["For sale", "Inauzwa", "En venta", "À venda", "Ya koteka"],
  "À louer": ["For rent", "Ya kukodisha", "En alquiler", "Para alugar", "Ya kofutela"],
  "Demander une visite": ["Request a visit", "Omba kutembelea", "Solicitar una visita", "Pedir uma visita", "Kosɛnga kotala"],
  "Hébergement & Séjours": ["Accommodation & Stays", "Malazi & Makazi", "Alojamiento y Estancias", "Alojamento e Estadias", "Bafandeli & Mobembo"],
  "Hébergement": ["Accommodation", "Malazi", "Alojamiento", "Alojamento", "Bafandeli"],
  "Hôtels": ["Hotels", "Hoteli", "Hoteles", "Hotéis", "Ba otɛlɛ"],
  "Auberges & Résidences": ["Hostels & Residences", "Nyumba za wageni", "Albergues y Residencias", "Albergues e Residências", "Ba bandako ya bapaya"],
  "Réserver": ["Book", "Hifadhi", "Reservar", "Reservar", "Kobomba esika"],
  "Événements & Loisirs": ["Events & Leisure", "Matukio & Burudani", "Eventos y Ocio", "Eventos e Lazer", "Bafɛti & Masano"],
  "Événements": ["Events", "Matukio", "Eventos", "Eventos", "Bafɛti"],
  "Salles de fêtes": ["Party halls", "Kumbi za sherehe", "Salones de fiestas", "Salões de festas", "Bandako ya bafɛti"],
  "Sites touristiques": ["Tourist sites", "Maeneo ya utalii", "Sitios turísticos", "Locais turísticos", "Bisika ya kotala"],
  "Logements Étudiants": ["Student Housing", "Makazi ya Wanafunzi", "Vivienda Estudiantil", "Alojamento Estudantil", "Bandako ya Bayekoli"],
  "Étudiants": ["Students", "Wanafunzi", "Estudiantes", "Estudantes", "Bayekoli"],
  "Homes étudiants": ["Student homes", "Mabweni", "Residencias estudiantiles", "Lares estudantis", "Ba home ya bayekoli"],
  "Cités étudiantes": ["Student campuses", "Vijiji vya wanafunzi", "Ciudades universitarias", "Cidades universitárias", "Ba cité ya bayekoli"],
  "Gaming & Informatique": ["Gaming & Computers", "Michezo & Kompyuta", "Gaming e Informática", "Gaming e Informática", "Masano & Ordinatɛrɛ"],
  "Gaming & PC": ["Gaming & PC", "Michezo & PC", "Gaming y PC", "Gaming e PC", "Masano & PC"],
  "Jeux vidéo PC": ["PC video games", "Michezo ya video ya PC", "Videojuegos PC", "Jogos de PC", "Masano ya PC"],
  "Vente de PC": ["PC sales", "Uuzaji wa PC", "Venta de PC", "Venda de PC", "Koteka PC"],
  "Acheter": ["Buy", "Nunua", "Comprar", "Comprar", "Kosomba"],
  "Mode & Style Étudiant": ["Student Fashion & Style", "Mitindo ya Wanafunzi", "Moda y Estilo Estudiantil", "Moda e Estilo Estudantil", "Mode ya Bayekoli"],
  "Mode": ["Fashion", "Mitindo", "Moda", "Moda", "Mode"],
  "Chaussures": ["Shoes", "Viatu", "Zapatos", "Calçado", "Sapato"],
  "Vêtements": ["Clothing", "Nguo", "Ropa", "Roupa", "Bilamba"],
  "Accessoires": ["Accessories", "Vifaa", "Accesorios", "Acessórios", "Biloko ya kobakisa"],
  "Commander": ["Order", "Agiza", "Pedir", "Encomendar", "Kotinda komandi"],
  "Équipements & Machines": ["Equipment & Machinery", "Vifaa & Mashine", "Equipos y Máquinas", "Equipamentos e Máquinas", "Bisaleli & Masini"],
  "Équipements": ["Equipment", "Vifaa", "Equipos", "Equipamentos", "Bisaleli"],
  "Générateurs": ["Generators", "Jenereta", "Generadores", "Geradores", "Ba groupe électrogène"],
  "Machines": ["Machines", "Mashine", "Máquinas", "Máquinas", "Masini"],
  "Outillage": ["Tools", "Zana", "Herramientas", "Ferramentas", "Bisaleli ya mosala"],
  // home
  "Intermédiaire unique": ["Single intermediary", "Mpatanishi pekee", "Intermediario único", "Intermediário único", "Moyokanisi se moko"],
  "Un seul contact pour tout trouver, réserver et acheter.": [
    "One contact to find, book and buy everything.", "Mawasiliano moja kupata, kuhifadhi na kununua kila kitu.",
    "Un solo contacto para encontrar, reservar y comprar todo.", "Um só contacto para encontrar, reservar e comprar tudo.",
    "Moto moko mpo na koluka, kobomba mpe kosomba nyonso.",
  ],
  "Immobilier, séjours, événements, logements étudiants, informatique, mode et équipements. Inkinet traite votre demande et fait la liaison pour vous.": [
    "Real estate, stays, events, student housing, computers, fashion and equipment. Inkinet handles your request and connects you.",
    "Nyumba, malazi, matukio, makazi ya wanafunzi, kompyuta, mitindo na vifaa. Inkinet inashughulikia ombi lako na kukuunganisha.",
    "Inmuebles, estancias, eventos, vivienda estudiantil, informática, moda y equipos. Inkinet gestiona tu solicitud y hace el enlace.",
    "Imóveis, estadias, eventos, alojamento estudantil, informática, moda e equipamentos. A Inkinet trata o seu pedido e faz a ligação.",
    "Bandako, bafandeli, bafɛti, bandako ya bayekoli, ordinatɛrɛ, mode mpe bisaleli. Inkinet esalaka lisɛngi na yo mpe ekangisaka yo.",
  ],
  "Explorer le catalogue": ["Explore the catalogue", "Gundua katalogi", "Explorar el catálogo", "Explorar o catálogo", "Tala katalógi"],
  "Nos univers": ["Our categories", "Makundi yetu", "Nuestros universos", "Os nossos universos", "Mitindo na biso"],
  "À la une": ["Featured", "Zilizoangaziwa", "Destacados", "Em destaque", "Oyo eleki"],
  "Tout voir →": ["See all →", "Tazama zote →", "Ver todo →", "Ver tudo →", "Tala nyonso →"],
  "1. Choisissez": ["1. Choose", "1. Chagua", "1. Elige", "1. Escolha", "1. Pona"],
  "Parcourez les annonces et repérez la référence qui vous intéresse.": [
    "Browse the listings and note the reference you like.", "Pitia matangazo na uone kumbukumbu inayokuvutia.",
    "Recorre los anuncios y localiza la referencia que te interesa.", "Percorra os anúncios e encontre a referência que lhe interessa.",
    "Tala bayebisi mpe luka référence oyo esepelisi yo.",
  ],
  "2. Contactez Inkinet": ["2. Contact Inkinet", "2. Wasiliana na Inkinet", "2. Contacta a Inkinet", "2. Contacte a Inkinet", "2. Benga Inkinet"],
  "Un clic envoie la référence exacte à notre équipe via WhatsApp ou formulaire.": [
    "One click sends the exact reference to our team via WhatsApp or form.", "Bofya moja kunatuma kumbukumbu kamili kwa timu yetu kupitia WhatsApp au fomu.",
    "Un clic envía la referencia exacta a nuestro equipo por WhatsApp o formulario.", "Um clique envia a referência exata à nossa equipa por WhatsApp ou formulário.",
    "Kofina mbala moko etindaka référence na ekipi na biso na WhatsApp to na formilɛrɛ.",
  ],
  "3. On s'occupe du reste": ["3. We handle the rest", "3. Tunashughulikia mengine", "3. Nos ocupamos del resto", "3. Tratamos do resto", "3. Tokosala oyo etikali"],
  "Nous vérifions, négocions et organisons la liaison en toute sécurité.": [
    "We verify, negotiate and arrange the connection safely.", "Tunathibitisha, tunajadiliana na kupanga muunganisho kwa usalama.",
    "Verificamos, negociamos y organizamos el enlace con total seguridad.", "Verificamos, negociamos e organizamos a ligação em total segurança.",
    "Totalaka, tosololaka mpe tobongisaka boyokani na kimya.",
  ],
  // a-propos
  "Comment ça marche": ["How it works", "Inavyofanya kazi", "Cómo funciona", "Como funciona", "Ndenge ya kosala"],
  "Inkinet est votre intermédiaire unique : vous ne contactez jamais les vendeurs ou propriétaires directement. Chaque annonce, chaque réservation et chaque achat passe par notre équipe, qui vérifie, négocie et organise la liaison pour vous.": [
    "Inkinet is your single intermediary: you never contact sellers or owners directly. Every listing, booking and purchase goes through our team, which verifies, negotiates and arranges the connection for you.",
    "Inkinet ni mpatanishi wako pekee: huwawasiliani na wauzaji wamiliki moja kwa moja. Kila tangazo, kuhifadhi na kununua hupitia timu yetu inayothibitisha, kujadiliana na kupanga muunganisho kwa ajili yako.",
    "Inkinet es su intermediario único: nunca contacta directamente a vendedores o propietarios. Cada anuncio, reserva y compra pasa por nuestro equipo, que verifica, negocia y organiza el enlace por usted.",
    "A Inkinet é o seu intermediário único: nunca contacta directamente vendedores ou proprietários. Cada anúncio, reserva e compra passa pela nossa equipa, que verifica, negocia e organiza a ligação por si.",
    "Inkinet ezali moyokanisi na yo se moko: okutanisaka te na bavendɛrɛ to banyangi mbala moko. Eyebisi nyonso, kobomba mpe kosomba ezali kolonga na ekipi na biso, eyotalaka, eyolobelaka mpe ekangisaka yo.",
  ],
  "En trois étapes": ["In three steps", "Katika hatua tatu", "En tres pasos", "Em três passos", "Na baino misato"],
  "Le calendrier de disponibilité": ["The availability calendar", "Kalenda ya upatikanaji", "El calendario de disponibilidad", "O calendário de disponibilidade", "Manaka ya bozali"],
  "Pour les maisons, hôtels, salles de fêtes et logements étudiants, chaque fiche affiche un calendrier : les dates déjà occupées sont grisées. Vous choisissez librement vos dates ; si elles sont libres, votre réservation peut être confirmée.": [
    "For houses, hotels, party halls and student housing, each listing shows a calendar: dates already taken are greyed out. You freely choose your dates; if they are free, your booking can be confirmed.",
    "Kwa nyumba, hoteli, kumbi za sherehe na makazi ya wanafunzi, kila tangazo linaonyesha kalenda: tarehe zilizochukuliwa zimekiva kivuli. Unachagua tarehe zako kwa uhuru; zikipatikana, kuhifadhi kwako kunaweza kuthibitishwa.",
    "Para casas, hoteles, salones de fiestas y vivienda estudiantil, cada anuncio muestra un calendario: las fechas ya ocupadas aparecen en gris. Elige libremente tus fechas; si están libres, tu reserva puede confirmarse.",
    "Para casas, hotéis, salões de festas e alojamento estudantil, cada anúncio mostra um calendário: as datas já ocupadas ficam a cinzento. Escolhe livremente as suas datas; se estiverem livres, a sua reserva pode ser confirmada.",
    "Mpo na bandako, ba otɛlɛ, bandako ya bafɛti mpe bandako ya bayekoli, eyebisi moko na moko elakisaka manaka: mikolo ezwami ezali na kilamini. Oponaka mikolo na yo na bonsomi; soki ezali ya libRE, kobomba na yo ekoki kofirmwama.",
  ],
  "Une demande sur WhatsApp": ["A request via WhatsApp", "Ombi kupitia WhatsApp", "Una solicitud por WhatsApp", "Um pedido por WhatsApp", "Lisɛngi na WhatsApp"],
  "Le bouton ouvre WhatsApp avec un message déjà prêt : votre demande, la référence exacte de l'annonce, son titre et son prix. Vous n'avez rien à écrire, il suffit d'appuyer sur Envoyer.": [
    "The button opens WhatsApp with a ready-made message: your request, the exact reference of the listing, its title and price. You have nothing to write, just press Send.",
    "Kitufe hufungua WhatsApp na ujumbe tayari: ombi lako, kumbukumbu kamili ya tangazo, jina na bei yake. Huna cha kuandika, bonyeza Tuma tu.",
    "El botón abre WhatsApp con un mensaje ya listo: tu solicitud, la referencia exacta del anuncio, su título y su precio. No tienes que escribir nada, solo pulsa Enviar.",
    "O botão abre o WhatsApp com uma mensagem já pronta: o seu pedido, a referência exacta do anúncio, o título e o preço. Não tem nada a escrever, basta premir Enviar.",
    "Butɔni efungolaka WhatsApp na nsango oyo esila kokwama: lisɛngi na yo, référence ya eyebisi, nkombo na yango mpe ntalo na yango. Ondimela eloko te, fina only 'Tinda'.",
  ],
  "Le formulaire de demande": ["The request form", "Fomu ya ombi", "El formulario de solicitud", "O formulário de pedido", "Formilɛrɛ ya lisɛngi"],
  "Vous préférez laisser un message ? Remplissez le formulaire : votre nom, votre téléphone et votre question. L'équipe Inkinet vous recontacte rapidement.": [
    "Prefer to leave a message? Fill in the form: your name, your phone and your question. The Inkinet team will contact you shortly.",
    "Unapenda kuacha ujumbe? Jaza fomu: jina lako, simu yako na swali lako. Timu ya Inkinet itakuwasiliana hivi karibuni.",
    "¿Prefiere dejar un mensaje? Rellene el formulario: su nombre, su teléfono y su pregunta. El equipo Inkinet le contactará pronto.",
    "Prefere deixar uma mensagem? Preencha o formulário: o seu nome, o seu telefone e a sua pergunta. A equipa Inkinet contacta-o em breve.",
    "Olingi kotika nsango? Zalisa formilɛrɛ: nkombo na yo, telefone na yo mpe motuna na yo. Ekipi ya Inkinet ekobenga yo noki.",
  ],
  "Chaque annonce porte une référence unique, par exemple SP-IM001. Notez-la : elle permet à l'équipe de retrouver l'annonce exacte immédiatement.": [
    "Every listing carries a unique reference, e.g. SP-IM001. Note it: it lets the team find the exact listing immediately.",
    "Kila tangazo lina kumbukumbu ya kipekee, kama SP-IM001. Iandike: huruhusu timu kupata tangazo kamili papo hapo.",
    "Cada anuncio lleva una referencia única, p. ej. SP-IM001. Anótela: permite al equipo encontrar el anuncio exacto de inmediato.",
    "Cada anúncio tem uma referência única, por ex. SP-IM001. Aponte-a: permite à equipa encontrar o anúncio exacto de imediato.",
    "Eyebisi moko na moko ezali na référence ya nkuku, ndakisa SP-IM001. Yikela yango: ekipi ekokikozwa eyebisi yango mbala moko.",
  ],
  "Prêt à commencer ?": ["Ready to start?", "Uko tayari kuanza?", "¿Listo para empezar?", "Pronto para começar?", "Ozali tayali kobanda?"],
  "Parcourez le catalogue et contactez-nous en un clic.": ["Browse the catalogue and contact us in one click.", "Pitia katalogi na utuwasiliane kwa mbofyo mmoja.", "Recorra el catálogo y contáctenos en un clic.", "Percorra o catálogo e contacte-nos num clique.", "Tala katalógi mpe benga biso na finɛ moko."],
  // catalogue
  "Tout le catalogue": ["Full catalogue", "Katalogi yote", "Todo el catálogo", "Todo o catálogo", "Katalógi mobimba"],
  "Tout": ["All", "Zote", "Todo", "Tudo", "Nyonso"],
  "Rechercher un titre ou une référence…": ["Search a title or reference…", "Tafuta jina au kumbukumbu…", "Buscar un título o referencia…", "Pesquisar título ou referência…", "Luka nkombo to référence…"],
  "Tous les statuts": ["All statuses", "Hali zote", "Todos los estados", "Todos os estados", "Ba statut nyonso"],
  "Prix min": ["Min price", "Bei ya chini", "Precio mín", "Preço mín", "Ntalo ya moke"],
  "Prix max": ["Max price", "Bei ya juu", "Precio máx", "Preço máx", "Ntalo ya likolo"],
  "résultat(s)": ["result(s)", "matokeo", "resultado(s)", "resultado(s)", "biloko"],
  "Aucune annonce ne correspond à ces filtres.": ["No listing matches these filters.", "Hakuna tangazo linalolingana na vichujio hivi.", "Ningún anuncio coincide con estos filtros.", "Nenhum anúncio corresponde a estes filtros.", "Eyebisi moko te ekokani na baponi oyo."],
  // detail
  "Annonce introuvable": ["Listing not found", "Tangazo halipatikani", "Anuncio no encontrado", "Anúncio não encontrado", "Eyebisi ezwami te"],
  "Retour au catalogue": ["Back to catalogue", "Rudi kwenye katalogi", "Volver al catálogo", "Voltar ao catálogo", "Zonga na katalógi"],
  "Vidéo de présentation": ["Presentation video", "Video ya utambulisho", "Vídeo de presentación", "Vídeo de apresentação", "Vidéo ya kolakisa"],
  "Description": ["Description", "Maelezo", "Descripción", "Descrição", "Ndimbola"],
  "Référence": ["Reference", "Kumbukumbu", "Referencia", "Referência", "Référence"],
  "Variantes": ["Variants", "Aina", "Variantes", "Variantes", "Ndenge"],
  "Disponibilité — choisissez vos dates": ["Availability — choose your dates", "Upatikanaji — chagua tarehe zako", "Disponibilidad — elige tus fechas", "Disponibilidade — escolha as suas datas", "Bozali — pona mikolo na yo"],
  "date occupée": ["date taken", "tarehe imechukuliwa", "fecha ocupada", "data ocupada", "mokolo ezwami"],
  "dates occupées": ["dates taken", "tarehe zimechukuliwa", "fechas ocupadas", "datas ocupadas", "mikolo ezwami"],
  "via WhatsApp": ["via WhatsApp", "kupitia WhatsApp", "por WhatsApp", "por WhatsApp", "na WhatsApp"],
  "Votre demande est reçue directement par l'administrateur Inkinet.": [
    "Your request goes directly to the Inkinet administrator.", "Ombi lako linapokelewa moja kwa moja na msimamizi wa Inkinet.",
    "Tu solicitud llega directamente al administrador de Inkinet.", "O seu pedido é recebido diretamente pelo administrador Inkinet.",
    "Lisɛngi na yo ekokoma mbala moko epai ya mokambi ya Inkinet.",
  ],
  "Ou laissez une demande": ["Or leave a request", "Au acha ombi", "O deja una solicitud", "Ou deixe um pedido", "To tika lisɛngi"],
  "Votre nom": ["Your name", "Jina lako", "Tu nombre", "O seu nome", "Nkombo na yo"],
  "Téléphone / WhatsApp": ["Phone / WhatsApp", "Simu / WhatsApp", "Teléfono / WhatsApp", "Telefone / WhatsApp", "Telefone / WhatsApp"],
  "Message (dates, taille, questions…)": ["Message (dates, size, questions…)", "Ujumbe (tarehe, saizi, maswali…)", "Mensaje (fechas, talla, preguntas…)", "Mensagem (datas, tamanho, perguntas…)", "Nsango (mikolo, molayi, mituna…)"],
  "Envoi…": ["Sending…", "Inatuma…", "Enviando…", "A enviar…", "Ezali kotinda…"],
  "envoyer à Inkinet": ["send to Inkinet", "tuma kwa Inkinet", "enviar a Inkinet", "enviar à Inkinet", "tinda na Inkinet"],
  "Choisissez vos dates dans le calendrier.": ["Choose your dates in the calendar.", "Chagua tarehe zako kwenye kalenda.", "Elige tus fechas en el calendario.", "Escolha as suas datas no calendário.", "Pona mikolo na yo na manaka."],
  "Ces dates sont déjà occupées.": ["These dates are already taken.", "Tarehe hizi zimeshachukuliwa.", "Estas fechas ya están ocupadas.", "Estas datas já estão ocupadas.", "Mikolo oyo esi ezwami."],
  "Envoi impossible, réessayez.": ["Could not send, please retry.", "Imeshindwa kutuma, jaribu tena.", "No se pudo enviar, inténtalo de nuevo.", "Não foi possível enviar, tente novamente.", "Ekoki kotinda te, meka lisusu."],
  "Demande envoyée ! Inkinet vous recontacte rapidement.": ["Request sent! Inkinet will contact you shortly.", "Ombi limetumwa! Inkinet itakuwasiliana hivi karibuni.", "¡Solicitud enviada! Inkinet te contactará pronto.", "Pedido enviado! A Inkinet contacta-o em breve.", "Lisɛngi etindami! Inkinet ekobenga yo noki."],
  "Nom requis": ["Name required", "Jina linahitajika", "Nombre obligatorio", "Nome obrigatório", "Nkombo esengeli"],
  "Téléphone invalide": ["Invalid phone", "Simu si sahihi", "Teléfono inválido", "Telefone inválido", "Telefone ya mabe"],
  "Formulaire invalide": ["Invalid form", "Fomu si sahihi", "Formulario inválido", "Formulário inválido", "Formilɛrɛ ya mabe"],
};

const IDX: Record<Exclude<Lang, "fr">, number> = { en: 0, sw: 1, es: 2, pt: 3, ln: 4 };

export function translate(lang: Lang, text: string) {
  if (lang === "fr") return text;
  return D[text]?.[IDX[lang]] ?? text;
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "fr", setLang: () => {} });
const KEY = "sewapoint-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && LANGS.some((l) => l.id === saved)) setLangState(saved);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem(KEY, l); };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(Ctx);
  return { lang, setLang, t: (s: string) => translate(lang, s) };
}
