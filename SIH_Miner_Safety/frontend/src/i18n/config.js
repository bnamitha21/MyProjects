import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_OPTIONS = [
  { code: 'en', preference: 'english', label: 'English', nativeLabel: 'English' },
  { code: 'te', preference: 'telugu', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ta', preference: 'tamil', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'ml', preference: 'malayalam', label: 'Malayalam', nativeLabel: 'മലയാളം' },
];

export const LANGUAGE_PREFERENCE_TO_CODE = LANGUAGE_OPTIONS.reduce((acc, option) => {
  acc[option.preference] = option.code;
  return acc;
}, {});

export const LANGUAGE_CODE_TO_PREFERENCE = LANGUAGE_OPTIONS.reduce((acc, option) => {
  acc[option.code] = option.preference;
  return acc;
}, {});

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        hazards: 'Hazards',
        training: 'Training',
        checklists: 'Checklists',
        gasDetection: 'Gas Detection',
        mineView: '3D Mine View',
        safetyChecklist: 'Safety Checklist',
        videoLibrary: 'Video Library',
        reportHazard: 'Report Hazard',
        incidentLibrary: 'Incident Library',
        caseStudies: 'Case Studies',
        supervisorPanel: 'Supervisor Panel',
        adminPanel: 'Admin Panel',
        userManagement: 'User Management',
        siteSettings: 'Site Settings',
        reports: 'Reports',
        auditLogs: 'Audit Logs',
        sosAlerts: 'SOS Alerts',
        profile: 'Profile',
      },
      actions: {
        profileSettings: 'Profile Settings',
        preferences: 'Preferences',
        logout: 'Logout',
        notifications: 'Alerts',
      },
      language: {
        label: 'Language',
        description: 'Choose how the interface speaks to you',
        english: 'English',
        telugu: 'Telugu',
        tamil: 'Tamil',
        malayalam: 'Malayalam',
      },
      profile: {
        heroTitle: 'Personalized Command Center',
        heroSubtitle: 'Role-aware insights, trusted routines, and preferences in one place.',
        overviewTitle: 'Identity Snapshot',
        overviewFields: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          joined: 'Joined',
          language: 'Preferred Language',
        },
        roleHighlightsTitle: 'What matters today',
        actionsTitle: 'Signature habits',
        languageCard: {
          title: 'Language & Accessibility',
          description: 'Switch interface language instantly. Your choice is remembered across sessions and devices.',
          helper: 'Selecting a language updates navigation labels, profile content and all shared components.',
        },
        insightCard: {
          title: 'Engagement Snapshot',
          items: [
            'Daily checklist completion streak',
            'Latest hazard briefing acknowledgement',
            'Training refresh cycle status',
          ],
        },
        roles: {
          worker: {
            title: 'Frontline Worker',
            tagline: 'Stay situationally aware with contextual cues per shift.',
            highlights: [
              'Instant gas-leak and ventilation alerts',
              'Smart PPE checklist reminders with voice prompts',
              'Shift readiness tracker with fatigue insights',
            ],
            actions: [
              'Complete mobile safety checklist before check-in',
              'Acknowledge new hazard briefings each shift',
              'Upload pit photos for anomalies',
            ],
          },
          supervisor: {
            title: 'Shift Supervisor',
            tagline: 'Orchestrate people, sensors and compliance in real time.',
            highlights: [
              'Live crew location & risk posture tiles',
              'Automated escalation playbooks',
              'Cross-shift analytics with bottleneck detection',
            ],
            actions: [
              'Review hazard backlog during shift handover',
              'Trigger corrective actions for overdue tasks',
              'Coach crews using training heatmaps',
            ],
          },
          admin: {
            title: 'Site Administrator',
            tagline: 'Govern policies, data fidelity and enterprise rollouts.',
            highlights: [
              'Centralized access policies per asset',
              'Data quality audits with anomaly flags',
              'Multi-mine benchmarking dashboards',
            ],
            actions: [
              'Approve new user or asset onboarding requests',
              'Audit checklist templates every week',
              'Export compliance packs for DGMS review',
            ],
          },
          dgms_officer: {
            title: 'DGMS Officer',
            tagline: 'Gain regulatory clarity with immersive evidence trails.',
            highlights: [
              'On-demand incident reconstruction with 3D replay',
              'Geo-tagged compliance proofs',
              'Automated deviation summaries per regulation',
            ],
            actions: [
              'Validate statutory submissions against live data',
              'Annotate incidents for field follow-up',
              'Schedule surprise audits with digital mandates',
            ],
          },
        },
      },
    },
  },
  te: {
    translation: {
      nav: {
        dashboard: 'డ్యాష్‌బోర్డ్',
        hazards: 'ప్రమాదాలు',
        training: 'శిక్షణ',
        checklists: 'తనిఖీ పట్టికలు',
        gasDetection: 'వాయు గుర్తింపు',
        mineView: '3డి గని వీక్షణ',
        safetyChecklist: 'భద్రతా తనిఖీలు',
        videoLibrary: 'వీడియో లైబ్రరీ',
        reportHazard: 'ప్రమాదాన్ని నివేదించండి',
        incidentLibrary: 'సంఘటనల లైబ్రరీ',
        caseStudies: 'కేస్ స్టడీస్',
        supervisorPanel: 'సూపర్వైజర్ ప్యానెల్',
        adminPanel: 'అడ్మిన్ ప్యానెల్',
        userManagement: 'వినియోగదారుల నిర్వహణ',
        siteSettings: 'సైట్ సెట్టింగులు',
        reports: 'నివేదికలు',
        auditLogs: 'ఆడిట్ లాగ్స్',
        profile: 'ప్రొఫైల్',
      },
      actions: {
        profileSettings: 'ప్రొఫైల్ సెట్టింగులు',
        preferences: 'అభిరుచులు',
        logout: 'లాగ్ అవుట్',
        notifications: 'అలర్ట్స్',
      },
      language: {
        label: 'భాష',
        description: 'సిస్టమ్ మీతో ఎలా మాట్లాడాలో ఎంచుకోండి',
        english: 'ఇంగ్లీష్',
        telugu: 'తెలుగు',
        tamil: 'తమిళం',
        malayalam: 'మలయాళం',
      },
      profile: {
        heroTitle: 'వ్యక్తిగత నియంత్రణ కేంద్రం',
        heroSubtitle: 'పాత్రకు అనుగుణమైన అవగాహనలు ఒకే చోట.',
        overviewTitle: 'గుర్తింపు స్నాప్‌షాట్',
        overviewFields: {
          name: 'పేరు',
          email: 'ఈమెయిల్',
          role: 'పాత్ర',
          joined: 'చేరిన తేదీ',
          language: 'ఇష్టమైన భాష',
        },
        roleHighlightsTitle: 'ఈరోజు ప్రాధాన్యతలు',
        actionsTitle: 'రోజువారీ అలవాట్లు',
        languageCard: {
          title: 'భాష & యాక్సెసిబిలిటీ',
          description: 'తక్షణం ఇంటర్‌ఫేస్ భాషను మార్చండి. మీ ఎంపికను మేము గుర్తుంచుకుంటాము.',
          helper: 'భాషను మార్చడం నావిగేషన్, ప్రొఫైల్ మరియు షేర్ చేసిన విభాగాలన్నింటినీ నవీకరిస్తుంది.',
        },
        insightCard: {
          title: 'శ్రద్ధ స్థితి',
          items: [
            'రోజువారీ తనిఖీ పట్టిక స్ట్రీక్',
            'తాజా ప్రమాద నివేదిక ధృవీకరణ',
            'శిక్షణ రిఫ్రెష్ స్థితి',
          ],
        },
        roles: {
          worker: {
            title: 'ఫ్రంట్‌లైన్ వర్కర్',
            tagline: 'ప్రతి షిఫ్ట్‌లో క్రమబద్ధమైన హెచ్చరికలు.',
            highlights: [
              'తక్షణ వాయు-లీక్ అలర్ట్లు',
              'స్మార్ట్ PPE గుర్తింపులు',
              'షిఫ్ట్ సిద్ధత ట్రాకర్',
            ],
            actions: [
              'షిఫ్ట్‌కు ముందు చెక్లిస్ట్ పూర్తి చేయండి',
              'ప్రతి హెచ్చరికను అంగీకరించండి',
              'సైట్ ఫోటోలను అప్‌లోడ్ చేయండి',
            ],
          },
          supervisor: {
            title: 'షిఫ్ట్ సూపర్వైజర్',
            tagline: 'సెన్సర్లు మరియు సిబ్బందిని సమన్వయం చేయండి.',
            highlights: [
              'లైవ్ క్రూ హెల్త్ టైల్స్',
              'ఆటో ఎస్కలేషన్ ప్లేబుక్',
              'క్రాస్ షిఫ్ట్ విశ్లేషణ',
            ],
            actions: [
              'హ్యాండోవర్ ముందు ప్రమాదాలను సమీక్షించండి',
              'వాయిదా పడిన పనులను వేగంగా ముగించండి',
              'శిక్షణ హీట్‌మ్యాప్‌తో మార్గనిర్దేశం చేయండి',
            ],
          },
          admin: {
            title: 'సైట్ అడ్మిన్',
            tagline: 'పాలిసీలు మరియు డేటాను నియంత్రించండి.',
            highlights: [
              'కేంద్రీకృత యాక్సెస్ అనుమతులు',
              'డేటా నాణ్యత ఆడిట్లు',
              'బెంచ్‌మార్క్ డ్యాష్‌బోర్డ్లు',
            ],
            actions: [
              'కొత్త అభ్యర్థనలను ఆమోదించండి',
              'టెంప్లేట్లను వారానికి ఒకసారి తనిఖీ చేయండి',
              'DGMS సమర్పణలను సిద్ధం చేయండి',
            ],
          },
          dgms_officer: {
            title: 'DGMS ఆఫీసర్',
            tagline: 'శాసన సాక్ష్యాలను వెంటనే చూడండి.',
            highlights: [
              '3డి సంఘటన పునర్నిర్మాణం',
              'జీయోట్యాగ్ చేసిన ఆధారాలు',
              'స్వయంచాలక వ్యత్యాస సమాహారం',
            ],
            actions: [
              'డేటాతో నివేదికలను ధృవీకరించండి',
              'సంఘటనలను గమనికలతో ట్యాగ్ చేయండి',
              'డిజిటల్ ఆడిట్లను షెడ్యూల్ చేయండి',
            ],
          },
        },
      },
    },
  },
  ta: {
    translation: {
      nav: {
        dashboard: 'டாஷ்போர்ட்',
        hazards: 'ஆபத்துகள்',
        training: 'பயிற்சி',
        checklists: 'சரிபார்ப்பு பட்டியல்',
        gasDetection: 'வாயு கண்காணிப்பு',
        mineView: '3டி சுரங்க காட்சி',
        safetyChecklist: 'பாதுகாப்பு சரிபார்ப்பு',
        videoLibrary: 'வீடியோ நூலகம்',
        reportHazard: 'ஆபத்தை அறிவிக்கவும்',
        incidentLibrary: 'சம்பவ நூலகம்',
        supervisorPanel: 'மேற்பார்வையாளர் பலகம்',
        adminPanel: 'நிர்வாக பலகம்',
        userManagement: 'பயனர் மேலாண்மை',
        siteSettings: 'தள அமைப்புகள்',
        reports: 'அறிக்கைகள்',
        auditLogs: 'தணிக்கை பதிவுகள்',
        profile: 'சுயவிவரம்',
      },
      actions: {
        profileSettings: 'சுயவிவர அமைப்புகள்',
        preferences: 'விருப்பங்கள்',
        logout: 'வெளியேறு',
        notifications: 'எச்சரிக்கைகள்',
      },
      language: {
        label: 'மொழி',
        description: 'இணைமுகம் உங்களிடம் பேசும் மொழியைத் தேர்ந்தெடுக்கவும்',
        english: 'ஆங்கிலம்',
        telugu: 'தெலுங்கு',
        tamil: 'தமிழ்',
        malayalam: 'மலையாளம்',
      },
      profile: {
        heroTitle: 'தனிப்பயன் கட்டுப்பாட்டு அறை',
        heroSubtitle: 'பாத்திர அடிப்படையிலான பார்வைகள் & பழக்கங்கள்.',
        overviewTitle: 'அடையாள சுருக்கம்',
        overviewFields: {
          name: 'பெயர்',
          email: 'மின்னஞ்சல்',
          role: 'பங்கு',
          joined: 'சேர்ந்த தேதி',
          language: 'விருப்ப மொழி',
        },
        roleHighlightsTitle: 'இன்றைய கவனம்',
        actionsTitle: 'முக்கிய பழக்கங்கள்',
        languageCard: {
          title: 'மொழி & அணுகல்',
          description: 'மொழியை உடனடியாக மாற்றலாம். அனைத்து சாளரங்களிலும் சேமிக்கப்படுகிறது.',
          helper: 'மொழி மாற்றம் நெவிகேஷன் மற்றும் சுயவிவர உரைகளை மாற்றும்.',
        },
        insightCard: {
          title: 'நிலவரம்',
          items: [
            'தினசரி சரிபார்ப்பு தொடர்',
            'சமீபத்திய எச்சரிக்கை ஒப்புதல்',
            'பயிற்சி புதுப்பிப்பு',
          ],
        },
        roles: {
          worker: {
            title: 'முன்னணி பணியாளர்',
            tagline: 'ஒவ்வொரு கடவைக்கும் சூழ்நிலை விழிப்புணர்வு.',
            highlights: [
              'உடனடி வாயு அலாரங்கள்',
              'செயல்முறை PPE நினைவூட்டல்கள்',
              'களைப்பு மதிப்பீடு',
            ],
            actions: [
              'கடவைக்கு முன் சரிபார்ப்பு முடிக்கவும்',
              'புதிய ஆபத்துகளை உறுதிப்படுத்தவும்',
              'புகைப்பட ஆதாரம் பகிரவும்',
            ],
          },
          supervisor: {
            title: 'மேற்பார்வையாளர்',
            tagline: 'மக்கள், சென்சார், இணக்கத்தை ஒத்திசைக்கவும்.',
            highlights: [
              'நேரடி குழு ஆரோக்கியம்',
              'தானியங்கி நடவடிக்கை திட்டங்கள்',
              'குறுக்குக் கடவை பகுப்பாய்வு',
            ],
            actions: [
              'கடவை மாற்றத்தில் பின்னடைவு பதிவுகளை சரிபார்க்கவும்',
              'காலாவதியான பணிகளை சரிசெய்யவும்',
              'பயிற்சி வரைபடத்தை பயன்படுத்தி பயிற்சி அளிக்கவும்',
            ],
          },
          admin: {
            title: 'தள நிர்வாகி',
            tagline: 'நெறிமுறைகள் மற்றும் தரத் தரங்களை கட்டுப்படுத்தவும்.',
            highlights: [
              'மைய அனுமதி கொள்கைகள்',
              'தர தணிக்கை அளிக்கைகள்',
              'பல சுரங்க ஒப்பீடுகள்',
            ],
            actions: [
              'புதிய பயனர்/ஆஸ்செட் கோரிக்கைகளை அங்கீகரிக்கவும்',
              'வாராந்திர வார்ப்புரு சரிபார்ப்பு',
              'DGMS சமர்ப்பிப்புகள் தயாரிக்கவும்',
            ],
          },
          dgms_officer: {
            title: 'DGMS அதிகாரி',
            tagline: 'ஒழுங்குமுறை சான்றுகளுக்கான தெளிவு.',
            highlights: [
              '3டி சம்பவ மறுவடிவு',
              'இருப்பிட ஆதாரங்கள்',
              'ஒழுங்கு விலகல் சுருக்கங்கள்',
            ],
            actions: [
              'நிகழ் தரங்களுடன் அறிக்கைகளை சரிபார்க்கவும்',
              'சம்பவங்களுக்கு குறிப்புகள் சேர்க்கவும்',
              'சர்ப்ரைஸ் தணிக்கைகளை திட்டமிடவும்',
            ],
          },
        },
      },
    },
  },
  ml: {
    translation: {
      nav: {
        dashboard: 'ഡാഷ്ബോർഡ്',
        hazards: 'അപകടങ്ങൾ',
        training: 'പരിശീലനം',
        checklists: 'ചെക്ക്ലിസ്റ്റുകൾ',
        gasDetection: 'വാതക നിരീക്ഷണം',
        mineView: '3ഡി ഖനി കാഴ്ച',
        safetyChecklist: 'സുരക്ഷാ പട്ടിക',
        videoLibrary: 'വീഡിയോ ലൈബ്രറി',
        reportHazard: 'അപകടം റിപ്പോർട്ട് ചെയ്യുക',
        incidentLibrary: 'സംഭവ ലൈബ്രറി',
        supervisorPanel: 'സൂപർവൈസർ പാനൽ',
        adminPanel: 'അഡ്മിൻ പാനൽ',
        userManagement: 'യൂസർ മാനേജ്മെന്റ്',
        siteSettings: 'സൈറ്റിന്റെ ക്രമീകരണങ്ങൾ',
        reports: 'റിപ്പോർട്ടുകൾ',
        auditLogs: 'ഓഡിറ്റ് രേഖകൾ',
        profile: 'പ്രൊഫൈൽ',
      },
      actions: {
        profileSettings: 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ',
        preferences: 'രുചികൾ',
        logout: 'ലോഗ്ഔട്ട്',
        notifications: 'അലർട്ടുകൾ',
      },
      language: {
        label: 'ഭാഷ',
        description: 'ഇന്റർഫേസ് ഏത് ഭാഷയിൽ വേണമെന്ന് തെരഞ്ഞെടുക്കുക',
        english: 'ഇംഗ്ലീഷ്',
        telugu: 'తెలుగు',
        tamil: 'தமிழ்',
        malayalam: 'മലയാളം',
      },
      profile: {
        heroTitle: 'വ്യക്തിഗത നിയന്ത്രണ മുറി',
        heroSubtitle: 'പങ്ക് കേന്ദ്രീകൃതമായ അവലോകനങ്ങളും ശീലങ്ങളും.',
        overviewTitle: 'ഒറ്റനോട്ടം',
        overviewFields: {
          name: 'പേര്',
          email: 'ഇമെയിൽ',
          role: 'പങ്ക്',
          joined: 'ചേർന്ന തിയതി',
          language: 'ഇഷ്ട ഭാഷ',
        },
        roleHighlightsTitle: 'ഇന്നത്തെ മുൻഗണനകൾ',
        actionsTitle: 'അടയാള ശീലങ്ങൾ',
        languageCard: {
          title: 'ഭാഷ & ആക്സസിബിലിറ്റി',
          description: 'മുഴുവൻ UI-യും ഈ തിരഞ്ഞെടുപ്പ് അടിസ്ഥാനമാക്കിയാണ്.',
          helper: 'നാവിഗേഷൻ, പ്രൊഫൈൽ, കാർഡുകൾ എല്ലാം പുതുക്കും.',
        },
        insightCard: {
          title: 'പങ്കാളിത്തം',
          items: [
            'ദൈനംദിന ചെക്ക്ലിസ്റ്റ് റെക്കോർഡ്',
            'അവസാന അപകട അംഗീകാരം',
            'പരിശീലന പുതുക്കൽ സ്ഥിതി',
          ],
        },
        roles: {
          worker: {
            title: 'ഫ്രണ്ട്‌ലൈൻ തൊഴിലാളി',
            tagline: 'ഓരോ ഷിഫ്റ്റിലും നിർദ്ദിഷ്ട മുന്നറിയിപ്പുകൾ.',
            highlights: [
              'തൽക്ഷണ വാതക അലാറങ്ങൾ',
              'സ്മാർട്ട് PPE ഓർമ്മിപ്പിക്കൽ',
              'ഷിഫ്റ്റ് റെഡിനസ് ട്രാക്കിംഗ്',
            ],
            actions: [
              'ഷിഫ്റ്റിന് മുമ്പ് ചെക്ക്ലിസ്റ്റ് പൂർത്തിയാക്കുക',
              'ഹസാർഡ് ബ്രീഫിംഗ് അംഗീകരിക്കുക',
              'ഖനിയിൽ നിന്നുള്ള ചിത്രങ്ങൾ അപ്ലോഡ് ചെയ്യുക',
            ],
          },
          supervisor: {
            title: 'സൂപർവൈസർ',
            tagline: 'ജീവനക്കാരെയും സെൻസറുകളെയും കൂട്ടിച്ചേർക്കുക.',
            highlights: [
              'ലൈവ് ടീമിന്റെ ആരോഗ്യ ഇൻഡിക്കേറ്റർ',
              'സ്വയമേവ ഉയർത്താനുള്ള പദ്ധതികൾ',
              'ഷിഫ്റ്റുകൾക്കിടയിലെ വിശകലനം',
            ],
            actions: [
              'ഹാൻഡ്ഓവറിന് മുമ്പ് കേസുകൾ പരിശോധിക്കുക',
              'കാലാവധി കഴിഞ്ഞ ജോലികൾ അടയ്ക്കുക',
              'പരിശീലന ഹീറ്റ്‌മാപ്പ് ഉപയോഗിച്ച് പരിശീലിപ്പിക്കുക',
            ],
          },
          admin: {
            title: 'സൈറ്റ് അഡ്മിൻ',
            tagline: 'നയങ്ങളും ഡാറ്റയും നിയന്ത്രിക്കുക.',
            highlights: [
              'കേന്ദ്രഭാവത്തിലുള്ള അനുമതികൾ',
              'ഡാറ്റ ഗുണമേന്മാ പരിശോധന',
              'മൾട്ടി-മൈൻ താരതമ്യം',
            ],
            actions: [
              'പുതിയ അഭ്യർത്ഥനകൾ അംഗീകരിക്കുക',
              'വാരാന്ത്യ ടെംപ്ലേറ്റ് ഓഡിറ്റ്',
              'DGMS റിപ്പോർട്ടുകൾ തയ്യാറാക്കുക',
            ],
          },
          dgms_officer: {
            title: 'DGMS ഓഫീസർ',
            tagline: 'നിയന്ത്രണ തെളിവുകൾക്ക് വ്യക്തത.',
            highlights: [
              '3ഡി സംഭവം പുനർനിർമ്മാണം',
              'ജിയോടാഗ് ചെയ്ത തെളിവുകൾ',
              'ഓട്ടോ ഡിവിയേഷൻ സംഗ്രഹങ്ങൾ',
            ],
            actions: [
              'ജീവന്ത ഡാറ്റയിൽ നിന്ന് ഫയലുകൾ പരിശോദിക്കുക',
              'സംഭവങ്ങളിൽ കുറിപ്പുകൾ ചേർക്കുക',
              'ആകസ്മിക ഓഡിറ്റുകൾ പ്ലാൻ ചെയ്യുക',
            ],
          },
        },
      },
    },
  },
};

const storedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem('preferredLanguage')
  : null;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage || 'en',
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

export default i18n;

