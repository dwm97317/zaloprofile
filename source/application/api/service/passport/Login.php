<?php
declare (strict_types=1);

namespace app\api\service\passport;
use app\api\model\store\shop\Clerk;
use app\common\exception\BaseException;
use think\Cache;
use yiovo\captcha\facade\CaptchaApi;
use app\api\model\{User as UserModel, Setting as SettingModel};
use app\api\service\{user\Oauth as OauthService, user\Avatar as AvatarService, passport\Party as PartyService};
use app\api\validate\passport\Login as ValidateLogin;
use app\api\model\dealer\Referee as RefereeModel;
use app\common\service\Basics;
use app\common\library\ZaloSdk\Zalo;
use app\common\enum\Setting as SettingEnum;

/**
 * 服务类：用户登录
 * Class Login
 * @package app\api\service\passport
 */
class Login extends Basics
{
    /**
     * 用户信息 (登录成功后才记录)
     * @var UserModel|null $userInfo
     */
    private $userInfo;

    // 用于生成token的自定义盐
    const TOKEN_SALT = 'user_salt';

    /**
     * 执行用户登录
     * @param array $data
     * @return bool
     * @throws BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function login(array $data): bool
    {
        // 数据验证
        $this->validate($data);
        // 自动登录注册
        $this->register($data);
        // // 保存第三方用户信息
        // $this->createUserOauth($this->getUserId(), (bool)$data['isParty'], $data['partyData']);
        // 记录登录态
        return $this->setSession();
    }
    
    
     /**
     * 找回密码
     * @param array $data
     * @return void
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function findpassword(array $data)
    {
        // 查询用户是否已存在
        // 用户存在: 更新用户登录信息
        $this->validateMessage($data);
        if(!empty($data['mobile'])){
            $userInfo = UserModel::detail(['mobile' => $data['mobile'],'is_delete' => 0]);
        }
        
        if(!empty($data['email'])){
            $userInfo = UserModel::detail(['email' => $data['email'],'is_delete' => 0]);
        }
        if(empty($userInfo)){
            $this->error = '账号不存在';
            return false;
        }
        $userInfo->save(['password'=>yoshop_hash($data['password'])]);
        return true;
    }
        
     /**
     * 自动登录注册
     * @param array $data
     * @return void
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function registerMobile(array $data)
    {
        // 查询用户是否已存在
        // 用户存在: 更新用户登录信息
        $this->validate($data);
        $userInfo = UserModel::detail(['mobile' => $data['mobile'],'is_delete' => 0]);
            // 'password' => yoshop_hash($data['password']),
        // dump($userInfo);die;
        if ($userInfo) {
           $this->error = '该账号已被注册';
           return false;
        }
        
        $euserInfo = UserModel::detail(['email' => $data['email'],'is_delete' => 0]);
        if ($euserInfo) {
           $this->error = '该账号已被注册';
            return false;
        }
        $setting = SettingModel::getItem('store',$data['wxapp_id']);
        if($setting['usercode_mode']['is_show']==1 || $setting['usercode_mode']['is_show']==2){
            $user_code = $this->checkUserCode($setting); 
        }
        
        $data = [
            'mobile' => $data['mobile'],
            'nickName' => !empty($data['mobile']) ? hide_mobile($data['mobile']) : $data['email'],
            'open_id'=> !empty($data['mobile'])?$data['mobile']:$data['email'],
            'email'=>$data['email'],
            'paytype'=> $setting['moren']['user_pack_in_pay'],
            'tel_code'=>$data['tel_code'],
            'user_code'=>isset($user_code)?$user_code:'',
            'password'=>yoshop_hash($data['password']),
            'platform' => getPlatform(),
            'last_login_time' => date("Y-m-d H:i:s",time()),
            'wxapp_id' =>(new UserModel)->getWxappid() ,
        ];
        $model = new UserModel;
        $model->save($data);
        $this->userInfo = $model;
        return true;
    }
    
     
    private function checkUserCode($setting){
            switch ($setting['usercode_mode']['mode']) {
                case '10':
                    //纯数字
                    $num = $setting['usercode_mode'][10]['number'];
                    $userCode = $this->createNum($num);
                    break;
                case '20':
                    //英文子母
                    $num = $setting['usercode_mode'][20]['char'];
                    $userCode = $this->createChar($num);
                    break;
                case '30':
                    //混合模式
                    $zimu = $setting['usercode_mode'][30]['char'];
                    $num = $setting['usercode_mode'][30]['number'];
                    $userCode = $this->createCharNum($num,$zimu);
                    break;
                default:
                    $num = $setting['usercode_mode'][10]['number'];
                    $userCode = $this->createNum($num);
                    break;
            }
            return $userCode;
    }
    
    //生成随机数
    public function createNum($num){
        $x = pow(10,$num-1);
        $y = pow(10,$num)-1;
        $ucode =rand($x,$y);
        $ucode = $this->checkOnlyOne($ucode,'createNum',$num);
        return $ucode;
    }
    
    //生成随机英文编号
    public function createChar($num){
        //用字符数组的方式随机  
        $randomcode2 = ""; 
        $char = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z";  
        $m = explode(',',$char);
        for ($j=0;$j<$num ;$j++ )  
        {  
           $c = $m[rand(0,25)];  
            $randomcode2 = $randomcode2.$c;  
        }
        $ucode = $this->checkOnlyOne($randomcode2,'createChar',$num);
        return $ucode;
    }
    
    //生成随机英文+数字的编号
    public function createCharNum($num,$zimu){
        $x = pow(10,$num-1);
        $y = pow(10,$num)-1;
        $ucode =$zimu.rand($x,$y);
        $ucode = $this->checkOnlyOne($ucode,'createCharNum',$num);
        return $ucode;
    }
    //校验唯一
     public function checkOnlyOne($ucode,$funcitonname,$num){
        
         $user = UserModel::detail(['user_code' => $ucode]); 
         if($user){
             $ucode=  $this->$funcitonname($num);  
         }
         return $ucode;
     }

    
    /**
     * 检查是否为开发环境
     * @return bool
     */
    private function isDevelopmentEnv()
    {
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        return (
            strpos($userAgent, 'ZaloStudio') !== false ||
            strpos($referer, 'localhost') !== false ||
            strpos($referer, '127.0.0.1') !== false ||
            strpos($referer, 'mini-app-studio') !== false ||
            isset($_GET['debug_mode']) && $_GET['debug_mode'] == '1' ||
            config('app_debug') === true
        );
    }

    /**
     * 快捷登录：微信公众号用户
     * @param array $form
     * @return bool
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\Exception
     */
    public function loginWxOfficial(array $form): bool
    {
        // 解密encryptedData -> 拿到openid
        $plainData = OauthService::wxDecryptData($form['partyData']['encryptedData'], $form['partyData']['iv']);
        // 判断openid是否存在
        $userId = OauthService::getUserIdByOauthId($plainData['openid'], ClientEnum::H5_WEIXIN);
        // 获取用户信息
        $userInfo = !empty($userId) ? UserModel::detail($userId) : null;
        // 用户信息存在, 更新登录信息
        if (!empty($userInfo)) {
            // 更新用户登录信息
            $this->updateUser($userInfo, true, $form['partyData']);
            // 记录登录态
            return $this->setSession();
        }
        // 用户信息不存在 => 注册新用户 或者 跳转到绑定手机号页
        $setting = SettingModel::getItem(SettingEnum::REGISTER);
        // 后台设置了需强制绑定手机号, 返回前端isBindMobile, 跳转到手机号验证页
        if ($setting['isForceBindWxofficial']) {
            throwError('当前用户未绑定手机号', null, ['isBindMobile' => true]);
        }
        // 后台未开启强制绑定手机号, 直接保存新用户
        if (!$setting['isForceBindWxofficial']) {
            // 推荐人ID
            $refereeId = $form['refereeId'] ?? null;
            // 用户不存在: 创建一个新用户
            $this->createUser('', true, $form['partyData'], (int)$refereeId);
            // 保存第三方用户信息
            $this->createUserOauth($this->getUserId(), true, $form['partyData']);
        }
        // 记录登录态
        return $this->setSession();
    }

    /**
     * 快捷登录：微信小程序用户
     * @param array $form
     * @return bool
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\Exception
     */
    public function loginMpWx(array $form): bool
    {
        // 获取微信小程序登录态(session)
        $wxSession = PartyService::getMpWxSession($form['partyData']['code']);

        // 判断openid是否存在
        $userId = OauthService::getUserIdByOauthId($wxSession['openid'], 'MP-WEIXIN');
        // 获取用户信息
        $userInfo = !empty($userId) ? UserModel::detail($userId) : null;

        // 用户信息存在, 更新登录信息
        if (!empty($userInfo)) {
            // 更新用户登录信息
            $this->updateUser($userInfo, true, $form['partyData']);
            // 记录登录态
            return $this->setSession();
        }

        // 用户信息不存在 => 注册新用户 或者 跳转到绑定手机号页
        $setting = SettingModel::getItem(SettingEnum::REGISTER);
 
        // 后台设置了需强制绑定手机号, 返回前端isBindMobile, 跳转到手机号验证页
        if ($setting['isForceBindMpweixin']) {
            throwError('当前用户未绑定手机号', null, ['isBindMobile' => true]);
        }
        // 后台未开启强制绑定手机号, 直接保存新用户
        if (!$setting['isForceBindMpweixin']) {
            // 用户不存在: 创建一个新用户
            $this->createUser('', true, $form['partyData']);
            // 保存第三方用户信息
            $this->createUserOauth($this->getUserId(), true, $form['partyData']);
        }
        // 记录登录态
        return $this->setSession();
    }

    /**
     * 快捷登录：微信小程序用户
     * @param array $form
     * @return bool
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\Exception
     */
    public function loginMpWxMobile($form)
    {
        // 获取微信小程序登录态(session)
        // $wxSession = PartyService::getMpWxSession($form['code']);
        // // 解密encryptedData -> 拿到手机号
        // $wxData = OauthService::wxDecryptData($wxSession['session_key'], $form['encryptedData'], $form['iv']);
        // 整理登录注册数据
        // dump($form);die;
        $loginData = [
            'mobile' => $form['mobile'],
            'password' => $form['password'],
        ];
      
        $userInfo = UserModel::detail([
            'mobile' => $form['mobile'],
            'password' => yoshop_hash($form['password']),
            'is_delete' => 0]);
         
         $userInfopass = UserModel::detail([
            'mobile' => $form['mobile'],
            'is_delete' => 0]);
        // // dump($userInfo);die;
        if (empty($userInfopass)) {
            $this->error = '用户账号不存在';
            return false;
        }
        
        if ($userInfo) {
            $this->updateUser($userInfo, false, []);
            return $this->setSession();
        }
        
        if (empty($userInfo)) {
            $this->error = '密码输入错误';
            return false;
        }
        // 自动登录注册
        // $this->register($loginData);
        // 保存第三方用户信息
    
        // $this->createUserOauth($this->getUserId(), $loginData['isParty'], $loginData['partyData']);
        // 记录登录态
        return $this->setSession();
    }
    
    /**
     * 快捷登录：zalo小程序登录
     * @param array $form
     * @return bool
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\Exception
     */
    public function loginMpZalo(array $form){
       // 调试日志
       file_put_contents("debug.txt",var_export($form,true));
       
       // 检查是否为开发环境
       $isDev = $this->isDevelopmentEnv();
       
       try {
       $zaloLib = (new Zalo());
       $ouath = $zaloLib->getProfile($form['accesstoken']);
       file_put_contents("debug.txt",var_export($ouath,true),FILE_APPEND);
       } catch (\Exception $e) {
           // 在开发环境中，如果Zalo认证失败，提供备用方案
           if ($isDev) {
               file_put_contents("debug.txt", "开发环境：Zalo认证失败，使用测试数据: " . $e->getMessage() . "\n", FILE_APPEND);
               
               // 创建测试用户数据
               $ouath = [
                   'id' => 'dev_test_' . time(),
                   'name' => '开发测试用户_' . substr(md5($form['accesstoken'] ?? 'default'), 0, 8),
                   'picture' => [
                       'data' => [
                           'url' => 'https://via.placeholder.com/100x100?text=DEV'
                       ]
                   ]
               ];
           } else {
               $ouath = false;
           }
       }
       
       if (!$ouath){
           // 在开发环境中提供更友好的错误信息
           if ($isDev) {
               $this->error = '开发环境：Zalo授权失败，请检查网络连接或使用测试模式';
           } else {
          $this->error = 'zalo授权失败错误';
           }
          return false;
       }
       
       // 判断openid是否存在
       $userId = OauthService::getUserIdByOauthId($ouath['id'], 'ZALO');
       
       // 获取用户信息
       $userInfo = !empty($userId) ? UserModel::detail($userId) : null;
       $form['partyData']['nickName'] = $ouath['name']??'ZALO用户';
       $form['partyData']['oauth_id'] = $ouath['id'];
       $form['partyData']['avatarUrl'] = isset($ouath['picture'])?$ouath['picture']['data']['url']:'';
       $form['partyData']['refereeId'] = 0;
       $form['partyData']['oauth'] = 'ZALO';
       
       // 开发环境日志
       if ($isDev) {
           file_put_contents("debug.txt", "开发环境登录数据: " . json_encode($form['partyData']) . "\n", FILE_APPEND);
       }
       
       // 用户信息存在, 更新登录信息
       if (!empty($userInfo)) {
            // 更新用户登录信息
            $this->updateUser($userInfo, true, $form['partyData']??[]);
            // 记录登录态
            return $this->setSession();
       }
      
        // 用户信息不存在 => 注册新用户 或者 跳转到绑定手机号页
       $setting = SettingModel::getItem(SettingEnum::REGISTER);
        // 后台设置了需强制绑定手机号, 返回前端isBindMobile, 跳转到手机号验证页
       if ( !empty($setting) && $setting['isForceBindMpweixin']) {
            throwError('当前用户未绑定手机号', null, ['isBindMobile' => true]);
       }
        // 后台未开启强制绑定手机号, 直接保存新用户
       if (empty($setting) || !$setting['isForceBindMpweixin']) {
            // 用户不存在: 创建一个新用户
            $this->createUser($ouath['id'], true, $form['partyData']);
            // 保存第三方用户信息
            $this->createUserOauth($this->getUserId(), true, $form['partyData']);
       }
       // 记录登录态
       return $this->setSession();
    }
    
    /**
     * 快捷登录：仓库员工登录
     * @param array $form
     * @return bool
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\Exception
     */
    public function loginMpWxMobileClerk(array $form): bool
    {
        $Clerk = new Clerk;
        $UserModel = new UserModel;
        // 整理登录注册数据
        $loginData = [
            'mobile' => $form['mobile'],
            'password'=>yoshop_hash($form['password'])
        ];
     
        $clerkdata = $Clerk->useGlobalScope(false)->where($loginData)->with(['user','storage'])->where('is_delete',0)->find();
      
        if(!empty($clerkdata)){
            $clerkdata['user'] = $UserModel->useGlobalScope(false)->where(['user_id' => $clerkdata['user_id'],'is_delete'=>0])->find(); 
        }
            //  dump($clerkdata->toArray());die;
        if($clerkdata){
            $this->userInfo  = $clerkdata['user'];
        }
        // dump($clerkdata->toArray());die;
        // 记录登录态
        return $this->setMobileSession();
    }

    /**
     * 保存oauth信息(第三方用户信息)
     * @param int $userId 用户ID
     * @param bool $isParty 是否为第三方用户
     * @param array $partyData 第三方用户数据
     * @return void
     * @throws BaseException
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    private function createUserOauth(int $userId, bool $isParty, array $partyData = []): void
    {
        if ($isParty) {
            $Oauth = new PartyService;
            $Oauth->createUserOauth($userId, $partyData);
        }
    }

    /**
     * 当前登录的用户信息
     */
    public function getUserInfo(): ?UserModel
    {
        return $this->userInfo;
    }

    /**
     * 当前登录的用户ID
     * @return int
     */
    private function getUserId(): int
    {
        return (int)$this->getUserInfo()['user_id'];
    }

    /**
     * 自动登录注册
     * @param array $data
     * @return void
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    private function register(array $data): void
    {
        // 查询用户是否已存在
        // 用户存在: 更新用户登录信息
        $userInfo = UserModel::detail(['mobile' => $data['mobile']]);
        if ($userInfo) {
            $this->updateUser($userInfo, $data['isParty'], $data['partyData']);
            return;
        }
        $refereeId = 0;
        if (isset($data['refferid'])){
            $refereeId = str_crypt($data['refferid'],'DECODE');
        }
        $data['partyData']['refereeId'] = $refereeId;
        // 用户不存在: 创建一个新用户
        $this->createUser($data['mobile'], $data['isParty'], $data['partyData']);
    }

    /**
     * 新增用户
     * @param string $mobile 手机号
     * @param bool $isParty 是否存在第三方用户信息
     * @param array $partyData 用户信息(第三方)
     * @return void
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    private function createUser(string $mobile,$isParty, array $partyData = []): void
    {
        // 用户信息
        $data = [
            'mobile' => $mobile,
            'nickName' => $partyData['nickName']?$partyData['nickName']:hide_mobile($mobile),
            'open_id'=> $mobile,
            'platform' => getPlatform(),
            'last_login_time' => date('Y-m-d H:i:s'),
            'wxapp_id' =>(new UserModel)->getWxappid() ,
            'birthday' => $partyData['birthday'] ?? date('Y-m-d H:i:s')
        ];
        if ($partyData['refereeId']){
            $data['referee_id'] = $partyData['refereeId'];
        }
        // 写入用户信息(第三方)
        if ($isParty === true && !empty($partyData)) {
            $partyUserInfo = PartyService::partyUserInfo($partyData, true);
            $data = array_merge($data, $partyUserInfo);
        }
        $refereeId = $partyData['refereeId'];
        // 新增用户记录
        $model = new UserModel;
        $status = $model->save($data);
        // 记录用户信息
        $this->userInfo = $model;
        // 记录推荐人关系
        if ($status && $refereeId > 0) {
            RefereeModel::createRelation($model['user_id'], $refereeId);
        }
    }

    /**
     * 更新用户登录信息
     * @param UserModel $userInfo
     * @param bool $isParty 是否存在第三方用户信息
     * @param array $partyData 用户信息(第三方)
     * @return void
     */
    private function updateUser(UserModel $userInfo, $isParty, array $partyData = []): void
    {
        // 用户信息
        $data = [
            'last_login_time' => date('Y-m-d H:i:s'),
            'wxapp_id' => (new UserModel)->getWxappid()
        ];
        // 写入用户信息(第三方)
        // 如果不需要每次登录都更新微信用户头像昵称, 下面4行代码可以屏蔽掉
        if ($isParty === true && !empty($partyData)) {
            $partyUserInfo = PartyService::partyUserInfo($partyData, true);
            $data = array_merge($data, $partyUserInfo);
        }
        // 更新用户记录
        $status = $userInfo->save($data) !== false;
        // 记录用户信息
        $this->userInfo = $userInfo;
    }

    /**
     * 记录登录态
     * @return bool
     * @throws BaseException
     */
    private function setSession(): bool
    {
        if(empty($this->userInfo)){
            throw new BaseException(['msg' =>'未找到用户信息']);
        }
            // dump($this->userInfo);die;
        // 登录的token
        $token = $this->getToken($this->getUserId());
        // 记录缓存, 30天
        Cache::set($token, [
            'user' => $this->userInfo,
            'openid' => $this->userInfo->open_id,
            'store_id' => (new UserModel)->getWxappid(),
            'is_login' => true,
        ], 86400 * 30);
        
        // dump(Cache::get($token)->toArray());die;
        return true;
    }
    
    /**
     * 记录登录态
     * @return bool
     * @throws BaseException
     */
    private function setMobileSession(): bool
    {
        if(empty($this->userInfo)){
            throw new BaseException(['msg' =>'未找到用户信息']);
        }
        // 登录的token
        $token = $this->getToken($this->getUserId());
        // 记录缓存, 30天
        Cache::set($token, [
            'user' => $this->userInfo,
            'openid' => $this->userInfo->open_id,
            'store_id' => (new UserModel)->getWxappid(),
            'is_login' => true,
        ], 86400 * 30);
        
        // dump(Cache::get($token)->toArray());die;
        return true;
    }

    /**
     * 数据验证
     * @param array $data
     * @return void
     * @throws BaseException
     */
    private function validate(array $data): void
    {
        // 数据验证
        $setting = SettingModel::detail('store')['values'];
        $validate = new ValidateLogin;
        if (!$validate->check($data)) {
            throw new BaseException(['msg' =>$validate->getError()]);
        }
        
        if($setting['checkphone']==10){
          $emailcode = Cache::get('emailcode');
            if ($emailcode!=$data['smsCode']) {
                throw new BaseException(['msg' =>'邮箱验证码不正确']);
            }  
        }
        
        if($setting['checkphone']==20){
            $smsCode = Cache::get('smscode');
            if ($smsCode!=$data['smsCode']) {
                throw new BaseException(['msg' =>'短信验证码不正确']);
            }
        }

    }
    
    /**
     * 数据验证
     * @param array $data
     * @return void
     * @throws BaseException
     */
    private function validateMessage(array $data): void
    {
        // 数据验证
        $setting = SettingModel::detail('store')['values'];
        $validate = new ValidateLogin;
  
        if($setting['checkphone']==10){
          $emailcode = Cache::get('emailcode');
            if ($emailcode!=$data['smsCode']) {
                throw new BaseException(['msg' =>'邮箱验证码不正确']);
            }  
        }
        
        if($setting['checkphone']==20){
            $smsCode = Cache::get('smscode');
            if ($smsCode!=$data['smsCode']) {
                throw new BaseException(['msg' =>'短信验证码不正确']);
            }
        }

    }

    /**
     * 获取登录的token
     * @param int $userId
     * @return string
     */
    public function getToken(int $userId): string
    {
        static $token = '';
        if (empty($token)) {
            $token = $this->makeToken($userId);
        }
        return $token;
    }

    /**
     * 生成用户认证的token
     * @param int $userId
     * @return string
     */
    private function makeToken(int $userId): string
    {
        $storeId = (new UserModel)->getWxappid();
        // 生成一个不会重复的随机字符串
        $guid = get_guid_v4();
        // 当前时间戳 (精确到毫秒)
        $timeStamp = microtime(true);
        // 自定义一个盐
        $salt = self::TOKEN_SALT;
        return md5("{$storeId}_{$timeStamp}_{$userId}_{$guid}_{$salt}");
    }
}