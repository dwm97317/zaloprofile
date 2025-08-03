<?php

namespace app\web\model;

use app\common\exception\BaseException;
use app\common\model\Certificate as CertificateModel;
use app\common\library\helper;
use app\common\model\CertificateImage;
/**
 * 凭证模型
 * Class Certificate
 * @package app\api\model
 */
class Certificate extends CertificateModel
{
    /**
     * 关联用户表
     * @return \think\model\relation\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('User')->field(['user_id', 'nickName', 'avatarUrl']);
    }


    /**
     * 记录凭证图片
     * @param $commentList
     * @param $formData
     * @return bool
     * @throws \Exception
     */
    private function saveAllImages($certId, $imageIda,$data)
    {
        // 生成图片数据
        $imageData = [
            'cert_id' => $certId,
            'image_id' => $imageIda,
            'wxapp_id' => $data['wxapp_id'],
            'create_time'=> time()
        ];
        $model = new CertificateImage();
        return !empty($imageData) && $model->save($imageData);
    }
    
    
      /**
     * 提交支付凭证
     * @return boolean
     * @throws \Exception
     */
    public function add($post)
    {
        //   dump($post);die;
        $data= [
        //   'cert_order' => isset($post['order_sn'])?$post['order_sn']:'',
          'cert_price' => isset($post['amount'])?$post['amount']:0,
          'remark' => isset($post['remark'])?$post['remark']:'',
          'cert_type' => isset($post['coin_type'])?$post['coin_type']:'',
          'cert_date' => isset($post['paytime'])?$post['paytime']:date("Y/m/d H:i:s"),
          'user_id' => $post['member_id'],
          'wxapp_id'=> $post['wxappid'],
          'mini_id'=> $post['mini_id'],
          'create_time'=>time(),
          'update_time'=>time(),
        ];
      
       $res = $this->insertGetId($data);
       $imageIda = $post['imageIds'];
       $this->saveAllImages($res,$imageIda,$data);
       if($res){
           return true;
       }
       return false;
    }
    

}
