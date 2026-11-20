# Na haczyku

Polska gra wędkarska 3D na komputer i telefon. Otwórz `index.html` w przeglądarce z obsługą WebGL i wybierz **Rozpocznij wyprawę**. Postępy zapisują się w przeglądarce na danym urządzeniu.

## Jak wrzucić grę na GitHub

1. Rozpakuj paczkę na komputerze. Utwórz na GitHubie repozytorium, na przykład `na-haczyku`. Przy bezpłatnym planie wybierz repozytorium publiczne, aby skorzystać z GitHub Pages.
2. W repozytorium wybierz **Add file → Upload files**. W pustym repozytorium możesz też kliknąć **uploading an existing file**. Przeciągnij rozpakowaną zawartość tak, żeby `index.html` i `README.md` leżały w katalogu głównym. Zatwierdź pliki na gałęzi `main`.
3. W **Settings → Pages** wybierz **Deploy from a branch**, następnie **main** i **/(root)**. Kliknij **Save**.
4. Po zakończeniu publikacji otwórz adres gry wyświetlony w **Settings → Pages**. Tego samego linku można użyć na telefonie.

Szczegóły konfiguracji znajdziesz w [dokumentacji GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Język i sterowanie wędką

W menu głównym dotknij **Polski** albo **English**. Gra pamięta wybór na tym urządzeniu. Na telefonie użyj przycisku **Schowaj wędkę** lub **Wyjmij wędkę**. Na komputerze działa też **R**. Podczas brania i holu dokończ połów.

From the main menu, select **English**. Tap **Stow rod** or **Take out rod** on a phone, or press **R** on a keyboard. Select **Map → Whole area** to see the trail around the lake.

## Pierwsza wyprawa

- **WASD** lub drążek dotykowy poruszają postacią. Przeciągnięcie po scenie obraca kamerę.
- **Spacja** albo główny przycisk pozwala zarzucić i zaciąć. Podczas holu przytrzymuj i puszczaj zwijanie, żeby utrzymać wskaźnik w ruchomym zielonym polu. Gatunki mają pięć poziomów trudności.
- **M** otwiera mapę. Przesuwaj ją i zmieniaj skalę. Polna droga, grobla albo górska ścieżka prowadzi dookoła całego jeziora. Wybierz **Prowadź pieszo**, żeby zobaczyć drogę do domu rybaka, gospody lub osady.
- W gospodzie wybierz **Usiądź z wędkarzami**, wskaż rozmówcę i zapytaj **Gdzie biorą?**. Miejsce możesz zaznaczyć na mapie i na wodzie. Wskazówka obowiązuje do końca bieżącej pory żerowania.
- W domu rybaka kupisz składak za **240 zł**. Na zewnątrz wsiadaj i zsiadaj klawiszem **B** albo przyciskiem. Na placu w osadzie od **18:00** do północy odbywa się potańcówka.
- Brzozowe jest dostępne od początku. Trzcinowe otwiera się po rozliczeniu **2 zleceń** i uzbieraniu **450 zł**. Głębokie wymaga **4 zleceń** i **1200 zł**. Po odblokowaniu jeziora pieniądze zostają w portfelu.

## Zmiany w grze

Źródła są w katalogu `src/`. Do przygotowania nowej wersji potrzebny jest Node.js. W katalogu głównym wykonaj poniższe dwa polecenia.

```sh
node src/build.cjs index.html
node tests/game.cjs
```

Zatwierdź zaktualizowane źródła razem z wygenerowanym `index.html`. GitHub Pages udostępnia właśnie ten plik. Gra działa bez zewnętrznych bibliotek, serwera gry i kont graczy.
