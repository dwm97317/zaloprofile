<?php
namespace app\api\controller;
use app\common\library\ZaloSdk\Zalo;
use app\api\model\UserAddress;

/**
 * 收货地址管理
 * Class Address
 * @package app\api\controller
 */
class Address extends Controller
{
    /**
     * 收货地址列表
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function lists()
    {
        $user = $this->getUser();
        $model = new UserAddress;
        $list = $model->getList($user['user_id']);
        return $this->renderSuccess([
            'list' => $list,
            'default_id' => $user['address_id'],
        ]);
    }
    
    /**
     * 根据用户id，code，手机号检索地址
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function getAlllists()
    {
        $data = $this->request->post();
        $model = new UserAddress;
        $list = $model->getAllList($data);
        // dump($list);die;
        return $this->renderSuccess([
            'list' => $list,
            // 'default_id' => $user['address_id'],
        ]);
    }
    
    /**
     * 代收点地址列表
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function dslists()
    {
        $param = $this->request->param();
        $user = $this->getUser();
        $model = new UserAddress;
        $list = $model->getDsList($param);
        return $this->renderSuccess([
            'list' => $list,
            'default_id' => $user['address_id'],
        ]);
    }
    
    // 跟进token 返回位置信息
    public function parseLocationByToken(){
        // $param = $this->request->param();
        // $zalo = new Zalo();
        // $result = $zalo->getLocationByToken($param);
        $result = '{"data":{"provider":"gps","latitude":"23.186899271166666","longitude":"113.41915139216667","timestamp":"1753509721434"},"error":0,"message":"Success"}';
        $result = json_decode($result,true);
        // file_put_contents('err.txt',var_export($result,true));
        return $this->renderSuccess(['location'=>$result]);
    }
    
    /**
     * 代收点地址列表
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function zitidianlists()
    {
        $param = $this->request->param();
        // dump($param['keyword']);die;
        $model = new UserAddress;
        $list = $model->getDsList($param);
        return $this->renderSuccess([
            'list' => $list,
        ]);
    }
    
    public function getAddressByPoi(){
        $param = $this->request->param();
        $apiKey = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
        $api = 'https://rsapi.goong.io/Geocode?latlng='.$param['latitude'].','.$param['longitude'].'&api_key='.$apiKey;
        // $result = file_get_contents($api);
        $result = '{"results":[{"address_components":[{"long_name":"Cơm Thanh","short_name":"Cơm Thanh"},{"long_name":"Phố Trung Kính","short_name":"Phố Trung Kính"},{"long_name":"Trung Hoà","short_name":"Trung Hoà"},{"long_name":"Cầu Giấy","short_name":"Cầu Giấy"},{"long_name":"Hà Nội","short_name":"Hà Nội"}],"formatted_address":"Cơm Thanh, Phố Trung Kính, Trung Hoà, Cầu Giấy, Hà Nội","geometry":{"location":{"lat":21.0136837,"lng":105.7982817},"boundary":null},"place_id":"nlV_pKlmsn1l3DItpVG103yrYyJ9UuPseK5SFp-qu597fHc9iHuYwLRyVVqmDaGduN1FFqVntptJIUGGq1KA30g8azedVYDRkLhOWphomHzxgl0Org6ImH-qVSKWYD-PY","reference":"nlV_pKlmsn1l3DItpVG103yrYyJ9UuPseK5SFp-qu597fHc9iHuYwLRyVVqmDaGduN1FFqVntptJIUGGq1KA30g8azedVYDRkLhOWphomHzxgl0Org6ImH-qVSKWYD-PY","plus_code":{"compound_code":"+BL2VAI Trung Hoà, Cầu Giấy, Hà Nội","global_code":"LOC1+BL2VAI"},"compound":{"district":"Cầu Giấy","commune":"Trung Hòa","province":"Hà Nội"},"types":["restaurant"],"name":"Cơm Thanh","address":"Phố Trung Kính, Trung Hoà, Cầu Giấy, Hà Nội"}],"status":"OK"}';
        $resultJson = json_decode($result,true);
        return $this->renderSuccess(['location'=>$resultJson]);
    }
    
    /**
     * 添加收货地址
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function add()
    {
        $model = new UserAddress;
        if ($model->add($this->getUser(), $this->request->post())) {
            return $this->renderSuccess('添加成功');
        }
        return $this->renderError($model->getError() ?: '添加失败');
    }

    /**
     * 收货地址详情
     * @param $address_id
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function detail($address_id)
    {
        $user = $this->getUser();
        $detail = UserAddress::detail($user['user_id'], $address_id);
        
        return $this->renderSuccess(compact('detail'));
    }
    
    public function getdetail($id){
        $model = new UserAddress;
        $detail = $model::getdetail($id);
        return $this->renderSuccess($detail);
    }
    
    /**
     * 收货地址详情
     * @param $address_id
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function getAddress($address_id)
    {
        // $user = $this->getUser();
        $detail = UserAddress::getdetail($address_id);
        
        return $this->renderSuccess(compact('detail'));
    }

    /**
     * 编辑收货地址
     * @param $address_id
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function edit($address_id)
    {
        $user = $this->getUser();
        $model = UserAddress::detail($user['user_id'], $address_id);
        if ($model->edit($this->request->post())) {
            return $this->renderSuccess('更新成功');
        }
        return $this->renderError($model->getError() ?: '更新失败');
    }

    /**
     * 设为默认地址
     * @param $address_id
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function setDefault($address_id)
    {
        $user = $this->getUser();
        $model = UserAddress::detail($user['user_id'], $address_id);
        if ($model->setDefault($user)) {
            return $this->renderSuccess([], '设置成功');
        }
        return $this->renderError($model->getError() ?: '设置失败');
    }

    /**
     * 删除收货地址
     * @param $address_id
     * @return array
     * @throws \app\common\exception\BaseException
     * @throws \think\exception\DbException
     */
    public function delete($address_id)
    {
        $user = $this->getUser();
        $model = UserAddress::detail($user['user_id'], $address_id);
        if ($model->remove($user)) {
            return $this->renderSuccess('删除成功');
        }
        return $this->renderError($model->getError() ?: '删除失败');
    }

}
