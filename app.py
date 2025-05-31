"""
FilmMate - Film Öneri Sistemi
Flask tabanlı web uygulaması
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from functools import wraps
from movie_recommender import load_movies, create_genre_matrix, get_recommendations
import requests
import os
from api_manager import get_api_key, save_api_key, is_api_key_valid

# TMDB API için sabit değerler
TMDB_BASE_URL = "https://api.themoviedb.org/3"
POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Session için gerekli

# API anahtarının varlığını kontrol eden decorator
def api_key_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Session'da API anahtarı var mı kontrol et
        tmdb_api_key = session.get('tmdb_api_key')
        if not tmdb_api_key:
            # Config dosyasından API anahtarını almayı dene
            tmdb_api_key = get_api_key()
            if tmdb_api_key:
                # API anahtarını session'a kaydet
                session['tmdb_api_key'] = tmdb_api_key
            else:
                # API anahtarı yoksa, form sayfasına yönlendir
                return redirect(url_for('api_setup'))
        return f(*args, **kwargs)
    return decorated_function

# API Anahtarı Form Sayfası
@app.route('/api-setup')
def api_setup():
    # Eğer zaten geçerli API anahtarı varsa ana sayfaya yönlendir
    tmdb_api_key = session.get('tmdb_api_key') or get_api_key()
    if tmdb_api_key and is_api_key_valid(tmdb_api_key):
        session['tmdb_api_key'] = tmdb_api_key
        return redirect(url_for('home'))
    
    return render_template('api_setup.html', error=request.args.get('error'))

# API Anahtarını Kaydet
@app.route('/save-api', methods=['POST'])
def save_api():
    api_key = request.form.get('api_key', '').strip()
    
    if not api_key:
        return redirect(url_for('api_setup', error="API anahtarı boş olamaz!"))
    
    # API anahtarının geçerliliğini kontrol et
    if not is_api_key_valid(api_key):
        return redirect(url_for('api_setup', error="Geçersiz API anahtarı! Lütfen doğru anahtarı girdiğinizden emin olun."))
    
    # API anahtarını kaydet
    save_api_key(api_key)
    session['tmdb_api_key'] = api_key
    
    # Ana sayfaya yönlendir
    return redirect(url_for('home'))

def get_tmdb_api_key():
    """
    Session'dan veya kayıtlı yerden API anahtarını al
    """
    return session.get('tmdb_api_key') or get_api_key()

def find_best_movie_match(title):
    """
    TMDB API'den film bilgisini bulmak için en iyi eşleşmeyi döndür
    """
    try:
        # API anahtarını al
        tmdb_api_key = get_tmdb_api_key()
        if not tmdb_api_key:
            return None
            
        # Film adından yılı çıkar
        movie_name = title.split('(')[0].strip()
        year = None
        
        # Yılı al (varsa)
        if '(' in title and ')' in title:
            try:
                year = int(title.split('(')[1].split(')')[0])
            except:
                pass

        # Film adını temizle
        movie_name = movie_name.replace(':', '').replace('-', ' ').strip()
        
        # TMDB'de film ara
        search_url = f"{TMDB_BASE_URL}/search/movie"
        response = requests.get(search_url, params={
            'api_key': tmdb_api_key,
            'query': movie_name,
            'language': 'tr-TR',
            'include_adult': 'false'
        })
        
        if response.status_code != 200:
            print(f"API Hatası: {response.status_code}")
            return None
        
        data = response.json()
        
        if not data['results']:
            # Türkçe aramada sonuç bulunamazsa İngilizce dene
            response = requests.get(search_url, params={
                'api_key': tmdb_api_key,
                'query': movie_name,
                'language': 'en-US',
                'include_adult': 'false'
            })
            data = response.json()
            
        if not data['results']:
            print(f"Film bulunamadı: {movie_name}")
            return None
            
        # En iyi eşleşmeyi bul
        best_match = None
        highest_score = 0
        
        for movie in data['results']:
            score = 0
            movie_title_lower = movie['title'].lower()
            movie_name_lower = movie_name.lower()
            
            # Başlık benzerliği kontrolü
            if movie_title_lower == movie_name_lower:
                score += 3
            elif movie_name_lower in movie_title_lower:
                score += 2
            elif any(word in movie_title_lower.split() for word in movie_name_lower.split()):
                score += 1
                
            # Yıl kontrolü
            if year and movie.get('release_date'):
                movie_year = int(movie['release_date'].split('-')[0])
                if movie_year == year:
                    score += 3
                elif abs(movie_year - year) <= 1:
                    score += 2
                elif abs(movie_year - year) <= 2:
                    score += 1
                    
            # Popülerlik kontrolü
            if movie.get('popularity', 0) > 20:
                score += 1
                    
            if score > highest_score:
                highest_score = score
                best_match = movie
        
        return best_match
            
    except Exception as e:
        print(f"Hata oluştu: {str(e)} - Film: {title}")
        return None

def get_movie_poster(title):
    """
    TMDB API'den film posterini al
    """
    best_match = find_best_movie_match(title)
    
    if best_match and best_match.get('poster_path'):
        poster_url = POSTER_BASE_URL + best_match['poster_path']
        return poster_url
        
    return "/static/default-movie.jpg"

def get_movie_details(title):
    """
    TMDB API'den film detaylarını al (açıklama, puan, yapım yılı vb.)
    """
    best_match = find_best_movie_match(title)
    
    if not best_match:
        return {
            'description': 'Bu film için açıklama bulunamadı.',
            'vote_average': 0,
            'runtime': 0,
            'release_date': ''
        }
    
    # API anahtarını al
    tmdb_api_key = get_tmdb_api_key()
    if not tmdb_api_key:
        return {
            'description': 'API anahtarı bulunamadı. Lütfen API anahtarınızı kaydedin.',
            'vote_average': 0,
            'runtime': 0,
            'release_date': ''
        }
    
    # Film ID'sini kullanarak detay bilgilerini al
    movie_id = best_match['id']
    details_url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    
    try:
        # Önce Türkçe dene
        response = requests.get(details_url, params={
            'api_key': tmdb_api_key,
            'language': 'tr-TR',
            'append_to_response': 'credits'
        })
        
        if response.status_code != 200:
            return {
                'description': 'Bu film için açıklama bulunamadı.',
                'vote_average': 0,
                'runtime': 0,
                'release_date': ''
            }
        
        details = response.json()
        
        # Eğer Türkçe açıklama yoksa İngilizce dene
        if not details.get('overview'):
            response = requests.get(details_url, params={
                'api_key': tmdb_api_key,
                'language': 'en-US',
                'append_to_response': 'credits'
            })
            
            if response.status_code == 200:
                details = response.json()
        
        return {
            'description': details.get('overview', 'Bu film için açıklama bulunamadı.'),
            'vote_average': details.get('vote_average', 0),
            'runtime': details.get('runtime', 0),
            'release_date': details.get('release_date', ''),
            'tmdb_id': movie_id
        }
        
    except Exception as e:
        print(f"Film detayları alınırken hata oluştu: {str(e)} - Film: {title}")
        return {
            'description': 'Bu film için açıklama bulunamadı.',
            'vote_average': 0,
            'runtime': 0,
            'release_date': ''
        }

# Veri setini ve modeli yükle
movies_df = load_movies('data/movies.csv')
genre_matrix, cv = create_genre_matrix(movies_df)

@app.route('/')
@api_key_required
def home():
    """
    Ana sayfa
    Popüler filmleri gösterir (ilk 12 film)
    """
    sample_movies = movies_df.head(12).to_dict('records')
    # Her film için poster URL'si ekle
    for movie in sample_movies:
        movie['poster_url'] = get_movie_poster(movie['title'])
    return render_template('index.html', movies=sample_movies)

@app.route('/recommend', methods=['POST'])
@api_key_required
def recommend():
    """
    Film önerisi endpoint'i
    Seçilen filme benzer filmleri döndürür
    """
    movie_title = request.form['movie_title']
    
    try:
        recommendations = get_recommendations(
            movie_title, 
            movies_df, 
            genre_matrix, 
            limit=20,
            min_similarity=0.4
        )
        recommendations_dict = recommendations.to_dict('records')
        
        # Her öneri için poster URL'si ekle
        for movie in recommendations_dict:
            movie['poster_url'] = get_movie_poster(movie['title'])
            
        return jsonify({
            'success': True,
            'recommendations': recommendations_dict
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/search', methods=['POST'])
@api_key_required
def search():
    """
    Film arama endpoint'i
    Girilen metne göre film araması yapar
    """
    query = request.form['query'].lower()
    matching_movies = movies_df[movies_df['title'].str.lower().str.contains(query)]
    results = matching_movies.head(10).to_dict('records')
    # Her sonuç için poster URL'si ekle
    for movie in results:
        movie['poster_url'] = get_movie_poster(movie['title'])
    return jsonify(results)

@app.route('/load_more', methods=['POST'])
@api_key_required
def load_more():
    """
    Daha fazla film yükleme endpoint'i
    """
    offset = int(request.form.get('offset', 0))
    limit = 12  # Her seferinde 12 film yükle
    
    # Belirtilen konumdan filmleri al
    more_movies = movies_df.iloc[offset:offset+limit].to_dict('records')
    
    # Her film için poster URL'si ekle
    for movie in more_movies:
        movie['poster_url'] = get_movie_poster(movie['title'])
    
    return jsonify({
        'success': True,
        'movies': more_movies,
        'has_more': offset + limit < len(movies_df)
    })

@app.route('/movie/<movie_title>')
@api_key_required
def movie_detail(movie_title):
    """
    Film detay sayfası
    Seçilen filmin detaylarını ve benzer filmleri gösterir
    """
    try:
        # Film adına göre veri setinde film bulma
        movie = movies_df[movies_df['title'] == movie_title].iloc[0].to_dict()
        
        # Film poster URL'si ekle
        movie['poster_url'] = get_movie_poster(movie['title'])
        
        # TMDB'den film detaylarını al (açıklama, puan vb.)
        movie_details = get_movie_details(movie['title'])
        
        # Detayları movie sözlüğüne ekle
        movie.update(movie_details)
        
        # Benzer filmleri al
        similar_movies = get_recommendations(
            movie_title, 
            movies_df, 
            genre_matrix, 
            limit=8,  # Detay sayfasında daha az benzer film gösteriyoruz
            min_similarity=0.3
        ).to_dict('records')
        
        # Her benzer film için poster URL'si ve detayları ekle
        for similar in similar_movies:
            similar['poster_url'] = get_movie_poster(similar['title'])
        
        return render_template('movie_detail.html', movie=movie, similar_movies=similar_movies)
    
    except (IndexError, KeyError):
        # Film bulunamadı
        return render_template('404.html', message=f'"{movie_title}" filmi bulunamadı.'), 404

if __name__ == '__main__':
    app.run(debug=True)