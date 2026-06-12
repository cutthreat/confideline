(function () {
  'use strict';

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function openTab(hash, writeHash) {
    var link = document.querySelector('.geo-tabs a[href="' + hash + '"]');
    var pane = document.querySelector(hash);

    if (!link || !pane) {
      return;
    }

    selectAll('.geo-tabs li').forEach(function (item) {
      item.classList.remove('active');
    });

    selectAll('.tab-pane').forEach(function (item) {
      item.classList.remove('active');
    });

    link.parentElement.classList.add('active');
    pane.classList.add('active');

    if (writeHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', hash);
    }
  }

  function initTabs() {
    selectAll('.geo-tabs a[href^="#tab-"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        openTab(link.getAttribute('href'), true);
      });
    });

    if (window.location.hash && document.querySelector(window.location.hash)) {
      openTab(window.location.hash, false);
    }
  }

  function copyText(value, button) {
    var textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    if (button) {
      button.classList.add('is-copied');
      window.setTimeout(function () {
        button.classList.remove('is-copied');
      }, 900);
    }
  }

  function initCopyButtons() {
    selectAll('[data-copy]').forEach(function (button) {
      button.addEventListener('click', function () {
        copyText(button.getAttribute('data-copy'), button);
      });
    });
  }

  function initCounters() {
    selectAll('.js-counted-field').forEach(function (field) {
      var max = parseInt(field.getAttribute('data-max'), 10);
      var group = field.closest('.form-group');
      var counter = group ? group.querySelector('.geo-field-counter') : null;

      function updateCounter() {
        if (!counter || !max) {
          return;
        }

        var length = field.value.length;
        counter.textContent = length + '/' + max;
        counter.classList.toggle('is-warning', length > max);
      }

      field.addEventListener('input', updateCounter);
      updateCounter();
    });
  }

  function readFormText() {
    var fields = selectAll('input, textarea');
    var editorText = document.querySelector('.geo-editor__body');
    var values = fields.map(function (field) {
      return field.value || '';
    });

    if (editorText) {
      values.push(editorText.textContent || '');
    }

    return values.join('\n');
  }

  function countReadyFaq() {
    return selectAll('.geo-faq-row').filter(function (row) {
      var question = row.querySelector('input');
      var answer = row.querySelector('textarea');
      return question && answer && question.value.trim() && answer.value.trim();
    }).length;
  }

  function setStatus(selector, text, state) {
    var item = document.querySelector(selector);

    if (!item) {
      return;
    }

    item.textContent = text;
    item.classList.remove('geo-status-item--ok', 'geo-status-item--warn', 'geo-status-item--info', 'is-warning', 'is-error');

    if (state === 'ok') {
      item.classList.add('geo-status-item--ok');
    } else if (state === 'warning') {
      item.classList.add('is-warning');
    } else if (state === 'error') {
      item.classList.add('is-error');
    } else {
      item.classList.add('geo-status-item--info');
    }
  }

  function renderStatusPanel() {
    var metaTitle = document.querySelector('.js-meta-title');
    var metaDescription = document.querySelector('.js-meta-description');
    var language = document.querySelector('.js-status-language-source');
    var active = document.querySelector('.js-status-active-source');
    var showMain = document.querySelector('.js-status-main-source');
    var mainPhoto = document.querySelector('.js-main-photo');
    var coverPhoto = document.querySelector('.js-cover-photo');
    var robots = document.querySelector('.js-robots-source');
    var schemaType = document.querySelector('.js-schema-type-source');
    var hreflang = document.querySelector('.js-hreflang-source');
    var editorText = document.querySelector('.geo-editor__body');
    var faqCount = countReadyFaq();
    var formText = readFormText();
    var seoReady = metaTitle && metaDescription && metaTitle.value.trim() && metaDescription.value.trim() && metaTitle.value.length <= 70 && metaDescription.value.length <= 160 && !/\bNeiro\b/i.test(formText) && robots && robots.value === 'index, follow' && schemaType && schemaType.value !== 'Без JSON-LD' && hreflang && hreflang.value !== 'Не выводить';
    var htmlReady = editorText && editorText.textContent.trim().length > 0;
    var photoCount = 0;

    if (mainPhoto && mainPhoto.value && mainPhoto.value !== '0') {
      photoCount += 1;
    }

    if (coverPhoto && coverPhoto.value && coverPhoto.value !== '0') {
      photoCount += 1;
    }

    setStatus('.js-status-language', 'Language: ' + (language ? language.options[language.selectedIndex].text : 'не выбран'), language && language.value ? 'ok' : 'warning');
    setStatus('.js-status-active', active && active.value === 'Активно' ? 'Активно' : 'Не активно', active && active.value === 'Активно' ? 'ok' : 'warning');
    setStatus('.js-status-main', showMain && showMain.checked ? 'Show on main' : 'Не на main', showMain && showMain.checked ? 'ok' : 'info');
    setStatus('.js-status-html', htmlReady ? 'HTML заполнен' : 'HTML пустой', htmlReady ? 'ok' : 'warning');
    setStatus('.js-status-seo', seoReady ? 'SEO заполнено' : 'SEO проверить', seoReady ? 'ok' : 'warning');
    setStatus('.js-status-photo', 'Фото ' + photoCount + '/2', photoCount === 2 ? 'ok' : 'warning');
    setStatus('.js-status-faq', 'FAQ: ' + faqCount + ' вопроса', faqCount >= 4 ? 'info' : 'warning');
  }

  function initStatusPanel() {
    selectAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', renderStatusPanel);
      field.addEventListener('change', renderStatusPanel);
    });

    selectAll('select').forEach(function (field) {
      field.addEventListener('change', renderStatusPanel);
    });

    renderStatusPanel();
  }

  function initAjaxPreview() {
    selectAll('[data-geo-ajax-preview]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.querySelector(button.getAttribute('data-target'));
        if (!target) {
          return;
        }

        target.textContent = 'AJAX preview: контроллер возвращает HTML предпросмотра текущей языковой версии.';
        target.classList.add('alert', 'alert-info');
      });
    });
  }

  function openImagePreview(trigger) {
    var image = trigger.querySelector('img');
    var modal = document.getElementById('geoImagePreviewModal');

    if (!image) {
      return;
    }

    if (!modal || !window.jQuery || !jQuery.fn || !jQuery.fn.modal) {
      window.open(image.getAttribute('src'), '_blank');
      return;
    }

    var title = trigger.getAttribute('data-preview-title') || image.getAttribute('alt') || 'Просмотр изображения';
    var description = trigger.getAttribute('data-preview-description') || image.getAttribute('alt') || '';
    var previewImage = modal.querySelector('.js-image-preview-full');
    var caption = modal.querySelector('.js-image-preview-caption');
    var titleNode = modal.querySelector('#geoImagePreviewTitle');

    if (titleNode) {
      titleNode.textContent = title;
    }

    if (previewImage) {
      previewImage.setAttribute('src', image.getAttribute('src'));
      previewImage.setAttribute('alt', image.getAttribute('alt') || title);
    }

    if (caption) {
      caption.textContent = description;
    }

    jQuery(modal).modal('show');
  }

  function initImagePreview() {
    selectAll('[data-geo-image-preview]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openImagePreview(trigger);
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImagePreview(trigger);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initCopyButtons();
    initCounters();
    initStatusPanel();
    initAjaxPreview();
    initImagePreview();

    if (window.jQuery && jQuery.fn && jQuery.fn.tooltip) {
      jQuery('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'hover focus'
      });
    }
  });
}());
