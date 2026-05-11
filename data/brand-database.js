const KNOWN = {
  'wella professional': {owner:'Coty Inc (KKR PE investor)',tier:0,pe:true,indie:false},
  'wella': {owner:'Coty Inc (KKR PE investor)',tier:0,pe:true,indie:false},
  'redken': {owner:'L\'Oréal Luxe Division',tier:1,pe:false,indie:false},
  'redken 5th ave': {owner:'L\'Oréal Luxe Division',tier:1,pe:false,indie:false},
  'matrix': {owner:'L\'Oréal Luxe Division',tier:1,pe:false,indie:false},
  'pureology': {owner:'L\'Oréal Luxe Division',tier:1,pe:false,indie:false},
  'davines': {owner:'Davines SPA (Founding family, Italy)',tier:4,pe:false,indie:true},
  'kenra': {owner:'Kenra Volume (Founder-owned, Ohio)',tier:4,pe:false,indie:true},
  'bumble and bumble': {owner:'Estée Lauder Companies',tier:1,pe:false,indie:false},
  'bumble': {owner:'Estée Lauder Companies',tier:1,pe:false,indie:false},
  'kevin murphy': {owner:'Estée Lauder Companies',tier:1,pe:false,indie:false},
  'olaplex': {owner:'Advent Partners (PE investor)',tier:0,pe:true,indie:false,womenFounded:true},
  'k18': {owner:'K18 (Founder-owned by Kyle White)',tier:5,pe:false,indie:true,womenFounded:false},
  'briogeo': {owner:'ITV Holdings (Founder-owned)',tier:4,pe:false,indie:true,womenOwned:true},
  'moroccanoil': {owner:'Apivita (Private, Greece)',tier:3,pe:false,indie:false},
  'oribe': {owner:'Estée Lauder Companies',tier:1,pe:false,indie:false},
  'kerastase': {owner:'L\'Oréal Luxe Division',tier:1,pe:false,indie:false},
  'evo': {owner:'Evolve Holdings (Independent)',tier:4,pe:false,indie:true},
  'joico': {owner:'Henkel AG (XETRA: HENKY)',tier:1,pe:false,indie:false},
  'paul brown hawaii': {owner:'Independent',tier:4,pe:false,indie:true},
  'tresemmé': {owner:'Unilever PLC',tier:1,pe:false,indie:false},
  'schwarzkopf': {owner:'Henkel AG',tier:1,pe:false,indie:false},
  'goldwell': {owner:'Henkel AG',tier:1,pe:false,indie:false},
  'igora': {owner:'Schwarzkopf (Henkel AG)',tier:1,pe:false,indie:false},
  'koleston': {owner:'Wella Company (KKR)',tier:0,pe:true,indie:false},
'pravana': {owner:'Schwarzkopf (Henkel)',tier:1,pe:false,indie:false},
  'hot tools': {owner:'REVLON (NYSE: REV)',tier:1,pe:false,indie:false},
  'babyliss': {owner:'Conair Corporation (Private)',tier:3,pe:false,indie:false},
  'dyson': {owner:'Dyson Limited (Founder: James Dyson)',tier:4,pe:false,indie:true},
  'jaguar': {owner:'Jaguar Scissors (Independent, Germany)',tier:4,pe:false,indie:true},
  'kamisori': {owner:'Independent (Japan)',tier:4,pe:false,indie:true},
  'hikari': {owner:'Independent (Japan)',tier:4,pe:false,indie:true},
  'dmi': {owner:'Mizutani Scissors (Independent, Japan)',tier:4,pe:false,indie:true},
  'smiths': {owner:'Smiths of Glasgow (UK)',tier:4,pe:false,indie:true},
  't3': {owner:'Cura Hair Group (Independent)',tier:4,pe:false,indie:true},
  'sally beauty': {owner:'Sally Holdings (TPG PE investor)',tier:0,pe:true,indie:false},
  'ulta beauty': {owner:'Ulta Beauty Inc (NASDAQ: ULTA, publicly traded, no corporate parent)',tier:1,pe:false,indie:false},
  'cosmoProf': {owner:'Regis Corporation (Publicly traded, NASDAQ: RGS)',tier:1,pe:false,indie:false},
  'beauty systems group': {owner:'Performance Food Group',tier:1,pe:false,indie:false},
  'armstrong mccall': {owner:'TPG Capital (PE investor)',tier:0,pe:true,indie:false},
  'brazilian blowout': {owner:'Taaz Inc (Independent)',tier:4,pe:false,indie:true},
  'keratin complex': {owner:'Coppola Keratin (Independent)',tier:4,pe:false,indie:true},
  'redken extreme': {owner:'L\'Oréal Luxe (Redken)',tier:1,pe:false,indie:false},
  'joico kpak': {owner:'Henkel AG (Joico)',tier:1,pe:false,indie:false},
  'salon care': {owner:'L\'Oréal Salon',tier:1,pe:false,indie:false},
  'tomb45': {owner:'Tomb45 LLC (Founder-owned, Indie)',tier:5,pe:false,indie:true,womenOwned:true},
  'danger jones': {owner:'Jones Beauty (Independent, Indie)',tier:5,pe:false,indie:true,womenOwned:true},
  'malibu c': {owner:'Malibu Wellness Inc (100% employee-owned ESOP; founded by Tom & Deb Porter, 1985; current CEO Loretta Mottram)',tier:6,pe:false,indie:true,esop:true,womenOwned:false,womenFounded:false,womanLed:true,womanLedName:'Loretta Mottram',womanLedTitle:'CEO',confidence:5,note:'Malibu C is 100% employee-owned through an ESOP implemented by founder Tom Porter to protect the brand\'s legacy. Current CEO is Loretta Mottram.'},
  'ivy ann shears': {owner:'Ivy Ann (Founder: Ivy Ann, Independent)',tier:5,pe:false,indie:true,womenOwned:true,womenFounded:true,womanLed:true,womanLedName:'Ivy Ann',womanLedTitle:'Founder & Owner',esop:false,confidence:5}
};

function lookupBrand(name) {
  if (!name) return null;
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9\s]/g,'');
  for (const key in KNOWN) {
    if (key.replace(/[^a-z0-9\s]/g,'') === clean) {
      return KNOWN[key];
    }
  }
  return null;
}