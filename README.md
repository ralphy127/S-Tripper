# Dokumentacja Projektu:

**Link do wersji live:** https://s-tripper-frontend.onrender.com

---

## 1. Temat i cel projektu
Aplikacja internetowa typu **Trip Planner & Expense Tracker**. System służy do organizacji wyjazdów grupowych, zarządzania listą uczestników oraz – co kluczowe – monitorowania budżetu i rozliczania kosztów wspólnych.

Głównym problemem rozwiązywanym przez aplikację jest automatyzacja rozliczeń między znajomymi ("kto za kogo zapłacił") oraz wizualizacja bilansu wydatków w czasie rzeczywistym.

---

## 2. Realizacja wymagań technologicznych

Projekt został zrealizowany wykorzystując architekturę SPA z komunikacją w stylu REST.

### A. Architektura i wzorce
* **Klient (Frontend):** Aplikacja SPA zrealizowana w bibliotece **React** (JavaScript).
* **Serwer (Backend):** REST API zrealizowane w języku **Python** (framework **FastAPI**).
* **Komunikacja:** Asynchroniczna wymiana danych w formacie JSON przy użyciu API Fetch.
* **Hosting:** Rozwiązanie chmurowe **Render.com** (osobne serwisy dla bazy, backendu i frontendu).

### B. Baza danych
Wykorzystano relacyjną bazę danych **PostgreSQL**.
* Zastosowano mapowanie obiektowo-relacyjne (ORM) przy użyciu biblioteki **SQLAlchemy**.
* Relacje: 
    * `One-to-Many` (Użytkownik -> Wycieczki),
    * `Many-to-Many` (Uczestnicy wycieczek),
    * `One-to-Many` (Wycieczka -> Wydatki).

### C. Uwierzytelnianie i Autoryzacja
Zaimplementowano bezpieczny system logowania oparty na sesjach.
1.  **Mechanizm:** Token sesyjny przesyłany w ciasteczku (`HttpOnly`, `Secure`, `SameSite`).
2.  **Hasła:** Hashowane przy użyciu algorytmu **bcrypt** przed zapisem do bazy.
3.  **Role systemowe:**
    * **Użytkownik (User):** Może tworzyć wycieczki, dodawać wydatki, edytować własne dane.
    * **Administrator (Admin):** Posiada dostęp do dedykowanego Panelu Administratora
4.  **Zabezpieczenia:** CORS (Cross-Origin Resource Sharing) skonfigurowany pod specyficzną domenę frontendu.

### D. Walidacja
* **Backend:** Walidacja danych wejściowych za pomocą schematów **Pydantic**.
* **Frontend:** Walidacja formularzy HTML (wymagalność pól, typy numeryczne) oraz obsługa błędów HTTP (np. 401 Unauthorized, 404 Not Found) wyświetlana użytkownikowi.

---

## 3. Funkcjonalność aplikacji

### Dla Użytkownika (Rola Podstawowa)
1.  **Rejestracja i Logowanie:** Tworzenie konta z unikalnym e-mailem i nickiem.
2.  **Dashboard:** Przegląd listy swoich wycieczek (organizowanych oraz tych, w których jest się uczestnikiem).
3.  **Zarządzanie Wycieczką:**
    * Tworzenie nowej wycieczki (Nazwa, Opis, Budżet).
    * Edycja i usuwanie wycieczki (tylko dla Organizatora).
    * Dodawanie uczestników po nicku.
4.  **Moduł Finansowy (Kluczowa funkcjonalność):**
    * Definiowanie budżetu wycieczki.
    * Dodawanie wydatków (kto płacił, za co, ile).
    * **Algorytm Bilansu:** Automatyczne obliczanie średniego kosztu na osobę.
    * **Wizualizacja:** System kolorystyczny wskazujący, kto jest "na plusie" (musi otrzymać zwrot - kolor czerwony, bo się musi upominać), a kto "na minusie" (musi dopłacić - kolor zielony, bo szczęśliwie jest na plusie).
    * Ostrzeganie o przekroczeniu założonego budżetu.

### Dla Administratora (Rola Uprzywilejowana)
1.  **Dostęp do Panelu Admina:** Specjalny widok dostępny tylko dla flagi `is_admin = True`.
2.  **Zarządzanie Użytkownikami:** Podgląd listy wszystkich zarejestrowanych osób.
3.  **Moderacja:** Możliwość trwałego usunięcia użytkownika z systemu.

---

## 4. Struktura projektu (Skrócona)

### Backend (Python/FastAPI)
* `main.py`: Punkt startowy aplikacji, konfiguracja middleware CORS.
* `models.py`: Definicje modeli bazodanowych SQLAlchemy (`User`, `Trip`, `Expense`, `TripMember`).
* `schemas.py`: Schematy Pydantic (DTO) do walidacji i serializacji danych.
* `auth.py`: Router odpowiedzialny za logowanie, rejestrację i wylogowanie (ustawianie ciasteczek).
* `trips.py`: Router obsługujący logikę wycieczek i wydatków.
* `session_service.py`: Serwis do podpisywania i weryfikacji tokenów sesyjnych.
* `dependencies.py`: Funkcje wstrzykiwania zależności – weryfikacja tożsamości użytkownika (`get_current_user`).
* `settings.py`: Konfiguracja zmiennych środowiskowych przy użyciu `pydantic-settings`.

**Konfiguracja i Narzędzia:**
* `main.jsx`: Entry Point. Inicjalizuje drzewo komponentów React i montuje aplikację w DOM.
* `App.jsx`: Główny komponent definiujący routing i strukturę nawigacji.
* `api.js`: Warstwa abstrakcji dla komunikacji HTTP. Zawiera konfigurację klienta `fetch`, obsługę nagłówków oraz centralną obsługę błędów sieciowych.
* `AuthContext.jsx`: Implementacja wzorca Provider. Zarządza globalnym stanem sesji użytkownika (Context API) i udostępnia metody autentykacji w całej aplikacji.

**Komponenty:**
* `components/ProtectedRoute.jsx`: Komponent typu **Guard**. Weryfikuje stan uwierzytelnienia użytkownika przed wyrenderowaniem treści chronionej. W przypadku braku aktywnej sesji przekierowuje do widoku logowania.

**Widoki (Pages):**
* `pages/Login.jsx` / `Register.jsx`: Formularze uwierzytelniania z walidacją i obsługą błędów API.
* `pages/Dashboard.jsx`: Główny panel użytkownika. Agreguje listę wycieczek i umożliwia tworzenie nowych.
* `pages/TripDetails.jsx`: Najbardziej złożony widok w systemie. Odpowiada za wyświetlanie szczegółów, zarządzanie uczestnikami oraz wizualizację algorytmu rozliczeń finansowych.
* `pages/AdminPanel.jsx`: Widok zarządczy dostępny wyłącznie dla użytkowników z rolą Administratora (lista użytkowników, usuwanie kont).

---

## 5. Instrukcja uruchomienia (Lokalnie)

### Krok 1: Konfiguracja Bazy i Zmiennych
Utwórz plik `.env` w katalogu `backend` z następującą konfiguracją:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/trip_manager
SECRET_KEY=twoj-tajny-klucz-do-podpisywania-ciasteczek
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Krok 2: Uruchomienie Backendu
```bash
cd backend

# Stworzenie wirtualnego środowiska (opcjonalnie)
python -m venv venv
# Aktywacja środowiska
# Windows:
.\venv\Scripts\activate
# Linux/MacOS:
source venv/bin/activate

# Instalacja zależności
pip install -r requirements.txt

# Uruchomienie serwera deweloperskiego
uvicorn app.main:app --reload
```

API będzie dostępne pod adresem: http://localhost:8000

### Krok 3: Uruchomienie Frontendu
```bash
cd frontend

# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja kliencka uruchomi się pod adresem: http://localhost:5173.

## 6. Konto Testowe (Demo)

W celu weryfikacji funkcjonalności aplikacji (bez konieczności rejestracji), przygotowano konto użytkownika z przykładowymi danymi:

* **Email:** `test@test.com`
* **Hasło:** `test123`