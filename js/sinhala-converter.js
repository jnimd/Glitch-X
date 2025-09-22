// si-sinhala-converter.js
document.addEventListener("DOMContentLoaded", function () {
  const singlishInput = document.getElementById('singlishInput');
  const sinhalaOutput = document.getElementById('sinhalaOutput');
  const singlishCharCount = document.getElementById('singlishCharCount');
  const sinhalaCharCount = document.getElementById('sinhalaCharCount');
  const copyUnicodeBtn = document.getElementById('copyUnicodeBtn');
  const shareBtn = document.getElementById('shareBtn');
  const clearBtn = document.querySelector('.action-btn:nth-child(3)');
  const exampleTags = document.querySelectorAll('.example-tag');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  const inputFormatDisplay = document.querySelector('#inputFormat .dropdown-toggle span');
  const outputFormatDisplay = document.querySelector('#outputFormat .dropdown-toggle span');
  const exportTxtLink = document.getElementById('exportButton');
  const exportPdfLink = document.getElementById('exportPdfButton'); // <--- NEW
  const importButton = document.getElementById('importButton');
  const fileInput = document.getElementById('fileInput');
  const uploadToast = document.getElementById('uploadToast');
  const uploadToastTitle = document.getElementById('uploadToastTitle');
  const uploadToastClose = document.getElementById('uploadToastClose');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadStatusText = document.getElementById('uploadStatusText');
  const panels = document.querySelectorAll('.converter-panel');

  let currentInputFormat = 'Singlish';
  let currentOutputFormat = 'Unicode';

  const singlishMap = {
    // --- Vowels ---
    'aa': 'ආ', 'Aa': 'ඈ', 'AA': 'ඈ', 'ii': 'ඊ', 'uu': 'ඌ', 'ee': 'ඒ',
    'ai': 'ඓ', 'oo': 'ඕ', 'au': 'ඖ', 'ou': 'ඖ', 'a': 'අ', 'A': 'ඇ',
    'i': 'ඉ', 'u': 'උ', 'R': 'ඍ', 'Ru': 'ඎ', 'e': 'එ', 'o': 'ඔ',
    // --- Consonants ---
    'ka': 'ක', 'ga': 'ග', 'cha': 'ච', 'ja': 'ජ', 'Na': 'ණ', 'ta': 'ට', 'Da': 'ඩ',
    'na': 'න', 'pa': 'ප', 'ba': 'බ', 'ma': 'ම', 'ya': 'ය', 'ra': 'ර', 'la': 'ල',
    'La': 'ළ', 'wa': 'ව', 'va': 'ව', 'sa': 'ස', 'sha': 'ශ', 'Sa': 'ෂ', 'Sha': 'ෂ',
    'ha': 'හ', 'fa': 'ෆ', 'tha': 'ත', 'dha': 'ද', 'qa': 'ද',
    // --- Aspirated Consonants ---
    'kha': 'ඛ', 'gha': 'ඝ', 'chha': 'ඡ', 'Ta': 'ඨ', 'Dhha': 'ඪ', 'thha': 'ථ',
    'dhha': 'ධ', 'pha': 'ඵ', 'bha': 'භ',
    // --- Nasal and Other Special Characters ---
    'zga': 'ඟ', 'zja': 'ඦ', 'zda': 'ඬ', 'zdha': 'ඳ', 'zqa': 'ඳ', 'zha': 'ඥ',
    'zka': 'ඤ', 'Ba': 'ඹ', 'Lu': 'ළු',
    // --- Vowel Marks Combinations ---
    'kAA': 'කෑ', 'gAA': 'ගෑ', 'cAA': 'චෑ', 'jAA': 'ජෑ', 'tAA': 'ටෑ', 'DAA': 'ඩෑ', 'thhAA': 'තෑ',
    'dhAA': 'දෑ', 'nAA': 'නෑ', 'NAA': 'ණෑ', 'pAA': 'පෑ', 'bAA': 'බෑ', 'mAA': 'මෑ', 'yAA': 'යෑ',
    'rAA': 'රෑ', 'lAA': 'ලෑ', 'LAA': 'ළෑ', 'wAA': 'වැ', 'vAA': 'වෑ', 'sAA': 'සෑ', 'shAA': 'ශෑ',
    'SAA': 'ෂෑ', 'hAA': 'හෑ', 'fAA': 'ෆෑ',
    'kAa': 'කෑ', 'gAa': 'ගෑ', 'cAa': 'චෑ', 'jAa': 'ජෑ', 'tAa': 'ටෑ', 'DAa': 'ඩෑ', 'thhAa': 'තෑ',
    'dhAa': 'දෑ', 'nAa': 'නෑ', 'NAa': 'ණෑ', 'pAa': 'පෑ', 'bAa': 'බෑ', 'mAa': 'මෑ', 'yAa': 'යෑ',
    'rAa': 'රෑ', 'lAa': 'ලෑ', 'LAa': 'ළෑ', 'wAa': 'වැ', 'vAa': 'වෑ', 'sAa': 'සෑ', 'shAa': 'ශෑ',
    'SAa': 'ෂෑ', 'hAa': 'හෑ', 'fAa': 'ෆෑ',
    'kaa': 'කා', 'gaa': 'ගා', 'chaa': 'චා', 'jaa': 'ජා', 'taa': 'ටා', 'daa': 'ඩා', 'thhaa': 'ථා',
    'dhha': 'ධා', 'naa': 'නා', 'Naa': 'ණා', 'paa': 'පා', 'baa': 'බා', 'maa': 'මා', 'yaa': 'යා',
    'raa': 'රා', 'laa': 'ලා', 'Laa': 'ළා', 'waa': 'වා', 'vaa': 'වා', 'saa': 'සා', 'shaa': 'ශා',
    'Saa': 'ෂා', 'haa': 'හා', 'faa': 'ෆා', 'tha': 'තා',
    'kuu': 'කූ', 'guu': 'ගූ', 'chuu': 'චූ', 'juu': 'ජූ', 'tuu': 'ටූ', 'duu': 'ඩූ', 'thhuu': 'තූ',
    'dhuu': 'දූ', 'nuu': 'නූ', 'Nuu': 'ණූ', 'puu': 'පූ', 'buu': 'බූ', 'muu': 'මූ', 'yuu': 'යූ',
    'ruu': 'රූ', 'luu': 'ලු', 'Luu': 'ළූ', 'wuu': 'වූ', 'vuu': 'වූ', 'suu': 'සු', 'shuu': 'ශූ',
    'Suu': 'ෂූ', 'huu': 'හූ', 'fuu': 'ෆු',
    'kru': 'කෘ', 'gru': 'ගෘ', 'chru': 'චෘ', 'jru': 'ජෘ', 'tru': 'ටෘ', 'dru': 'ඩෘ', 'thhru': 'තෘ',
    'dhru': 'දෘ', 'nru': 'නෘ', 'Nru': 'ණෘ', 'pru': 'පෘ', 'bru': 'බෘ', 'mru': 'මෘ', 'yru': 'යෘ',
    'rru': 'රෘ', 'lru': 'ලෘ', 'Lru': 'ළෘ', 'wru': 'වෘ', 'vru': 'වෘ', 'sru': 'සෘ', 'shru': 'ශෘ',
    'Sru': 'ෂෘ', 'hru': 'හෘ', 'fru': 'ෆෘ',
    'kee': 'කේ', 'gee': 'ගේ', 'chee': 'චේ', 'jee': 'ජේ', 'tee': 'ටේ', 'dee': 'ඩේ', 'thhee': 'තේ',
    'dhee': 'දේ', 'nee': 'නේ', 'Nee': 'ණේ', 'pee': 'පේ', 'bee': 'බේ', 'mee': 'මේ', 'yee': 'යේ',
    'ree': 'රේ', 'lee': 'ලේ', 'Lee': 'ළේ', 'wee': 'වේ', 'vee': 'වේ', 'see': 'සේ', 'shee': 'ශේ',
    'See': 'ෂේ', 'hee': 'හේ', 'fee': 'ෆේ',
    'koo': 'කෝ', 'goo': 'ගෝ', 'choo': 'චෝ', 'joo': 'ජෝ', 'too': 'ටෝ', 'doo': 'ඩෝ', 'thoo': 'තෝ',
    'dhoo': 'දෝ', 'noo': 'නෝ', 'Noo': 'ණෝ', 'poo': 'පෝ', 'boo': 'බෝ', 'moo': 'මෝ', 'yoo': 'යෝ',
    'roo': 'රෝ', 'loo': 'ලෝ', 'Loo': 'ළෝ', 'woo': 'වෝ', 'voo': 'වෝ', 'soo': 'සෝ', 'shoo': 'ශෝ',
    'Soo': 'ෂෝ', 'hoo': 'හෝ', 'foo': 'ෆෝ',
    'kau': 'කෞ', 'gau': 'ගෞ', 'chau': 'චෞ', 'jau': 'ජෞ', 'tau': 'ටෞ', 'dau': 'ඩෞ', 'thhau': 'ථෞ',
    'dhau': 'ධෞ', 'nau': 'නෞ', 'Nau': 'ණෞ', 'pau': 'පෞ', 'bau': 'බෞ', 'mau': 'මෞ', 'yau': 'යෞ',
    'rau': 'රෞ', 'lau': 'ලෞ', 'Lau': 'ළෞ', 'wau': 'වෞ', 'vau': 'වෞ', 'sau': 'සෞ', 'shau': 'ශෞ',
    'Sau': 'ෂෞ', 'hau': 'හෞ', 'fau': 'ෆෞ',
    'kax': 'කං', 'gazn': 'ගං', 'kazn': 'කං', 'gazn': 'ගං',
    'kaX': 'කඞ', 'gaX': 'ගඞ',
    'kya': 'ක්‍ය', 'gya': 'ග්‍ය', 'chya': 'ච්‍ය', 'jya': 'ජ්‍ය', 'tya': 'ට්‍ය', 'dya': 'ඩ්‍ය', 'thya': 'ත්‍ය',
    'dhya': 'ධ්‍ය', 'nya': 'න්‍ය', 'Nya': 'ණ්‍ය', 'pya': 'ප්‍ය', 'bya': 'බ්‍ය', 'mya': 'ම්‍ය', 'rya': 'ර්‍ය',
    'lya': 'ල්‍ය', 'Lya': 'ළ්‍ය', 'wya': 'ව්‍ය', 'vya': 'ව්‍ය', 'sya': 'ස්‍ය', 'shya': 'ශ්‍ය', 'Shya': 'ෂ්‍ය',
    'hya': 'භ්‍ය', 'fya': 'ෆ්‍ය',
    'kra': 'ක්‍ර', 'gra': 'ග්‍ර', 'chra': 'ච්‍ර', 'jra': 'ජ්‍ර', 'tra': 'ට්‍ර', 'dra': 'ඩ්‍ර', 'thra': 'ත්‍ර',
    'dhra': 'ධ්‍ර', 'nra': 'න්‍ර', 'Nra': 'ණ්‍ර', 'pra': 'ප්‍ර', 'bra': 'බ්‍ර', 'mra': 'ම්‍ර', 'yra': 'ය්‍ර',
    'lra': 'ල්‍ර', 'Lra': 'ළ්‍ර', 'wra': 'ව්‍ර', 'vra': 'ව්‍ර', 'sra': 'ස්‍ර', 'shra': 'ශ්‍ර', 'Shra': 'ෂ්‍ර',
    'hra': 'භ්‍ර', 'fra': 'ෆ්‍ර',
    // 2-character patterns (e.g., ka, ki, ku, ke, ko, kA, kH)
    'kA': 'කැ', 'gA': 'ගැ', 'cA': 'චැ', 'jA': 'ජැ', 'tA': 'ටැ', 'dA': 'ඩැ', 'thA': 'තැ', 'dhA': 'දැ',
    'nA': 'නැ', 'NA': 'ණැ', 'pA': 'පැ', 'bA': 'බැ', 'mA': 'මැ', 'yA': 'යැ', 'rA': 'රැ', 'lA': 'ලැ',
    'LA': 'ළැ', 'wA': 'වැ', 'vA': 'වැ', 'sA': 'සැ', 'shA': 'ශැ', 'SA': 'ෂැ', 'hA': 'හැ', 'fA': 'ෆැ',
    'ki': 'කි', 'gi': 'ගි', 'chi': 'චි', 'ji': 'ජි', 'ti': 'ටි', 'di': 'ඩි', 'thi': 'ති', 'dhi': 'දි',
    'ni': 'නි', 'Ni': 'ණි', 'pi': 'පි', 'bi': 'බි', 'mi': 'මි', 'yi': 'යි', 'ri': 'රි', 'li': 'ලි',
    'Li': 'ළි', 'wi': 'වි', 'vi': 'වි', 'si': 'සි', 'shi': 'ශි', 'Si': 'ෂි', 'hi': 'හි', 'fi': 'ෆි',
    'ku': 'කු', 'gu': 'ගු', 'chu': 'චු', 'ju': 'ජු', 'tu': 'ටු', 'du': 'ඩු', 'thu': 'තු', 'dhu': 'දු',
    'nu': 'නු', 'Nu': 'ණූ', 'pu': 'පු', 'bu': 'බු', 'mu': 'මු', 'yu': 'යු', 'ru': 'රු', 'lu': 'ලු',
    'Lu': 'ළු', 'wu': 'වු', 'vu': 'වු', 'su': 'සු', 'shu': 'ශු', 'Su': 'ෂු', 'hu': 'හු', 'fu': 'ෆු',
    'ke': 'කෙ', 'ge': 'ගෙ', 'che': 'චෙ', 'je': 'ජෙ', 'te': 'ටෙ', 'de': 'ඩෙ', 'the': 'තෙ', 'dhe': 'දෙ',
    'ne': 'නෙ', 'Ne': 'ණෙ', 'pe': 'පෙ', 'be': 'බෙ', 'me': 'මෙ', 'ye': 'යෙ', 're': 'රෙ', 'le': 'ලෙ',
    'Le': 'ළෙ', 'we': 'වෙ', 've': 'වෙ', 'se': 'සෙ', 'she': 'ශෙ', 'Se': 'ෂෙ', 'he': 'හෙ', 'fe': 'ෆෙ',
    'ko': 'කො', 'go': 'ගො', 'cho': 'චො', 'jo': 'ජො', 'to': 'ටො', 'do': 'ඩො', 'tho': 'තො', 'dho': 'දො',
    'no': 'නො', 'No': 'ණො', 'po': 'පො', 'bo': 'බො', 'mo': 'මො', 'yo': 'යො', 'ro': 'රො', 'lo': 'ලො',
    'Lo': 'ළො', 'wo': 'වො', 'vo': 'වො', 'so': 'සො', 'sho': 'ශො', 'So': 'ෂො', 'ho': 'හො', 'fo': 'ෆො',
    'kH': 'කඃ', 'gH': 'ගඃ',
    // 1-character pattern (k)
    'k': 'ක්', 'g': 'ග්', 'c': 'ච්', 'j': 'ජ්', 't': 'ට්', 'd': 'ඩ්', 'th': 'ත්', 'dh': 'ද්',
    'n': 'න්', 'N': 'ණ්', 'p': 'ප්', 'b': 'බ්', 'm': 'ම්', 'y': 'ය්', 'r': 'ර්', 'l': 'ල්',
    'L': 'ළ්', 'w': 'ව්', 'v': 'ව්', 's': 'ස්', 'S': 'ෂ්', 'h': 'හ්', 'f': 'ෆ්',
    // --- Punctuation, Numbers, and Other Symbols ---
    '.': '.', ',': ',', '?': '?', '!': '!', ' ': ' ', '(': '(', ')': ')', '[': '[', ']': ']',
    '{': '{', '}': '}', ':': ':', ';': ';', '-': '-', '_': '_', '/': '/', '\\': '\\', '=': '=',
    '+': '+', '&': '&', '*': '*', '%': '%', '$': '$', '@': '@', '#': '#', '~': '~', '`': '`',
    "'": "'", '"': '"', '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
    '7': '7', '8': '8', '9': '9',
  };

  const reverseSinglishMap = {};
  for (const singlish in singlishMap) {
    const unicode = singlishMap[singlish];
    if (unicode.length > 0) {
      if (!reverseSinglishMap[unicode] || singlish.length > reverseSinglishMap[unicode].length) {
        reverseSinglishMap[unicode] = singlish;
      }
    }
  }

  // --- Abhaya සහ ISI ෆොන්ට් සඳහා mappings ---
  const abhayaMap = {
    'අ': 'A', 'ආ': 'B', 'ඇ': 'C', 'ඈ': 'D', 'ඉ': 'E', 'ඊ': 'F', 'උ': 'G', 'ඌ': 'H',
    'එ': 'I', 'ඒ': 'J', 'ඓ': 'K', 'ඔ': 'L', 'ඕ': 'M', 'ඖ': 'N', 'ක': 's', 'ඛ': 'S',
    'ග': 'g', 'ඝ': 'G', 'ඟ': 'x', 'ච': 'c', 'ඡ': 'C', 'ජ': 'j', 'ඣ': 'J', 'ඤ': '¥',
    'ඥ': '§', 'ට': 't', 'ඨ': 'T', 'ඩ': 'f', 'ඪ': 'F', 'ණ': '¨', 'ඬ': '´',
    'ත': 'q', 'ථ': 'Q', 'ද': 'd', 'ධ': 'D', 'න': 'n', 'ඳ': 'µ',
    'ප': 'p', 'ඵ': 'P', 'බ': 'b', 'භ': 'B', 'ම': 'm', 'ඹ': '»',
    'ය': 'y', 'ර': 'r', 'ල': 'l', 'ව': 'v', 'ශ': 'u', 'ෂ': 'U',
    'ස': 's', 'හ': 'h', 'ළ': 'o', 'ෆ': 'w', 'ඦ': 'W', 'ඣ': 'J',
    'ා': 'f', 'ැ': 'F', 'ෑ': 'e', 'ි': 'i', 'ී': 'I', 'ු': 'u', 'ූ': 'U',
    'ෙ': 'e', 'ේ': 'E', 'ෛ': 'Y', 'ො': 'o', 'ෝ': 'O', 'ෞ': 'W',
    'ං': 'x', 'ඃ': 'X', 'ෲ': 'e', 'ෘ': 'R', 'ෟ': 'ç', '්': 'a',
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
    ' ': ' ', '.': '.', ',': ',', ';': ';', ':': ':', '?': '?', '!': '!', '(': '(', ')': ')',
  };

  const isiMap = {
    'අ': 'a', 'ආ': 'A', 'ඇ': 'æ', 'ඈ': 'Æ', 'ඉ': 'i', 'ඊ': 'I', 'උ': 'u', 'ඌ': 'U',
    'එ': 'e', 'ඒ': 'E', 'ඓ': 'Y', 'ඔ': 'o', 'ඕ': 'O', 'ඖ': 'W',
    'ක': 'k', 'ඛ': 'K', 'ග': 'g', 'ඝ': 'G', 'ඟ': 'x', 'ච': 'c',
    'ඡ': 'C', 'ජ': 'j', 'ඣ': 'J', 'ඤ': 'V', 'ඥ': 'v', 'ට': 't',
    'ඨ': 'T', 'ඩ': 'd', 'ඪ': 'D', 'ණ': 'N', 'ඬ': 'z',
    'ත': 'p', 'ථ': 'P', 'ද': 'b', 'ධ': 'B', 'න': 'n', 'ඳ': 'm',
    'ප': 'f', 'ඵ': 'F', 'බ': 'w', 'භ': 'W', 'ම': 'M', 'ඹ': 'j',
    'ය': 'y', 'ර': 'r', 'ල': 'l', 'ව': 'v', 'ශ': 'S', 'ෂ': 'X',
    'ස': 's', 'හ': 'h', 'ළ': 'L', 'ෆ': 'Z', 'ඦ': 'J', 'ඣ': 'j',
    'ා': 'f', 'ැ': 'F', 'ෑ': 'E', 'ි': 'i', 'ී': 'I', 'ු': 'u', 'ූ': 'U',
    'ෙ': 'e', 'ේ': 'E', 'ෛ': 'Y', 'ො': 'o', 'ෝ': 'O', 'ෞ': 'W',
    'ං': 'x', 'ඃ': 'H', 'ෲ': 'o', 'ෘ': 'R', 'ෟ': 'P', '්': 'q',
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
    ' ': ' ', '.': '.', ',': ',', ';': ';', ':': ':', '?': '?', '!': '!', '(': '(', ')': ')',
  };

  // Unicode to Non-Unicode mappings
  const unicodeToAbhayaMap = abhayaMap;
  const unicodeToIsiMap = isiMap;

  // Non-Unicode to Unicode mappings
  const abhayaToUnicodeMap = Object.entries(unicodeToAbhayaMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});

  const isiToUnicodeMap = Object.entries(unicodeToIsiMap).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});

  // පරිවර්තන ෆන්ක්ෂන්ස්
  const transliterateSinglishToUnicode = (text) => {
    const sortedKeys = Object.keys(singlishMap).sort((a, b) => b.length - a.length);
    let result = '';
    let i = 0;
    while (i < text.length) {
      let matched = false;
      for (const key of sortedKeys) {
        if (text.startsWith(key, i)) {
          result += singlishMap[key];
          i += key.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        result += text[i];
        i++;
      }
    }
    return result;
  };

  const transliterateUnicodeToSinglish = (text) => {
    const sortedKeys = Object.keys(reverseSinglishMap).sort((a, b) => b.length - a.length);
    let result = '';
    let i = 0;
    while (i < text.length) {
      let matched = false;
      for (const key of sortedKeys) {
        if (text.startsWith(key, i)) {
          result += reverseSinglishMap[key];
          i += key.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        result += text[i];
        i++;
      }
    }
    return result;
  };

  const transliterate = (text, map) => {
    let result = '';
    for (let char of text) {
      result += map[char] || char;
    }
    return result;
  };

  const performConversion = () => {
    const inputText = singlishInput.value;
    let translatedText = '';

    if (currentInputFormat === 'Singlish' && currentOutputFormat === 'Unicode') {
      translatedText = transliterateSinglishToUnicode(inputText);
    } else if (currentInputFormat === 'Unicode' && currentOutputFormat === 'Singlish') {
      translatedText = transliterateUnicodeToSinglish(inputText);
    } else if (currentInputFormat === 'Unicode' && currentOutputFormat === 'FM Abhaya') {
      translatedText = transliterate(inputText, unicodeToAbhayaMap);
    } else if (currentInputFormat === 'FM Abhaya' && currentOutputFormat === 'Unicode') {
      translatedText = transliterate(inputText, abhayaToUnicodeMap);
    } else if (currentInputFormat === 'Unicode' && currentOutputFormat === 'ISI') {
      translatedText = transliterate(inputText, unicodeToIsiMap);
    } else if (currentInputFormat === 'ISI' && currentOutputFormat === 'Unicode') {
      translatedText = transliterate(inputText, isiToUnicodeMap);
    } else {
      translatedText = inputText;
    }

    sinhalaOutput.value = translatedText;
    updateCharCounts();
  };

  const updateCharCounts = () => {
    singlishCharCount.textContent = singlishInput.value.length;
    sinhalaCharCount.textContent = sinhalaOutput.value.length;
  };

  singlishInput.addEventListener('input', performConversion);

  // Input Format Options
  document.querySelectorAll('#inputFormat .dropdown-menu-small a').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const format = this.textContent.trim();
      currentInputFormat = format;
      inputFormatDisplay.textContent = format;
      singlishInput.placeholder = `Type in ${format}...`;
      performConversion();
    });
  });

  // Output Format Options
  document.querySelectorAll('#outputFormat .dropdown-menu-small a').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const format = this.textContent.trim();
      currentOutputFormat = format;
      outputFormatDisplay.textContent = format;
      performConversion();
    });
  });

  // Other functionalities
  copyUnicodeBtn.addEventListener('click', function () {
    if (sinhalaOutput.value.length > 0) {
      navigator.clipboard.writeText(sinhalaOutput.value)
        .then(() => {
          alert('Text copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          sinhalaOutput.select();
          document.execCommand('copy');
          alert('Text copied to clipboard! (Fallback)');
        });
    } else {
      alert('There is no text to copy.');
    }
  });

  shareBtn.addEventListener('click', function () {
    if (sinhalaOutput.value.length > 0) {
      if (navigator.share) {
        navigator.share({
          title: 'Sinhala Converter',
          text: sinhalaOutput.value,
          url: window.location.href
        })
          .then(() => console.log('Successfully shared'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        alert('Web Share API is not supported in your browser.');
      }
    } else {
      alert('There is no text to share.');
    }
  });

  clearBtn.addEventListener('click', function () {
    singlishInput.value = '';
    sinhalaOutput.value = '';
    updateCharCounts();
  });

  exampleTags.forEach(tag => {
    tag.addEventListener('click', function () {
      singlishInput.value = this.dataset.text;
      performConversion();
    });
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.converter-panel').forEach(panel => panel.style.display = 'none');
      document.getElementById(this.dataset.tab + '-tab').style.display = 'flex';
    });
  });

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      const dropdownMenu = this.closest('.dropdown-action').querySelector('.dropdown-menu-small');
      dropdownMenu.classList.toggle('show');
    });
  });

  document.addEventListener('click', function (event) {
    dropdownToggles.forEach(toggle => {
      const dropdownMenu = toggle.closest('.dropdown-action').querySelector('.dropdown-menu-small');
      if (dropdownMenu && dropdownMenu.classList.contains('show') && !toggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  });

  // ------------------ Export as TXT ------------------
  if (exportTxtLink) {
    exportTxtLink.addEventListener('click', (event) => {
      event.preventDefault();
      const textToSave = sinhalaOutput.value;
      if (!textToSave.trim()) {
        alert("There is no text to export!");
        return;
      }
      const blob = new Blob([textToSave], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'converted_text.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ------------------ Export as PDF ------------------
  if (exportPdfLink) {
    exportPdfLink.addEventListener('click', (event) => {
      event.preventDefault();
      const textToSave = sinhalaOutput.value;
      if (!textToSave.trim()) {
        alert("There is no text to export!");
        return;
      }

      // Use jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Sinhala font rendering requires Unicode
      doc.setFont("Helvetica", "");
      doc.setFontSize(14);
      doc.text(textToSave, 10, 20);

      doc.save("converted_text.pdf");
    });
  }

  // --- Voice Recognition (Speech-to-Text) Logic ---

  // HTML Elements
  const voiceRecognitionBtn = document.getElementById('voiceRecognitionBtn');
  const voiceModal = document.getElementById('voiceModal');
  const voiceModalCloseBtn = document.getElementById('voiceModalCloseBtn');
  const voiceModalOkBtn = document.getElementById('voiceModalOkBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const recognizedTextDisplay = document.getElementById('recognizedTextDisplay');

  // Output box eke ID eka
  const outputBox = document.getElementById('sinhalaOutput');

  let recognition;
  let finalRecognizedText = '';

  // Browser support check
  if (voiceRecognitionBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Recognition settings
    recognition.lang = 'si-LK'; // Sinhala language
    recognition.continuous = true; // one-shot listen
    recognition.interimResults = true;

    // --- Event Handlers ---
    recognition.onstart = () => {
      voiceStatus.textContent = '🎤 Listening... Speak now.';
      voiceModalOkBtn.disabled = true;
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let currentFinalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (currentFinalTranscript.length > 0) {
        finalRecognizedText += currentFinalTranscript;
        voiceModalOkBtn.disabled = false;
      }

      recognizedTextDisplay.textContent = finalRecognizedText + interimTranscript;
    };

    recognition.onend = () => {
      if (voiceModal.style.display === 'block') {
        if (finalRecognizedText.length === 0) {
          voiceStatus.textContent = '⚠️ No speech detected. Please try again.';
          recognizedTextDisplay.textContent = 'No text was recognised.';
          voiceModalOkBtn.disabled = true;
        } else {
          voiceStatus.textContent = '✅ Finished listening. Press OK to add text.';
          voiceModalOkBtn.disabled = false;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      voiceStatus.textContent = `❌ Error: ${event.error}.`;
      voiceModalOkBtn.disabled = true;
    };

    // --- Button Handlers ---
    voiceRecognitionBtn.addEventListener('click', () => {
      voiceModal.style.display = 'block';
      finalRecognizedText = '';
      recognizedTextDisplay.textContent = 'Initializing...';

      try {
        recognition.start();
      } catch (e) {
        if (e.name !== 'InvalidStateError') {
          console.error('Error starting recognition:', e);
          voiceStatus.textContent = 'Error starting mic. Please close and try again.';
        }
      }
    });

    voiceModalCloseBtn.addEventListener('click', () => {
      recognition.stop();
      voiceModal.style.display = 'none';
    });

    voiceModalOkBtn.addEventListener('click', () => {
      recognition.stop();
      voiceModal.style.display = 'none';

      if (finalRecognizedText.length > 0 && outputBox) {
        outputBox.value += finalRecognizedText + ' ';
        outputBox.dispatchEvent(new Event('input'));
      }
    });

  } else if (voiceRecognitionBtn) {
    voiceRecognitionBtn.disabled = true;
    voiceRecognitionBtn.title = "Voice Recognition is not supported in this browser.";
  }


  function showToast() {
    if (!uploadToast) return;
    uploadToast.style.display = 'block';
    uploadToastTitle.textContent = 'Uploading file…';
    uploadStatusText.textContent = 'Starting...';
    uploadProgress.style.width = '0%';
    uploadProgress.parentElement.setAttribute('aria-valuenow', '0');
  }

  function updateToast(percent, text) {
    if (!uploadToast) return;
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    uploadProgress.style.width = p + '%';
    uploadProgress.parentElement.setAttribute('aria-valuenow', String(p));
    uploadStatusText.textContent = text || (p + '%');
    // change title if near done
    if (p >= 99) uploadToastTitle.textContent = 'Finishing...';
  }

  function successToast(msg) {
    if (!uploadToast) return;
    uploadToastTitle.textContent = 'Done';
    uploadStatusText.textContent = msg || 'File imported & converted';
    uploadProgress.style.width = '100%';
    setTimeout(() => { uploadToast.style.display = 'none'; }, 1400);
  }

  function errorToast(msg) {
    if (!uploadToast) return;
    uploadToastTitle.textContent = 'Error';
    uploadStatusText.textContent = msg || 'Failed to read file';
    uploadProgress.style.width = '100%';
    uploadProgress.style.background = 'linear-gradient(90deg,#f87171,#fb7185)'; // red-ish
    setTimeout(() => {
      // restore progress color after hide
      uploadProgress.style.background = '';
      uploadToast.style.display = 'none';
    }, 2200);
  }

  if (uploadToastClose) {
    uploadToastClose.addEventListener('click', () => { uploadToast.style.display = 'none'; });
  }

  if (importButton && fileInput) {
    importButton.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // Validate extension/type
      const allowedTypes = ['text/plain'];
      const allowedExts = ['.txt'];
      const name = file.name || '';
      const ext = name.slice((Math.max(0, name.lastIndexOf('.')))).toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
        showToast();
        errorToast('Upload කරන්න පුළුවන් .txt (plain) file එකක් පමණි.');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();

      // show floating toast
      showToast();

      // update from progress events if available
      reader.onprogress = function (ev) {
        if (!ev.lengthComputable) {
          // approximate spinner-like behavior (increment slowly)
          // get current width and add a bit
          const cur = parseInt(uploadProgress.style.width || '0', 10) || 0;
          const next = Math.min(95, cur + 8);
          updateToast(next, 'Uploading...');
        } else {
          const pct = (ev.loaded / ev.total) * 90; // reserve last 10% for finalizing
          updateToast(pct, Math.round(pct) + '%');
        }
      };

      reader.onloadstart = function () {
        updateToast(6, 'Reading file...');
      };

      reader.onload = function (evt) {
        let text = evt.target.result || '';
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        // put into singlish input and trigger conversion
        if (typeof singlishInput !== 'undefined' && singlishInput) {
          singlishInput.value = text;
        }
        // run conversion (assumes performConversion() exists)
        try {
          if (typeof performConversion === 'function') {
            performConversion();
          }
          updateToast(100, 'Converting...');
          // small delay so user sees 100% then hide
          setTimeout(() => successToast('File imported & converted'), 220);
        } catch (err) {
          console.error(err);
          errorToast('Conversion failed');
        }
      };

      reader.onerror = function () {
        console.error('FileReader error', reader.error);
        errorToast('File කියවීමට දෝෂයකි.');
      };

      // Start reading (will trigger onprogress in many browsers)
      try {
        reader.readAsText(file, 'utf-8');
      } catch (e) {
        console.error(e);
        errorToast('Cannot read file');
      }
    });
  }



});




// Clear function
clearButton.addEventListener('click', () => {
  textarea.value = '';
});

// Copy function
copyButton.addEventListener('click', () => {
  textarea.select();
  document.execCommand('copy');
});

// Share function
shareButton.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Sinhala Converted Text',
      text: textarea.value
    }).then(() => {
      console.log('Successfully shared');
    }).catch((error) => {
      console.error('Sharing failed', error);
    });
  } else {
    // Web Share API support නැති browsers වලට මේ message එක පෙන්වයි
    alert('Sharing is not supported on this browser. Please use the Copy button instead.');
  }
});

// === CUSTOM PASSWORD MODAL FOR EXTENSION DOWNLOAD (Final Fix for Error Display) ===

// 1. GLOBAL FUNCTION: මෙය ගොනුවේ Global scope එකේ තිබිය යුතුයි
function showPasswordPrompt(event) {
  event.preventDefault();

  if (document.getElementById('passwordModal')) return;

  // 🔑 Password එක: ඔබට අවශ්‍ය Password එක 'glitch' වෙනුවට ආදේශ කරන්න.
  const CORRECT_PASSWORD_INLINE = 'glitch';

  // Download Link Element එක
  const actualDownloadLink = document.getElementById('actualDownloadLink');

  // Modal HTML
  const modalHTML = `
        <div id="passwordModal" class="modal" aria-hidden="true">
            <div class="modal-content download-modal-content">
                <h3 class="modal-title">Enter Download Password</h3>
                <p class="modal-description">Please enter the password to download the Sinhala Converter Extension.</p>
                <input type="password" id="downloadPasswordInput" placeholder="Secret Password" class="password-input">
                <p id="passwordError" style="color: #ff4d4d; margin-top: 10px; display: none; font-weight: bold;">❌ Incorrect password. Please try again.</p> 
                <div class="modal-actions">
                    <button id="submitPasswordBtn" class="converter-btn primary">Verify & Download</button>
                    <button id="closeModalBtn" class="converter-btn secondary">
                        <i class='bx bx-x'></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;

  // 2. Modal HTML එක පිටුවට ඇතුල් කිරීම
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 3. දැන්, HTML එකට ඇතුළු වූ වහාම, elements නිවැරදිව තෝරා ගනිමු.
  const passwordModal = document.getElementById('passwordModal');
  const downloadPasswordInput = document.getElementById('downloadPasswordInput');
  const submitPasswordBtn = document.getElementById('submitPasswordBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const passwordError = document.getElementById('passwordError'); // <--- මෙය දැන් නිවැරදිව හමු විය යුතුයි!

  // Modal එක වසන Function එක
  const closePasswordModal = (modal) => {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    setTimeout(() => modal.remove(), 300);
  }

  // Download කිරීමේ ක්‍රියාවලිය
  const handleDownloadAttempt = () => {
    const enteredPassword = downloadPasswordInput.value.trim();

    if (enteredPassword === CORRECT_PASSWORD_INLINE) {
      // ✅ Password එක නිවැරදි නම්: Error hide කර Download කරයි
      passwordError.style.display = 'none';

      if (actualDownloadLink) {
        actualDownloadLink.click();
      }
      closePasswordModal(passwordModal);
    } else {
      // ❌ Password එක වැරදි නම්: Error show කර Input clear කරයි
      passwordError.style.display = 'block';
      downloadPasswordInput.value = '';
      downloadPasswordInput.focus();
    }
  };

  // 4. සිදුවීම් (Events) සකස් කිරීම
  submitPasswordBtn.addEventListener('click', handleDownloadAttempt);
  closeModalBtn.addEventListener('click', () => closePasswordModal(passwordModal));

  // Enter key එක එබූ විට ක්‍රියාත්මක වීම
  downloadPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDownloadAttempt();
    }
  });

  // Modal එකෙන් පිටත click කළ විට වසා දැමීම
  passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
      closePasswordModal(passwordModal);
    }
  });

  // Modal එක පෙන්වූ පසු Input එකට Focus කරයි
  passwordModal.setAttribute('aria-hidden', 'false');
  passwordModal.style.display = 'block';
  downloadPasswordInput.focus();
}
