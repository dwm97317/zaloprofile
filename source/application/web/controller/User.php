<?php
namespace app\web\controller;

use app\web\model\store\shop\Clerk;
use app\web\model\User as UserModel;
use app\web\model\SiteSms as SiteSmsModel;
use app\common\library\wxl\WXBizDataCrypt;
use app\web\model\FeedBack;
use think\Cache;
use think\Session;
use app\web\model\user\BalanceLog;
use app\web\model\UserAddress;
use app\web\model\recharge\Order as rechargeOrder;
use app\web\model\user\Grade as GradeModel;
use app\web\model\UserCoupon;
use  app\web\model\Coupon;
use app\web\model\Wxapp as WxappModel;
use app\web\model\Bank;
use app\web\model\Currency;
use app\web\model\Certificate;

/**
 * 用户管理
 * Class User
 * @package app\web
 */
class User extends Controller
{

    
    /**
     * 更新当用户密码
     * @return array|mixed
     * @throws \think\exception\DbException
     */
    public function forget()
    {
        // 管理员详情
        $model = new UserModel;
        $user = $this->user;
        $result =  $model->where('user_id',$user['user']['user_id'])->find();
        if(!$result){
            return $this->renderError($model->getError() ?: '更新失败');
        }
        $data = $this->postData('user');
        $data['old'] = $result['password'];
        $data['user_id'] = $result['user_id'];
        if ($this->request->isAjax()) {
            if ($model->renew($data)) {
                return $this->renderSuccess('更新成功');
            }
            return $this->renderError($model->getError() ?: '更新失败');
        }
 
        return $this->fetch('usercenter/forget', compact('model'));
    }
    
        // 根据域名返回wxapp_id
    public function getSiteUrl(){
        $WxappModel = new WxappModel();
        $url = $_SERVER['HTTP_ORIGIN'];
        $wxappData  = WxappModel::useGlobalScope(false)->where('other_url','like','%'.$url.'%')->find();
        if(empty($wxappData)){
            return $this->renderSuccessWeb([
            'other_url' => base_url(),
            'wxapp_id' => 10001,
            'mini_id' => 10047
            ]);
        }

        return $this->renderSuccessWeb([
            'other_url' => $wxappData['other_url'],
            'wxapp_id' => $wxappData['wxapp_id'],
            'mini_id' =>$wxappData['mini_id']
        ]);
    }
    
    public function grade(){
         $user = $this->user;
         $GradeModel = new GradeModel;
         $detail = UserModel::detail($user['user']['user_id']); 
         $list = $GradeModel->getUsableList($detail['wxapp_id']); 
         return $this->fetch('usercenter/grade',compact('list','detail'));
    }
    
    public function usercoupon(){
        $user = $this->user;
        $UserCoupon = new UserCoupon;
        $Coupon = new Coupon;
        $couponlist = $Coupon->getList($user['user']['user_id']);
        $list = $UserCoupon->getList($user['user']['user_id']);
    //   dump($couponlist->toArray());die;
        return $this->fetch('guide/usercoupon',compact('list','couponlist','detail'));
    }
    
    public function recharge(){
         $user = $this->user;
         $rechargeOrder = new rechargeOrder;
         $list = $rechargeOrder->getList($user['user']['user_id']); 
         return $this->fetch('usercenter/recharge',compact('list'));
    }
    
    // 我要充值
    public function iwantrecharge(){
         $user =  $this->user;
         $rechargeOrder = new rechargeOrder;
         $Bank = (new Bank());
         $Currency = new Currency();
         $banklist = $Bank->getList();
         $userinfo = (new UserModel())->where('user_id',$user['user']['user_id'])->find();
         $list = $rechargeOrder->getList($user['user']['user_id']); 
         $currencylist = $Currency->getListAll();
        //  dump($banklist);die;
         return $this->fetch('usercenter/iwantrecharge',compact('list','userinfo','banklist','currencylist'));
    }
    
    
    
    public function balance(){
         $user = $this->user;
         $BalanceLog = new BalanceLog;
         $list = $BalanceLog->getList($user['user']['user_id']); 
         return $this->fetch('usercenter/balance',compact('list'));
    }
    
    
    public function person(){
         $user = $this->user;
         $detail = UserModel::detail($user['user']['user_id']); 
  
         return $this->fetch('usercenter/person',compact('detail'));
    }
     public function editperson(){
        $user = $this->user;
        $detail = UserModel::detail($user['user']['user_id']);
        if ($this->request->isAjax()) {
          $param = $this->request->param();
          foreach ($param['formData'] as $value){
              $data[$value['name']] =$value['value'];
          }
         if($detail->save($data)){
             return $this->renderSuccess(urlCreate('person'),"保存成功");
         }
            return $this->renderError($detail->getError()??"保存失败");
        }
        return $this->fetch('usercenter/edituser', compact('detail'));
     }
     
     public function address(){
         $user = $this->user;
         $model = new UserAddress();
         $list = $model->getList($user['user']['user_id']);

         return $this->fetch('usercenter/address',compact('list','user'));
    }
    
    public function jaddress(){
         $user = $this->user;
         $model = new UserAddress();
         $list = $model->getjList($user['user']['user_id']);

         return $this->fetch('usercenter/jaddress',compact('list','user'));
    }
    
    public function passport(){
        Session::clear('yoshop_user');
        $this->redirect(urlCreate('passport/login'));
    }
    
    /**
     * 用户自动登录
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\exception\DbException
     */
    public function login()
    {
        $model = new UserModel;
        return $this->renderSuccess([
            'user_id' => $model->login($this->request->post()),
            'token' => $model->getToken()
        ]);
    }

    /**
     * 当前用户详情
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function detail()
    {
        // 当前用户信息
        $userInfo = $this->user();
        return $this->renderSuccess(compact('userInfo'));
    }
    
     /**
     * 删除用户地址
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function deleteaddress($id){
        $data = $this->request->param();
        $model = new UserAddress();
        $res = $model->where('address_id',$data['id'])->delete();
        if($res){
            return $this->renderSuccess("删除成功");
        }
        return $this->renderError($model->getError()??"删除失败");
    }
    
    public function smslist(){
        $userInfo = $this->getUser();
        $model = new SiteSmsModel;
        return $this->renderSuccess(
        $model->getList(['member_id'=>$userInfo['user_id']]));
    }
    
      public function certificate(){
         // 当前用户信息
         $user = $this->user;
        //  dump($user);die;
         $data = $this->request->param();
         unset($data['token']);
         $data['member_id'] = $user['user']['user_id'];
         $cer = (new Certificate());
         if (!$cer->add($data)){
            return $this->renderError($cer->getError()??"提交失败");
         }  
         return $this->renderSuccess('提交成功');          
    }
    
    public function certificateLog(){
        $model = new Certificate;
        $cur = $this->postData('cur')[0];
        $userInfo = $this->getUser();
        $map = ['member_id'=>$userInfo['user_id']];
        if ($cur){
          $map['is_verify'] = $cur;
        }
        return $this->renderSuccess(
            $model->getList($map));
    }
    
    /**
     * 修改用户端密码
     **/
    public function modifyPassword(){
        $postData = $this->postData();
       
        // 当前用户信息
        $userInfo = $this->getUser();
        $userInfo->modifyPwd($postData);
    }
    
    /**
     * 当前用户角色
     */
    public function role(){
         // 当前用户信息
         $userInfo = $this->getUser();
         switch($userInfo['user_type']){
             case 4:
              $role_name = '普通用户';
              break;
             case 1:
              $role_name = '入库员';
              break;
             case 2:
              $role_name = '分拣员';
              break;
             case 3:
              $role_name = '打包员';
              break; 
             case 5:
              $role_name = '仓管员';
              break;
             default:
              $role_name = '未知角色';
              break;  
         }
         $userRole['role_name'] = $role_name;
         $userRole['role_type'] = $userInfo['user_type'];
         $this->userRole = $userRole;
         return $this->renderSuccess(compact('userRole'));
    }

    public function edit(){
        $model = new UserModel();
        $userInfo = $this->getUser();
        if ($model->edit($userInfo['user_id'],$this->request->post())) {
            return $this->renderSuccess('编辑成功');
        }
        return $this->renderError($model->getError() ?: '编辑失败');
    }
    
    // 用户余额 
    public function banlance(){
        // 当前用户信息
        $userInfo = $this->getUser();
        return $this->renderSuccess([
           'balance' => $userInfo['balance'],
           'income' => $userInfo['income'],
        ]);
    }

    public function clerk(){
        $userInfo = $this->getUser();
        if ($userInfo['user_type'] == 4){
            return $this->renderError('您还没有成为员工');
        }
        $clerk_arr_map = [
            1 => 's',
            2 => 'f',
            3 => 'd',
        ];
        $info = (new Clerk())->where(['user_id'=>$userInfo['user_id'],'is_delete'=>0])->find()->toArray();
        $info['clerk_type_arr'] = [];
        $info['clerk_type_arr']['s'] = 0;
        $info['clerk_type_arr']['f'] = 0;
        $info['clerk_type_arr']['d'] = 0;
        if ($info['clerk_type']){
            $clerk_arr = explode(',',$info['clerk_type']);
            foreach ($clerk_arr as $v){
              
                $info['clerk_type_arr'][$clerk_arr_map[$v]] = 1;
            }
        }
        return $this->renderSuccess(compact('info'));
    }
    
    // 分享海报生成
    public function share(){
        $userInfo = $this->getUser();
        if ($userInfo['is_delete']==1){
            return $this->renderError('您已被系统删除,请咨询管理员');
        }
        $code = createCode($userInfo['user_id']);
        // 得到小程序码
        $wx_code =  Cache::get('wx_code_goods_id_'.$userInfo['user_id']);
        if (!$wx_code){
            $res = getWxCodeByMemberId($code,$userInfo['user_id']);
            if ($res){
                $wx_code = $res['data'];
            }
        }
        if (!file_exists($wx_code)){
            $res = getWxCodeByMemberId($code,$userInfo['user_id']);
            if ($res){
                $wx_code = $res['data'];
            }
        }
        if (!$wx_code){
            return $this->renderError('分享码生成失败');
        }
        $img = createShareImage($wx_code);
        if (!$img){
            return $this->renderError('分享图片生成失败');                     
        }
        $img = str_replace('uploads','',$img);
        return $this->renderSuccess(['src'=>$img]);
    }

    // 意见反馈
    public function addSuggest(){
        $model = new FeedBack;
        if ($model->add($this->request->post())) {
            return $this->renderSuccess('添加成功');
        }
        return $this->renderError($model->getError() ?: '添加失败');
    }
}
