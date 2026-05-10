# Confideline Group Media Moderation Modes Audit

- Status: PASS_WITH_WARNINGS
- Started: 2026-05-09T09:22:32.678Z
- Finished: 2026-05-09T09:40:34.015Z
- Settings URL: https://confideline.com/en/admin/settings/groups
- Group: QA Moderation Probe 1777790356509 / qa-moderation-probe-1777790356509 / 10
- Owner: Kaelir Tamm / KaelirTamm / 167
- Original avatar/cover modes: premoderation / premoderation
- Restored avatar/cover modes: premoderation / premoderation
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-moderation-modes-audit.png

## Findings

- GROUP-MEDIA-PREMODERATION-UPLOAD [fact/info]: Premoderation: all 3 logo and cover upload attempts replaced media paths with distinct generated images.
- GROUP-MEDIA-POSTMODERATION-UPLOAD [fact/info]: Postmoderation: all 3 logo and cover upload attempts replaced media paths with distinct generated images.
- GROUP-MEDIA-POSTMODERATION-PUBLIC-VISIBILITY [fact/info]: Postmoderation: submitted logo/cover was visible on public group page after upload.
- GROUP-MEDIA-NONE-UPLOAD [fact/info]: No moderation: all 3 logo and cover upload attempts replaced media paths with distinct generated images.
- GROUP-MEDIA-NONE-PUBLIC-VISIBILITY [fact/info]: No moderation: submitted logo/cover was visible on public group page after upload.
- GROUP-MEDIA-NONE-STILL-IN-QUEUE [warn/medium]: No moderation mode still leaves group media rows visible in admin media approvals; this may be history leakage or a queue bug.

## Modes

### Premoderation (premoderation)

- Applied avatar/cover modes: premoderation / premoderation
- Expected behavior: new media should require admin approval before becoming final
- Uploads changed on all attempts: true
- Distinct generated assets used: 6
- Admin logo/cover statuses by attempt: Rejected/Rejected, Rejected/Rejected, Rejected/Rejected
- Public visibility by attempt: #1: afterVisible=false, #2: afterVisible=false, #3: afterVisible=false

#### Attempt 1

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-logo-attempt-1.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-cover-attempt-1.jpg
- Logo path changed: true (/1/QbeyHhAxkN-JkDexm8PHPZGpFIADJ1EU.webp -> /1/ldp_z63FNkP2_3JMfy6nz8qORoxmbiac.webp)
- Cover path changed: true (/1/v9yV6Qw3PZCXNfyWvF1sfDDpBwsPvnR3.webp -> /1/l5Mn613pWogx7PCtjm5ri_axYeOEKLVF.webp)
- Admin logo status: Rejected
- Admin cover status: Rejected
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-1.png
- Public visibility: owner: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=true, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-1-owner-public.png | viewer: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=true, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-1-viewer-public.png

#### Attempt 2

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-logo-attempt-2.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-cover-attempt-2.jpg
- Logo path changed: true (/1/ldp_z63FNkP2_3JMfy6nz8qORoxmbiac.webp -> /1/24nTs3f-mqCmCllkehjXAYnrbh9FEcbZ.webp)
- Cover path changed: true (/1/l5Mn613pWogx7PCtjm5ri_axYeOEKLVF.webp -> /1/GzaBlTGhwe_GOxjO1KPMj7kbOJdTyG3c.webp)
- Admin logo status: Rejected
- Admin cover status: Rejected
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-2.png
- Public visibility: owner: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-2-owner-public.png | viewer: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-2-viewer-public.png

#### Attempt 3

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-logo-attempt-3.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\premoderation-cover-attempt-3.jpg
- Logo path changed: true (/1/24nTs3f-mqCmCllkehjXAYnrbh9FEcbZ.webp -> /1/HtSKLGgjHEy2NZb7y9z1f3L1xZsGGWkd.webp)
- Cover path changed: true (/1/GzaBlTGhwe_GOxjO1KPMj7kbOJdTyG3c.webp -> /1/asYgs1KifYnyOBcvGemCQinciCk9rJWS.webp)
- Admin logo status: Rejected
- Admin cover status: Rejected
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-3.png
- Public visibility: owner: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-3-owner-public.png | viewer: afterPhoto=false, afterCover=false, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-premoderation-attempt-3-viewer-public.png

### Postmoderation (postmoderation)

- Applied avatar/cover modes: postmoderation / postmoderation
- Expected behavior: new media may become visible first, but should remain reviewable by admin
- Uploads changed on all attempts: true
- Distinct generated assets used: 6
- Admin logo/cover statuses by attempt: Approved/Approved, Approved/Approved, Approved/Approved
- Public visibility by attempt: #1: afterVisible=true, #2: afterVisible=true, #3: afterVisible=true

#### Attempt 1

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-logo-attempt-1.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-cover-attempt-1.jpg
- Logo path changed: true (/1/HtSKLGgjHEy2NZb7y9z1f3L1xZsGGWkd.webp -> /1/ET9H9a8TL0L3G2oAhAKoz8H3sYSCaAi1.webp)
- Cover path changed: true (/1/asYgs1KifYnyOBcvGemCQinciCk9rJWS.webp -> /1/yGuo00V6_44FtdWmCi5vPUrgbDPuvNmt.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-1.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-1-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-1-viewer-public.png

#### Attempt 2

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-logo-attempt-2.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-cover-attempt-2.jpg
- Logo path changed: true (/1/ET9H9a8TL0L3G2oAhAKoz8H3sYSCaAi1.webp -> /1/f928GJYT2N_4FyupmoUPSr5hmk9xlZst.webp)
- Cover path changed: true (/1/yGuo00V6_44FtdWmCi5vPUrgbDPuvNmt.webp -> /1/ryGExpt8lAfmbCy_ET0xTk-eDgXXFHn6.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-2.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-2-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-2-viewer-public.png

#### Attempt 3

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-logo-attempt-3.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\postmoderation-cover-attempt-3.jpg
- Logo path changed: true (/1/f928GJYT2N_4FyupmoUPSr5hmk9xlZst.webp -> /1/3R4_6T92HdxI92S53bWOFdhLtJooyb7h.webp)
- Cover path changed: true (/1/ryGExpt8lAfmbCy_ET0xTk-eDgXXFHn6.webp -> /1/Hh2IbddykZGOlbYiF-vjCtdXOl-6gBHa.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-3.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-3-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-postmoderation-attempt-3-viewer-public.png

### No moderation (none)

- Applied avatar/cover modes: none / none
- Expected behavior: new media should be accepted without moderation queue dependency
- Uploads changed on all attempts: true
- Distinct generated assets used: 6
- Admin logo/cover statuses by attempt: Approved/Approved, Approved/Approved, Approved/Approved
- Public visibility by attempt: #1: afterVisible=true, #2: afterVisible=true, #3: afterVisible=true

#### Attempt 1

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-logo-attempt-1.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-cover-attempt-1.jpg
- Logo path changed: true (/1/3R4_6T92HdxI92S53bWOFdhLtJooyb7h.webp -> /1/VSgNmXJ_e8HPOzcrdbJ1QuPQ9p68fLxV.webp)
- Cover path changed: true (/1/Hh2IbddykZGOlbYiF-vjCtdXOl-6gBHa.webp -> /1/Iu6Hj5tJzqyT8QfnCh_8cx5MtpiZ0tP9.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-1.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-1-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-1-viewer-public.png

#### Attempt 2

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-logo-attempt-2.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-cover-attempt-2.jpg
- Logo path changed: true (/1/VSgNmXJ_e8HPOzcrdbJ1QuPQ9p68fLxV.webp -> /1/r_gpBzF7bVLRjo5Mc0bsDbpTUh_U7Y4D.webp)
- Cover path changed: true (/1/Iu6Hj5tJzqyT8QfnCh_8cx5MtpiZ0tP9.webp -> /1/hsT4HseKsGvkdTy2koTxXIfVkxoU6mp4.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-2.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-2-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-2-viewer-public.png

#### Attempt 3

- Logo asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-logo-attempt-3.jpg
- Cover asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-moderation-mode-assets\none-cover-attempt-3.jpg
- Logo path changed: true (/1/r_gpBzF7bVLRjo5Mc0bsDbpTUh_U7Y4D.webp -> /1/x3bqlQtTv90lr9sAkeUR6ybpgQTgH6Lo.webp)
- Cover path changed: true (/1/hsT4HseKsGvkdTy2koTxXIfVkxoU6mp4.webp -> /1/-0yDNMqyDWNbXl9xoTvaD9HTj5BOg_Vi.webp)
- Admin logo status: Approved
- Admin cover status: Approved
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-3.png
- Public visibility: owner: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-3-owner-public.png | viewer: afterPhoto=false, afterCover=true, beforePhoto=false, beforeCover=false, screenshot=H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-media-none-attempt-3-viewer-public.png

## Errors

- none
