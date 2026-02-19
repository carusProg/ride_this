const API_BASE = "https://jpccvcwnxbbkuwdhjdfz.functions.supabase.co";
const FN_RECO = `${API_BASE}/recommendations`;

const state = {
  profile: null,
  lang: "en",
  currentLocation: null,
  blacklistIds: new Set(),
  sessionExcludedIds: new Set(),
  selectedTags: new Set(),
  mustRideTags: new Set(),
  avoidTags: new Set(),
  autoRefreshTimer: null,
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
  labelProfileType: document.getElementById("labelProfileType"),
  labelAge: document.getElementById("labelAge"),
  labelHeight: document.getElementById("labelHeight"),
  optSelf: document.getElementById("optSelf"),
  optChild: document.getElementById("optChild"),
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
  blacklistTitle: document.getElementById("blacklistTitle"),
  blacklist: document.getElementById("blacklist"),
  nextBtn: document.getElementById("nextBtn"),
  loading: document.getElementById("loading"),
  loadingText: document.getElementById("loadingText"),
  errorText: document.getElementById("errorText"),
  cardTpl: document.getElementById("cardTpl"),
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
    labelProfileType: "구분",
    optSelf: "본인",
    optChild: "아이",
    labelAge: "나이",
    labelHeight: "키(cm)",
    btnNext: "다음",
    btnBack: "이전",
    btnStart: "추천 시작",
    selectedLegend: "선호 태그",
    mustLegend: "꼭 타고 싶은 태그",
    avoidLegend: "회피 태그",
    resultsTitle: "추천 어트랙션 5",
    blacklistTitle: "다시 추천 안함",
    nextReco: "다음추천",
    loading: "생각중입니다...",
    waitNone: "대기정보 없음",
    distNone: "거리정보 없음",
    distPrefix: "거리",
    tagsNone: "태그 없음",
    reasonPrefix: "이유",
    detail: "세부보기",
    ban: "다시 추천 안함",
    unban: "블랙리스트 해제",
    special: "특별추천",
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
    labelProfileType: "Profile",
    optSelf: "Self",
    optChild: "Child",
    labelAge: "Age",
    labelHeight: "Height (cm)",
    btnNext: "Next",
    btnBack: "Back",
    btnStart: "Start Recommendation",
    selectedLegend: "Preferred Tags",
    mustLegend: "Must-Ride Tags",
    avoidLegend: "Avoid Tags",
    resultsTitle: "Top 5 Recommendations",
    blacklistTitle: "Do Not Recommend Again",
    nextReco: "Next Picks",
    loading: "Thinking...",
    waitNone: "No wait info",
    distNone: "No distance info",
    distPrefix: "Distance",
    tagsNone: "No tags",
    reasonPrefix: "Reason",
    detail: "Details",
    ban: "Do Not Recommend",
    unban: "Remove Blacklist",
    special: "Special Pick",
    errAge: "Please enter a valid age.",
    errHeight: "Please enter a valid height.",
    errReco: "Failed to fetch recommendations.",
  },
};

function t(key) {
  return I18N[state.lang][key] || key;
}

function parseLang(v) {
  return v && v.toLowerCase() === "ko" ? "ko" : "en";
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

async function changeLanguage(nextLang) {
  if (state.lang === nextLang) return;
  state.lang = nextLang;
  syncLangToUrl();
  applyLanguage();
  renderTagCheckboxes();

  if (!el.results.classList.contains("hidden") && state.profile) {
    try {
      await refreshRecommendations();
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
  el.labelProfileType.textContent = t("labelProfileType");
  el.optSelf.textContent = t("optSelf");
  el.optChild.textContent = t("optChild");
  el.labelAge.textContent = t("labelAge");
  el.labelHeight.textContent = t("labelHeight");
  el.toStep2Btn.textContent = t("btnNext");
  el.backToStep1Btn.textContent = t("btnBack");
  el.startRecoBtn.textContent = t("btnStart");
  el.legendSelected.textContent = t("selectedLegend");
  el.legendMust.textContent = t("mustLegend");
  el.legendAvoid.textContent = t("avoidLegend");
  el.resultsTitle.textContent = t("resultsTitle");
  el.blacklistTitle.textContent = t("blacklistTitle");
  el.nextBtn.textContent = t("nextReco");
  el.loadingText.textContent = t("loading");
}

function showLoading(v) {
  el.loading.classList.toggle("hidden", !v);
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
    profile_type: fd.get("profile_type"),
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

function renderCards(target, items, blacklistMode = false) {
  target.innerHTML = "";
  for (const item of items) {
    const node = el.cardTpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".name").textContent = item.name;
    node.querySelector(".wait").textContent = toWaitText(item.wait_time_min);
    node.querySelector(".distance").textContent = `${t("distPrefix")}: ${toDistanceText(item.distance_m)}`;
    node.querySelector(".tags").textContent = (item.type_tags || [])
      .slice(0, 5)
      .map((tagCode) => tagLabel(tagCode))
      .join(" · ") || t("tagsNone");
    if (Array.isArray(item.reason) && item.reason.length > 0) {
      node.querySelector(".tags").textContent += `\n${t("reasonPrefix")}: ${item.reason.join(" / ")}`;
    }
    node.dataset.id = item.id;

    const detailBtn = node.querySelector(".detail");
    detailBtn.textContent = t("detail");
    detailBtn.addEventListener("click", () => {
      const query = encodeURIComponent(item.name);
      window.open(`https://maps.google.com/?q=${query}`, "_blank");
    });

    const banBtn = node.querySelector(".ban");
    if (blacklistMode) {
      banBtn.textContent = t("unban");
      banBtn.addEventListener("click", () => {
        state.blacklistIds.delete(item.id);
        refreshRecommendations();
      });
    } else {
      banBtn.textContent = t("ban");
      banBtn.addEventListener("click", () => {
        state.blacklistIds.add(item.id);
        refreshRecommendations();
      });
    }

    target.appendChild(node);
  }
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
    <div class="panel" style="margin:0 0 10px; border-color:#0e7490;">
      <h2 style="margin:0 0 8px;">${t("special")}</h2>
      <strong>${item.name}</strong>
      <p style="margin:6px 0;color:#4b5563;">${toWaitText(item.wait_time_min)} · ${t("distPrefix")}: ${toDistanceText(item.distance_m)}</p>
    </div>
  `;
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
      session_excluded_ids: [...state.sessionExcludedIds].join(","),
    });
    const res = await fetch(`${FN_RECO}?${params.toString()}`, { method: "GET" });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("errReco"));

    renderSpecial(data.special_pick);
    renderCards(el.cards, data.recommendations || []);
    renderCards(el.blacklist, data.blacklist || [], true);
    return data;
  } catch (error) {
    showError((error && error.message) ? error.message : t("errReco"));
    throw error;
  } finally {
    showLoading(false);
  }
}

async function refreshRecommendations() {
  const data = await fetchRecommendations();
  window.__lastReco = data;
  el.onboarding.classList.add("hidden");
  el.results.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  return data;
}

el.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  state.profile = formToProfile(el.form);
  state.currentLocation = await getCurrentLocation();

  try {
    await refreshRecommendations();
  } catch {
    return;
  }

  if (state.autoRefreshTimer) clearInterval(state.autoRefreshTimer);
  state.autoRefreshTimer = setInterval(async () => {
    state.currentLocation = await getCurrentLocation();
    try {
      await refreshRecommendations();
    } catch {
      // error already rendered
    }
  }, 60_000);
});

el.toStep2Btn.addEventListener("click", () => {
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
  el.step1.classList.add("hidden");
  el.step2.classList.remove("hidden");
  el.stepNow.textContent = "2";
});

el.backToStep1Btn.addEventListener("click", () => {
  showError("");
  el.step2.classList.add("hidden");
  el.step1.classList.remove("hidden");
  el.stepNow.textContent = "1";
});

el.nextBtn.addEventListener("click", () => {
  // exclude currently visible recommendation ids from next pass
  document.querySelectorAll("#cards .card").forEach((cardNode) => {
    const id = cardNode.dataset.id;
    if (id) state.sessionExcludedIds.add(id);
  });

  refreshRecommendations().then((data) => {
    window.__lastReco = data;
  }).catch(() => {
    // error already rendered
  });
});

el.langKoBtn.addEventListener("click", () => {
  changeLanguage("ko");
});

el.langEnBtn.addEventListener("click", () => {
  changeLanguage("en");
});

window.__lastReco = null;
state.lang = parseLang(new URL(window.location.href).searchParams.get("lang"));
applyLanguage();
renderTagCheckboxes();
