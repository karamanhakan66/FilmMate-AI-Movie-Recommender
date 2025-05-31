"""
TMDB API anahtarı yönetimi için yardımcı fonksiyonlar
"""

import os
import json
from pathlib import Path

API_CONFIG_FILE = "api_config.json"

def get_api_key():
    """
    Kaydedilmiş TMDB API anahtarını döndürür
    Eğer yoksa None döndürür
    """
    config_path = Path(API_CONFIG_FILE)
    if not config_path.exists():
        return None
    
    try:
        with open(config_path, 'r') as file:
            config = json.load(file)
            return config.get('tmdb_api_key')
    except (json.JSONDecodeError, IOError):
        # Dosya okunamazsa veya geçerli JSON değilse
        return None

def save_api_key(api_key):
    """
    TMDB API anahtarını kaydeder
    """
    config = {'tmdb_api_key': api_key}
    
    with open(API_CONFIG_FILE, 'w') as file:
        json.dump(config, file)
    
    return True

def is_api_key_valid(api_key):
    """
    API anahtarının geçerli olup olmadığını test eder
    """
    import requests
    
    if not api_key or api_key.strip() == "":
        return False
    
    # TMDB API'sinden basit bir istek yaparak test et
    test_url = f"https://api.themoviedb.org/3/movie/550?api_key={api_key}"
    
    try:
        response = requests.get(test_url)
        return response.status_code == 200
    except:
        return False
