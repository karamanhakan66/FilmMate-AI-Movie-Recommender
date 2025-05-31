/**
 * Film arama ve öneri sistemi için JavaScript fonksiyonları
 */

/**
 * Arama gecikmesini yönetmek için debounce fonksiyonu
 * @param {Function} func - Çalıştırılacak fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Film arama fonksiyonu (debounced versiyon)
 * Input field değişikliğine tepki verir
 * Minimum 2 karakter gerektirir
 */
const searchMoviesDebounced = debounce(() => {
    performSearch();
}, 300); // 300ms gecikme

/**
 * Arama sonuç konteynerini oluşturma
 */
function createSearchResultsOverlay() {
    // Eğer zaten varsa yeniden oluşturma
    if ($('#searchResultsOverlay').length > 0) return;
    
    // Body'ye overlay ekle
    $('body').append(`
        <div id="searchResultsOverlay" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] hidden">
            <div class="container mx-auto px-4 h-full flex items-start justify-center pt-24 pb-10">
                <div class="relative w-full max-w-lg">
                    <div id="searchResultsContainer" class="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-500 max-h-[80vh] overflow-hidden">
                        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Arama Sonuçları</h3>
                            <button id="closeSearchResults" class="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-dark-500">
                                <i class="fas fa-times text-gray-500 dark:text-gray-400"></i>
                            </button>
                        </div>
                        <div id="searchResults" class="max-h-[calc(80vh-60px)] overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Kapatma butonunun işlevi
    $('#closeSearchResults').on('click', function() {
        $('#searchResultsOverlay').fadeOut(200);
    });
    
    // Overlay dışına tıklandığında kapat
    $('#searchResultsOverlay').on('click', function(e) {
        if (e.target === this) {
            $(this).fadeOut(200);
        }
    });
    
    // Escape tuşuna basıldığında kapat
    $(document).keydown(function(e) {
        if (e.key === "Escape") {
            $('#searchResultsOverlay').fadeOut(200);
        }
    });
}

// Sayfa yüklendiğinde arama sonuç konteynerini oluştur
$(document).ready(function() {
    createSearchResultsOverlay();
});

/**
 * Film arama sonuçlarını getirir
 * Hem arama butonuna hem de debounce edilmiş input değişikliklerine hizmet eder
 */
function performSearch() {
    const query = $('#searchInput').val();
    if (query.length < 2) {
        $('#searchResults').empty();
        $('#searchResultsOverlay').fadeOut(200);
        return;
    }

    $.ajax({
        url: '/search',
        method: 'POST',
        data: { query: query },
        success: function(movies) {
            // Arama sonuçları konteynerini görünür yap
            $('#searchResultsOverlay').fadeIn(200);
            // Sonuçları temizle
            $('#searchResults').empty();
            
            if (movies.length === 0) {
                $('#searchResults').html('<div class="p-8 text-center text-gray-500 dark:text-gray-400">Sonuç bulunamadı.</div>');
                return;
            }
            
            let html = '';
            movies.forEach((movie, index) => {
                const genres = movie.genres.split('|').slice(0, 2).map(genre => {
                    const genreName = genre.trim().toLowerCase();
                    let bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                    
                    if (genreName === 'action') {
                        bgClass = 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400';
                    } else if (genreName === 'adventure') {
                        bgClass = 'bg-amber-100 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400';
                    } else if (genreName === 'animation') {
                        bgClass = 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400';
                    } else if (genreName === 'comedy') {
                        bgClass = 'bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400';
                    } else if (genreName === 'crime') {
                        bgClass = 'bg-violet-100 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400';
                    } else if (genreName === 'documentary') {
                        bgClass = 'bg-cyan-100 text-cyan-500 dark:bg-cyan-900/20 dark:text-cyan-400';
                    } else if (genreName === 'drama') {
                        bgClass = 'bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400';
                    } else if (genreName === 'family') {
                        bgClass = 'bg-lime-100 text-lime-500 dark:bg-lime-900/20 dark:text-lime-400';
                    } else if (genreName === 'fantasy') {
                        bgClass = 'bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400';
                    } else if (genreName === 'history') {
                        bgClass = 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300';
                    } else if (genreName === 'horror') {
                        bgClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
                    } else if (genreName === 'music') {
                        bgClass = 'bg-pink-100 text-pink-400 dark:bg-pink-900/20 dark:text-pink-300';
                    } else if (genreName === 'mystery') {
                        bgClass = 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300';
                    } else if (genreName === 'romance') {
                        bgClass = 'bg-red-100 text-red-400 dark:bg-red-900/20 dark:text-red-300';
                    } else if (genreName === 'sci-fi' || genreName === 'science fiction') {
                        bgClass = 'bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400';
                    } else if (genreName === 'thriller') {
                        bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                    } else if (genreName === 'war') {
                        bgClass = 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300';
                    } else if (genreName === 'western') {
                        bgClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
                    }
                    
                    return `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full ${bgClass}">${genre.trim()}</span>`;
                }).join(' ');
                
                // Add +X more if there are more than 2 genres
                let genresHTML = genres;
                const genreCount = movie.genres.split('|').length;
                if (genreCount > 2) {
                    genresHTML += `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-dark-500 text-gray-600 dark:text-gray-300">+${genreCount - 2}</span>`;
                }
                
                // Yıl bilgisi (varsa)
                const yearMatch = movie.title.match(/\((\d{4})\)/);
                const year = yearMatch ? yearMatch[1] : '';
                let titleWithoutYear = movie.title;
                if (yearMatch) {
                    titleWithoutYear = movie.title.replace(/\s*\(\d{4}\)\s*/, '');
                }
                
                // Gecikme efekti için animasyon sınıfı
                const animationDelay = `animation-delay: ${index * 50}ms`;
                
                html += `
                    <div class="flex items-center p-4 border-b border-gray-200 dark:border-dark-500 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-500 transition-all duration-300 cursor-pointer animate-fadeIn" 
                         onclick="getRecommendations('${movie.title}')" style="${animationDelay}">
                        <div class="flex items-center gap-4 w-full">
                            <div class="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden shadow-md">
                                <img src="${movie.poster_url}" alt="${movie.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">${titleWithoutYear}</h3>
                                ${year ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">${year}</p>` : ''}
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${genresHTML}
                                </div>
                            </div>
                            <button class="flex-shrink-0 ml-auto p-2.5 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-400 hover:text-primary-700 dark:hover:text-primary-300 rounded-full transition-colors duration-200" title="Benzer Filmler">
                                <i class="fas fa-magic"></i>
                            </button>
                        </div>
                    </div>`;
            });
            html += '</div>';
            $('#searchResults').html(html);
            $('#searchResults').show();
        }
    });
}

/**
 * Buton tıklamaları için kullanılan ana arama fonksiyonu
 */
function searchMovies() {
    performSearch();
}

/**
 * Seçilen filme benzer filmleri getiren fonksiyon
 * @param {string} movieTitle - Film başlığı
 */
function getRecommendations(movieTitle) {
    // Tıklanan butonu bul ve yükleme durumunu göster
    const clickedButton = event.target.closest('button');
    const originalButtonHtml = clickedButton.innerHTML;
    clickedButton.classList.add('btn-loading');
    clickedButton.innerHTML = '<span class="btn-text">Yükleniyor...</span>';

    // Yükleniyor animasyonu göster
    $('#recommendationsList').html('<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>');
    $('#recommendations').show();
    
    $.ajax({
        url: '/recommend',
        method: 'POST',
        data: { movie_title: movieTitle },
        success: function(response) {
            if (response.success) {
                // Başlık alanını güncelle
                $('#recommendationsTitle').html(`
                    <h2 class="section-title">Film Önerileri</h2>
                    <div class="selected-movie-title">
                        <i class="fas fa-film"></i>
                        <span>"${movieTitle}" filmine benzer filmler</span>
                    </div>
                `);

                // Önerilen filmleri listele
                let html = '';
                response.recommendations.forEach(movie => {
                    const genres = movie.genres.split('|').slice(0, 2).map(genre => {
                        const genreName = genre.trim().toLowerCase();
                        let bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                        
                        if (genreName === 'action') {
                            bgClass = 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400';
                        } else if (genreName === 'adventure') {
                            bgClass = 'bg-amber-100 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400';
                        } else if (genreName === 'animation') {
                            bgClass = 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400';
                        } else if (genreName === 'comedy') {
                            bgClass = 'bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400';
                        } else if (genreName === 'crime') {
                            bgClass = 'bg-violet-100 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400';
                        } else if (genreName === 'documentary') {
                            bgClass = 'bg-cyan-100 text-cyan-500 dark:bg-cyan-900/20 dark:text-cyan-400';
                        } else if (genreName === 'drama') {
                            bgClass = 'bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400';
                        } else if (genreName === 'family') {
                            bgClass = 'bg-lime-100 text-lime-500 dark:bg-lime-900/20 dark:text-lime-400';
                        } else if (genreName === 'fantasy') {
                            bgClass = 'bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400';
                        } else if (genreName === 'history') {
                            bgClass = 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300';
                        } else if (genreName === 'horror') {
                            bgClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
                        } else if (genreName === 'music') {
                            bgClass = 'bg-pink-100 text-pink-400 dark:bg-pink-900/20 dark:text-pink-300';
                        } else if (genreName === 'mystery') {
                            bgClass = 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300';
                        } else if (genreName === 'romance') {
                            bgClass = 'bg-red-100 text-red-400 dark:bg-red-900/20 dark:text-red-300';
                        } else if (genreName === 'sci-fi' || genreName === 'science fiction') {
                            bgClass = 'bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400';
                        } else if (genreName === 'thriller') {
                            bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                        } else if (genreName === 'war') {
                            bgClass = 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300';
                        } else if (genreName === 'western') {
                            bgClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
                        }
                        
                        return `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full ${bgClass}">${genre.trim()}</span>`;
                    }).join(' ');
                    
                    // Add +X more if there are more than 2 genres
                    let genresHTML = genres;
                    const genreCount = movie.genres.split('|').length;
                    if (genreCount > 2) {
                        genresHTML += `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-dark-500 text-gray-600 dark:text-gray-300">+${genreCount - 2}</span>`;
                    }

                    html += `
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="movie-item group">
                                <div class="relative bg-white dark:bg-dark-600 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                                    <div class="relative aspect-[2/3] overflow-hidden">
                                        <img src="${movie.poster_url}" alt="${movie.title}" 
                                             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium py-0.5 px-1.5 rounded-full">
                                            ${movie.title.match(/\((\d{4})\)/)?.[1] || ''}
                                        </div>
                                        <div class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onclick="getRecommendations('${movie.title}')" 
                                                class="bg-primary-600/90 hover:bg-primary-700 text-white p-2 rounded-full transform transition-transform duration-300 hover:scale-110"
                                                title="Benzer Filmler">
                                                <i class="fas fa-magic"></i>
                                            </button>
                                            <a href="/movie/${encodeURIComponent(movie.title)}" 
                                               class="bg-secondary-600/90 hover:bg-secondary-700 text-white p-2 rounded-full transform transition-transform duration-300 hover:scale-110"
                                               title="Film Detayları">
                                                <i class="fas fa-info-circle"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="p-3 flex flex-col flex-grow">
                                        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                                            ${movie.title}
                                        </h3>
                                        <div class="flex flex-wrap gap-0.5 mb-3">
                                            ${genresHTML}
                                        </div>
                                        <div class="mt-auto flex gap-1">
                                            <button class="flex-1 py-1.5 px-2 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1" onclick="getRecommendations('${movie.title}')">
                                                <i class="fas fa-magic"></i>
                                                <span>Benzer</span>
                                            </button>
                                            <a href="/movie/${encodeURIComponent(movie.title)}" class="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-dark-500 hover:bg-gray-300 dark:hover:bg-dark-400 text-gray-800 dark:text-gray-200 text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1">
                                                <i class="fas fa-info-circle"></i>
                                                <span>Detay</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                $('#recommendationsList').html(html);
                
                // Sayfayı kaydır
                $('#recommendations')[0].scrollIntoView({ behavior: 'smooth' });
                
                // Arama alanını temizle
                $('#searchResults').empty();
                $('#searchInput').val('');
            } else {
                alert('Film önerileri alınırken bir hata oluştu: ' + response.error);
            }
        },
        error: function() {
            alert('Film önerileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
        },
        complete: function() {
            // Butonu eski haline getir
            clickedButton.classList.remove('btn-loading');
            clickedButton.innerHTML = originalButtonHtml;
        }
    });
}

// Film sayacı
let movieOffset = 12;

// Dark Mode Toggle Fonksiyonu
function toggleDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }
}

// Dark Mode'u localStorage'dan yükle
function loadDarkModePreference() {
    // Sistem tercihi dark mode ise veya daha önce dark mode'u seçtiyse
    if (localStorage.getItem('darkMode') === 'true' || 
       (localStorage.getItem('darkMode') === null && 
        window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    }
}

// Document ready: Sayfa yüklendiğinde olay dinleyicilerini ekle
$(document).ready(function() {
    // Dark mode tercihini yükle
    loadDarkModePreference();
    
    // Dark mode butonuna tıklama olayı
    $('#themeToggle').on('click', toggleDarkMode);
    
    // Arama kutusu için olay dinleyici
    $('#searchInput').on('keyup', searchMoviesDebounced);
    
    // Arama sonuçları dışında bir yere tıklandığında sonuçları gizle
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#searchInput, #searchResults, .search-button').length) {
            $('#searchResults').hide();
        }
    });
});

/**
 * Film detay sayfasına gitme fonksiyonu
 * @param {string} movieTitle - Film başlığı
 */
function getMovieDetails(movieTitle) {
    window.location.href = `/movie/${encodeURIComponent(movieTitle)}`;
}

/**
 * Daha fazla film yükleme fonksiyonu
 */
function loadMoreMovies() {
    const loadMoreBtn = $('.load-more .btn');
    loadMoreBtn.prop('disabled', true);
    loadMoreBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Yükleniyor...');

    $.ajax({
        url: '/load_more',
        method: 'POST',
        data: { offset: movieOffset },
        success: function(response) {
            if (response.success) {
                // Yeni filmleri ekle
                response.movies.forEach(movie => {
                    const genres = movie.genres.split('|').slice(0, 2).map(genre => {
                        const genreName = genre.trim().toLowerCase();
                        let bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                        
                        if (genreName === 'action') {
                            bgClass = 'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400';
                        } else if (genreName === 'adventure') {
                            bgClass = 'bg-amber-100 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400';
                        } else if (genreName === 'animation') {
                            bgClass = 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400';
                        } else if (genreName === 'comedy') {
                            bgClass = 'bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400';
                        } else if (genreName === 'crime') {
                            bgClass = 'bg-violet-100 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400';
                        } else if (genreName === 'documentary') {
                            bgClass = 'bg-cyan-100 text-cyan-500 dark:bg-cyan-900/20 dark:text-cyan-400';
                        } else if (genreName === 'drama') {
                            bgClass = 'bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400';
                        } else if (genreName === 'family') {
                            bgClass = 'bg-lime-100 text-lime-500 dark:bg-lime-900/20 dark:text-lime-400';
                        } else if (genreName === 'fantasy') {
                            bgClass = 'bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400';
                        } else if (genreName === 'history') {
                            bgClass = 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300';
                        } else if (genreName === 'horror') {
                            bgClass = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
                        } else if (genreName === 'music') {
                            bgClass = 'bg-pink-100 text-pink-400 dark:bg-pink-900/20 dark:text-pink-300';
                        } else if (genreName === 'mystery') {
                            bgClass = 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300';
                        } else if (genreName === 'romance') {
                            bgClass = 'bg-red-100 text-red-400 dark:bg-red-900/20 dark:text-red-300';
                        } else if (genreName === 'sci-fi' || genreName === 'science fiction') {
                            bgClass = 'bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400';
                        } else if (genreName === 'thriller') {
                            bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                        } else if (genreName === 'war') {
                            bgClass = 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300';
                        } else if (genreName === 'western') {
                            bgClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
                        }
                        
                        return `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full ${bgClass}">${genre.trim()}</span>`;
                    }).join(' ');
                    
                    // Add +X more if there are more than 2 genres
                    let genresHTML = genres;
                    const genreCount = movie.genres.split('|').length;
                    if (genreCount > 2) {
                        genresHTML += `<span class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-dark-500 text-gray-600 dark:text-gray-300">+${genreCount - 2}</span>`;
                    }

                    const movieHtml = `
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="movie-item group">
                                <div class="relative bg-white dark:bg-dark-600 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                                    <div class="relative aspect-[2/3] overflow-hidden">
                                        <img src="${movie.poster_url}" alt="${movie.title}" 
                                             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <div class="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium py-0.5 px-1.5 rounded-full">
                                            ${movie.title.match(/\((\d{4})\)/)?.[1] || ''}
                                        </div>
                                        <div class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onclick="getRecommendations('${movie.title}')" 
                                                class="bg-primary-600/90 hover:bg-primary-700 text-white p-2 rounded-full transform transition-transform duration-300 hover:scale-110"
                                                title="Benzer Filmler">
                                                <i class="fas fa-magic"></i>
                                            </button>
                                            <a href="/movie/${encodeURIComponent(movie.title)}" 
                                               class="bg-secondary-600/90 hover:bg-secondary-700 text-white p-2 rounded-full transform transition-transform duration-300 hover:scale-110"
                                               title="Film Detayları">
                                                <i class="fas fa-info-circle"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="p-3 flex flex-col flex-grow">
                                        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                                            ${movie.title}
                                        </h3>
                                        <div class="flex flex-wrap gap-0.5 mb-3">
                                            ${genresHTML}
                                        </div>
                                        <div class="mt-auto flex gap-1">
                                            <button class="flex-1 py-1.5 px-2 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1" onclick="getRecommendations('${movie.title}')">
                                                <i class="fas fa-magic"></i>
                                                <span>Benzer</span>
                                            </button>
                                            <a href="/movie/${encodeURIComponent(movie.title)}" class="flex-1 py-1.5 px-2 bg-gray-200 dark:bg-dark-500 hover:bg-gray-300 dark:hover:bg-dark-400 text-gray-800 dark:text-gray-200 text-xs rounded transition-colors duration-200 flex items-center justify-center gap-1">
                                                <i class="fas fa-info-circle"></i>
                                                <span>Detay</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    $('#popularMovies').append(movieHtml);
                });

                // Film sayacını güncelle
                movieOffset += response.movies.length;

                // Daha fazla film varsa butonu aktif et, yoksa gizle
                if (response.has_more) {
                    loadMoreBtn.prop('disabled', false);
                    loadMoreBtn.html('<i class="fas fa-plus-circle"></i> Daha Fazla Film');
                } else {
                    $('.load-more').hide();
                }
            }
        },
        error: function() {
            loadMoreBtn.prop('disabled', false);
            loadMoreBtn.html('<i class="fas fa-plus-circle"></i> Daha Fazla Film');
            alert('Filmler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
} 