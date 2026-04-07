<?php

use app\helpers\Html;
use app\helpers\Url;
use app\modules\admin\assets\AdminAgentChatAsset;
use yii\helpers\Json;
use yii\web\View;

/** @var $this \yii\web\View */

$translatorEnabled = (bool) Yii::$app->settings->get('common', 'translatorEnabled', false);

$this->title = Yii::t('app', 'Manage messages');
$this->params['breadcrumbs'][] = $this->title;

AdminAgentChatAsset::register($this);

$config = [
    'endpoints' => [
        'conversations' => Url::to(['conversations']),
        'messages' => Url::to(['messages']),
        'send' => Url::to(['send']),
        'translate' => Url::to(['translate']),
    ],
    'pollInterval' => 15000,
    'maxTextLength' => 1000,
    'translator' => [
        'enabled' => $translatorEnabled,
    ],
    'labels' => [
        'emptyValue' => '-',
        'selectConversation' => Yii::t('app', 'Select conversation'),
        'unreadPrefix' => Yii::t('app', 'Unread') . ': ',
        'statusConnected' => Yii::t('app', 'Connected'),
        'statusUpdating' => Yii::t('app', 'Updating...'),
        'statusIssue' => Yii::t('app', 'Connection issue'),
        'noConversationMessages' => Yii::t('app', 'Select conversation to load messages'),
        'noMessagesInConversation' => Yii::t('app', 'No messages in this conversation'),
        'errorLoadMessages' => Yii::t('app', 'Could not load messages'),
        'errorLoadConversations' => Yii::t('app', 'Could not load conversations'),
        'errorMessageTooLong' => Yii::t('app', 'Message is too long'),
        'errorInvalidSender' => Yii::t('app', 'Invalid sender'),
        'errorSendMessage' => Yii::t('app', 'Could not send message'),
        'errorTranslateMessage' => Yii::t('app', 'Could not translate message'),
        'translateAction' => Yii::t('app', 'Translate'),
        'translateReady' => Yii::t('app', 'Translation for expert'),
        'translateLoading' => Yii::t('app', 'Translating...'),
        'translateProviderPrefix' => Yii::t('app', 'Provider') . ': ',
    ],
];

$this->registerJs('window.AdminAgentChatConfig = ' . Json::htmlEncode($config) . ';', View::POS_HEAD);
?>

<section class="content aac-content" data-ng-component="admin-chat-shell" data-version="v.5-angular-ready" id="admin-agent-chat">
    <article class="box box-solid aac" data-ng-region="layout">
        <header class="box-header with-border aac__topbar">
            <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Agent chat')) ?></h3>
            <div class="aac__topbar-actions">
                <div class="aac__status" data-role="connection-status">
                    <span class="aac__status-dot"></span>
                    <span class="aac__status-label" data-role="connection-label"><?= Html::encode(Yii::t('app', 'Connected')) ?></span>
                </div>
                <a class="btn btn-default btn-sm" href="<?= Url::to(['expert-preview']) ?>">
                    <i class="fa fa-columns"></i> <?= Html::encode(Yii::t('app', 'CRM preview')) ?>
                </a>
                <a class="btn btn-default btn-sm" href="<?= Url::to(['index', 'legacy' => 1]) ?>">
                    <i class="fa fa-table"></i> <?= Html::encode(Yii::t('app', 'Legacy table')) ?>
                </a>
                <button class="btn btn-default btn-sm" data-role="refresh" type="button">
                    <i class="fa fa-refresh"></i>
                </button>
            </div>
        </header>

        <div class="box-body aac__body">
            <div class="aac__layout">
                <aside class="aac__pane aac__pane--list" data-ng-region="conversations">
                    <header class="aac__pane-head">
                        <form class="aac__search" data-role="search-form">
                            <div class="input-group input-group-sm">
                                <input autocomplete="off" class="form-control" data-role="search-input" placeholder="<?= Html::encode(Yii::t('app', 'Search by user name, username, id, text')) ?>" type="text">
                                <span class="input-group-btn">
                                    <button class="btn btn-default" type="submit">
                                        <i class="fa fa-search"></i>
                                    </button>
                                </span>
                            </div>
                        </form>
                        <div class="aac__summary">
                            <span><?= Html::encode(Yii::t('app', 'Conversations')) ?>:</span>
                            <strong data-role="conversation-count">0</strong>
                        </div>
                    </header>

                    <div class="aac__scroll">
                        <ul class="list-group aac__conversation-list" data-role="conversation-list"></ul>
                        <div class="aac__empty" data-role="conversation-empty">
                            <?= Html::encode(Yii::t('app', 'No conversations found')) ?>
                        </div>
                    </div>
                </aside>

                <article class="aac__pane aac__pane--chat" data-ng-region="conversation">
                    <header class="aac__pane-head aac__chat-head">
                        <div class="aac__chat-title">
                            <div class="aac__route" data-role="conversation-route"><?= Html::encode(Yii::t('app', 'Select conversation')) ?></div>
                            <div class="aac__route-sub" data-role="conversation-subtitle">-</div>
                        </div>
                        <div class="aac__chat-head-actions">
                            <span class="label label-default" data-role="unread-badge"><?= Html::encode(Yii::t('app', 'Unread: {n}', ['n' => 0])) ?></span>
                        </div>
                    </header>

                    <div class="aac__scroll aac__messages" data-role="message-list">
                        <div class="aac__empty aac__empty--messages">
                            <?= Html::encode(Yii::t('app', 'Select conversation to load messages')) ?>
                        </div>
                    </div>

                    <footer class="aac__composer">
                        <div class="aac__composer-row">
                            <label class="aac__label" for="aac-sender"><?= Html::encode(Yii::t('app', 'Send as')) ?></label>
                            <select class="form-control input-sm" data-role="sender-select" id="aac-sender"></select>
                        </div>
                        <form class="aac__composer-form" data-role="send-form">
                            <textarea class="form-control" data-role="message-input" maxlength="1000" placeholder="<?= Html::encode(Yii::t('app', 'Type a message')) ?>" rows="3"></textarea>
                            <button class="btn btn-primary" data-role="send-button" type="submit">
                                <i class="fa fa-paper-plane"></i> <?= Html::encode(Yii::t('app', 'Send')) ?>
                            </button>
                        </form>
                        <div class="aac__hint">
                            <?= Html::encode(Yii::t('app', 'Enter sends message, Shift+Enter adds new line')) ?>
                        </div>
                    </footer>
                </article>

                <aside class="aac__pane aac__pane--meta" data-ng-region="details">
                    <header class="aac__pane-head">
                        <h4 class="aac__meta-title"><?= Html::encode(Yii::t('app', 'Participants')) ?></h4>
                    </header>
                    <div class="aac__scroll aac__meta-scroll">
                        <section class="aac__meta-card">
                            <h5 class="aac__meta-card-title" data-role="meta-a-name">-</h5>
                            <dl class="aac__meta-dl">
                                <dt><?= Html::encode(Yii::t('app', 'ID')) ?></dt>
                                <dd data-role="meta-a-id">-</dd>
                                <dt><?= Html::encode(Yii::t('app', 'Username')) ?></dt>
                                <dd data-role="meta-a-username">-</dd>
                                <dt><?= Html::encode(Yii::t('app', 'Status')) ?></dt>
                                <dd data-role="meta-a-status">-</dd>
                            </dl>
                        </section>

                        <section class="aac__meta-card">
                            <h5 class="aac__meta-card-title" data-role="meta-b-name">-</h5>
                            <dl class="aac__meta-dl">
                                <dt><?= Html::encode(Yii::t('app', 'ID')) ?></dt>
                                <dd data-role="meta-b-id">-</dd>
                                <dt><?= Html::encode(Yii::t('app', 'Username')) ?></dt>
                                <dd data-role="meta-b-username">-</dd>
                                <dt><?= Html::encode(Yii::t('app', 'Status')) ?></dt>
                                <dd data-role="meta-b-status">-</dd>
                            </dl>
                        </section>

                        <section class="aac__meta-card">
                            <h5 class="aac__meta-card-title"><?= Html::encode(Yii::t('app', 'Conversation')) ?></h5>
                            <dl class="aac__meta-dl">
                                <dt><?= Html::encode(Yii::t('app', 'Last message')) ?></dt>
                                <dd data-role="meta-last-message">-</dd>
                                <dt><?= Html::encode(Yii::t('app', 'Last activity')) ?></dt>
                                <dd data-role="meta-last-time">-</dd>
                            </dl>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    </article>
</section>
