<?php

namespace app\api\model\user;

use app\common\model\user\UserOauth as UserOauthModel;

/**
 * 第三方授权模型
 * Class PointsLog
 * @package app\api\model\user
 */
class UserOauth extends UserOauthModel
{
    
    public static function getUserIdByOauthId($oauthId){
        return (new static())->where(['oauth_id'=>$oauthId])->value('user_id');
    }
    
    public static function getOauthIdByUserId($userId){
        return (new static())->where(['user_id'=>$userId])->value('oauth_id');
    }
}