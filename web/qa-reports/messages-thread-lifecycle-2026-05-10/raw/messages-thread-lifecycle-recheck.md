# Messages Thread Lifecycle Recheck

- Status: PASS
- Sender: U167
- Recipient: U168
- Text: QA chat lifecycle text 2026-05-10T11-14-05-209Z sender 167 recipient 168

## Verdicts

- PASS: CHAT-TEXT-SEND - POST /en/messages/create вернул success=true, messageId=243.
- PASS: CHAT-RECIPIENT-DELIVERY - Получатель U2 видит точный текст в /en/messages/messages.
- PASS: CHAT-READ-CONVERSATION - POST /en/messages/read-conversation вернул {"success":true,"newMessagesCount":[],"message":"Updated"}.
- PASS: CHAT-IMAGE-UPLOAD - upload-images вернул success=true; recipient thread содержит признаки attachment=true.
- PASS: CHAT-SENDER-DELETE - delete success=true; sender sees deleted text=false; recipient sees deleted text=true.

