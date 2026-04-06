<?php

namespace app\modules\admin\models\search;

use app\models\ExpertApplication;
use yii\base\Model;
use yii\data\ActiveDataProvider;

class ExpertApplicationSearch extends ExpertApplication
{
    public function rules()
    {
        return [
            [['id'], 'integer'],
            [['status', 'full_name', 'email', 'contact', 'specializations', 'display_name'], 'safe'],
        ];
    }

    public function scenarios()
    {
        return Model::scenarios();
    }

    public function search($params)
    {
        $query = ExpertApplication::find();
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => ['defaultOrder' => ['created_at' => SORT_DESC]],
        ]);

        if (!($this->load($params) && $this->validate())) {
            return $dataProvider;
        }

        $query->filterWhere(['id' => $this->id]);
        $query->filterWhere(['status' => $this->status]);
        $query->andFilterWhere(['or',
            ['like', 'lower(full_name)', mb_strtolower($this->full_name)],
            ['like', 'lower(display_name)', mb_strtolower($this->full_name)],
        ]);
        $query->andFilterWhere(['like', 'lower(email)', mb_strtolower($this->email)]);
        $query->andFilterWhere(['like', 'lower(contact)', mb_strtolower($this->contact)]);
        $query->andFilterWhere(['like', 'lower(specializations)', mb_strtolower($this->specializations)]);

        return $dataProvider;
    }
}
