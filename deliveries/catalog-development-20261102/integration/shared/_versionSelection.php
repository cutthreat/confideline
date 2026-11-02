<?php
/** Integration sketch: adapters and view names must be bound to the existing application.
 * The server supplies validated versions; do not read these from a public query string.
 * Eligibility, audience restrictions and chat authorization belong to the shared server layer.
 */
$filterVersion = (int) $filterVersion;
$cardsVersion = (int) $cardsVersion;
if (!in_array($filterVersion, [1, 2], true) || !in_array($cardsVersion, [1, 2], true)) {
    throw new \InvalidArgumentException('Invalid catalog presentation version');
}
// Keep the application v1 view paths unchanged; these variables are owner-supplied adapters.
echo $this->render($filterVersion === 2 ? $newFilterView : $legacyFilterView, $filterParams);
if ($cardsVersion === 2) {
    \app\assets\ExpertCardsAsset::register($this);
}
echo $this->render($cardsVersion === 2 ? $newResultsView : $legacyResultsView, $resultsParams);
