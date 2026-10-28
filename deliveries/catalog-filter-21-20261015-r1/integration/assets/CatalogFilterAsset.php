<?php
namespace app\assets;

use yii\web\AssetBundle;

class CatalogFilterAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/catalog-filter';
    public $css = ['catalog-filter.css', 'expert-card.css'];
    public $js = ['catalog-filter.js', 'expert-card.js'];
    public $depends = ['yii\web\YiiAsset'];
}
