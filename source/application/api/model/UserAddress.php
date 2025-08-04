<?php

namespace app\api\model;

use app\common\model\UserAddress as UserAddressModel;

/**
 * 用户收货地址模型
 * Class UserAddress
 * @package app\common\model
 */
class UserAddress extends UserAddressModel
{
    /**
     * 隐藏字段
     * @var array
     */
    protected $hidden = [
        'wxapp_id',
        'create_time',
        'update_time',
    ];

    /**
     * @param $user_id
     * @return false|static[]
     * @throws \think\exception\DbException
     */
    public function getList($user_id)
    {
        return self::all(compact('user_id'));
    }
    
    /**
     * 获取列表记录
     * @return \think\Paginator
     * @throws \think\exception\DbException
     */
    public function getAllList($query=[])
    {
       
        return $this->setWhere($query)
            // ->where('address_type',)//获取代收点的地址
            ->paginate(10,false,[
                'query'=>\request()->request()
            ]);
    }
    
    /**
     * 获取列表记录
     * @return \think\Paginator
     * @throws \think\exception\DbException
     */
    public function getDsList($query)
    {
        return $this->setWhere($query)
            ->where('address_type',2)//获取代收点的地址
            ->select();
    }
    
     // 设置 条件
    public function setWhere($query){
        isset($query['keyword']) && $this->where('phone|name|takecode','like','%'.$query['keyword'].'%');
        return $this;
    }

    /**
     * 新增收货地址
     * @param User $user
     * @param $data
     * @return mixed
     */
    public function add($user, $data)
    {
        return $this->transaction(function () use ($user, $data) {
            // 整理地区信息
            $region = explode(',', $data['region']);
            // 添加收货地址
            $this->allowField(true)->save([
                'name' => $data['name'],
                'phone' => isset($data['phone'])?$data['phone']:'',
                'identitycard'=>isset($data['identitycard'])?$data['identitycard']:'',
                'tel_code'=>isset($data['telcode'])?$data['telcode']:'86',
                'clearancecode'=>isset($data['clearancecode'])?$data['clearancecode']:'',
                'country' => isset($region[0])?$region[0]:'',
                'country_id' => isset($data['country_id'])?$data['country_id']:1,
                'province' => isset($region[1])?$region[1]:'',
                'city' => isset($region[2])?$region[2]:'',
                'region' => isset($region[3])?$region[3]:'',
                'email' => isset($data['email'])?$data['email']:'',
                'door' => isset($data['door'])?$data['door']:'',
                'code' => isset($data['code'])?$data['code']:'',
                'detail' => isset($data['detail'])?$data['detail']:'',
                'user_id' => $user['user_id'],
                'street' => isset($data['userstree'])?$data['userstree']:'',
                'address_type' => 0, // 0 集运地址
                'addressty' => 0, // 0 收件人
                'is_moren' => 0, // 默认不是默认地址
                'wxapp_id' => self::$wxapp_id
            ]);
            // 设为默认收货地址
            !$user['address_id'] && $user->save(['address_id' => $this['address_id']]);
            return true;
        });
    }

    /**
     * 编辑收货地址
     * @param $data
     * @return false|int
     */
    public function edit($data)
    {
        // 整理地区信息
        $region = explode(',', $data['region']);
        // 更新收货地址
        return $this->allowField(true)->save([
                'name' => $data['name'],
                'phone' => isset($data['phone'])?$data['phone']:'',
                'tel_code'=>isset($data['telcode'])?$data['telcode']:'86',
                'identitycard'=>isset($data['identitycard'])?$data['identitycard']:'',
                'country' => isset($region[0])?$region[0]:'',
                'country_id' => isset($data['country_id'])?$data['country_id']:1,
                'clearancecode'=>isset($data['clearancecode'])?$data['clearancecode']:'',
                'province' => isset($region[1])?$region[1]:'',
                'city' => isset($region[2])?$region[2]:'',
                'region' => isset($region[3])?$region[3]:'',
                'email' => isset($data['email'])?$data['email']:'',
                'street' => isset($data['userstree'])?$data['userstree']:'',
                'door' => isset($data['door'])?$data['door']:'',
                'code' => isset($data['code'])?$data['code']:'',
                'detail' => isset($data['detail'])?$data['detail']:'',
            ]) !== false;
    }


    /**
     * 设为默认收货地址
     * @param User $user
     * @return int
     */
    public function setDefault($user)
    {
        // 设为默认地址
        return $user->save(['address_id' => $this['address_id']]);
    }

    /**
     * 删除收货地址
     * @param User $user
     * @return int
     */
    public function remove($user)
    {
        // 查询当前是否为默认地址
        $user['address_id'] == $this['address_id'] && $user->save(['address_id' => 0]);
        return $this->delete();
    }
    
    /**
     * 收货地址详情
     * @param $user_id
     * @param $address_id
     * @return null|static
     * @throws \think\exception\DbException
     */
    public static function getdetail($address_id)
    {
        return self::get(compact('address_id'));
    }

    /**
     * 收货地址详情
     * @param $user_id
     * @param $address_id
     * @return null|static
     * @throws \think\exception\DbException
     */
    public static function detail($user_id, $address_id)
    {
        return self::get(compact('user_id', 'address_id'));
    }

}
