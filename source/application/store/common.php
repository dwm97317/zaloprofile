<?php
// 应用公共函数库文件

use app\store\service\Auth;

/**
 * 验证指定url是否有访问权限
 * @param string|array $url
 * @param bool $strict 严格模式
 * @return bool
 */
function checkPrivilege($url, $strict = true)
{
    try {
        return Auth::getInstance()->checkPrivilege($url, $strict);
    } catch (\Exception $e) {
        return false;
    }
}

/**
 * 数据映射
 */
function dataMapRender($data,$field,$map){
     foreach ($data as $k => $v){
        $data[$k][$field] = $map[$v[$field]];
     } 
     return $data;
}