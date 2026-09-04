import { httpRequest } from "./libs/httpRequest";
import { auth } from "./libs/auth";
import { player } from "./player";

const albumListEl = document.querySelector("#album-list");
const artistListEl = document.querySelector("#artist-list");
const trackListEl = document.querySelector("#track-list");
const playlistListEl = document.querySelector("#playlist-list");
const authAreaEl = document.querySelector("#auth-area");
const searchInputEl = document.querySelector("#search-input");
const searchResultsEl = document.querySelector("#search-results");

const FALLBACK_IMG =
    "https://community.spotify.com/t5/image/serverpage/image-id/196380iDD24539B5FCDEAF9/image-size/medium?v=v2&px=400";

const tracksCache = {};

const fetchData = async (path) => {
    const { [path]: data } = await httpRequest.get(`/api/${path}`);
    return data || [];
};

const mapItem = (type, item) => {
    switch (type) {
        case "albums":
            return {
                id: item.id,
                image: item.cover_image_url,
                title: item.title,
                description: item.artist_name,
            };
        case "artists":
            return {
                id: item.id,
                image: item.image_url,
                title: item.name,
                description: "Nghệ sĩ",
            };
        case "tracks":
            return {
                id: item.id,
                image: item.image_url,
                title: item.title,
                description: item.artist_name,
            };
        case "playlists":
            return {
                id: item.id,
                image: item.image_url,
                title: item.name,
                description: item.description,
            };
    }
};

const isPlayable = (type) =>
    type === "artists" ||
    type === "albums" ||
    type === "tracks" ||
    type === "playlists";

const renderData = (type, rawItems) => {
    let parent;
    switch (type) {
        case "albums":
            parent = albumListEl;
            break;
        case "artists":
            parent = artistListEl;
            break;
        case "tracks":
            parent = trackListEl;
            break;
        case "playlists":
            parent = playlistListEl;
            break;
    }

    if (type === "tracks") {
        rawItems.forEach((item) => (tracksCache[item.id] = item));
    }

    const items = rawItems.map((item) => mapItem(type, item));

    parent.innerHTML = items
        .map((item) => {
            const isArtist = type === "artists";

            const playBtn = isPlayable(type)
                ? isArtist
                    ? `<button
                        data-play-btn
                        class="absolute inset-0 m-auto w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center opacity-0 scale-90 shadow-lg transition-all group-hover:opacity-100 group-hover:scale-100 hover:scale-110 hover:bg-green-400"
                       ><span class="text-lg">▶</span></button>`
                    : `<button
                        data-play-btn
                        class="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center opacity-0 translate-y-2 shadow-lg transition-all group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-green-400"
                       ><span class="text-base">▶</span></button>`
                : "";

            return `
    <div class="group relative shrink-0 rounded-md p-3 w-44 hover:cursor-pointer flex flex-col gap-2 hover:bg-background-card-hover"
      data-id="${item.id}" data-type="${type}">
      <div class="relative">
        <img class="w-full aspect-square object-cover transition ${isArtist ? "rounded-full group-hover:brightness-50" : "rounded-md"}"
          src="${item.image}" alt="${item.title}" />
        ${playBtn}
      </div>
      <h3 class="line-clamp-2 text-sm hover:underline">${item.title}</h3>
      <p class="line-clamp-2 text-xs text-foreground-accent">
        <a href="#!" class="hover:underline">${item.description}</a>
      </p>
    </div>`;
        })
        .join("");
    parent.querySelectorAll("img").forEach((imgEl) => {
        imgEl.addEventListener("error", () => (imgEl.src = FALLBACK_IMG));
    });

    parent.querySelectorAll("[data-play-btn]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest("[data-id]");
            handlePlay(card.dataset.type, card.dataset.id);
        });
    });
};

const mapTrackForPlayer = (track) => ({
    id: track.id,
    title: track.title,
    artist_name: track.artist_name,
    image_url: track.image_url,
    audio_url: track.audio_url,
});

const handlePlay = (type, id) => {
    if (type === "tracks") {
        const track = tracksCache[id];
        if (track) player.playTrack(mapTrackForPlayer(track));
        return;
    }
    if (type === "albums") return player.playAlbumById(id);
    if (type === "playlists") return player.playPlaylistById(id);
    if (type === "artists") return player.playArtistById(id);
};

const renderHeader = () => {
    if (!authAreaEl) return;
    if (auth.isAuthenticated()) {
        const user = auth.getUser();
        authAreaEl.innerHTML = `
      <span class="text-sm text-foreground-accent hidden sm:inline">Xin chào, ${user?.display_name || user?.username || "bạn"}</span>
      <button id="logout-btn" class="rounded-full bg-white text-black text-sm font-bold px-4 py-2 hover:scale-105 transition">Đăng xuất</button>`;
        document.querySelector("#logout-btn").addEventListener("click", () => {
            auth.logout();
            renderHeader();
        });
    } else {
        authAreaEl.innerHTML = `
      <a href="./signup.html" class="text-sm text-foreground-accent hover:text-white font-bold px-3">Sign up</a>
      <a href="./login.html" class="rounded-full bg-white text-black text-sm font-bold px-6 py-2 hover:scale-105 transition">Log in</a>`;
    }
    updateSignupBanner();
};

const initHorizontalScroll = () => {
    document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const list = document.querySelector(`#${btn.dataset.scrollTarget}`);
            if (!list) return;
            const dir = Number(btn.dataset.scrollDir);
            list.scrollBy({
                left: dir * list.clientWidth * 0.8,
                behavior: "smooth",
            });
        });
    });
};

let searchDebounceTimer;

const renderSearchResults = (data) => {
    const tracks = data?.tracks?.items || data?.tracks || [];
    const artists = data?.artists?.items || data?.artists || [];
    const albums = data?.albums?.items || data?.albums || [];

    if (!tracks.length && !artists.length && !albums.length) {
        searchResultsEl.innerHTML = `<p class="text-sm text-foreground-accent p-3">Không tìm thấy kết quả phù hợp.</p>`;
        searchResultsEl.classList.remove("hidden");
        return;
    }

    const section = (title, items, renderItem) => {
        if (!items.length) return "";
        return `
        <div class="mb-2">
          <p class="text-xs font-bold text-foreground-accent uppercase px-2 py-1">${title}</p>
          ${items.map(renderItem).join("")}
        </div>`;
    };

    searchResultsEl.innerHTML =
        section(
            "Bài hát",
            tracks.slice(0, 5),
            (t) => `
          <button type="button" data-search-track="${t.id}"
            class="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 text-left">
            <img src="${t.image_url || FALLBACK_IMG}" class="w-10 h-10 rounded object-cover" />
            <div class="min-w-0">
              <p class="text-sm truncate">${t.title}</p>
              <p class="text-xs text-foreground-accent truncate">${t.artist_name || ""}</p>
            </div>
          </button>`,
        ) +
        section(
            "Nghệ sĩ",
            artists.slice(0, 5),
            (a) => `
          <div class="w-full flex items-center gap-3 px-2 py-2 rounded">
            <img src="${a.image_url || FALLBACK_IMG}" class="w-10 h-10 rounded-full object-cover" />
            <div class="min-w-0">
              <p class="text-sm truncate">${a.name}</p>
              <p class="text-xs text-foreground-accent truncate">Nghệ sĩ</p>
            </div>
          </div>`,
        ) +
        section(
            "Album",
            albums.slice(0, 5),
            (al) => `
          <button type="button" data-search-album="${al.id}"
            class="w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-white/10 text-left">
            <img src="${al.cover_image_url || FALLBACK_IMG}" class="w-10 h-10 rounded object-cover" />
            <div class="min-w-0">
              <p class="text-sm truncate">${al.title}</p>
              <p class="text-xs text-foreground-accent truncate">${al.artist_name || "Album"}</p>
            </div>
          </button>`,
        );

    searchResultsEl.classList.remove("hidden");

    searchResultsEl.querySelectorAll("[data-search-track]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const track = tracks.find((t) => t.id === btn.dataset.searchTrack);
            if (track) player.playTrack(mapTrackForPlayer(track));
            searchResultsEl.classList.add("hidden");
        });
    });
    searchResultsEl.querySelectorAll("[data-search-album]").forEach((btn) => {
        btn.addEventListener("click", () => {
            player.playAlbumById(btn.dataset.searchAlbum);
            searchResultsEl.classList.add("hidden");
        });
    });
};

const initSearch = () => {
    if (!searchInputEl) return;

    searchInputEl.addEventListener("input", () => {
        const q = searchInputEl.value.trim();
        clearTimeout(searchDebounceTimer);
        if (!q) {
            searchResultsEl.classList.add("hidden");
            return;
        }
        searchDebounceTimer = setTimeout(async () => {
            const data = await httpRequest.get(
                `/api/search?q=${encodeURIComponent(q)}&type=all&limit=10`,
            );
            renderSearchResults(data || {});
        }, 350);
    });

    document.addEventListener("click", (e) => {
        if (
            !e.target.closest("#search-input") &&
            !e.target.closest("#search-results")
        ) {
            searchResultsEl.classList.add("hidden");
        }
    });
};

const initLanguageMenu = () => {
    const btn = document.querySelector("#language-btn");
    const menu = document.querySelector("#language-menu");
    const label = document.querySelector("#language-label");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
    });
    menu.querySelectorAll("[data-lang]").forEach((item) => {
        item.addEventListener("click", () => {
            label.textContent = item.dataset.lang;
            menu.classList.add("hidden");
        });
    });
    document.addEventListener("click", () => menu.classList.add("hidden"));
};

const initHomeButton = () => {
    document.querySelector("#home-btn")?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

let signupBannerDismissed = false;

const updateSignupBanner = () => {
    const banner = document.querySelector("#signup-banner");
    if (!banner) return;
    if (auth.isAuthenticated() || signupBannerDismissed) {
        banner.classList.add("hidden");
        banner.classList.remove("flex");
    } else {
        banner.classList.remove("hidden");
        banner.classList.add("flex");
    }
};

const initSignupBanner = () => {
    const signupBtn = document.querySelector("#signup-banner-btn");

    signupBtn?.addEventListener("click", () => {
        window.location.href = "./signup.html";
    });
    document
        .querySelector("#signup-banner-close")
        ?.addEventListener("click", () => {
            signupBannerDismissed = true;
            updateSignupBanner();
        });
};
// ===== KHỞI CHẠY =====
renderHeader();
player.init();
initHorizontalScroll();
initSearch();
initLanguageMenu();
initHomeButton();
initSignupBanner();
updateSignupBanner();

const dataArr = ["albums", "artists", "tracks", "playlists"];
dataArr.forEach(async (type) => {
    const data = await fetchData(type);
    renderData(type, data);
});
