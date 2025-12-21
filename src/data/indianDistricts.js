export const DISTRICT_STATE_MAP = {
    // 1. INDORE LOCAL AREAS & NEIGHBORS (Highest Priority)
    // Local Indore Areas (Often printed on ID cards)
    'VIJAY NAGAR': 'Madhya Pradesh', 'BHAWARKUA': 'Madhya Pradesh', 'RAJENDRA NAGAR': 'Madhya Pradesh',
    'PALASIA': 'Madhya Pradesh', 'RAJWAADA': 'Madhya Pradesh', 'KHAJRANA': 'Madhya Pradesh',
    'SUDAMA NAGAR': 'Madhya Pradesh', 'ANNAPURNA': 'Madhya Pradesh', 'NANDA NAGAR': 'Madhya Pradesh',
    'MUSAKHEDI': 'Madhya Pradesh', 'RAU': 'Madhya Pradesh', 'MHOW': 'Madhya Pradesh',
    'PITHAMPUR': 'Madhya Pradesh', 'SANWER': 'Madhya Pradesh', 'DEPALPUR': 'Madhya Pradesh',
    'HATOD': 'Madhya Pradesh', 'MANPUR': 'Madhya Pradesh', 'SIMROL': 'Madhya Pradesh',

    // Major Neighbors (50km radius)
    'INDORE': 'Madhya Pradesh',
    'DEWAS': 'Madhya Pradesh',
    'UJJAIN': 'Madhya Pradesh',
    'DHAR': 'Madhya Pradesh',
    'SEHORE': 'Madhya Pradesh',
    'SHAJAPUR': 'Madhya Pradesh',

    // 1.1 TEHSIL CLUSTERS (Tehsil + ~10km Radius Villages)

    // ICHHAWAR CLUSTER (Sehore)
    'ICHHAWAR': 'Madhya Pradesh', 'DIWADIYA': 'Madhya Pradesh', 'BHOURA': 'Madhya Pradesh',
    'ARYA': 'Madhya Pradesh', 'JHALKI': 'Madhya Pradesh', 'MOLGA': 'Madhya Pradesh',
    'DHABLA': 'Madhya Pradesh', 'VEERPUR': 'Madhya Pradesh', 'NAYA PURA': 'Madhya Pradesh',
    'RAMNAGAR': 'Madhya Pradesh', 'AMLAHA': 'Madhya Pradesh',

    // ASHTA CLUSTER (Sehore)
    'ASHTA': 'Madhya Pradesh', 'JAWAR': 'Madhya Pradesh', 'MAINA': 'Madhya Pradesh',
    'KOTHRI': 'Madhya Pradesh', 'METWADA': 'Madhya Pradesh', 'PAGARIA': 'Madhya Pradesh',
    'KHAMKHEDA': 'Madhya Pradesh', 'SIDDIQGANJ': 'Madhya Pradesh',

    // SEHORE RURAL CLUSTERS
    'BILKISGANJ': 'Madhya Pradesh', 'SHYAMNAPUR': 'Madhya Pradesh', 'DORAHA': 'Madhya Pradesh',
    'AHMEDPUR': 'Madhya Pradesh', 'BIJORI': 'Madhya Pradesh', 'MOGRA': 'Madhya Pradesh',
    'SHYAMPUR': 'Madhya Pradesh',

    // INDORE RURAL CLUSTERS
    'HATOD': 'Madhya Pradesh', 'SAWER': 'Madhya Pradesh', 'DEPALPUR': 'Madhya Pradesh',
    'MANPUR': 'Madhya Pradesh', 'SIMROL': 'Madhya Pradesh', 'KAMPEL': 'Madhya Pradesh',
    'KHUDEL': 'Madhya Pradesh', 'BETMA': 'Madhya Pradesh', 'GAUTAMPURA': 'Madhya Pradesh',
    'HASALPUR': 'Madhya Pradesh', 'PEDMI': 'Madhya Pradesh',

    // DEWAS RURAL CLUSTERS
    'TONK KHURD': 'Madhya Pradesh', 'SONKATCH': 'Madhya Pradesh', 'BHORASA': 'Madhya Pradesh',
    'PIPALRAWAN': 'Madhya Pradesh', 'KATEGAON': 'Madhya Pradesh', 'LOHARDA': 'Madhya Pradesh',
    'DOUBLE CHOWKI': 'Madhya Pradesh',

    // ------------------------------------------------------------------
    // INDORE REGION (~200km Radius) - VILLAGE & TEHSIL CLUSTERS
    // ------------------------------------------------------------------

    // 1. INDORE DISTRICT
    'SANWER': 'Madhya Pradesh', 'CHANDRAWATIGANJ': 'Madhya Pradesh', 'KSHIPRA': 'Madhya Pradesh', 'MANGLIYA': 'Madhya Pradesh', 'AJNOD': 'Madhya Pradesh',
    'DEPALPUR': 'Madhya Pradesh', 'GAUTAMPURA': 'Madhya Pradesh', 'BETMA': 'Madhya Pradesh', 'HASALPUR': 'Madhya Pradesh',
    'MHOW': 'Madhya Pradesh', 'KISHANGANJ': 'Madhya Pradesh', 'KODARIYA': 'Madhya Pradesh', 'JAMLI': 'Madhya Pradesh', 'BADGONA': 'Madhya Pradesh',

    // 2. DEWAS DISTRICT
    'SONKATCH': 'Madhya Pradesh', 'BHORASA': 'Madhya Pradesh', 'PIPALRAWAN': 'Madhya Pradesh', 'GANDHARVPURI': 'Madhya Pradesh',
    'BAGLI': 'Madhya Pradesh', 'UDAINAGAR': 'Madhya Pradesh', 'CHAPDA': 'Madhya Pradesh', 'PUNJAPURA': 'Madhya Pradesh', 'HATPIPLIYA': 'Madhya Pradesh',
    'KANNOD': 'Madhya Pradesh', 'SATWAS': 'Madhya Pradesh', 'LOHARDA': 'Madhya Pradesh', 'KANTAPHOD': 'Madhya Pradesh',
    'TONK KHURD': 'Madhya Pradesh', 'CHIRAWAD': 'Madhya Pradesh',
    'KHATEGAON': 'Madhya Pradesh', 'NEMAWAR': 'Madhya Pradesh', 'HARANGAON': 'Madhya Pradesh',

    // 3. UJJAIN DISTRICT
    'NAGDA': 'Madhya Pradesh', 'UNHEL': 'Madhya Pradesh', 'RUPETA': 'Madhya Pradesh',
    'BADNAGAR': 'Madhya Pradesh', 'INGORIA': 'Madhya Pradesh', 'RUNIJA': 'Madhya Pradesh',
    'TARANA': 'Madhya Pradesh', 'MAKDON': 'Madhya Pradesh', 'KAYTHA': 'Madhya Pradesh',
    'MAHIDPUR': 'Madhya Pradesh', 'JHARDA': 'Madhya Pradesh', 'GHOSLA': 'Madhya Pradesh',
    'KHACHROD': 'Madhya Pradesh', 'BHATPACHLANA': 'Madhya Pradesh',

    // 4. DHAR DISTRICT
    'BADNAWAR': 'Madhya Pradesh', 'KOD': 'Madhya Pradesh', 'BIDWAL': 'Madhya Pradesh', 'KANWAN': 'Madhya Pradesh',
    'SARDARPUR': 'Madhya Pradesh', 'RAJGARH': 'Madhya Pradesh', 'AMJHERA': 'Madhya Pradesh', 'DASAI': 'Madhya Pradesh',
    'MANAWAR': 'Madhya Pradesh', 'SINGHANA': 'Madhya Pradesh', 'BAKANER': 'Madhya Pradesh',
    'DHARAMPURI': 'Madhya Pradesh', 'DHAMNOD': 'Madhya Pradesh', 'SUNDREL': 'Madhya Pradesh',
    'KUKSHI': 'Madhya Pradesh', 'BAGH': 'Madhya Pradesh', 'DAHI': 'Madhya Pradesh',
    'GANDHWANI': 'Madhya Pradesh', 'JEERABAD': 'Madhya Pradesh',

    // 5. SEHORE DISTRICT (Extended)
    'NASRULLAGANJ': 'Madhya Pradesh', 'BHERUNDA': 'Madhya Pradesh', 'LADKUI': 'Madhya Pradesh', 'GOPALPUR': 'Madhya Pradesh', 'CHHIPANER': 'Madhya Pradesh',
    'BUDNI': 'Madhya Pradesh', 'SHAHGANJ': 'Madhya Pradesh', 'BAKARA': 'Madhya Pradesh', 'JAHANPUR': 'Madhya Pradesh',
    'SHYAMPUR': 'Madhya Pradesh', 'DORAHA': 'Madhya Pradesh', 'AHMEDPUR': 'Madhya Pradesh',

    // 6. SHAJAPUR & AGAR DISTRICTS
    'SHAJAPUR': 'Madhya Pradesh', 'BERCHA': 'Madhya Pradesh', 'MAKSI': 'Madhya Pradesh',
    'SHUJALPUR': 'Madhya Pradesh', 'AKODIA': 'Madhya Pradesh', 'POLAYKALAN': 'Madhya Pradesh',
    'KALAPIPAL': 'Madhya Pradesh', 'KHOKRA': 'Madhya Pradesh',
    'AGAR': 'Madhya Pradesh', 'BADOD': 'Madhya Pradesh', 'KANAD': 'Madhya Pradesh',
    'SUSNER': 'Madhya Pradesh', 'SOYAT KALAN': 'Madhya Pradesh',
    'NALKHERA': 'Madhya Pradesh', 'CHHAPIHEDA': 'Madhya Pradesh',

    // 7. RATLAM DISTRICT
    'JAORA': 'Madhya Pradesh', 'PIPLODA': 'Madhya Pradesh', 'BARAWADA': 'Madhya Pradesh',
    'ALOT': 'Madhya Pradesh', 'TAL': 'Madhya Pradesh', 'KHARWA KALAN': 'Madhya Pradesh',
    'SAILANA': 'Madhya Pradesh', 'BAJNA': 'Madhya Pradesh', 'RAOTI': 'Madhya Pradesh',

    // 8. KHANDWA (East Nimar)
    'PANDHANA': 'Madhya Pradesh', 'CHHEGAON MAKHAN': 'Madhya Pradesh',
    'PUNASA': 'Madhya Pradesh', 'MUNDI': 'Madhya Pradesh', 'OMKARESHWAR': 'Madhya Pradesh',
    'HARSUD': 'Madhya Pradesh', 'KHALWA': 'Madhya Pradesh',

    // 9. KHARGONE (West Nimar)
    'MAHESHWAR': 'Madhya Pradesh', 'MANDLESHWAR': 'Madhya Pradesh', 'DHAMANGAON': 'Madhya Pradesh',
    'KASRAWAD': 'Madhya Pradesh', 'BALKWARA': 'Madhya Pradesh',
    'SANAWAD': 'Madhya Pradesh', 'BARWAHA': 'Madhya Pradesh', 'BEDIA': 'Madhya Pradesh',
    'BHIKANGAON': 'Madhya Pradesh', 'GOGAWAN': 'Madhya Pradesh',
    'SEGAON': 'Madhya Pradesh', 'JULWANIA': 'Madhya Pradesh',

    // 10. RAJGARH DISTRICT
    'SARANGPUR': 'Madhya Pradesh', 'PACHORE': 'Madhya Pradesh',
    'BIAORA': 'Madhya Pradesh', 'SUTHALIYA': 'Madhya Pradesh',
    'NARSINGHGARH': 'Madhya Pradesh', 'BODA': 'Madhya Pradesh', 'KURAYAR': 'Madhya Pradesh',
    'KHILCHIPUR': 'Madhya Pradesh', 'CHHAPIHEDA': 'Madhya Pradesh',
    'ZEERAPUR': 'Madhya Pradesh', 'MACHALPUR': 'Madhya Pradesh',

    // ------------------------------------------------------------------
    // GRANULAR VILLAGE MAPPING (10km Radius of Tehsils)
    // ------------------------------------------------------------------

    // KHATEGAON (Dewas) Cluster
    'KHATEGAON': 'Madhya Pradesh', 'NEMAWAR': 'Madhya Pradesh', 'HARANGAON': 'Madhya Pradesh',
    'SANDALPUR': 'Madhya Pradesh', 'UMARIA': 'Madhya Pradesh', 'AJNAS': 'Madhya Pradesh',
    'BIJALGAON': 'Madhya Pradesh', 'DEEPGAON': 'Madhya Pradesh',

    // KANNOD (Dewas) Cluster
    'KANNOD': 'Madhya Pradesh', 'SATWAS': 'Madhya Pradesh', 'LOHARDA': 'Madhya Pradesh',
    'KANTAPHOD': 'Madhya Pradesh', 'NANASA': 'Madhya Pradesh', 'KUSMANIA': 'Madhya Pradesh',
    'BAIGAON': 'Madhya Pradesh', 'JINWANI': 'Madhya Pradesh',

    // BAGLI (Dewas) Cluster
    'BAGLI': 'Madhya Pradesh', 'UDAINAGAR': 'Madhya Pradesh', 'CHAPDA': 'Madhya Pradesh',
    'PUNJAPURA': 'Madhya Pradesh', 'HATPIPLIYA': 'Madhya Pradesh', 'KARNAWAD': 'Madhya Pradesh',
    'KAMALAPUR': 'Madhya Pradesh', 'PIPRI': 'Madhya Pradesh',

    // TONK KHURD (Dewas) Cluster
    'TONK KHURD': 'Madhya Pradesh', 'CHIRAWAD': 'Madhya Pradesh', 'IQAALA': 'Madhya Pradesh',
    'AMONA': 'Madhya Pradesh', 'DEOGARH': 'Madhya Pradesh',

    // BADNAWAR (Dhar) Cluster
    'BADNAWAR': 'Madhya Pradesh', 'KOD': 'Madhya Pradesh', 'BIDWAL': 'Madhya Pradesh',
    'KANWAN': 'Madhya Pradesh', 'NAGDA': 'Madhya Pradesh', 'KESUR': 'Madhya Pradesh',
    'MULTHAN': 'Madhya Pradesh', 'KACHAROD': 'Madhya Pradesh',

    // SARDARPUR (Dhar) Cluster
    'SARDARPUR': 'Madhya Pradesh', 'RAJGARH': 'Madhya Pradesh', 'AMJHERA': 'Madhya Pradesh',
    'DASAI': 'Madhya Pradesh', 'CHALNISARA': 'Madhya Pradesh', 'RINGNOD': 'Madhya Pradesh',
    'BOPLA': 'Madhya Pradesh',

    // KUKSHI (Dhar) Cluster
    'KUKSHI': 'Madhya Pradesh', 'BAGH': 'Madhya Pradesh', 'DAHI': 'Madhya Pradesh',
    'NISARPUR': 'Madhya Pradesh', 'LOHARI': 'Madhya Pradesh', 'SUSANIYA': 'Madhya Pradesh',

    // DHARAMPURI (Dhar) Cluster
    'DHARAMPURI': 'Madhya Pradesh', 'DHAMNOD': 'Madhya Pradesh', 'SUNDREL': 'Madhya Pradesh',
    'KHALGHAT': 'Madhya Pradesh', 'GUJRI': 'Madhya Pradesh', 'SEJWAYA': 'Madhya Pradesh',

    // NAGDA (Ujjain) Cluster
    'NAGDA': 'Madhya Pradesh', 'RUPETA': 'Madhya Pradesh', 'UNHEL': 'Madhya Pradesh',
    'PALSODA': 'Madhya Pradesh', 'BERCHA': 'Madhya Pradesh', 'GINODA': 'Madhya Pradesh',

    // BADNAGAR (Ujjain) Cluster
    'BADNAGAR': 'Madhya Pradesh', 'INGORIA': 'Madhya Pradesh', 'RUNIJA': 'Madhya Pradesh',
    'BHATPACHLANA': 'Madhya Pradesh', 'KHARSHOD KALAN': 'Madhya Pradesh',

    // MAHIDPUR (Ujjain) Cluster
    'MAHIDPUR': 'Madhya Pradesh', 'JHARDA': 'Madhya Pradesh', 'GHOSLA': 'Madhya Pradesh',
    'KHELIA': 'Madhya Pradesh', 'BOLASA': 'Madhya Pradesh',

    // TARANA (Ujjain) Cluster
    'TARANA': 'Madhya Pradesh', 'MAKDON': 'Madhya Pradesh', 'KAYTHA': 'Madhya Pradesh',
    'NANDED': 'Madhya Pradesh', 'SUMRAKHEDA': 'Madhya Pradesh',

    // SHAJAPUR CLUSTER
    'SHAJAPUR': 'Madhya Pradesh', 'BERCHA': 'Madhya Pradesh', 'MAKSI': 'Madhya Pradesh',
    'DUPADA': 'Madhya Pradesh', 'MOMAN BADODIA': 'Madhya Pradesh',

    // SHUJALPUR (Shajapur) Cluster
    'SHUJALPUR': 'Madhya Pradesh', 'AKODIA': 'Madhya Pradesh', 'POLAYKALAN': 'Madhya Pradesh',
    'KALAPIPAL': 'Madhya Pradesh', 'KHOKRA': 'Madhya Pradesh', 'AVANTIPUR BADODIA': 'Madhya Pradesh',

    // SANWER (Indore) Cluster
    'SANWER': 'Madhya Pradesh', 'CHANDRAWATIGANJ': 'Madhya Pradesh', 'KSHIPRA': 'Madhya Pradesh',
    'AJNOD': 'Madhya Pradesh', 'PIRKARADIA': 'Madhya Pradesh', 'DHARAMPURI': 'Madhya Pradesh',

    // DEPALPUR (Indore) Cluster
    'DEPALPUR': 'Madhya Pradesh', 'GAUTAMPURA': 'Madhya Pradesh', 'BETMA': 'Madhya Pradesh',
    'HASALPUR': 'Madhya Pradesh', 'ATAHEDA': 'Madhya Pradesh', 'BANEDIA': 'Madhya Pradesh',

    // MHOW (Indore) Cluster
    'MHOW': 'Madhya Pradesh', 'KISHANGANJ': 'Madhya Pradesh', 'KODARIYA': 'Madhya Pradesh',
    'BADGONA': 'Madhya Pradesh', 'SIMROL': 'Madhya Pradesh', 'MANPUR': 'Madhya Pradesh',
    'MEN': 'Madhya Pradesh', 'HASALPUR': 'Madhya Pradesh',

    // AGAR MALWA Cluster
    'AGAR': 'Madhya Pradesh', 'BADOD': 'Madhya Pradesh', 'KANAD': 'Madhya Pradesh',
    'SUSNER': 'Madhya Pradesh', 'SOYAT KALAN': 'Madhya Pradesh', 'NALKHERA': 'Madhya Pradesh',

    // RAJGARH Cluster
    'SARANGPUR': 'Madhya Pradesh', 'PACHORE': 'Madhya Pradesh', 'BIAORA': 'Madhya Pradesh',
    'SUTHALIYA': 'Madhya Pradesh', 'NARSINGHGARH': 'Madhya Pradesh', 'BODA': 'Madhya Pradesh',
    'KHILCHIPUR': 'Madhya Pradesh', 'JEERAPUR': 'Madhya Pradesh', 'MACHALPUR': 'Madhya Pradesh',

    // ------------------------------------------------------------------
    // BORDER TOWNS (Out-of-State but close to MP)
    // ------------------------------------------------------------------

    // MAHARASHTRA BORDER
    'BHUSAWAL': 'Maharashtra', 'AMALNER': 'Maharashtra', 'SHIRPUR': 'Maharashtra',
    'MALKAPUR': 'Maharashtra', 'RAVER': 'Maharashtra', 'MUKTAINAGAR': 'Maharashtra',
    'CHOPDA': 'Maharashtra', 'YAWAL': 'Maharashtra', 'SHAHADA': 'Maharashtra',

    // RAJASTHAN BORDER
    'JHALAWAR': 'Rajasthan', 'BHAWANI MANDI': 'Rajasthan', 'RAMGANJ MANDI': 'Rajasthan',
    'PIRAWA': 'Rajasthan', 'JHALRAPATAN': 'Rajasthan', 'CHHABRA': 'Rajasthan',
    'RAWATBHATA': 'Rajasthan', 'MANOHAR THANA': 'Rajasthan',

    // GUJARAT BORDER
    'DAHOD': 'Gujarat', 'GODHRA': 'Gujarat', 'JHALOD': 'Gujarat', 'FATEPURA': 'Gujarat',
    'LIMKHEDA': 'Gujarat', 'SANTRAMPUR': 'Gujarat',

    // 11. HARDA DISTRICT
    'HARDA': 'Madhya Pradesh', 'HANDIA': 'Madhya Pradesh',
    'TIMARNI': 'Madhya Pradesh', 'RAHATGAON': 'Madhya Pradesh',
    'KHIRKIYA': 'Madhya Pradesh', 'CHHIPABAD': 'Madhya Pradesh',

    // 12. BARWANI DISTRICT
    'SENDHWA': 'Madhya Pradesh', 'KHETIA': 'Madhya Pradesh', 'PANSEMAL': 'Madhya Pradesh',
    'RAJPUR': 'Madhya Pradesh', 'ANJAD': 'Madhya Pradesh', 'PALSUD': 'Madhya Pradesh',
    'THIKRI': 'Madhya Pradesh', 'PATI': 'Madhya Pradesh',

    // UJJAIN RURAL CLUSTERS
    'NARWAR': 'Madhya Pradesh', 'TAJPUR': 'Madhya Pradesh', 'GHATIA': 'Madhya Pradesh',
    'PANBIHAR': 'Madhya Pradesh', 'UNHEL': 'Madhya Pradesh',

    // 1.2 MAJOR PANCHAYATS & RURAL HUBS (MP)
    // Sehore Hubs
    'REHTI': 'Madhya Pradesh', 'NASRULLAGANJ': 'Madhya Pradesh', 'BHERUNDA': 'Madhya Pradesh',
    'BUDNI': 'Madhya Pradesh', 'BAKARA': 'Madhya Pradesh', 'SEMRI': 'Madhya Pradesh',
    'SHAHGANJ': 'Madhya Pradesh', 'GOPALPUR': 'Madhya Pradesh', 'LADKUI': 'Madhya Pradesh',

    // Indore Rural Hubs
    'MHOWGAON': 'Madhya Pradesh', 'RANGWASA': 'Madhya Pradesh', 'TILLOR': 'Madhya Pradesh',
    'PEDMI': 'Madhya Pradesh', 'KAMPEL': 'Madhya Pradesh', 'KHUDEL': 'Madhya Pradesh',

    // Dewas Rural Hubs
    'HATPIPLIYA': 'Madhya Pradesh', 'KARNAWAD': 'Madhya Pradesh', 'KANTAPHOD': 'Madhya Pradesh',
    'SATWAS': 'Madhya Pradesh', 'LOHARDA': 'Madhya Pradesh', 'KHAATEGAON': 'Madhya Pradesh',

    // Ujjain Rural Hubs
    'MAKDON': 'Madhya Pradesh', 'JHARDA': 'Madhya Pradesh', 'KAYTHA': 'Madhya Pradesh',

    // Other Regional Hubs
    'MANDLESHWAR': 'Madhya Pradesh', 'DHAMNOD': 'Madhya Pradesh', 'MANAWAR': 'Madhya Pradesh',
    'KUKSHI': 'Madhya Pradesh', 'BADNAWAR': 'Madhya Pradesh', 'SARDARPUR': 'Madhya Pradesh',
    'JOBAT': 'Madhya Pradesh', 'PETLAWAD': 'Madhya Pradesh', 'THANDLA': 'Madhya Pradesh',
    'ALOT': 'Madhya Pradesh', 'JAORA': 'Madhya Pradesh', 'SAILANA': 'Madhya Pradesh',
    'AGAR': 'Madhya Pradesh', 'SUSNER': 'Madhya Pradesh', 'NALKHERA': 'Madhya Pradesh',
    'SITAMAU': 'Madhya Pradesh', 'SHAMGARH': 'Madhya Pradesh', 'SUWASRA': 'Madhya Pradesh',
    'GAROTH': 'Madhya Pradesh', 'BHANPURA': 'Madhya Pradesh',
    'KHANDWA': 'Madhya Pradesh',
    'KHARGONE': 'Madhya Pradesh',
    'BARWANI': 'Madhya Pradesh',
    'BURHANPUR': 'Madhya Pradesh',
    'RATLAM': 'Madhya Pradesh',
    'AGAR MALWA': 'Madhya Pradesh',
    'ALIRAJPUR': 'Madhya Pradesh',
    'JHABUA': 'Madhya Pradesh',
    'HARDA': 'Madhya Pradesh',
    'BETUL': 'Madhya Pradesh',
    'RAISEN': 'Madhya Pradesh', // Near Bhopal/Sehore

    // 2. MADHYA PRADESH TEHSILS & TOWNS (Granular Verification)
    'ASHTA': 'Madhya Pradesh', 'SONKATCH': 'Madhya Pradesh', 'TONK KHURD': 'Madhya Pradesh', 'BAGLI': 'Madhya Pradesh',
    'KANNOD': 'Madhya Pradesh', 'KHATEGAON': 'Madhya Pradesh', 'NAGDA': 'Madhya Pradesh', 'KHACHROD': 'Madhya Pradesh',
    'MAHIDPUR': 'Madhya Pradesh', 'TARANA': 'Madhya Pradesh', 'BADNAGAR': 'Madhya Pradesh', 'ALOT': 'Madhya Pradesh',
    'JAORA': 'Madhya Pradesh', 'SAILANA': 'Madhya Pradesh', 'PIPLODA': 'Madhya Pradesh',
    'SARDARPUR': 'Madhya Pradesh', 'BADNAWAR': 'Madhya Pradesh', 'KUKSHI': 'Madhya Pradesh', 'MANAWAR': 'Madhya Pradesh',
    'DHARAMPURI': 'Madhya Pradesh', 'GANDHWANI': 'Madhya Pradesh', 'PETLAWAD': 'Madhya Pradesh', 'THANDLA': 'Madhya Pradesh',
    'JOBAT': 'Madhya Pradesh', 'BHABRA': 'Madhya Pradesh', 'SENDHWA': 'Madhya Pradesh', 'RAJPUR': 'Madhya Pradesh',
    'ANJAD': 'Madhya Pradesh', 'THIKRI': 'Madhya Pradesh', 'PANSEMAL': 'Madhya Pradesh', 'KHETIA': 'Madhya Pradesh',
    'NEPANAGAR': 'Madhya Pradesh', 'PANDHANA': 'Madhya Pradesh', 'PUNASA': 'Madhya Pradesh', 'HARSUD': 'Madhya Pradesh',
    'BHIKANGAON': 'Madhya Pradesh', 'MAHESHWAR': 'Madhya Pradesh', 'KASRAWAD': 'Madhya Pradesh', 'BARWAHA': 'Madhya Pradesh',
    'SANAWAD': 'Madhya Pradesh', 'KHIRKIYA': 'Madhya Pradesh', 'TIMARNI': 'Madhya Pradesh', 'ITARSI': 'Madhya Pradesh',
    'PIPARIYA': 'Madhya Pradesh', 'SOHAGPUR': 'Madhya Pradesh', 'BABAI': 'Madhya Pradesh', 'BUDNI': 'Madhya Pradesh',
    'NASRULLAGANJ': 'Madhya Pradesh', 'GOHARGANJ': 'Madhya Pradesh', 'BARELI': 'Madhya Pradesh', 'UDAIPURA': 'Madhya Pradesh',
    'SILWANI': 'Madhya Pradesh', 'BEGUMGANJ': 'Madhya Pradesh', 'GAIRATGANJ': 'Madhya Pradesh', 'BERASIA': 'Madhya Pradesh',
    'SHAMSHABAD': 'Madhya Pradesh', 'LATERI': 'Madhya Pradesh', 'SIRONJ': 'Madhya Pradesh', 'KURWAI': 'Madhya Pradesh',
    'BASODA': 'Madhya Pradesh', 'GYARASPUR': 'Madhya Pradesh', 'KHILCHIPUR': 'Madhya Pradesh', 'ZEERAPUR': 'Madhya Pradesh',
    'BIAORA': 'Madhya Pradesh', 'SARANGPUR': 'Madhya Pradesh', 'NARSINGHGARH': 'Madhya Pradesh', 'AGAR': 'Madhya Pradesh',
    'SUSNER': 'Madhya Pradesh', 'NALKHERA': 'Madhya Pradesh', 'BADOD': 'Madhya Pradesh', 'SITAMAU': 'Madhya Pradesh',
    'MALHARGARH': 'Madhya Pradesh', 'GAROTH': 'Madhya Pradesh', 'BHANPURA': 'Madhya Pradesh', 'MANASA': 'Madhya Pradesh',
    'JAWAD': 'Madhya Pradesh', 'SINGOLI': 'Madhya Pradesh', 'GOTEGAON': 'Madhya Pradesh', 'GADARWARA': 'Madhya Pradesh',
    'TENKHEDA': 'Madhya Pradesh', 'KARELI': 'Madhya Pradesh', 'LAKHNADON': 'Madhya Pradesh', 'CHAPARA': 'Madhya Pradesh',
    'KEOLARI': 'Madhya Pradesh', 'BARGHAT': 'Madhya Pradesh', 'WARASEONI': 'Madhya Pradesh', 'KATANGI': 'Madhya Pradesh',
    'LALBURRA': 'Madhya Pradesh', 'BAIHAR': 'Madhya Pradesh', 'LANJI': 'Madhya Pradesh', 'KIRNAPUR': 'Madhya Pradesh',
    'PARASIA': 'Madhya Pradesh', 'JUNNARDEO': 'Madhya Pradesh', 'AMARWARA': 'Madhya Pradesh', 'SAUSAR': 'Madhya Pradesh',
    'PANDHURNA': 'Madhya Pradesh', 'MULTAI': 'Madhya Pradesh', 'AMLA': 'Madhya Pradesh', 'BHAINSDEHI': 'Madhya Pradesh',
    'ATNER': 'Madhya Pradesh', 'CHICHOLI': 'Madhya Pradesh', 'GHODADONGRI': 'Madhya Pradesh', 'SHAHHPUR': 'Madhya Pradesh',
    'REHLI': 'Madhya Pradesh', 'BANDA': 'Madhya Pradesh', 'KHURAI': 'Madhya Pradesh', 'BINA': 'Madhya Pradesh',
    'DEORI': 'Madhya Pradesh', 'KESLI': 'Madhya Pradesh', 'GARHAKOTA': 'Madhya Pradesh', 'RAHATGARH': 'Madhya Pradesh',
    'MAISHAR': 'Madhya Pradesh', 'AMARPATAN': 'Madhya Pradesh', 'RAMPUR': 'Madhya Pradesh', 'NAGOD': 'Madhya Pradesh',

    // 3. REST OF MADHYA PRADESH (Districts)
    'BHOPAL': 'Madhya Pradesh', // Capital
    'GWALIOR': 'Madhya Pradesh',
    'JABALPUR': 'Madhya Pradesh',
    'SAGAR': 'Madhya Pradesh',
    'REWA': 'Madhya Pradesh',
    'SATNA': 'Madhya Pradesh',
    'CHHINDWARA': 'Madhya Pradesh',
    'MORENA': 'Madhya Pradesh',
    'BHIND': 'Madhya Pradesh',
    'SHIVPURI': 'Madhya Pradesh',
    'VIDISHA': 'Madhya Pradesh',
    'CHHATARPUR': 'Madhya Pradesh',
    'DAMOH': 'Madhya Pradesh',
    'MANDSAUR': 'Madhya Pradesh',
    'NEEMUCH': 'Madhya Pradesh',
    'GUNA': 'Madhya Pradesh',
    'ASHOKNAGAR': 'Madhya Pradesh',
    'DATIA': 'Madhya Pradesh',
    'TIKAMGARH': 'Madhya Pradesh',
    'NIWARI': 'Madhya Pradesh',
    'PANNA': 'Madhya Pradesh',
    'SINGRAULI': 'Madhya Pradesh',
    'SIDHI': 'Madhya Pradesh',
    'SHAHDOL': 'Madhya Pradesh',
    'ANUPPUR': 'Madhya Pradesh',
    'UMARIA': 'Madhya Pradesh',
    'DINDORI': 'Madhya Pradesh',
    'MANDLA': 'Madhya Pradesh',
    'BALAGHAT': 'Madhya Pradesh',
    'SEONI': 'Madhya Pradesh',
    'NARSINGHPUR': 'Madhya Pradesh',
    'HOSHANGABAD': 'Madhya Pradesh',
    'NARMADAPURAM': 'Madhya Pradesh',
    'RAJGARH': 'Madhya Pradesh',
    'SHEOPUR': 'Madhya Pradesh',

    // 3. BIHAR (Complete 38 Districts)
    'PATNA': 'Bihar', 'GAYA': 'Bihar', 'BHAGALPUR': 'Bihar', 'MUZAFFARPUR': 'Bihar', 'DARBHANGA': 'Bihar',
    'ARARIA': 'Bihar', 'ARWAL': 'Bihar', 'AURANGABAD': 'Bihar', 'BANKA': 'Bihar', 'BEGUSARAI': 'Bihar',
    'BHOJPUR': 'Bihar', 'BUXAR': 'Bihar', 'EAST CHAMPARAN': 'Bihar', 'MOTIHARI': 'Bihar', 'GOPALGANJ': 'Bihar',
    'JAMUI': 'Bihar', 'JEHANABAD': 'Bihar', 'KAIMUR': 'Bihar', 'BHABUA': 'Bihar', 'KATIHAR': 'Bihar', 'KHAGARIA': 'Bihar',
    'KISHANGANJ': 'Bihar', 'LAKHISARAI': 'Bihar', 'MADHEPURA': 'Bihar', 'MADHUBANI': 'Bihar', 'MUNGER': 'Bihar',
    'NALANDA': 'Bihar', 'BIHAR SHARIF': 'Bihar', 'NAWADA': 'Bihar', 'PURNIA': 'Bihar', 'ROHTAS': 'Bihar', 'SASARAM': 'Bihar',
    'SAHARSA': 'Bihar', 'SAMASTIPUR': 'Bihar', 'SARAN': 'Bihar', 'CHAPRA': 'Bihar', 'SHEIKHPURA': 'Bihar',
    'SHEOHAR': 'Bihar', 'SITAMARHI': 'Bihar', 'SIWAN': 'Bihar', 'SUPAUL': 'Bihar', 'VAISHALI': 'Bihar',
    'HAJIPUR': 'Bihar', 'WEST CHAMPARAN': 'Bihar', 'BETTIAH': 'Bihar',

    // 4. MAHARASHTRA (Complete 36 Districts + New Names)
    'MUMBAI': 'Maharashtra', 'MUMBAI CITY': 'Maharashtra', 'MUMBAI SUBURBAN': 'Maharashtra',
    'PUNE': 'Maharashtra', 'NAGPUR': 'Maharashtra', 'NASHIK': 'Maharashtra',
    'AURANGABAD': 'Maharashtra', 'CHHATRAPATI SAMBHAJINAGAR': 'Maharashtra', 'SAMBHAJINAGAR': 'Maharashtra', // New Name
    'OSMANABAD': 'Maharashtra', 'DHARASHIV': 'Maharashtra', // New Name
    'AHMEDNAGAR': 'Maharashtra', 'AHILYANAGAR': 'Maharashtra', // Proposed/New Name
    'AKOLA': 'Maharashtra', 'AMRAVATI': 'Maharashtra', 'BEED': 'Maharashtra', 'BHANDARA': 'Maharashtra',
    'BULDHANA': 'Maharashtra', 'CHANDRAPUR': 'Maharashtra', 'DHULE': 'Maharashtra', 'GADCHIROLI': 'Maharashtra',
    'GONDIA': 'Maharashtra', 'HINGOLI': 'Maharashtra', 'JALGAON': 'Maharashtra', 'JALNA': 'Maharashtra',
    'KOLHAPUR': 'Maharashtra', 'LATUR': 'Maharashtra', 'NANDED': 'Maharashtra', 'NANDURBAR': 'Maharashtra',
    'PALGHAR': 'Maharashtra', 'PARBHANI': 'Maharashtra', 'RAIGAD': 'Maharashtra', 'RATNAGIRI': 'Maharashtra',
    'SANGLI': 'Maharashtra', 'SATARA': 'Maharashtra', 'SINDHUDURG': 'Maharashtra', 'SOLAPUR': 'Maharashtra',
    'THANE': 'Maharashtra', 'WARDHA': 'Maharashtra', 'WASHIM': 'Maharashtra', 'YAVATMAL': 'Maharashtra',

    // 5. GUJARAT (Complete 33 Districts)
    'AHMEDABAD': 'Gujarat', 'SURAT': 'Gujarat', 'VADODARA': 'Gujarat', 'RAJKOT': 'Gujarat', 'GANDHINAGAR': 'Gujarat',
    'AMRELI': 'Gujarat', 'ANAND': 'Gujarat', 'ARAVALLI': 'Gujarat', 'BANASKANTHA': 'Gujarat', 'PALANPUR': 'Gujarat',
    'BHARUCH': 'Gujarat', 'BHAVNAGAR': 'Gujarat', 'BOTAD': 'Gujarat', 'CHHOTA UDEPUR': 'Gujarat',
    'DAHOD': 'Gujarat', 'DANGS': 'Gujarat', 'AHWA': 'Gujarat', 'DEVBHOOMI DWARKA': 'Gujarat', 'DWARKA': 'Gujarat',
    'GIR SOMNATH': 'Gujarat', 'VERAVAL': 'Gujarat', 'JAMNAGAR': 'Gujarat', 'JUNAGADH': 'Gujarat',
    'KHEDA': 'Gujarat', 'NADIAD': 'Gujarat', 'KUTCH': 'Gujarat', 'BHUJ': 'Gujarat',
    'MAHISAGAR': 'Gujarat', 'LUNAVADA': 'Gujarat', 'MEHSANA': 'Gujarat', 'MORBI': 'Gujarat',
    'NARMADA': 'Gujarat', 'RAJPIPLA': 'Gujarat', 'NAVSARI': 'Gujarat', 'PANCHMAHAL': 'Gujarat', 'GODHRA': 'Gujarat',
    'PATAN': 'Gujarat', 'PORBANDAR': 'Gujarat', 'SABARKANTHA': 'Gujarat', 'HIMATNAGAR': 'Gujarat',
    'SURENDRANAGAR': 'Gujarat', 'TAPI': 'Gujarat', 'VYARA': 'Gujarat', 'VALSAD': 'Gujarat',

    // 6. RAJASTHAN (Complete 50 Districts including New 2023)
    'JAIPUR': 'Rajasthan', 'JAIPUR RURAL': 'Rajasthan', 'JODHPUR': 'Rajasthan', 'JODHPUR RURAL': 'Rajasthan',
    'KOTA': 'Rajasthan', 'UDAIPUR': 'Rajasthan', 'AJMER': 'Rajasthan', 'ALWAR': 'Rajasthan', 'BANSWARA': 'Rajasthan',
    'BARAN': 'Rajasthan', 'BARMER': 'Rajasthan', 'BALOTRA': 'Rajasthan', // New
    'BHARATPUR': 'Rajasthan', 'BHILWARA': 'Rajasthan', 'SHAHPURA': 'Rajasthan', // New
    'BIKANER': 'Rajasthan', 'BUNDI': 'Rajasthan', 'CHITTORGARH': 'Rajasthan',
    'CHURU': 'Rajasthan', 'DAUSA': 'Rajasthan', 'DHOLPUR': 'Rajasthan', 'DUNGARPUR': 'Rajasthan',
    'GANGAPUR CITY': 'Rajasthan', // New
    'HANUMANGARH': 'Rajasthan', 'JAISALMER': 'Rajasthan', 'JALORE': 'Rajasthan', 'SANCHORE': 'Rajasthan', // New
    'JHALAWAR': 'Rajasthan', 'JHUNJHUNU': 'Rajasthan',
    'KARAULI': 'Rajasthan', 'KEKRI': 'Rajasthan', // New
    'KHAIRTHAL-TIJARA': 'Rajasthan', 'KHAIRTHAL': 'Rajasthan', // New
    'KOTPUTLI-BEHROR': 'Rajasthan', 'KOTPUTLI': 'Rajasthan', // New
    'NAGAUR': 'Rajasthan', 'DIDWANA-KUCHAMAN': 'Rajasthan', 'DIDWANA': 'Rajasthan', 'KUCHAMAN': 'Rajasthan', // New
    'NEEM KA THANA': 'Rajasthan', // New
    'PALI': 'Rajasthan', 'PHALODI': 'Rajasthan', // New
    'PRATAPGARH': 'Rajasthan', 'RAJSAMAND': 'Rajasthan', 'SAWAI MADHOPUR': 'Rajasthan',
    'SIKAR': 'Rajasthan', 'SIROHI': 'Rajasthan', 'SRI GANGANAGAR': 'Rajasthan', 'ANUPGARH': 'Rajasthan', // New
    'TONK': 'Rajasthan', 'DUDU': 'Rajasthan', // New
    'DEEG': 'Rajasthan', // New
    'BEAWAR': 'Rajasthan', // New
    'SALUMBAR': 'Rajasthan', // New

    // 7. UTTAR PRADESH (Complete 75 Districts)
    'LUCKNOW': 'Uttar Pradesh', 'KANPUR': 'Uttar Pradesh', 'KANPUR NAGAR': 'Uttar Pradesh', 'KANPUR DEHAT': 'Uttar Pradesh',
    'VARANASI': 'Uttar Pradesh', 'KASHI': 'Uttar Pradesh', 'AGRA': 'Uttar Pradesh', 'NOIDA': 'Uttar Pradesh', 'GAUTAM BUDDHA NAGAR': 'Uttar Pradesh',
    'GHAZIABAD': 'Uttar Pradesh', 'PRAYAGRAJ': 'Uttar Pradesh', 'ALLAHABAD': 'Uttar Pradesh',
    'AGRA': 'Uttar Pradesh', 'ALIGARH': 'Uttar Pradesh', 'AMBEDKAR NAGAR': 'Uttar Pradesh', 'AMETHI': 'Uttar Pradesh', 'AMROHA': 'Uttar Pradesh',
    'AURAIYA': 'Uttar Pradesh', 'AYODHYA': 'Uttar Pradesh', 'FAIZABAD': 'Uttar Pradesh', 'AZAMGARH': 'Uttar Pradesh',
    'BAGHPAT': 'Uttar Pradesh', 'BAHRAICH': 'Uttar Pradesh', 'BALLIA': 'Uttar Pradesh', 'BALRAMPUR': 'Uttar Pradesh',
    'BANDA': 'Uttar Pradesh', 'BARABANKI': 'Uttar Pradesh', 'BAREILLY': 'Uttar Pradesh', 'BASTI': 'Uttar Pradesh',
    'BHADOHI': 'Uttar Pradesh', 'SANT RAVIDAS NAGAR': 'Uttar Pradesh', 'BIJNOR': 'Uttar Pradesh', 'BUDAUN': 'Uttar Pradesh',
    'BULANDSHAHR': 'Uttar Pradesh', 'CHANDAULI': 'Uttar Pradesh', 'CHITRAKOOT': 'Uttar Pradesh', 'DEORIA': 'Uttar Pradesh',
    'ETAH': 'Uttar Pradesh', 'ETAWAH': 'Uttar Pradesh', 'FARRUKHABAD': 'Uttar Pradesh', 'FATEHPUR': 'Uttar Pradesh',
    'FIROZABAD': 'Uttar Pradesh', 'GHAZIPUR': 'Uttar Pradesh', 'GONDA': 'Uttar Pradesh', 'GORAKHPUR': 'Uttar Pradesh',
    'HAMIRPUR': 'Uttar Pradesh', 'HAPUR': 'Uttar Pradesh', 'PANCHSHEEL NAGAR': 'Uttar Pradesh', 'HARDOI': 'Uttar Pradesh',
    'HATHRAS': 'Uttar Pradesh', 'MAHAMAYA NAGAR': 'Uttar Pradesh', 'JALAUN': 'Uttar Pradesh', 'ORAI': 'Uttar Pradesh',
    'JAUNPUR': 'Uttar Pradesh', 'JHANSI': 'Uttar Pradesh', 'KANNAUJ': 'Uttar Pradesh', 'KASGANJ': 'Uttar Pradesh', 'KANS HIRAM NAGAR': 'Uttar Pradesh',
    'KAUSHAMBI': 'Uttar Pradesh', 'KHERI': 'Uttar Pradesh', 'LAKHIMPUR KHERI': 'Uttar Pradesh', 'KUSHINAGAR': 'Uttar Pradesh', 'PADRAUNA': 'Uttar Pradesh',
    'LALITPUR': 'Uttar Pradesh', 'MAHARAJGANJ': 'Uttar Pradesh', 'MAHOBA': 'Uttar Pradesh', 'MAINPURI': 'Uttar Pradesh',
    'MATHURA': 'Uttar Pradesh', 'MAU': 'Uttar Pradesh', 'MEERUT': 'Uttar Pradesh', 'MIRZAPUR': 'Uttar Pradesh',
    'MORADABAD': 'Uttar Pradesh', 'MUZAFFARNAGAR': 'Uttar Pradesh', 'PILIBHIT': 'Uttar Pradesh', 'PRATAPGARH': 'Uttar Pradesh',
    'RAEBARELI': 'Uttar Pradesh', 'RAMPUR': 'Uttar Pradesh', 'SAHARANPUR': 'Uttar Pradesh', 'SAMBHAL': 'Uttar Pradesh', 'BHIMNAGAR': 'Uttar Pradesh',
    'SANT KABIR NAGAR': 'Uttar Pradesh', 'SHAHJAHANPUR': 'Uttar Pradesh', 'SHAMLI': 'Uttar Pradesh', 'SHRAVASTI': 'Uttar Pradesh',
    'SIDDHARTHNAGAR': 'Uttar Pradesh', 'SITAPUR': 'Uttar Pradesh', 'SONBHADRA': 'Uttar Pradesh', 'SULTANPUR': 'Uttar Pradesh', 'UNNAO': 'Uttar Pradesh',

    // 8. CHHATTISGARH (Complete 33 Districts)
    'RAIPUR': 'Chhattisgarh', 'BHILAI': 'Chhattisgarh', 'BILASPUR': 'Chhattisgarh', 'DURG': 'Chhattisgarh',
    'BALOD': 'Chhattisgarh', 'BALODA BAZAR': 'Chhattisgarh', 'BALRAMPUR': 'Chhattisgarh',
    'BASTAR': 'Chhattisgarh', 'JAGDALPUR': 'Chhattisgarh', 'BEMETARA': 'Chhattisgarh', 'BIJAPUR': 'Chhattisgarh',
    'DANTEWADA': 'Chhattisgarh', 'DHAMTARI': 'Chhattisgarh', 'GARIYABAND': 'Chhattisgarh',
    'GAURELA-PENDRA-MARWAHI': 'Chhattisgarh', 'PENDRA': 'Chhattisgarh', // New
    'JANJGIR-CHAMPA': 'Chhattisgarh', 'JASHPUR': 'Chhattisgarh', 'KABIRDHAM': 'Chhattisgarh', 'KAWARDHA': 'Chhattisgarh',
    'KANKER': 'Chhattisgarh', 'KONDAGAON': 'Chhattisgarh', 'KORBA': 'Chhattisgarh', 'KOREA': 'Chhattisgarh',
    'MAHASAMUND': 'Chhattisgarh', 'MANENDRAGARH-CHIRMIRI-BHARATPUR': 'Chhattisgarh', 'MANENDRAGARH': 'Chhattisgarh', // New
    'MOHLA-MANPUR-AMBAGARH CHOWKI': 'Chhattisgarh', 'MOHLA': 'Chhattisgarh', // New
    'MUNGELI': 'Chhattisgarh', 'NARAYANPUR': 'Chhattisgarh', 'RAIGARH': 'Chhattisgarh',
    'RAJNANDGAON': 'Chhattisgarh', 'SAKTI': 'Chhattisgarh', // New
    'SARANGARH-BILAIGARH': 'Chhattisgarh', 'SARANGARH': 'Chhattisgarh', // New
    'SUKMA': 'Chhattisgarh', 'SURAJPUR': 'Chhattisgarh', 'SURGUJA': 'Chhattisgarh', 'AMBIKAPUR': 'Chhattisgarh',
    'KHAIRAGARH-CHHUIKHADAN-GANDAI': 'Chhattisgarh', 'KHAIRAGARH': 'Chhattisgarh', // New

    // 9. REST OF INDIA (Alphabetical)
    // ANDHRA PRADESH
    'ANANTAPUR': 'Andhra Pradesh', 'CHITTOOR': 'Andhra Pradesh', 'EAST GODAVARI': 'Andhra Pradesh', 'GUNTUR': 'Andhra Pradesh',
    'KADAPA': 'Andhra Pradesh', 'KRISHNA': 'Andhra Pradesh', 'KURNOOL': 'Andhra Pradesh', 'NELLORE': 'Andhra Pradesh',
    'PRAKASAM': 'Andhra Pradesh', 'SRIKAKULAM': 'Andhra Pradesh', 'VISAKHAPATNAM': 'Andhra Pradesh', 'VIZIANAGARAM': 'Andhra Pradesh',
    'WEST GODAVARI': 'Andhra Pradesh', 'YSR': 'Andhra Pradesh', 'VIJAYAWADA': 'Andhra Pradesh', 'TIRUPATI': 'Andhra Pradesh',

    // ARUNACHAL PRADESH
    'TAWANG': 'Arunachal Pradesh', 'WEST KAMENG': 'Arunachal Pradesh', 'EAST KAMENG': 'Arunachal Pradesh', 'PAPUM PARE': 'Arunachal Pradesh',
    'ITANAGAR': 'Arunachal Pradesh',

    // ASSAM
    'DIBRUGARH': 'Assam', 'GOALPARA': 'Assam', 'JORHAT': 'Assam', 'KAMRUP': 'Assam', 'NAGAON': 'Assam', 'SONITPUR': 'Assam', 'TINSUKIA': 'Assam', 'GUWAHATI': 'Assam',

    // HARYANA
    'AMBALA': 'Haryana', 'BHIWANI': 'Haryana', 'FARIDABAD': 'Haryana', 'GURUGRAM': 'Haryana', 'HISAR': 'Haryana', 'KARNAL': 'Haryana',
    'KURUKSHETRA': 'Haryana', 'PANIPAT': 'Haryana', 'ROHTAK': 'Haryana', 'SONIPAT': 'Haryana', 'GURGAON': 'Haryana',

    // HIMACHAL PRADESH
    'KANGRA': 'Himachal Pradesh', 'KULLU': 'Himachal Pradesh', 'MANDI': 'Himachal Pradesh', 'SHIMLA': 'Himachal Pradesh', 'SOLAN': 'Himachal Pradesh',

    // JHARKHAND
    'BOKARO': 'Jharkhand', 'DHANBAD': 'Jharkhand', 'EAST SINGHBHUM': 'Jharkhand', 'HAZARIBAGH': 'Jharkhand', 'RANCHI': 'Jharkhand', 'JAMSHEDPUR': 'Jharkhand',

    // KARNATAKA
    'BANGALORE': 'Karnataka', 'BENGALURU': 'Karnataka', 'MYSORE': 'Karnataka', 'MANGALORE': 'Karnataka',

    // KERALA
    'ERNAKULAM': 'Kerala', 'KOZHIKODE': 'Kerala', 'THIRUVANANTHAPURAM': 'Kerala', 'COCHIN': 'Kerala', 'KOCHI': 'Kerala',

    // ODISHA
    'CUTTACK': 'Odisha', 'KHORDHA': 'Odisha', 'PURI': 'Odisha', 'BHUBANESWAR': 'Odisha',

    // PUNJAB
    'AMRITSAR': 'Punjab', 'JALANDHAR': 'Punjab', 'LUDHIANA': 'Punjab', 'PATIALA': 'Punjab', 'CHANDIGARH': 'Chandigarh',

    // TAMIL NADU
    'CHENNAI': 'Tamil Nadu', 'COIMBATORE': 'Tamil Nadu', 'MADURAI': 'Tamil Nadu',

    // TELANGANA
    'HYDERABAD': 'Telangana', 'WARANGAL': 'Telangana',

    // WEST BENGAL
    'KOLKATA': 'West Bengal', 'HOWRAH': 'West Bengal', 'DARJEELING': 'West Bengal',

    // UTs
    'DELHI': 'Delhi', 'NEW DELHI': 'Delhi', 'PUDUCHERRY': 'Puducherry', 'SRINAGAR': 'Jammu & Kashmir', 'JAMMU': 'Jammu & Kashmir'
};
