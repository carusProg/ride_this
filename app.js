const API_BASE = "https://jpccvcwnxbbkuwdhjdfz.functions.supabase.co";
const FN_RECO = `${API_BASE}/recommendations`;

const state = {
  profile: null,
  currentLocation: null,
  blacklistIds: new Set(),
  sessionExcludedIds: new Set(),
  autoRefreshTimer: null,
};

const el = {
  onboarding: document.getElementById("onboarding"),
  results: document.getElementById("results"),
  form: document.getElementById("profileForm"),
  cards: document.getElementById("cards"),
  specialWrap: document.getElementById("specialWrap"),
  blacklist: document.getElementById("blacklist"),
  nextBtn: document.getElementById("nextBtn"),
  loading: document.getElementById("loading"),
  cardTpl: document.getElementById("cardTpl"),
  selectedTags: document.getElementById("selectedTags"),
  mustRideTags: document.getElementById("mustRideTags"),
  avoidTags: document.getElementById("avoidTags"),
};

const TAG_OPTIONS = [
  { code: "thrill_high", label: "스릴 강함" },
  { code: "drop_high", label: "큰 낙하" },
  { code: "drop_small", label: "작은 낙하" },
  { code: "spin", label: "회전" },
  { code: "water_ride", label: "워터 라이드" },
  { code: "dark", label: "어두움" },
  { code: "loud", label: "소리 큼" },
  { code: "scary", label: "무서움" },
  { code: "slow_ride", label: "완만한 탑승" },
  { code: "indoor", label: "실내" },
  { code: "outdoor", label: "실외" },
  { code: "interactive", label: "상호작용" },
  { code: "discovery", label: "탐험형" },
  { code: "character_meet", label: "캐릭터 만남" },
  { code: "transport", label: "이동형" },
  { code: "rider_switch", label: "라이더 스위치" },
  { code: "single_rider", label: "싱글라이더" },
  { code: "star_wars", label: "스타워즈" },
  { code: "wheelchair_transfer_required", label: "휠체어 환승 필요" },
  { code: "wheelchair_accessible", label: "휠체어 이용 가능" },
];

const tagLabelMap = new Map(TAG_OPTIONS.map((t) => [t.code, t.label]));

function showLoading(v) {
  el.loading.classList.toggle("hidden", !v);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((n) => n.value);
}

function formToProfile(form) {
  const fd = new FormData(form);
  const n = (k) => Number(fd.get(k));
  const selectedTags = new Set(getCheckedValues("selected_tags"));
  const mustRideTags = new Set(getCheckedValues("must_ride_tags"));
  const avoidTags = new Set(getCheckedValues("avoid_tags"));

  // If same tag appears in both must/avoid, keep must and remove avoid.
  for (const t of mustRideTags) {
    if (avoidTags.has(t)) avoidTags.delete(t);
  }

  return {
    profile_type: fd.get("profile_type"),
    gender: fd.get("gender"),
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
  return v == null ? "대기정보 없음" : `${v}분`;
}

function toDistanceText(v) {
  if (v == null) return "거리정보 없음";
  return v < 1000 ? `${Math.round(v)}m` : `${(v / 1000).toFixed(2)}km`;
}

function renderCards(target, items, blacklistMode = false) {
  target.innerHTML = "";
  for (const item of items) {
    const node = el.cardTpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".name").textContent = item.name;
    node.querySelector(".wait").textContent = toWaitText(item.wait_time_min);
    node.querySelector(".distance").textContent = `거리: ${toDistanceText(item.distance_m)}`;
    node.querySelector(".tags").textContent = (item.type_tags || [])
      .slice(0, 5)
      .map((t) => tagLabelMap.get(t) || t)
      .join(" · ") || "태그 없음";
    if (Array.isArray(item.reason) && item.reason.length > 0) {
      node.querySelector(".tags").textContent += `\n이유: ${item.reason.join(" / ")}`;
    }

    node.querySelector(".detail").addEventListener("click", () => {
      const query = encodeURIComponent(item.name);
      window.open(`https://maps.google.com/?q=${query}`, "_blank");
    });

    const banBtn = node.querySelector(".ban");
    if (blacklistMode) {
      banBtn.textContent = "블랙리스트 해제";
      banBtn.addEventListener("click", () => {
        state.blacklistIds.delete(item.id);
        refreshRecommendations();
      });
    } else {
      banBtn.addEventListener("click", () => {
        state.blacklistIds.add(item.id);
        refreshRecommendations();
      });
    }

    target.appendChild(node);
  }
}

function renderTagCheckboxes() {
  const render = (container, inputName) => {
    container.innerHTML = "";
    for (const tag of TAG_OPTIONS) {
      const item = document.createElement("label");
      item.className = "tag-item";
      item.innerHTML = `<input type="checkbox" name="${inputName}" value="${tag.code}" /> ${tag.label}`;
      container.appendChild(item);
    }
  };

  render(el.selectedTags, "selected_tags");
  render(el.mustRideTags, "must_ride_tags");
  render(el.avoidTags, "avoid_tags");
}

function renderSpecial(item) {
  if (!item) {
    el.specialWrap.innerHTML = "";
    return;
  }
  el.specialWrap.innerHTML = `
    <div class="panel" style="margin:0 0 10px; border-color:#0e7490;">
      <h2 style="margin:0 0 8px;">특별추천</h2>
      <strong>${item.name}</strong>
      <p style="margin:6px 0;color:#4b5563;">대기: ${toWaitText(item.wait_time_min)} · 거리: ${toDistanceText(item.distance_m)}</p>
    </div>
  `;
}

async function fetchRecommendations() {
  showLoading(true);
  try {
    const res = await fetch(FN_RECO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: state.profile,
        current_location: state.currentLocation,
        blacklist_ids: [...state.blacklistIds],
        session_excluded_ids: [...state.sessionExcludedIds],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "추천 요청 실패");

    renderSpecial(data.special_pick);
    renderCards(el.cards, data.recommendations || []);
    renderCards(el.blacklist, data.blacklist || [], true);
    return data;
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

  await refreshRecommendations();

  if (state.autoRefreshTimer) clearInterval(state.autoRefreshTimer);
  state.autoRefreshTimer = setInterval(async () => {
    state.currentLocation = await getCurrentLocation();
    await refreshRecommendations();
  }, 60_000);
});

el.nextBtn.addEventListener("click", () => {
  // exclude currently visible recommendation ids from next pass
  document.querySelectorAll("#cards .card").forEach((cardNode, idx) => {
    const name = cardNode.querySelector(".name")?.textContent;
    const match = window.__lastReco?.recommendations?.find((x) => x.name === name);
    if (match?.id) state.sessionExcludedIds.add(match.id);
  });

  refreshRecommendations().then((data) => {
    window.__lastReco = data;
  });
});

window.__lastReco = null;
renderTagCheckboxes();
