(() => {
  if (window.VOXLIS_CLICK_TRACKER) {
    return;
  }

  const PAGE_KEY = window.VOXLIS_PAGE?.key || "roblox";
  const ACTIVE_CATALOG = window.VOXLIS_PAGE?.catalog ?? window.VOXLIS_CONFIG?.activeCatalogPage ?? {};
  const trackingConfig =
    ACTIVE_CATALOG.clickTracking && typeof ACTIVE_CATALOG.clickTracking === "object"
      ? ACTIVE_CATALOG.clickTracking
      : {};
  const TRACKING_ENABLED = trackingConfig.enabled === true;
  const ENDPOINT_URL = String(trackingConfig.endpointUrl || "/data.php").trim() || "/data.php";
  const ACTION_LABELS =
    trackingConfig.actionLabels && typeof trackingConfig.actionLabels === "object"
      ? trackingConfig.actionLabels
      : {};
  const TRACKED_SLUGS =
    trackingConfig.trackedSlugs && typeof trackingConfig.trackedSlugs === "object"
      ? trackingConfig.trackedSlugs
      : {};

  const normalizeSlug = (value = "") => String(value || "").trim().toLowerCase();
  const normalizeAction = (value = "") => String(value || "").trim().toLowerCase();
  const normalizeUiGroup = (value = "") => String(value || "").trim().toLowerCase();
  const normalizeUiKey = (value = "") => String(value || "").trim().toLowerCase();
  const startCase = (value = "") =>
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const TRACKED_CARD_ACTIONS = Array.isArray(trackingConfig.trackedActions)
    ? [...new Set(trackingConfig.trackedActions.map((action) => normalizeAction(action)).filter(Boolean))]
    : [];
  const TRACKED_UI_EVENTS = Object.fromEntries(
    Object.entries(
      trackingConfig.trackedUiEvents && typeof trackingConfig.trackedUiEvents === "object"
        ? trackingConfig.trackedUiEvents
        : {},
    ).flatMap(([group, keys]) => {
      const normalizedGroup = normalizeUiGroup(group);
      if (!normalizedGroup || !Array.isArray(keys)) {
        return [];
      }

      const normalizedKeys = [...new Set(keys.map((key) => normalizeUiKey(key)).filter(Boolean))];
      return normalizedKeys.length ? [[normalizedGroup, normalizedKeys]] : [];
    }),
  );

  const getTrackedActions = (slug = "") => {
    const configuredActions = TRACKED_SLUGS[normalizeSlug(slug)];
    if (Array.isArray(configuredActions) && configuredActions.length) {
      return [...new Set(configuredActions.map((action) => normalizeAction(action)).filter(Boolean))];
    }

    return TRACKED_CARD_ACTIONS;
  };

  const isTrackedUiEvent = (group = "", key = "") =>
    Boolean(TRACKED_UI_EVENTS[normalizeUiGroup(group)]?.includes(normalizeUiKey(key)));

  const getActionLabel = (action = "") => {
    const normalizedAction = normalizeAction(action);
    if (!normalizedAction) {
      return "";
    }

    if (ACTION_LABELS[normalizedAction]) {
      return String(ACTION_LABELS[normalizedAction]);
    }

    if (normalizedAction === "buy-keyempire") {
      return "Buy";
    }

    if (normalizedAction === "sunc") {
      return "sUNC";
    }

    return startCase(normalizedAction);
  };

  const createNoopTracker = () =>
    Object.freeze({
      loadCounts: () => Promise.resolve({}),
      loadSeedCounts: () => Promise.resolve({}),
      getTrackedActions: () => [],
      getActionLabel,
      getCounts: () => ({}),
      getUiCounts: () => ({}),
      trackAction: () => 0,
      trackCardAction: () => 0,
      trackUiEvent: () => 0,
      syncTrackingSummaries: () => {},
    });

  if (!TRACKING_ENABLED) {
    window.VOXLIS_CLICK_TRACKER = createNoopTracker();
    return;
  }

  const normalizeCardActionMap = (value = {}) =>
    Object.fromEntries(
      Object.entries(value).flatMap(([slug, actionCounts]) => {
        if (!actionCounts || typeof actionCounts !== "object" || Array.isArray(actionCounts)) {
          return [];
        }

        const normalizedSlug = normalizeSlug(slug);
        if (!normalizedSlug) {
          return [];
        }

        const normalizedActionCounts = Object.fromEntries(
          Object.entries(actionCounts).flatMap(([action, count]) => {
            const normalizedAction = normalizeAction(action);
            const numericCount = Number(count);
            if (!normalizedAction || !Number.isFinite(numericCount)) {
              return [];
            }

            return [[normalizedAction, Math.max(0, Math.floor(numericCount))]];
          }),
        );

        return Object.keys(normalizedActionCounts).length ? [[normalizedSlug, normalizedActionCounts]] : [];
      }),
    );

  const normalizeUiEventMap = (value = {}) =>
    Object.fromEntries(
      Object.entries(value).flatMap(([group, keyCounts]) => {
        if (!keyCounts || typeof keyCounts !== "object" || Array.isArray(keyCounts)) {
          return [];
        }

        const normalizedGroup = normalizeUiGroup(group);
        if (!normalizedGroup) {
          return [];
        }

        const normalizedKeyCounts = Object.fromEntries(
          Object.entries(keyCounts).flatMap(([key, count]) => {
            const normalizedKey = normalizeUiKey(key);
            const numericCount = Number(count);
            if (!normalizedKey || !Number.isFinite(numericCount)) {
              return [];
            }

            return [[normalizedKey, Math.max(0, Math.floor(numericCount))]];
          }),
        );

        return Object.keys(normalizedKeyCounts).length ? [[normalizedGroup, normalizedKeyCounts]] : [];
      }),
    );

  const normalizeCountsPayload = (value = {}) => {
    const payload = value && typeof value === "object" ? value : {};
    const legacyCardActions = Object.fromEntries(
      Object.entries(payload).flatMap(([key, nestedValue]) => {
        if (key === "card_actions" || key === "ui_events") {
          return [];
        }

        return nestedValue && typeof nestedValue === "object" && !Array.isArray(nestedValue)
          ? [[key, nestedValue]]
          : [];
      }),
    );

    return {
      cardActions: Object.assign(
        {},
        normalizeCardActionMap(legacyCardActions),
        normalizeCardActionMap(payload.card_actions ?? {}),
      ),
      uiEvents: normalizeUiEventMap(payload.ui_events ?? {}),
    };
  };

  const buildRequestUrl = () => {
    const url = new URL(ENDPOINT_URL, window.location.origin);
    url.searchParams.set("page", PAGE_KEY);
    return url.toString();
  };
  const buildEndpointUrl = () => new URL(ENDPOINT_URL, window.location.origin).toString();

  const state = {
    cardActions: {},
    uiEvents: {},
    loaded: false,
    loadPromise: null,
  };

  const applyCounts = (counts = {}) => {
    const normalizedCounts = normalizeCountsPayload(counts);
    state.cardActions = normalizedCounts.cardActions;
    state.uiEvents = normalizedCounts.uiEvents;
    state.loaded = true;
    return normalizedCounts;
  };

  const loadCounts = () => {
    if (state.loaded) {
      return Promise.resolve({
        cardActions: state.cardActions,
        uiEvents: state.uiEvents,
      });
    }

    if (state.loadPromise) {
      return state.loadPromise;
    }

    state.loadPromise = fetch(buildRequestUrl(), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load click counts (${response.status})`);
        }

        const payload = await response.json();
        return applyCounts(payload?.counts ?? payload);
      })
      .catch((error) => {
        console.warn("Failed to load PHP click counts.", error);
        return applyCounts({});
      })
      .finally(() => {
        state.loadPromise = null;
      });

    return state.loadPromise;
  };

  const getCounts = (slug = "") => {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
      return {};
    }

    return state.cardActions[normalizedSlug] && typeof state.cardActions[normalizedSlug] === "object"
      ? state.cardActions[normalizedSlug]
      : {};
  };

  const getUiCounts = (group = "") => {
    const normalizedGroup = normalizeUiGroup(group);
    if (!normalizedGroup) {
      return state.uiEvents;
    }

    return state.uiEvents[normalizedGroup] && typeof state.uiEvents[normalizedGroup] === "object"
      ? state.uiEvents[normalizedGroup]
      : {};
  };

  const recoverFromFailedPost = () => {
    state.loaded = false;
    state.loadPromise = null;
    void loadCounts();
  };

  const postTrackingPayload = (payload = {}) =>
    fetch(buildEndpointUrl(), {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to increment click count (${response.status})`);
        }

        const responsePayload = await response.json();
        applyCounts(responsePayload?.counts ?? {});
        return responsePayload;
      })
      .catch((error) => {
        console.warn("Failed to increment PHP click count.", error);
        recoverFromFailedPost();
        return null;
      });

  const trackCardAction = ({ slug = "", action = "" } = {}) => {
    const normalizedSlug = normalizeSlug(slug);
    const normalizedAction = normalizeAction(action);
    if (!normalizedSlug || !normalizedAction) {
      return 0;
    }

    if (!getTrackedActions(normalizedSlug).includes(normalizedAction)) {
      return 0;
    }

    if (!state.cardActions[normalizedSlug] || typeof state.cardActions[normalizedSlug] !== "object") {
      state.cardActions[normalizedSlug] = {};
    }

    state.cardActions[normalizedSlug][normalizedAction] =
      Number(state.cardActions[normalizedSlug][normalizedAction] || 0) + 1;
    state.loaded = true;
    const optimisticCount = Number(state.cardActions[normalizedSlug][normalizedAction] || 0);

    void postTrackingPayload({
      page: PAGE_KEY,
      type: "card",
      slug: normalizedSlug,
      action: normalizedAction,
    });

    return optimisticCount;
  };

  const trackUiEvent = ({ group = "", key = "" } = {}) => {
    const normalizedGroup = normalizeUiGroup(group);
    const normalizedKey = normalizeUiKey(key);
    if (!normalizedGroup || !normalizedKey) {
      return 0;
    }

    if (!isTrackedUiEvent(normalizedGroup, normalizedKey)) {
      return 0;
    }

    if (!state.uiEvents[normalizedGroup] || typeof state.uiEvents[normalizedGroup] !== "object") {
      state.uiEvents[normalizedGroup] = {};
    }

    state.uiEvents[normalizedGroup][normalizedKey] =
      Number(state.uiEvents[normalizedGroup][normalizedKey] || 0) + 1;
    state.loaded = true;
    const optimisticCount = Number(state.uiEvents[normalizedGroup][normalizedKey] || 0);

    void postTrackingPayload({
      page: PAGE_KEY,
      type: "ui",
      group: normalizedGroup,
      key: normalizedKey,
    });

    return optimisticCount;
  };

  const handleTrackedUiClick = (event) => {
    const trigger = event.target.closest("[data-click-track-ui-group][data-click-track-ui-key]");
    if (!trigger) {
      return;
    }

    if (trigger.getAttribute("aria-disabled") === "true" || trigger.disabled) {
      return;
    }

    trackUiEvent({
      group: trigger.dataset.clickTrackUiGroup || "",
      key: trigger.dataset.clickTrackUiKey || "",
    });
  };

  if (document.documentElement.dataset.clickTrackingUiBound !== "true") {
    document.addEventListener("click", handleTrackedUiClick);
    document.documentElement.dataset.clickTrackingUiBound = "true";
  }

  window.VOXLIS_CLICK_TRACKER = Object.freeze({
    loadCounts,
    loadSeedCounts: loadCounts,
    getTrackedActions,
    getActionLabel,
    getCounts,
    getUiCounts,
    trackAction: trackCardAction,
    trackCardAction,
    trackUiEvent,
    syncTrackingSummaries: () => {},
  });

  void loadCounts();
})();
