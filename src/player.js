import { httpRequest } from "./libs/httpRequest";

const FALLBACK_IMG =
    "https://community.spotify.com/t5/image/serverpage/image-id/196380iDD24539B5FCDEAF9/image-size/medium?v=v2&px=400";

let audioEl,
    playerBar,
    coverEl,
    titleEl,
    artistEl,
    playPauseBtn,
    prevBtn,
    nextBtn,
    progressBar,
    currentTimeEl,
    durationTimeEl,
    volumeBar;

let queue = [];
let currentIndex = -1;

const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
};

// API có thể trả { tracks: [...] } hoặc { data: [...] }, mỗi phần tử có thể là track thô
// hoặc bọc trong { track: {...} } (kiểu playlist item) -> chuẩn hoá lại
const extractTracks = (data) => {
    if (!data) return [];
    const arr = Array.isArray(data.tracks)
        ? data.tracks
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
    return arr.map((t) => t.track || t);
};

function renderNowPlaying(track) {
    coverEl.src = track.image_url || FALLBACK_IMG;
    titleEl.textContent = track.title || "Đang phát";
    artistEl.textContent = track.artist_name || "";
    playerBar.classList.remove("invisible");
}

function updatePlayIcon(isPlaying) {
    playPauseBtn.textContent = isPlaying ? "⏸" : "▶";
}

function playIndex(index) {
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    if (!track?.audio_url) {
        console.warn("Bài hát chưa có audio_url:", track);
        return;
    }
    currentIndex = index;
    audioEl.src = track.audio_url;
    audioEl.play().catch((err) => console.log(err));
    renderNowPlaying(track);
    updatePlayIcon(true);
}

export const player = {
    init() {
        audioEl = document.querySelector("#audio-el");
        playerBar = document.querySelector("#player-bar");
        coverEl = document.querySelector("#player-cover");
        titleEl = document.querySelector("#player-title");
        artistEl = document.querySelector("#player-artist");
        playPauseBtn = document.querySelector("#play-pause-btn");
        prevBtn = document.querySelector("#prev-btn");
        nextBtn = document.querySelector("#next-btn");
        progressBar = document.querySelector("#progress-bar");
        currentTimeEl = document.querySelector("#current-time");
        durationTimeEl = document.querySelector("#duration-time");
        volumeBar = document.querySelector("#volume-bar");

        audioEl.volume = 0.8;

        playPauseBtn.addEventListener("click", () => player.togglePlay());
        prevBtn.addEventListener("click", () => player.prev());
        nextBtn.addEventListener("click", () => player.next());

        audioEl.addEventListener("timeupdate", () => {
            if (!audioEl.duration) return;
            progressBar.value = (audioEl.currentTime / audioEl.duration) * 100;
            currentTimeEl.textContent = formatTime(audioEl.currentTime);
            durationTimeEl.textContent = formatTime(audioEl.duration);
        });
        audioEl.addEventListener("ended", () => player.next());

        progressBar.addEventListener("input", () => {
            if (!audioEl.duration) return;
            audioEl.currentTime = (progressBar.value / 100) * audioEl.duration;
        });

        volumeBar.addEventListener("input", () => {
            audioEl.volume = volumeBar.value / 100;
        });
    },

    playTrack(track) {
        queue = [track];
        playIndex(0);
    },

    playQueue(tracks, startIndex = 0) {
        queue = tracks;
        playIndex(startIndex);
    },

    async playAlbumById(albumId) {
        const data = await httpRequest.get(`/api/albums/${albumId}/tracks`);
        const tracks = extractTracks(data);
        if (tracks.length) this.playQueue(tracks, 0);
    },

    async playPlaylistById(playlistId) {
        const data = await httpRequest.get(
            `/api/playlists/${playlistId}/tracks`,
        );
        const tracks = extractTracks(data);
        if (tracks.length) this.playQueue(tracks, 0);
    },

    async playArtistById(artistId) {
        const data = await httpRequest.get(
            `/api/artists/${artistId}/tracks/popular`,
        );
        const tracks = extractTracks(data);
        if (tracks.length) this.playQueue(tracks, 0);
    },
    togglePlay() {
        if (!audioEl.src) return;
        if (audioEl.paused) {
            audioEl.play();
            updatePlayIcon(true);
        } else {
            audioEl.pause();
            updatePlayIcon(false);
        }
    },

    next() {
        if (currentIndex < queue.length - 1) playIndex(currentIndex + 1);
    },
    prev() {
        if (currentIndex > 0) playIndex(currentIndex - 1);
    },
};
