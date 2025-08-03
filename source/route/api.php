<?php
use think\Route;

// Goong地址API路由
Route::group('goong-address', function () {
    Route::get('autocomplete', 'GoongAddress/autocomplete');
    Route::get('place-detail', 'GoongAddress/placeDetail'); 
    Route::get('reverse-geocode', 'GoongAddress/reverseGeocode');
    Route::get('geocode', 'GoongAddress/geocode');
    Route::get('provinces', 'GoongAddress/getProvinces');
    Route::post('validate', 'GoongAddress/validateAddress');
});

// 确保Controller类存在
Route::rule('goong-address/:action', 'api/GoongAddress/:action', 'GET|POST'); 