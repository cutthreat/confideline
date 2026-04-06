<?php

use custom\assets\ExpertLandingAsset;
use yii\helpers\Html;
use yii\helpers\Url;

ExpertLandingAsset::register($this);
$bodyClass = trim(($this->params['body.cssClass'] ?? '') . ' cl-expert-page');
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="icon" type="image/png" href="<?= Html::encode(Url::to('@web/YouDate-last/assets/favicon/favicon-96x96.png')) ?>" sizes="96x96">
    <title><?= Html::encode($this->title) ?></title>
    <?= Html::csrfMetaTags() ?>
    <?php $this->head() ?>
</head>
<body class="<?= Html::encode($bodyClass) ?>">
<?php $this->beginBody() ?>
<?= $content ?>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
