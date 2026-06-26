// =======================================
// DOM ELEMENTS
// =======================================

const songUrl = document.getElementById("songUrl");
const downloadBtn = document.getElementById("downloadBtn");
const loader = document.getElementById("loader");
const songCard = document.getElementById("songCard");

const coverImage = document.getElementById("coverImage");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const albumName = document.getElementById("albumName");
const duration = document.getElementById("duration");
const releaseDate = document.getElementById("releaseDate");

const downloadSongBtn = document.getElementById("downloadSong");
const copyLinkBtn = document.getElementById("copyLink");

const historyList = document.getElementById("historyList");
const downloadCount = document.getElementById("downloadCount");
const themeToggle = document.getElementById("themeToggle");

// =======================================
// VARIABLES
// =======================================

let currentSong = null;

// =======================================
// DOWNLOAD BUTTON
// =======================================

downloadBtn.addEventListener("click", () => {

    const url = songUrl.value.trim();

    if (!url) {
        showToast("Please paste a Spotify URL", "error");
        return;
    }

    if (!url.includes("open.spotify.com/track/")) {
        showToast("Please enter a valid Spotify Track URL", "error");
        return;
    }

    fetchSong(url);

});

songUrl.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        downloadBtn.click();

    }

});
// =======================================
// FETCH SONG
// =======================================

async function fetchSong(trackUrl){

    loader.classList.remove("hidden");

    songCard.classList.add("hidden");

    downloadBtn.disabled = true;

    try{

        const response = await fetch(

            `${CONFIG.API_URL}?songId=${encodeURIComponent(trackUrl)}`,

            {

                method:"GET",

                headers:{

                    "x-rapidapi-key":CONFIG.API_KEY,

                    "x-rapidapi-host":CONFIG.API_HOST,

                    "Content-Type":"application/json"

                }

            }

        );

        const result = await response.json();

        console.log(result);

        loader.classList.add("hidden");

        downloadBtn.disabled=false;

        console.log(result);

    alert(JSON.stringify(result));

    return;

        currentSong=result.data;

        renderSong(currentSong);

        saveHistory(currentSong);

        updateCounter();

    }

    catch(error){

        console.error(error);

        loader.classList.add("hidden");

        downloadBtn.disabled=false;

        alert("API Error");

    }

}
// =======================================
// RENDER SONG
// =======================================

function renderSong(song){

    songCard.classList.remove("hidden");

    coverImage.src=song.cover;

    coverImage.alt=song.title;

    songTitle.textContent=song.title;

    artistName.textContent=song.artist;

    albumName.textContent=song.album;

    duration.textContent=song.duration || "Not Available";

    releaseDate.textContent=song.releaseDate || "Not Available";

}

// =======================================
// DOWNLOAD SONG
// =======================================

downloadSongBtn.addEventListener("click",()=>{

    if(!currentSong){

        alert("Search a song first.");

        return;

    }

    if(currentSong.downloadLink){

        window.open(currentSong.downloadLink,"_blank");

    }

    else{

        alert("Download link unavailable.");

    }

});

// =======================================
// COPY SPOTIFY LINK
// =======================================

copyLinkBtn.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(songUrl.value);

        alert("Spotify link copied");

    }

    catch(error){

        alert("Unable to copy link","error");

    }

});

// =======================================
// SAVE HISTORY
// =======================================

function saveHistory(song){

    let history =
        JSON.parse(localStorage.getItem("spotifyHistory")) || [];

    history = history.filter(item=>item.id!==song.id);

    history.unshift(song);

    if(history.length>5){

        history.pop();

    }

    localStorage.setItem(

        "spotifyHistory",

        JSON.stringify(history)

    );

    loadHistory();

}

// =======================================
// LOAD HISTORY
// =======================================

function loadHistory(){

    const history =

        JSON.parse(localStorage.getItem("spotifyHistory"))

        || [];

    historyList.innerHTML="";

    if(history.length===0){

        historyList.innerHTML="<li>No downloads yet.</li>";

        return;

    }

    history.forEach(song=>{

        const li=document.createElement("li");

        li.innerHTML=`

            🎵 <strong>${song.title}</strong><br>

            <small>${song.artist}</small>

        `;

        li.onclick=()=>{

            currentSong=song;
            console.log(currentSong);

            renderSong(song);

        };

        historyList.appendChild(li);

    });

}

// =======================================
// DOWNLOAD COUNTER
// =======================================

function updateCounter(){

    let total=

    Number(localStorage.getItem("downloadCount")) || 0;

    total++;

    localStorage.setItem(

        "downloadCount",

        total

    );

    downloadCount.textContent=total;

}

// =======================================
// LOAD COUNTER
// =======================================

downloadCount.textContent=

Number(localStorage.getItem("downloadCount")) || 0;

// =======================================
// LOAD HISTORY ON PAGE LOAD
// =======================================

window.addEventListener("load",()=>{

    loadHistory();

});