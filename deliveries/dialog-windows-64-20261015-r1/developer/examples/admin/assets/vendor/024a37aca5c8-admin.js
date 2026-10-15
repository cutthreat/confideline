var app = {
    _baseUrl: null,
    init: function() {
        this._baseUrl =  $('meta[name=baseUrl]').attr("content");
    },
    getUrl: function(url) {
        return this._baseUrl + url;
    },
    t: function(category, message) {
        return message;
    }
};

var isEdge = window.navigator.userAgent.indexOf("Edge") > -1;
var isChrome = !!window.chrome && !isOpera;
var isExplorer= typeof document !== 'undefined' && !!document.documentMode && !isEdge;
var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

$(document).ready(function() {

    var $body = $('body'),
        $window = $(window),
        $document = $(document),
        $contentFade = $('.content-fade');

    app.init();

    /**
     * Tooltip plugin
     */
    $body.tooltip({
        selector: '[rel=tooltip]'
    });

    /**
     * Fancybox
     */
    $('[data-fancybox]').fancybox({
        toolbar: false,
        clickContent: 'close',
        clickSlide: 'close'
    });

    /**
     * Messenger plugin
     */
    Messenger.options = {
        extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left',
        theme: 'flat'
    };
    $(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
        var data = eval("(" + jqXHR.responseText + ")");
        Messenger().post({
            message: data.message,
            type: 'error',
            hideAfter: 5,
            hideOnNavigate: true
        });
    });


    $body.on('click', '.list-view .btn-action', function (event) {
        var $btn = $(this), $listItem = $btn.closest('.list-item');
        $listItem.find('.btn').attr('disabled', 'disabled');
        $.ajax({
            url: $btn.attr('data-url'),
            method: 'post',
            success: function(data) {
                if (data.success) {
                    Messenger().post({
                        message: data.message,
                        type: 'success',
                        hideAfter: 5,
                        hideOnNavigate: true
                    });
                    $.pjax.reload({ container: '#pjax-list-view' });
                } else {
                    Messenger().post({
                        message: data.message,
                        type: 'error',
                        hideAfter: 5,
                        hideOnNavigate: true
                    });
                }
            },
            complete: function() {
                $listItem.find('.btn').attr('disabled', false);
            }
        });
    });

    $body.on('click', '.btn-slow-action', function (event) {
        var $btn = $(this);
        $btn.addClass('is-loading btn-disabled').attr('disabled', 'disabled');
        $btn.html('<i class="fa fa-refresh fa-spin fa-fw"></i>');
    });

    /*
     * Pages editor
     */
    var pageEdited = false;
    $body.on('change', '#pages textarea', function (event) {
        pageEdited = true
    });
    $body.on('change', '.pages-language-picker', function (event) {
        var $this = $(this), initialLanguage = $this.attr('data-initial-language');
        if (pageEdited) {
            bootbox.confirm($(this).attr('data-unsaved-warning'), function(confirmed) {
                if (confirmed) {
                    window.location = $(this).attr('data-route') + '&language=' + $(this).val();
                } else {
                    $this.val(initialLanguage);
                }
            });
        }
        window.location = $(this).attr('data-route') + '&language=' + $(this).val();
    });

    /**
     * Select2
     */
    $body.on('click', '.select2-clear', function (event) {
        const $select = $(this).closest('td').find('select');
        $select.val(null);
        $select.append('<option value="" selected></option>');
        $select.trigger('change');
    });

    /**
     * Header search
     */
    var searchResultsShown = false,
        isGettingSearchResults = false,
        $searchSelection,
        lastResults,
        $headerSearchQuery = $('.header-search-query'),
        currentQuery = $headerSearchQuery.val(),
        $headerSearchResults = $('.header-search-results'),
        $headerSearchLoader = $('.header-search-results .loader');
    $headerSearchQuery.on('keyup', function (event) {
        var $query = $(this);
        if ($query.val().length === 0) {
            hideSearch();
        } else {
            showSearch();
            if (event.keyCode !== 13 && event.keyCode !== 27 && event.keyCode !== 38 && event.keyCode !== 40) {
                loadSearchResults();
            }
        }
    });
    $headerSearchQuery.on('focus click', function (event) {
        if (!searchResultsShown && $headerSearchQuery.val().length) {
            showSearch();
        }
    });
    $contentFade.on('click', function (event) {
        if (searchResultsShown) {
            hideSearch();
        }
    });
    $body.on('keyup', function (event) {
        if (!searchResultsShown) {
            return;
        }
        if (event.keyCode === 27) {
            return hideSearch();
        }
        if (event.keyCode === 13) {
            return clickSearchSelection();
        }
    });
    $headerSearchQuery.on('keydown', function (event) {
        if (!searchResultsShown) {
            return;
        }
        if (event.keyCode === 13) {
            if ($searchSelection.length) {
                clickSearchSelection();
                return false;
            }
        }
        if (event.keyCode === 38) {
            moveSearchSelection('up');
            return false;
        }
        if (event.keyCode === 40) {
            moveSearchSelection('down');
            return false;
        }
    });
    function showSearch() {
        $headerSearchResults.removeClass('hidden');
        $contentFade.addClass('fade-active');
        searchResultsShown = true;
        if ($headerSearchQuery.length && $headerSearchQuery.val()) {
            loadSearchResults();
        }
    }
    function hideSearch() {
        $headerSearchResults.addClass('hidden');
        $contentFade.removeClass('fade-active');
        searchResultsShown = false;
    }
    function loadSearchResults() {
        if (currentQuery === $headerSearchQuery.val() && lastResults) {
            return;
        }
        currentQuery = $headerSearchQuery.val();
        isGettingSearchResults = true;
        $headerSearchLoader.addClass('active');
        $.ajax({
            url: $headerSearchQuery.attr('data-load-results-url') + '?q=' + $headerSearchQuery.val(),
            success: function (response) {
                lastResults = response.results;
                $headerSearchResults.find('.results').html(response.results);
            },
            complete: function () {
                isGettingSearchResults = false;
                $headerSearchLoader.removeClass('active');
            }
        });
    }
    function moveSearchSelection(direction) {
        var $newSearchSelection;
        $searchSelection = $headerSearchResults.find('.header-search-group a.selected');

        if (direction === 'down') {
            if (!$searchSelection.length) {
                $searchSelection = $headerSearchResults.find('.header-search-group a').first();
                $searchSelection.addClass('selected');
                return;
            }
            $newSearchSelection = $searchSelection.next();
            if (!$newSearchSelection.length) {
                $newSearchSelection = $searchSelection
                    .closest('.header-search-group')
                    .next()
                    .find('a:first-child');
            }
        } else if (direction === 'up') {
            if (!$searchSelection.length) {
                $searchSelection = $headerSearchResults.find('.header-search-group a').last();
                $searchSelection.addClass('selected');
                return;
            }
            $newSearchSelection = $searchSelection.prev();
            if (!$newSearchSelection.length)   {
                $newSearchSelection = $searchSelection
                    .closest('.header-search-group')
                    .prev()
                    .find('a:last-child');
            }
        }

        if ($newSearchSelection.length) {
            $searchSelection.removeClass('selected');
            $searchSelection = $newSearchSelection;
            $searchSelection.addClass('selected');
        }
    }
    function clickSearchSelection() {
        window.location.href = $searchSelection.attr('href');
    }

});

function appBaseUrl() {
    return $('meta[name=baseUrl]').attr("content");
}

function first(p) {
    for (var i in p) {
        return p[i];
    }
}

function showHtmlInModal(modalId, urlForGetHtml, headerContent, type, width) {
    type = type || 'post';

    var $modal = $('#' + modalId);
    var $dialog = $modal.find('.modal-dialog');
    var $content = $modal.find('#ajax-modal-content');
    var $header = $modal.find('#modal-header-content');

    $content.html('<div class="text-center"><i class="fa fa-refresh fa-spin fa-2x"></i></div>');
    $header.html(headerContent || '');
    $dialog.css('width', width ? width : '');
    $modal.modal('show');

    $.ajax({
        url: urlForGetHtml,
        type: type,
        dataType: 'html',
        success: function(response) {
            if (typeof response !== 'undefined') {
                $content.html(response);
                $content.find(':input:visible:first').trigger('focus');
            }
        },
        error: function() {
            Messenger().post({
                message: 'Failed to load modal content',
                type: 'error',
                hideAfter: 5,
                hideOnNavigate: true
            });
            $modal.modal('hide');
        }
    });
}
