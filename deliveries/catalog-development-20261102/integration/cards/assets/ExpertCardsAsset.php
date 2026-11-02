<?php
namespace app\assets;
use yii\web\AssetBundle;
class ExpertCardsAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/expert-cards';
    public $css = ['expert-card.css'];
    public $js = ['expert-card.js'];
    public $depends = ['yii\web\YiiAsset'];
}
