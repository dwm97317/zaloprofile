<?php
use think\Route;

// Goong地址API路由 - 明确指定api模块
Route::group('api/goong-address', function () {
    Route::get('autocomplete', 'api/GoongAddress/autocomplete');
    Route::get('place-detail', 'api/GoongAddress/placeDetail');
    Route::get('reverse-geocode', 'api/GoongAddress/reverseGeocode');
    Route::get('geocode', 'api/GoongAddress/geocode');
    Route::get('provinces', 'api/GoongAddress/getProvinces');
    Route::post('validate', 'api/GoongAddress/validateAddress');
});

// 备用路由
Route::rule('api/goong-address/:action', 'api/GoongAddress/:action', 'GET|POST');