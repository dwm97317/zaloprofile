<?php
namespace app\web\model;
use app\common\model\Currency as CurrencyModel;
use think\Db;

class Currency extends CurrencyModel
{
    public function getList($name){
            return $this
            ->where(function($query) use ($name) {
               $query->where('title','like','%'.$name.'%')
               ->whereor('code','like','%'.$name.'%');
            })
            ->paginate(300,false, [
                'query' => \request()->request()
            ]);
    }
    
    public function getListAll(){
           return $this
            ->where('status',0)
            ->order(["sort"=>"desc"])
            ->paginate(300,false, [
                'query' => \request()->request()
            ]);
    }
    
    public function getListAllCountry(){
        return $this->select();
    }
    
     public function details($id){
        return $this->find($id);
    }
}