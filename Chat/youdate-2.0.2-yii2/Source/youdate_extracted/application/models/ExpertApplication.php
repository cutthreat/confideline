<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * @property int $id
 * @property string $status
 * @property string $full_name
 * @property string|null $display_name
 * @property string $email
 * @property string|null $contact
 * @property string|null $specializations
 * @property string|null $languages
 * @property string|null $experience
 * @property string|null $country
 * @property string|null $timezone
 * @property string|null $availability
 * @property string $about
 * @property string|null $links
 * @property bool $consent_review
 * @property bool $consent_followup
 * @property bool $consent_data
 * @property string|null $admin_notes
 * @property int|null $reviewed_by
 * @property int|null $reviewed_at
 * @property int|null $created_at
 * @property int|null $updated_at
 *
 * @property User|null $reviewedByUser
 */
class ExpertApplication extends \app\base\ActiveRecord
{
    const STATUS_NEW = 'new';
    const STATUS_IN_REVIEW = 'in_review';
    const STATUS_NEEDS_INFO = 'needs_info';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_ARCHIVED = 'archived';

    const SCENARIO_FRONTEND = 'frontend';
    const SCENARIO_ADMIN = 'admin';

    public $specializationsList = [];

    public static function tableName()
    {
        return '{{%expert_application}}';
    }

    public function behaviors()
    {
        return [
            'timestamp' => [
                'class' => TimestampBehavior::class,
            ],
        ];
    }

    public function rules()
    {
        return [
            [['status', 'full_name', 'email', 'about'], 'required'],
            [['about', 'availability', 'links', 'admin_notes', 'specializations'], 'string'],
            [['created_at', 'updated_at', 'reviewed_at', 'reviewed_by'], 'integer'],
            [['consent_review', 'consent_followup', 'consent_data'], 'boolean'],
            [['full_name', 'display_name', 'email', 'contact', 'languages', 'experience', 'country', 'timezone'], 'string', 'max' => 255],
            [['status'], 'in', 'range' => array_keys($this->getStatusOptions())],
            [['email'], 'email'],
            [['email'], 'trim'],
            [['full_name', 'display_name', 'contact', 'languages', 'experience', 'country', 'timezone'], 'filter', 'filter' => 'trim'],
            [['specializationsList'], 'safe'],
            [['reviewed_by'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['reviewed_by' => 'id']],
            [['consent_review', 'consent_followup', 'consent_data'], 'required', 'on' => self::SCENARIO_FRONTEND],
            [['status', 'admin_notes'], 'required', 'on' => self::SCENARIO_ADMIN],
        ];
    }

    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_FRONTEND] = [
            'status',
            'full_name',
            'display_name',
            'email',
            'contact',
            'specializationsList',
            'languages',
            'experience',
            'country',
            'timezone',
            'availability',
            'about',
            'links',
            'consent_review',
            'consent_followup',
            'consent_data',
        ];
        $scenarios[self::SCENARIO_ADMIN] = [
            'status',
            'admin_notes',
        ];

        return $scenarios;
    }

    public function beforeValidate()
    {
        if (is_array($this->specializationsList)) {
            $this->specializations = implode(', ', array_filter($this->specializationsList));
        }

        if ($this->isNewRecord && empty($this->status)) {
            $this->status = self::STATUS_NEW;
        }

        return parent::beforeValidate();
    }

    public function afterFind()
    {
        parent::afterFind();

        $this->specializationsList = $this->specializations
            ? array_values(array_filter(array_map('trim', explode(',', $this->specializations))))
            : [];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'status' => Yii::t('app', 'Status'),
            'full_name' => Yii::t('app', 'Full name'),
            'display_name' => Yii::t('app', 'Public name'),
            'email' => Yii::t('app', 'Email'),
            'contact' => Yii::t('app', 'Telegram or WhatsApp'),
            'specializations' => Yii::t('app', 'Specializations'),
            'languages' => Yii::t('app', 'Languages'),
            'experience' => Yii::t('app', 'Experience'),
            'country' => Yii::t('app', 'Country'),
            'timezone' => Yii::t('app', 'Timezone'),
            'availability' => Yii::t('app', 'Availability'),
            'about' => Yii::t('app', 'About'),
            'links' => Yii::t('app', 'Links'),
            'consent_review' => Yii::t('app', 'Consent to review'),
            'consent_followup' => Yii::t('app', 'Consent to follow-up'),
            'consent_data' => Yii::t('app', 'Data confirmation'),
            'admin_notes' => Yii::t('app', 'Admin notes'),
            'reviewed_by' => Yii::t('app', 'Reviewed by'),
            'reviewed_at' => Yii::t('app', 'Reviewed at'),
            'created_at' => Yii::t('app', 'Created at'),
            'updated_at' => Yii::t('app', 'Updated at'),
        ];
    }

    public function getStatusOptions()
    {
        return [
            self::STATUS_NEW => Yii::t('app', 'New'),
            self::STATUS_IN_REVIEW => Yii::t('app', 'In review'),
            self::STATUS_NEEDS_INFO => Yii::t('app', 'Needs info'),
            self::STATUS_APPROVED => Yii::t('app', 'Approved'),
            self::STATUS_REJECTED => Yii::t('app', 'Rejected'),
            self::STATUS_ARCHIVED => Yii::t('app', 'Archived'),
        ];
    }

    public function getReviewedByUser()
    {
        return $this->hasOne(User::class, ['id' => 'reviewed_by']);
    }
}
