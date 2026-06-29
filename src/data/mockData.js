export function simulatePrediction(filenameOrFile) {
  const filename = typeof filenameOrFile === 'string' ? filenameOrFile : filenameOrFile?.name || 'citra.jpg';
  const nameLower = filename.toLowerCase();
  let vehicle_type = 'Mobil'; // Default to Mobil for general vehicle photos
  
  // Comprehensive motor keywords
  const motorKeywords = ['motor', 'bike', 'vario', 'beat', 'nmax', 'scoopy', 'roda2', 'sepeda', 'vespa', 'aerox', 'pcx', 'mio', 'satria', 'ninja', 'crf', 'vixion', 'supra', 'jupiter', 'smash', 'klx'];
  // Comprehensive truck/bus keywords
  const trukKeywords = ['truk', 'truck', 'hino', 'fuso', 'canter', 'trailer', 'box', 'bus', 'bis', 'lorry', 'tronton', 'pick', 'pickup', 'ud', 'isuzu', 'scania', 'volvo'];
  // Comprehensive car keywords
  const mobilKeywords = ['mobil', 'car', 'sedan', 'alphard', 'innova', 'avanza', 'suv', 'mpv', 'fortuner', 'pajero', 'brio', 'jazz', 'yaris', 'terios', 'rush', 'civic', 'city', 'hrv', 'crv', 'calya', 'sigra', 'xenia', 'ertiga', 'xl7', 'xpander', 'livina', 'agya', 'ayla', 'bmw', 'mercedes', 'merc', 'audi', 'honda', 'toyota', 'hyundai', 'daihatsu', 'suzuki', 'nissan', 'wuling', 'mazda', 'tesla'];

  if (motorKeywords.some(kw => nameLower.includes(kw))) {
    vehicle_type = 'Motor';
  } else if (trukKeywords.some(kw => nameLower.includes(kw))) {
    vehicle_type = 'Truk';
  } else if (mobilKeywords.some(kw => nameLower.includes(kw))) {
    vehicle_type = 'Mobil';
  } else {
    // If no keyword match, check hash but bias towards Mobil/Motor based on common filenames
    let hash = 0;
    for (let i = 0; i < nameLower.length; i++) {
      hash = nameLower.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    const classes = ['Mobil', 'Mobil', 'Motor', 'Truk']; // Weight more towards Mobil for general photos
    vehicle_type = classes[absHash % classes.length];
  }

  let seed = 0;
  for (let i = 0; i < nameLower.length; i++) seed += nameLower.charCodeAt(i);
  
  let winnerConf = 82 + (seed % 15);
  if (nameLower.includes('low') || nameLower.includes('blur') || nameLower.includes('gelap') || nameLower.includes('buram')) {
    winnerConf = 55 + (seed % 12);
  }

  const remaining = 100 - winnerConf;
  const secondary = +(remaining * 0.7).toFixed(1);
  const tertiary = +(remaining * 0.3).toFixed(1);

  const all_predictions = { Mobil: 0, Motor: 0, Truk: 0 };
  all_predictions[vehicle_type] = +winnerConf.toFixed(1);

  const otherClasses = ['Mobil', 'Motor', 'Truk'].filter(c => c !== vehicle_type);
  all_predictions[otherClasses[0]] = secondary;
  all_predictions[otherClasses[1]] = tertiary;

  return {
    filename,
    vehicle_type,
    confidence: all_predictions[vehicle_type],
    all_predictions
  };
}

export function simulateAugmentation(filenameOrFile) {
  const base = simulatePrediction(filenameOrFile);
  const techniques = [
    { name: 'Flip horizontal', icon: 'FlipHorizontal', cssClass: 'scale-x-[-1]', confDelta: 1.2 },
    { name: 'Zoom 1.2x', icon: 'ZoomIn', cssClass: 'scale-125', confDelta: -2.4 },
    { name: 'Brightness +30%', icon: 'Sun', cssClass: 'brightness-125', confDelta: -4.8 },
    { name: 'Zoom 0.8x', icon: 'ZoomOut', cssClass: 'scale-90', confDelta: +2.6 },
    { name: 'Rotasi 20°', icon: 'RotateCw', cssClass: 'rotate-12', confDelta: -6.5 }
  ];

  return techniques.map(tech => {
    let conf = +(base.confidence + tech.confDelta).toFixed(1);
    if (conf > 99.4) conf = 99.4;
    if (conf < 42.0) conf = 42.0;

    const remaining = 100 - conf;
    const secondary = +(remaining * 0.65).toFixed(1);
    const tertiary = +(remaining * 0.35).toFixed(1);

    const all_predictions = { Mobil: 0, Motor: 0, Truk: 0 };
    all_predictions[base.vehicle_type] = conf;

    const otherClasses = ['Mobil', 'Motor', 'Truk'].filter(c => c !== base.vehicle_type);
    all_predictions[otherClasses[0]] = secondary;
    all_predictions[otherClasses[1]] = tertiary;

    return {
      technique: tech.name,
      iconName: tech.icon,
      cssClass: tech.cssClass,
      confidence: conf,
      vehicle_type: base.vehicle_type,
      all_predictions
    };
  });
}
