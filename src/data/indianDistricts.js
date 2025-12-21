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

    // 2. REST OF MADHYA PRADESH
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

    // 3. BIHAR (Likely student origin)
    'PATNA': 'Bihar', 'GAYA': 'Bihar', 'BHAGALPUR': 'Bihar', 'MUZAFFARPUR': 'Bihar', 'DARBHANGA': 'Bihar',
    'ARARIA': 'Bihar', 'ARWAL': 'Bihar', 'AURANGABAD': 'Bihar', 'BANKA': 'Bihar', 'BEGUSARAI': 'Bihar',
    'BHOJPUR': 'Bihar', 'BUXAR': 'Bihar', 'EAST CHAMPARAN': 'Bihar', 'GOPALGANJ': 'Bihar',
    'JAMUI': 'Bihar', 'JEHANABAD': 'Bihar', 'KAIMUR': 'Bihar', 'KATIHAR': 'Bihar', 'KHAGARIA': 'Bihar', 'KISHANGANJ': 'Bihar',
    'LAKHISARAI': 'Bihar', 'MADHEPURA': 'Bihar', 'MADHUBANI': 'Bihar', 'MUNGER': 'Bihar', 'NALANDA': 'Bihar',
    'NAWADA': 'Bihar', 'PURNIA': 'Bihar', 'ROHTAS': 'Bihar', 'SAHARSA': 'Bihar', 'SAMASTIPUR': 'Bihar',
    'SARAN': 'Bihar', 'SHEIKHPURA': 'Bihar', 'SHEOHAR': 'Bihar', 'SITAMARHI': 'Bihar', 'SIWAN': 'Bihar', 'SUPAUL': 'Bihar',
    'VAISHALI': 'Bihar', 'WEST CHAMPARAN': 'Bihar',

    // 4. MAHARASHTRA
    'MUMBAI': 'Maharashtra', 'PUNE': 'Maharashtra', 'NAGPUR': 'Maharashtra', 'NASHIK': 'Maharashtra', 'AURANGABAD': 'Maharashtra',
    'AHMEDNAGAR': 'Maharashtra', 'AKOLA': 'Maharashtra', 'AMRAVATI': 'Maharashtra', 'BEED': 'Maharashtra', 'BHANDARA': 'Maharashtra',
    'BULDHANA': 'Maharashtra', 'CHANDRAPUR': 'Maharashtra', 'DHULE': 'Maharashtra', 'GADCHIROLI': 'Maharashtra', 'GONDIA': 'Maharashtra',
    'HINGOLI': 'Maharashtra', 'JALGAON': 'Maharashtra', 'JALNA': 'Maharashtra', 'KOLHAPUR': 'Maharashtra', 'LATUR': 'Maharashtra',
    'NANDED': 'Maharashtra', 'NANDURBAR': 'Maharashtra', 'OSMANABAD': 'Maharashtra', 'PALGHAR': 'Maharashtra', 'PARBHANI': 'Maharashtra',
    'RAIGAD': 'Maharashtra', 'RATNAGIRI': 'Maharashtra', 'SANGLI': 'Maharashtra', 'SATARA': 'Maharashtra', 'SINDHUDURG': 'Maharashtra',
    'SOLAPUR': 'Maharashtra', 'THANE': 'Maharashtra', 'WARDHA': 'Maharashtra', 'WASHIM': 'Maharashtra', 'YAVATMAL': 'Maharashtra', 'RAIGARH': 'Maharashtra',

    // 5. GUJARAT
    'AHMEDABAD': 'Gujarat', 'SURAT': 'Gujarat', 'VADODARA': 'Gujarat', 'RAJKOT': 'Gujarat', 'GANDHINAGAR': 'Gujarat',
    'AMRELI': 'Gujarat', 'ANAND': 'Gujarat', 'ARAVALLI': 'Gujarat', 'BANASKANTHA': 'Gujarat', 'BHARUCH': 'Gujarat',
    'BHAVNAGAR': 'Gujarat', 'BOTAD': 'Gujarat', 'CHHOTA UDEPUR': 'Gujarat', 'DAHOD': 'Gujarat', 'DANGS': 'Gujarat', 'DEVBHOOMI DWARKA': 'Gujarat',
    'GIR SOMNATH': 'Gujarat', 'JAMNAGAR': 'Gujarat', 'JUNAGADH': 'Gujarat', 'KHEDA': 'Gujarat', 'KUTCH': 'Gujarat',
    'MAHISAGAR': 'Gujarat', 'MEHSANA': 'Gujarat', 'MORBI': 'Gujarat', 'NARMADA': 'Gujarat', 'NAVSARI': 'Gujarat', 'PANCHMAHAL': 'Gujarat',
    'PATAN': 'Gujarat', 'PORBANDAR': 'Gujarat', 'SABARKANTHA': 'Gujarat', 'SURENDRANAGAR': 'Gujarat',
    'TAPI': 'Gujarat', 'VALSAD': 'Gujarat',

    // 6. RAJASTHAN
    'JAIPUR': 'Rajasthan', 'KOTA': 'Rajasthan', 'JODHPUR': 'Rajasthan', 'UDAIPUR': 'Rajasthan', 'AJMER': 'Rajasthan',
    'ALWAR': 'Rajasthan', 'BANSWARA': 'Rajasthan', 'BARAN': 'Rajasthan', 'BARMER': 'Rajasthan', 'BHARATPUR': 'Rajasthan',
    'BHILWARA': 'Rajasthan', 'BIKANER': 'Rajasthan', 'BUNDI': 'Rajasthan', 'CHITTORGARH': 'Rajasthan', 'CHURU': 'Rajasthan', 'DAUSA': 'Rajasthan',
    'DHOLPUR': 'Rajasthan', 'DUNGARPUR': 'Rajasthan', 'HANUMANGARH': 'Rajasthan', 'JAISALMER': 'Rajasthan', 'JALORE': 'Rajasthan',
    'JHALAWAR': 'Rajasthan', 'JHUNJHUNU': 'Rajasthan', 'KARAULI': 'Rajasthan', 'NAGAUR': 'Rajasthan',
    'PALI': 'Rajasthan', 'PRATAPGARH': 'Rajasthan', 'RAJSAMAND': 'Rajasthan', 'SAWAI MADHOPUR': 'Rajasthan', 'SIKAR': 'Rajasthan', 'SIROHI': 'Rajasthan',
    'SRI GANGANAGAR': 'Rajasthan', 'TONK': 'Rajasthan',

    // 7. UTTAR PRADESH
    'LUCKNOW': 'Uttar Pradesh', 'KANPUR': 'Uttar Pradesh', 'VARANASI': 'Uttar Pradesh', 'AGRA': 'Uttar Pradesh', 'NOIDA': 'Uttar Pradesh',
    'ALIGARH': 'Uttar Pradesh', 'AMBEDKAR NAGAR': 'Uttar Pradesh', 'AMETHI': 'Uttar Pradesh', 'AMROHA': 'Uttar Pradesh',
    'AURAIYA': 'Uttar Pradesh', 'AYODHYA': 'Uttar Pradesh', 'AZAMGARH': 'Uttar Pradesh', 'BAGHPAT': 'Uttar Pradesh', 'BAHRAICH': 'Uttar Pradesh',
    'BALLIA': 'Uttar Pradesh', 'BALRAMPUR': 'Uttar Pradesh', 'BANDA': 'Uttar Pradesh', 'BARABANKI': 'Uttar Pradesh', 'BAREILLY': 'Uttar Pradesh',
    'BASTI': 'Uttar Pradesh', 'BHADOHI': 'Uttar Pradesh', 'BIJNOR': 'Uttar Pradesh', 'BUDAUN': 'Uttar Pradesh', 'BULANDSHAHR': 'Uttar Pradesh',
    'CHANDAULI': 'Uttar Pradesh', 'CHITRAKOOT': 'Uttar Pradesh', 'DEORIA': 'Uttar Pradesh', 'ETAH': 'Uttar Pradesh', 'ETAWAH': 'Uttar Pradesh',
    'FARRUKHABAD': 'Uttar Pradesh', 'FATEHPUR': 'Uttar Pradesh', 'FIROZABAD': 'Uttar Pradesh', 'GAUTAM BUDDHA NAGAR': 'Uttar Pradesh',
    'GHAZIABAD': 'Uttar Pradesh', 'GHAZIPUR': 'Uttar Pradesh', 'GONDA': 'Uttar Pradesh', 'GORAKHPUR': 'Uttar Pradesh', 'HAMIRPUR': 'Uttar Pradesh',
    'HAPUR': 'Uttar Pradesh', 'HARDOI': 'Uttar Pradesh', 'HATHRAS': 'Uttar Pradesh', 'JALAUN': 'Uttar Pradesh', 'JAUNPUR': 'Uttar Pradesh',
    'JHANSI': 'Uttar Pradesh', 'KANNAUJ': 'Uttar Pradesh', 'KASGANJ': 'Uttar Pradesh', 'KAUSHAMBI': 'Uttar Pradesh',
    'LAKHIMPUR KHERI': 'Uttar Pradesh', 'KHERI': 'Uttar Pradesh', 'KUSHINAGAR': 'Uttar Pradesh', 'LALITPUR': 'Uttar Pradesh',
    'MAHARAJGANJ': 'Uttar Pradesh', 'MAHOBA': 'Uttar Pradesh', 'MAINPURI': 'Uttar Pradesh', 'MATHURA': 'Uttar Pradesh', 'MAU': 'Uttar Pradesh',
    'MEERUT': 'Uttar Pradesh', 'MIRZAPUR': 'Uttar Pradesh', 'MORADABAD': 'Uttar Pradesh', 'MUZAFFARNAGAR': 'Uttar Pradesh', 'PILIBHIT': 'Uttar Pradesh',
    'PRAYAGRAJ': 'Uttar Pradesh', 'ALLAHABAD': 'Uttar Pradesh', 'RAEBARELI': 'Uttar Pradesh', 'RAMPUR': 'Uttar Pradesh', 'SAHARANPUR': 'Uttar Pradesh',
    'SAMBHAL': 'Uttar Pradesh', 'SANT KABIR NAGAR': 'Uttar Pradesh', 'SHAHJAHANPUR': 'Uttar Pradesh', 'SHAMLI': 'Uttar Pradesh', 'SHRAVASTI': 'Uttar Pradesh',
    'SIDDHARTHNAGAR': 'Uttar Pradesh', 'SITAPUR': 'Uttar Pradesh', 'SONBHADRA': 'Uttar Pradesh', 'SULTANPUR': 'Uttar Pradesh', 'UNNAO': 'Uttar Pradesh',

    // 8. CHHATTISGARH
    'RAIPUR': 'Chhattisgarh', 'BHILAI': 'Chhattisgarh', 'BILASPUR': 'Chhattisgarh', 'DURG': 'Chhattisgarh',
    'BALOD': 'Chhattisgarh', 'BALODA BAZAR': 'Chhattisgarh', 'BASTAR': 'Chhattisgarh', 'BEMETARA': 'Chhattisgarh', 'BIJAPUR': 'Chhattisgarh',
    'DANTEWADA': 'Chhattisgarh', 'DHAMTARI': 'Chhattisgarh', 'GARIYABAND': 'Chhattisgarh',
    'JANJGIR-CHAMPA': 'Chhattisgarh', 'JASHPUR': 'Chhattisgarh', 'KABIRDHAM': 'Chhattisgarh', 'KANKER': 'Chhattisgarh', 'KONDAGAON': 'Chhattisgarh',
    'KORBA': 'Chhattisgarh', 'KOREA': 'Chhattisgarh', 'MAHASAMUND': 'Chhattisgarh', 'MUNGELI': 'Chhattisgarh', 'NARAYANPUR': 'Chhattisgarh',
    'RAJNANDGAON': 'Chhattisgarh', 'SUKMA': 'Chhattisgarh', 'SURAJPUR': 'Chhattisgarh', 'SURGUJA': 'Chhattisgarh',

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
