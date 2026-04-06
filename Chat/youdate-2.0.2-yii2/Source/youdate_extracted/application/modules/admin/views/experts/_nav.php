<?php

use app\helpers\Url;

/** @var string $active */
?>
<div class="nav-tabs-custom">
    <ul class="nav nav-tabs">
        <li class="<?= $active === 'applications' ? 'active' : '' ?>">
            <a href="<?= Url::to(['expert-application/index']) ?>"><?= Yii::t('app', 'Applications') ?></a>
        </li>
        <li class="<?= $active === 'landing' ? 'active' : '' ?>">
            <a href="<?= Url::to(['expert-page/index']) ?>"><?= Yii::t('app', 'Landing page') ?></a>
        </li>
    </ul>
    <div class="tab-content no-padding"></div>
</div>
