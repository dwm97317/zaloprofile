<?php
namespace app\common\library\ZaloSdk;
use app\common\library\http\Curl;
use app\common\model\User;
use think\Db;

class ZaloOfficialApi {
    
    public $OAID = '140130397183308120';  // OAID
    public $AccessToken = "GnDf0H4vSbn256m65ZTpMKmPPG4RBI0w7avW93G0EJimO7uc8o1X8srm0nyz81HV6LHAS0Wf0dOAGKX_MZCGM1HcKaO-DoXT71H3TJviBt0HFNjSIX8vPHrDJZaxOWmS2bL94Z0yKL8HIaXJ96aZONuqKbn_0mbWA4z8O7rW3sbRI7iqJ1XYBdrf0Yjw4MqK8JWPE1Pg6ZnC6suPQJ8i1ZX0QpmH40PeEqbxRpiw6r4rGrvp7IylNJrsTcSVFYzwCMrxT3L607C0QHnB5mH-KWLjFLTG8tT3S6zfO24j64mnH48ICnSfHZDCPb8cPGTUV3jYPsziA38u7Mq-R50W6aOLPYrTK7m4Rmbc0Kft60LBML0IOpKE86uTVmP4T2WALpr_2M9J7Hn0BtquObOI66ie4HDgJ6CQBcqK9tHV";
    
    private $messageEnum = [
       'order' => [
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'transaction_order',
                    'language' => 'VI',
                    'elements' => [
                        [
                           "type"=>"header",
                           "content"=> "Thông báo dự báo gói hàng thành công",
                           "align"=> "left"
                        ],
                        [
                           "type"=>"text",
                           "align"=> "left",
                           "content"=> "Gói hàng của bạn đã được dự báo thành công"
                        ],
                        [
                           "type" => 'table',
                           "content" => [
                              [
                                 "key"=> "Tên khách hàng", // bắt đầu là "Mã", dùng định danh người nhận
                                 "value"=> "Giá trị tự do"
                              ], 
                              [
                                'value' => '{$expressNumber}',
                                'key'   => 'Số bưu kiện',
                              ],
                              [
                                'value' => '{$volumn}',
                                'key'   => 'Thông tin sản phẩm',
                              ] 
                            ]
                        ]
                     ],
                     'buttons' => [
                        [
                            "type"=> "oa.open.miniapp",
                            "title"=> "Xem chi tiết",
                            "payload"=> [
                                'app_id' => '3310500707791294854',
                                'path' => 'query',
                                'params' => [
                                    'from' => 'oa'
                                ]
                            ]
                        ]
                     ]
                ]
            ]   
        ], // 入库通知
        'inStorage'=>[
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'transaction_order',
                    'language' => 'VI',
                    'elements' => [
                        [
                           "type"=>"header",
                           "content"=> "Thông báo nhập gói",
                           "align"=> "left"
                        ],
                        [
                           "type"=>"text",
                           "align"=> "left",
                           "content"=> "Gói hàng đã đến nhà kho được chỉ định",
                        ],
                        [
                           "type" => 'table',
                           "content" => [
                              [
                                 "key"=> "Tên khách hàng", // bắt đầu là "Mã", dùng định danh người nhận
                                 "value"=> "Giá trị tự do"
                              ],
                              [
                                'value' => '{$expressNumber}',
                                'key'   => 'Số bưu kiện',
                              ],
                            ]
                        ]
                     ],
                     'buttons' => [
                        [
                            "type"=> "oa.open.miniapp",
                            "title"=> "Xem kho hàng",
                            "payload"=> [
                                'app_id' => '3310500707791294854',
                                'path' => 'storage',
                                'params' => [
                                    'from' => 'oa'
                                ]
                            ]
                        ]
                     ]
                ]
            ]   
        ],
        'orderCreate' => [
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'transaction_order',
                    'language' => 'VI',
                    'elements' => [
                        [
                           "type"=>"header",
                           "content"=> "Thông báo tạo đơn đặt hàng tập trung",
                           "align"=> "left"
                        ],
                        [
                           "type"=>"text",
                           "align"=> "left",
                           "content"=> "Thông báo tạo đơn đặt hàng tập trung",
                        ],
                        [
                           "type" => 'table',
                           "content" => [
                              [
                                 "key"=> "Tên khách hàng", // bắt đầu là "Mã", dùng định danh người nhận
                                 "value"=> "Giá trị tự do"
                              ],
                              [
                                'value' => '{$orderSn}',
                                'key'   => 'Số đơn đặt hàng',
                              ],
                              [
                                'value' => '{$weight}',
                                'key'   => 'Cân nặng',
                              ],
                              [
                                'value' => '{$price}',
                                'key'   => 'Giá cả',
                              ],
                            ]
                        ]
                     ],
                     'buttons' => [
                        [
                            "type"=> "oa.open.miniapp",
                            "title"=> "Xem đơn hàng",
                            "payload"=> [
                                'app_id' => '3310500707791294854',
                                'path' => 'order',
                                'params' => [
                                    'from' => 'oa'
                                ]
                            ]
                        ]
                     ]
                ]
            ]   
        ],
        'orderSend' => [
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'transaction_order',
                    'language' => 'VI',
                    'elements' => [
                        [
                           "type"=>"header",
                           "content"=> "Thông báo vận chuyển hàng loạt",
                           "align"=> "left"
                        ],
                        [
                           "type"=>"text",
                           "align"=> "left",
                           "content"=> "Đơn đặt hàng của bạn đã được vận chuyển",
                        ],
                        [
                           "type" => 'table',
                           "content" => [
                              [
                                 "key"=> "Tên khách hàng", // bắt đầu là "Mã", dùng định danh người nhận
                                 "value"=> "Giá trị tự do"
                              ],
                              [
                                'value' => '{$orderSn}',
                                'key'   => 'Số đơn đặt hàng',
                              ],
                              [
                                'value' => '{$expressNumber}',
                                'key'   => 'Số đơn hàng'
                              ]
                            ]
                        ]
                     ],
                     'buttons' => [
                        [
                            "type"=> "oa.open.miniapp",
                            "title"=> "Theo dõi đơn hàng",
                            "payload"=> [
                                'app_id' => '3310500707791294854',
                                'path' => 'query',
                                'params' => [
                                    'from' => 'oa'
                                ]
                            ]
                        ]
                     ]
                ]
            ] 
        ]
    ];
    
    public static function getFollowList(){
        $api = 'https://openapi.zalo.me/v3.0/oa/user/getlist';
        $header = [
           'access_token:'.(new Static)->AccessToken,
           'Content-Type:application/json',    
        ];
        $body = [
          'offset'=>0,
          'count' =>50,
        ];
        $curl = new Curl();
        $response = $curl->get($api,['data'=>json_encode($body)],$header);
        $responseJson = json_decode($response,true);
        return $responseJson['data'];
    }
    
    // 获取OA UserId
    public static function getOAUserId($minappUserId){
        $oaAuth = Db::name('zaloa_user')->where('mini_app_user_id',$minappUserId)->find();
        if ($oaAuth){
            return $oaAuth['oa_user_id'];
        }
        return '';
    }
    
    // 发送OA关注信息
    public static function sendfollowerMessage($userId){
        $message = [
            'attachment' => [
                'type' => 'template',
                'payload' => [
                    'template_type' => 'transaction_event',
                    'language' => 'VI',
                    'elements' => [
                        [
                           "type"=>"header",
                           "content"=> "Chào mừng bạn đến với chương trình nhỏ của chúng tôi",
                           "align"=> "left"
                        ],
                        [
                           "type"=>"text",
                           "align"=> "left",
                           "content"=> "Chào mừng bạn đến với chương trình nhỏ của chúng tôi",
                        ],
                        [
                           "type" => 'table',
                           "content" => [
                              [
                                 "key"=> "Tên khách hàng", // bắt đầu là "Mã", dùng định danh người nhận
                                 "value"=> "Giá trị tự do"
                              ],
                            ]
                        ]
                     ],
                    'buttons' => [
                        [
                            "type"=> "oa.open.miniapp",  // 小程序跳转类型
                            "title"=> "Mở applet",
                            "payload"=> [
                                'app_id' => '3310500707791294854',
                                'path' => 'mine',
                                'params' => [
                                    'from' => 'oa',
                                    'oa_user_id' => $userId
                                ]
                            ]
                        ]
                     ]
                ],
            ]
        ];
        $body = [
           'recipient' => [
              'user_id' => $userId,
            ],
            'message' => $message,    
        ];
        $header = [
           'access_token:'.(new Static)->AccessToken,
           'Content-Type:application/json',    
        ];
        $api = 'https://openapi.zalo.me/v3.0/oa/message/transaction';
        $curl = new Curl();
        $response = $curl->post($api,json_encode($body),$header);
        file_put_contents('debug.txt','关注信息接口回复:'.$response,FILE_APPEND);
    }    
    
    public static function sendMessage($userId,$type,$param=[]){
        $api = 'https://openapi.zalo.me/v3.0/oa/message/transaction';
        $message = (new Static)->messageEnum[$type];
        // $userId = '5423698471434405679';
        $userInfo = (new User())->find($userId);
        $userId = self::getOAUserId($userInfo['open_id']);
        if (!$userId) true;
        $message = (new Static)->replaceVariables($message,$param);
        $body = [
           'recipient' => [
              'user_id' => $userId,
            ],
            'message' => $message,    
        ];
        $header = [
           'access_token:'.(new Static)->AccessToken,
           'Content-Type:application/json',    
        ];
        $curl = new Curl();
        $response = $curl->post($api,json_encode($body),$header);
        file_put_contents('debug.txt','交易信息接口响应:'.$response,FILE_APPEND);
        // dump($response); 
        // die;
    }
    
    // 替换消息模板
    function replaceVariables(array $template, array $variables): array {
        // 递归处理数组中的每个元素
        $processor = function ($data) use (&$processor, $variables) {
            // 当前元素是数组：递归处理其子元素
            if (is_array($data)) {
                return array_map($processor, $data);
            }
            // 当前元素是字符串：执行变量替换
            if (is_string($data)) {
                return preg_replace_callback(
                    '/\{\$(\w+)\}/', 
                    function ($matches) use ($variables) {
                        // 检查变量是否存在，存在则替换，不存在保留原始占位符
                        return $variables[$matches[1]] ?? $matches[0];
                    },
                    $data
                );
            }
            // 非数组/字符串保持原样
            return $data;
        };
        return $processor($template);
    }
}