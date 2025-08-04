<?php

namespace app\api\controller;

use app\api\model\User as UserModel;
use app\api\model\Wxapp as WxappModel;
use app\common\exception\BaseException;
use app\common\model\UploadFile;

/**
 * API控制器基类
 * Class BaseController
 * @package app\store\controller
 */
class Controller extends \think\Controller
{
    const JSON_SUCCESS_STATUS = 1;
    const JSON_ERROR_STATUS = 0;

    /* @ver $wxapp_id 小程序id */
    protected $wxapp_id;

    /**
     * API基类初始化
     * @throws BaseException
     * @throws \think\exception\DbException
     */
    public function _initialize()
    {
        // 当前小程序id
        
        if(is_numeric($this->request->param('wxapp_id'))){
            $this->wxapp_id = $this->getWxappId();
        }else{
            $this->wxapp_id = $this->getExWxappId();
        }
        // 验证当前小程序状态
        $this->checkWxapp();
        
    }

    /**
     * 获取当前小程序ID
     * @return mixed
     * @throws BaseException
     */
    private function getWxappId()
    {
        if (!$wxapp_id = $this->request->param('wxapp_id')) {
            throw new BaseException(['msg' => '缺少必要的参数：wxapp_id']);
        }
        return $wxapp_id;
    }
    
    
    private function getExWxappId()
    {
        $wxapp_id_en = str_replace(' ','+',$this->request->param('wxapp_id'));
        if (!$wxapp_id = encrypt($wxapp_id_en,'D')){
             throw new BaseException(['msg' => '无效wxapp_id']);   
        }
        return $wxapp_id;
    }

    /**
     * 验证当前小程序状态
     * @throws BaseException
     * @throws \think\exception\DbException
     */
    private function checkWxapp()
    {
        $wxapp = WxappModel::detail($this->wxapp_id);
        if (empty($wxapp)) {
            throw new BaseException(['msg' => '当前小程序信息不存在']);
        }
        if ($wxapp['is_recycle'] || $wxapp['is_delete']) {
            throw new BaseException(['msg' => '当前小程序已删除']);
        }
    }

    public function withImageById($data,$field,$name=null){
       $image = $name?$name:'image';
   
       foreach ($data as $k => $v){
              if ($v[$field]){
                  $res = UploadFile::getFileName($v[$field]);
                  if ($res)
                      $data[$k][$image] = $res;
              }  
        }
        return $data;
    }
    
    /**
     * 检查是否为开发环境
     * @return bool
     */
    private function isDevelopmentEnv()
    {
        // 检查是否为zalo mini app studio开发环境
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        // 检查开发环境的特征
        return (
            strpos($userAgent, 'ZaloStudio') !== false ||
            strpos($referer, 'localhost') !== false ||
            strpos($referer, '127.0.0.1') !== false ||
            strpos($referer, 'mini-app-studio') !== false ||
            $this->request->param('debug_mode') == '1' ||
            config('app_debug') === true
        );
    }
    
    /**
     * 获取当前用户信息
     * @param bool $is_force
     * @return UserModel|bool|null
     * @throws BaseException
     * @throws \think\exception\DbException
     */
    protected function getUser($is_force = true)
    {
        if (!$token = $this->request->param('token')) {
            $is_force && $this->throwError('缺少必要的参数：token', -1);
            return false;
        }

        // 记录token验证日志
        $this->logTokenValidation($token, 'start');

        $user = UserModel::getUser($token);

        if (!$user) {
            // 记录token验证失败
            $this->logTokenValidation($token, 'failed');

            // 在开发环境中提供更详细的错误信息，但不使用测试用户替代
            if ($this->isDevelopmentEnv()) {
                $this->throwError('开发环境：token验证失败，请检查zalo认证状态。Token: ' . substr($token, 0, 10) . '...', -2);
            } else {
                $is_force && $this->throwError('没有找到用户信息', -1);
            }
            return false;
        }

        // 记录token验证成功
        $this->logTokenValidation($token, 'success', $user['user_id'] ?? 'unknown');

        return $user;
    }

    /**
     * 记录token验证日志
     * @param string $token
     * @param string $status
     * @param string $userId
     */
    private function logTokenValidation($token, $status, $userId = '')
    {
        $logData = [
            'time' => date('Y-m-d H:i:s'),
            'token' => substr($token, 0, 10) . '...',
            'status' => $status,
            'user_id' => $userId,
            'ip' => $this->request->ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'referer' => $_SERVER['HTTP_REFERER'] ?? ''
        ];

        $logLine = json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n";
        file_put_contents('token_validation.log', $logLine, FILE_APPEND | LOCK_EX);
    }

    /**
     * 输出错误信息
     * @param int $code
     * @param $msg
     * @throws BaseException
     */
    protected function throwError($msg, $code = 0)
    {
        throw new BaseException(['code' => $code, 'msg' => $msg]);
    }

    /**
     * 返回封装后的 API 数据到客户端
     * @param int $code
     * @param string $msg
     * @param array $data
     * @return array
     */
    protected function renderJson($code = self::JSON_SUCCESS_STATUS, $msg = '', $data = [])
    {
        return compact('code', 'msg', 'data');
    }

    /**
     * 返回操作成功json
     * @param array $data
     * @param string|array $msg
     * @return array
     */
    protected function renderSuccess($data = [], $msg = 'success')
    {
        return $this->renderJson(self::JSON_SUCCESS_STATUS, $msg, $data);
    }
    
    /**
     * 返回操作成功json
     * @param array $data
     * @param string|array $msg
     * @return array
     */
    protected function renderBannerSuccess($data = [], $length = 0,$msg = 'success')
    {
        return $this->renderBannerJson(self::JSON_SUCCESS_STATUS,$length, $msg,$data);
    }
    
    /**
     * 返回封装后的 API 数据到客户端
     * @param int $code
     * @param string $msg
     * @param array $data
     * @return array
     */
    protected function renderBannerJson($code = self::JSON_SUCCESS_STATUS,$length, $msg = '', $data = [])
    {
        return compact('code', 'length','msg', 'data');
    }
    
    
    /**
     * 返回操作成功json
     * @param array $data
     * @param string|array $msg
     * @return array
     */
    protected function renderSuccessPlus($data = [], $msg = 'success')
    {
        return $this->renderJson(2, $msg, $data);
    }

    /**
     * 返回操作失败json
     * @param string $msg
     * @param array $data
     * @return array
     */
    protected function renderError($msg = 'error', $data = [])
    {
        return $this->renderJson(self::JSON_ERROR_STATUS, $msg, $data);
    }

    /**
     * 获取post数据 (数组)
     * @param $key
     * @return mixed
     */
    protected function postData($key = null)
    {
        return $this->request->post(is_null($key) ? '' : $key . '/a');
    }

}
