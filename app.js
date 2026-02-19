const API_BASE = "https://jpccvcwnxbbkuwdhjdfz.functions.supabase.co";
const FN_RECO = `${API_BASE}/recommendations`;
const FN_ENT = `${API_BASE}/entertainment`;
const FN_ATTR = `${API_BASE}/attractions`;
const SESSION_STORAGE_KEY = "ridethis_session_v1";

const state = {
  profile: null,
  lang: "en",
  currentLocation: null,
  blacklistIds: new Set(),
  currentVisibleIds: new Set(),
  selectedTags: new Set(),
  mustRideTags: new Set(),
  avoidTags: new Set(),
  lastRefreshedAt: null,
  stepAnimating: false,
  activeTab: "reco",
  entertainment: null,
  entertainmentError: "",
  allAttractions: [],
  allFilterTags: new Set(),
};

const el = {
  titleMain: document.getElementById("titleMain"),
  titleSub: document.getElementById("titleSub"),
  langKoBtn: document.getElementById("langKoBtn"),
  langEnBtn: document.getElementById("langEnBtn"),
  onboarding: document.getElementById("onboarding"),
  results: document.getElementById("results"),
  form: document.getElementById("profileForm"),
  surveyTitle: document.getElementById("surveyTitle"),
  step1Title: document.getElementById("step1Title"),
  step2Title: document.getElementById("step2Title"),
  labelAge: document.getElementById("labelAge"),
  labelHeight: document.getElementById("labelHeight"),
  legendSelected: document.getElementById("legendSelected"),
  legendMust: document.getElementById("legendMust"),
  legendAvoid: document.getElementById("legendAvoid"),
  startRecoBtn: document.getElementById("startRecoBtn"),
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  stepNow: document.getElementById("stepNow"),
  toStep2Btn: document.getElementById("toStep2Btn"),
  backToStep1Btn: document.getElementById("backToStep1Btn"),
  cards: document.getElementById("cards"),
  specialWrap: document.getElementById("specialWrap"),
  resultsTitle: document.getElementById("resultsTitle"),
  refreshBtn: document.getElementById("refreshBtn"),
  resetBtn: document.getElementById("resetBtn"),
  refreshMeta: document.getElementById("refreshMeta"),
  blacklistTitle: document.getElementById("blacklistTitle"),
  blacklist: document.getElementById("blacklist"),
  tabRecoBtn: document.getElementById("tabRecoBtn"),
  tabAllAttrBtn: document.getElementById("tabAllAttrBtn"),
  tabStageBtn: document.getElementById("tabStageBtn"),
  tabParadeBtn: document.getElementById("tabParadeBtn"),
  tabNightBtn: document.getElementById("tabNightBtn"),
  tabRecoPanel: document.getElementById("tabRecoPanel"),
  tabAllAttrPanel: document.getElementById("tabAllAttrPanel"),
  tabStagePanel: document.getElementById("tabStagePanel"),
  tabParadePanel: document.getElementById("tabParadePanel"),
  tabNightPanel: document.getElementById("tabNightPanel"),
  allFilterNameLabel: document.getElementById("allFilterNameLabel"),
  allFilterDistanceLabel: document.getElementById("allFilterDistanceLabel"),
  allFilterWaitLabel: document.getElementById("allFilterWaitLabel"),
  allFilterOperationLabel: document.getElementById("allFilterOperationLabel"),
  allFilterTagLabel: document.getElementById("allFilterTagLabel"),
  allSortLabel: document.getElementById("allSortLabel"),
  allSearchName: document.getElementById("allSearchName"),
  allFilterDistance: document.getElementById("allFilterDistance"),
  allFilterWait: document.getElementById("allFilterWait"),
  allFilterOperation: document.getElementById("allFilterOperation"),
  allTagDetails: document.getElementById("allTagDetails"),
  allTagSummary: document.getElementById("allTagSummary"),
  allTagSearch: document.getElementById("allTagSearch"),
  allFilterTags: document.getElementById("allFilterTags"),
  allSort: document.getElementById("allSort"),
  allAttrCards: document.getElementById("allAttrCards"),
  stageCards: document.getElementById("stageCards"),
  paradeCard: document.getElementById("paradeCard"),
  nightCard: document.getElementById("nightCard"),
  closedTitle: document.getElementById("closedTitle"),
  closedCards: document.getElementById("closedCards"),
  nextBtn: document.getElementById("nextBtn"),
  loading: document.getElementById("loading"),
  loadingText: document.getElementById("loadingText"),
  errorText: document.getElementById("errorText"),
  cardTpl: document.getElementById("cardTpl"),
  detailDialog: document.getElementById("detailDialog"),
  detailBody: document.getElementById("detailBody"),
  detailCloseBtn: document.getElementById("detailCloseBtn"),
  selectedTags: document.getElementById("selectedTags"),
  mustRideTags: document.getElementById("mustRideTags"),
  avoidTags: document.getElementById("avoidTags"),
};

const TAG_OPTIONS = [
  { code: "thrill_high", ko: "스릴 강함", en: "High Thrill" },
  { code: "drop_high", ko: "큰 낙하", en: "Big Drops" },
  { code: "drop_small", ko: "작은 낙하", en: "Small Drops" },
  { code: "spin", ko: "회전", en: "Spinning" },
  { code: "water_ride", ko: "워터 라이드", en: "Water Ride" },
  { code: "dark", ko: "어두움", en: "Dark" },
  { code: "loud", ko: "소리 큼", en: "Loud" },
  { code: "scary", ko: "무서움", en: "Scary" },
  { code: "slow_ride", ko: "완만한 탑승", en: "Slow Ride" },
  { code: "indoor", ko: "실내", en: "Indoor" },
  { code: "outdoor", ko: "실외", en: "Outdoor" },
  { code: "interactive", ko: "상호작용", en: "Interactive" },
  { code: "discovery", ko: "탐험형", en: "Discovery" },
  { code: "show", ko: "공연", en: "Show" },
  { code: "character_meet", ko: "캐릭터 만남", en: "Character Meet" },
  { code: "transport", ko: "이동형", en: "Transport" },
  { code: "rider_switch", ko: "라이더 스위치", en: "Rider Switch" },
  { code: "single_rider", ko: "싱글라이더", en: "Single Rider" },
  { code: "star_wars", ko: "스타워즈", en: "Star Wars" },
  { code: "wheelchair_transfer_required", ko: "휠체어 환승 필요", en: "Wheelchair Transfer" },
  { code: "wheelchair_accessible", ko: "휠체어 이용 가능", en: "Wheelchair Accessible" },
];

const I18N = {
  ko: {
    pageTitle: "이거탈래?",
    titleMainHtml: "이거탈래?",
    titleSub: "홍콩 디즈니랜드 방문객을 위한 어트랙션 추천 서비스입니다.",
    surveyTitle: "추천 설문",
    step1Title: "당신(혹은 아이)의 나이와 키는?",
    step2Title: "태그를 선택해주세요",
    labelAge: "나이",
    labelHeight: "키(cm)",
    btnNext: "다음",
    btnBack: "이전",
    btnStart: "추천 시작",
    selectedLegend: "선호 태그",
    mustLegend: "꼭 타고 싶은 태그",
    avoidLegend: "회피 태그",
    resultsTitle: "추천 · 공연 · 퍼레이드 · 야간 엔터테인먼트",
    blacklistTitle: "다시 추천 안함",
    nextReco: "다음추천",
    refresh: "새로고침",
    reset: "초기화",
    refreshMeta: "최근 갱신 {time}",
    justNow: "방금 전",
    loading: "생각중입니다...",
    waitNone: "대기정보 없음",
    distNone: "거리정보 없음",
    distPrefix: "거리",
    statusLabel: "운영상태",
    waitLabel: "대기시간",
    tagsLabel: "태그",
    tagsNone: "태그 없음",
    reasonPrefix: "이유",
    ban: "다시 추천 안함",
    unban: "블랙리스트 해제",
    special: "특별추천",
    noDescription: "설명 정보가 없습니다.",
    tabReco: "추천 어트랙션",
    tabAllAttr: "전체 어트랙션",
    tabStage: "무대공연",
    tabParade: "퍼레이드",
    tabNight: "야간 엔터",
    stageEmpty: "표시할 무대공연 정보가 없습니다.",
    paradeEmpty: "표시할 퍼레이드 정보가 없습니다.",
    nightEmpty: "표시할 야간 엔터테인먼트 정보가 없습니다.",
    startsIn: "{min}분 후 시작",
    liveNow: "지금 진행 중",
    nextTime: "다음 시간",
    fullSchedule: "전체 스케줄",
    detailPrefix: "상세",
    categoryStage: "무대공연",
    categoryParade: "퍼레이드",
    categoryNight: "야간 엔터테인먼트",
    allFilterNameLabel: "이름 검색",
    allFilterNamePlaceholder: "이름으로 검색",
    allFilterDistanceLabel: "최대 거리",
    allFilterWaitLabel: "최대 대기",
    allFilterOperationLabel: "운영상태",
    allStatusAll: "전체",
    allStatusOperating: "운영중",
    allStatusNotOperating: "미운영",
    allStatusUnknown: "확인불가",
    allFilterTagLabel: "태그",
    allTagSummary: "태그 ({count})",
    allTagSearchPlaceholder: "태그 검색",
    allSortLabel: "정렬",
    allEmpty: "표시할 어트랙션이 없습니다.",
    allOptionAll: "전체",
    allSortDistance: "거리순",
    allSortWait: "대기순",
    allSortName: "이름순",
    allSortPopularity: "휴리스틱 점수순",
    closedTitle: "운휴 시설",
    closedEmpty: "운휴 시설 정보가 없습니다.",
    closedLabel: "운휴",
    openInGoogleMaps: "구글맵에서 도보 경로 열기",
    close: "닫기",
    errAge: "나이를 올바르게 입력해주세요.",
    errHeight: "키를 올바르게 입력해주세요.",
    errReco: "추천 요청 실패",
  },
  en: {
    pageTitle: "RideThis?",
    titleMainHtml: "RideThis?",
    titleSub: "An attraction recommendation service for Hong Kong Disneyland visitors.",
    surveyTitle: "Recommendation Survey",
    step1Title: "What are your (or your child's) age and height?",
    step2Title: "Choose your tags",
    labelAge: "Age",
    labelHeight: "Height (cm)",
    btnNext: "Next",
    btnBack: "Back",
    btnStart: "Start Recommendation",
    selectedLegend: "Preferred Tags",
    mustLegend: "Must-Ride Tags",
    avoidLegend: "Avoid Tags",
    resultsTitle: "Attractions, Stage Shows, Parade, Night Entertainment",
    blacklistTitle: "Do Not Recommend Again",
    nextReco: "Next Picks",
    refresh: "Refresh",
    reset: "Reset",
    refreshMeta: "Last refreshed {time}",
    justNow: "just now",
    loading: "Thinking...",
    waitNone: "No wait info",
    distNone: "No distance info",
    distPrefix: "Distance",
    statusLabel: "Status",
    waitLabel: "Wait",
    tagsLabel: "Tags",
    tagsNone: "No tags",
    reasonPrefix: "Reason",
    ban: "Do Not Recommend",
    unban: "Remove Blacklist",
    special: "Special Pick",
    noDescription: "No description available.",
    tabReco: "Recommended",
    tabAllAttr: "All Attractions",
    tabStage: "Stage Shows",
    tabParade: "Parade",
    tabNight: "Night",
    stageEmpty: "No stage show data available.",
    paradeEmpty: "No parade data available.",
    nightEmpty: "No night entertainment data available.",
    startsIn: "Starts in {min} min",
    liveNow: "Live now",
    nextTime: "Next time",
    fullSchedule: "Full schedule",
    detailPrefix: "Details",
    categoryStage: "Stage Show",
    categoryParade: "Parade",
    categoryNight: "Night Entertainment",
    allFilterNameLabel: "Name",
    allFilterNamePlaceholder: "Search by name",
    allFilterDistanceLabel: "Max Distance",
    allFilterWaitLabel: "Max Wait",
    allFilterOperationLabel: "Operation",
    allStatusAll: "All",
    allStatusOperating: "Operating",
    allStatusNotOperating: "Not Operating",
    allStatusUnknown: "Unknown",
    allFilterTagLabel: "Tag",
    allTagSummary: "Tags ({count})",
    allTagSearchPlaceholder: "Search tags",
    allSortLabel: "Sort",
    allEmpty: "No attractions found.",
    allOptionAll: "All",
    allSortDistance: "Distance",
    allSortWait: "Wait",
    allSortName: "Name",
    allSortPopularity: "Heuristic score",
    closedTitle: "Closed Facilities",
    closedEmpty: "No closed facilities data.",
    closedLabel: "Closed",
    openInGoogleMaps: "Open Walking Route in Google Maps",
    close: "Close",
    errAge: "Please enter a valid age.",
    errHeight: "Please enter a valid height.",
    errReco: "Failed to fetch recommendations.",
  },
};

function t(key) {
  return I18N[state.lang][key] || key;
}

function tr(key, vars = {}) {
  let out = t(key);
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

function parseLang(v) {
  return v && v.toLowerCase() === "ko" ? "ko" : "en";
}

function detectInitialLang() {
  const u = new URL(window.location.href);
  const qLang = u.searchParams.get("lang");
  if (qLang) return parseLang(qLang);
  const navLang = (navigator.language || "").toLowerCase();
  return navLang.startsWith("ko") ? "ko" : "en";
}

function tagLabel(code) {
  const x = TAG_OPTIONS.find((t) => t.code === code);
  if (!x) return code;
  return state.lang === "en" ? x.en : x.ko;
}

function syncLangToUrl() {
  const u = new URL(window.location.href);
  u.searchParams.set("lang", state.lang);
  window.history.replaceState({}, "", u.toString());
}

function saveSessionState() {
  try {
    const payload = {
      lang: state.lang,
      profile: state.profile,
      currentLocation: state.currentLocation,
      blacklistIds: [...state.blacklistIds],
      selectedTags: [...state.selectedTags],
      mustRideTags: [...state.mustRideTags],
      avoidTags: [...state.avoidTags],
      activeTab: state.activeTab,
      allFilterTags: [...state.allFilterTags],
      filters: {
        distance: el.allFilterDistance?.value || "",
        wait: el.allFilterWait?.value || "",
        operation: el.allFilterOperation?.value || "",
        sort: el.allSort?.value || "distance",
        name: el.allSearchName?.value || "",
        tagSearch: el.allTagSearch?.value || "",
        tagOpen: !!el.allTagDetails?.open,
      },
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // no-op
  }
}

function loadSessionState() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function clearSessionState() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // no-op
  }
}

function applyLoadedSession(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;

  if (snapshot.profile && typeof snapshot.profile === "object") {
    state.profile = snapshot.profile;
    if (el.form) {
      const ageInput = el.form.querySelector('input[name="age"]');
      const heightInput = el.form.querySelector('input[name="height_cm"]');
      if (ageInput && Number.isFinite(snapshot.profile.age)) ageInput.value = String(snapshot.profile.age);
      if (heightInput && Number.isFinite(snapshot.profile.height_cm)) heightInput.value = String(snapshot.profile.height_cm);
    }
  }
  if (snapshot.currentLocation && typeof snapshot.currentLocation === "object") {
    const { lat, lng } = snapshot.currentLocation;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      state.currentLocation = { lat, lng };
    }
  }
  state.blacklistIds = new Set(Array.isArray(snapshot.blacklistIds) ? snapshot.blacklistIds : []);
  state.selectedTags = new Set(Array.isArray(snapshot.selectedTags) ? snapshot.selectedTags : []);
  state.mustRideTags = new Set(Array.isArray(snapshot.mustRideTags) ? snapshot.mustRideTags : []);
  state.avoidTags = new Set(Array.isArray(snapshot.avoidTags) ? snapshot.avoidTags : []);
  state.allFilterTags = new Set(Array.isArray(snapshot.allFilterTags) ? snapshot.allFilterTags : []);
  state.activeTab = typeof snapshot.activeTab === "string" ? snapshot.activeTab : "reco";

  const f = snapshot.filters && typeof snapshot.filters === "object" ? snapshot.filters : {};
  if (el.allFilterDistance && typeof f.distance === "string") el.allFilterDistance.value = f.distance;
  if (el.allFilterWait && typeof f.wait === "string") el.allFilterWait.value = f.wait;
  if (el.allFilterOperation && typeof f.operation === "string") el.allFilterOperation.value = f.operation;
  if (el.allSort && typeof f.sort === "string") el.allSort.value = f.sort;
  if (el.allSearchName && typeof f.name === "string") el.allSearchName.value = f.name;
  if (el.allTagSearch && typeof f.tagSearch === "string") el.allTagSearch.value = f.tagSearch;
  if (el.allTagDetails) el.allTagDetails.open = !!f.tagOpen;

  return !!state.profile;
}

async function changeLanguage(nextLang) {
  if (state.lang === nextLang) return;
  state.lang = nextLang;
  syncLangToUrl();
  applyLanguage();
  renderTagCheckboxes();
  saveSessionState();

  if (!el.results.classList.contains("hidden") && state.profile) {
    try {
      await refreshAll("normal");
    } catch {
      // error already rendered
    }
  }
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.title = t("pageTitle");
  el.titleMain.innerHTML = t("titleMainHtml");
  el.langKoBtn.classList.toggle("active", state.lang === "ko");
  el.langEnBtn.classList.toggle("active", state.lang === "en");
  el.titleSub.textContent = t("titleSub");
  el.surveyTitle.textContent = t("surveyTitle");
  el.step1Title.textContent = t("step1Title");
  el.step2Title.textContent = t("step2Title");
  el.labelAge.textContent = t("labelAge");
  el.labelHeight.textContent = t("labelHeight");
  el.toStep2Btn.textContent = t("btnNext");
  el.backToStep1Btn.textContent = t("btnBack");
  el.startRecoBtn.textContent = t("btnStart");
  el.legendSelected.textContent = t("selectedLegend");
  el.legendMust.textContent = t("mustLegend");
  el.legendAvoid.textContent = t("avoidLegend");
  el.resultsTitle.textContent = t("resultsTitle");
  el.refreshBtn.textContent = t("refresh");
  el.resetBtn.textContent = t("reset");
  el.closedTitle.textContent = t("closedTitle");
  el.blacklistTitle.textContent = t("blacklistTitle");
  el.tabRecoBtn.textContent = t("tabReco");
  el.tabAllAttrBtn.textContent = t("tabAllAttr");
  el.tabStageBtn.textContent = t("tabStage");
  el.tabParadeBtn.textContent = t("tabParade");
  el.tabNightBtn.textContent = t("tabNight");
  el.allFilterNameLabel.textContent = t("allFilterNameLabel");
  el.allFilterDistanceLabel.textContent = t("allFilterDistanceLabel");
  el.allFilterWaitLabel.textContent = t("allFilterWaitLabel");
  el.allFilterOperationLabel.textContent = t("allFilterOperationLabel");
  el.allFilterTagLabel.textContent = t("allFilterTagLabel");
  el.allSortLabel.textContent = t("allSortLabel");
  if (el.allSearchName) el.allSearchName.placeholder = t("allFilterNamePlaceholder");
  if (el.allTagSearch) el.allTagSearch.placeholder = t("allTagSearchPlaceholder");
  if (el.allSort) {
    const opts = el.allSort.options;
    if (opts[0]) opts[0].text = t("allSortDistance");
    if (opts[1]) opts[1].text = t("allSortWait");
    if (opts[2]) opts[2].text = t("allSortName");
    if (opts[3]) opts[3].text = t("allSortPopularity");
  }
  const allOption = (sel) => sel?.options?.[0] && (sel.options[0].text = t("allOptionAll"));
  allOption(el.allFilterDistance);
  allOption(el.allFilterWait);
  if (el.allFilterOperation) {
    const opts = el.allFilterOperation.options;
    if (opts[0]) opts[0].text = t("allStatusAll");
    if (opts[1]) opts[1].text = t("allStatusOperating");
    if (opts[2]) opts[2].text = t("allStatusNotOperating");
  }
  el.nextBtn.textContent = t("nextReco");
  el.loadingText.textContent = t("loading");
  el.detailCloseBtn.setAttribute("aria-label", t("close"));
  el.detailCloseBtn.setAttribute("title", t("close"));
  updateRefreshMeta();
  populateAllTagFilter();
  renderAllAttractions();
}

function showLoading(v) {
  el.loading.classList.toggle("hidden", !v);
  el.nextBtn.disabled = !!v;
}

function showError(message = "") {
  if (!message) {
    el.errorText.classList.add("hidden");
    el.errorText.textContent = "";
    return;
  }
  el.errorText.textContent = message;
  el.errorText.classList.remove("hidden");
}

function formToProfile(form) {
  const fd = new FormData(form);
  const n = (k) => Number(fd.get(k));
  const selectedTags = new Set(state.selectedTags);
  const mustRideTags = new Set(state.mustRideTags);
  const avoidTags = new Set(state.avoidTags);

  // If same tag appears in both must/avoid, keep must and remove avoid.
  for (const t of mustRideTags) {
    if (avoidTags.has(t)) avoidTags.delete(t);
  }

  return {
    age: n("age"),
    height_cm: n("height_cm"),
    selected_tags: [...selectedTags],
    must_ride_tags: [...mustRideTags],
    avoid_tags: [...avoidTags],
  };
}

async function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 22.3128, lng: 114.0413 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: 22.3128, lng: 114.0413 }),
      { enableHighAccuracy: true, timeout: 4000 },
    );
  });
}

function toWaitText(v) {
  return v == null ? t("waitNone") : state.lang === "en" ? `${v} min` : `${v}분`;
}

function toDistanceText(v) {
  if (v == null) return t("distNone");
  return v < 1000 ? `${Math.round(v)}m` : `${(v / 1000).toFixed(2)}km`;
}

function operationKind(status) {
  const s = String(status || "").toUpperCase();
  if (s === "OPERATING" || s === "OPEN") return "operating";
  if (s === "CLOSED" || s === "DOWN" || s === "REFURBISHMENT") return "not_operating";
  return "unknown";
}

function statusText(status) {
  const kind = operationKind(status);
  if (kind === "operating") return t("allStatusOperating");
  if (kind === "not_operating") return t("allStatusNotOperating");
  return t("allStatusUnknown");
}

function fmtClock(d) {
  if (!d) return t("justNow");
  return d.toLocaleTimeString(state.lang === "ko" ? "ko-KR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function updateRefreshMeta() {
  if (!el.refreshMeta) return;
  el.refreshMeta.textContent = tr("refreshMeta", {
    time: fmtClock(state.lastRefreshedAt),
  });
}

function setActiveTab(tab) {
  state.activeTab = tab;
  const map = [
    ["reco", el.tabRecoBtn, el.tabRecoPanel],
    ["all", el.tabAllAttrBtn, el.tabAllAttrPanel],
    ["stage", el.tabStageBtn, el.tabStagePanel],
    ["parade", el.tabParadeBtn, el.tabParadePanel],
    ["night", el.tabNightBtn, el.tabNightPanel],
  ];
  for (const [key, btn, panel] of map) {
    const active = key === tab;
    btn.classList.toggle("active", active);
    panel.classList.toggle("hidden", !active);
  }
  const showNext = tab === "reco" && !el.results.classList.contains("hidden");
  el.nextBtn.classList.toggle("hidden", !showNext);
  saveSessionState();
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatMinsLeft(v, liveNow = false) {
  if (liveNow) return t("liveNow");
  if (v == null) return "-";
  return tr("startsIn", { min: v });
}

function fmtTimeIso(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleTimeString(state.lang === "ko" ? "ko-KR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function categoryLabel(category) {
  if (category === "parade") return t("categoryParade");
  if (category === "night_entertainment") return t("categoryNight");
  return t("categoryStage");
}

function formatScheduleTime(t) {
  if (!t || typeof t !== "string") return "-";
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function formatScheduleLine(s) {
  const start = formatScheduleTime(s?.start_time);
  const end = s?.end_time ? formatScheduleTime(s.end_time) : null;
  const windowText = end ? `${start} - ${end}` : start;
  const type = s?.type ? ` (${s.type})` : "";
  return `${windowText}${type}`;
}

function googleMapsWalkingUrl(item) {
  const oLat = state.currentLocation?.lat;
  const oLng = state.currentLocation?.lng;
  const dLat = item?.lat;
  const dLng = item?.lng;
  if (![oLat, oLng, dLat, dLng].every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const params = new URLSearchParams({
    api: "1",
    origin: `${oLat},${oLng}`,
    destination: `${dLat},${dLng}`,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

async function animateWizardStep(fromEl, toEl, stepNo) {
  if (state.stepAnimating) return;
  state.stepAnimating = true;
  const D = 280;
  const shell = el.onboarding;

  shell.classList.add("wizard-shell-leave");
  void shell.offsetWidth;
  shell.classList.add("wizard-shell-leave-active");
  await new Promise((resolve) => setTimeout(resolve, D / 2));

  fromEl.classList.add("hidden");
  toEl.classList.remove("hidden");
  el.stepNow.textContent = String(stepNo);

  shell.classList.remove("wizard-shell-leave", "wizard-shell-leave-active");
  shell.classList.add("wizard-shell-enter");
  void shell.offsetWidth;
  shell.classList.add("wizard-shell-enter-active");
  await new Promise((resolve) => setTimeout(resolve, D / 2));

  shell.classList.remove("wizard-shell-enter", "wizard-shell-enter-active");
  state.stepAnimating = false;
}

function openDetailDialog(item) {
  if (!el.detailDialog || !el.detailBody) return;
  const safeDescription = item.description || t("noDescription");
  const tags = (item.type_tags || []).slice(0, 8).map((x) => tagLabel(x)).join(" · ") || t("tagsNone");
  const imageHtml = item.image_url
    ? `<img class="detail-image" src="${item.image_url}" alt="${item.name}" loading="lazy" />`
    : "";
  const mapsUrl = googleMapsWalkingUrl(item);
  const mapsHtml = mapsUrl
    ? `<a class="maps-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${t("openInGoogleMaps")}</a>`
    : "";
  el.detailBody.innerHTML = `
    ${imageHtml}
    <h3>${item.name}</h3>
    <p>${safeDescription}</p>
    <p><strong>${t("statusLabel")}:</strong> ${item.status || "-"}</p>
    <p><strong>${t("distPrefix")}:</strong> ${toDistanceText(item.distance_m)}</p>
    <p><strong>${t("waitLabel")}:</strong> ${toWaitText(item.wait_time_min)}</p>
    <p><strong>${t("tagsLabel")}:</strong> ${tags}</p>
    ${mapsHtml}
  `;
  if (typeof el.detailDialog.showModal === "function") el.detailDialog.showModal();
}

function openEntertainmentDetailDialog(item) {
  if (!el.detailDialog || !el.detailBody) return;
  const safeDescription = item.description || t("noDescription");
  const imageHtml = item.image_url
    ? `<img class="detail-image" src="${item.image_url}" alt="${item.name}" loading="lazy" />`
    : "";
  const schedules = Array.isArray(item.schedules) && item.schedules.length > 0
    ? `<ul>${item.schedules.map((s) => `<li>${formatScheduleLine(s)}</li>`).join("")}</ul>`
    : "-";
  const nextClass = item.is_live_now ? "next-highlight live" : "next-highlight";
  const mapsUrl = googleMapsWalkingUrl(item);
  const mapsHtml = mapsUrl
    ? `<a class="maps-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${t("openInGoogleMaps")}</a>`
    : "";
  el.detailBody.innerHTML = `
    ${imageHtml}
    <h3>${item.name}</h3>
    <p><strong>${categoryLabel(item.category)}</strong></p>
    <p>${safeDescription}</p>
    <p><strong>${t("distPrefix")}:</strong> ${toDistanceText(item.distance_m)}</p>
    <p><strong>${t("nextTime")}:</strong> ${fmtTimeIso(item.next_start_at)} · <span class="${nextClass}">${formatMinsLeft(item.next_in_min, item.is_live_now)}</span></p>
    <p><strong>${t("fullSchedule")}:</strong>${schedules}</p>
    ${mapsHtml}
  `;
  if (typeof el.detailDialog.showModal === "function") el.detailDialog.showModal();
}

function renderCards(target, items, blacklistMode = false, showBan = true) {
  target.innerHTML = "";
  for (const item of items) {
    const node = el.cardTpl.content.firstElementChild.cloneNode(true);
    let imageNode = node.querySelector(".card-image");
    if (!imageNode) {
      imageNode = document.createElement("img");
      imageNode.className = "card-image";
      node.insertBefore(imageNode, node.firstChild);
    }
    if (item.image_url) {
      imageNode.src = item.image_url;
      imageNode.alt = item.name || "";
      imageNode.loading = "lazy";
      imageNode.style.display = "";
    } else {
      imageNode.style.display = "none";
    }
    node.querySelector(".name").textContent = item.name;
    node.querySelector(".wait").textContent = toWaitText(item.wait_time_min);
    const statusEl = node.querySelector(".status");
    if (statusEl) {
      const kind = operationKind(item.status);
      statusEl.innerHTML = `<span class="status-pill ${kind}">${statusText(item.status)}</span>`;
    }
    node.querySelector(".distance").textContent = `${t("distPrefix")}: ${toDistanceText(item.distance_m)}`;
    node.querySelector(".tags").textContent = (item.type_tags || [])
      .slice(0, 5)
      .map((tagCode) => tagLabel(tagCode))
      .join(" · ") || t("tagsNone");
    if (Array.isArray(item.reason) && item.reason.length > 0) {
      node.querySelector(".tags").textContent += `\n${t("reasonPrefix")}: ${item.reason.join(" / ")}`;
    }
    node.dataset.id = item.id;
    node.addEventListener("click", () => openDetailDialog(item));

    const banBtn = node.querySelector(".ban");
    if (!showBan) {
      banBtn.style.display = "none";
    } else if (blacklistMode) {
      banBtn.textContent = t("unban");
      banBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.blacklistIds.delete(item.id);
        refreshRecommendations();
      });
    } else {
      banBtn.textContent = t("ban");
      banBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.blacklistIds.add(item.id);
        refreshRecommendations();
      });
    }

    target.appendChild(node);
  }
}

function populateAllTagFilter() {
  if (!el.allFilterTags) return;
  const q = (el.allTagSearch?.value || "").trim().toLowerCase();
  const tagSet = new Set();
  for (const item of state.allAttractions || []) {
    for (const tCode of item.type_tags || []) tagSet.add(tCode);
  }
  el.allFilterTags.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "tag-pill";
  allBtn.textContent = t("allOptionAll");
  if (state.allFilterTags.size === 0) allBtn.classList.add("active");
  allBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    state.allFilterTags.clear();
    populateAllTagFilter();
    renderAllAttractions();
    saveSessionState();
  });
  el.allFilterTags.appendChild(allBtn);

  const filteredCodes = [...tagSet]
    .sort()
    .filter((code) => {
      if (!q) return true;
      const label = tagLabel(code).toLowerCase();
      return code.toLowerCase().includes(q) || label.includes(q);
    });

  for (const code of filteredCodes) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-pill";
    btn.textContent = tagLabel(code);
    if (state.allFilterTags.has(code)) btn.classList.add("active");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.allFilterTags.has(code)) state.allFilterTags.delete(code);
      else state.allFilterTags.add(code);
      populateAllTagFilter();
      renderAllAttractions();
      saveSessionState();
    });
    el.allFilterTags.appendChild(btn);
  }

  if (el.allTagSummary) {
    el.allTagSummary.textContent = tr("allTagSummary", { count: state.allFilterTags.size });
  }
}

function getFilteredAllAttractions() {
  const parseFilterNum = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const maxDistance = parseFilterNum(el.allFilterDistance?.value);
  const maxWait = parseFilterNum(el.allFilterWait?.value);
  const operation = el.allFilterOperation?.value || "";
  const tags = [...state.allFilterTags];
  const nameQuery = (el.allSearchName?.value || "").trim().toLowerCase();
  const sort = el.allSort?.value || "distance";

  let items = (state.allAttractions || []).slice();
  if (nameQuery) {
    items = items.filter((x) => String(x?.name || "").toLowerCase().includes(nameQuery));
  }
  if (maxDistance != null) {
    items = items.filter((x) => x.distance_m == null || x.distance_m <= maxDistance);
  }
  if (maxWait != null) {
    items = items.filter((x) => x.wait_time_min == null || x.wait_time_min <= maxWait);
  }
  if (operation === "operating") {
    items = items.filter((x) => operationKind(x.status) === "operating");
  } else if (operation === "not_operating") {
    items = items.filter((x) => operationKind(x.status) !== "operating");
  }
  if (tags.length > 0) {
    items = items.filter((x) => Array.isArray(x.type_tags) && tags.some((tag) => x.type_tags.includes(tag)));
  }

  items.sort((a, b) => {
    if (sort === "wait") {
      const av = a.wait_time_min == null ? Number.MAX_SAFE_INTEGER : a.wait_time_min;
      const bv = b.wait_time_min == null ? Number.MAX_SAFE_INTEGER : b.wait_time_min;
      return av - bv || a.name.localeCompare(b.name);
    }
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "popularity") return (b.popularity_score || 0) - (a.popularity_score || 0) || a.name.localeCompare(b.name);
    const av = a.distance_m == null ? Number.MAX_SAFE_INTEGER : a.distance_m;
    const bv = b.distance_m == null ? Number.MAX_SAFE_INTEGER : b.distance_m;
    return av - bv || a.name.localeCompare(b.name);
  });
  return items;
}

function renderAllAttractions() {
  if (!el.allAttrCards) return;
  const items = getFilteredAllAttractions();
  if (items.length === 0) {
    el.allAttrCards.innerHTML = `<p class="event-empty">${t("allEmpty")}</p>`;
    return;
  }
  renderCards(el.allAttrCards, items, false, false);
}

function renderTagCheckboxes() {
  const render = (container, setRef, mode) => {
    container.innerHTML = "";
    for (const tag of TAG_OPTIONS) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "tag-pill";
      item.textContent = state.lang === "en" ? tag.en : tag.ko;
      if (setRef.has(tag.code)) item.classList.add("active");
      item.addEventListener("click", () => {
        if (setRef.has(tag.code)) {
          setRef.delete(tag.code);
          item.classList.remove("active");
        } else {
          setRef.add(tag.code);
          item.classList.add("active");
          if (mode === "must" && state.avoidTags.has(tag.code)) {
            state.avoidTags.delete(tag.code);
            renderTagCheckboxes();
          }
          if (mode === "avoid" && state.mustRideTags.has(tag.code)) {
            state.mustRideTags.delete(tag.code);
            renderTagCheckboxes();
          }
        }
        saveSessionState();
      });
      container.appendChild(item);
    }
  };

  render(el.selectedTags, state.selectedTags, "selected");
  render(el.mustRideTags, state.mustRideTags, "must");
  render(el.avoidTags, state.avoidTags, "avoid");
}

function renderSpecial(item) {
  if (!item) {
    el.specialWrap.innerHTML = "";
    return;
  }
  el.specialWrap.innerHTML = `
    <div class="panel special-card" style="margin:0 0 10px; border-color:#0e7490;">
      <h2 style="margin:0 0 8px;">${t("special")}</h2>
      <strong>${item.name}</strong>
      <p style="margin:6px 0;color:#4b5563;">${toWaitText(item.wait_time_min)} · ${t("distPrefix")}: ${toDistanceText(item.distance_m)}</p>
    </div>
  `;
  const specialNode = el.specialWrap.querySelector(".special-card");
  if (specialNode) {
    specialNode.addEventListener("click", () => openDetailDialog(item));
  }
}

function renderShowCard(item, compact = false) {
  const wrap = document.createElement("article");
  wrap.className = "event-card";
  const imageHtml = item.image_url
    ? `<img class="detail-image" src="${item.image_url}" alt="${item.name}" loading="lazy" />`
    : "";
  const summary = item.description ? item.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : t("noDescription");
  const shortSummary = summary.length > 150 ? `${summary.slice(0, 150)}...` : summary;
  wrap.innerHTML = `
    <span class="event-badge">${categoryLabel(item.category)}</span>
    ${imageHtml}
    <h4 class="name">${item.name}</h4>
    <p class="event-meta event-next">${t("nextTime")}: ${fmtTimeIso(item.next_start_at)} · <span class="${item.is_live_now ? "next-highlight live" : "next-highlight"}">${formatMinsLeft(item.next_in_min, item.is_live_now)}</span></p>
    <p class="event-meta">${t("distPrefix")}: ${toDistanceText(item.distance_m)}</p>
    <p class="event-meta">${t("detailPrefix")}: ${compact ? shortSummary : summary}</p>
  `;
  wrap.addEventListener("click", () => openEntertainmentDetailDialog(item));
  return wrap;
}

function renderEntertainment(data) {
  state.entertainment = data;
  const stage = Array.isArray(data?.stage_shows) ? data.stage_shows : [];
  const parade = data?.parade || null;
  const night = data?.night_entertainment || null;
  const closedFacilities = Array.isArray(data?.closed_facilities) ? data.closed_facilities : [];

  el.stageCards.innerHTML = "";
  if (stage.length === 0) {
    const extra = state.entertainmentError ? ` (${state.entertainmentError})` : "";
    el.stageCards.innerHTML = `<p class="event-empty">${t("stageEmpty")}${extra}</p>`;
  } else {
    for (const item of stage) el.stageCards.appendChild(renderShowCard(item, true));
  }

  el.paradeCard.innerHTML = "";
  if (!parade) {
    el.paradeCard.innerHTML = `<p class="event-empty">${t("paradeEmpty")}</p>`;
  } else {
    el.paradeCard.appendChild(renderShowCard(parade));
  }

  el.nightCard.innerHTML = "";
  if (!night) {
    el.nightCard.innerHTML = `<p class="event-empty">${t("nightEmpty")}</p>`;
  } else {
    el.nightCard.appendChild(renderShowCard(night));
  }

  el.closedCards.innerHTML = "";
  if (closedFacilities.length === 0) {
    el.closedCards.innerHTML = `<p class="event-empty">${t("closedEmpty")}</p>`;
  } else {
    for (const item of closedFacilities) {
      const node = document.createElement("article");
      node.className = "event-card";
      node.innerHTML = `
        <span class="event-badge">${t("closedLabel")}</span>
        <h4 class="name">${item.name || item.slug || item.id || "-"}</h4>
      `;
      el.closedCards.appendChild(node);
    }
  }
}

async function fetchRecommendations() {
  showLoading(true);
  showError("");
  try {
    const params = new URLSearchParams({
      lang: state.lang,
      age: String(state.profile.age),
      height_cm: String(state.profile.height_cm),
      lat: String(state.currentLocation?.lat ?? 0),
      lng: String(state.currentLocation?.lng ?? 0),
      selected_tags: state.profile.selected_tags.join(","),
      must_ride_tags: state.profile.must_ride_tags.join(","),
      avoid_tags: state.profile.avoid_tags.join(","),
      blacklist_ids: [...state.blacklistIds].join(","),
    });
    const res = await fetch(`${FN_RECO}?${params.toString()}`, { method: "GET" });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("errReco"));
    return data;
  } catch (error) {
    showError((error && error.message) ? error.message : t("errReco"));
    throw error;
  } finally {
    showLoading(false);
  }
}

async function fetchEntertainment() {
  const params = new URLSearchParams({
    lang: state.lang,
    lat: String(state.currentLocation?.lat ?? 0),
    lng: String(state.currentLocation?.lng ?? 0),
  });
  const res = await fetch(`${FN_ENT}?${params.toString()}`, { method: "GET" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch entertainment");
  return data;
}

async function fetchAllAttractions() {
  const params = new URLSearchParams({
    lang: state.lang,
    include_closed: "1",
  });
  const res = await fetch(`${FN_ATTR}?${params.toString()}`, { method: "GET" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch attractions");
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((x) => {
    const hasCoords = Number.isFinite(x?.lat) && Number.isFinite(x?.lng);
    const distance = hasCoords && state.currentLocation
      ? haversineMeters(state.currentLocation.lat, state.currentLocation.lng, x.lat, x.lng)
      : null;
    return { ...x, distance_m: distance };
  });
}

async function refreshRecommendations(mode = "normal") {
  const data = await fetchRecommendations();
  const raw = Array.isArray(data.recommendations) ? data.recommendations : [];
  const previous = new Set(state.currentVisibleIds);
  const visible = mode === "next"
    ? raw.filter((x) => !previous.has(x.id)).slice(0, 5)
    : raw.slice(0, 5);
  state.currentVisibleIds = new Set(visible.map((x) => x.id));

  renderSpecial(data.special_pick);
  renderCards(el.cards, visible);
  renderCards(el.blacklist, data.blacklist || [], true);
  const hasBlacklist = Array.isArray(data.blacklist) && data.blacklist.length > 0;
  el.blacklistTitle.classList.toggle("hidden", !hasBlacklist);
  el.blacklist.classList.toggle("hidden", !hasBlacklist);

  state.lastRefreshedAt = new Date();
  updateRefreshMeta();
  saveSessionState();

  window.__lastReco = data;
  el.onboarding.classList.add("hidden");
  el.results.classList.remove("hidden");
  el.nextBtn.classList.toggle("hidden", state.activeTab !== "reco");
  return data;
}

async function refreshEntertainment() {
  const data = await fetchEntertainment();
  state.entertainmentError = "";
  renderEntertainment(data);
  return data;
}

async function refreshAllAttractions() {
  try {
    state.allAttractions = await fetchAllAttractions();
  } catch {
    state.allAttractions = [];
  }
  populateAllTagFilter();
  renderAllAttractions();
}

async function refreshAll(mode = "normal") {
  const recoData = await refreshRecommendations(mode);
  try {
    await refreshEntertainment();
  } catch (e) {
    state.entertainmentError = e?.message || "entertainment fetch failed";
    renderEntertainment(null);
  }
  await refreshAllAttractions();
  return recoData;
}

el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  state.profile = formToProfile(el.form);
  state.currentLocation = await getCurrentLocation();
  saveSessionState();

  try {
    await refreshAll("normal");
  } catch {
    return;
  }
});

el.toStep2Btn.addEventListener("click", () => {
  if (state.stepAnimating) return;
  const age = Number(el.form.querySelector('input[name="age"]').value || 0);
  const height = Number(el.form.querySelector('input[name="height_cm"]').value || 0);
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    showError(t("errAge"));
    return;
  }
  if (!Number.isFinite(height) || height < 50 || height > 250) {
    showError(t("errHeight"));
    return;
  }
  showError("");
  animateWizardStep(el.step1, el.step2, 2);
});

el.backToStep1Btn.addEventListener("click", () => {
  if (state.stepAnimating) return;
  showError("");
  animateWizardStep(el.step2, el.step1, 1);
});

el.nextBtn.addEventListener("click", async () => {
  try {
    const data = await refreshRecommendations("next");
    window.__lastReco = data;
  } catch {
    // error already rendered
  }
});

el.refreshBtn.addEventListener("click", async () => {
  if (!state.profile) return;
  state.currentLocation = await getCurrentLocation();
  try {
    await refreshAll("normal");
  } catch {
    // error already rendered
  }
});

el.tabRecoBtn.addEventListener("click", () => setActiveTab("reco"));
el.tabAllAttrBtn.addEventListener("click", () => setActiveTab("all"));
el.tabStageBtn.addEventListener("click", () => setActiveTab("stage"));
el.tabParadeBtn.addEventListener("click", () => setActiveTab("parade"));
el.tabNightBtn.addEventListener("click", () => setActiveTab("night"));

for (const ctrl of [el.allFilterDistance, el.allFilterWait, el.allFilterOperation, el.allSort]) {
  ctrl?.addEventListener("change", () => {
    renderAllAttractions();
    saveSessionState();
  });
}
el.allSearchName?.addEventListener("input", () => {
  renderAllAttractions();
  saveSessionState();
});
el.allTagSearch?.addEventListener("input", () => {
  populateAllTagFilter();
  saveSessionState();
});

el.langKoBtn.addEventListener("click", () => {
  changeLanguage("ko");
});

el.langEnBtn.addEventListener("click", () => {
  changeLanguage("en");
});

el.resetBtn.addEventListener("click", () => {
  clearSessionState();
  window.location.reload();
});

el.detailCloseBtn.addEventListener("click", () => {
  if (el.detailDialog.open) el.detailDialog.close();
});
el.detailDialog.addEventListener("click", (e) => {
  const rect = el.detailDialog.getBoundingClientRect();
  const isOutside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if (isOutside) el.detailDialog.close();
});
el.detailDialog.addEventListener("cancel", () => {
  el.detailDialog.close();
});

window.__lastReco = null;
const loadedSession = loadSessionState();
state.lang = detectInitialLang();
if (!new URL(window.location.href).searchParams.get("lang") && typeof loadedSession?.lang === "string") {
  state.lang = parseLang(loadedSession.lang);
}
const hasRestoredMainSession = applyLoadedSession(loadedSession);
syncLangToUrl();
applyLanguage();
renderTagCheckboxes();
updateRefreshMeta();
setActiveTab(hasRestoredMainSession ? state.activeTab : "reco");
if (hasRestoredMainSession) {
  el.onboarding.classList.add("hidden");
  el.results.classList.remove("hidden");
  showError("");
  (async () => {
    if (!state.currentLocation) state.currentLocation = await getCurrentLocation();
    try {
      await refreshAll("normal");
    } catch {
      // error already rendered
    }
  })();
}
