// script.js - JavaScript para la aplicación de noticias

// Variables globales
let newsData = [];
let currentUser = null;

// Cargar datos iniciales
async function loadNewsData() {
    try {
        const response = await fetch('data.json');
        newsData = await response.json();
    } catch (error) {
        console.error('Error loading news data:', error);
        // Si no hay data.json, usar localStorage
        const stored = localStorage.getItem('newsData');
        if (stored) {
            newsData = JSON.parse(stored);
        } else {
            // Datos de ejemplo si no hay nada
            newsData = [
                {
                    id: '1',
                    title: 'Bienvenido a NOTICIAS PRINCIPE',
                    content: 'Esta es la primera noticia de nuestro diario digital.',
                    category: 'local',
                    date: new Date().toISOString().split('T')[0],
                    imagePath: '',
                    featured: true
                }
            ];
            saveNewsData();
        }
    }
}

// Guardar datos
function saveNewsData() {
    localStorage.setItem('newsData', JSON.stringify(newsData));
}

// Obtener noticias destacadas
function getFeaturedNews() {
    return newsData.filter(news => news.featured).slice(0, 3);
}

// Obtener todas las noticias ordenadas
function getAllNewsSorted() {
    return [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Obtener noticias por categoría
function getNewsByCategory(category) {
    return newsData.filter(news => news.category === category).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Renderizar noticia
function renderNewsItem(news, isAdmin = false) {
    const imageHtml = news.imagePath ? `<img src="${news.imagePath}" alt="${news.title}" class="article-image" onclick="openImageModal('${news.imagePath}')">` : '';
    const adminButtons = isAdmin ? `
        <div class="actions">
            <button class="btn-edit" onclick="editNews('${news.id}')">Editar</button>
            <button class="btn-delete" onclick="deleteNews('${news.id}')">Eliminar</button>
        </div>
    ` : '';

    return `
        <article class="news-article">
            ${imageHtml}
            <div class="article-content">
                <h3>${news.title}</h3>
                <p>${news.content.length > 100 ? news.content.substring(0, 100) + '...' : news.content}</p>
                <span class="article-date">${news.date} - ${news.category}</span>
                ${adminButtons}
            </div>
        </article>
    `;
}

// Cargar noticias destacadas
function loadFeaturedNews() {
    const featuredNews = getFeaturedNews();
    const container = document.getElementById('featuredNews');
    if (container) {
        container.innerHTML = featuredNews.map(news => renderNewsItem(news)).join('');
    }
}

// Cargar lista de noticias
function loadNewsList(category = null) {
    let newsToShow;
    if (category) {
        newsToShow = getNewsByCategory(category);
    } else {
        newsToShow = getAllNewsSorted();
    }
    const container = document.getElementById('newsList');
    if (container) {
        container.innerHTML = newsToShow.map(news => renderNewsItem(news)).join('');
    }
}

// Cargar sidebar
function loadSidebarNews() {
    const recentNews = getAllNewsSorted().slice(0, 5);
    const container = document.getElementById('sidebarNews');
    if (container) {
        container.innerHTML = recentNews.map(news => `
            <div class="sidebar-item">
                <h4>${news.title}</h4>
                <span>${news.date} - ${news.category}</span>
            </div>
        `).join('');
    }
}

// Cargar admin news list
function loadAdminNewsList() {
    const container = document.getElementById('adminNewsList');
    if (container) {
        container.innerHTML = getAllNewsSorted().map(news => renderNewsItem(news, true)).join('');
    }
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'user' && password === 'principe2025') {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        window.location.href = 'admin.html';
    } else {
        showMessage('Usuario o contraseña incorrectos.', 'error');
    }
}

// Manejar envío de noticia
function handleNewsSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const imageInput = document.getElementById('image');

    if (!title || !content || !category) {
        showMessage('Todos los campos son obligatorios.', 'error');
        return;
    }

    const newNews = {
        id: Date.now().toString(),
        title,
        content,
        category,
        date: new Date().toISOString().split('T')[0],
        imagePath: '',
        featured: false
    };

    // Manejar imagen (simulado)
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            newNews.imagePath = e.target.result;
            newsData.push(newNews);
            saveNewsData();
            showMessage('Noticia agregada exitosamente.', 'success');
            document.getElementById('newsForm').reset();
            loadAdminNewsList();
        };
        reader.readAsDataURL(file);
    } else {
        newsData.push(newNews);
        saveNewsData();
        showMessage('Noticia agregada exitosamente.', 'success');
        document.getElementById('newsForm').reset();
        loadAdminNewsList();
    }
}

// Editar noticia
function editNews(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) return;

    document.getElementById('editId').value = news.id;
    document.getElementById('editTitle').value = news.title;
    document.getElementById('editContent').value = news.content;
    document.getElementById('editCategory').value = news.category;

    document.getElementById('editModal').style.display = 'block';
}

// Cerrar modal de edición
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Manejar actualización de noticia
function handleEditSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value;
    const content = document.getElementById('editContent').value;
    const category = document.getElementById('editCategory').value;
    const imageInput = document.getElementById('editImage');

    const news = newsData.find(n => n.id === id);
    if (!news) return;

    news.title = title;
    news.content = content;
    news.category = category;

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            news.imagePath = e.target.result;
            saveNewsData();
            closeEditModal();
            loadAdminNewsList();
        };
        reader.readAsDataURL(file);
    } else {
        saveNewsData();
        closeEditModal();
        loadAdminNewsList();
    }
}

// Eliminar noticia
function deleteNews(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
        newsData = newsData.filter(n => n.id !== id);
        saveNewsData();
        loadAdminNewsList();
    }
}

// Mostrar mensaje
function showMessage(message, type) {
    const container = document.getElementById('message');
    if (container) {
        container.innerHTML = `<p class="${type}">${message}</p>`;
        setTimeout(() => container.innerHTML = '', 3000);
    }
}

// Modal de imagen
function openImageModal(src) {
    document.getElementById('fullImage').src = src;
    document.getElementById('imageModal').style.display = 'block';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function zoomImage() {
    // Implementar zoom si es necesario
}

// Actualizar fecha
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('es-ES', options);
}

// Cargar clima desde AccuWeather webpage usando CORS proxy
async function loadWeather() {
    try {
        // Verificar si los datos están en cache (actualización cada hora)
        const lastUpdate = localStorage.getItem('weatherLastUpdate');
        const now = Date.now();
        const cachedWeather = localStorage.getItem('cachedWeather');

        if (cachedWeather && lastUpdate && (now - parseInt(lastUpdate)) < 60 * 60 * 1000) { // 1 hora
            // Usar datos en cache
            const weatherData = JSON.parse(cachedWeather);
            updateWeatherUI(weatherData);
            return;
        }

        // Usar CORS proxy para acceder a la página de AccuWeather
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent('https://www.accuweather.com/es/bo/general-saavedra/36230/hourly-weather-forecast/36230');

        const response = await fetch(proxyUrl + targetUrl);
        const data = await response.json();
        const html = data.contents;

        // Parsear el HTML para extraer datos del clima
        const weatherInfo = parseAccuWeatherHTML(html);

        // Guardar en cache
        localStorage.setItem('cachedWeather', JSON.stringify(weatherInfo));
        localStorage.setItem('weatherLastUpdate', now.toString());

        // Actualizar UI
        updateWeatherUI(weatherInfo);

    } catch (error) {
        console.error('Error loading weather:', error);
        // Intentar con datos de respaldo si falla el parsing
        loadFallbackWeather();
    }
}

// Función de respaldo para clima cuando falla el scraping
function loadFallbackWeather() {
    const fallbackWeather = {
        current: {
            temp: 26,
            condition: 'Parcialmente nublado',
            icon: 4
        },
        forecast: [26, 28, 30]
    };
    updateWeatherUI(fallbackWeather);
}

// Parsear HTML de AccuWeather para extraer datos del clima
function parseAccuWeatherHTML(html) {
    try {
        // Crear un elemento temporal para parsear HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Buscar temperatura actual
        const tempElement = doc.querySelector('.temp') || doc.querySelector('[data-qa="temperature"]') || doc.querySelector('.temperature');
        const currentTemp = tempElement ? parseInt(tempElement.textContent.replace(/[^\d]/g, '')) : 26;

        // Buscar condición actual
        const conditionElement = doc.querySelector('.phrase') || doc.querySelector('[data-qa="weatherText"]') || doc.querySelector('.weather-text');
        const currentCondition = conditionElement ? conditionElement.textContent.trim() : 'Parcialmente nublado';

        // Buscar pronóstico (simplificado - buscar temperaturas en las próximas horas)
        const forecastElements = doc.querySelectorAll('.hourly-card .temp') || doc.querySelectorAll('[data-qa="hourlyTemp"]');
        const forecast = [];

        for (let i = 0; i < Math.min(3, forecastElements.length); i++) {
            const temp = parseInt(forecastElements[i].textContent.replace(/[^\d]/g, ''));
            if (!isNaN(temp)) {
                forecast.push(temp);
            }
        }

        // Si no se encontraron suficientes datos de pronóstico, usar valores por defecto
        while (forecast.length < 3) {
            forecast.push(currentTemp + forecast.length);
        }

        return {
            current: {
                temp: currentTemp,
                condition: currentCondition,
                icon: 4 // Default icon
            },
            forecast: forecast
        };

    } catch (error) {
        console.error('Error parsing weather HTML:', error);
        // Retornar datos de respaldo
        return {
            current: {
                temp: 26,
                condition: 'Parcialmente nublado',
                icon: 4
            },
            forecast: [26, 28, 30]
        };
    }
}



// Actualizar la interfaz de usuario del clima
function updateWeatherUI(weatherInfo) {
    // Actualizar header weather
    const headerWeather = document.getElementById('weather');
    if (headerWeather) {
        headerWeather.textContent = `Santa Cruz, Bolivia - ${weatherInfo.current.temp}°C`;
    }

    // Actualizar widget de clima en sidebar
    const weatherWidget = document.querySelector('.weather-widget');
    if (weatherWidget) {
        const tempElement = weatherWidget.querySelector('.temperature');
        const conditionElement = weatherWidget.querySelector('.condition');
        const iconElement = weatherWidget.querySelector('.weather-icon');
        const forecastDays = weatherWidget.querySelectorAll('.forecast-day');

        if (tempElement) tempElement.textContent = `${weatherInfo.current.temp}°C`;
        if (conditionElement) conditionElement.textContent = weatherInfo.current.condition.charAt(0).toUpperCase() + weatherInfo.current.condition.slice(1);

        // Cambiar icono basado en condición (simplificado)
        if (iconElement) {
            if (weatherInfo.current.condition.includes('lluvia')) {
                iconElement.textContent = '🌧️';
            } else if (weatherInfo.current.condition.includes('nube')) {
                iconElement.textContent = '☁️';
            } else if (weatherInfo.current.condition.includes('soleado') || weatherInfo.current.condition.includes('claro')) {
                iconElement.textContent = '☀️';
            } else {
                iconElement.textContent = '🌤️';
            }
        }

        // Actualizar pronóstico
        weatherInfo.forecast.forEach((temp, index) => {
            if (forecastDays[index]) {
                const tempSpan = forecastDays[index].querySelector('span:last-child');
                if (tempSpan) tempSpan.textContent = `${temp}°C`;
            }
        });
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    await loadNewsData();
    updateDate();
    await loadWeather(); // Cargar clima al inicio

    // Cargar contenido según la página
    loadFeaturedNews();
    loadNewsList(window.category);
    loadSidebarNews();

    // Si es admin
    if (document.getElementById('adminNewsList')) {
        loadAdminNewsList();
    }

    // Event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', handleNewsSubmit);
    }

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    // Verificar login
    currentUser = localStorage.getItem('currentUser');
    if (window.location.pathname.includes('admin.html') && !currentUser) {
        window.location.href = 'login.html';
    }
});
