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

def get_recommendations(movie_title, movies_df, genre_matrix, limit=20, min_similarity=0.4):
    """
    Belirli bir filme benzer filmleri bulur
    
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
    movie_scores = sorted(movie_scores, key=lambda x: x[1], reverse=True)
    
    # Minimum benzerlik skorunu uygula
    movie_scores = [(i, score) for i, score in movie_scores if score >= min_similarity]
    
    # İlk limit kadar filmi al
    movie_scores = movie_scores[:limit]
    movie_indices = [i[0] for i in movie_scores]
    
    recommendations = movies_df.iloc[movie_indices][['title', 'genres']]
    recommendations['similarity'] = [score for _, score in movie_scores]
    
    # Yıl bazlı benzerlik ayarlaması
    recommendations['temp_year'] = recommendations['title'].apply(
        lambda x: int(x.split('(')[-1].strip(')')) if '(' in x else 2000
    )
    
    recommendations['similarity'] = recommendations.apply(
        lambda x: x['similarity'] * (1 - min(abs(movie_year - x['temp_year']) * 0.01, 0.5)), 
        axis=1
    )
    
    recommendations = recommendations.drop('temp_year', axis=1)
    recommendations = recommendations.sort_values('similarity', ascending=False)
    
    return recommendations 