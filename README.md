<div align="center">

# <img src="static/favicon.png" width="30"> FilmMate - Akıllı Film Öneri Sistemi

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0%2B-38bdf8)
![TMDB API](https://img.shields.io/badge/TMDB%20API-v3-01b4e4)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Canlı Demo
Uygulamanın canlı versiyonunu görmek için: [FilmMate AI Demo](https://filmmate-ai.onrender.com)


</div>

<div align="center">
<img src="screenshots/hero-section.png" alt="FilmMate Ana Sayfa" width="700px">
</div>

FilmMate, yapay zeka ve tür benzerliği algoritmaları kullanarak kullanıcılara özel film önerileri sunan modern bir web uygulamasıdır. TMDB API entegrasyonu ile güncel film bilgileri, posterler ve detayları sunar, kullanıcı dostu arayüzü ve sürükleyici deneyimiyle film keşfetmeyi keyifli hale getirir.

## ✨ Özellikler

- **İleri Film Önerme Algoritması:** Tür benzerliği ve yapay zeka tabanlı film önerileri
- **Akıllı Arama:** Hızlı ve etkili film arama özelliği
- **Film Detayları:** Her film için detaylı bilgiler (açıklamalar, puan, yıl)
- **Benzer Film Önerileri:** Seçilen filme benzer türdeki filmler
- **Film Posterleri:** TMDB API entegrasyonu ile yüksek kaliteli posterler
- **Modern Arayüz:** TailwindCSS ile responsive, modern ve kullanıcı dostu tasarım
- **Koyu/Açık Mod:** Göz yorgunluğunu azaltan tema seçenekleri
- **Güvenli API Yönetimi:** Kullanıcı dostu TMDB API anahtarı yönetim sistemi

## Kurulum

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/karamanhakan66/FilmMate-AI-Movie-Recommender.git
cd FilmMate-AI-Movie-Recommender
```

### 2. Sanal Ortamı Oluşturun

```bash
python -m venv venv

# Windows için:
venv\Scripts\activate

# Linux/Mac için:
source venv/bin/activate
```

### 3. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 4. TMDB API Anahtarını Alın

- [TMDB Sitesine](https://www.themoviedb.org/) üye olun
- [API Ayarları](https://www.themoviedb.org/settings/api) sayfasından ücretsiz bir API anahtarı alın
- Uygulamayı çalıştırdığınızda otomatik olarak bir API anahtarı giriş sayfası açılacaktır

<div align="center">
<img src="screenshots/api-setup.png" alt="API Kurulum Sayfası" width="500px">
</div>

### 5. Uygulamayı Çalıştırın

```bash
python app.py
```

### 6. Tarayıcıda Görüntüleyin

Tarayıcınızda `http://localhost:5000` adresini açın ve uygulamayı kullanmaya başlayın!

<div align="center">
<img src="screenshots/populer-film.png" alt="FilmMate Uygulaması" width="700px">
</div>

## Kullanım

### Ana Sayfa
Popüler filmler karşılama ekranında listelenir. Arama kutusunu kullanarak istediğiniz filmi bulabilirsiniz.

### Film Arama
Arama kutusu, siz yazdıkça sonuçları gerçek zamanlı olarak gösterir. Arama sonuçlarından bir film seçin.

<div align="center">
<img src="screenshots/hero-section.png" alt="Film Arama Özelliği" width="500px">
</div>

### Film Detayları
Seçilen filmin detayları ve benzer film önerileri görüntülenir.

<div align="center">
<img src="screenshots/film-detay.png" alt="Film Detay Sayfası" width="600px">
</div>

### Benzer Filmler
Bir filmin detay sayfasında, benzer türde filmler yapay zeka algoritması ile otomatik olarak listelenir.

<div align="center">
<img src="screenshots/benzer-film.png" alt="Benzer Filmler" width="600px">
</div>

## 💻 Teknolojiler

<div align="center">
<table>
  <tr>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/python-icon.svg" width="48" height="48" alt="Python" />
      <br>Python
    </td>
    <td align="center" width="96">
      <img src="https://techstack-generator.vercel.app/js-icon.svg" width="48" height="48" alt="JavaScript" />
      <br>JavaScript
    </td>
    <td align="center" width="96">
      <img src="https://flask.palletsprojects.com/en/2.0.x/_static/flask-icon.png" width="48" height="48" alt="Flask" />
      <br>Flask
    </td>
    <td align="center" width="96">
      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg" width="48" height="48" alt="scikit-learn" />
      <br>scikit-learn
    </td>
    <td align="center" width="96">
      <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Pandas_mark.svg" width="48" height="48" alt="pandas" />
      <br>pandas
    </td>
    <td align="center" width="96">
      <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" width="48" height="48" alt="TMDB API" />
      <br>TMDB API
    </td>
  </tr>
  <tr>
    <td align="center" width="96">
      <img src="https://tailwindcss.com/favicons/apple-touch-icon.png" width="48" height="48" alt="TailwindCSS" />
      <br>TailwindCSS
    </td>
    <td align="center" width="96">
      <img src="https://jquery.com/jquery-wp-content/themes/jquery/images/logo-jquery.png" width="48" height="48" alt="jQuery" />
      <br>jQuery
    </td>
    <td align="center" width="96">
      <img src="https://fontawesome.com/images/favicon/icon.svg" width="48" height="48" alt="Font Awesome" />
      <br>Font Awesome
    </td>
    <td align="center" width="96">
      <img src="https://www.vectorlogo.zone/logos/numpy/numpy-icon.svg" width="48" height="48" alt="NumPy" />
      <br>NumPy
    </td>
    <td align="center" width="96">
      <img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" width="48" height="48" alt="Git" />
      <br>Git
    </td>
    <td align="center" width="96">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1150px-React-icon.svg.png" width="48" height="48" alt="HTML/CSS" />
      <br>HTML/CSS
    </td>
  </tr>
</table>
</div>

### API Entegrasyonu
FilmMate, TMDB (The Movie Database) API kullanarak güncel film bilgilerine ve posterlere erişir. API anahtarı yönetim sistemi sayesinde kullanıcılar kendi API anahtarlarını güvenli bir şekilde ekleyip kullanabilirler.

## 🚀 Gelecek Özellikler

- [ ] Kullanıcı oturum açma ve kayıt sistemi
- [ ] Kişiselleştirilmiş film önerileri
- [ ] Favori film listesi oluşturma
- [ ] Film inceleme ve puanlama sistemi
- [ ] Daha gelişmiş yapay zeka algoritması
- [ ] Çoklu dil desteği

## 💪 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## 🔐 Güvenlik

- TMDB API anahtarları, `config.py` dosyasında saklanır ve bu dosya `.gitignore` ile git takibinden çıkarılmıştır.
- API anahtarları yerel olarak saklanır ve hiçbir harici kaynağa gönderilmez.
- Kullanıcı oturumlarında güvenli bir şekilde saklanır.

## 📜 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 📞 İletişim

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-karamanhakan66-black?logo=github&style=for-the-badge)](https://github.com/karamanhakan66)

</div>

### Bağlantılar

- Proje: [https://github.com/karamanhakan66/FilmMate-AI-Movie-Recommender](https://github.com/karamanhakan66/FilmMate-AI-Movie-Recommender)
- TMDB API: [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)
