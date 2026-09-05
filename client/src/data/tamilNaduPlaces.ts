export interface TamilNaduPlace {
  name: string;
  district: string;
  latitude: number;
  longitude: number;
}

// Approximate navigation points for search and map centering, not infrastructure data.
const places = (district: string, entries: Array<[string, number, number]>): TamilNaduPlace[] =>
  entries.map(([name, latitude, longitude]) => ({ name, district, latitude, longitude }));

export const TAMIL_NADU_PLACES: TamilNaduPlace[] = [
  ...places('Ariyalur', [['Ariyalur', 11.1401, 79.0786], ['Jayankondam', 11.2126, 79.3656], ['Andimadam', 11.2486, 79.2312], ['Sendurai', 11.2734, 79.0720]]),
  ...places('Chengalpattu', [['Chengalpattu', 12.6819, 79.9888], ['Tambaram', 12.9249, 80.1000], ['Mahabalipuram', 12.6208, 80.1945], ['Madurantakam', 12.5116, 79.8840]]),
  ...places('Chennai', [['Chennai', 13.0827, 80.2707], ['Ambattur', 13.1143, 80.1548], ['Madhavaram', 13.1482, 80.2314], ['Adyar', 13.0064, 80.2574]]),
  ...places('Coimbatore', [['Coimbatore', 11.0168, 76.9558], ['Mettupalayam', 11.2997, 76.9348], ['Pollachi', 10.6588, 76.9482], ['Valparai', 10.3264, 76.9514]]),
  ...places('Cuddalore', [['Cuddalore', 11.7480, 79.7714], ['Chidambaram', 11.3993, 79.6911], ['Panruti', 11.7766, 79.5521], ['Virudhachalam', 11.5210, 79.3247]]),
  ...places('Dharmapuri', [['Dharmapuri', 12.1211, 78.1582], ['Harur', 12.0527, 78.4804], ['Pennagaram', 12.1348, 77.8950], ['Palacode', 12.3030, 78.0701]]),
  ...places('Dindigul', [['Dindigul', 10.3673, 77.9803], ['Kodaikanal', 10.2381, 77.4892], ['Palani', 10.4503, 77.5209], ['Oddanchatram', 10.4880, 77.7540]]),
  ...places('Erode', [['Erode', 11.3410, 77.7172], ['Gobichettipalayam', 11.4540, 77.4422], ['Bhavani', 11.4455, 77.6821], ['Sathyamangalam', 11.5053, 77.2385]]),
  ...places('Kallakurichi', [['Kallakurichi', 11.7404, 78.9597], ['Ulundurpettai', 11.6976, 79.2823], ['Sankarapuram', 11.8877, 78.9200], ['Chinnasalem', 11.6359, 78.8740]]),
  ...places('Kancheepuram', [['Kancheepuram', 12.8342, 79.7036], ['Sriperumbudur', 12.9676, 79.9410], ['Walajabad', 12.7908, 79.8230], ['Uthiramerur', 12.6176, 79.7586]]),
  ...places('Karur', [['Karur', 10.9601, 78.0766], ['Kulithalai', 10.9342, 78.4120], ['Aravakurichi', 10.7714, 77.9182], ['Pugalur', 11.0865, 77.9360]]),
  ...places('Krishnagiri', [['Krishnagiri', 12.5186, 78.2137], ['Hosur', 12.7409, 77.8253], ['Bargur', 12.5450, 78.3560], ['Denkanikottai', 12.5300, 77.7900]]),
  ...places('Madurai', [['Madurai', 9.9252, 78.1198], ['Melur', 10.0324, 78.3395], ['Thirumangalam', 9.8247, 77.9864], ['Usilampatti', 9.9694, 77.7874]]),
  ...places('Mayiladuthurai', [['Mayiladuthurai', 11.1035, 79.6550], ['Sirkazhi', 11.2376, 79.7357], ['Kuthalam', 11.0770, 79.5310], ['Poompuhar', 11.1450, 79.8540]]),
  ...places('Nagapattinam', [['Nagapattinam', 10.7672, 79.8449], ['Velankanni', 10.6833, 79.8430], ['Vedaranyam', 10.3720, 79.8500], ['Kilvelur', 10.7670, 79.7560]]),
  ...places('Namakkal', [['Namakkal', 11.2189, 78.1674], ['Tiruchengode', 11.3802, 77.8944], ['Rasipuram', 11.4601, 77.7510], ['Paramathi Velur', 11.1024, 78.0013]]),
  ...places('Perambalur', [['Perambalur', 11.2342, 78.8809], ['Veppanthattai', 11.4010, 78.8460], ['Arumbavur', 11.3800, 78.7310], ['Kunnam', 11.2230, 78.8360]]),
  ...places('Pudukkottai', [['Pudukkottai', 10.3797, 78.8208], ['Aranthangi', 10.1724, 79.0015], ['Alangudi', 10.3600, 79.3900], ['Iluppur', 10.5130, 78.6240]]),
  ...places('Ramanathapuram', [['Ramanathapuram', 9.3639, 78.8395], ['Rameswaram', 9.2885, 79.3129], ['Paramakudi', 9.5465, 78.5906], ['Mudukulathur', 9.3410, 78.5100]]),
  ...places('Ranipet', [['Ranipet', 12.9249, 79.3333], ['Arcot', 12.9040, 79.3190], ['Walajah', 12.9340, 79.3660], ['Sholinghur', 13.1180, 79.4200]]),
  ...places('Salem', [['Salem', 11.6643, 78.1460], ['Mettur', 11.7863, 77.8008], ['Attur', 11.5941, 78.6010], ['Yercaud', 11.7753, 78.2093]]),
  ...places('Sivaganga', [['Sivaganga', 9.8433, 78.4809], ['Karaikudi', 10.0731, 78.7802], ['Devakottai', 9.9470, 78.8230], ['Manamadurai', 9.7049, 78.5090]]),
  ...places('Tenkasi', [['Tenkasi', 8.9590, 77.3152], ['Sankarankovil', 9.1700, 77.5400], ['Courtallam', 8.9342, 77.2750], ['Kadayanallur', 9.0730, 77.3460]]),
  ...places('Thanjavur', [['Thanjavur', 10.7867, 79.1378], ['Kumbakonam', 10.9602, 79.3845], ['Pattukkottai', 10.4236, 79.3195], ['Orathanadu', 10.6180, 79.2680]]),
  ...places('Theni', [['Theni', 10.0104, 77.4768], ['Periyakulam', 10.1227, 77.5480], ['Bodinayakanur', 10.0107, 77.3497], ['Cumbum', 9.7360, 77.2840]]),
  ...places('Thoothukudi', [['Thoothukudi', 8.7642, 78.1348], ['Kovilpatti', 9.1716, 77.8689], ['Tiruchendur', 8.4973, 78.1198], ['Ettayapuram', 9.1440, 77.9900]]),
  ...places('Tiruchirappalli', [['Tiruchirappalli', 10.7905, 78.7047], ['Srirangam', 10.8624, 78.6875], ['Manapparai', 10.6076, 78.4250], ['Thuraiyur', 11.0964, 78.6030]]),
  ...places('Tirunelveli', [['Tirunelveli', 8.7139, 77.7567], ['Ambasamudram', 8.7100, 77.4550], ['Nanguneri', 8.4930, 77.6580], ['Tisayanvilai', 8.3370, 77.8680]]),
  ...places('Tirupathur', [['Tirupathur', 12.4961, 78.5730], ['Vaniyambadi', 12.6816, 78.6201], ['Ambur', 12.7916, 78.7164], ['Natrampalli', 12.5750, 78.5320]]),
  ...places('Tiruppur', [['Tiruppur', 11.1085, 77.3411], ['Dharapuram', 10.7383, 77.5322], ['Kangeyam', 11.0050, 77.5600], ['Udumalpet', 10.5881, 77.2474]]),
  ...places('Tiruvallur', [['Tiruvallur', 13.1439, 79.9083], ['Ponneri', 13.3387, 80.1942], ['Gummidipoondi', 13.4070, 80.1060], ['Avadi', 13.1147, 80.1098]]),
  ...places('Tiruvannamalai', [['Tiruvannamalai', 12.2253, 79.0747], ['Arani', 12.6670, 79.2850], ['Polur', 12.5120, 79.1240], ['Chengam', 12.3090, 78.7480]]),
  ...places('Tiruvarur', [['Tiruvarur', 10.7725, 79.6368], ['Mannargudi', 10.6663, 79.4500], ['Thiruthuraipoondi', 10.5280, 79.6370], ['Needamangalam', 10.7730, 79.4190]]),
  ...places('Vellore', [['Vellore', 12.9165, 79.1325], ['Katpadi', 12.9690, 79.1460], ['Gudiyatham', 12.9460, 78.8730], ['Pernambut', 12.9350, 78.7170]]),
  ...places('Viluppuram', [['Viluppuram', 11.9401, 79.4861], ['Tindivanam', 12.2340, 79.6500], ['Gingee', 12.2520, 79.4170], ['Kandachipuram', 11.9900, 79.5000]]),
  ...places('Virudhunagar', [['Virudhunagar', 9.5851, 77.9579], ['Sivakasi', 9.4490, 77.7970], ['Rajapalayam', 9.4520, 77.5530], ['Aruppukkottai', 9.5120, 78.0960]]),
  ...places('The Nilgiris', [['Udhagamandalam', 11.4064, 76.6932], ['Coonoor', 11.3530, 76.7950], ['Gudalur', 11.5000, 76.4900], ['Kotagiri', 11.4200, 76.8600]])
];

export const DEFAULT_PLACE = TAMIL_NADU_PLACES.find((place) => place.name === 'Namakkal')!;

export function searchPlaces(query: string): TamilNaduPlace[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return TAMIL_NADU_PLACES;
  return TAMIL_NADU_PLACES.filter((place) =>
    `${place.name} ${place.district}`.toLowerCase().includes(normalizedQuery)
  ).sort((left, right) => left.name.localeCompare(right.name) || left.district.localeCompare(right.district));
}

export function findPlace(name: string, district?: string): TamilNaduPlace | undefined {
  const normalizedName = name.trim().toLowerCase();
  const normalizedDistrict = district?.trim().toLowerCase();
  return TAMIL_NADU_PLACES.find((place) =>
    place.name.toLowerCase() === normalizedName && (!normalizedDistrict || place.district.toLowerCase() === normalizedDistrict)
  );
}