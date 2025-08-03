<?php
declare (strict_types=1);

namespace app\web\controller;

use app\api\model\Logistics;
use app\web\model\Setting as SettingModel;
use app\api\model\Package as PackageModel;
use app\api\service\trackApi\TrackApi;
use app\common\library\Ditch\config;
use app\common\model\Ditch as DitchModel;
use app\store\model\store\Shop as ShopModel;
use app\common\library\Ditch\BaiShunDa\bsdexp;
use app\common\library\Ditch\Jlfba\jlfba;
use app\common\library\Ditch\kingtrans;
use app\common\library\Ditch\Hualei;
use app\common\library\Ditch\Xzhcms5;
use app\common\library\Ditch\Aolian;
use app\common\library\Ditch\Yidida;
use app\common\library\Ditch\feia17;
use app\api\model\Inpack;
use app\api\model\Express;

/**
 * 用户认证模块
 * Class Passport
 * @package app\web\controller
 */
class Track extends Controller
{
    //获取更新日志
    public function search(){
        
        $param = $this->request->param();
        if (!$this->request->isAjax()) {
            $setting = SettingModel::getItem('systems',$this->wxapp_id);
            $this->view->engine->layout(false);
            return $this->fetch('track/search',compact('setting'));
        }
        // 执行查询
        $Logistics = new Logistics;
        $express = $param['express_num'];
        $logic = $logic4 = $logictik =[];
        $result=[];
        $logib = [];
        $logicdd = [];
        $logicddd = [];
        $logia = [];
        $logicv = [];
        $logguoji=[];
        $logzd = [];
        $logici = [];
        $logicti = [];
        $Logistics = new Logistics();
        $PackageModel = new PackageModel();
        $DitchModel= new DitchModel();
        $Inpack = new Inpack();
        $Express = new Express();
        $setting = SettingModel::detail("notice")['values'];
        //查询出来这个单号是包裹单号、国际单号、转单号|
        $packData = $PackageModel->where(['express_num'=>$express,'is_delete' => 0])->find();
         
        $inpackData = $Inpack->where('t_order_sn|order_sn|t2_order_sn',$express)->where(['is_delete' => 0])->find(); //国际单号
        // $inpackData2 = $Inpack->where(['t2_order_sn'=>$express,'is_delete' => 0])->find();  //转单号
        // $inpackData4 = $Inpack->where(['order_sn'=>$express,'is_delete' => 0])->find();
        //如果是包裹单号，可以反查下处于哪个集运单；
        //   dump($inpackData);die;
        
        if(!empty($packData)){
            //查出的系统内部物流信息
            $logzd = $Logistics->getList($express);
                // dump($logzd);die;
            if(count($logic)>0){
                // dump($inpackData);die;
                $logia = $Logistics->getorderno($logzd[0]['order_sn']);
            }
            $express_code = $Express->getValueById($packData['express_id'],'express_code');
            
            if($setting['is_track_yubao']['is_enable']==1){//如果预报推送物流，则查询出来
                $logib = $Logistics->getZdList($packData['express_num'],$express_code,$packData['wxapp_id']);
            }
            $logicv = array_merge($logia,$logib,$logzd);
            // dump($logicv);die;
            if(!empty($packData['inpack_id'])){
                $inpackData = $Inpack->where('id',$packData['inpack_id'])->where(['is_delete' => 0])->find(); //国际单号
            }
        }
        //   dump($inpackData);die;

        if(!empty($inpackData) ){
          
            if($inpackData['transfer']==0){
                $ditchdatas = $DitchModel->where('ditch_id','=',$inpackData['t_number'])->find();
                
                 //锦联
                if($ditchdatas['ditch_no']==10001){
                    $jlfba =  new jlfba(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token']]);
                    $result = $jlfba->query($express);
                }
                //百顺达
                if($ditchdatas['ditch_no']==10002){
                    $bsdexp =  new bsdexp(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token']]);
                    //   dump($bsdexp);die;
                    $result = $bsdexp->query($express);
                }
                //K5
                if($ditchdatas['ditch_no']==10003){
                    $kingtrans =  new kingtrans(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $kingtrans->query($express);
                }
                //华磊api
                if($ditchdatas['ditch_no']==10004){
                    $Hualei =  new Hualei(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $Hualei->query($express);
                    //  dump($result);die;
                }
                
                //星泰api
                if($ditchdatas['ditch_no']==10005){
                    $Xzhcms5 =  new Xzhcms5(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $Xzhcms5->query($express);
                }
                
                //澳联
                if($ditchdatas['ditch_no']==10006){
                    $Aolian =  new Aolian(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $Aolian->query($express);
                    //   dump($result);die;
                }
                
                //易抵达
                if($ditchdatas['ditch_no']==10007){
                    $Yidida =  new Yidida(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $Yidida->query($express);
                }
                //17feia
                if($ditchdatas['ditch_no']==10008){
                    $feia17 =  new feia17(['key'=>$ditchdatas['app_key'],'token'=>$ditchdatas['app_token'],'apiurl'=>$ditchdatas['api_url']]);
                    $result = $feia17->query($express);
                }
                $logic = $result;
            }else{
                if(!empty($inpackData['t_order_sn'])){
                     $logicddd = $Logistics->getZdList($inpackData['t_order_sn'],$inpackData['t_number'],$inpackData['wxapp_id']);
                }
                if(!empty($inpackData['t2_order_sn'])){
                     $logicdd = $Logistics->getZdList($inpackData['t2_order_sn'],$inpackData['t2_number'],$inpackData['wxapp_id']);
                }
                $logic = array_merge($logicddd,$logicdd);
            }
           
            $packinck = $PackageModel->where(['inpack_id'=>$inpackData['id'],'is_delete' => 0])->find();
            if(!empty($packinck)){
                $logictik = $Logistics->getorderno($inpackData['order_sn']);
                // dump($logictik);die;
            }else{
                if(!empty($packinck['express_num'])){
                    $logictik = $Logistics->getList($packinck['express_num']);
                }
                
            }
            $logici = array_merge($logictik);
             
        }
        
        $logic = array_merge($logic,$logici,$logicv);
        return $this->renderSuccess(['data' => $logic], '查询成功');
    }
}