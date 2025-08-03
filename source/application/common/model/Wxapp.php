<?php

namespace app\common\model;

use think\Cache;
use app\common\exception\BaseException;

/**
 * 微信小程序模型
 * Class Wxapp
 * @package app\common\model
 */
class Wxapp extends BaseModel
{
    protected $name = 'wxapp';
    
    /**
     * 隐藏字段
     * @var array
     */
    protected $hidden = [
        'app_name',
        'app_id',
        'app_secret',
        'app_wxappid',
        'cert_pem',
        'is_delete',
        'key_pem',
        'is_recycle',
        'mchid',
        'apikey',
        'create_time',
        'update_time'
    ];
    /**
     * 小程序页面
     * @return \think\model\relation\HasOne
     */
    public function diyPage()
    {
        return $this->hasOne('WxappPage');
    }


        /**
     * 关联LOGO
     * @return \think\model\relation\belongsTo
     */
    public function logos()
    {
        return $this->belongsTo('app\\common\\model\\UploadFile', 'logo','file_id');
    }
    
     /**
     * 关联微信公众号
     * @return \think\model\relation\belongsTo
     */
    public function wechatimgs()
    {
        return $this->belongsTo('app\\common\\model\\UploadFile', 'wechatimg','file_id');
    }

    /**
     * 获取小程序信息
     * @param int|null $wxappId
     * @return static|null
     * @throws \think\exception\DbException
     */
    public static function detail($wxappId = null)
    {
        return static::get($wxappId ?: []);
    }

    /**
     * 获取小程序信息
     * @param int|null $wxappId
     * @return static|null
     * @throws \think\exception\DbException
     */
    public static function getdetail($wxappId = null)
    {
        return static::get(array_merge(['is_delete' => 0], ['wxapp_id'=>$wxappId]));
    }

    /**
     * 从缓存中获取小程序信息
     * @param int|null $wxappId 小程序id
     * @return array $data
     * @throws BaseException
     * @throws \think\Exception
     * @throws \think\exception\DbException
     */
    public static function getWxappCache($wxappId = null)
    {
        // 小程序id
        is_null($wxappId) && $wxappId = static::$wxapp_id;
        if (!$data = Cache::get("wxapp_{$wxappId}")) {
            // 获取小程序详情, 解除hidden属性
            $detail = self::detail($wxappId)->hidden([], true);
            if (empty($detail)) throw new BaseException(['msg' => '未找到当前小程序信息']);
            // 写入缓存
            $data = $detail->toArray();
            Cache::tag('cache')->set("wxapp_{$wxappId}", $data);
        }
        return $data;
    }

}
