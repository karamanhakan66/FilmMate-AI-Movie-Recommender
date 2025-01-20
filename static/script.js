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
 * Film arama fonksiyonu
 * Minimum 2 karakter gerektirir
 */
const searchMovies = debounce(() => {
    const query = $('#searchInput').val();
    if (query.length < 2) {
        $('#searchResults').empty();
        return;
    }

    $.ajax({
        url: '/search',
        method: 'POST',
        data: { query: query },
        success: function(movies) {
            let html = '<div class="list-group">';
            movies.forEach(movie => {
                const genres = movie.genres.split('|').map(genre => {
                    const genreClass = genre.trim().toLowerCase().replace(/\s+/g, '-');
                    return `<span class="badge genre-${genreClass}">${genre.trim()}</span>`;
                }).join(' ');
                
                html += `
                    <div class="list-group-item list-group-item-action" 
                         onclick="getRecommendations('${movie.title}')">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${movie.poster_url}" alt="${movie.title}" class="search-result-poster">
                            <div>
                                <h6 class="mb-1">${movie.title}</h6>
                                <div class="mt-2">
                                    ${genres}
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            html += '</div>';
            $('#searchResults').html(html);
        }
    });
}, 300); // 300ms gecikme

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
                    const genres = movie.genres.split('|');
                    const hasMoreGenres = genres.length > 4;
                    const visibleGenres = genres.slice(0, 4).map(genre => {
                        const genreClass = genre.trim().toLowerCase().replace(/\s+/g, '-');
                        return `<span class="badge genre-${genreClass}">${genre.trim()}</span>`;
                    }).join(' ');

                    html += `
                        <div class="movie-card">
                            <div class="movie-poster">
                                <img src="${movie.poster_url}" alt="${movie.title}" class="img-fluid">
                            </div>
                            <div class="movie-content">
                                <h5 class="movie-title">${movie.title}</h5>
                                <div class="movie-genres ${hasMoreGenres ? 'has-more' : ''}">
                                    ${visibleGenres}
                                </div>
                                <button class="btn btn-primary mt-auto" onclick="getRecommendations('${movie.title}')">
                                    <i class="fas fa-magic"></i> Benzer Filmler
                                </button>
                            </div>
                        </div>`;
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

// Enter tuşu ile arama tetikleme
$('#searchInput').keyup(function(e) {
    searchMovies();
});

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
                    const genres = movie.genres.split('|').map(genre => {
                        const genreClass = genre.trim().toLowerCase().replace(/\s+/g, '-');
                        return `<span class="badge genre-${genreClass}">${genre.trim()}</span>`;
                    }).join('');

                    const movieHtml = `
                        <div class="col-md-4 col-lg-3">
                            <div class="movie-card">
                                <div class="movie-poster">
                                    <img src="${movie.poster_url}" alt="${movie.title}" class="img-fluid">
                                </div>
                                <div class="movie-content">
                                    <h5 class="movie-title">${movie.title}</h5>
                                    <div class="movie-genres">
                                        ${genres}
                                    </div>
                                    <button class="btn btn-primary mt-auto" onclick="getRecommendations('${movie.title}')">
                                        <i class="fas fa-magic"></i> Benzer Filmler
                                    </button>
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