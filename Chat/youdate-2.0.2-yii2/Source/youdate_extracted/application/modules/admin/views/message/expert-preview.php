<?php

use app\helpers\Html;

$this->title = Yii::t('app', 'Expert Chat CRM Preview');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Messages'), 'url' => ['chat']];
$this->params['breadcrumbs'][] = $this->title;

$this->registerCss(<<<CSS
#expert-crm-preview {
  color: #203246;
}
#expert-crm-preview .kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
#expert-crm-preview .kpi,
#expert-crm-preview .panel-card {
  background: #fff;
  border: 1px solid #dde5ee;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(23, 35, 52, 0.06);
}
#expert-crm-preview .kpi {
  padding: 14px 16px;
}
#expert-crm-preview .shell {
  display: grid;
  grid-template-columns: 330px 1fr 340px;
  gap: 14px;
}
#expert-crm-preview .k-label,
#expert-crm-preview .mini-label {
  font-size: 11px;
  color: #6e7e8d;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: .02em;
}
#expert-crm-preview .k-value {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  color: #213247;
}
#expert-crm-preview .k-sub {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #728292;
  line-height: 1.45;
}
#expert-crm-preview .panel-head {
  padding: 14px 16px;
  border-bottom: 1px solid #e8edf3;
}
#expert-crm-preview .panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #203246;
}
#expert-crm-preview .panel-sub {
  margin-top: 5px;
  font-size: 12px;
  color: #718190;
  line-height: 1.45;
}
#expert-crm-preview .panel-body {
  padding: 14px;
}
#expert-crm-preview .search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
#expert-crm-preview .search-row .form-control {
  height: 38px;
  border-radius: 9px;
}
#expert-crm-preview .filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}
#expert-crm-preview .chips,
#expert-crm-preview .btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
#expert-crm-preview .chip {
  padding: 7px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 12px;
  font-weight: 700;
  color: #4f6274;
}
#expert-crm-preview .chip.active {
  background: #3c8dbc;
  color: #fff;
}
#expert-crm-preview .queue-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 980px;
  overflow: auto;
  margin-top: 12px;
}
#expert-crm-preview .queue-item {
  padding: 12px;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #fff;
}
#expert-crm-preview .queue-item.active {
  border-color: #3c8dbc;
  box-shadow: inset 0 0 0 1px #3c8dbc;
  background: #f7fbff;
}
#expert-crm-preview .queue-top,
#expert-crm-preview .chat-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
#expert-crm-preview .queue-person {
  display: flex;
  gap: 10px;
}
#expert-crm-preview .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 44px;
}
#expert-crm-preview .name {
  font-weight: 700;
  color: #203246;
  font-size: 15px;
}
#expert-crm-preview .route,
#expert-crm-preview .time,
#expert-crm-preview .meta {
  font-size: 12px;
  color: #718190;
  line-height: 1.45;
}
#expert-crm-preview .snippet {
  margin-top: 4px;
  font-size: 13px;
  color: #324659;
  line-height: 1.45;
}
#expert-crm-preview .queue-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}
#expert-crm-preview .tag,
#expert-crm-preview .pill {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
#expert-crm-preview .tag {
  background: #edf3f8;
  color: #4f6274;
}
#expert-crm-preview .tag.blue,
#expert-crm-preview .pill.blue {
  background: #e7f2fb;
  color: #2f79ab;
}
#expert-crm-preview .tag.green,
#expert-crm-preview .pill.green {
  background: #e8f7ef;
  color: #2a8a57;
}
#expert-crm-preview .tag.orange,
#expert-crm-preview .pill.orange {
  background: #fff4e6;
  color: #b66e00;
}
#expert-crm-preview .tag.red,
#expert-crm-preview .pill.red {
  background: #fdecec;
  color: #c94f4f;
}
#expert-crm-preview .chat-bar {
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #dce6ef;
  border-radius: 12px;
  background: #fbfdff;
}
#expert-crm-preview .duo {
  display: flex;
  align-items: center;
  gap: 8px;
}
#expert-crm-preview .duo img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
#expert-crm-preview .route-title {
  font-size: 17px;
  font-weight: 700;
  color: #1f3246;
}
#expert-crm-preview .signals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
#expert-crm-preview .signal {
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fafcff;
}
#expert-crm-preview .signal .value {
  display: block;
  margin-top: 7px;
  font-size: 14px;
  font-weight: 700;
  color: #223448;
  line-height: 1.4;
}
#expert-crm-preview .timeline {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  background: #f8fafc;
  max-height: 770px;
  overflow: auto;
}
#expert-crm-preview .system-event {
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px dashed #cdd9e5;
  border-radius: 10px;
  background: #f3f8fc;
  color: #4d6175;
  font-size: 12px;
  line-height: 1.45;
}
#expert-crm-preview .day {
  text-align: center;
  margin: 12px 0;
}
#expert-crm-preview .day span {
  padding: 5px 10px;
  border-radius: 999px;
  background: #e9eef5;
  color: #6c7b8c;
  font-size: 11px;
  font-weight: 700;
}
#expert-crm-preview .message-row {
  display: flex;
  margin-bottom: 12px;
}
#expert-crm-preview .message-row.out {
  justify-content: flex-end;
}
#expert-crm-preview .bubble {
  max-width: 76%;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid #d9e4ef;
  background: #fff;
}
#expert-crm-preview .message-row.out .bubble {
  background: #3c8dbc;
  border-color: #3c8dbc;
  color: #fff;
}
#expert-crm-preview .message-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #6f8092;
  margin-bottom: 7px;
}
#expert-crm-preview .message-row.out .message-meta {
  color: rgba(255, 255, 255, .82);
}
#expert-crm-preview .message-text {
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}
#expert-crm-preview .composer {
  margin-top: 12px;
  border: 1px solid #dfe6ee;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}
#expert-crm-preview .composer-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #ebeff4;
  background: #fafcff;
}
#expert-crm-preview .composer-body {
  padding: 14px;
}
#expert-crm-preview .editor-box {
  border: 1px solid #dbe4ed;
  border-radius: 12px;
  min-height: 110px;
  padding: 12px 14px;
  color: #516373;
  font-size: 13px;
  line-height: 1.5;
  background: #fff;
}
#expert-crm-preview .composer-foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}
#expert-crm-preview .stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
#expert-crm-preview .section-card {
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}
#expert-crm-preview .section-head {
  padding: 12px 14px;
  border-bottom: 1px solid #edf1f5;
  font-size: 13px;
  font-weight: 700;
  color: #213247;
  background: #fbfdff;
}
#expert-crm-preview .section-body {
  padding: 14px;
}
#expert-crm-preview .profile {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
#expert-crm-preview .profile img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}
#expert-crm-preview .profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #203246;
}
#expert-crm-preview .profile-sub {
  font-size: 12px;
  color: #6d7d8e;
  margin-top: 4px;
}
#expert-crm-preview .facts {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px 10px;
  font-size: 12px;
}
#expert-crm-preview .facts .key {
  color: #718191;
  font-weight: 700;
}
#expert-crm-preview .facts .val {
  line-height: 1.45;
  color: #223448;
}
#expert-crm-preview .checklist {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
#expert-crm-preview .check {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #33485d;
  line-height: 1.45;
}
#expert-crm-preview .check i {
  margin-top: 2px;
  color: #2a8a57;
}
#expert-crm-preview .note {
  border: 1px solid #dde6ef;
  border-radius: 12px;
  padding: 12px;
  background: #fbfdff;
  color: #35495d;
  font-size: 13px;
  line-height: 1.55;
  min-height: 110px;
}
#expert-crm-preview .screen-note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #eef6fb;
  border: 1px solid #dbe9f5;
  color: #476176;
  font-size: 12px;
  line-height: 1.55;
}
@media (max-width: 1399px) {
  #expert-crm-preview .kpis {
    grid-template-columns: repeat(3, 1fr);
  }
  #expert-crm-preview .shell {
    grid-template-columns: 300px 1fr 320px;
  }
}
@media (max-width: 1199px) {
  #expert-crm-preview .kpis,
  #expert-crm-preview .signals,
  #expert-crm-preview .shell,
  #expert-crm-preview .filters {
    grid-template-columns: 1fr;
  }
  #expert-crm-preview .timeline {
    max-height: none;
  }
}
CSS);
?>

<section id="expert-crm-preview">
    <div class="alert alert-info">
        <div class="clearfix">
            <span><?= Html::encode(Yii::t('app', 'This screen is a programmer-facing visual handoff. It shows how the base expert CRM/chat flow fits into the current admin template without changing runtime logic yet.')) ?></span>
            <a class="btn btn-default btn-sm pull-right" href="<?= \app\helpers\Url::to(['chat']) ?>">
                <i class="fa fa-comments-o"></i> <?= Html::encode(Yii::t('app', 'Open chat shell')) ?>
            </a>
        </div>
    </div>

    <div class="kpis">
        <div class="kpi">
            <span class="k-label">Новые лиды</span>
            <span class="k-value">14</span>
            <span class="k-sub">4 без назначения, 3 готовы к переводу в paid stage</span>
        </div>
        <div class="kpi">
            <span class="k-label">Требуют ответа</span>
            <span class="k-value">8</span>
            <span class="k-sub">2 диалога уже близко к SLA risk</span>
        </div>
        <div class="kpi">
            <span class="k-label">Активные платные</span>
            <span class="k-value">11</span>
            <span class="k-sub">Средняя активная сессия 18 минут</span>
        </div>
        <div class="kpi">
            <span class="k-label">Follow-up сегодня</span>
            <span class="k-value">5</span>
            <span class="k-sub">2 повторные продажи уже в работе</span>
        </div>
        <div class="kpi">
            <span class="k-label">Статус эксперта</span>
            <span class="k-value">Online</span>
            <span class="k-sub">Весь базовый контур собран на одном экране</span>
        </div>
    </div>

    <div class="shell">
        <div class="panel-card">
            <div class="panel-head">
                <h2 class="panel-title">Очередь диалогов</h2>
                <div class="panel-sub">Слева остается рабочая CRM-очередь: поиск, фильтры, unread, intake, оплата и приоритет ответа.</div>
            </div>
            <div class="panel-body">
                <div class="search-row">
                    <input class="form-control" type="text" value="Petia / astrolog">
                    <button class="btn btn-primary" type="button"><i class="fa fa-search"></i></button>
                </div>
                <div class="filters">
                    <select class="form-control"><option>Все анкеты</option></select>
                    <select class="form-control"><option>Все стадии</option></select>
                    <select class="form-control"><option>Оплата: все</option></select>
                    <select class="form-control"><option>Приоритет: все</option></select>
                </div>
                <div class="chips">
                    <span class="chip active">Все чаты 34</span>
                    <span class="chip">Новые 14</span>
                    <span class="chip">Нужен ответ 8</span>
                    <span class="chip">Payment required 5</span>
                </div>

                <div class="queue-list">
                    <div class="queue-item">
                        <div class="queue-top">
                            <div class="queue-person">
                                <img class="avatar" src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_nz__rxNWgq5V5pvOeEQZvQYRWJvtwkJG.webp" alt="">
                                <div>
                                    <div class="name">Ivan</div>
                                    <div class="route">Gin • каталог экспертов • Минск</div>
                                    <div class="snippet">Хочу понять, подойдет ли мне персональная консультация по отношениям.</div>
                                </div>
                            </div>
                            <div>
                                <span class="pill green">NEW</span>
                                <div class="time" style="margin-top:6px;">17:09</div>
                            </div>
                        </div>
                        <div class="queue-tags">
                            <span class="tag blue">Intake 80%</span>
                            <span class="tag green">Payment ready</span>
                            <span class="tag">Unread 1</span>
                        </div>
                    </div>

                    <div class="queue-item active">
                        <div class="queue-top">
                            <div class="queue-person">
                                <img class="avatar" src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_YYmlxxf_GAfbo-HgrA8OIR0u-yte-vOq.webp" alt="">
                                <div>
                                    <div class="name">Petia</div>
                                    <div class="route">Mari • paid active • London</div>
                                    <div class="snippet">Прислал контекст, ждет конкретный следующий шаг и уже находится в платном диалоге.</div>
                                </div>
                            </div>
                            <div>
                                <span class="pill orange">NEEDS REPLY</span>
                                <div style="margin-top:6px;">
                                    <span class="pill red">SLA 08:00</span>
                                </div>
                            </div>
                        </div>
                        <div class="queue-tags">
                            <span class="tag blue">Intake complete</span>
                            <span class="tag green">Paid active</span>
                            <span class="tag orange">High intent</span>
                            <span class="tag">Unread 2</span>
                        </div>
                    </div>

                    <div class="queue-item">
                        <div class="queue-top">
                            <div class="queue-person">
                                <img class="avatar" src="https://gravatar.com/avatar/1c45399fc6f4ac01ad6a5facce8696e7?s=96" alt="">
                                <div>
                                    <div class="name">Lena</div>
                                    <div class="route">Kristy • resolved • Warsaw</div>
                                    <div class="snippet">Сессия закрыта, пользователь подходит под follow-up через 24 часа.</div>
                                </div>
                            </div>
                            <div>
                                <span class="pill blue">RESOLVED</span>
                            </div>
                        </div>
                        <div class="queue-tags">
                            <span class="tag orange">Repeat candidate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-card">
            <div class="panel-head">
                <div class="chat-bar">
                    <div>
                        <div class="duo">
                            <img src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_nz__rxNWgq5V5pvOeEQZvQYRWJvtwkJG.webp" alt="">
                            <i class="fa fa-long-arrow-right text-muted"></i>
                            <img src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_YYmlxxf_GAfbo-HgrA8OIR0u-yte-vOq.webp" alt="">
                            <div style="margin-left:8px;">
                                <div class="route-title">Mari → Petia</div>
                                <div class="meta">Диалог #C-20018 • вход из карточки эксперта • последний ответ 18 минут назад</div>
                            </div>
                        </div>
                    </div>
                    <div class="btns">
                        <button class="btn btn-primary btn-sm" type="button"><i class="fa fa-check-circle"></i> Взять в работу</button>
                        <button class="btn btn-default btn-sm" type="button"><i class="fa fa-user-plus"></i> Переназначить</button>
                    </div>
                </div>

                <div class="signals">
                    <div class="signal">
                        <span class="mini-label">Текущая стадия</span>
                        <span class="value">Paid active / needs reply</span>
                    </div>
                    <div class="signal">
                        <span class="mini-label">Интерес</span>
                        <span class="value">Высокий, вопрос конкретный</span>
                    </div>
                    <div class="signal">
                        <span class="mini-label">Оплата</span>
                        <span class="value">Платеж подтвержден</span>
                    </div>
                    <div class="signal">
                        <span class="mini-label">Следующее действие</span>
                        <span class="value">Дать структурный ответ и закрепить следующий шаг</span>
                    </div>
                </div>

                <div class="btns">
                    <button class="btn btn-default btn-sm" type="button"><i class="fa fa-bolt"></i> Шаблон warm-up</button>
                    <button class="btn btn-default btn-sm" type="button"><i class="fa fa-file-text-o"></i> Запросить контекст</button>
                    <button class="btn btn-default btn-sm" type="button"><i class="fa fa-credit-card"></i> Payment status</button>
                    <button class="btn btn-default btn-sm" type="button"><i class="fa fa-refresh"></i> Follow-up</button>
                </div>
            </div>

            <div class="panel-body">
                <div class="timeline">
                    <div class="system-event"><strong>Системное событие:</strong> intake заполнен, цель клиента зафиксирована, чат переведен в платный режим.</div>
                    <div class="day"><span>Сегодня</span></div>

                    <div class="message-row out">
                        <div class="bubble">
                            <div class="message-meta"><span>Mari, эксперт</span><span>17:41</span></div>
                            <div class="message-text">Привет. Чтобы не тратить время впустую, сразу уточню: что для тебя главный риск в отношениях и какой результат ты хочешь получить сегодня?</div>
                        </div>
                    </div>

                    <div class="message-row">
                        <div class="bubble">
                            <div class="message-meta"><span>Petia</span><span>17:49</span></div>
                            <div class="message-text">Хочу понять, стоит ли продолжать текущие отношения и на что обратить внимание в поведении партнера.</div>
                        </div>
                    </div>

                    <div class="system-event"><strong>SLA:</strong> следующее сообщение эксперта ожидается в течение 10 минут.</div>

                    <div class="message-row">
                        <div class="bubble">
                            <div class="message-meta"><span>Petia</span><span>18:11</span></div>
                            <div class="message-text">Мне нужен понятный следующий шаг, а не общие слова.</div>
                        </div>
                    </div>

                    <div class="message-row out">
                        <div class="bubble">
                            <div class="message-meta"><span>Mari, черновик</span><span>Базовый ответ</span></div>
                            <div class="message-text">Я вижу два слоя проблемы: повторяющийся эмоциональный цикл и отсутствие договоренности о поведении после конфликта.

В базовой версии эксперт здесь сразу видит intake, payment state, заметки и шаблоны, чтобы ответить быстро и структурно без переходов по разным экранам.</div>
                        </div>
                    </div>
                </div>

                <div class="composer">
                    <div class="composer-top">
                        <div>
                            <span class="chip">Приветствие</span>
                            <span class="chip">Уточнить цель</span>
                            <span class="chip">Переход в paid stage</span>
                            <span class="chip">Ответ после паузы</span>
                        </div>
                        <div>
                            <span class="chip"><i class="fa fa-paperclip"></i> Вложение</span>
                            <span class="chip"><i class="fa fa-smile-o"></i> Emoji</span>
                        </div>
                    </div>
                    <div class="composer-body">
                        <div class="editor-box">Поле ответа эксперта.

В базовой версии на этом же экране должны быть:
- ручной ввод сообщения;
- вставка шаблона;
- отправка;
- сохранение контекста без перехода на другой экран.</div>
                        <div class="composer-foot">
                            <div class="btns">
                                <button class="btn btn-default btn-sm" type="button"><i class="fa fa-sticky-note-o"></i> Внутренняя заметка</button>
                                <button class="btn btn-default btn-sm" type="button"><i class="fa fa-clock-o"></i> Напомнить позже</button>
                            </div>
                            <button class="btn btn-primary btn-sm" type="button"><i class="fa fa-paper-plane"></i> Отправить</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-card">
            <div class="panel-head">
                <h2 class="panel-title">Контекст и управление</h2>
                <div class="panel-sub">Правая колонка показывает весь базовый контур управления диалогом без технических деталей реализации.</div>
            </div>
            <div class="panel-body">
                <div class="stack">
                    <div class="section-card">
                        <div class="section-head">Карточка клиента</div>
                        <div class="section-body">
                            <div class="profile">
                                <img src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_YYmlxxf_GAfbo-HgrA8OIR0u-yte-vOq.webp" alt="">
                                <div>
                                    <div class="profile-name">Petia</div>
                                    <div class="profile-sub">ID U-9002 • London • Online now • premium user</div>
                                </div>
                            </div>
                            <div class="facts">
                                <div class="key">Источник</div><div class="val">Карточка эксперта / прямой старт чата</div>
                                <div class="key">Язык</div><div class="val">English</div>
                                <div class="key">Тема</div><div class="val">Relationships / clarity after repeated emotional conflicts</div>
                                <div class="key">Цель</div><div class="val">Получить конкретное решение и понятный следующий шаг.</div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-head">Intake summary</div>
                        <div class="section-body">
                            <div class="checklist">
                                <div class="check"><i class="fa fa-check-circle"></i><span>Основной вопрос сформулирован конкретно.</span></div>
                                <div class="check"><i class="fa fa-check-circle"></i><span>Желаемый результат указан.</span></div>
                                <div class="check"><i class="fa fa-check-circle"></i><span>Контекста достаточно для содержательного ответа.</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-head">Оплата и стадия</div>
                        <div class="section-body">
                            <div class="facts">
                                <div class="key">Stage</div><div class="val">Paid active</div>
                                <div class="key">Payment ready</div><div class="val">Да</div>
                                <div class="key">Риск</div><div class="val">Низкий, пользователь уже вложился и ждет решения</div>
                                <div class="key">Что дальше</div><div class="val">Ответ эксперта → закрепление результата → follow-up</div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-head">Чеклист базовой CRM-логики</div>
                        <div class="section-body">
                            <div class="checklist">
                                <div class="check"><i class="fa fa-check-circle"></i><span>Диалог назначен конкретному эксперту.</span></div>
                                <div class="check"><i class="fa fa-check-circle"></i><span>Понятен следующий шаг и виден SLA.</span></div>
                                <div class="check"><i class="fa fa-check-circle"></i><span>Видны unread, intake и стадия оплаты.</span></div>
                                <div class="check"><i class="fa fa-check-circle"></i><span>Есть шаблоны, внутренние заметки и follow-up действия.</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-head">Внутренняя заметка</div>
                        <div class="section-body">
                            <div class="note">Клиент не хочет абстрактный ответ. Нужен короткий и уверенный тон. Если подтвердит интерес после первого структурного вывода, можно вести в follow-up в том же диалоге.</div>
                        </div>
                    </div>
                </div>

                <div class="screen-note">
                    Этот экран показывает посадку базового функционала именно внутри текущей админки: слева очередь, в центре рабочий чат, справа контекст клиента и управление процессом.
                </div>
            </div>
        </div>
    </div>
</section>
