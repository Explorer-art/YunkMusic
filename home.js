document.addEventListener('DOMContentLoaded', () => {
    let tracks = [];
    let currentTrackIndex = 0;
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-track');
    const progressBar = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const volumeControl = document.getElementById('volume');

    // Функция для получения данных с API
    async function fetchTracks() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/tracks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthHeader()
                }
            });
            const data = await response.json();
            tracks = data.tracks;
            displayTracks(tracks, 'tracksList');
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    }

    // Функция для отображения списка треков
    function displayTracks(tracks, container) {
        const tracksList = document.getElementById(container);
        tracksList.innerHTML = ""; // Очищаем текущий список

        tracks.forEach((track, index) => {
            const trackElement = document.createElement('div');
            trackElement.classList.add('track-item');
            
            trackElement.innerHTML = `
                <img src="${track.image_url}" alt="${track.title}">
                <div class="track-info">
                    <div class="track-details">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                        <div class="track-duration">${track.duration}</div>
                    </div>
                </div>
            `;
            
            trackElement.addEventListener('click', () => playTrack(index));
            tracksList.appendChild(trackElement);
        });
    }

    // Функция для воспроизведения трека
    function playTrack(index) {
        const track = tracks[index];
        currentTrackIndex = index;

        // Обновляем информацию о текущем треке
        document.getElementById('player-track-title').textContent = track.title;
        document.getElementById('player-track-artist').textContent = track.artist;
        document.querySelector('.player-track-image').src = track.image_url;

        // Устанавливаем источник для аудиоплеера
        audioPlayer.src = track.stream_url;
        audioPlayer.play();

        playButton.innerHTML = '<i class="fas fa-pause"></i>'

        // Обновляем продолжительность трека
        audioPlayer.onloadedmetadata = () => {
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        };

        // Обработчик для обновления прогресса
        audioPlayer.ontimeupdate = () => {
            progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 1000;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        };
    }

    // Форматирование времени
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsRemaining = Math.floor(seconds % 60);
        return `${minutes}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;
    }

    playButton.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButton.innerHTML = '<i class="fas fa-pause"></i>'
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>'
        }
    });

    volumeControl.addEventListener('input', () => {
        audioPlayer.volume = volumeControl.value / 100;
    });

    // Функция для переключения на следующий трек
    document.getElementById('next-track').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(currentTrackIndex);
    });

    // Функция для переключения на предыдущий трек
    document.getElementById('prev-track').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrack(currentTrackIndex);
    });

    document.getElementById('search').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = event.target.value;
                
            fetch(`http://127.0.0.1:8000/api/tracks/search?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthHeader()
                }
            })
            .then(response => response.json())
            .then(data => {
                tracks = data.tracks;
                displayTracks(data.tracks, 'tracksList');
             })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        }
    });

    document.getElementById('logout').addEventListener('click', function(event) {
        event.preventDefault();

        localStorage.removeItem('user_access_token');
        window.location.replace('login.html');
    });

    fetch(`http://127.0.0.1:8000/api/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerHTML = data.username;
        })
    .catch(error => {
        console.error('Ошибка:', error);
    });

    function getAuthHeader() {
        const token = localStorage.getItem('user_access_token');
        return token ? token : '';
    }

    fetchTracks();
});