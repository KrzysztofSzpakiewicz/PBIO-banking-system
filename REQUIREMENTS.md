Aplikacja pozwala na:

- rejestrację i logowanie za pomocą adresu e-mail;
- otwarcie pierwszego rachunku oraz tworzenie kolejnych rachunków;
- przeglądanie rachunków, sald i historii operacji;
- przelewy między własnymi rachunkami i na rachunki innych użytkowników systemu;
- podstawowe zarządzanie rachunkiem: nadawanie własnej nazwy i zamknięcie rachunku przy zerowym saldzie;
- wylogowanie i zakończenie bieżącej sesji.

Poniższe założenia doprecyzowują opis projektu i stanowią proponowany zakres implementacji:

- System obsługuje jedną walutę: PLN.
- Każdy rachunek ma jednego właściciela; rachunki wspólne są poza zakresem.
- Przelewy odbywają się wyłącznie wewnątrz aplikacji i są realizowane natychmiast.
- Nie są obsługiwane kredyty, karty, lokaty, przewalutowania ani integracje z prawdziwymi bankami.
- Środki demonstracyjne są przygotowywane przez skrypt danych testowych. 
- Możliwe że powstanie "panel administratora" na którym będzie można modyfikować salda klientów w celu eksperymentów 

Użytkownicy i ich możliwości:

Gość — osoba niezalogowana - Rozpoczęcie rejestracji lub logowania, wysłanie prośby o kod albo link e-mail, odczyt informacji o aplikacji.
Użytkownik z potwierdzonym adresem e-mail - Otwarcie i przeglądanie własnych rachunków, tworzenie kolejnych rachunków, wykonywanie przelewów, przeglądanie własnej historii, zmiana nazwy i zamknięcie własnego rachunku, wylogowanie.

Gość nie ma dostępu do danych rachunków ani operacji. Użytkownik nie może zarządzać cudzymi rachunkami ani odczytywać ich sald lub historii. Może wskazać identyfikator rachunku innego użytkownika jako odbiorcę przelewu.

Możliwe że powstanie "panel administratora" na którym będzie można modyfikować salda klientów w celu eksperymentów - rola czysto eksperymentalna

Wymagania funkcjonalne:

Rejestracja, logowanie i onboarding
- System umożliwia rozpoczęcie rejestracji lub logowania przez podanie adresu e-mail.
- System wysyła jednorazowy kod lub link potwierdzający. Ostateczny wariant zostanie wybrany przed implementacją uwierzytelniania.
- Utworzenie aktywnej sesji wymaga poprawnego potwierdzenia dostępu do skrzynki. Niepotwierdzony użytkownik nie może otworzyć rachunku ani wykonywać przelewów.
- Po pierwszym logowaniu system prowadzi użytkownika przez otwarcie pierwszego rachunku i pokazuje informację o zakończeniu procesu.
- Kolejne logowanie na ten sam zweryfikowany adres prowadzi do istniejącego konta użytkownika. Ponowienie żądania rejestracji lub onboardingu nie tworzy duplikatów konta ani pierwszego rachunku.
- Użytkownik może zakończyć bieżącą sesję. Po wylogowaniu dostęp do operacji chronionych wymaga ponownego logowania.


Rachunki
- Użytkownik może utworzyć dodatkowy rachunek. Każdy rachunek otrzymuje unikalny identyfikator, właściciela, walutę, status i datę utworzenia.
- Nowy rachunek ma saldo zerowe. Zasilenie demonstracyjne jest osobną, widoczną w historii operacją przygotowaną w danych testowych lub za pośrednictwem apnelu administratora
- Użytkownik widzi listę własnych rachunków wraz z ich nazwami, identyfikatorami, statusami i aktualnymi saldami.
- Użytkownik może zmienić wyświetlaną nazwę własnego rachunku. Nie może zmienić jego właściciela, identyfikatora ani salda przez formularz edycji.
- Użytkownik może zamknąć własny rachunek wyłącznie przy saldzie równym zero. Zamknięty rachunek nie przyjmuje ani nie wysyła przelewów, ale jego historia pozostaje dostępna właścicielowi.


Przelewy
- Użytkownik może zlecić przelew z własnego aktywnego rachunku na inny aktywny rachunek w systemie, podając identyfikator odbiorcy, kwotę i tytuł.
- Przed wysłaniem zlecenia interfejs pokazuje podsumowanie: rachunek źródłowy, rachunek odbiorcy, kwotę i tytuł. Użytkownik musi potwierdzić operację.
- Serwer sprawdza właściciela rachunku źródłowego, status obu rachunków, dostępność środków i poprawność danych. Kwota musi być dodatnia i mieć najwyżej dwa miejsca po przecinku. Przelew na ten sam rachunek jest odrzucany.
- Przelew jest wykonywany atomowo: obciążenie nadawcy, uznanie odbiorcy i zapis historii następują razem albo nie następuje żaden z tych skutków.
- System nie dopuszcza ujemnego salda, także przy równoległych zleceniach. Ponowienie tego samego zlecenia nie powoduje kolejnego obciążenia.
- Użytkownik otrzymuje potwierdzenie z identyfikatorem przelewu lub komunikat o odrzuceniu. Po utracie odpowiedzi może sprawdzić wynik operacji, zanim ponowi zlecenie.


Historia operacji
- Użytkownik może przeglądać stronicowaną historię własnego rachunku i filtrować ją według zakresu dat oraz kierunku operacji.
- Historia zawiera identyfikator operacji, datę, kwotę, walutę, kierunek, identyfikator rachunku drugiej strony, tytuł i wynik operacji. Nie ujawnia adresu e-mail drugiej strony.
- Przelewy między własnymi rachunkami są widoczne jako obciążenie jednego rachunku i uznanie drugiego, połączone wspólnym identyfikatorem przelewu.
- Użytkownik nie może edytować ani usuwać zapisanych operacji. Odrzucone próby nie zmieniają salda i są odróżniane od wykonanych przelewów.

Sposób działania panelu administratora  nie został jeszcze ustalony



Wymagania bezpieczeństwa

Uwierzytelnianie i sesje
- Sekrety i dane uwierzytelniające nie mogą trafiać do repozytorium ani kodu udostępnianego przeglądarce.
- Kody i linki logowania są jednorazowe, mają krótki czas ważności i ograniczoną liczbę prób weryfikacji. Proponowane wartości początkowe to 10 minut ważności, 5 prób na wyzwanie i co najmniej 60 sekund między wysyłkami na ten sam adres; konfigurację należy dopasować do możliwości wybranego dostawcy.
- Wysyłka i weryfikacja kodów podlegają limitom dla adresu e-mail oraz źródła żądania. Odpowiedź na rozpoczęcie logowania nie ujawnia, czy konto istnieje.
- API weryfikuje sesję przy każdym chronionym żądaniu. Przy zewnętrznym dostawcy sprawdza podpis tokena, wystawcę, odbiorcę i czas ważności oraz korzysta ze stabilnego identyfikatora użytkownika dostawcy.
- Sesje mają ograniczony czas trwania. Wylogowanie unieważnia bieżącą sesję w warstwie API; samo usunięcie danych z interfejsu jest niewystarczające. Mechanizm unieważniania musi uwzględniać sposób działania wybranego dostawcy.


Autoryzacja i ochrona danych
- API sprawdza uprawnienia do konkretnego rachunku i operacji po stronie serwera. Identyfikator użytkownika przesłany przez klienta nie stanowi dowodu własności.
- Tożsamość wykonawcy jest ustalana na podstawie zweryfikowanej sesji. Zapytania dotyczące prywatnych danych są ograniczane do zasobów tego użytkownika.
- System zbiera wyłącznie dane potrzebne do symulacji. Nie wymaga PESEL, skanów dokumentów ani danych prawdziwych kart płatniczych.
- Dostęp do bazy danych, kopii zapasowych i logów jest ograniczony do uprawnionych komponentów i operatorów. Konto bazy używane przez API ma minimalny niezbędny zakres uprawnień.
- Dane rachunków nie mogą być udostępniane innym użytkownikom przez współdzielony cache, logi, komunikaty błędów ani publiczne endpointy.

Integralność operacji
- Kwoty są reprezentowane jako całkowita liczba groszy lub typ dziesiętny o stałej precyzji. Obliczenia pieniężne nie używają arytmetyki zmiennoprzecinkowej.
- Operacje finansowe korzystają z transakcji PostgreSQL i kontroli współbieżności, np. blokad rekordów w ustalonej kolejności. Sprawdzenie salda oraz jego zmiana odbywają się w tej samej transakcji. Zamknięcie rachunku jest skoordynowane z przelewami tym samym mechanizmem.
- Każde zlecenie przelewu ma klucz idempotencji powiązany z użytkownikiem i treścią zlecenia. Powtórzenie tego klucza z tymi samymi danymi zwraca wcześniejszy wynik; użycie go z innymi danymi jest odrzucane. Unikalność jest egzekwowana również w bazie danych.
- Baza wymusza podstawowe ograniczenia integralności: unikalne identyfikatory, relacje między rekordami, dodatnie kwoty przelewów i nieujemne salda. Ograniczenia bazy uzupełniają walidację w API.
- Zapis wykonanej operacji finansowej nie podlega edycji przez użytkownika. Historia umożliwia powiązanie obu stron przelewu i sprawdzenie zgodności sald z zapisami operacji.


Model zagrożeń

Chronione zasoby
- konta użytkowników, adresy e-mail i sesje;
- własność rachunków, salda i historia operacji;
- integralność i jednokrotność wykonania przelewów;
- dostępność aplikacji i procesu logowania;
- sekrety integracji, baza danych, kopie zapasowe i logi audytowe.

Potencjalni sprawcy i źródła zagrożeń
- osoba niezalogowana próbująca uzyskać dostęp lub przeciążyć system;
- zalogowany użytkownik próbujący odczytać cudze dane lub zmienić saldo;
- osoba mająca dostęp do cudzej skrzynki e-mail albo przejętej sesji;
- operator z nadmiernymi uprawnieniami lub osoba korzystająca z błędnej konfiguracji;

Przepływy danych i granice zaufania

1. Przeglądarka → Next.js / Express.js: wszystkie dane klienta są niezaufane. Ukrycie przycisku w interfejsie nie ogranicza uprawnień w API.
2. Express.js → PostgreSQL: do bazy trafiają zwalidowane dane przez parametryzowane zapytania, z użyciem konta o ograniczonych uprawnieniach.
3. Aplikacja ↔ dostawca uwierzytelniania / poczty ↔ skrzynka e-mail: tokeny, kody i komunikaty integracji wymagają weryfikacji. Bezpieczeństwo logowania zależy również od bezpieczeństwa skrzynki.


Ryzyko pozostałe i ograniczenia
- Osoba kontrolująca skrzynkę może zalogować się jako jej właściciel. Logowanie wyłącznie e-mailem nie zapewnia niezależnego drugiego czynnika.
- Potwierdzenie przelewu w interfejsie nie stanowi dodatkowego czynnika uwierzytelniania i nie chroni w pełni po przejęciu sesji.
- Zewnętrzny dostawca może zabezpieczać logowanie, ale aplikacja nadal odpowiada za autoryzację dostępu do rachunków i poprawność przelewów.
- Administrator infrastruktury z pełnym dostępem do bazy może zmienić dane.

Kryteria akceptacji

1. Nowy użytkownik potwierdza e-mail, otwiera pierwszy rachunek i widzi go po kolejnym logowaniu. Ponowienie onboardingu nie tworzy duplikatu.
2. Niezalogowany użytkownik nie odczytuje danych chronionych. Użytkownik A nie może odczytać historii, zmienić nazwy, zamknąć ani obciążyć rachunku użytkownika B, także przez bezpośrednie żądanie API.
3. Przelew 25,50 PLN pomiędzy rachunkami o początkowych saldach 100,00 PLN i 0,00 PLN kończy się saldami 74,50 PLN i 25,50 PLN oraz spójnym zapisem obu stron operacji.
4. Przelew o wartości niedodatniej, z nadmierną precyzją, bez wystarczających środków albo na zamknięty lub nieistniejący rachunek nie zmienia żadnego salda.
5. Dwa równoległe przelewy po 80,00 PLN z rachunku mającego 100,00 PLN nie mogą oba zostać wykonane. Suma środków na rachunkach uczestniczących w przelewach pozostaje niezmieniona.
6. Powtórzenie zlecenia z tym samym kluczem idempotencji obciąża rachunek najwyżej raz, również przy równoległych żądaniach. Zmieniona treść z tym samym kluczem zostaje odrzucona.
7. Wymuszony błąd pomiędzy aktualizacjami rachunków wycofuje całą operację i nie pozostawia częściowej historii.
8. Kod wygasły, już wykorzystany lub objęty przekroczonym limitem prób nie tworzy sesji. Wylogowana sesja nie autoryzuje kolejnego chronionego żądania.
9. Zamknięcie rachunku z niezerowym saldem zostaje odrzucone. Równoległy przelew i zamknięcie rachunku nie prowadzą do salda na zamkniętym rachunku.
10. Tekst zawierający HTML lub skrypt w tytule przelewu jest wyświetlany jako dane. Błędne żądanie nie ujawnia sekretów ani szczegółów bazy.
11. Historia jest dostępna wyłącznie uprawnionemu właścicielowi.

Decyzje przed implementacją
- Wybór własnego mechanizmu uwierzytelniania lub zewnętrznego dostawcy oraz wariantu: kod e-mail albo link.
- Sposób przekazywania i unieważniania sesji pomiędzy Next.js a Express.js oraz docelowe czasy jej ważności.
- Format identyfikatorów rachunków i szczegółowe limity: liczba rachunków, kwota przelewu, długość tytułu i nazwy rachunku.

Powyższy opis jest wstępnym planem na projekt. Poszczególne funkcjonalności mogą zostać usunięte lub zmodyfikowane a nowe dodane podczas implementacji. 