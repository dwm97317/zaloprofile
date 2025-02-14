<?php

namespace app\common\service;

/**
 * 消息通知服务
 * Class Message
 * @package app\common\service
 */
class Message extends Basics
{
    /**
     * 场景列表
     * [场景名称] => [场景类]
     * @var array
     */
    private static $sceneList = [
        // 用户订单支付成功 - 通知管理人员
        'order.paymessage' => 'app\common\service\message\order\Paymessage',
        // 订单支付成功-通知用户
        'order.payment' => 'app\common\service\message\order\Payment',
        // 订单发货
        'order.delivery' => 'app\common\service\message\order\Delivery',
        // 包裹入库 
        'order.enter' => 'app\common\service\message\package\Enter',
        // 订单退款
        'order.refund' => 'app\common\service\message\order\Refund',
        // 包裹打包通知
        'order.packageit' => 'app\common\service\message\order\Packageit',
        // 拼团进度通知
        'sharing.active_status' => 'app\common\service\message\sharing\ActiveStatus',

        // 分销商入驻通知
        'dealer.apply' => 'app\common\service\message\dealer\Apply',
        // 分销商提现通知
        'dealer.withdraw' => 'app\common\service\message\dealer\Withdraw',
        // 登录短信验证码
        'password.login' => 'app\common\service\message\passport\Login',
        
        //新模板消息
        //入库通知
        'package.inwarehouse'=>'app\common\service\message\package\Inwarehouse',
        'package.dabaosuccess'=>'app\common\service\message\package\Dabaosuccess',
        'package.outapply'=>'app\common\service\message\package\Outapply',
        //到仓通知
        'package.toshop'=>'app\common\service\message\package\Toshop',
        //发货通知
        'package.sendpack'=>'app\common\service\message\package\Sendpack',
        //付款单生成提醒
        'package.payorder'=>'app\common\service\message\package\Payorder',
    ];

    /**
     * 发送消息通知
     * @param string $sceneName 场景名称
     * @param array $param 参数
     * @return bool
     */
    public static function send($sceneName, $param)
    {

        if (!isset(self::$sceneList[$sceneName]))
            return false;
        $className = self::$sceneList[$sceneName];
        return class_exists($className) ? (new $className)->send($param) : false;
    }
    
    /**
     * 发送消息通知
     * @param string $sceneName 场景名称
     * @param array $param 参数
     * @return bool
     */
    public static function sendSms($sceneName, $param)
    {
       
        if (!isset(self::$sceneList[$sceneName]))
            return false;
        $className = self::$sceneList[$sceneName];
        return class_exists($className) ? (new $className)->send($param) : false;
    }
    
    

}