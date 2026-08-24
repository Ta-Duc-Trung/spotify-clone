import { httpRequest } from "./libs/httpRequest";

const albumListEl = document.querySelector("#album-list");
const artistListEl = document.querySelector("#artist-list");
const trackListEl = document.querySelector("#track-list");
const playlistListEl = document.querySelector("#playlist-list");

const fetchData = async (path) => {
    const { [path]: data } = await httpRequest.get(`/api/${path}`);
    return data;
};

const renderData = (type, items) => {
    let parent;
    switch (type) {
        case "albums":
            items = items.map((item) => {
                return {
                    image: item.cover_image_url,
                    title: item.title,
                    description: item.artist_name,
                };
            });
            parent = albumListEl;
            break;
        case "artists":
            items = items.map((item) => {
                return {
                    image: item.image_url,
                    title: item.name,
                    description: "Artist",
                };
            });
            parent = artistListEl;
            break;
        case "tracks":
            items = items.map((item) => {
                return {
                    image: item.image_url,
                    title: item.title,
                    description: item.artist_name,
                };
            });
            parent = trackListEl;
            break;
        case "playlists":
            items = items.map((item) => {
                return {
                    image: item.image_url,
                    title: item.name,
                    description: item.description,
                };
            });
            parent = playlistListEl;
            break;
    }

    const htmlString = items
        .map((item) => {
            return `
    <div
      class="shrink-0 rounded-md p-3 w-44 hover:cursor-pointer flex flex-col gap-2 hover:bg-background-card-hover"
    >
      <img
        class="w-full aspect-square object-cover ${type === "artists" ? "rounded-full" : "rounded-md"}"
        src="${item.image}"
        alt="${item.title}"
        
      />
      <h3 class="line-clamp-2 text-sm hover:underline">
        ${item.title}
      </h3>
      <p class="line-clamp-2 text-xs text-foreground-accent">
        <a href="#!" class="hover:underline">${item.description}</a>
      </p>
    </div>
    `;
        })
        .join("");
    parent.innerHTML = htmlString;
};

const dataArr = ["albums", "artists", "tracks", "playlists"];
dataArr.forEach(async (type) => {
    const data = await fetchData(type);
    renderData(type, data);
    const imgEls = document.querySelectorAll("img");
    imgEls.forEach((imgEl) => {
        imgEl.addEventListener("error", () => {
            imgEl.src =
                "https://community.spotify.com/t5/image/serverpage/image-id/196380iDD24539B5FCDEAF9/image-size/medium?v=v2&px=400";
        });
    });
});
