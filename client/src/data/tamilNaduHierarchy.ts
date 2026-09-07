export interface LocationPlace {
  name: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'town' | 'village';
}

export interface DistrictHierarchy {
  district: string;
  latitude: number;
  longitude: number;
  cities: LocationPlace[];
  towns: LocationPlace[];
  villages: LocationPlace[];
}

export const TAMIL_NADU_DISTRICTS: DistrictHierarchy[] = [
  {
    district: 'Ariyalur',
    latitude: 11.1401,
    longitude: 79.0786,
    cities: [{ name: 'Ariyalur City', latitude: 11.1401, longitude: 79.0786, type: 'city' }],
    towns: [
      { name: 'Jayankondam', latitude: 11.2126, longitude: 79.3656, type: 'town' },
      { name: 'Sendurai', latitude: 11.2734, longitude: 79.0720, type: 'town' },
      { name: 'Andimadam', latitude: 11.2486, longitude: 79.2312, type: 'town' },
    ],
    villages: [
      { name: 'Gangaikonda Cholapuram', latitude: 11.2062, longitude: 79.4502, type: 'village' },
      { name: 'T.Pazhur', latitude: 11.0820, longitude: 79.3100, type: 'village' },
      { name: 'Varadarajanpettai', latitude: 11.2380, longitude: 79.3240, type: 'village' },
    ],
  },
  {
    district: 'Chengalpattu',
    latitude: 12.6819,
    longitude: 79.9888,
    cities: [
      { name: 'Chengalpattu City', latitude: 12.6819, longitude: 79.9888, type: 'city' },
      { name: 'Tambaram', latitude: 12.9249, longitude: 80.1000, type: 'city' },
      { name: 'Pallavaram', latitude: 12.9675, longitude: 80.1491, type: 'city' },
    ],
    towns: [
      { name: 'Mahabalipuram', latitude: 12.6208, longitude: 80.1945, type: 'town' },
      { name: 'Madurantakam', latitude: 12.5116, longitude: 79.8840, type: 'town' },
      { name: 'Guduvancheri', latitude: 12.8439, longitude: 80.0630, type: 'town' },
      { name: 'Maraimalai Nagar', latitude: 12.7950, longitude: 80.0250, type: 'town' },
    ],
    villages: [
      { name: 'Tiruporur Rural', latitude: 12.7240, longitude: 80.1870, type: 'village' },
      { name: 'Sadras Village', latitude: 12.5180, longitude: 80.1600, type: 'village' },
      { name: 'Cheyyur Coastal', latitude: 12.3500, longitude: 80.0100, type: 'village' },
    ],
  },
  {
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    cities: [
      { name: 'Chennai Central', latitude: 13.0827, longitude: 80.2707, type: 'city' },
      { name: 'Adyar', latitude: 13.0064, longitude: 80.2574, type: 'city' },
      { name: 'Anna Nagar', latitude: 13.0878, longitude: 80.2155, type: 'city' },
      { name: 'T. Nagar', latitude: 13.0418, longitude: 80.2341, type: 'city' },
      { name: 'Guindy', latitude: 13.0067, longitude: 80.2025, type: 'city' },
    ],
    towns: [
      { name: 'Mylapore', latitude: 13.0336, longitude: 80.2678, type: 'town' },
      { name: 'Royapuram', latitude: 13.1118, longitude: 80.2974, type: 'town' },
      { name: 'Velachery', latitude: 12.9790, longitude: 80.2180, type: 'town' },
      { name: 'Sholinganallur', latitude: 12.9010, longitude: 80.2279, type: 'town' },
    ],
    villages: [
      { name: 'Ennore Creek Outpost', latitude: 13.2080, longitude: 80.3200, type: 'village' },
      { name: 'Madhavaram Rural', latitude: 13.1530, longitude: 80.2280, type: 'village' },
      { name: 'Uthandi Beach Belt', latitude: 12.8680, longitude: 80.2450, type: 'village' },
    ],
  },
  {
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    cities: [
      { name: 'Coimbatore City', latitude: 11.0168, longitude: 76.9558, type: 'city' },
      { name: 'Pollachi', latitude: 10.6588, longitude: 76.9482, type: 'city' },
    ],
    towns: [
      { name: 'Mettupalayam', latitude: 11.2997, longitude: 76.9348, type: 'town' },
      { name: 'Sulur', latitude: 11.0260, longitude: 77.1260, type: 'town' },
      { name: 'Valparai', latitude: 10.3264, longitude: 76.9514, type: 'town' },
      { name: 'Annur', latitude: 11.2330, longitude: 77.1080, type: 'town' },
    ],
    villages: [
      { name: 'Karamadai Foothills', latitude: 11.2420, longitude: 76.9600, type: 'village' },
      { name: 'Madukkarai Rural', latitude: 10.9020, longitude: 76.9600, type: 'village' },
      { name: 'Kinathukadavu West', latitude: 10.8200, longitude: 77.0200, type: 'village' },
    ],
  },
  {
    district: 'Cuddalore',
    latitude: 11.7480,
    longitude: 79.7714,
    cities: [
      { name: 'Cuddalore City', latitude: 11.7480, longitude: 79.7714, type: 'city' },
      { name: 'Chidambaram', latitude: 11.3993, longitude: 79.6911, type: 'city' },
    ],
    towns: [
      { name: 'Panruti', latitude: 11.7766, longitude: 79.5521, type: 'town' },
      { name: 'Virudhachalam', latitude: 11.5210, longitude: 79.3247, type: 'town' },
      { name: 'Neyveli Township', latitude: 11.5360, longitude: 79.4850, type: 'town' },
      { name: 'Tittakudi', latitude: 11.4120, longitude: 79.1170, type: 'town' },
    ],
    villages: [
      { name: 'Pichavaram Mangrove Area', latitude: 11.4280, longitude: 79.7820, type: 'village' },
      { name: 'Parangipettai Coastal', latitude: 11.4980, longitude: 79.7650, type: 'village' },
      { name: 'Kattumannarkoil Rural', latitude: 11.2750, longitude: 79.5580, type: 'village' },
    ],
  },
  {
    district: 'Dharmapuri',
    latitude: 12.1211,
    longitude: 78.1582,
    cities: [{ name: 'Dharmapuri City', latitude: 12.1211, longitude: 78.1582, type: 'city' }],
    towns: [
      { name: 'Harur', latitude: 12.0527, longitude: 78.4804, type: 'town' },
      { name: 'Pennagaram', latitude: 12.1348, longitude: 77.8950, type: 'town' },
      { name: 'Palacode', latitude: 12.3030, longitude: 78.0701, type: 'town' },
      { name: 'Pappireddipatti', latitude: 11.9160, longitude: 78.3660, type: 'town' },
    ],
    villages: [
      { name: 'Hogenakkal Falls Belt', latitude: 12.1180, longitude: 77.7760, type: 'village' },
      { name: 'Karimangalam Rural', latitude: 12.3080, longitude: 78.2080, type: 'village' },
      { name: 'Marandahalli Village', latitude: 12.4040, longitude: 78.0060, type: 'village' },
    ],
  },
  {
    district: 'Dindigul',
    latitude: 10.3673,
    longitude: 77.9803,
    cities: [
      { name: 'Dindigul City', latitude: 10.3673, longitude: 77.9803, type: 'city' },
      { name: 'Palani', latitude: 10.4503, longitude: 77.5209, type: 'city' },
    ],
    towns: [
      { name: 'Kodaikanal', latitude: 10.2381, longitude: 77.4892, type: 'town' },
      { name: 'Oddanchatram', latitude: 10.4880, longitude: 77.7540, type: 'town' },
      { name: 'Natham', latitude: 10.2280, longitude: 78.2380, type: 'town' },
      { name: 'Nilakottai', latitude: 10.1650, longitude: 77.8630, type: 'town' },
    ],
    villages: [
      { name: 'Vedasandur Rural', latitude: 10.5310, longitude: 77.9540, type: 'village' },
      { name: 'Ayyalur Foothills', latitude: 10.4850, longitude: 78.1880, type: 'village' },
      { name: 'Pannaikadu Hill Village', latitude: 10.1850, longitude: 77.6350, type: 'village' },
    ],
  },
  {
    district: 'Erode',
    latitude: 11.3410,
    longitude: 77.7172,
    cities: [{ name: 'Erode City', latitude: 11.3410, longitude: 77.7172, type: 'city' }],
    towns: [
      { name: 'Gobichettipalayam', latitude: 11.4540, longitude: 77.4422, type: 'town' },
      { name: 'Bhavani', latitude: 11.4455, longitude: 77.6821, type: 'town' },
      { name: 'Sathyamangalam', latitude: 11.5053, longitude: 77.2385, type: 'town' },
      { name: 'Perundurai', latitude: 11.2760, longitude: 77.5840, type: 'town' },
    ],
    villages: [
      { name: 'Bhavanisagar Dam Area', latitude: 11.4720, longitude: 77.1350, type: 'village' },
      { name: 'Kodumudi Kaveri Bank', latitude: 11.0800, longitude: 77.8840, type: 'village' },
      { name: 'Anthiyur Forest Fringe', latitude: 11.5830, longitude: 77.5880, type: 'village' },
    ],
  },
  {
    district: 'Kallakurichi',
    latitude: 11.7404,
    longitude: 78.9597,
    cities: [{ name: 'Kallakurichi City', latitude: 11.7404, longitude: 78.9597, type: 'city' }],
    towns: [
      { name: 'Ulundurpettai', latitude: 11.6976, longitude: 79.2823, type: 'town' },
      { name: 'Sankarapuram', latitude: 11.8877, longitude: 78.9200, type: 'town' },
      { name: 'Chinnasalem', latitude: 11.6359, longitude: 78.8740, type: 'town' },
      { name: 'Tirukkoyilur', latitude: 11.9660, longitude: 79.2020, type: 'town' },
    ],
    villages: [
      { name: 'Kalvarayan Hills Village', latitude: 11.8850, longitude: 78.7200, type: 'village' },
      { name: 'Rishivandiyam Rural', latitude: 11.8100, longitude: 79.0800, type: 'village' },
      { name: 'Manalurpettai Village', latitude: 12.0050, longitude: 79.0850, type: 'village' },
    ],
  },
  {
    district: 'Kancheepuram',
    latitude: 12.8342,
    longitude: 79.7036,
    cities: [{ name: 'Kancheepuram City', latitude: 12.8342, longitude: 79.7036, type: 'city' }],
    towns: [
      { name: 'Sriperumbudur', latitude: 12.9676, longitude: 79.9410, type: 'town' },
      { name: 'Walajabad', latitude: 12.7908, longitude: 79.8230, type: 'town' },
      { name: 'Uthiramerur', latitude: 12.6176, longitude: 79.7586, type: 'town' },
      { name: 'Kundrathur', latitude: 12.9970, longitude: 80.0970, type: 'town' },
    ],
    villages: [
      { name: 'Sunguvarchatram Industrial', latitude: 12.9420, longitude: 79.8350, type: 'village' },
      { name: 'Parandur Airport Site', latitude: 12.9220, longitude: 79.7650, type: 'village' },
      { name: 'Pazhayanur Village', latitude: 12.7200, longitude: 79.7900, type: 'village' },
    ],
  },
  {
    district: 'Kanyakumari',
    latitude: 8.0883,
    longitude: 77.5385,
    cities: [{ name: 'Nagercoil City', latitude: 8.1833, longitude: 77.4119, type: 'city' }],
    towns: [
      { name: 'Kanyakumari Cape', latitude: 8.0883, longitude: 77.5385, type: 'town' },
      { name: 'Padmanabhapuram', latitude: 8.2430, longitude: 77.3290, type: 'town' },
      { name: 'Colachel Port', latitude: 8.1770, longitude: 77.2580, type: 'town' },
      { name: 'Marthandam', latitude: 8.3030, longitude: 77.2210, type: 'town' },
    ],
    villages: [
      { name: 'Vattakottai Coastal Village', latitude: 8.1250, longitude: 77.5680, type: 'village' },
      { name: 'Thirparappu Falls Sector', latitude: 8.3750, longitude: 77.2600, type: 'village' },
      { name: 'Pechiparai Dam Catchment', latitude: 8.4450, longitude: 77.3200, type: 'village' },
    ],
  },
  {
    district: 'Karur',
    latitude: 10.9601,
    longitude: 78.0766,
    cities: [{ name: 'Karur City', latitude: 10.9601, longitude: 78.0766, type: 'city' }],
    towns: [
      { name: 'Kulithalai', latitude: 10.9342, longitude: 78.4120, type: 'town' },
      { name: 'Aravakurichi', latitude: 10.7714, longitude: 77.9182, type: 'town' },
      { name: 'Pugalur TNPL Hub', latitude: 11.0865, longitude: 77.9360, type: 'town' },
      { name: 'Krishnarayapuram', latitude: 10.9450, longitude: 78.2810, type: 'town' },
    ],
    villages: [
      { name: 'Mayanur Barrage Belt', latitude: 10.9250, longitude: 78.2320, type: 'village' },
      { name: 'Kadavur Slender Loris Zone', latitude: 10.6020, longitude: 78.1880, type: 'village' },
      { name: 'Thoranakkalpatti Village', latitude: 10.9200, longitude: 78.0400, type: 'village' },
    ],
  },
  {
    district: 'Krishnagiri',
    latitude: 12.5186,
    longitude: 78.2137,
    cities: [
      { name: 'Hosur Industrial City', latitude: 12.7409, longitude: 77.8253, type: 'city' },
      { name: 'Krishnagiri City', latitude: 12.5186, longitude: 78.2137, type: 'city' },
    ],
    towns: [
      { name: 'Bargur', latitude: 12.5450, longitude: 78.3560, type: 'town' },
      { name: 'Denkanikottai', latitude: 12.5300, longitude: 77.7900, type: 'town' },
      { name: 'Pochampalli', latitude: 12.3380, longitude: 78.3680, type: 'town' },
      { name: 'Uthangarai', latitude: 12.2650, longitude: 78.5380, type: 'town' },
    ],
    villages: [
      { name: 'Kelamangalam Green Belt', latitude: 12.6020, longitude: 77.8540, type: 'village' },
      { name: 'Rayakottai Fort Village', latitude: 12.5180, longitude: 78.0350, type: 'village' },
      { name: 'Thally Little England', latitude: 12.5850, longitude: 77.6850, type: 'village' },
    ],
  },
  {
    district: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    cities: [{ name: 'Madurai Corporation', latitude: 9.9252, longitude: 78.1198, type: 'city' }],
    towns: [
      { name: 'Melur', latitude: 10.0324, longitude: 78.3395, type: 'town' },
      { name: 'Thirumangalam', latitude: 9.8247, longitude: 77.9864, type: 'town' },
      { name: 'Usilampatti', latitude: 9.9694, longitude: 77.7874, type: 'town' },
      { name: 'Sholavandan', latitude: 10.0220, longitude: 77.9620, type: 'town' },
    ],
    villages: [
      { name: 'Alanganallur Jallikattu Village', latitude: 10.0450, longitude: 78.0850, type: 'village' },
      { name: 'Keezhadi Heritage Sector', latitude: 9.8650, longitude: 78.1920, type: 'village' },
      { name: 'Tirupparankundram Rural', latitude: 9.8820, longitude: 78.0710, type: 'village' },
    ],
  },
  {
    district: 'Mayiladuthurai',
    latitude: 11.1035,
    longitude: 79.6550,
    cities: [{ name: 'Mayiladuthurai City', latitude: 11.1035, longitude: 79.6550, type: 'city' }],
    towns: [
      { name: 'Sirkazhi', latitude: 11.2376, longitude: 79.7357, type: 'town' },
      { name: 'Kuthalam', latitude: 11.0770, longitude: 79.5310, type: 'town' },
      { name: 'Tharangambadi (Tranquebar)', latitude: 11.0310, longitude: 79.8510, type: 'town' },
    ],
    villages: [
      { name: 'Poompuhar Coastal Belt', latitude: 11.1450, longitude: 79.8540, type: 'village' },
      { name: 'Vaitheeswarankoil Rural', latitude: 11.2010, longitude: 79.7120, type: 'village' },
      { name: 'Sembanarkoil Village', latitude: 11.1120, longitude: 79.7420, type: 'village' },
    ],
  },
  {
    district: 'Nagapattinam',
    latitude: 10.7672,
    longitude: 79.8449,
    cities: [{ name: 'Nagapattinam Port City', latitude: 10.7672, longitude: 79.8449, type: 'city' }],
    towns: [
      { name: 'Velankanni', latitude: 10.6833, longitude: 79.8430, type: 'town' },
      { name: 'Vedaranyam', latitude: 10.3720, longitude: 79.8500, type: 'town' },
      { name: 'Kilvelur', latitude: 10.7670, longitude: 79.7560, type: 'town' },
    ],
    villages: [
      { name: 'Point Calimere Sanctuary', latitude: 10.3010, longitude: 79.8650, type: 'village' },
      { name: 'Thirukkuvalai Village', latitude: 10.6280, longitude: 79.7120, type: 'village' },
      { name: 'Nagore Coastal Ward', latitude: 10.8250, longitude: 79.8450, type: 'village' },
    ],
  },
  {
    district: 'Namakkal',
    latitude: 11.2189,
    longitude: 78.1674,
    cities: [
      { name: 'Namakkal City', latitude: 11.2189, longitude: 78.1674, type: 'city' },
      { name: 'Tiruchengode', latitude: 11.3802, longitude: 77.8944, type: 'city' },
    ],
    towns: [
      { name: 'Rasipuram', latitude: 11.4601, longitude: 77.7510, type: 'town' },
      { name: 'Paramathi Velur', latitude: 11.1024, longitude: 78.0013, type: 'town' },
      { name: 'Kumarapalayam', latitude: 11.4420, longitude: 77.7120, type: 'town' },
      { name: 'Sendamangalam', latitude: 11.2850, longitude: 78.2420, type: 'town' },
    ],
    villages: [
      { name: 'Kolli Hills (Semmedu)', latitude: 11.2580, longitude: 78.3450, type: 'village' },
      { name: 'Mohanur Kaveri Bank', latitude: 11.0650, longitude: 78.1450, type: 'village' },
      { name: 'Puduchatram Poultry Hub', latitude: 11.3250, longitude: 78.1580, type: 'village' },
      { name: 'Riverside Corridor Colony', latitude: 11.2120, longitude: 78.1590, type: 'village' },
    ],
  },
  {
    district: 'Nilgiris',
    latitude: 11.4064,
    longitude: 76.6932,
    cities: [{ name: 'Udhagamandalam (Ooty)', latitude: 11.4064, longitude: 76.6932, type: 'city' }],
    towns: [
      { name: 'Coonoor', latitude: 11.3530, longitude: 76.7950, type: 'town' },
      { name: 'Kotagiri', latitude: 11.4200, longitude: 76.8600, type: 'town' },
      { name: 'Gudalur', latitude: 11.5000, longitude: 76.4900, type: 'town' },
    ],
    villages: [
      { name: 'Mudumalai Tiger Reserve Hub', latitude: 11.5800, longitude: 76.5800, type: 'village' },
      { name: 'Ketti Valley Village', latitude: 11.3780, longitude: 76.7320, type: 'village' },
      { name: 'Kundah Dam Settlement', latitude: 11.2850, longitude: 76.6500, type: 'village' },
    ],
  },
  {
    district: 'Perambalur',
    latitude: 11.2342,
    longitude: 78.8809,
    cities: [{ name: 'Perambalur City', latitude: 11.2342, longitude: 78.8809, type: 'city' }],
    towns: [
      { name: 'Veppanthattai', latitude: 11.4010, longitude: 78.8460, type: 'town' },
      { name: 'Kunnam', latitude: 11.2230, longitude: 78.8360, type: 'town' },
      { name: 'Arumbavur', latitude: 11.3800, longitude: 78.7310, type: 'town' },
    ],
    villages: [
      { name: 'Padalur Special Economic Zone', latitude: 11.1680, longitude: 78.8650, type: 'village' },
      { name: 'Chettikulam Temple Village', latitude: 11.1450, longitude: 78.7850, type: 'village' },
      { name: 'Labbaikudikadu Village', latitude: 11.3450, longitude: 78.9600, type: 'village' },
    ],
  },
  {
    district: 'Pudukkottai',
    latitude: 10.3797,
    longitude: 78.8208,
    cities: [{ name: 'Pudukkottai City', latitude: 10.3797, longitude: 78.8208, type: 'city' }],
    towns: [
      { name: 'Aranthangi', latitude: 10.1724, longitude: 79.0015, type: 'town' },
      { name: 'Alangudi', latitude: 10.3600, longitude: 79.3900, type: 'town' },
      { name: 'Iluppur', latitude: 10.5130, longitude: 78.6240, type: 'town' },
      { name: 'Gandarvakottai', latitude: 10.5850, longitude: 79.0120, type: 'town' },
    ],
    villages: [
      { name: 'Sittannavasal Cave Area', latitude: 10.4650, longitude: 78.7350, type: 'village' },
      { name: 'Kudumiyanmalai Village', latitude: 10.4250, longitude: 78.6550, type: 'village' },
      { name: 'Avudaiyarkoil Rural', latitude: 10.0850, longitude: 79.0450, type: 'village' },
    ],
  },
  {
    district: 'Ramanathapuram',
    latitude: 9.3639,
    longitude: 78.8395,
    cities: [{ name: 'Ramanathapuram City', latitude: 9.3639, longitude: 78.8395, type: 'city' }],
    towns: [
      { name: 'Rameswaram Island', latitude: 9.2885, longitude: 79.3129, type: 'town' },
      { name: 'Paramakudi', latitude: 9.5465, longitude: 78.5906, type: 'town' },
      { name: 'Kilakarai', latitude: 9.2310, longitude: 78.7840, type: 'town' },
      { name: 'Mudukulathur', latitude: 9.3410, longitude: 78.5100, type: 'town' },
    ],
    villages: [
      { name: 'Dhanushkodi Land End', latitude: 9.1760, longitude: 79.4180, type: 'village' },
      { name: 'Pamban Bridge Fishing Hamlet', latitude: 9.2780, longitude: 79.2080, type: 'village' },
      { name: 'Mandapam Marine Sanctuary', latitude: 9.2850, longitude: 79.1250, type: 'village' },
    ],
  },
  {
    district: 'Ranipet',
    latitude: 12.9249,
    longitude: 79.3333,
    cities: [
      { name: 'Ranipet Industrial City', latitude: 12.9249, longitude: 79.3333, type: 'city' },
      { name: 'Arcot', latitude: 12.9040, longitude: 79.3190, type: 'city' },
    ],
    towns: [
      { name: 'Walajah', latitude: 12.9340, longitude: 79.3660, type: 'town' },
      { name: 'Sholinghur', latitude: 13.1180, longitude: 79.4200, type: 'town' },
      { name: 'Arakkonam Rail Junction', latitude: 13.0850, longitude: 79.6720, type: 'town' },
    ],
    villages: [
      { name: 'Nemili Rural', latitude: 13.0200, longitude: 79.5850, type: 'village' },
      { name: 'Kaveripakkam Tank Area', latitude: 12.8950, longitude: 79.4650, type: 'village' },
      { name: 'Thakkolam Battlefield Village', latitude: 13.0180, longitude: 79.7150, type: 'village' },
    ],
  },
  {
    district: 'Salem',
    latitude: 11.6643,
    longitude: 78.1460,
    cities: [
      { name: 'Salem Corporation', latitude: 11.6643, longitude: 78.1460, type: 'city' },
      { name: 'Mettur Dam City', latitude: 11.7863, longitude: 77.8008, type: 'city' },
    ],
    towns: [
      { name: 'Attur', latitude: 11.5941, longitude: 78.6010, type: 'town' },
      { name: 'Yercaud Hill Station', latitude: 11.7753, longitude: 78.2093, type: 'town' },
      { name: 'Sankari', latitude: 11.4850, longitude: 77.8650, type: 'town' },
      { name: 'Omalur', latitude: 11.7450, longitude: 78.0450, type: 'town' },
    ],
    villages: [
      { name: 'Mettur Dam Sluice Headworks', latitude: 11.7980, longitude: 77.8050, type: 'village' },
      { name: 'Mecheri Village', latitude: 11.8550, longitude: 77.9450, type: 'village' },
      { name: 'Jalakandapuram Weaving Cluster', latitude: 11.6950, longitude: 77.8850, type: 'village' },
    ],
  },
  {
    district: 'Sivaganga',
    latitude: 9.8433,
    longitude: 78.4809,
    cities: [
      { name: 'Karaikudi Heritage City', latitude: 10.0731, longitude: 78.7802, type: 'city' },
      { name: 'Sivaganga City', latitude: 9.8433, longitude: 78.4809, type: 'city' },
    ],
    towns: [
      { name: 'Devakottai', latitude: 9.9470, longitude: 78.8230, type: 'town' },
      { name: 'Manamadurai', latitude: 9.7049, longitude: 78.5090, type: 'town' },
      { name: 'Tiruppuvanam', latitude: 9.8650, longitude: 78.2850, type: 'town' },
    ],
    villages: [
      { name: 'Kanadukathan Chettinad Palace', latitude: 10.1550, longitude: 78.7850, type: 'village' },
      { name: 'Kalayarkoil Historical Village', latitude: 9.8550, longitude: 78.6550, type: 'village' },
      { name: 'Ilayangudi Rural', latitude: 9.6350, longitude: 78.6320, type: 'village' },
    ],
  },
  {
    district: 'Tenkasi',
    latitude: 8.9590,
    longitude: 77.3152,
    cities: [{ name: 'Tenkasi City', latitude: 8.9590, longitude: 77.3152, type: 'city' }],
    towns: [
      { name: 'Sankarankovil', latitude: 9.1700, longitude: 77.5400, type: 'town' },
      { name: 'Courtallam Falls Town', latitude: 8.9342, longitude: 77.2750, type: 'town' },
      { name: 'Kadayanallur', latitude: 9.0730, longitude: 77.3460, type: 'town' },
      { name: 'Shenkottai', latitude: 8.9850, longitude: 77.2450, type: 'town' },
    ],
    villages: [
      { name: 'Ayikudi Village', latitude: 8.9750, longitude: 77.3450, type: 'village' },
      { name: 'Alangulam Agro Settlement', latitude: 8.8750, longitude: 77.5020, type: 'village' },
      { name: 'Vasudevanallur Foothills', latitude: 9.2350, longitude: 77.4180, type: 'village' },
    ],
  },
  {
    district: 'Thanjavur',
    latitude: 10.7867,
    longitude: 79.1378,
    cities: [
      { name: 'Thanjavur Royal City', latitude: 10.7867, longitude: 79.1378, type: 'city' },
      { name: 'Kumbakonam Temple City', latitude: 10.9602, longitude: 79.3845, type: 'city' },
    ],
    towns: [
      { name: 'Pattukkottai', latitude: 10.4236, longitude: 79.3195, type: 'town' },
      { name: 'Orathanadu', latitude: 10.6180, longitude: 79.2680, type: 'town' },
      { name: 'Thiruvaiyaru', latitude: 10.8850, longitude: 79.1050, type: 'town' },
      { name: 'Peravurani', latitude: 10.3050, longitude: 79.1750, type: 'town' },
    ],
    villages: [
      { name: 'Swamimalai Bronze Heritage', latitude: 10.9550, longitude: 79.3250, type: 'village' },
      { name: 'Grand Anicut (Kallanai) Dam', latitude: 10.8350, longitude: 78.8250, type: 'village' },
      { name: 'Budalur Delta Village', latitude: 10.8050, longitude: 78.9850, type: 'village' },
    ],
  },
  {
    district: 'Theni',
    latitude: 10.0104,
    longitude: 77.4768,
    cities: [{ name: 'Theni City', latitude: 10.0104, longitude: 77.4768, type: 'city' }],
    towns: [
      { name: 'Periyakulam', latitude: 10.1227, longitude: 77.5480, type: 'town' },
      { name: 'Bodinayakanur Cardamom City', latitude: 10.0107, longitude: 77.3497, type: 'town' },
      { name: 'Cumbum Valley', latitude: 9.7360, longitude: 77.2840, type: 'town' },
      { name: 'Uthamapalayam', latitude: 9.8050, longitude: 77.3250, type: 'town' },
    ],
    villages: [
      { name: 'Suruli Falls Eco Village', latitude: 9.6650, longitude: 77.2750, type: 'village' },
      { name: 'Chinnamanur Cotton Belt', latitude: 9.8450, longitude: 77.3850, type: 'village' },
      { name: 'Andipatti Rural Sector', latitude: 10.0050, longitude: 77.6250, type: 'village' },
    ],
  },
  {
    district: 'Thoothukudi',
    latitude: 8.7642,
    longitude: 78.1348,
    cities: [{ name: 'Thoothukudi Pearl City', latitude: 8.7642, longitude: 78.1348, type: 'city' }],
    towns: [
      { name: 'Kovilpatti', latitude: 9.1716, longitude: 77.8689, type: 'town' },
      { name: 'Tiruchendur Coastal', latitude: 8.4973, longitude: 78.1198, type: 'town' },
      { name: 'Ettayapuram', latitude: 9.1440, longitude: 77.9900, type: 'town' },
      { name: 'Kayalpattinam', latitude: 8.5680, longitude: 78.1250, type: 'town' },
    ],
    villages: [
      { name: 'Kulasekharapatnam Spaceport', latitude: 8.4050, longitude: 78.0550, type: 'village' },
      { name: 'Vembar Salt Pans', latitude: 9.0750, longitude: 78.3550, type: 'village' },
      { name: 'Srivaikuntam Dam Village', latitude: 8.6250, longitude: 77.9250, type: 'village' },
    ],
  },
  {
    district: 'Tiruchirappalli',
    latitude: 10.7905,
    longitude: 78.7047,
    cities: [
      { name: 'Tiruchirappalli Corporation', latitude: 10.7905, longitude: 78.7047, type: 'city' },
      { name: 'Srirangam Island', latitude: 10.8624, longitude: 78.6875, type: 'city' },
    ],
    towns: [
      { name: 'Manapparai', latitude: 10.6076, longitude: 78.4250, type: 'town' },
      { name: 'Thuraiyur', latitude: 11.0964, longitude: 78.6030, type: 'town' },
      { name: 'Lalgudi', latitude: 10.8680, longitude: 78.8150, type: 'town' },
      { name: 'Musiri', latitude: 10.9450, longitude: 78.4550, type: 'town' },
    ],
    villages: [
      { name: 'Thiruverumbur BHEL Hub', latitude: 10.7850, longitude: 78.7650, type: 'village' },
      { name: 'Pachaimalai Hills Tribal Settlement', latitude: 11.2850, longitude: 78.6250, type: 'village' },
      { name: 'Navalur Kuttapattu Village', latitude: 10.7450, longitude: 78.6350, type: 'village' },
    ],
  },
  {
    district: 'Tirunelveli',
    latitude: 8.7139,
    longitude: 77.7567,
    cities: [{ name: 'Tirunelveli Corporation', latitude: 8.7139, longitude: 77.7567, type: 'city' }],
    towns: [
      { name: 'Ambasamudram', latitude: 8.7100, longitude: 77.4550, type: 'town' },
      { name: 'Nanguneri SEZ', latitude: 8.4930, longitude: 77.6580, type: 'town' },
      { name: 'Radhapuram Wind Corridor', latitude: 8.3150, longitude: 77.6850, type: 'town' },
      { name: 'Cheranmahadevi', latitude: 8.6850, longitude: 77.5650, type: 'town' },
    ],
    villages: [
      { name: 'Manimuthar Dam Area', latitude: 8.6250, longitude: 77.4150, type: 'village' },
      { name: 'Koodankulam Nuclear Park', latitude: 8.1750, longitude: 77.7120, type: 'village' },
      { name: 'Papanasam Riverhead Village', latitude: 8.7050, longitude: 77.3750, type: 'village' },
    ],
  },
  {
    district: 'Tirupathur',
    latitude: 12.4961,
    longitude: 78.5730,
    cities: [{ name: 'Tirupathur City', latitude: 12.4961, longitude: 78.5730, type: 'city' }],
    towns: [
      { name: 'Vaniyambadi Leather Hub', latitude: 12.6816, longitude: 78.6201, type: 'town' },
      { name: 'Ambur Footwear Corridor', latitude: 12.7916, longitude: 78.7164, type: 'town' },
      { name: 'Natrampalli', latitude: 12.5750, longitude: 78.5320, type: 'town' },
    ],
    villages: [
      { name: 'Yelagiri Hills (Athanavur)', latitude: 12.5780, longitude: 78.6380, type: 'village' },
      { name: 'Jolarpet Railway Colony', latitude: 12.5850, longitude: 78.5850, type: 'village' },
      { name: 'Kavalur Vainu Bappu Observatory', latitude: 12.5750, longitude: 78.8250, type: 'village' },
    ],
  },
  {
    district: 'Tiruppur',
    latitude: 11.1085,
    longitude: 77.3411,
    cities: [{ name: 'Tiruppur Corporation (Textile Capital)', latitude: 11.1085, longitude: 77.3411, type: 'city' }],
    towns: [
      { name: 'Dharapuram', latitude: 10.7383, longitude: 77.5322, type: 'town' },
      { name: 'Kangeyam', latitude: 11.0050, longitude: 77.5600, type: 'town' },
      { name: 'Udumalpet', latitude: 10.5881, longitude: 77.2474, type: 'town' },
      { name: 'Avinashi', latitude: 11.1920, longitude: 77.2680, type: 'town' },
      { name: 'Palladam High-Tech Weaving', latitude: 10.9980, longitude: 77.2850, type: 'town' },
    ],
    villages: [
      { name: 'Madathukulam Rural', latitude: 10.5650, longitude: 77.3750, type: 'village' },
      { name: 'Uthukuli Butter Valley', latitude: 11.1750, longitude: 77.4450, type: 'village' },
      { name: 'Amaravathi Dam Village', latitude: 10.4150, longitude: 77.2650, type: 'village' },
      { name: 'Tiruppur Netaji Apparel Park', latitude: 11.1350, longitude: 77.3850, type: 'village' },
    ],
  },
  {
    district: 'Tiruvallur',
    latitude: 13.1439,
    longitude: 79.9083,
    cities: [
      { name: 'Avadi City Corporation', latitude: 13.1147, longitude: 80.1098, type: 'city' },
      { name: 'Tiruvallur City', latitude: 13.1439, longitude: 79.9083, type: 'city' },
    ],
    towns: [
      { name: 'Ponneri', latitude: 13.3387, longitude: 80.1942, type: 'town' },
      { name: 'Gummidipoondi Industrial SIPCOT', latitude: 13.4070, longitude: 80.1060, type: 'town' },
      { name: 'Poonamallee', latitude: 13.0480, longitude: 80.0920, type: 'town' },
      { name: 'Tiruttani Temple Town', latitude: 13.1850, longitude: 79.6250, type: 'town' },
    ],
    villages: [
      { name: 'Pulicat Lake Fishery Belt', latitude: 13.4180, longitude: 80.3150, type: 'village' },
      { name: 'Minjur Desalination Zone', latitude: 13.2750, longitude: 80.2550, type: 'village' },
      { name: 'Poondi Reservoir Headworks', latitude: 13.1950, longitude: 79.8650, type: 'village' },
    ],
  },
  {
    district: 'Tiruvannamalai',
    latitude: 12.2253,
    longitude: 79.0747,
    cities: [{ name: 'Tiruvannamalai City', latitude: 12.2253, longitude: 79.0747, type: 'city' }],
    towns: [
      { name: 'Arani Silk Town', latitude: 12.6670, longitude: 79.2850, type: 'town' },
      { name: 'Polur', latitude: 12.5120, longitude: 79.1240, type: 'town' },
      { name: 'Chengam', latitude: 12.3090, longitude: 78.7480, type: 'town' },
      { name: 'Cheyyar SIPCOT', latitude: 12.6550, longitude: 79.5450, type: 'town' },
    ],
    villages: [
      { name: 'Javadhu Hills Tribal Hamlet', latitude: 12.5850, longitude: 78.9250, type: 'village' },
      { name: 'Sathanur Dam Catchment', latitude: 12.1850, longitude: 78.8550, type: 'village' },
      { name: 'Vandavasi Historical Sector', latitude: 12.5050, longitude: 79.6150, type: 'village' },
    ],
  },
  {
    district: 'Tiruvarur',
    latitude: 10.7725,
    longitude: 79.6368,
    cities: [{ name: 'Tiruvarur Chariot City', latitude: 10.7725, longitude: 79.6368, type: 'city' }],
    towns: [
      { name: 'Mannargudi', latitude: 10.6663, longitude: 79.4500, type: 'town' },
      { name: 'Thiruthuraipoondi', latitude: 10.5280, longitude: 79.6370, type: 'town' },
      { name: 'Needamangalam', latitude: 10.7730, longitude: 79.4190, type: 'town' },
      { name: 'Kudavasal', latitude: 10.8750, longitude: 79.4850, type: 'town' },
    ],
    villages: [
      { name: 'Muthupet Mangrove Estuary', latitude: 10.4050, longitude: 79.5150, type: 'village' },
      { name: 'Valangaiman Agro Belt', latitude: 10.8850, longitude: 79.3850, type: 'village' },
      { name: 'Koradacheri Rural', latitude: 10.7850, longitude: 79.5250, type: 'village' },
    ],
  },
  {
    district: 'Vellore',
    latitude: 12.9165,
    longitude: 79.1325,
    cities: [{ name: 'Vellore Corporation', latitude: 12.9165, longitude: 79.1325, type: 'city' }],
    towns: [
      { name: 'Katpadi Junction', latitude: 12.9690, longitude: 79.1460, type: 'town' },
      { name: 'Gudiyatham', latitude: 12.9460, longitude: 78.8730, type: 'town' },
      { name: 'Pernambut', latitude: 12.9350, longitude: 78.7170, type: 'town' },
      { name: 'Anaicut', latitude: 12.8750, longitude: 78.9850, type: 'town' },
    ],
    villages: [
      { name: 'Virinjipuram Temple Settlement', latitude: 12.9150, longitude: 79.0250, type: 'village' },
      { name: 'Otteri Lake Catchment', latitude: 12.8850, longitude: 79.1450, type: 'village' },
      { name: 'Kaniyambadi Hill Foot', latitude: 12.8250, longitude: 79.1650, type: 'village' },
    ],
  },
  {
    district: 'Viluppuram',
    latitude: 11.9401,
    longitude: 79.4861,
    cities: [{ name: 'Viluppuram City', latitude: 11.9401, longitude: 79.4861, type: 'city' }],
    towns: [
      { name: 'Tindivanam', latitude: 12.2340, longitude: 79.6500, type: 'town' },
      { name: 'Gingee Fort Town', latitude: 12.2520, longitude: 79.4170, type: 'town' },
      { name: 'Vanur (Auroville Border)', latitude: 12.0150, longitude: 79.7250, type: 'town' },
      { name: 'Vikravandi', latitude: 12.0250, longitude: 79.5550, type: 'town' },
    ],
    villages: [
      { name: 'Marakkanam Salt Pans & Coast', latitude: 12.2050, longitude: 79.9450, type: 'village' },
      { name: 'Thiruvakkarai Fossil Wood Park', latitude: 12.0350, longitude: 79.6550, type: 'village' },
      { name: 'Ananthapuram Rural', latitude: 12.1850, longitude: 79.3850, type: 'village' },
    ],
  },
  {
    district: 'Virudhunagar',
    latitude: 9.5851,
    longitude: 77.9579,
    cities: [
      { name: 'Sivakasi Fireworks City', latitude: 9.4490, longitude: 77.7970, type: 'city' },
      { name: 'Rajapalayam Cotton City', latitude: 9.4520, longitude: 77.5530, type: 'city' },
      { name: 'Virudhunagar City', latitude: 9.5851, longitude: 77.9579, type: 'city' },
    ],
    towns: [
      { name: 'Aruppukkottai Weaving Town', latitude: 9.5120, longitude: 78.0960, type: 'town' },
      { name: 'Sattur Snacks Hub', latitude: 9.3620, longitude: 77.9150, type: 'town' },
      { name: 'Srivilliputhur Andal Town', latitude: 9.5120, longitude: 77.6320, type: 'town' },
    ],
    villages: [
      { name: 'Kariapatti Rural Sector', latitude: 9.6850, longitude: 78.0950, type: 'village' },
      { name: 'Watrap Foothills (Ayyanar Falls)', latitude: 9.6250, longitude: 77.5650, type: 'village' },
      { name: 'Vembakottai Excavation Zone', latitude: 9.3350, longitude: 77.7850, type: 'village' },
    ],
  },
];

export const DEFAULT_DISTRICT = TAMIL_NADU_DISTRICTS.find((d) => d.district === 'Namakkal') || TAMIL_NADU_DISTRICTS[0];

export function getDistrict(name: string): DistrictHierarchy | undefined {
  const norm = name.trim().toLowerCase();
  return TAMIL_NADU_DISTRICTS.find((d) => d.district.toLowerCase() === norm);
}

import { TAMIL_NADU_LOCALITIES_BY_DISTRICT } from './tamilNaduLocalities.js';

export function searchAllPlaces(query: string): Array<LocationPlace & { district: string }> {
  const norm = query.trim().toLowerCase();
  if (!norm) return [];

  const results: Array<LocationPlace & { district: string }> = [];

  for (const dist of TAMIL_NADU_DISTRICTS) {
    if (dist.district.toLowerCase().includes(norm)) {
      results.push({
        name: `${dist.district} District Centre`,
        latitude: dist.latitude,
        longitude: dist.longitude,
        type: 'city',
        district: dist.district,
      });
    }

    const all = [...dist.cities, ...dist.towns, ...dist.villages];
    for (const item of all) {
      if (item.name.toLowerCase().includes(norm)) {
        results.push({
          ...item,
          district: dist.district,
        });
      }
    }

    // Also match localities and wards
    const locData = TAMIL_NADU_LOCALITIES_BY_DISTRICT[dist.district];
    if (locData) {
      for (const loc of locData.localities) {
        if (loc.toLowerCase().includes(norm)) {
          results.push({
            name: loc,
            latitude: dist.latitude,
            longitude: dist.longitude,
            type: 'village',
            district: dist.district,
          });
        }
      }
      for (const ward of locData.wards) {
        if (ward.toLowerCase().includes(norm)) {
          results.push({
            name: ward,
            latitude: dist.latitude,
            longitude: dist.longitude,
            type: 'village',
            district: dist.district,
          });
        }
      }
    }
  }

  return results.slice(0, 20);
}
