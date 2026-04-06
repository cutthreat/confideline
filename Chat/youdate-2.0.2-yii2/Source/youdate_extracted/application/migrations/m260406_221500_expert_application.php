<?php

use hauntd\core\migrations\Migration;

class m260406_221500_expert_application extends Migration
{
    public function up()
    {
        $this->createTable('{{%expert_application}}', [
            'id' => $this->primaryKey(),
            'status' => $this->string(32)->notNull()->defaultValue('new'),
            'full_name' => $this->string(255)->notNull(),
            'display_name' => $this->string(255),
            'email' => $this->string(255)->notNull(),
            'contact' => $this->string(255),
            'specializations' => $this->text(),
            'languages' => $this->string(255),
            'experience' => $this->string(255),
            'country' => $this->string(255),
            'timezone' => $this->string(255),
            'availability' => $this->text(),
            'about' => $this->text()->notNull(),
            'links' => $this->text(),
            'consent_review' => $this->boolean()->defaultValue(false),
            'consent_followup' => $this->boolean()->defaultValue(false),
            'consent_data' => $this->boolean()->defaultValue(false),
            'admin_notes' => $this->text(),
            'reviewed_by' => $this->integer(),
            'reviewed_at' => $this->integer(),
            'created_at' => $this->integer(),
            'updated_at' => $this->integer(),
        ]);

        $this->createIndex('expert_application_status_idx', '{{%expert_application}}', 'status');
        $this->createIndex('expert_application_email_idx', '{{%expert_application}}', 'email');
        $this->createIndex('expert_application_created_at_idx', '{{%expert_application}}', 'created_at');
        $this->createIndex('expert_application_reviewed_by_idx', '{{%expert_application}}', 'reviewed_by');

        $this->addForeignKey(
            'fk_expert_application_reviewed_by',
            '{{%expert_application}}',
            'reviewed_by',
            '{{%user}}',
            'id',
            $this->setNull,
            $this->restrict
        );
    }

    public function down()
    {
        $this->dropForeignKey('fk_expert_application_reviewed_by', '{{%expert_application}}');
        $this->dropTable('{{%expert_application}}');
    }
}
