# Дія/Дия
Цифровые документы прямо у вас под рукой)

**Управление** 
Меню>Бізнес та ФОП

> **Важно**: стандартный Expo не собирает из этого проекта нативные приложения `.exe` для Windows и `.AppImage/.deb` для Linux. Для Linux и Windows используется web-сборка Expo, которая запускается в браузере. Нативная сборка Android выполняется через EAS Build в облаке и может быть запущена с любой из этих операционных систем. Данный код несет исключительно познавательный характер, все кто решит воспользоваться им берет всю ответственность на себя

---
## Технологии

- Expo SDK 54
- React 19
- React Native 0.81
- React Native Web
- JavaScript
- `expo-image-picker`
- `expo-local-authentication`
- `@react-native-async-storage/async-storage`
- `react-native-qrcode-svg`

## Требования

Установите:

- Node.js LTS — рекомендуется версия 20 или новее;
- npm;
- Git — если проект клонируется из репозитория;
- аккаунт Expo — только для облачной сборки через EAS.

Для локального запуска Android дополнительно понадобятся Android Studio и настроенный Android SDK. Для запуска в браузере Android Studio не требуется.

## Установка проекта

```bash
git clone https://github.com/Ghostoraner/fake-dija.git
cd fake-dija
npm ci
```

Если `npm ci` завершается ошибкой из-за изменённого `package-lock.json`, используйте:

```bash
npm install
```

## Запуск в режиме разработки

Запустите Expo Dev Server:

```bash
npm start
```

После запуска:

- нажмите `w`, чтобы открыть приложение в браузере;
- нажмите `a`, чтобы открыть Android-версию в эмуляторе или на подключённом устройстве;
- отсканируйте QR-код приложением Expo Go для запуска на телефоне.

Также доступны команды:

```bash
npm run web       # запуск web-версии
npm run android   # запуск Android-версии
npm run ios       # запуск iOS-версии (только macOS с Xcode)
```

Тестовый PIN-код приложения: `1111`.

## Сборка web-приложения для Linux и Windows

Эта сборка создаёт статические файлы в каталоге `dist`. Их можно открыть на Linux или Windows в любом современном браузере либо разместить на web-сервере.

### Linux

В терминале Linux выполните:

```bash
npm ci
npx expo export --platform web
```

Для локальной проверки установите простой статический сервер и запустите его:

```bash
npx serve dist
```

Откройте адрес, который напечатает команда, обычно `http://localhost:3000`.

Другой вариант — использовать Python, если он уже установлен:

```bash
python3 -m http.server 8080 --directory dist
```

После этого откройте `http://localhost:8080`.

### Windows PowerShell

В PowerShell выполните:

```powershell
npm ci
npx expo export --platform web
npx serve dist
```

Если PowerShell запрещает запуск npm-скриптов, запустите команды через `npm.cmd` или измените политику выполнения для текущего пользователя:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Альтернативный локальный сервер на Python:

```powershell
python -m http.server 8080 --directory dist
```

Откройте `http://localhost:8080`.

### Раздача web-сборки через Nginx или IIS

После выполнения `npx expo export --platform web` содержимое каталога `dist` можно загрузить на хостинг. Для SPA-ссылок сервер должен возвращать `index.html`, если запрошенный файл не найден.

В Nginx это обычно выглядит так:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/diya-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Для IIS настройте правило URL Rewrite с перенаправлением неизвестных маршрутов на `index.html`.

## Сборка Android через EAS

EAS Build выполняется в облаке Expo, поэтому запустить его можно и из Linux, и из Windows.

1. Установите EAS CLI:

   ```bash
   npm install --global eas-cli
   ```

2. Авторизуйтесь в Expo:

   ```bash
   eas login
   ```

3. Проверьте конфигурацию проекта:

   ```bash
   eas whoami
   npx expo config --type public
   ```

4. Соберите APK для тестовой установки:

   ```bash
   eas build --platform android --profile preview
   ```

   Профиль `preview` из `eas.json` собирает APK. После завершения EAS покажет ссылку на скачивание файла.

5. Соберите production-версию для публикации в Google Play:

   ```bash
   eas build --platform android --profile production
   ```

   Production-профиль обычно создаёт Android App Bundle (`.aab`).

Для интерактивной настройки проекта, если EAS ещё не связан с аккаунтом:

```bash
eas build:configure
```

В `app.json` уже указан идентификатор EAS-проекта. Не удаляйте его без необходимости.

## Что можно получить на каждой ОС

| Целевая платформа | Команда | Результат |
|---|---|---|
| Linux | `npx expo export --platform web` | Web-приложение в `dist/` |
| Windows | `npx expo export --platform web` | Web-приложение в `dist/` |
| Android | `eas build --platform android --profile preview` | Устанавливаемый `.apk` |
| Google Play | `eas build --platform android --profile production` | Пакет `.aab` |
| iOS | `eas build --platform ios --profile production` | Сборка через EAS; публикация требует Apple Developer Account |

Чтобы получить отдельный нативный `.exe` или Linux-пакет, проект необходимо дополнительно адаптировать под Electron, Tauri, React Native Windows или React Native macOS. Это не входит в текущую конфигурацию репозитория.

## Ограничения web-версии

Некоторые мобильные возможности работают в браузере иначе или недоступны полностью:

- Face ID и биометрическая авторизация зависят от возможностей браузера и устройства;
- выбор изображений открывает файловый диалог браузера;
- часть нативного поведения React Native может отличаться от Android;
- данные профиля сохраняются локально в браузере через AsyncStorage-совместимый механизм.

## Полезные команды

```bash
npx expo start --clear       # очистить кэш Metro и запустить Expo
npx expo doctor              # проверить зависимости и конфигурацию
npx expo export --platform web
 eas build:list               # посмотреть сборки EAS
```

## Структура основных файлов

- `App.js` — основной экран и логика приложения;
- `app.json` — настройки Expo, имя, иконки и Android package name;
- `eas.json` — профили облачных сборок EAS;
- `assets/` — изображения и иконки;
- `index.js` — точка входа приложения;
- `package.json` — зависимости и npm-скрипты.

## Лицензия

Проект распространяется по лицензии MIT. Подробности находятся в файле [LICENSE](./LICENSE).
