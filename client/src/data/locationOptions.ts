import { TamilNaduPlace } from './tamilNaduPlaces.js';

export interface TamilNaduArea {
  name: string;
  latitude: number;
  longitude: number;
}

// Known verified coordinates for specific corridors across Tamil Nadu (ground truth from OpenStreetMap)
const VERIFIED_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Mettupalayam (Coimbatore)
  "black thunder road_mettupalayam": { lat: 11.324448, lon: 76.912938 },
  "mettupalayam bus stand_mettupalayam": { lat: 11.302284, lon: 76.937669 },
  "railway station area_mettupalayam": { lat: 11.297216, lon: 76.935934 },
  "sirumugai road_mettupalayam": { lat: 11.318200, lon: 77.006500 },

  // Coimbatore
  "avinashi road_coimbatore": { lat: 11.024500, lon: 77.010200 },
  "gandhipuram bus stand_coimbatore": { lat: 11.014092, lon: 76.966940 },
  "rs puram area_coimbatore": { lat: 11.008018, lon: 76.950166 },
  "trichy road corridor_coimbatore": { lat: 11.002100, lon: 76.984500 },

  // Chennai
  "anna salai_chennai": { lat: 13.060480, lon: 80.261157 },
  "omr (rajiv gandhi salai)_chennai": { lat: 12.934800, lon: 80.231200 },
  "gst road_chennai": { lat: 12.981500, lon: 80.198300 },
  "poonamallee high road_chennai": { lat: 13.080500, lon: 80.237200 },

  // Salem
  "five roads junction_salem": { lat: 11.670500, lon: 78.132100 },
  "salem new bus stand_salem": { lat: 11.669613, lon: 78.140156 },
  "cherry road corridor_salem": { lat: 11.661200, lon: 78.156500 },
  "junction main road_salem": { lat: 11.654000, lon: 78.128000 },

  // Namakkal
  "namakkal bus stand area_namakkal": { lat: 11.219986, lon: 78.168072 },
  "namakkal town centre_namakkal": { lat: 11.218900, lon: 78.167400 },
  "mohanur road corridor_namakkal": { lat: 11.215500, lon: 78.163000 },
  "salem road corridor_namakkal": { lat: 11.229000, lon: 78.168500 },
  "paramathi road corridor_namakkal": { lat: 11.208500, lon: 78.159000 },
  "tiruchengode road corridor_namakkal": { lat: 11.224000, lon: 78.154000 },

  // Tiruchengode
  "arthanareeswarar temple road_tiruchengode": { lat: 11.372602, lon: 77.898077 },
  "tiruchengode bus stand_tiruchengode": { lat: 11.381177, lon: 77.895091 },
  "salem main road_tiruchengode": { lat: 11.385000, lon: 77.902000 },
  "kandampalayam road_tiruchengode": { lat: 11.374000, lon: 77.889000 },

  // Gobichettipalayam
  "erode main road_gobichettipalayam": { lat: 11.455000, lon: 77.443000 },
  "gobichettipalayam bus stand_gobichettipalayam": { lat: 11.453500, lon: 77.441500 },
  "nambiyur road_gobichettipalayam": { lat: 11.458000, lon: 77.435000 },
  "sathy road_gobichettipalayam": { lat: 11.459500, lon: 77.438000 },

  // Pollachi
  "aliyar road_pollachi": { lat: 10.612000, lon: 76.975000 },
  "pollachi bus stand_pollachi": { lat: 10.662523, lon: 77.006319 },
  "palakkad road_pollachi": { lat: 10.665000, lon: 76.932000 },
  "udumalpet road_pollachi": { lat: 10.652000, lon: 76.965000 },

  // Kodaikanal
  "coaker walk area_kodaikanal": { lat: 10.232328, lon: 77.493770 },
  "kodaikanal bus stand_kodaikanal": { lat: 10.235433, lon: 77.493115 },
  "observatory road_kodaikanal": { lat: 10.231000, lon: 77.472000 },
  "seven roads junction_kodaikanal": { lat: 10.234500, lon: 77.488000 },

  // Yercaud
  "pagoda point road_yercaud": { lat: 11.778000, lon: 78.223000 },
  "salem ghat road_yercaud": { lat: 11.770000, lon: 78.205000 },
  "yercaud bus stand_yercaud": { lat: 11.776765, lon: 78.209127 },
  "yercaud lake area_yercaud": { lat: 11.783274, lon: 78.210469 }
};

const specificAreas: Record<string, string[]> = {
  Mettupalayam: ['Black Thunder Road', 'Mettupalayam Bus Stand', 'Railway Station Area', 'Sirumugai Road'],
  Coimbatore: ['Avinashi Road', 'Gandhipuram Bus Stand', 'RS Puram Area', 'Trichy Road Corridor'],
  Chennai: ['Anna Salai', 'OMR (Rajiv Gandhi Salai)', 'GST Road', 'Poonamallee High Road'],
  Salem: ['Five Roads Junction', 'Salem New Bus Stand', 'Cherry Road Corridor', 'Junction Main Road'],
  Namakkal: ['Namakkal Bus Stand Area', 'Mohanur Road Corridor', 'Salem Road Corridor', 'Paramathi Road Corridor', 'Tiruchengode Road Corridor'],
  Tiruchengode: ['Arthanareeswarar Temple Road', 'Kandampalayam Road', 'Salem Main Road', 'Tiruchengode Bus Stand'],
  Gobichettipalayam: ['Erode Main Road', 'Gobichettipalayam Bus Stand', 'Nambiyur Road', 'Sathy Road'],
  Pollachi: ['Aliyar Road', 'Palakkad Road', 'Pollachi Bus Stand', 'Udumalpet Road'],
  Kodaikanal: ['Coaker Walk Area', 'Kodaikanal Bus Stand', 'Observatory Road', 'Seven Roads Junction'],
  Yercaud: ['Pagoda Point Road', 'Salem Ghat Road', 'Yercaud Bus Stand', 'Yercaud Lake Area']
};

function getAreaNames(place: TamilNaduPlace): string[] {
  const specific = specificAreas[place.name];
  if (specific && specific.length > 0) {
    return specific;
  }
  return [
    `${place.name} Bus Stand Area`,
    `${place.name} Town Centre`,
    `${place.name} Main Road Corridor`,
    `${place.name} Market Area`
  ];
}

export function getAreaOptions(place: TamilNaduPlace): TamilNaduArea[] {
  return getAreaNames(place).map((name) => {
    const key = `${name.toLowerCase()}_${place.name.toLowerCase()}`;
    const verified = VERIFIED_COORDINATES[key];
    if (verified) {
      return {
        name,
        latitude: verified.lat,
        longitude: verified.lon
      };
    }
    return {
      name,
      latitude: place.latitude,
      longitude: place.longitude
    };
  });
}

export function getAreaSuggestions(place: TamilNaduPlace): string[] {
  return getAreaOptions(place).map((area) => area.name);
}
