# Premium Messages Recipient Delivery Audit

- Status: FAIL_WITH_ROLLBACK
- Sender: 182
- Targets: 6, 10, 6, 10, 6, 10, 6, 10, 6, 10
- Rollback: OK

## Attempts
- attempt 1 -> target 6: send=success, recipientVisible=true
- attempt 2 -> target 10: send=success, recipientVisible=true
- attempt 3 -> target 6: send=success, recipientVisible=true
- attempt 4 -> target 10: send=success, recipientVisible=true
- attempt 5 -> target 6: send=success, recipientVisible=true
- attempt 6 -> target 10: send=success, recipientVisible=true
- attempt 7 -> target 6: send=success, recipientVisible=true
- attempt 8 -> target 10: send=success, recipientVisible=true
- attempt 9 -> target 6: send=success, recipientVisible=true
- attempt 10 -> target 10: send=success, recipientVisible=true

## Checks
- PASS: messagesOutPremium limits set to 1
- FAIL: sender accepted messages beyond premium limit
- FAIL: recipient side received exact message text
- PASS: rollback messagesOutPremium settings

## Findings
- major: PREMIUM-MESSAGES-OUT-LIMIT-BYPASS-DELIVERED-TO-RECIPIENTS - messagesOutPremium limit did not block extra sends; recipient delivery is proven for visible recipient-side messages

## Errors
- none