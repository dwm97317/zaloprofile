<?php

// 设限制URL兼容模式
\think\Url::root('index.php?s=');

// Route::rule('html5/:any', function () {
//   return view(\think\Url::root . 'html5/index.html');
// });
return [
    '__pattern__' => [
        'name' => '\w+',
    ],
    '[hello]'     => [
        ':id'   => ['index/hello', ['method' => 'get'], ['id' => '\d+']],
        ':name' => ['index/hello', ['method' => 'post']],
    ],
    // API路由
    'api/goong-address/autocomplete' => 'api/GoongAddress/autocomplete',
    'api/goong-address/place-detail' => 'api/GoongAddress/placeDetail',
    'api/goong-address/reverse-geocode' => 'api/GoongAddress/reverseGeocode',
    'api/goong-address/geocode' => 'api/GoongAddress/geocode',
    'api/goong-address/provinces' => 'api/GoongAddress/getProvinces',
    'api/goong-address/validate' => 'api/GoongAddress/validateAddress',
];

