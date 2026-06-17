(function () {
    'use strict';

    document.documentElement.dataset.neuroRuntime = 'confideline-yii2-preview';

    if (!window.jQuery) {
        return;
    }

    window.jQuery(function ($) {
        $('body').addClass('neuro-runtime-ready');
    });
})();
