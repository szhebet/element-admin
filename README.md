<!--
SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
-->

# Element Admin

Element Admin — это веб-панель администрирования для [Element Server Suite](https://element.io/server-suite), доступная в версиях [ESS Pro](https://element.io/server-suite/pro) и в бесплатной версии [ESS Community](https://github.com/element-hq/ess-helm).

Эта ветка позволяет запускать Element Admin за NAT и использовать локальные адреса, что позволяет не публиковать admin API своих сервисов вне закрытой сети

<summary><b>📦 Сборка из исходного кода</b></summary>

1. Клонируйте репозиторий:

```bash
git clone https://github.com/szhebet/element-admin.git
cd element-admin
```

2. Установите зависимости (требуется Node.js 18+ и pnpm):

```bash
pnpm install
```

3. Соберите приложение:

```bash
pnpm build
```

Собранное приложение будет находиться в каталоге `dist/` и готово к размещению на любом статическом хостинге.


Или с использованием Docker
1. Клонируйте репозиторий:
```bash
git clone https://github.com/szhebet/element-admin.git
cd element-admin
```

2. Собираем приложение в докере и кладем его в образ
```bash
docker build -t name/ess-admin .
```

3. Запускаем, заменив параметры в скобках <>
```bash
docker run -it --rm -p 8081:8080 \
-e SERVER_NAME=<external server name> \
-e SYNAPSE_LOCAL=<internal synapse address or name>:<internal port (8008)> \
-e MAS_LOCAL=<internal MAS address or name>:<internal MAS port (8180)> \
--name adm \
name/ess-admin
```

</details>


## ⚖️ Авторские права и лицензия

а это лучше посмотреть в исходном репозитории
https://github.com/element-hq/
