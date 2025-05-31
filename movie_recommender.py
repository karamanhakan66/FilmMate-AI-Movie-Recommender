"""
Film Öneri Sistemi - Temel Fonksiyonlar
Bu modül, film önerilerini hesaplamak için gerekli fonksiyonları içerir.
Tür benzerliğine dayalı bir öneri sistemi kullanır.
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_movies(file_path='data/movies.csv'):
    """
    Film veri setini yükler
    
    Args:
        file_path (str): Film veri seti CSV dosyasının yolu
        
    Returns:
        pandas.DataFrame: Yüklenen film veri seti
    """
    movies_df = pd.read_csv(file_path)
    return movies_df

def create_genre_matrix(movies_df):
    """
    Film türlerinden bir özellik matrisi oluşturur
    
    Args:
        movies_df (pandas.DataFrame): Film veri seti
        
    Returns:
        tuple: (genre_matrix, CountVectorizer)
            - genre_matrix: Film türlerinin vektörleştirilmiş matrisi
            - cv: Kullanılan CountVectorizer nesnesi
    """
    # Tür bilgilerini düzenle
    movies_df['genres_str'] = movies_df['genres'].str.replace('(no genres listed)', 'no_genres')
    movies_df['genres_str'] = movies_df['genres_str'].str.replace('|', ' ')
    
    # Türleri vektörleştir
    cv = CountVectorizer(token_pattern=r'[a-zA-Z\-_]+')
    genre_matrix = cv.fit_transform(movies_df['genres_str'])
    return genre_matrix, cv

def get_recommendations(movie_title, movies_df, genre_matrix, limit=20, min_similarity=0.3):
    """
    Belirli bir filme benzer filmleri bulur ve çeşitlilik için rastgelelik ekler
    
    Args:
        movie_title (str): Öneri istenilen filmin başlığı
        movies_df (pandas.DataFrame): Film veri seti
        genre_matrix: Film türlerinin vektörleştirilmiş matrisi
        limit (int): Getirilecek film sayısı
        min_similarity (float): Minimum benzerlik skoru (0-1 arası)
        
    Returns:
        pandas.DataFrame: Önerilen filmler ve benzerlik skorları
    """
    # Seçilen filmin indeksini bul
    idx = movies_df[movies_df['title'] == movie_title].index[0]
    movie_vector = genre_matrix[idx:idx+1]
    
    # Kosinüs benzerliğini hesapla
    sim_scores = cosine_similarity(movie_vector, genre_matrix).flatten()
    
    # Film yılını çıkar (varsa)
    try:
        movie_year = int(movies_df.iloc[idx]['title'].split('(')[-1].strip(')'))
    except:
        movie_year = 2000
    
    # Tüm filmleri benzerlik skorlarıyla birlikte al
    movie_scores = list(enumerate(sim_scores))
    
    # Kendisini hariç tut ve sırala
    movie_scores = [(i, score) for i, score in movie_scores if i != idx]
    
    # Minimum benzerlik skorunu uygula
    movie_scores = [(i, score) for i, score in movie_scores if score >= min_similarity]
    
    # Çeşitlilik için daha fazla film alıp sonra filtreleyelim
    expanded_limit = min(limit * 3, len(movie_scores))
    movie_scores = sorted(movie_scores, key=lambda x: x[1], reverse=True)[:expanded_limit]
    
    # Çeşitlilik için film indekslerini ve türlerini al
    movie_indices = [i[0] for i in movie_scores]
    selected_movies = movies_df.iloc[movie_indices][['title', 'genres']].copy()
    
    # Benzerlik skorlarını ekle
    selected_movies['similarity'] = [score for _, score in movie_scores]
    
    # Yıl bazlı benzerlik ayarlaması (daha etkili)
    selected_movies['temp_year'] = selected_movies['title'].apply(
        lambda x: int(x.split('(')[-1].strip(')')) if '(' in x else 2000
    )
    
    # Yıl benzerliğini daha fazla etkili yap
    selected_movies['year_factor'] = selected_movies['temp_year'].apply(
        lambda x: max(0.2, 1 - min(abs(movie_year - x) * 0.02, 0.8))
    )
    
    # Çeşitlilik için rastgele faktör ekle (0.7-1.0 arası)
    np.random.seed(None)  # Rastgeleliği sağla
    selected_movies['diversity_factor'] = np.random.uniform(0.7, 1.0, size=len(selected_movies))
    
    # Nihai benzerlik skoru hesapla (tür benzerliği * yıl faktörü * çeşitlilik faktörü)
    selected_movies['final_similarity'] = selected_movies.apply(
        lambda x: x['similarity'] * x['year_factor'] * x['diversity_factor'], 
        axis=1
    )
    
    # Geçici sütunları kaldır ve final skorla sırala
    selected_movies = selected_movies.drop(['temp_year', 'year_factor', 'diversity_factor'], axis=1)
    selected_movies = selected_movies.sort_values('final_similarity', ascending=False)
    
    # Limit sayıda film döndür
    recommendations = selected_movies.head(limit).rename(columns={'final_similarity': 'similarity'})
    
    return recommendations