<?php

namespace app\modules\admin\controllers;

use app\components\translator\TranslationException;
use app\components\translator\TranslatorManager;
use app\helpers\Url;
use app\models\Admin;
use app\models\Message;
use app\models\MessageAttachment;
use app\modules\admin\components\Permission;
use app\modules\admin\models\search\MessageSearch;
use app\modules\admin\services\MessageShellService;
use Yii;
use yii\filters\VerbFilter;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

/**
 * @author Alexander Kononenko <contact@hauntd.me>
 * @package app\modules\admin\controllers
 */
class MessageController extends \app\modules\admin\components\Controller
{
    /**
     * @var string
     */
    public $model = \app\models\Message::class;
    /**
     * @var MessageShellService|null
     */
    private $shellService;
    /**
     * @var TranslatorManager|null
     */
    private $translatorManager;

    /**
     * @return array
     */
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'permission' => [
                'class' => Permission::class,
                'roles' => [Admin::ROLE_ADMIN, Admin::ROLE_MODERATOR],
                'permission' => Permission::MESSAGES,
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'delete' => ['post'],
                    'send' => ['post'],
                    'translate' => ['post'],
                    'conversations' => ['get'],
                    'messages' => ['get'],
                ],
            ],
        ]);
    }

    /**
     * @return string
     * @throws \Exception
     */
    public function actionIndex()
    {
        Url::remember(Url::current(), 'actions-redirect');

        $legacy = (int) $this->request->get('legacy', 0) === 1;
        if ($legacy) {
            $searchModel = new MessageSearch();

            return $this->render('legacy', [
                'dataProvider' => $searchModel->search($this->request->get()),
                'searchModel' => $searchModel,
            ]);
        }

        return $this->render('index');
    }

    /**
     * Alias for the chat shell route used by the admin menu.
     *
     * @return string
     * @throws \Exception
     */
    public function actionChat()
    {
        return $this->actionIndex();
    }

    /**
     * Preview screen for the staged expert CRM/admin layout.
     *
     * @return string
     */
    public function actionExpertPreview()
    {
        return $this->render('expert-preview');
    }

    /**
     * @return bool
     * @throws \yii\base\ExitException
     */
    public function actionConversations()
    {
        $service = $this->getShellService();
        $search = trim((string) $this->request->get('query'));
        $limit = (int) $this->request->get('limit', MessageShellService::DEFAULT_CONVERSATIONS_LIMIT);

        return $this->sendJson([
            'success' => true,
            'conversations' => $service->getConversations($search, $limit),
        ]);
    }

    /**
     * @return bool
     * @throws BadRequestHttpException
     * @throws \yii\base\ExitException
     */
    public function actionMessages()
    {
        list($userAId, $userBId) = $this->readPairFromRequest();
        $service = $this->getShellService();

        return $this->sendJson([
            'success' => true,
            'conversation' => $service->getConversation($userAId, $userBId),
            'messages' => $service->getMessages($userAId, $userBId, (int) $this->request->get('limit', MessageShellService::DEFAULT_MESSAGES_LIMIT)),
        ]);
    }

    /**
     * @return bool
     * @throws BadRequestHttpException
     * @throws \Exception
     * @throws \yii\base\ExitException
     */
    public function actionSend()
    {
        $fromUserId = (int) $this->request->post('fromUserId');
        $toUserId = (int) $this->request->post('toUserId');
        $text = trim((string) $this->request->post('text'));

        if ($fromUserId < 1 || $toUserId < 1 || $fromUserId === $toUserId) {
            throw new BadRequestHttpException('Invalid conversation participants');
        }

        if ($text === '') {
            return $this->sendJson([
                'success' => false,
                'message' => Yii::t('app', 'Message cannot be empty'),
            ], 422);
        }

        $fromUser = $this->userManager->getUserById($fromUserId, ['includeBanned' => true]);
        $toUser = $this->userManager->getUserById($toUserId, ['includeBanned' => true]);
        if ($fromUser === null || $toUser === null) {
            throw new BadRequestHttpException('User not found');
        }

        $message = $this->messageManager->createMessage($fromUserId, $toUserId, $text);
        if ($message->isNewRecord || $message->hasErrors()) {
            $firstError = $message->getFirstError('text');
            if ($firstError === null) {
                $firstError = Yii::t('app', 'Could not send message');
            }

            return $this->sendJson([
                'success' => false,
                'message' => $firstError,
                'errors' => $message->errors,
            ], 422);
        }

        $service = $this->getShellService();
        $payload = $service->getMessage((int) $message->id);

        return $this->sendJson([
            'success' => true,
            'message' => $payload,
            'conversation' => $service->getConversation($fromUserId, $toUserId),
        ]);
    }

    /**
     * @return bool
     * @throws \yii\base\ExitException
     */
    public function actionTranslate()
    {
        $messageId = (int) $this->request->post('messageId');
        if ($messageId < 1) {
            return $this->sendJson([
                'success' => false,
                'message' => Yii::t('app', 'Invalid message identifier'),
            ], 422);
        }

        $message = Message::find()
            ->where(['id' => $messageId])
            ->with(['sender.profile', 'receiver.profile', 'attachments', 'translations'])
            ->one();

        if ($message === null) {
            return $this->sendJson([
                'success' => false,
                'message' => Yii::t('app', 'Message not found'),
            ], 404);
        }

        try {
            $translation = $this->getTranslatorManager()->translateMessage($message);
        } catch (TranslationException $e) {
            return $this->sendJson([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            Yii::error($e->getMessage(), __METHOD__);

            return $this->sendJson([
                'success' => false,
                'message' => Yii::t('app', 'Could not translate message'),
            ], 500);
        }

        return $this->sendJson([
            'success' => true,
            'messageId' => (int) $message->id,
            'translation' => $this->getTranslatorManager()->asPayload($translation),
        ]);
    }

    /**
     * @param int $id
     * @return mixed
     * @throws NotFoundHttpException
     * @throws \Exception
     * @throws \Throwable
     */
    public function actionDelete($id)
    {
        /** @var Message $model */
        $model = $this->findModel($id);
        $attachments = $model->attachments;
        if ($model->delete()) {
            if (count($attachments)) {
                foreach ($attachments as $attachment) {
                    if ($attachment->type == MessageAttachment::TYPE_IMAGE) {
                        Yii::$app->photoStorage->delete($attachment->data);
                    }
                }
            }
            $this->session->setFlash('success', Yii::t('app', 'Message has been deleted'));
        }

        $redirectUrl = Url::previous('actions-redirect');
        if ($redirectUrl === false) {
            $redirectUrl = Url::to(['index']);
        }

        return $this->redirect($redirectUrl);
    }

    /**
     * @return array
     * @throws BadRequestHttpException
     */
    private function readPairFromRequest()
    {
        $userAId = (int) $this->request->get('userAId');
        $userBId = (int) $this->request->get('userBId');

        if ($userAId < 1 || $userBId < 1 || $userAId === $userBId) {
            throw new BadRequestHttpException('Invalid conversation identifiers');
        }

        return [min($userAId, $userBId), max($userAId, $userBId)];
    }

    /**
     * @return MessageShellService
     */
    private function getShellService()
    {
        if ($this->shellService === null) {
            $this->shellService = new MessageShellService();
        }

        return $this->shellService;
    }

    /**
     * @return TranslatorManager
     */
    private function getTranslatorManager()
    {
        if ($this->translatorManager === null) {
            $this->translatorManager = new TranslatorManager();
        }

        return $this->translatorManager;
    }
}
