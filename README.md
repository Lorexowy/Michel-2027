# Michel 2027 - Aplikacja Planowania Ślubu

Prywatna aplikacja webowa do planowania ślubu zbudowana w Next.js z App Router.

## 🚀 Szybki Start

### Wymagania

- Node.js 18+ 
- npm lub yarn

### Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj Firebase:
   - Skopiuj plik `.env.local.example` jako `.env.local`
   - Wypełnij wartości konfiguracyjne Firebase z Firebase Console
   - Upewnij się, że masz utworzony projekt Firebase z włączonym Firestore

3. Uruchom serwer deweloperski:
```bash
npm run dev
```

4. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce

## 🔐 Uwierzytelnianie

Aplikacja używa prostego systemu uwierzytelniania opartego na haśle (bez Firebase Auth).

### Hasło domyślne

Domyślne hasło: `Rabe19122025`

### Zmiana hasła

Aby zmienić hasło, edytuj plik `lib/auth.ts`:

```typescript
const CORRECT_PASSWORD = "TwojeNoweHaslo";
```

### Jak działa sesja

- Po poprawnym wprowadzeniu hasła, sesja jest zapisywana w `localStorage` przeglądarki
- Sesja jest ważna przez 30 dni od momentu logowania
- Sesja jest automatycznie sprawdzana przy każdym odświeżeniu strony
- Wylogowanie usuwa sesję z `localStorage`

## 🛡️ Ochrona tras (Route Protection)

Ochrona tras jest implementowana na dwóch poziomach:

1. **Strona główna (`app/page.tsx`)**:
   - Sprawdza czy użytkownik ma ważną sesję przy każdym renderowaniu
   - Jeśli nie ma sesji, wyświetla komponent `PasswordGate`
   - Jeśli ma sesję, przekierowuje do `/dashboard`

2. **Layout dashboardu (`app/(dashboard)/layout.tsx`)**:
   - Wszystkie trasy w folderze `(dashboard)` są chronione przez ten layout
   - Layout sprawdza sesję przy każdym renderowaniu i zmianie trasy
   - Jeśli sesja nie jest ważna, przekierowuje do strony głównej (`/`)
   - Jeśli sesja jest ważna, renderuje dashboard z Sidebar i Topbar
   - Chronione trasy: `/dashboard`, `/zadania`, `/goscie`, `/kosztorys`, `/uslugodawcy`, `/harmonogram`, `/notatki`

### Mechanizm działania

- Funkcja `hasValidSession()` z `lib/auth.ts` sprawdza `localStorage` przeglądarki
- Weryfikuje czy sesja istnieje, jest autentykowana i nie wygasła (30 dni)
- Komponenty używają `useEffect` do sprawdzania sesji po zamontowaniu i przy zmianie trasy
- Przekierowania są obsługiwane przez Next.js Router (`useRouter`)
- Sesja jest przechowywana w `localStorage` z kluczem `michel_2027_session`

## 📁 Struktura projektu

```
.
├── app/
│   ├── (dashboard)/          # Chronione trasy dashboardu (route group)
│   │   ├── layout.tsx       # Layout z Sidebar i Topbar + ochrona
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Strona główna dashboardu (/dashboard)
│   │   ├── zadania/
│   │   │   └── page.tsx     # Strona zadań (/zadania)
│   │   ├── goscie/
│   │   │   └── page.tsx     # Strona gości (/goscie)
│   │   ├── kosztorys/
│   │   │   └── page.tsx     # Strona kosztorysu (/kosztorys)
│   │   ├── uslugodawcy/
│   │   │   └── page.tsx     # Strona usługodawców (/uslugodawcy)
│   │   ├── harmonogram/
│   │   │   └── page.tsx     # Strona harmonogramu (/harmonogram)
│   │   └── notatki/
│   │       └── page.tsx     # Strona notatek (/notatki)
│   ├── layout.tsx           # Główny layout aplikacji
│   ├── page.tsx             # Strona główna z bramą hasła (/)
│   └── globals.css           # Globalne style Tailwind
├── components/
│   ├── auth/
│   │   └── PasswordGate.tsx  # Komponent bramy hasła
│   ├── layout/
│   │   ├── Sidebar.tsx       # Pasek boczny z nawigacją
│   │   └── Topbar.tsx        # Pasek górny z wylogowaniem
│   └── ui/                   # Komponenty UI (shadcn/ui)
│       ├── button.tsx
│       └── input.tsx
├── lib/
│   ├── auth.ts               # Funkcje uwierzytelniania
│   ├── firebase.ts           # Konfiguracja Firebase Firestore
│   ├── utils.ts              # Funkcje pomocnicze
│   └── db/                   # Warstwa dostępu do Firestore
│       ├── types.ts          # Typy TypeScript dla kolekcji
│       ├── project.ts        # CRUD dla projektu ślubnego
│       ├── tasks.ts          # CRUD dla zadań
│       ├── guests.ts         # CRUD dla gości
│       ├── expenses.ts       # CRUD dla wydatków
│       ├── vendors.ts        # CRUD dla usługodawców
│       ├── timeline.ts       # CRUD dla harmonogramu
│       └── notes.ts          # CRUD dla notatek
└── README.md
```

## 🎨 Technologie

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (komponenty UI)
- **Firebase Firestore** (baza danych)
- **date-fns** (obsługa dat - do użycia w przyszłości)

## 📝 Funkcjonalności

### Obecne

- ✅ Uwierzytelnianie hasłem
- ✅ Ochrona tras
- ✅ Dashboard z podstawowymi sekcjami
- ✅ Nawigacja boczna (Sidebar)
- ✅ Pasek górny (Topbar)
- ✅ Persystencja sesji
- ✅ Integracja z Firebase Firestore
- ✅ Typowany model danych (TypeScript)
- ✅ CRUD helpers dla wszystkich kolekcji
- ✅ Automatyczne tworzenie projektu przy starcie

### Planowane moduły

- Zadania
- Goście
- Kosztorys
- Usługodawcy
- Harmonogram
- Notatki

## 🔧 Konfiguracja Firebase

### Krok 1: Utworzenie projektu Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Dodaj projekt" i postępuj zgodnie z instrukcjami
3. Wybierz plan Blaze (płatny) lub Spark (darmowy) - Firestore działa na obu

### Krok 2: Włączenie Firestore Database

1. W Firebase Console przejdź do sekcji "Firestore Database"
2. Kliknij "Utwórz bazę danych"
3. Wybierz tryb startowy:
   - **Tryb testowy** (tylko do rozwoju lokalnego - NIE dla produkcji!)
   - Lub skonfiguruj reguły bezpieczeństwa (patrz sekcja poniżej)
4. Wybierz lokalizację bazy danych (np. `europe-west3` dla Polski)

### Krok 3: Konfiguracja zmiennych środowiskowych

1. W Firebase Console przejdź do ustawień projektu (ikona koła zębatego)
2. Przewiń do sekcji "Twoje aplikacje" i kliknij ikonę web (</>)
3. Zarejestruj aplikację (nazwa dowolna, np. "Michel 2027 Web")
4. Skopiuj dane konfiguracyjne
5. W projekcie skopiuj plik `env.example` jako `.env.local`
6. Wklej wartości z Firebase Console do `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Krok 4: Struktura danych Firestore

Aplikacja automatycznie utworzy następującą strukturę:

```
weddingProjects/
  └── main/
      ├── (dokument projektu)
      ├── tasks/ (kolekcja)
      ├── guests/ (kolekcja)
      ├── expenses/ (kolekcja)
      ├── vendors/ (kolekcja)
      ├── timeline/ (kolekcja)
      └── notes/ (kolekcja)
```

Dokument `weddingProjects/main` jest automatycznie tworzony przy pierwszym uruchomieniu dashboardu.

## 🔒 Reguły bezpieczeństwa Firestore

### ⚠️ WAŻNE: Ostrzeżenie dotyczące bezpieczeństwa

**Ta aplikacja NIE używa Firebase Auth**, więc standardowe reguły Firestore oparte na UID nie mogą zabezpieczyć danych. Oznacza to, że:

- Każdy, kto zna hasło aplikacji, ma pełny dostęp do wszystkich danych w Firestore
- Jeśli ktoś uzyska dostęp do konfiguracji Firebase (np. przez wyciek `.env.local`), może odczytać i modyfikować dane
- **Tryb testowy Firestore pozwala na odczyt i zapis przez 30 dni od utworzenia projektu - NIE używaj go w produkcji!**

### Opcje zabezpieczenia (w kolejności od najbardziej do najmniej bezpiecznej):

#### Opcja A: Firebase Authentication (ZALECANE dla produkcji)

1. Włącz Firebase Authentication w Firebase Console
2. Zaimplementuj logowanie przez Firebase Auth zamiast bramki hasła
3. Użyj reguł Firestore opartych na UID:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weddingProjects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid != null;
      
      match /{collection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid != null;
      }
    }
  }
}
```

#### Opcja B: Next.js API Routes / Server Actions z Admin SDK

1. Przenieś wszystkie operacje zapisu do Next.js API Routes lub Server Actions
2. Użyj Firebase Admin SDK (wymaga zmiennych środowiskowych po stronie serwera)
3. Zablokuj zapisy w regułach Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true; // Tylko odczyt z klienta
      allow write: if false; // Zapis tylko przez Admin SDK
    }
  }
}
```

#### Opcja C: Tryb testowy (TYLKO do rozwoju lokalnego)

**NIE używaj w produkcji!** Tryb testowy pozwala na pełny dostęp przez 30 dni:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 2, 1);
    }
  }
}
```

### Aktualne reguły (minimalne, dla rozwoju)

W projekcie znajduje się plik `firestore.rules` z podstawowymi regułami dla rozwoju lokalnego.

Aby wdrożyć reguły do Firebase:

```bash
# Zainstaluj Firebase CLI (jeśli jeszcze nie masz)
npm install -g firebase-tools

# Zaloguj się do Firebase
firebase login

# Zainicjalizuj projekt (jeśli jeszcze nie)
firebase init firestore

# Wdróż reguły
firebase deploy --only firestore:rules
```

**Pamiętaj:** Reguły w pliku `firestore.rules` pozwalają każdemu na dostęp do danych, jeśli zna konfigurację Firebase. Używaj ich TYLKO lokalnie i zmień przed wdrożeniem na produkcję!

## 📦 Build produkcyjny

```bash
npm run build
npm start
```

## ⚠️ Uwagi

- Hasło jest przechowywane w kodzie źródłowym (nie jest to bezpieczne dla produkcji)
- Sesja jest przechowywana w `localStorage` (można ją usunąć ręcznie)
- Aplikacja nie używa Firebase Auth - tylko Firestore jako baza danych

## 📄 Licencja

Prywatna aplikacja - tylko do użytku osobistego.

