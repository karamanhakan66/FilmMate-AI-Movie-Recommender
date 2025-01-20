# FilmMate - Akıllı Film Öneri Sistemi

FilmMate, kullanıcılara film önerileri sunan bir web uygulamasıdır. Tür benzerliğine dayalı öneri sistemi kullanarak, seçilen filme benzer filmler önerir.

## Özellikler

- Film arama
- Benzer film önerileri
- Tür bazlı filtreleme
- Modern ve kullanıcı dostu arayüz
- Responsive tasarım
- Film posterleri (TMDB API entegrasyonu)

## Kurulum

1. Repoyu klonlayın:

```bash
git clone https://github.com/your-username/filmmate.git
cd filmmate
```

2. Sanal ortam oluşturun ve aktifleştirin:

```bash
python -m venv venv
# Windows için:
venv\Scripts\activate
# Linux/Mac için:
source venv/bin/activate
```

3. Gerekli paketleri yükleyin:

```bash
pip install -r requirements.txt
```

4. TMDB API anahtarı alın:

- [TMDB](https://www.themoviedb.org/) sitesine üye olun
- API anahtarı alın
- `config.py` dosyası oluşturun ve API anahtarınızı ekleyin:

```python
TMDB_API_KEY = "your-api-key"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"
```

5. Uygulamayı çalıştırın:

```bash
python app.py
```

6. Tarayıcınızda şu adresi açın: `http://localhost:5000`

## Teknolojiler

- Python
- Flask
- scikit-learn
- pandas
- TMDB API
- Bootstrap
- jQuery
- Font Awesome

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## İletişim

FilmMate-AI-Movie-Recommender

Project Link: [https://github.com/your-username/filmmate](https://github.com/your-username/filmmate)
