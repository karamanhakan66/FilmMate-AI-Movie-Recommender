"""
FilmMate - Film Öneri Sistemi
Flask tabanlı web uygulaması
"""

from flask import Flask, render_template, request, jsonify
from movie_recommender import load_movies, create_genre_matrix, get_recommendations
import requests
from config import TMDB_API_KEY, TMDB_BASE_URL, POSTER_BASE_URL

app = Flask(__name__)

def get_movie_poster(title):
    """
    TMDB API'den film posterini al
    """
    try:
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
            'api_key': TMDB_API_KEY,
            'query': movie_name,
            'language': 'tr-TR',
            'include_adult': 'false'
        })
        
        if response.status_code != 200:
            print(f"API Hatası: {response.status_code}")
            return "/static/default-movie.jpg"
        
        data = response.json()
        
        if not data['results']:
            # Türkçe aramada sonuç bulunamazsa İngilizce dene
            response = requests.get(search_url, params={
                'api_key': TMDB_API_KEY,
                'query': movie_name,
                'language': 'en-US',
                'include_adult': 'false'
            })
            data = response.json()
            
        if not data['results']:
            print(f"Film bulunamadı: {movie_name}")
            return "/static/default-movie.jpg"
            
        # En iyi eşleşmeyi bul
        best_match = None
        highest_score = 0
        
        for movie in data['results']:
            if not movie.get('poster_path'):
                continue
                
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
        
        if best_match and best_match.get('poster_path'):
            poster_url = POSTER_BASE_URL + best_match['poster_path']
            print(f"Poster bulundu: {movie_name} ({year if year else 'Yıl yok'}) -> {best_match['title']} ({best_match.get('release_date', 'Tarih yok')})")
            return poster_url
            
        print(f"Uygun poster bulunamadı: {movie_name}")
        return "/static/default-movie.jpg"
            
    except Exception as e:
        print(f"Hata oluştu: {str(e)} - Film: {title}")
        return "/static/default-movie.jpg"

# Veri setini ve modeli yükle
movies_df = load_movies('data/movies.csv')
genre_matrix, cv = create_genre_matrix(movies_df)

@app.route('/')
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

if __name__ == '__main__':
    app.run(debug=True) 