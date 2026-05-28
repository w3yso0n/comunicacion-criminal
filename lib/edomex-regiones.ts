export type EdomexRegionDef = {
  numero: number;
  nombre: string;
  etiqueta: string;
  zonaMacro: string;
  municipios: readonly string[];
};

/** Regiones oficiales del Estado de México (19 regiones en 7 zonas). */
export const EDOMEX_REGIONES: readonly EdomexRegionDef[] = [
  {
    numero: 1,
    nombre: "Chalco",
    etiqueta: "Región 1: Chalco",
    zonaMacro: "Zona I Oriente",
    municipios: [
      "Amecameca",
      "Atlautla",
      "Ayapango",
      "Chalco",
      "Cocotitlán",
      "Ecatzingo",
      "Juchitepec",
      "Ozumba",
      "Temamatla",
      "Tenango del Aire",
      "Tepetlixpa",
      "Tlalmanalco",
    ],
  },
  {
    numero: 2,
    nombre: "Ixtapaluca",
    etiqueta: "Región 2: Ixtapaluca",
    zonaMacro: "Zona I Oriente",
    municipios: ["Ixtapaluca", "La Paz", "Valle de Chalco Solidaridad"],
  },
  {
    numero: 3,
    nombre: "Texcoco",
    etiqueta: "Región 3: Texcoco",
    zonaMacro: "Zona I Oriente",
    municipios: [
      "Atenco",
      "Chiautla",
      "Chicoloapan",
      "Chiconcuac",
      "Chimalhuacán",
      "Papalotla",
      "Tepetlaoxtoc",
      "Texcoco",
      "Tezoyuca",
    ],
  },
  {
    numero: 4,
    nombre: "Nezahualcóyotl",
    etiqueta: "Región 4: Nezahualcóyotl",
    zonaMacro: "Zona I Oriente",
    municipios: ["Nezahualcóyotl"],
  },
  {
    numero: 5,
    nombre: "Ecatepec",
    etiqueta: "Región 5: Ecatepec",
    zonaMacro: "Zona II Nororiente",
    municipios: ["Ecatepec de Morelos"],
  },
  {
    numero: 6,
    nombre: "Tecámac",
    etiqueta: "Región 6: Tecámac",
    zonaMacro: "Zona II Nororiente",
    municipios: [
      "Acolman",
      "Axapusco",
      "Nopaltepec",
      "Otumba",
      "San Martín de las Pirámides",
      "Tecámac",
      "Temascalapa",
      "Teotihuacán",
    ],
  },
  {
    numero: 7,
    nombre: "Zumpango",
    etiqueta: "Región 7: Zumpango",
    zonaMacro: "Zona II Nororiente",
    municipios: [
      "Apaxco",
      "Coyotepec",
      "Huehuetoca",
      "Hueypoxtla",
      "Teoloyucan",
      "Tepotzotlán",
      "Tequixquiac",
      "Zumpango",
    ],
  },
  {
    numero: 8,
    nombre: "Tultitlán",
    etiqueta: "Región 8: Tultitlán",
    zonaMacro: "Zona II Nororiente",
    municipios: [
      "Coacalco de Berriozábal",
      "Cuautitlán",
      "Jaltenco",
      "Melchor Ocampo",
      "Nextlalpan",
      "Tonanitla",
      "Tultepec",
      "Tultitlán",
    ],
  },
  {
    numero: 9,
    nombre: "Tlalnepantla",
    etiqueta: "Región 9: Tlalnepantla",
    zonaMacro: "Zona III Centro",
    municipios: [
      "Atizapán de Zaragoza",
      "Cuautitlán Izcalli",
      "Tlalnepantla de Baz",
    ],
  },
  {
    numero: 10,
    nombre: "Nicolás Romero",
    etiqueta: "Región 10: Nicolás Romero",
    zonaMacro: "Zona V Valle de Toluca",
    municipios: [
      "Isidro Fabela",
      "Jilotzingo",
      "Nicolás Romero",
      "Otzolotepec",
      "Temoaya",
      "Xonacatlán",
    ],
  },
  {
    numero: 11,
    nombre: "Jilotepec",
    etiqueta: "Región 11: Jilotepec",
    zonaMacro: "Zona IV Norte",
    municipios: [
      "Acambay de Ruiz Castañeda",
      "Aculco",
      "Chapa de Mota",
      "Jilotepec",
      "Morelos",
      "Polotitlán",
      "Soyaniquilpan de Juárez",
      "Temascalcingo",
      "Timilpan",
      "Villa del Carbón",
    ],
  },
  {
    numero: 12,
    nombre: "Ixtlahuaca",
    etiqueta: "Región 12: Ixtlahuaca",
    zonaMacro: "Zona IV Norte",
    municipios: [
      "Atlacomulco",
      "El Oro",
      "Ixtlahuaca",
      "Jiquipilco",
      "Jocotitlán",
      "San Felipe del Progreso",
      "San José del Rincón",
      "Villa Victoria",
    ],
  },
  {
    numero: 13,
    nombre: "Valle de Bravo",
    etiqueta: "Región 13: Valle de Bravo",
    zonaMacro: "Zona VI Sur",
    municipios: [
      "Amanalco",
      "Donato Guerra",
      "Ixtapan del Oro",
      "Otzoloapan",
      "Santo Tomás",
      "Santo Tomás de los Plátanos",
      "Temascaltepec",
      "Valle de Bravo",
      "Villa de Allende",
      "Zacazonapan",
    ],
  },
  {
    numero: 14,
    nombre: "Toluca",
    etiqueta: "Región 14: Toluca",
    zonaMacro: "Zona V Valle de Toluca",
    municipios: [
      "Almoloya de Juárez",
      "Calimaya",
      "Chapultepec",
      "Metepec",
      "Mexicaltzingo",
      "San Mateo Atenco",
      "Toluca",
      "Zinacantepec",
    ],
  },
  {
    numero: 15,
    nombre: "Naucalpan",
    etiqueta: "Región 15: Naucalpan",
    zonaMacro: "Zona III Centro",
    municipios: ["Huixquilucan", "Naucalpan de Juárez"],
  },
  {
    numero: 16,
    nombre: "Lerma",
    etiqueta: "Región 16: Lerma",
    zonaMacro: "Zona V Valle de Toluca",
    municipios: [
      "Almoloya del Río",
      "Atizapán",
      "Capulhuac",
      "Lerma",
      "Ocoyoacac",
      "San Antonio la Isla",
      "Texcalyacac",
      "Tianguistenco",
      "Xalatlaco",
    ],
  },
  {
    numero: 17,
    nombre: "Tenancingo",
    etiqueta: "Región 17: Tenancingo",
    zonaMacro: "Zona VII Sureste",
    municipios: [
      "Coatepec Harinas",
      "Ixtapan de la Sal",
      "Joquicingo",
      "Malinalco",
      "Ocuilan",
      "Rayón",
      "Tenancingo",
      "Tenango del Valle",
      "Tonatico",
      "Villa Guerrero",
      "Zumpahuacán",
    ],
  },
  {
    numero: 18,
    nombre: "Sultepec",
    etiqueta: "Región 18: Sultepec",
    zonaMacro: "Zona VII Sureste",
    municipios: [
      "Almoloya de Alquisiras",
      "San Simón de Guerrero",
      "Sultepec",
      "Texcaltitlán",
      "Zacualpan",
    ],
  },
  {
    numero: 19,
    nombre: "Tejupilco",
    etiqueta: "Región 19: Tejupilco",
    zonaMacro: "Zona VI Sur",
    municipios: ["Amatepec", "Luvianos", "Tejupilco", "Tlatlaya"],
  },
];

const ALIAS_MUNICIPIO: Record<string, string> = {
  ecatepec: "Ecatepec de Morelos",
  "valle de chalco": "Valle de Chalco Solidaridad",
  nezahualcoyotl: "Nezahualcóyotl",
  "san martin de las piramides": "San Martín de las Pirámides",
  "santo tomas": "Santo Tomás de los Plátanos",
  acambay: "Acambay de Ruiz Castañeda",
  coacalco: "Coacalco de Berriozábal",
  naucalpan: "Naucalpan de Juárez",
  tlalnepantla: "Tlalnepantla de Baz",
  "atizapan de zaragoza": "Atizapán de Zaragoza",
  "cuautitlan izcalli": "Cuautitlán Izcalli",
};

export function normalizarTexto(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

const MUNICIPIO_A_REGION = new Map<string, EdomexRegionDef>();

for (const region of EDOMEX_REGIONES) {
  for (const municipio of region.municipios) {
    MUNICIPIO_A_REGION.set(normalizarTexto(municipio), region);
  }
}

for (const [alias, canonico] of Object.entries(ALIAS_MUNICIPIO)) {
  const region = MUNICIPIO_A_REGION.get(normalizarTexto(canonico));
  if (region) MUNICIPIO_A_REGION.set(alias, region);
}

/** Empareja un nombre de municipio (BD) con el catálogo oficial del Edomex (p. ej. NOMGEO del GeoJSON). */
export function emparejarMunicipioEdomex(
  municipio: string | null | undefined,
  nombresOficiales: ReadonlySet<string>,
): string | null {
  const raw = (municipio ?? "").trim();
  if (!raw || raw === "sin_municipio") return null;

  const porClave = new Map<string, string>();
  for (const nombre of nombresOficiales) {
    porClave.set(normalizarTexto(nombre), nombre);
  }

  const key = normalizarTexto(raw);
  const directo = porClave.get(key);
  if (directo) return directo;

  const alias = ALIAS_MUNICIPIO[key];
  if (alias) {
    const porAlias = porClave.get(normalizarTexto(alias));
    if (porAlias) return porAlias;
  }

  let mejor: string | null = null;
  let mejorLen = 0;
  for (const [municipioKey, nombre] of porClave.entries()) {
    if (key.includes(municipioKey) || municipioKey.includes(key)) {
      if (municipioKey.length > mejorLen) {
        mejor = nombre;
        mejorLen = municipioKey.length;
      }
    }
  }
  return mejor;
}

export function resolverRegionEdomex(
  municipio: string | null | undefined,
): EdomexRegionDef | null {
  const raw = (municipio ?? "").trim();
  if (!raw || raw === "sin_municipio") return null;

  const key = normalizarTexto(raw);
  const directo = MUNICIPIO_A_REGION.get(key);
  if (directo) return directo;

  const alias = ALIAS_MUNICIPIO[key];
  if (alias) {
    const porAlias = MUNICIPIO_A_REGION.get(normalizarTexto(alias));
    if (porAlias) return porAlias;
  }

  let mejor: EdomexRegionDef | null = null;
  let mejorLen = 0;
  for (const [municipioKey, region] of MUNICIPIO_A_REGION.entries()) {
    if (key.includes(municipioKey) || municipioKey.includes(key)) {
      if (municipioKey.length > mejorLen) {
        mejor = region;
        mejorLen = municipioKey.length;
      }
    }
  }
  return mejor;
}

export function resolverRegionPorTexto(
  texto: string | null | undefined,
): EdomexRegionDef | null {
  const raw = (texto ?? "").trim();
  if (!raw) return null;

  const porMunicipio = resolverRegionEdomex(raw);
  if (porMunicipio) return porMunicipio;

  const key = normalizarTexto(raw);
  for (const region of EDOMEX_REGIONES) {
    if (
      normalizarTexto(region.etiqueta) === key ||
      normalizarTexto(region.nombre) === key ||
      normalizarTexto(region.zonaMacro) === key
    ) {
      return region;
    }
  }
  return null;
}

export function agregarConteosPorRegion(
  items: { municipio: string; total: number }[],
): { region: EdomexRegionDef; total: number }[] {
  const map = new Map<number, number>();
  for (const item of items) {
    const region = resolverRegionEdomex(item.municipio);
    if (!region) continue;
    map.set(region.numero, (map.get(region.numero) ?? 0) + item.total);
  }
  return EDOMEX_REGIONES.filter((r) => (map.get(r.numero) ?? 0) > 0)
    .map((region) => ({
      region,
      total: map.get(region.numero) ?? 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function agregarSeriePorRegion(
  items: { municipio: string; dia: string; total: number }[],
): { region: EdomexRegionDef; dia: string; total: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const region = resolverRegionEdomex(item.municipio);
    if (!region || !item.dia || item.dia.startsWith("—")) continue;
    const key = `${region.numero}|${item.dia}`;
    map.set(key, (map.get(key) ?? 0) + item.total);
  }
  const out: { region: EdomexRegionDef; dia: string; total: number }[] = [];
  for (const [key, total] of map.entries()) {
    const [numStr, dia] = key.split("|");
    const region = EDOMEX_REGIONES.find((r) => r.numero === Number(numStr));
    if (region) out.push({ region, dia, total });
  }
  return out;
}
