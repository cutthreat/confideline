# Confideline admin full-audit action inventory

Generated: 2026-05-23T10:54:09.7696552Z

| Controller | Route | Risk | Params |
|---|---|---|---|
| Admin | `/ru/admin/admin/create` | form_or_mutating | `` |
| Admin | `/ru/admin/admin/delete` | mutating | `$id` |
| Admin | `/ru/admin/admin/update` | form_or_mutating | `$id` |
| Ban | `/ru/admin/ban/create` | form_or_mutating | `` |
| Ban | `/ru/admin/ban/delete` | mutating | `$id` |
| Ban | `/ru/admin/ban/index` | read_only | `` |
| Ban | `/ru/admin/ban/update` | form_or_mutating | `$id` |
| country | `/ru/admin/country/index` | read_only | `live-only/customized` |
| country | `/ru/admin/country/update` | form_or_mutating | `live-only/customized` |
| Default | `/ru/admin/default/find-cities` | read_only | `$country, $query` |
| Default | `/ru/admin/default/index` | read_only | `` |
| geoname | `/ru/admin/geoname/index` | read_only | `live-only/customized` |
| geoname | `/ru/admin/geoname/update` | form_or_mutating | `live-only/customized` |
| Gift | `/ru/admin/gift/categories` | read_only | `` |
| Gift | `/ru/admin/gift/create-category` | form_or_mutating | `` |
| Gift | `/ru/admin/gift/delete-category` | mutating | `$id` |
| Gift | `/ru/admin/gift/delete-item` | mutating | `$id` |
| Gift | `/ru/admin/gift/scan` | mutating | `` |
| Gift | `/ru/admin/gift/scan-category` | mutating | `$id` |
| Gift | `/ru/admin/gift/update-category` | form_or_mutating | `$id` |
| Gift | `/ru/admin/gift/upload-items` | mutating | `$id` |
| Group | `/ru/admin/group/delete` | mutating | `$id` |
| Group | `/ru/admin/group/index` | read_only | `` |
| Group | `/ru/admin/group/toggle-block` | mutating | `$id` |
| Group | `/ru/admin/group/toggle-verification` | mutating | `$id` |
| Group | `/ru/admin/group/update` | form_or_mutating | `$id` |
| Help | `/ru/admin/help/categories` | read_only | `` |
| Help | `/ru/admin/help/create` | form_or_mutating | `` |
| Help | `/ru/admin/help/create-category` | form_or_mutating | `` |
| Help | `/ru/admin/help/delete` | mutating | `$id` |
| Help | `/ru/admin/help/delete-category` | mutating | `$id` |
| Help | `/ru/admin/help/index` | read_only | `` |
| Help | `/ru/admin/help/update` | form_or_mutating | `$id` |
| Help | `/ru/admin/help/update-category` | form_or_mutating | `$id` |
| Log | `/ru/admin/log/delete` | mutating | `$id` |
| Log | `/ru/admin/log/flush` | mutating | `` |
| Log | `/ru/admin/log/index` | read_only | `` |
| Log | `/ru/admin/log/view` | read_only | `$id` |
| Message | `/ru/admin/message/chat` | read_only | `` |
| Message | `/ru/admin/message/conversations` | read_only | `` |
| Message | `/ru/admin/message/delete` | mutating | `$id` |
| Message | `/ru/admin/message/expert-preview` | read_only | `` |
| Message | `/ru/admin/message/index` | read_only | `` |
| Message | `/ru/admin/message/messages` | read_only | `` |
| Message | `/ru/admin/message/send` | mutating | `` |
| Message | `/ru/admin/message/translate` | read_only | `` |
| News | `/ru/admin/news/create` | form_or_mutating | `` |
| News | `/ru/admin/news/delete` | mutating | `$id` |
| News | `/ru/admin/news/index` | read_only | `` |
| News | `/ru/admin/news/update` | form_or_mutating | `$id` |
| Order | `/ru/admin/order/index` | read_only | `` |
| Order | `/ru/admin/order/view` | read_only | `$id` |
| Page | `/ru/admin/page/create` | form_or_mutating | `` |
| Page | `/ru/admin/page/index` | read_only | `$currentPage = null, $language = null` |
| Page | `/ru/admin/page/reset` | mutating | `` |
| Page | `/ru/admin/page/save` | mutating | `$currentPage, $language = null` |
| PartnerInteraction | `/ru/admin/partner-interaction/index` | read_only | `` |
| PartnerInteraction | `/ru/admin/partner-interaction/my` | read_only | `` |
| Photo | `/ru/admin/photo/approve` | mutating | `$id` |
| Photo | `/ru/admin/photo/delete` | mutating | `$id` |
| Photo | `/ru/admin/photo/index` | read_only | `` |
| Photo | `/ru/admin/photo/toggle-private` | mutating | `$id, $locked = true` |
| Plugin | `/ru/admin/plugin/browse` | read_only | `$searchQuery = null` |
| Plugin | `/ru/admin/plugin/disable` | mutating | `$pluginId` |
| Plugin | `/ru/admin/plugin/enable` | mutating | `$pluginId` |
| Plugin | `/ru/admin/plugin/index` | read_only | `` |
| Plugin | `/ru/admin/plugin/install` | mutating | `$pluginId` |
| Plugin | `/ru/admin/plugin/uninstall` | mutating | `$pluginId` |
| Plugin | `/ru/admin/plugin/update` | form_or_mutating | `$pluginId` |
| ProfileField | `/ru/admin/profile-field/create` | form_or_mutating | `` |
| ProfileField | `/ru/admin/profile-field/delete` | mutating | `$id` |
| ProfileField | `/ru/admin/profile-field/index` | read_only | `` |
| ProfileField | `/ru/admin/profile-field/update` | form_or_mutating | `$id` |
| ProfileFieldCategory | `/ru/admin/profile-field-category/create` | form_or_mutating | `` |
| ProfileFieldCategory | `/ru/admin/profile-field-category/delete` | mutating | `$id` |
| ProfileFieldCategory | `/ru/admin/profile-field-category/index` | read_only | `` |
| ProfileFieldCategory | `/ru/admin/profile-field-category/update` | form_or_mutating | `$id` |
| Report | `/ru/admin/report/delete` | mutating | `$id` |
| Report | `/ru/admin/report/index` | read_only | `` |
| Search | `/ru/admin/search/get-results` | read_only | `$q` |
| Search | `/ru/admin/search/index` | read_only | `$q` |
| Settings | `/ru/admin/settings/app-status` | form_or_mutating | `` |
| Settings | `/ru/admin/settings/cached-data` | form_or_mutating | `` |
| Settings | `/ru/admin/settings/genders` | form_or_mutating | `` |
| Settings | `/ru/admin/settings/settings-currencies` | form_or_mutating | `` |
| Settings | `/ru/admin/settings/settings-prices` | form_or_mutating | `` |
| Theme | `/ru/admin/theme/activate` | mutating | `$themeId` |
| Theme | `/ru/admin/theme/index` | read_only | `` |
| User | `/ru/admin/user/block` | mutating | `$id` |
| User | `/ru/admin/user/confirm` | mutating | `$id` |
| User | `/ru/admin/user/delete` | mutating | `$id` |
| User | `/ru/admin/user/index` | read_only | `` |
| User | `/ru/admin/user/info` | read_only | `$id` |
| User | `/ru/admin/user/resend-password` | mutating | `$id` |
| User | `/ru/admin/user/toggle-admin` | mutating | `$id` |
| User | `/ru/admin/user/toggle-verification` | mutating | `$id` |
| User | `/ru/admin/user/update` | form_or_mutating | `$id` |
| User | `/ru/admin/user/update-balance` | form_or_mutating | `$id` |
| User | `/ru/admin/user/update-profile` | form_or_mutating | `$id` |
| Verification | `/ru/admin/verification/approve` | mutating | `$id` |
| Verification | `/ru/admin/verification/index` | read_only | `` |
| Verification | `/ru/admin/verification/reject` | mutating | `$id` |
